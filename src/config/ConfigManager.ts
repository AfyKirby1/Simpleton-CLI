import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { CacheManager } from '../tools/CacheManager';

export interface ConfigOptions {
  endpoint?: string;
  model?: string;
  autoApprove?: boolean;
  suggestOnly?: boolean;
  fullAuto?: boolean;
}

export interface ProjectContext {
  projectPath: string;
  files: string[];
  gitStatus: string;
  lastUpdated: Date;
}

export interface OllamaStatus {
  isRunning: boolean;
  availableModels: string[];
  installedModels: string[];
  currentModel: string | null;
}

export class ConfigManager {
  private config: any;
  private projectContexts: Map<string, ProjectContext>;
  private ollamaStatus: OllamaStatus | null = null;
  private cache: CacheManager;

  constructor() {
    // Use a simple in-memory config for now
    this.config = {
      data: {
        endpoint: 'http://localhost:11434/v1',
        model: 'deepseek-coder:1.3b-q4_K_M',
        autoApprove: false,
        suggestOnly: false,
        fullAuto: false
      },
      get: (key: string) => this.config.data[key],
      set: (key: string, value: any) => { this.config.data[key] = value; }
    };

    this.projectContexts = new Map();
    this.cache = new CacheManager({
      maxSize: 50 * 1024 * 1024, // 50MB for config cache
      defaultTTL: 10 * 60 * 1000, // 10 minutes default
      enablePersistent: true
    });
    
    this.loadProjectContexts();
  }

  get(key: string): any {
    return this.config.get(key);
  }

  set(key: string, value: any): void {
    this.config.set(key, value);
  }

  getEndpoint(): string {
    return this.get('endpoint');
  }

  getModel(): string {
    return this.get('model');
  }

  getAutoApprove(): boolean {
    return this.get('autoApprove');
  }

  getSuggestOnly(): boolean {
    return this.get('suggestOnly');
  }

  getFullAuto(): boolean {
    return this.get('fullAuto');
  }

  private getContextPath(): string {
    return path.join(os.homedir(), '.ai-cli');
  }

  private loadProjectContexts(): void {
    const contextPath = this.getContextPath();
    
    if (!fs.existsSync(contextPath)) {
      fs.mkdirSync(contextPath, { recursive: true });
      return;
    }

    const files = fs.readdirSync(contextPath);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const contextData = fs.readJsonSync(path.join(contextPath, file));
          const projectName = file.replace('.json', '');
          this.projectContexts.set(projectName, contextData);
        } catch (error) {
          console.warn(`Failed to load project context for ${file}:`, error);
        }
      }
    }
  }

  getProjectContext(projectPath: string): ProjectContext | undefined {
    const projectName = path.basename(projectPath);
    return this.projectContexts.get(projectName);
  }

  async updateProjectContext(projectPath: string): Promise<void> {
    const projectName = path.basename(projectPath);
    const contextPath = this.getContextPath();
    
    // Get git files if available
    let files: string[] = [];
    let gitStatus = 'unknown';
    
    try {
      const { execa } = await import('execa');
      const { stdout: gitFiles } = await execa('git', ['ls-files'], { cwd: projectPath });
      files = gitFiles.split('\n').filter(Boolean);
      
      const { stdout: status } = await execa('git', ['status', '--porcelain'], { cwd: projectPath });
      gitStatus = status || 'clean';
    } catch (error) {
      // Not a git repo or git not available
      files = await this.scanProjectFiles(projectPath);
      gitStatus = 'not-git';
    }

    const context: ProjectContext = {
      projectPath,
      files,
      gitStatus,
      lastUpdated: new Date()
    };

    this.projectContexts.set(projectName, context);
    
    const contextFile = path.join(contextPath, `${projectName}.json`);
    await fs.writeJson(contextFile, context, { spaces: 2 });
  }

  private async scanProjectFiles(projectPath: string): Promise<string[]> {
    const { glob } = await import('glob');
    const patterns = [
      '**/*.js',
      '**/*.ts',
      '**/*.jsx',
      '**/*.tsx',
      '**/*.json',
      '**/*.md',
      '**/*.txt',
      '**/*.yml',
      '**/*.yaml'
    ];

    const files: string[] = [];
    
    for (const pattern of patterns) {
      try {
        const matches = await glob(pattern, {
          cwd: projectPath,
          ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**']
        });
        files.push(...matches);
      } catch (error) {
        // Pattern failed, continue
      }
    }

    return files;
  }

  listProjects(): string[] {
    return Array.from(this.projectContexts.keys());
  }

  // New auto-detection methods
  async checkOllamaStatus(): Promise<OllamaStatus> {
    // Check cache first
    const cached = this.cache.getCachedOllamaStatus();
    if (cached) {
      this.ollamaStatus = cached;
      return cached;
    }

    const status: OllamaStatus = {
      isRunning: false,
      availableModels: [],
      installedModels: [],
      currentModel: null
    };

    try {
      const { execa } = await import('execa');
      
      // Check if Ollama is running
      try {
        const { stdout } = await execa('ollama', ['list'], { timeout: 5000 });
        status.isRunning = true;
        
        // Parse installed models
        const lines = stdout.split('\n').slice(1); // Skip header
        status.installedModels = lines
          .filter(line => line.trim())
          .map(line => line.split(/\s+/)[0])
          .filter(Boolean);
      } catch (error) {
        status.isRunning = false;
      }

      // Get available models (this might not work if Ollama is not running)
      if (status.isRunning) {
        try {
          const { stdout } = await execa('ollama', ['list', '--available'], { timeout: 10000 });
          const lines = stdout.split('\n').slice(1);
          status.availableModels = lines
            .filter(line => line.trim())
            .map(line => line.split(/\s+/)[0])
            .filter(Boolean);
        } catch (error) {
          // Available models list might not be supported in all Ollama versions
        }
      }

      // Check if current model is installed
      const currentModel = this.getModel();
      if (currentModel && status.installedModels.includes(currentModel)) {
        status.currentModel = currentModel;
      }

    } catch (error) {
      // Ollama not installed or other error
    }

    // Cache the result
    this.cache.cacheOllamaStatus(status);
    this.ollamaStatus = status;
    return status;
  }

  async autoDetectCurrentProject(): Promise<ProjectContext | null> {
    const currentDir = process.cwd();
    
    // Check if current directory looks like a project
    const hasPackageJson = await fs.pathExists(path.join(currentDir, 'package.json'));
    const hasGit = await fs.pathExists(path.join(currentDir, '.git'));
    const hasSrc = await fs.pathExists(path.join(currentDir, 'src'));
    
    if (hasPackageJson || hasGit || hasSrc) {
      // This looks like a project, initialize it
      await this.updateProjectContext(currentDir);
      return this.getProjectContext(currentDir) || null;
    }
    
    return null;
  }

  async getRecommendedModel(): Promise<string | null> {
    const status = await this.checkOllamaStatus();
    
    if (!status.isRunning) {
      return null;
    }

    // Priority order for recommended models (including variations)
    const recommendedModels = [
      'mistral:7b',
      'deepseek-coder:1.3b-q4_K_M',
      'deepseek-coder:6.7b-q4_K_M',
      'deepseek-coder:latest',
      'deepseek-coder',
      'deepseek-r1:32b',
      'deepseek-r1:latest',
      'deepseek-r1',
      'codellama:7b-q4_K_M',
      'codellama:7b',
      'codellama:latest',
      'codellama',
      'llama2:7b',
      'llama2:latest',
      'llama2',
      'gemma3:latest',
      'gemma3',
      'devstral:24b-small-2505-q4_K_M',
      'devstral:latest',
      'devstral'
    ];

    for (const model of recommendedModels) {
      if (status.installedModels.includes(model)) {
        return model;
      }
    }

    // If no exact matches, try to find the first available model that contains coding keywords
    const codingKeywords = ['coder', 'code', 'deepseek', 'codellama', 'devstral'];
    for (const keyword of codingKeywords) {
      const found = status.installedModels.find(model => 
        model.toLowerCase().includes(keyword.toLowerCase())
      );
      if (found) {
        return found;
      }
    }

    // As a last resort, return the first available model
    if (status.installedModels.length > 0) {
      return status.installedModels[0];
    }

    return null;
  }

  async validateCurrentConfiguration(): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check Ollama status
    const ollamaStatus = await this.checkOllamaStatus();
    
    if (!ollamaStatus.isRunning) {
      issues.push('Ollama is not running');
      recommendations.push('Start Ollama server or install Ollama');
    }
    
    // Check if current model is available
    const currentModel = this.getModel();
    if (currentModel && !ollamaStatus.installedModels.includes(currentModel)) {
      issues.push(`Configured model '${currentModel}' is not installed`);
      recommendations.push(`Install the model: ollama pull ${currentModel}`);
    }
    
    // Check endpoint
    const endpoint = this.getEndpoint();
    if (!endpoint.includes('localhost:11434')) {
      issues.push('Endpoint is not pointing to local Ollama instance');
      recommendations.push('Set endpoint to http://localhost:11434/v1');
    }
    
    // Auto-detect current project
    const currentProject = await this.autoDetectCurrentProject();
    if (!currentProject) {
      recommendations.push('Run "ai-cli init" to initialize current project');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }

  // New methods for effective model management
  async getEffectiveModel(): Promise<string> {
    const configuredModel = this.getModel();
    const ollamaStatus = await this.checkOllamaStatus();
    
    // If Ollama is not running, return the configured model (will show error when used)
    if (!ollamaStatus.isRunning) {
      return configuredModel;
    }
    
    // If configured model is available, use it
    if (configuredModel && ollamaStatus.installedModels.includes(configuredModel)) {
      return configuredModel;
    }
    
    // Otherwise, fall back to a recommended model
    const recommended = await this.getRecommendedModel();
    if (recommended) {
      console.warn(`⚠️  Configured model '${configuredModel}' not found. Using '${recommended}' instead.`);
      return recommended;
    }
    
    // If no models are available, return the configured model (will show error when used)
    console.warn(`⚠️  No suitable models found. Please install a model with: ollama pull ${configuredModel}`);
    return configuredModel;
  }

  async autoSwitchToAvailableModel(): Promise<boolean> {
    const configuredModel = this.getModel();
    const ollamaStatus = await this.checkOllamaStatus();
    
    // If configured model is available, no need to switch
    if (configuredModel && ollamaStatus.installedModels.includes(configuredModel)) {
      return false;
    }
    
    // Try to find and switch to a recommended model
    const recommended = await this.getRecommendedModel();
    if (recommended) {
      console.log(`🔄 Auto-switching from '${configuredModel}' to '${recommended}'`);
      this.set('model', recommended);
      return true;
    }
    
    return false;
  }

  getConfiguredModel(): string {
    return this.get('model');
  }
} 