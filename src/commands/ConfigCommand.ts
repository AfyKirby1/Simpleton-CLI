import { ConfigManager } from '../config/ConfigManager';

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

  async run(options: ConfigOptions): Promise<void> {
    if (options.set) {
      await this.setConfig(options.set);
    } else if (options.get) {
      await this.getConfig(options.get);
    } else if (options.list) {
      await this.listConfig();
    } else {
      await this.showHelp();
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

  private async listConfig(): Promise<void> {
    console.log('⚙️  Current Configuration:');
    console.log('─'.repeat(40));
    
    const configKeys = [
      'endpoint',
      'model',
      'autoApprove',
      'suggestOnly',
      'fullAuto'
    ];

    configKeys.forEach(key => {
      const value = this.config.get(key);
      console.log(`${key}: ${value}`);
    });

    console.log('─'.repeat(40));
    
    // Show project contexts
    const projects = this.config.listProjects();
    if (projects.length > 0) {
      console.log('\n📁 Known Projects:');
      projects.forEach(project => {
        console.log(`  📂 ${project}`);
      });
    } else {
      console.log('\n📁 No projects initialized yet');
      console.log('💡 Run "ai-cli init" in a project directory to get started');
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
    console.log('    List all configuration values');
    console.log('');
    console.log('📋 Available Configuration Keys:');
    console.log('  endpoint     - LLM API endpoint (default: http://localhost:11434/v1)');
    console.log('  model        - LLM model name (default: deepseek-coder:1.3b-q4_K_M)');
    console.log('  autoApprove  - Auto-approve changes (default: false)');
    console.log('  suggestOnly  - Only suggest changes (default: false)');
    console.log('  fullAuto     - Full automatic mode (default: false)');
  }
} 