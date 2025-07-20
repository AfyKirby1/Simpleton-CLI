import { ConfigManager } from '../config/ConfigManager';
import { ApprovalPrompt } from '../ui/ApprovalPrompt';
import chalk from 'chalk';

export interface ModelOptions {
  list?: boolean;
  switch?: boolean;
  current?: boolean;
  set?: string;
}

export class ModelCommand {
  private config: ConfigManager;
  private approvalPrompt: ApprovalPrompt;

  constructor() {
    this.config = new ConfigManager();
    this.approvalPrompt = new ApprovalPrompt();
  }

  async run(options: ModelOptions): Promise<void> {
    try {
      if (options.list) {
        await this.listModels();
      } else if (options.switch) {
        await this.switchModelInteractive();
      } else if (options.current) {
        await this.showCurrentModel();
      } else if (options.set) {
        await this.setModel(options.set);
      } else {
        await this.switchModelInteractive(); // Default to interactive switch
      }
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : error);
    } finally {
      this.approvalPrompt.close();
    }
  }

  private async listModels(): Promise<void> {
    console.log(chalk.blue('🤖 Available Models'));
    console.log('─'.repeat(40));

    const ollamaStatus = await this.config.checkOllamaStatus();
    const currentModel = this.config.getConfiguredModel();
    const effectiveModel = await this.config.getEffectiveModel();

    if (!ollamaStatus.isRunning) {
      console.log(chalk.red('❌ Ollama is not running'));
      console.log(chalk.gray('💡 Start Ollama with: ai-cli ollama --serve'));
      return;
    }

    if (ollamaStatus.installedModels.length === 0) {
      console.log(chalk.yellow('⚠️  No models installed'));
      console.log(chalk.gray('💡 Install a model with: ai-cli ollama --setup'));
      return;
    }

    console.log('\n📦 Installed Models:\n');

    ollamaStatus.installedModels.forEach(model => {
      const isCurrent = model === currentModel;
      const isEffective = model === effectiveModel;
      
      let icon = '⚪';
      let status = '';
      
      if (isCurrent && isEffective) {
        icon = '🟢';
        status = chalk.green(' (current)');
      } else if (isEffective) {
        icon = '🔄';
        status = chalk.yellow(' (effective - auto-fallback)');
      } else if (isCurrent) {
        icon = '❌';
        status = chalk.red(' (configured but not available)');
      }

      console.log(`  ${icon} ${chalk.cyan(model)}${status}`);
    });

    console.log('\n📋 Usage:');
    console.log(chalk.gray('  ai-cli model --switch     # Interactive model selector'));
    console.log(chalk.gray('  ai-cli model --set <name> # Set model directly'));
    console.log(chalk.gray('  ai-cli model --current    # Show current model info'));
  }

  private async showCurrentModel(): Promise<void> {
    console.log(chalk.blue('🎯 Current Model Information'));
    console.log('─'.repeat(40));

    const configuredModel = this.config.getConfiguredModel();
    const effectiveModel = await this.config.getEffectiveModel();
    const ollamaStatus = await this.config.checkOllamaStatus();

    console.log(`\n📝 Configured Model: ${chalk.cyan(configuredModel)}`);
    console.log(`🎯 Effective Model:  ${chalk.cyan(effectiveModel)}`);

    if (configuredModel !== effectiveModel) {
      console.log(chalk.yellow('\n⚠️  Note: Using fallback model because configured model is not available'));
    }

    if (ollamaStatus.isRunning && ollamaStatus.installedModels.includes(effectiveModel)) {
      console.log(chalk.green('\n✅ Current model is available and ready to use'));
    } else if (!ollamaStatus.isRunning) {
      console.log(chalk.red('\n❌ Ollama is not running'));
    } else {
      console.log(chalk.red('\n❌ Current model is not installed'));
    }

    // Show model recommendations
    const recommended = await this.config.getRecommendedModel();
    if (recommended && recommended !== effectiveModel) {
      console.log(chalk.blue(`\n💡 Recommended available model: ${recommended}`));
    }
  }

  private async switchModelInteractive(): Promise<void> {
    console.log(chalk.blue('🔄 Interactive Model Switcher'));
    console.log('─'.repeat(40));

    const ollamaStatus = await this.config.checkOllamaStatus();

    if (!ollamaStatus.isRunning) {
      console.log(chalk.red('❌ Ollama is not running'));
      console.log(chalk.gray('💡 Start Ollama with: ai-cli ollama --serve'));
      return;
    }

    if (ollamaStatus.installedModels.length === 0) {
      console.log(chalk.yellow('⚠️  No models installed'));
      console.log(chalk.gray('💡 Install a model with: ai-cli ollama --setup'));
      return;
    }

    const currentModel = this.config.getConfiguredModel();
    const effectiveModel = await this.config.getEffectiveModel();

    console.log(`\nCurrent: ${chalk.cyan(currentModel)}`);
    if (currentModel !== effectiveModel) {
      console.log(`Effective: ${chalk.cyan(effectiveModel)} ${chalk.yellow('(fallback)')}`);
    }

    console.log('\n📦 Available Models:\n');

    // Display models with numbers for selection
    ollamaStatus.installedModels.forEach((model, index) => {
      const isCurrent = model === currentModel;
      const isEffective = model === effectiveModel;
      
      let prefix = `${index + 1}.`;
      let modelName = model;
      let status = '';
      
      if (isCurrent && isEffective) {
        prefix = chalk.green(`${index + 1}.`);
        modelName = chalk.green.bold(model);
        status = chalk.green(' ← current');
      } else if (isEffective) {
        prefix = chalk.yellow(`${index + 1}.`);
        modelName = chalk.yellow.bold(model);
        status = chalk.yellow(' ← effective');
      } else if (isCurrent) {
        prefix = chalk.red(`${index + 1}.`);
        modelName = chalk.red(model);
        status = chalk.red(' (configured but unavailable)');
      } else {
        modelName = chalk.cyan(model);
      }

      console.log(`  ${prefix} ${modelName}${status}`);
    });

    console.log(`\n  ${ollamaStatus.installedModels.length + 1}. ${chalk.gray('Cancel (keep current)')}`);

    const choice = await this.approvalPrompt.askForInput(
      `\nSelect a model (1-${ollamaStatus.installedModels.length + 1})`,
      (ollamaStatus.installedModels.length + 1).toString()
    );

    const choiceNum = parseInt(choice);
    
    if (isNaN(choiceNum) || choiceNum < 1 || choiceNum > ollamaStatus.installedModels.length + 1) {
      console.log(chalk.red('❌ Invalid choice'));
      return;
    }

    if (choiceNum === ollamaStatus.installedModels.length + 1) {
      console.log(chalk.gray('✅ Cancelled - keeping current model'));
      return;
    }

    const selectedModel = ollamaStatus.installedModels[choiceNum - 1];
    await this.setModel(selectedModel);
  }

  private async setModel(modelName: string): Promise<void> {
    console.log(chalk.blue(`🔄 Switching to model: ${modelName}`));

    const ollamaStatus = await this.config.checkOllamaStatus();

    if (!ollamaStatus.isRunning) {
      console.log(chalk.red('❌ Ollama is not running'));
      console.log(chalk.gray('💡 Start Ollama with: ai-cli ollama --serve'));
      return;
    }

    if (!ollamaStatus.installedModels.includes(modelName)) {
      console.log(chalk.red(`❌ Model '${modelName}' is not installed`));
      console.log(chalk.gray(`💡 Install it with: ai-cli ollama --pull ${modelName}`));
      
      // Show available models
      if (ollamaStatus.installedModels.length > 0) {
        console.log(chalk.blue('\n📦 Available models:'));
        ollamaStatus.installedModels.forEach(model => {
          console.log(`  • ${chalk.cyan(model)}`);
        });
      }
      return;
    }

    try {
      this.config.set('model', modelName);
      console.log(chalk.green(`✅ Successfully switched to: ${modelName}`));
      
      // Clear any cached model-related data
      this.config.set('endpoint', 'http://localhost:11434/v1'); // Ensure endpoint is set
      
      console.log(chalk.blue('\n🎉 Model switch complete!'));
      console.log(chalk.gray('You can now use the new model with:'));
      console.log(chalk.cyan('  ai-cli chat'));
      console.log(chalk.cyan('  ai-cli "your prompt here"'));
      
    } catch (error) {
      console.log(chalk.red(`❌ Failed to switch model: ${error}`));
    }
  }

  private async showHelp(): Promise<void> {
    console.log(chalk.blue('📖 Model Management Help'));
    console.log('─'.repeat(40));
    console.log('');
    console.log('Usage: ai-cli model [options]');
    console.log('');
    console.log('Options:');
    console.log('  --switch         Interactive model selector (default)');
    console.log('  --list           List all available models');
    console.log('  --current        Show current model information');
    console.log('  --set <model>    Set model directly');
    console.log('');
    console.log('Examples:');
    console.log(chalk.gray('  ai-cli model                           # Interactive switcher'));
    console.log(chalk.gray('  ai-cli model --list                    # List models'));
    console.log(chalk.gray('  ai-cli model --current                 # Show current'));
    console.log(chalk.gray('  ai-cli model --set mistral:7b          # Set specific model'));
    console.log('');
    console.log('Related Commands:');
    console.log(chalk.gray('  ai-cli ollama --list                   # List installed models'));
    console.log(chalk.gray('  ai-cli ollama --pull <model>           # Install new model'));
    console.log(chalk.gray('  ai-cli config --list                   # Show full config'));
  }
} 