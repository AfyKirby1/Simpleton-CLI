import { ConfigManager } from '../config/ConfigManager';
import { OllamaCommand } from './OllamaCommand';
import * as path from 'path';

export interface AutoSetupOptions {
  force?: boolean;
  skipOllama?: boolean;
  skipProject?: boolean;
}

export class AutoSetupCommand {
  private config: ConfigManager;
  private ollamaCmd: OllamaCommand;

  constructor() {
    this.config = new ConfigManager();
    this.ollamaCmd = new OllamaCommand();
  }

  async run(options: AutoSetupOptions = {}): Promise<void> {
    console.log('🚀 AI CLI Auto-Setup');
    console.log('─'.repeat(40));
    console.log('This will automatically configure your AI CLI for optimal use.');
    console.log('');

    // Step 1: Check Ollama status
    if (!options.skipOllama) {
      await this.setupOllama(options.force);
    }

    // Step 2: Auto-detect and configure model
    await this.setupModel(options.force);

    // Step 3: Auto-detect current project
    if (!options.skipProject) {
      await this.setupProject(options.force);
    }

    // Step 4: Show final status
    await this.showFinalStatus();
  }

  private async setupOllama(force: boolean = false): Promise<void> {
    console.log('🤖 Step 1: Checking Ollama...');
    
    const ollamaStatus = await this.config.checkOllamaStatus();
    
    if (ollamaStatus.isRunning) {
      console.log('  ✅ Ollama is running');
    } else {
      console.log('  ❌ Ollama is not running');
      
      if (force) {
        console.log('  🔄 Attempting to start Ollama...');
        try {
          await this.ollamaCmd.run({ serve: true });
          console.log('  ✅ Ollama started successfully');
        } catch (error) {
          console.log('  ❌ Failed to start Ollama automatically');
          console.log('  💡 Please install Ollama from: https://ollama.ai/');
        }
      } else {
        console.log('  💡 Install Ollama from: https://ollama.ai/');
        console.log('  💡 Or run with --force to attempt automatic setup');
      }
    }
  }

  private async setupModel(force: boolean = false): Promise<void> {
    console.log('\n🧠 Step 2: Configuring AI Model...');
    
    const ollamaStatus = await this.config.checkOllamaStatus();
    const currentModel = this.config.getConfiguredModel();
    
    if (ollamaStatus.isRunning) {
      // Check if current model is available
      if (currentModel && ollamaStatus.installedModels.includes(currentModel)) {
        console.log(`  ✅ Current model '${currentModel}' is available`);
      } else {
        console.log(`  ❌ Current model '${currentModel}' is not installed`);
        
        // Try to find a recommended model and auto-switch
        const recommended = await this.config.getRecommendedModel();
        
        if (recommended) {
          console.log(`  🔄 Auto-switching to available model: ${recommended}`);
          this.config.set('model', recommended);
          console.log(`  ✅ Model configuration updated`);
        } else {
          console.log('  ⚠️  No recommended models found');
          
          if (force) {
            console.log('  🔄 Attempting to download Mistral 7B...');
            try {
              await this.ollamaCmd.run({ setup: true });
              console.log('  ✅ Model downloaded successfully');
            } catch (error) {
              console.log('  ❌ Failed to download model automatically');
              console.log('  💡 Run "ai-cli ollama --setup" manually');
            }
          } else {
            console.log('  💡 Run "ai-cli ollama --setup" to download a model');
            console.log('  💡 Or run with --force to attempt automatic download');
          }
        }
      }
    } else {
      console.log('  ⚠️  Ollama not running, cannot configure model');
    }
  }

  private async setupProject(force: boolean = false): Promise<void> {
    console.log('\n📁 Step 3: Detecting Current Project...');
    
    const currentProject = await this.config.autoDetectCurrentProject();
    
    if (currentProject) {
      const projectName = path.basename(currentProject.projectPath);
      console.log(`  ✅ Detected project: ${projectName}`);
      console.log(`  📄 Files: ${currentProject.files.length}`);
      console.log(`  🔄 Git status: ${currentProject.gitStatus === 'clean' ? 'clean' : 'modified'}`);
    } else {
      console.log('  ⚠️  Current directory does not appear to be a project');
      
      if (force) {
        console.log('  🔄 Attempting to initialize project...');
        try {
          const { InitCommand } = await import('./InitCommand');
          const initCmd = new InitCommand();
          await initCmd.run();
          console.log('  ✅ Project initialized successfully');
        } catch (error) {
          console.log('  ❌ Failed to initialize project automatically');
          console.log('  💡 Run "ai-cli init" manually');
        }
      } else {
        console.log('  💡 Run "ai-cli init" to initialize this directory as a project');
        console.log('  💡 Or run with --force to attempt automatic initialization');
      }
    }
  }

  private async showFinalStatus(): Promise<void> {
    console.log('\n📊 Final Status:');
    console.log('─'.repeat(40));
    
    const validation = await this.config.validateCurrentConfiguration();
    
    if (validation.isValid) {
      console.log('✅ Setup complete! Your AI CLI is ready to use.');
      console.log('');
      console.log('🚀 Quick Start:');
      console.log('  • Chat Mode: ai-cli chat');
      console.log('  • Quick Task: ai-cli "your task here"');
      console.log('  • Configuration: ai-cli config --list');
    } else {
      console.log('⚠️  Setup incomplete. Issues found:');
      validation.issues.forEach(issue => {
        console.log(`  • ${issue}`);
      });
      
      if (validation.recommendations.length > 0) {
        console.log('\n💡 Next Steps:');
        validation.recommendations.forEach(rec => {
          console.log(`  • ${rec}`);
        });
      }
    }
  }
} 