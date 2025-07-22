import { ConfigManager } from '../config/ConfigManager';
import * as path from 'path';

export interface ConfigOptions {
  set?: string;
  get?: string;
  list?: boolean;
}

export class ConfigCommand {
  private config: ConfigManager;

  constructor() {
    this.config = new ConfigManager();
  }

  async run(options: ConfigOptions = {}): Promise<void> {
    if (options.set) {
      await this.setConfig(options.set);
    } else if (options.get) {
      await this.getConfig(options.get);
    } else if (options.list) {
      await this.listConfig();
    } else {
      // Default behavior - show basic config only
      this.showBasicConfigSync();
    }
  }

  private async setConfig(keyValue: string): Promise<void> {
    const parts = keyValue.split(' ');
    if (parts.length < 2) {
      console.error('❌ Usage: ai-cli config --set <key> <value>');
      return;
    }

    const key = parts[0];
    const value = parts.slice(1).join(' ');

    try {
      this.config.set(key, value);
      console.log(`✅ Set ${key} = ${value}`);
    } catch (error) {
      console.error(`❌ Failed to set config: ${error}`);
    }
  }

  private async getConfig(key: string): Promise<void> {
    try {
      const value = this.config.get(key);
      if (value !== undefined) {
        console.log(`${key} = ${value}`);
      } else {
        console.log(`❌ Config key '${key}' not found`);
      }
    } catch (error) {
      console.error(`❌ Failed to get config: ${error}`);
    }
  }

  private showBasicConfigSync(): void {
    console.log('⚙️  Current Configuration:');
    console.log(`  endpoint: ${this.config.getEndpoint()}`);
    console.log(`  autoApprove: ${this.config.getAutoApprove()}`);
    console.log(`  suggestOnly: ${this.config.getSuggestOnly()}`);
    console.log(`  fullAuto: ${this.config.getFullAuto()}`);
    console.log(`  model: ${this.config.getConfiguredModel()} (configured)`);
  }

  private async showBasicConfig(): Promise<void> {
    console.log('⚙️  Current Configuration:');
    console.log(`  endpoint: ${this.config.getEndpoint()}`);
    console.log(`  autoApprove: ${this.config.getAutoApprove()}`);
    console.log(`  suggestOnly: ${this.config.getSuggestOnly()}`);
    console.log(`  fullAuto: ${this.config.getFullAuto()}`);
    
    // Show model configuration without any external calls
    const configuredModel = this.config.getConfiguredModel();
    console.log(`  model: ${configuredModel} (configured)`);
  }

  private async listConfig(): Promise<void> {
    console.log('⚙️  Current Configuration:');
    console.log('─'.repeat(40));
    
    const configKeys = [
      'endpoint',
      'autoApprove',
      'suggestOnly',
      'fullAuto'
    ];

    configKeys.forEach(key => {
      const value = this.config.get(key);
      console.log(`${key}: ${value}`);
    });

    // Show model configuration separately with more detail
    const configuredModel = this.config.getConfiguredModel();
    const effectiveModel = await this.config.getEffectiveModel();
    
    if (configuredModel === effectiveModel) {
      console.log(`model: ${configuredModel}`);
    } else {
      console.log(`model: ${configuredModel} (configured)`);
      console.log(`      ${effectiveModel} (effective - auto-fallback)`);
    }

    console.log('─'.repeat(40));
    
    // Show Ollama status and model information
    console.log('\n🤖 Ollama Status:');
    const ollamaStatus = await this.config.checkOllamaStatus();
    
    if (ollamaStatus.isRunning) {
      console.log('  ✅ Ollama is running');
      
      if (ollamaStatus.installedModels.length > 0) {
        console.log('  📦 Installed Models:');
        ollamaStatus.installedModels.forEach(model => {
          const isCurrent = model === this.config.getModel();
          const status = isCurrent ? ' (current)' : '';
          console.log(`    ${isCurrent ? '🟢' : '⚪'} ${model}${status}`);
        });
      } else {
        console.log('  ⚠️  No models installed');
      }
      
      // Check if current model is available
      const currentModel = this.config.getModel();
      if (currentModel) {
        if (ollamaStatus.installedModels.includes(currentModel)) {
          console.log(`  ✅ Current model '${currentModel}' is available`);
        } else {
          console.log(`  ❌ Current model '${currentModel}' is NOT installed`);
          const recommended = await this.config.getRecommendedModel();
          if (recommended) {
            console.log(`  💡 Recommended: Use '${recommended}' instead`);
          }
        }
      }
    } else {
      console.log('  ❌ Ollama is not running');
      console.log('  💡 Install Ollama from: https://ollama.ai/');
    }
    
    // Show project contexts with auto-detection
    console.log('\n📁 Project Detection:');
    const currentProject = await this.config.autoDetectCurrentProject();
    
    if (currentProject) {
      const projectName = path.basename(currentProject.projectPath);
      console.log(`  🟢 Current directory: ${projectName}`);
      console.log(`  📄 Files detected: ${currentProject.files.length}`);
      console.log(`  🔄 Git status: ${currentProject.gitStatus === 'clean' ? 'clean' : 'modified'}`);
    } else {
      console.log('  ⚠️  Current directory does not appear to be a project');
      console.log('  💡 Run "ai-cli init" to initialize this directory as a project');
    }
    
    const projects = this.config.listProjects();
    if (projects.length > 0) {
      console.log('\n📁 Known Projects:');
      projects.forEach(project => {
        const isCurrent = currentProject && path.basename(currentProject.projectPath) === project;
        const icon = isCurrent ? '🟢' : '📂';
        console.log(`  ${icon} ${project}${isCurrent ? ' (current)' : ''}`);
      });
    }
    
    // Show validation results
    console.log('\n🔍 Configuration Validation:');
    const validation = await this.config.validateCurrentConfiguration();
    
    if (validation.isValid) {
      console.log('  ✅ Configuration is valid');
    } else {
      console.log('  ❌ Issues found:');
      validation.issues.forEach(issue => {
        console.log(`    • ${issue}`);
      });
    }
    
    if (validation.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      validation.recommendations.forEach(rec => {
        console.log(`    • ${rec}`);
      });
    }
  }

  private async showHelp(): Promise<void> {
    console.log('📖 Configuration Commands:');
    console.log('');
    console.log('  ai-cli config --set <key> <value>');
    console.log('    Set a configuration value');
    console.log('    Example: ai-cli config --set model deepseek-coder:1.3b-q4_K_M');
    console.log('');
    console.log('  ai-cli config --get <key>');
    console.log('    Get a configuration value');
    console.log('    Example: ai-cli config --get endpoint');
    console.log('');
    console.log('  ai-cli config --list');
    console.log('    List all configuration values with auto-detection');
    console.log('');
    console.log('📋 Available Configuration Keys:');
    console.log('  endpoint     - LLM API endpoint (default: http://localhost:11434/v1)');
    console.log('  model        - LLM model name (default: deepseek-coder:1.3b-q4_K_M)');
    console.log('  autoApprove  - Auto-approve changes (default: false)');
    console.log('  suggestOnly  - Only suggest changes (default: false)');
    console.log('  fullAuto     - Full automatic mode (default: false)');
  }
} 