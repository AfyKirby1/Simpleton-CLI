import { ConfigManager } from '../config/ConfigManager';
import { ApprovalPrompt } from '../ui/ApprovalPrompt';
import * as path from 'path';

export class InitCommand {
  private config: ConfigManager;
  private approvalPrompt: ApprovalPrompt;

  constructor() {
    this.config = new ConfigManager();
    this.approvalPrompt = new ApprovalPrompt();
  }

  async run(): Promise<void> {
    const projectPath = process.cwd();
    const projectName = path.basename(projectPath);

    console.log(`🚀 Initializing AI CLI context for project: ${projectName}`);
    console.log(`📁 Project path: ${projectPath}`);

    try {
      // Update project context
      await this.config.updateProjectContext(projectPath);
      const context = this.config.getProjectContext(projectPath);

      if (context) {
        console.log('✅ Project context initialized successfully!');
        console.log(`📊 Found ${context.files.length} files`);
        console.log(`📝 Git status: ${context.gitStatus}`);
        console.log(`🕒 Last updated: ${context.lastUpdated.toLocaleString()}`);
        
        // Show some example files
        if (context.files.length > 0) {
          console.log('\n📋 Sample files:');
          context.files.slice(0, 10).forEach(file => {
            console.log(`  📄 ${file}`);
          });
          
          if (context.files.length > 10) {
            console.log(`  ... and ${context.files.length - 10} more files`);
          }
        }

        console.log('\n🎉 You can now use the AI CLI!');
        console.log('💡 Try: ai-cli "help me understand this codebase"');
        console.log('💡 Or: ai-cli chat (for interactive mode)');
      } else {
        console.error('❌ Failed to initialize project context');
      }

    } catch (error) {
      console.error('❌ Error during initialization:', error);
    } finally {
      this.approvalPrompt.close();
    }
  }
} 