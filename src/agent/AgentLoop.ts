import { ConfigManager } from '../config/ConfigManager';
import { LLMClient, ChatMessage } from '../llm/LLMClient';
import { FileManager } from '../tools/FileManager';
import { ShellExecutor } from '../tools/ShellExecutor';
import { DiffRenderer } from '../ui/DiffRenderer';
import { ApprovalPrompt } from '../ui/ApprovalPrompt';
import { ConnectionTester } from '../ui/ConnectionTester';
import * as path from 'path';

export interface AgentOptions {
  suggest?: boolean;
  autoEdit?: boolean;
  fullAuto?: boolean;
  model?: string;
  endpoint?: string;
}

export class AgentLoop {
  private config: ConfigManager;
  private llmClient: LLMClient;
  private fileManager: FileManager;
  private shellExecutor: ShellExecutor;
  private diffRenderer: DiffRenderer;
  private approvalPrompt: ApprovalPrompt;
  private connectionTester: ConnectionTester;
  private options: AgentOptions;

  constructor(config: ConfigManager, options: AgentOptions = {}) {
    this.config = config;
    this.options = options;
    
    // We'll initialize the LLM client in run() after getting the effective model
    this.llmClient = null as any;
    this.fileManager = new FileManager();
    this.shellExecutor = new ShellExecutor();
    this.diffRenderer = new DiffRenderer();
    this.approvalPrompt = new ApprovalPrompt();
    this.connectionTester = new ConnectionTester();
  }

  async run(prompt: string): Promise<void> {
    const projectPath = process.cwd();
    
    console.log(`🤖 AI CLI Agent starting...`);
    console.log(`📁 Project: ${path.basename(projectPath)}`);
    
    // Get the effective model (with fallback logic)
    const endpoint = this.options.endpoint || this.config.getEndpoint();
    const effectiveModel = this.options.model || await this.config.getEffectiveModel();
    const configuredModel = this.config.getConfiguredModel();
    
    // Initialize LLM client with effective model
    this.llmClient = new LLMClient(endpoint, effectiveModel);
    
    console.log(`🔗 Endpoint: ${this.llmClient.getEndpoint()}`);
    if (!this.options.model && configuredModel !== effectiveModel) {
      console.log(`🧠 Model: ${effectiveModel} (auto-fallback from ${configuredModel})`);
    } else {
      console.log(`🧠 Model: ${this.llmClient.getModel()}`);
    }
    console.log(`💭 Task: ${prompt}`);
    console.log('');

    // Test LLM connection with loading animation and timeout handling
    const connectionSuccess = await this.connectionTester.testConnectionWithFeedback(this.llmClient, 15000);
    if (!connectionSuccess) {
      this.connectionTester.close();
      process.exit(1);
    }

    // Update project context
    await this.config.updateProjectContext(projectPath);
    const context = this.config.getProjectContext(projectPath);

    // Build system prompt
    const systemPrompt = this.buildSystemPrompt(context);

    // Execute agent loop
    await this.executeAgentLoop(prompt, systemPrompt, projectPath);
  }

  private buildSystemPrompt(context: any): string {
    return `You are an AI coding assistant that helps users with programming tasks. You have access to the following project context:

Project Path: ${context?.projectPath || 'Unknown'}
Files: ${context?.files?.length || 0} files tracked
Git Status: ${context?.gitStatus || 'Unknown'}

You can:
1. Read and analyze code files
2. Suggest code changes and improvements
3. Execute shell commands (with user approval)
4. Create new files
5. Modify existing files

IMPORTANT RULES:
- Always explain your reasoning before making changes
- Show diffs for any file modifications
- Ask for user approval before executing shell commands
- Be careful with destructive operations
- Follow the project's existing code style
- Test your changes when possible

Available commands:
- READ_FILE <path> - Read a file's contents
- WRITE_FILE <path> <content> - Write content to a file
- EXECUTE <command> - Execute a shell command
- LIST_FILES - List project files
- ANALYZE_CODE <path> - Analyze code structure

Respond with your plan and then execute it step by step.`;
  }

  private async executeAgentLoop(
    prompt: string,
    systemPrompt: string,
    projectPath: string
  ): Promise<void> {
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    let response = '';
    
    console.log('🤔 Thinking...');
    
    // Stream the response
    for await (const chunk of this.llmClient.streamChatCompletion(messages)) {
      process.stdout.write(chunk);
      response += chunk;
    }
    
    console.log('\n');

    // Parse and execute the response
    await this.parseAndExecuteResponse(response, projectPath);
  }

  private async parseAndExecuteResponse(response: string, projectPath: string): Promise<void> {
    // Simple parsing - in a real implementation, you'd want more sophisticated parsing
    const lines = response.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('READ_FILE')) {
        const filePath = trimmed.split(' ')[1];
        await this.handleReadFile(filePath, projectPath);
      } else if (trimmed.startsWith('WRITE_FILE')) {
        const parts = trimmed.split(' ');
        const filePath = parts[1];
        const content = parts.slice(2).join(' ');
        await this.handleWriteFile(filePath, content, projectPath);
      } else if (trimmed.startsWith('EXECUTE')) {
        const command = trimmed.split(' ').slice(1).join(' ');
        await this.handleExecuteCommand(command, projectPath);
      } else if (trimmed.startsWith('LIST_FILES')) {
        await this.handleListFiles(projectPath);
      }
    }
  }

  private async handleReadFile(filePath: string, projectPath: string): Promise<void> {
    try {
      const fullPath = path.join(projectPath, filePath);
      const content = await this.fileManager.readFile(fullPath);
      console.log(`📖 File: ${filePath}`);
      console.log(content);
      console.log('');
    } catch (error) {
      console.error(`❌ Error reading file ${filePath}:`, error);
    }
  }

  private async handleWriteFile(filePath: string, content: string, projectPath: string): Promise<void> {
    try {
      const fullPath = path.join(projectPath, filePath);
      const originalContent = await this.fileManager.readFile(fullPath).catch(() => '');
      
      // Show diff
      const diff = this.diffRenderer.renderDiff(originalContent, content, filePath);
      console.log(diff);
      
      // Get approval
      if (this.options.suggest) {
        console.log('💡 Suggestion mode - no changes applied');
        return;
      }
      
      if (!this.options.autoEdit && !this.options.fullAuto) {
        const approved = await this.approvalPrompt.askForApproval(`Apply changes to ${filePath}?`);
        if (!approved) {
          console.log('❌ Changes rejected by user');
          return;
        }
      }
      
      await this.fileManager.writeFile(fullPath, content);
      console.log(`✅ Updated ${filePath}`);
      
    } catch (error) {
      console.error(`❌ Error writing file ${filePath}:`, error);
    }
  }

  private async handleExecuteCommand(command: string, projectPath: string): Promise<void> {
    try {
      console.log(`🔧 Command: ${command}`);
      
      if (this.options.suggest) {
        console.log('💡 Suggestion mode - command not executed');
        return;
      }
      
      if (!this.options.fullAuto) {
        const approved = await this.approvalPrompt.askForApproval(`Execute command: ${command}?`);
        if (!approved) {
          console.log('❌ Command rejected by user');
          return;
        }
      }
      
      const result = await this.shellExecutor.execute(command, projectPath);
      console.log(`✅ Command executed successfully`);
      console.log(result);
      
    } catch (error) {
      console.error(`❌ Error executing command:`, error);
    }
  }

  private async handleListFiles(projectPath: string): Promise<void> {
    try {
      const files = await this.fileManager.listFiles(projectPath);
      console.log('📁 Project files:');
      files.forEach(file => console.log(`  ${file}`));
      console.log('');
    } catch (error) {
      console.error('❌ Error listing files:', error);
    }
  }
} 