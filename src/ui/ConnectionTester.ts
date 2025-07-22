import chalk from 'chalk';
import { LoadingSpinner } from './LoadingSpinner';
import { LLMClient } from '../llm/LLMClient';
import { ApprovalPrompt } from './ApprovalPrompt';

export class ConnectionTester {
  private approvalPrompt: ApprovalPrompt;

  constructor() {
    this.approvalPrompt = new ApprovalPrompt();
  }

  async testConnectionWithFeedback(
    llmClient: LLMClient,
    timeoutMs: number = 15000
  ): Promise<boolean> {
    const spinner = new LoadingSpinner('🔍 Testing connection to AI model...');
    
    try {
      spinner.start();
      
      // Update spinner message after a few seconds
      const messageTimer = setTimeout(() => {
        spinner.updateMessage('🔍 Still checking connection... (this may take a while)');
      }, 3000);

      const result = await llmClient.testConnection(timeoutMs);
      
      clearTimeout(messageTimer);
      
      if (result.success) {
        spinner.stopWithMessage(chalk.green('✅ Successfully connected to AI model'));
        return true;
      } else {
        spinner.stopWithMessage(chalk.red(`❌ Connection failed: ${result.error}`));
        
        if (result.timeout) {
          console.log(chalk.yellow('\n⏱️  Connection timed out after ' + (timeoutMs / 1000) + ' seconds'));
        }
        
        await this.showConnectionHelp(result.error || 'Unknown error');
        return false;
      }
    } catch (error) {
      spinner.stopWithMessage(chalk.red('❌ Unexpected error during connection test'));
      console.error(chalk.red('Error details:'), error);
      await this.showConnectionHelp('Unexpected error');
      return false;
    }
  }

  private async showConnectionHelp(errorMessage: string): Promise<void> {
    console.log(chalk.blue('\n💡 Troubleshooting Steps:'));
    
    if (errorMessage.includes('not running') || errorMessage.includes('ECONNREFUSED')) {
      console.log(chalk.gray('1. Start Ollama server:'));
      console.log(chalk.cyan('   ollama serve'));
      console.log(chalk.gray('2. Or use the launcher:'));
      console.log(chalk.cyan('   ai-cli ollama --serve'));
    } else if (errorMessage.includes('timed out')) {
      console.log(chalk.gray('1. Check if Ollama is running:'));
      console.log(chalk.cyan('   ollama list'));
      console.log(chalk.gray('2. Try restarting Ollama:'));
      console.log(chalk.cyan('   ollama serve'));
      console.log(chalk.gray('3. Check your model is available:'));
      console.log(chalk.cyan('   ai-cli model --list'));
    } else if (errorMessage.includes('not found')) {
      console.log(chalk.gray('1. Check your endpoint configuration:'));
      console.log(chalk.cyan('   ai-cli config --list'));
      console.log(chalk.gray('2. Set correct endpoint:'));
      console.log(chalk.cyan('   ai-cli config --set endpoint http://localhost:11434/v1'));
    } else {
      console.log(chalk.gray('1. Check if Ollama is installed and running:'));
      console.log(chalk.cyan('   ollama serve'));
      console.log(chalk.gray('2. Check your configuration:'));
      console.log(chalk.cyan('   ai-cli config --list'));
      console.log(chalk.gray('3. Install a model if needed:'));
      console.log(chalk.cyan('   ai-cli ollama --setup'));
    }

    console.log('\n' + chalk.blue('🔧 Quick Actions:'));
    console.log(chalk.gray('• Open Ollama model management: ') + chalk.cyan('Press [M]'));
    console.log(chalk.gray('• Go back to main menu: ') + chalk.cyan('Press [B]'));
    console.log(chalk.gray('• Exit: ') + chalk.cyan('Press [E]'));

    const choice = await this.approvalPrompt.askForInput(
      '\nChoose an action (M/B/E)',
      'B'
    );

    switch (choice.toUpperCase()) {
      case 'M':
        console.log(chalk.blue('\n🚀 Opening Ollama model management...'));
        console.log(chalk.gray('Tip: Choose option 1 for quick setup with Mistral 7B'));
        break;
      case 'E':
        console.log(chalk.gray('\n👋 Goodbye!'));
        process.exit(0);
        break;
      default: // 'B' or anything else
        console.log(chalk.gray('\n↩️  Returning to main menu...'));
        break;
    }
  }

  close(): void {
    this.approvalPrompt.close();
  }
} 