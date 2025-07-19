# 📚 AI CLI API Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Core Interfaces](#core-interfaces)
3. [Configuration APIs](#configuration-apis)
4. [LLM Client APIs](#llm-client-apis)
5. [Agent APIs](#agent-apis)
6. [Tool APIs](#tool-apis)
7. [UI APIs](#ui-apis)
8. [Command APIs](#command-apis)
9. [Error Handling](#error-handling)
10. [Examples](#examples)

## 🎯 Overview

This document provides comprehensive API documentation for all AI CLI components. Each API is documented with TypeScript interfaces, usage examples, and integration patterns.

## 🔧 Core Interfaces

### Configuration Interfaces

```typescript
/**
 * Configuration options for CLI behavior
 */
export interface ConfigOptions {
  /** LLM endpoint URL */
  endpoint?: string;
  /** Model name to use */
  model?: string;
  /** Auto-approve all changes */
  autoApprove?: boolean;
  /** Only suggest changes, don't apply */
  suggestOnly?: boolean;
  /** Run in full automatic mode */
  fullAuto?: boolean;
}

/**
 * Project context information
 */
export interface ProjectContext {
  /** Absolute path to project root */
  projectPath: string;
  /** List of tracked files */
  files: string[];
  /** Git repository status */
  gitStatus: string;
  /** Last context update timestamp */
  lastUpdated: Date;
}
```

### LLM Interfaces

```typescript
/**
 * Chat message structure
 */
export interface ChatMessage {
  /** Message role */
  role: 'system' | 'user' | 'assistant';
  /** Message content */
  content: string;
}

/**
 * Chat completion request
 */
export interface ChatCompletionRequest {
  /** Model to use */
  model: string;
  /** Conversation messages */
  messages: ChatMessage[];
  /** Sampling temperature */
  temperature?: number;
  /** Maximum tokens to generate */
  max_tokens?: number;
  /** Enable streaming */
  stream?: boolean;
}

/**
 * Chat completion response
 */
export interface ChatCompletionResponse {
  /** Response ID */
  id: string;
  /** Response object type */
  object: string;
  /** Creation timestamp */
  created: number;
  /** Model used */
  model: string;
  /** Response choices */
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  /** Token usage statistics */
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

### Agent Interfaces

```typescript
/**
 * Agent execution options
 */
export interface AgentOptions {
  /** Only suggest changes */
  suggest?: boolean;
  /** Auto-apply changes with confirmation */
  autoEdit?: boolean;
  /** Run in full automatic mode */
  fullAuto?: boolean;
  /** Override model */
  model?: string;
  /** Override endpoint */
  endpoint?: string;
}
```

### Tool Interfaces

```typescript
/**
 * Command execution result
 */
export interface CommandResult {
  /** Whether command succeeded */
  success: boolean;
  /** Standard output */
  stdout: string;
  /** Standard error */
  stderr: string;
  /** Exit code */
  exitCode: number;
  /** Original command */
  command: string;
}
```

## ⚙️ Configuration APIs

### ConfigManager

```typescript
/**
 * Manages application configuration and project contexts
 * @category Configuration
 */
export class ConfigManager {
  /**
   * Get configuration value
   * @param key Configuration key
   * @returns Configuration value
   */
  get(key: string): any;

  /**
   * Set configuration value
   * @param key Configuration key
   * @param value Configuration value
   */
  set(key: string, value: any): void;

  /**
   * Get LLM endpoint URL
   * @returns Endpoint URL
   */
  getEndpoint(): string;

  /**
   * Get model name
   * @returns Model name
   */
  getModel(): string;

  /**
   * Get auto-approve setting
   * @returns Auto-approve flag
   */
  getAutoApprove(): boolean;

  /**
   * Get suggest-only setting
   * @returns Suggest-only flag
   */
  getSuggestOnly(): boolean;

  /**
   * Get full-auto setting
   * @returns Full-auto flag
   */
  getFullAuto(): boolean;

  /**
   * Get project context
   * @param projectPath Path to project
   * @returns Project context or undefined
   */
  getProjectContext(projectPath: string): ProjectContext | undefined;

  /**
   * Update project context
   * @param projectPath Path to project
   */
  async updateProjectContext(projectPath: string): Promise<void>;

  /**
   * List known projects
   * @returns Array of project names
   */
  listProjects(): string[];
}
```

**Usage Example:**
```typescript
const config = new ConfigManager();

// Get current endpoint
const endpoint = config.getEndpoint();

// Set new model
config.set('model', 'codellama:7b-q4_K_M');

// Update project context
await config.updateProjectContext('/path/to/project');

// Get project context
const context = config.getProjectContext('/path/to/project');
```

## 🧠 LLM Client APIs

### LLMClient

```typescript
/**
 * OpenAI-compatible client for local LLM communication
 * @category LLM
 */
export class LLMClient {
  /**
   * Create LLM client
   * @param endpoint LLM API endpoint
   * @param model Model name
   */
  constructor(endpoint: string, model: string);

  /**
   * Send chat completion request
   * @param messages Conversation messages
   * @param options Request options
   * @returns Chat completion response
   */
  async chatCompletion(
    messages: ChatMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    }
  ): Promise<ChatCompletionResponse>;

  /**
   * Stream chat completion response
   * @param messages Conversation messages
   * @param options Request options
   * @returns Async generator of response chunks
   */
  async *streamChatCompletion(
    messages: ChatMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): AsyncGenerator<string, void, unknown>;

  /**
   * Test connection to LLM endpoint
   * @returns Whether connection is successful
   */
  async testConnection(): Promise<boolean>;

  /**
   * Get endpoint URL
   * @returns Endpoint URL
   */
  getEndpoint(): string;

  /**
   * Get model name
   * @returns Model name
   */
  getModel(): string;
}
```

**Usage Example:**
```typescript
const client = new LLMClient('http://localhost:11434/v1', 'deepseek-coder:1.3b-q4_K_M');

// Test connection
const isConnected = await client.testConnection();

// Send completion request
const response = await client.chatCompletion([
  { role: 'user', content: 'Write a hello world function' }
]);

// Stream response
for await (const chunk of client.streamChatCompletion(messages)) {
  process.stdout.write(chunk);
}
```

## 🤖 Agent APIs

### AgentLoop

```typescript
/**
 * Main orchestration engine for AI-powered coding tasks
 * @category Agent
 */
export class AgentLoop {
  /**
   * Create agent loop
   * @param config Configuration manager
   * @param options Agent options
   */
  constructor(config: ConfigManager, options?: AgentOptions);

  /**
   * Run agent with user prompt
   * @param prompt User prompt
   */
  async run(prompt: string): Promise<void>;
}
```

**Usage Example:**
```typescript
const config = new ConfigManager();
const agent = new AgentLoop(config, { suggest: true });

// Run agent with prompt
await agent.run('Refactor this function to use async/await');
```

## 🔨 Tool APIs

### FileManager

```typescript
/**
 * Secure file operations with project sandboxing
 * @category Tools
 */
export class FileManager {
  /**
   * Read file contents
   * @param filePath Path to file
   * @returns File contents
   */
  async readFile(filePath: string): Promise<string>;

  /**
   * Write file contents
   * @param filePath Path to file
   * @param content File contents
   */
  async writeFile(filePath: string, content: string): Promise<void>;

  /**
   * List files in directory
   * @param directory Directory path
   * @returns Array of file paths
   */
  async listFiles(directory: string): Promise<string[]>;

  /**
   * Check if file exists
   * @param filePath Path to file
   * @returns Whether file exists
   */
  async fileExists(filePath: string): Promise<boolean>;

  /**
   * Get file statistics
   * @param filePath Path to file
   * @returns File stats
   */
  async getFileStats(filePath: string): Promise<fs.Stats>;

  /**
   * Copy file
   * @param source Source path
   * @param destination Destination path
   */
  async copyFile(source: string, destination: string): Promise<void>;

  /**
   * Delete file
   * @param filePath Path to file
   */
  async deleteFile(filePath: string): Promise<void>;
}
```

**Usage Example:**
```typescript
const fileManager = new FileManager();

// Read file
const content = await fileManager.readFile('src/index.ts');

// Write file
await fileManager.writeFile('output.txt', 'Hello, World!');

// List files
const files = await fileManager.listFiles('src/');

// Check if exists
const exists = await fileManager.fileExists('package.json');
```

### ShellExecutor

```typescript
/**
 * Secure command execution with allow-listing
 * @category Tools
 */
export class ShellExecutor {
  /**
   * Execute shell command
   * @param command Command to execute
   * @param workingDirectory Working directory
   * @returns Command result
   */
  async execute(command: string, workingDirectory: string): Promise<CommandResult>;

  /**
   * Execute command with confirmation
   * @param command Command to execute
   * @param workingDirectory Working directory
   * @returns Command result
   */
  async executeWithConfirmation(command: string, workingDirectory: string): Promise<CommandResult>;

  /**
   * Get available commands
   * @returns Array of allowed commands
   */
  getAvailableCommands(): string[];

  /**
   * Add allowed command
   * @param command Command to allow
   */
  addAllowedCommand(command: string): void;

  /**
   * Remove allowed command
   * @param command Command to remove
   */
  removeAllowedCommand(command: string): void;
}
```

**Usage Example:**
```typescript
const executor = new ShellExecutor();

// Execute command
const result = await executor.execute('npm install', '/path/to/project');

// Check result
if (result.success) {
  console.log(result.stdout);
} else {
  console.error(result.stderr);
}

// Get available commands
const commands = executor.getAvailableCommands();
```

## 🎨 UI APIs

### DiffRenderer

```typescript
/**
 * Beautiful diff rendering for file changes
 * @category UI
 */
export class DiffRenderer {
  /**
   * Render diff between two content strings
   * @param oldContent Original content
   * @param newContent New content
   * @param filename File name for display
   * @returns Formatted diff string
   */
  renderDiff(oldContent: string, newContent: string, filename: string): string;

  /**
   * Render unified diff
   * @param oldContent Original content
   * @param newContent New content
   * @param filename File name for display
   * @returns Formatted unified diff string
   */
  renderUnifiedDiff(oldContent: string, newContent: string, filename: string): string;

  /**
   * Render simple diff
   * @param oldContent Original content
   * @param newContent New content
   * @param filename File name for display
   * @returns Formatted simple diff string
   */
  renderSimpleDiff(oldContent: string, newContent: string, filename: string): string;

  /**
   * Render diff summary
   * @param oldContent Original content
   * @param newContent New content
   * @param filename File name for display
   * @returns Formatted summary string
   */
  renderSummary(oldContent: string, newContent: string, filename: string): string;

  /**
   * Render file creation
   * @param filename File name
   * @param content File content
   * @returns Formatted creation message
   */
  renderFileCreation(filename: string, content: string): string;

  /**
   * Render file deletion
   * @param filename File name
   * @returns Formatted deletion message
   */
  renderFileDeletion(filename: string): string;
}
```

**Usage Example:**
```typescript
const diffRenderer = new DiffRenderer();

// Render diff
const diff = diffRenderer.renderDiff(
  'const x = 1;',
  'const x = 2;',
  'example.js'
);
console.log(diff);

// Render summary
const summary = diffRenderer.renderSummary(oldContent, newContent, 'file.js');
```

### ApprovalPrompt

```typescript
/**
 * User interaction and approval prompts
 * @category UI
 */
export class ApprovalPrompt {
  /**
   * Ask for user approval
   * @param message Approval message
   * @returns Whether user approved
   */
  async askForApproval(message: string): Promise<boolean>;

  /**
   * Ask for confirmation with default
   * @param message Confirmation message
   * @param defaultValue Default value
   * @returns User confirmation
   */
  async askForConfirmation(message: string, defaultValue?: boolean): Promise<boolean>;

  /**
   * Ask for user input
   * @param message Input prompt
   * @param defaultValue Default value
   * @returns User input
   */
  async askForInput(message: string, defaultValue?: string): Promise<string>;

  /**
   * Ask user to choose from options
   * @param message Choice prompt
   * @param choices Available choices
   * @returns Selected choice index
   */
  async askForChoice(message: string, choices: string[]): Promise<number>;

  /**
   * Ask user to select multiple options
   * @param message Selection prompt
   * @param choices Available choices
   * @returns Array of selected choice indices
   */
  async askForMultipleChoice(message: string, choices: string[]): Promise<number[]>;

  /**
   * Ask for password input
   * @param message Password prompt
   * @returns Password string
   */
  async askForPassword(message: string): Promise<string>;

  /**
   * Close the prompt interface
   */
  close(): void;
}
```

**Usage Example:**
```typescript
const prompt = new ApprovalPrompt();

// Ask for approval
const approved = await prompt.askForApproval('Apply changes to file.js?');

// Ask for input
const input = await prompt.askForInput('Enter model name:', 'deepseek-coder:1.3b');

// Ask for choice
const choice = await prompt.askForChoice('Select action:', ['Edit', 'Delete', 'Cancel']);

// Close when done
prompt.close();
```

### ChatMode

```typescript
/**
 * Interactive chat mode interface
 * @category UI
 */
export class ChatMode {
  /**
   * Create chat mode
   * @param config Configuration manager
   */
  constructor(config: ConfigManager);

  /**
   * Start interactive chat session
   */
  async start(): Promise<void>;
}
```

**Usage Example:**
```typescript
const config = new ConfigManager();
const chat = new ChatMode(config);

// Start interactive chat
await chat.start();
```

## 📋 Command APIs

### InitCommand

```typescript
/**
 * Project initialization command
 * @category Commands
 */
export class InitCommand {
  /**
   * Run initialization
   */
  async run(): Promise<void>;
}
```

### ConfigCommand

```typescript
/**
 * Configuration management command
 * @category Commands
 */
export class ConfigCommand {
  /**
   * Configuration command options
   */
  interface ConfigOptions {
    set?: string;
    get?: string;
    list?: boolean;
  }

  /**
   * Run configuration command
   * @param options Command options
   */
  async run(options: ConfigOptions): Promise<void>;
}
```

**Usage Example:**
```typescript
// Initialize project
const initCmd = new InitCommand();
await initCmd.run();

// Manage configuration
const configCmd = new ConfigCommand();
await configCmd.run({ list: true });
await configCmd.run({ set: 'model deepseek-coder:6.7b' });
await configCmd.run({ get: 'endpoint' });
```

## 🚨 Error Handling

### Error Types

```typescript
/**
 * Base error class for AI CLI
 */
export class AICliError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AICliError';
  }
}

/**
 * Configuration-related errors
 */
export class ConfigError extends AICliError {
  constructor(message: string, details?: any) {
    super(message, 'CONFIG_ERROR', details);
    this.name = 'ConfigError';
  }
}

/**
 * LLM connection errors
 */
export class LLMError extends AICliError {
  constructor(message: string, details?: any) {
    super(message, 'LLM_ERROR', details);
    this.name = 'LLMError';
  }
}

/**
 * File operation errors
 */
export class FileError extends AICliError {
  constructor(message: string, details?: any) {
    super(message, 'FILE_ERROR', details);
    this.name = 'FileError';
  }
}

/**
 * Command execution errors
 */
export class CommandError extends AICliError {
  constructor(message: string, details?: any) {
    super(message, 'COMMAND_ERROR', details);
    this.name = 'CommandError';
  }
}

/**
 * Security-related errors
 */
export class SecurityError extends AICliError {
  constructor(message: string, details?: any) {
    super(message, 'SECURITY_ERROR', details);
    this.name = 'SecurityError';
  }
}
```

### Error Handling Patterns

```typescript
// Try-catch with specific error handling
try {
  const result = await llmClient.chatCompletion(messages);
  return result;
} catch (error) {
  if (error instanceof LLMError) {
    console.error('LLM Error:', error.message);
    // Handle LLM-specific error
  } else if (error instanceof NetworkError) {
    console.error('Network Error:', error.message);
    // Handle network error
  } else {
    console.error('Unknown Error:', error);
    // Handle unexpected error
  }
}

// Error propagation with context
async function processFile(filePath: string) {
  try {
    return await fileManager.readFile(filePath);
  } catch (error) {
    throw new FileError(
      `Failed to process file: ${filePath}`,
      { originalError: error, filePath }
    );
  }
}
```

## 💡 Examples

### Complete Usage Example

```typescript
import { ConfigManager } from './config/ConfigManager';
import { LLMClient } from './llm/LLMClient';
import { AgentLoop } from './agent/AgentLoop';
import { FileManager } from './tools/FileManager';
import { DiffRenderer } from './ui/DiffRenderer';

async function example() {
  // Initialize components
  const config = new ConfigManager();
  const llmClient = new LLMClient(
    config.getEndpoint(),
    config.getModel()
  );
  const fileManager = new FileManager();
  const diffRenderer = new DiffRenderer();

  // Test LLM connection
  const isConnected = await llmClient.testConnection();
  if (!isConnected) {
    throw new Error('Failed to connect to LLM');
  }

  // Initialize project
  await config.updateProjectContext(process.cwd());

  // Read file
  const content = await fileManager.readFile('src/example.ts');

  // Get AI suggestion
  const messages = [
    { role: 'system', content: 'You are a helpful coding assistant.' },
    { role: 'user', content: `Refactor this code:\n\n${content}` }
  ];

  const response = await llmClient.chatCompletion(messages);
  const suggestion = response.choices[0].message.content;

  // Show diff
  const diff = diffRenderer.renderDiff(content, suggestion, 'src/example.ts');
  console.log(diff);

  // Apply changes (with user approval)
  await fileManager.writeFile('src/example.ts', suggestion);
}

// Run example
example().catch(console.error);
```

### Integration Example

```typescript
// Custom tool integration
class CustomTool {
  constructor(
    private fileManager: FileManager,
    private shellExecutor: ShellExecutor
  ) {}

  async runTests(): Promise<CommandResult> {
    // Check if test file exists
    const hasTests = await this.fileManager.fileExists('package.json');
    if (!hasTests) {
      throw new Error('No package.json found');
    }

    // Run tests
    return this.shellExecutor.execute('npm test', process.cwd());
  }
}

// Use in agent
class CustomAgent extends AgentLoop {
  private customTool: CustomTool;

  constructor(config: ConfigManager, options?: AgentOptions) {
    super(config, options);
    this.customTool = new CustomTool(
      this.fileManager,
      this.shellExecutor
    );
  }

  async runWithTests(prompt: string) {
    // Run normal agent
    await this.run(prompt);

    // Run tests afterwards
    const testResult = await this.customTool.runTests();
    if (!testResult.success) {
      console.error('Tests failed:', testResult.stderr);
    }
  }
}
```

---

**API Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatibility**: Node.js 22+, TypeScript 5.3+ 