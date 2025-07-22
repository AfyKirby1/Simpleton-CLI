import { ConfigManager } from '../config/ConfigManager';
import { LLMClient, ChatMessage } from '../llm/LLMClient';
import { ApprovalPrompt } from './ApprovalPrompt';
import { ConnectionTester } from './ConnectionTester';

export class ChatMode {
  private config: ConfigManager;
  private llmClient: LLMClient;
  private approvalPrompt: ApprovalPrompt;
  private connectionTester: ConnectionTester;
  private conversationHistory: ChatMessage[] = [];

  constructor(config: ConfigManager) {
    this.config = config;
    // We'll initialize the LLM client in start() after getting the effective model
    this.llmClient = null as any;
    this.approvalPrompt = new ApprovalPrompt();
    this.connectionTester = new ConnectionTester();
  }

  async start(): Promise<void> {
    console.log('💬 Starting interactive chat mode...');
    
    // Get the effective model (with fallback logic)
    const endpoint = this.config.getEndpoint();
    const effectiveModel = await this.config.getEffectiveModel();
    const configuredModel = this.config.getConfiguredModel();
    
    // Initialize LLM client with effective model
    this.llmClient = new LLMClient(endpoint, effectiveModel);
    
    console.log(`🔗 Endpoint: ${this.llmClient.getEndpoint()}`);
    if (configuredModel !== effectiveModel) {
      console.log(`🧠 Model: ${effectiveModel} (auto-fallback from ${configuredModel})`);
    } else {
      console.log(`🧠 Model: ${this.llmClient.getModel()}`);
    }
    console.log('Type "exit" or "quit" to end the session');
    console.log('Type "clear" to clear conversation history');
    console.log('Type "help" for available commands');
    console.log('─'.repeat(50));

    // Test connection with loading animation and timeout handling
    const connectionSuccess = await this.connectionTester.testConnectionWithFeedback(this.llmClient, 15000);
    if (!connectionSuccess) {
      this.connectionTester.close();
      return;
    }

    // Initialize conversation
    this.conversationHistory = [
      {
        role: 'system',
        content: `You are a helpful AI coding assistant. You can help with:
- Code analysis and review
- Bug fixing and debugging
- Code generation and refactoring
- Best practices and design patterns
- Project structure and architecture
- Testing strategies

Keep responses concise but informative. If you need to see code or files, ask the user to share them.`
      }
    ];

    await this.chatLoop();
  }

  private async chatLoop(): Promise<void> {
    while (true) {
      try {
        const userInput = await this.approvalPrompt.askForInput('\n💭 You: ');
        
        if (!userInput.trim()) {
          continue;
        }

        // Handle special commands
        if (await this.handleSpecialCommands(userInput)) {
          continue;
        }

        // Add user message to history
        this.conversationHistory.push({
          role: 'user',
          content: userInput
        });

        // Get AI response
        console.log('\n🤖 AI: ');
        const response = await this.getAIResponse();
        
        // Add AI response to history
        this.conversationHistory.push({
          role: 'assistant',
          content: response
        });

      } catch (error) {
        console.error('❌ Error in chat loop:', error);
        break;
      }
    }

    this.approvalPrompt.close();
  }

  private async handleSpecialCommands(input: string): Promise<boolean> {
    const command = input.toLowerCase().trim();

    switch (command) {
      case 'exit':
      case 'quit':
        console.log('👋 Goodbye!');
        this.approvalPrompt.close();
        process.exit(0);
        return true;

      case 'clear':
        this.conversationHistory = [
          {
            role: 'system',
            content: `You are a helpful AI coding assistant. You can help with:
- Code analysis and review
- Bug fixing and debugging
- Code generation and refactoring
- Best practices and design patterns
- Project structure and architecture
- Testing strategies

Keep responses concise but informative. If you need to see code or files, ask the user to share them.`
          }
        ];
        console.log('🧹 Conversation history cleared');
        return true;

      case 'help':
        this.showHelp();
        return true;

      case 'history':
        this.showHistory();
        return true;

      case 'config':
        this.showConfig();
        return true;

      default:
        return false;
    }
  }

  private async getAIResponse(): Promise<string> {
    let response = '';
    
    try {
      for await (const chunk of this.llmClient.streamChatCompletion(this.conversationHistory)) {
        process.stdout.write(chunk);
        response += chunk;
      }
    } catch (error) {
      console.error('\n❌ Error getting AI response:', error);
      return 'Sorry, I encountered an error. Please try again.';
    }

    return response;
  }

  private showHelp(): void {
    console.log('\n📖 Available commands:');
    console.log('  exit, quit    - End the chat session');
    console.log('  clear         - Clear conversation history');
    console.log('  help          - Show this help message');
    console.log('  history       - Show conversation history');
    console.log('  config        - Show current configuration');
    console.log('');
    console.log('💡 You can also just type your questions or requests normally!');
  }

  private showHistory(): void {
    console.log('\n📜 Conversation History:');
    console.log('─'.repeat(50));
    
    this.conversationHistory.forEach((message, index) => {
      if (message.role === 'system') {
        return; // Skip system messages
      }
      
      const role = message.role === 'user' ? '💭 You' : '🤖 AI';
      const content = message.content.length > 100 
        ? message.content.substring(0, 100) + '...'
        : message.content;
      
      console.log(`${index}. ${role}: ${content}`);
    });
    
    console.log('─'.repeat(50));
  }

  private showConfig(): void {
    console.log('\n⚙️  Current Configuration:');
    console.log(`  Endpoint: ${this.config.getEndpoint()}`);
    console.log(`  Model: ${this.config.getModel()}`);
    console.log(`  Auto Approve: ${this.config.getAutoApprove()}`);
    console.log(`  Suggest Only: ${this.config.getSuggestOnly()}`);
    console.log(`  Full Auto: ${this.config.getFullAuto()}`);
  }
} 