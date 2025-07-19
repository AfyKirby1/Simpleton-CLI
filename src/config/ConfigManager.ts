import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

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

export class ConfigManager {
  private config: any;
  private projectContexts: Map<string, ProjectContext>;

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
} 