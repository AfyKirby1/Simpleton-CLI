import { execSync, spawn } from 'child_process';
import chalk from 'chalk';
import { ConfigManager } from '../config/ConfigManager';

interface OllamaModel {
  name: string;
  description: string;
  size: string;
  ramRequired: string;
  recommended?: boolean;
}

export class OllamaCommand {
  private config: ConfigManager;
  
  // Popular coding models with Mistral 7B as default
  private readonly RECOMMENDED_MODELS: OllamaModel[] = [
    {
      name: 'mistral:7b',
      description: 'Mistral 7B - Excellent general purpose model with strong coding abilities',
      size: '4.1GB',
      ramRequired: '8GB+',
      recommended: true
    },
    {
      name: 'deepseek-coder:1.3b-q4_K_M',
      description: 'DeepSeek Coder 1.3B - Fast, lightweight coding model',
      size: '0.8GB',
      ramRequired: '2GB+',
    },
    {
      name: 'deepseek-coder:6.7b-q4_K_M',
      description: 'DeepSeek Coder 6.7B - High quality coding model',
      size: '3.7GB',
      ramRequired: '8GB+',
    },
    {
      name: 'codellama:7b-q4_K_M',
      description: 'Code Llama 7B - Meta\'s specialized code model',
      size: '3.8GB',
      ramRequired: '8GB+',
    },
    {
      name: 'codegemma:2b-q4_K_M',
      description: 'CodeGemma 2B - Google\'s lightweight coding model',
      size: '1.6GB',
      ramRequired: '4GB+',
    },
    {
      name: 'qwen2.5-coder:1.5b-q4_K_M',
      description: 'Qwen2.5 Coder 1.5B - Fast and efficient coding model',
      size: '1.0GB',
      ramRequired: '3GB+',
    }
  ];

  constructor() {
    this.config = new ConfigManager();
  }

  async run(options: any): Promise<void> {
    try {
      // Check if Ollama is installed
      if (!this.isOllamaInstalled()) {
        this.showOllamaInstallInstructions();
        return;
      }

      if (options.list) {
        await this.listInstalledModels();
      } else if (options.available) {
        this.showAvailableModels();
      } else if (options.pull) {
        await this.pullModel(options.pull);
      } else if (options.serve) {
        await this.startOllama();
      } else if (options.setup) {
        await this.setupRecommendedModel();
      } else {
        this.showHelp();
      }
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : error);
    }
  }

  private isOllamaInstalled(): boolean {
    try {
      execSync('ollama --version', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  private showOllamaInstallInstructions(): void {
    console.log(chalk.yellow('⚠️  Ollama is not installed!'));
    console.log('');
    console.log('To install Ollama:');
    console.log('');
    console.log(chalk.cyan('Windows/macOS:'));
    console.log('  1. Visit: https://ollama.com/');
    console.log('  2. Download and run the installer');
    console.log('');
    console.log(chalk.cyan('Linux:'));
    console.log('  curl -fsSL https://ollama.com/install.sh | sh');
    console.log('');
    console.log('After installation, restart your terminal and run:');
    console.log(chalk.green('  ai-cli ollama --setup'));
  }

  private showAvailableModels(): void {
    console.log(chalk.blue('📦 Recommended Coding Models:'));
    console.log('');
    
    this.RECOMMENDED_MODELS.forEach((model, index) => {
      const prefix = model.recommended ? '⭐' : '  ';
      const title = model.recommended ? chalk.yellow.bold(model.name) : chalk.cyan(model.name);
      
      console.log(`${prefix} ${title}`);
      console.log(`   ${chalk.gray(model.description)}`);
      console.log(`   ${chalk.gray('Size:')} ${model.size} | ${chalk.gray('RAM:')} ${model.ramRequired}`);
      
      if (model.recommended) {
        console.log(`   ${chalk.green('✨ Recommended for most users')}`);
      }
      console.log('');
    });

    console.log(chalk.gray('To install a model:'));
    console.log(chalk.gray('  ai-cli ollama --pull <model-name>'));
    console.log('');
    console.log(chalk.gray('For quick setup with Mistral 7B:'));
    console.log(chalk.gray('  ai-cli ollama --setup'));
  }

  private async listInstalledModels(): Promise<void> {
    try {
      console.log(chalk.blue('📋 Installed Ollama Models:'));
      console.log('');
      
      const result = execSync('ollama list', { encoding: 'utf-8' });
      const lines = result.split('\n').filter(line => line.trim());
      
      if (lines.length <= 1) {
        console.log(chalk.yellow('No models installed yet.'));
        console.log('');
        console.log('Run this to get started:');
        console.log(chalk.green('  ai-cli ollama --setup'));
        return;
      }

      // Skip header line and display models
      lines.slice(1).forEach(line => {
        if (line.trim()) {
          const parts = line.split(/\s+/);
          if (parts.length >= 3) {
            const name = parts[0];
            const size = parts[2];
            console.log(`  ${chalk.cyan(name)} ${chalk.gray('(' + size + ')')}`);
          }
        }
      });

      console.log('');
      console.log(chalk.gray('To use a model:'));
      console.log(chalk.gray('  ai-cli config --set model <model-name>'));
      
    } catch (error) {
      console.error(chalk.red('Failed to list models. Make sure Ollama is running.'));
    }
  }

  private async pullModel(modelName: string): Promise<void> {
    console.log(chalk.blue(`📥 Downloading ${modelName}...`));
    console.log(chalk.gray('This may take several minutes depending on model size.'));
    console.log('');

    try {
      // Use spawn for real-time output
      const child = spawn('ollama', ['pull', modelName], {
        stdio: 'inherit'
      });

      await new Promise<void>((resolve, reject) => {
        child.on('close', (code) => {
          if (code === 0) {
            console.log('');
            console.log(chalk.green(`✅ Successfully downloaded ${modelName}`));
            console.log('');
            console.log('To use this model:');
            console.log(chalk.cyan(`  ai-cli config --set model ${modelName}`));
            console.log(chalk.cyan('  ai-cli ollama --serve'));
            resolve();
          } else {
            reject(new Error(`Failed to download model (exit code: ${code})`));
          }
        });

        child.on('error', reject);
      });

    } catch (error) {
      console.error(chalk.red('❌ Failed to download model:'), error);
    }
  }

  private async startOllama(): Promise<void> {
    console.log(chalk.blue('🚀 Starting Ollama server...'));
    
    try {
      // Check if already running
      try {
        execSync('curl -s http://localhost:11434/api/tags', { stdio: 'pipe' });
        console.log(chalk.green('✅ Ollama is already running on http://localhost:11434'));
        return;
      } catch {
        // Not running, start it
      }

      console.log(chalk.gray('Starting Ollama in the background...'));
      
      // Start Ollama serve in background
      const child = spawn('ollama', ['serve'], {
        detached: true,
        stdio: 'ignore'
      });
      
      child.unref();
      
      // Wait a moment and check if it started
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        execSync('curl -s http://localhost:11434/api/tags', { stdio: 'pipe' });
        console.log(chalk.green('✅ Ollama server started successfully'));
        console.log(chalk.gray('Endpoint: http://localhost:11434'));
      } catch {
        console.log(chalk.yellow('⚠️  Ollama may be starting up. Check with: ollama list'));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to start Ollama:'), error);
      console.log('');
      console.log('Try running manually:');
      console.log(chalk.gray('  ollama serve'));
    }
  }

  private async setupRecommendedModel(): Promise<void> {
    console.log(chalk.blue('🎯 Setting up recommended model (Mistral 7B)...'));
    console.log('');
    
    console.log(chalk.gray('This will:'));
    console.log(chalk.gray('  1. Download Mistral 7B model (~4.1GB)'));
    console.log(chalk.gray('  2. Configure AI CLI to use it'));
    console.log(chalk.gray('  3. Start Ollama server'));
    console.log('');
    
    // Download the model
    await this.pullModel('mistral:7b');
    
    // Configure the CLI to use it
    console.log(chalk.blue('⚙️  Configuring AI CLI...'));
    await this.config.set('model', 'mistral:7b');
    await this.config.set('endpoint', 'http://localhost:11434/v1');
    
    console.log(chalk.green('✅ Configuration updated'));
    console.log('');
    
    // Start Ollama
    await this.startOllama();
    
    console.log('');
    console.log(chalk.green.bold('🎉 Setup complete!'));
    console.log('');
    console.log('You can now use the AI CLI:');
    console.log(chalk.cyan('  ai-cli "explain this code"'));
    console.log(chalk.cyan('  ai-cli chat'));
    console.log(chalk.cyan('  ./launch-ai-cli.bat'));
  }

  private showHelp(): void {
    console.log(chalk.blue('🤖 Ollama Model Management'));
    console.log('');
    console.log('Usage:');
    console.log('  ai-cli ollama [options]');
    console.log('');
    console.log('Options:');
    console.log('  --setup              Quick setup with Mistral 7B (recommended)');
    console.log('  --available          Show available models');
    console.log('  --list              List installed models');
    console.log('  --pull <model>      Download a specific model');
    console.log('  --serve             Start Ollama server');
    console.log('');
    console.log('Examples:');
    console.log(chalk.gray('  ai-cli ollama --setup                    # Quick setup'));
    console.log(chalk.gray('  ai-cli ollama --available               # Show available models'));
    console.log(chalk.gray('  ai-cli ollama --pull mistral:7b         # Download Mistral 7B'));
    console.log(chalk.gray('  ai-cli ollama --list                    # List installed models'));
    console.log(chalk.gray('  ai-cli ollama --serve                   # Start Ollama server'));
  }
} 