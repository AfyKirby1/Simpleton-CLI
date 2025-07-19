# 🤝 Contributing to AI CLI

Welcome to the AI CLI project! We're excited to have you contribute to building the best local AI coding agent. This guide will help you get started and ensure your contributions align with our project standards.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Project Structure](#project-structure)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Documentation Standards](#documentation-standards)
7. [Contribution Workflow](#contribution-workflow)
8. [Code Review Process](#code-review-process)
9. [Security Guidelines](#security-guidelines)
10. [Performance Guidelines](#performance-guidelines)

## 🚀 Getting Started

### Prerequisites

- **Node.js 22+** - Latest LTS version recommended
- **TypeScript 5.3+** - For type safety and modern features
- **Git** - For version control
- **Ollama** - For local LLM testing (optional but recommended)

### Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/yourusername/ai-cli.git
cd ai-cli

# Add upstream remote
git remote add upstream https://github.com/originalowner/ai-cli.git
```

### Initial Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Check linting
npm run lint

# Format code
npm run format
```

## 🛠️ Development Environment

### Required Tools

1. **Editor/IDE**: VS Code recommended with extensions:
   - TypeScript and JavaScript Language Features
   - ESLint
   - Prettier
   - GitLens
   - Error Lens

2. **Node.js Setup**:
   ```bash
   # Check versions
   node --version  # Should be 22+
   npm --version   # Should be 10+
   ```

3. **Development Commands**:
   ```bash
   # Development mode (watch for changes)
   npm run dev

   # Build and test
   npm run build && npm test

   # Generate documentation
   npm run docs:generate

   # Serve documentation locally
   npm run docs:serve
   ```

### Environment Variables

Create a `.env` file for local development:

```bash
# Optional: Override default LLM settings
AI_CLI_ENDPOINT=http://localhost:11434/v1
AI_CLI_MODEL=deepseek-coder:1.3b-q4_K_M
AI_CLI_DEBUG=true
```

## 🏗️ Project Structure

Understanding the project architecture is crucial for effective contributions:

```
ai-cli/
├── src/                    # Source code
│   ├── index.ts           # Main CLI entry point
│   ├── config/            # Configuration management
│   ├── agent/             # AI agent logic
│   ├── llm/               # LLM client integration
│   ├── tools/             # File and shell operations
│   ├── ui/                # User interface components
│   └── commands/          # CLI commands
├── docs/                  # Documentation
│   ├── API.md             # API documentation
│   ├── ARCHITECTURE.md    # System architecture
│   └── EXAMPLES.md        # Usage examples
├── tests/                 # Test files
├── scripts/               # Build and utility scripts
└── dist/                  # Compiled output
```

### Module Responsibilities

| Module | Purpose | Key Classes |
|--------|---------|-------------|
| **config/** | Settings & project context | ConfigManager |
| **llm/** | AI communication | LLMClient |
| **agent/** | Task orchestration | AgentLoop |
| **tools/** | File & shell operations | FileManager, ShellExecutor |
| **ui/** | User interaction | ChatMode, DiffRenderer, ApprovalPrompt |
| **commands/** | CLI commands | InitCommand, ConfigCommand |

## 📝 Coding Standards

### TypeScript Guidelines

1. **Type Safety First**
   ```typescript
   // ✅ Good: Explicit types
   interface UserConfig {
     endpoint: string;
     model: string;
     timeout: number;
   }

   // ❌ Bad: Any types
   function processConfig(config: any): any {
     return config;
   }

   // ✅ Good: Proper types
   function processConfig(config: UserConfig): ProcessedConfig {
     return {
       ...config,
       processed: true
     };
   }
   ```

2. **Async/Await Over Promises**
   ```typescript
   // ✅ Good: async/await
   async function readFile(path: string): Promise<string> {
     try {
       return await fs.readFile(path, 'utf-8');
     } catch (error) {
       throw new FileError(`Failed to read ${path}`, error);
     }
   }

   // ❌ Bad: Promise chains
   function readFile(path: string): Promise<string> {
     return fs.readFile(path, 'utf-8')
       .then(content => content)
       .catch(error => {
         throw new FileError(`Failed to read ${path}`, error);
       });
   }
   ```

3. **Error Handling**
   ```typescript
   // ✅ Good: Specific error types
   export class ValidationError extends Error {
     constructor(
       message: string,
       public field: string,
       public value: any
     ) {
       super(message);
       this.name = 'ValidationError';
     }
   }

   // ✅ Good: Comprehensive error handling
   async function validateConfig(config: Config): Promise<void> {
     if (!config.endpoint) {
       throw new ValidationError(
         'Endpoint is required',
         'endpoint',
         config.endpoint
       );
     }

     if (!isValidUrl(config.endpoint)) {
       throw new ValidationError(
         'Endpoint must be a valid URL',
         'endpoint',
         config.endpoint
       );
     }
   }
   ```

### Code Organization

1. **File Structure**
   ```typescript
   // File: src/tools/FileManager.ts

   // 1. Imports (external first, then internal)
   import * as fs from 'fs-extra';
   import * as path from 'path';
   import { glob } from 'glob';

   import { SecurityError } from '../errors/SecurityError';
   import { FileError } from '../errors/FileError';

   // 2. Types and interfaces
   export interface FileStats {
     size: number;
     modified: Date;
     isDirectory: boolean;
   }

   // 3. Main class
   export class FileManager {
     // Public methods first
     // Private methods last
   }

   // 4. Helper functions (if any)
   function isPathSafe(filePath: string): boolean {
     // Implementation
   }
   ```

2. **Class Design**
   ```typescript
   export class LLMClient {
     // 1. Private properties
     private client: AxiosInstance;
     private endpoint: string;
     private model: string;

     // 2. Constructor
     constructor(endpoint: string, model: string) {
       this.endpoint = endpoint;
       this.model = model;
       this.client = this.createClient();
     }

     // 3. Public methods (alphabetical order)
     async chatCompletion(messages: ChatMessage[]): Promise<Response> {
       // Implementation
     }

     getEndpoint(): string {
       return this.endpoint;
     }

     async testConnection(): Promise<boolean> {
       // Implementation
     }

     // 4. Private methods (alphabetical order)
     private createClient(): AxiosInstance {
       // Implementation
     }

     private validateMessages(messages: ChatMessage[]): void {
       // Implementation
     }
   }
   ```

### Naming Conventions

1. **Files and Directories**
   - Use PascalCase for class files: `ConfigManager.ts`
   - Use camelCase for utility files: `fileUtils.ts`
   - Use kebab-case for documentation: `quick-start.md`

2. **Variables and Functions**
   ```typescript
   // ✅ Good: Descriptive names
   const llmClient = new LLMClient(endpoint, model);
   const projectContext = await configManager.getProjectContext(projectPath);

   // ❌ Bad: Abbreviated names
   const client = new LLMClient(ep, mdl);
   const ctx = await cfg.getCtx(path);

   // ✅ Good: Function names are verbs
   async function validateConfiguration(config: Config): Promise<void>
   async function parseAgentResponse(response: string): Promise<ParsedResponse>

   // ❌ Bad: Function names are nouns
   async function configuration(config: Config): Promise<void>
   async function response(response: string): Promise<ParsedResponse>
   ```

3. **Constants**
   ```typescript
   // ✅ Good: SCREAMING_SNAKE_CASE for constants
   const DEFAULT_TIMEOUT = 30000;
   const MAX_RETRY_ATTEMPTS = 3;
   const SUPPORTED_FILE_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx'];

   // ✅ Good: Enum for related constants
   enum CommandType {
     READ_FILE = 'READ_FILE',
     WRITE_FILE = 'WRITE_FILE',
     EXECUTE = 'EXECUTE',
     LIST_FILES = 'LIST_FILES'
   }
   ```

### Documentation Standards

1. **JSDoc Comments**
   ```typescript
   /**
    * Manages application configuration and project contexts
    * 
    * Provides persistent storage for user settings and maintains
    * project-specific contexts including file lists and git status.
    * 
    * @example
    * ```typescript
    * const config = new ConfigManager();
    * config.set('model', 'deepseek-coder:1.3b');
    * await config.updateProjectContext('/path/to/project');
    * ```
    */
   export class ConfigManager {
     /**
      * Get configuration value by key
      * 
      * @param key - Configuration key to retrieve
      * @returns The configuration value, or undefined if not found
      * 
      * @example
      * ```typescript
      * const endpoint = config.get('endpoint');
      * const model = config.get('model');
      * ```
      */
     get(key: string): any {
       return this.config.get(key);
     }

     /**
      * Update project context by scanning files and git status
      * 
      * This method scans the project directory for relevant files,
      * checks git status, and caches the context for future use.
      * 
      * @param projectPath - Absolute path to project root
      * @throws {SecurityError} When path is outside allowed directories
      * @throws {FileError} When directory cannot be accessed
      * 
      * @example
      * ```typescript
      * try {
      *   await config.updateProjectContext('/home/user/myproject');
      *   console.log('Project context updated successfully');
      * } catch (error) {
      *   console.error('Failed to update context:', error.message);
      * }
      * ```
      */
     async updateProjectContext(projectPath: string): Promise<void> {
       // Implementation
     }
   }
   ```

2. **Inline Comments**
   ```typescript
   export class ShellExecutor {
     private async execute(command: string, workingDirectory: string): Promise<CommandResult> {
       // Security validation - ensure command is in allow-list
       if (!this.isCommandAllowed(command)) {
         throw new SecurityError(`Command not allowed: ${command}`);
       }

       // Path safety check - prevent directory traversal
       const normalizedPath = path.resolve(workingDirectory);
       if (!this.isPathSafe(normalizedPath, workingDirectory)) {
         throw new SecurityError(`Unsafe path detected: ${workingDirectory}`);
       }

       try {
         // Execute with resource limits for security
         const result = await execa(command, {
           shell: true,
           cwd: workingDirectory,
           timeout: 30000,        // 30 second timeout
           maxBuffer: 1024 * 1024 // 1MB buffer limit
         });

         return {
           success: true,
           stdout: result.stdout,
           stderr: result.stderr,
           exitCode: result.exitCode,
           command
         };
       } catch (error) {
         // Handle execution errors gracefully
         if (error && typeof error === 'object' && 'stdout' in error) {
           const execaError = error as ExecaError;
           return {
             success: false,
             stdout: execaError.stdout || '',
             stderr: execaError.stderr || '',
             exitCode: execaError.exitCode || 1,
             command
           };
         }
         
         throw new CommandError(`Failed to execute command: ${error}`);
       }
     }
   }
   ```

## 🧪 Testing Guidelines

### Test Structure

1. **Test File Organization**
   ```
   tests/
   ├── unit/                  # Unit tests
   │   ├── config/
   │   │   └── ConfigManager.test.ts
   │   ├── llm/
   │   │   └── LLMClient.test.ts
   │   └── tools/
   │       ├── FileManager.test.ts
   │       └── ShellExecutor.test.ts
   ├── integration/           # Integration tests
   │   ├── agent/
   │   │   └── AgentLoop.test.ts
   │   └── cli/
   │       └── commands.test.ts
   └── fixtures/              # Test data
       ├── sample-projects/
       └── mock-responses/
   ```

2. **Test Naming Convention**
   ```typescript
   describe('ConfigManager', () => {
     describe('get()', () => {
       it('should return default value for endpoint', () => {
         // Test implementation
       });

       it('should return undefined for non-existent key', () => {
         // Test implementation
       });
     });

     describe('updateProjectContext()', () => {
       it('should scan files and update context successfully', async () => {
         // Test implementation
       });

       it('should throw SecurityError for path outside project root', async () => {
         // Test implementation
       });
     });
   });
   ```

3. **Test Implementation**
   ```typescript
   // ConfigManager.test.ts
   import { ConfigManager } from '../../src/config/ConfigManager';
   import { SecurityError } from '../../src/errors/SecurityError';

   describe('ConfigManager', () => {
     let configManager: ConfigManager;

     beforeEach(() => {
       configManager = new ConfigManager();
     });

     afterEach(() => {
       // Cleanup if needed
     });

     describe('get()', () => {
       it('should return default endpoint value', () => {
         const endpoint = configManager.get('endpoint');
         expect(endpoint).toBe('http://localhost:11434/v1');
       });

       it('should return custom value after set', () => {
         configManager.set('model', 'custom-model');
         const model = configManager.get('model');
         expect(model).toBe('custom-model');
       });
     });

     describe('updateProjectContext()', () => {
       it('should update context for valid project path', async () => {
         const projectPath = '/tmp/test-project';
         
         // Mock file system operations
         jest.spyOn(fs, 'existsSync').mockReturnValue(true);
         jest.spyOn(fs, 'readdirSync').mockReturnValue(['file1.js', 'file2.ts']);

         await configManager.updateProjectContext(projectPath);
         
         const context = configManager.getProjectContext(projectPath);
         expect(context).toBeDefined();
         expect(context?.files).toContain('file1.js');
       });

       it('should throw SecurityError for dangerous path', async () => {
         const dangerousPath = '/etc/passwd';
         
         await expect(
           configManager.updateProjectContext(dangerousPath)
         ).rejects.toThrow(SecurityError);
       });
     });
   });
   ```

### Mocking Guidelines

1. **External Dependencies**
   ```typescript
   // Mock external modules
   jest.mock('axios');
   jest.mock('fs-extra');
   jest.mock('execa');

   const mockedAxios = axios as jest.Mocked<typeof axios>;
   const mockedFs = fs as jest.Mocked<typeof fs>;
   ```

2. **LLM Client Mocking**
   ```typescript
   // Mock LLM responses
   const mockLLMResponse = {
     id: 'test-id',
     object: 'chat.completion',
     created: Date.now(),
     model: 'test-model',
     choices: [{
       index: 0,
       message: {
         role: 'assistant',
         content: 'Test response from LLM'
       },
       finish_reason: 'stop'
     }],
     usage: {
       prompt_tokens: 10,
       completion_tokens: 5,
       total_tokens: 15
     }
   };

   beforeEach(() => {
     mockedAxios.post.mockResolvedValue({ data: mockLLMResponse });
   });
   ```

## 📚 Documentation Standards

### README Guidelines

1. **Keep README concise** - Focus on getting started quickly
2. **Use badges** for build status, version, license
3. **Include live examples** that users can copy-paste
4. **Link to detailed docs** in the docs/ directory

### API Documentation

1. **Use TypeScript interfaces** for all public APIs
2. **Include usage examples** for each major function
3. **Document error conditions** and how to handle them
4. **Keep examples realistic** and test them regularly

### Architecture Documentation

1. **Include diagrams** using Mermaid or ASCII art
2. **Explain design decisions** and trade-offs made
3. **Document security considerations** for each component
4. **Keep it up-to-date** with code changes

## 🔄 Contribution Workflow

### Branch Strategy

1. **Main Branch**: `main` - Production-ready code
2. **Feature Branches**: `feature/description` - New features
3. **Bug Fix Branches**: `fix/description` - Bug fixes
4. **Documentation**: `docs/description` - Documentation updates

### Commit Guidelines

1. **Commit Message Format**
   ```
   <type>(<scope>): <description>

   [optional body]

   [optional footer]
   ```

2. **Types**
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation changes
   - `style`: Code style changes (formatting, etc.)
   - `refactor`: Code refactoring
   - `test`: Adding or updating tests
   - `chore`: Build process or auxiliary tool changes

3. **Examples**
   ```bash
   git commit -m "feat(llm): add streaming support for chat completion"
   git commit -m "fix(config): handle missing config file gracefully"
   git commit -m "docs(api): add examples for FileManager methods"
   git commit -m "refactor(agent): extract response parsing to separate module"
   ```

### Pull Request Process

1. **Before Creating PR**
   ```bash
   # Update your branch
   git fetch upstream
   git rebase upstream/main

   # Run all checks
   npm run build
   npm test
   npm run lint
   ```

2. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing completed

   ## Checklist
   - [ ] Code follows project style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No new lint warnings
   ```

3. **Review Process**
   - At least one maintainer approval required
   - All CI checks must pass
   - Address all review comments
   - Squash commits before merge (if requested)

## 🛡️ Security Guidelines

### Security-First Development

1. **Input Validation**
   ```typescript
   // ✅ Good: Validate all inputs
   function validateFilePath(filePath: string): void {
     if (!filePath || typeof filePath !== 'string') {
       throw new ValidationError('File path must be a non-empty string');
     }

     if (filePath.includes('..')) {
       throw new SecurityError('Path traversal detected');
     }

     if (path.isAbsolute(filePath) && !filePath.startsWith(process.cwd())) {
       throw new SecurityError('Access outside project directory denied');
     }
   }
   ```

2. **Command Execution**
   ```typescript
   // ✅ Good: Use allow-lists for commands
   private readonly ALLOWED_COMMANDS = new Set([
     'npm', 'yarn', 'git', 'node', 'ls', 'cat', 'grep'
   ]);

   private isCommandAllowed(command: string): boolean {
     const baseCommand = command.split(' ')[0];
     return this.ALLOWED_COMMANDS.has(baseCommand);
   }
   ```

3. **Data Sanitization**
   ```typescript
   // ✅ Good: Sanitize output before display
   function sanitizeOutput(output: string): string {
     return output
       .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
       .replace(/\x1B\[[0-9;]*m/g, '')  // Remove ANSI escape codes
       .trim();
   }
   ```

### Security Checklist

- [ ] All user inputs validated
- [ ] No eval() or Function() constructor usage
- [ ] File operations limited to project directory
- [ ] Commands executed through allow-lists only
- [ ] No sensitive data in logs
- [ ] Error messages don't leak system information
- [ ] Dependencies regularly updated for security patches

## ⚡ Performance Guidelines

### Performance Best Practices

1. **Async Operations**
   ```typescript
   // ✅ Good: Parallel operations
   async function processMultipleFiles(filePaths: string[]): Promise<string[]> {
     const promises = filePaths.map(path => this.readFile(path));
     return Promise.all(promises);
   }

   // ❌ Bad: Sequential operations
   async function processMultipleFiles(filePaths: string[]): Promise<string[]> {
     const results = [];
     for (const path of filePaths) {
       results.push(await this.readFile(path));
     }
     return results;
   }
   ```

2. **Memory Management**
   ```typescript
   // ✅ Good: Stream large files
   async function processLargeFile(filePath: string): Promise<void> {
     const stream = fs.createReadStream(filePath);
     const lineReader = readline.createInterface({ input: stream });

     for await (const line of lineReader) {
       await this.processLine(line);
     }
   }

   // ❌ Bad: Load entire file into memory
   async function processLargeFile(filePath: string): Promise<void> {
     const content = await fs.readFile(filePath, 'utf-8');
     const lines = content.split('\n');
     for (const line of lines) {
       await this.processLine(line);
     }
   }
   ```

3. **Caching Strategy**
   ```typescript
   export class ConfigManager {
     private contextCache = new Map<string, ProjectContext>();
     private cacheTimeout = 5 * 60 * 1000; // 5 minutes

     async getProjectContext(projectPath: string): Promise<ProjectContext> {
       const cached = this.contextCache.get(projectPath);
       
       if (cached && this.isCacheValid(cached)) {
         return cached;
       }

       const context = await this.buildProjectContext(projectPath);
       this.contextCache.set(projectPath, context);
       return context;
     }
   }
   ```

### Performance Checklist

- [ ] Avoid synchronous I/O operations
- [ ] Use streaming for large files
- [ ] Implement appropriate caching
- [ ] Minimize memory allocations in loops
- [ ] Use connection pooling for HTTP requests
- [ ] Profile performance-critical paths
- [ ] Set resource limits (timeouts, memory)

## 🎯 Code Review Guidelines

### What to Look For

1. **Code Quality**
   - [ ] Follows TypeScript best practices
   - [ ] Proper error handling
   - [ ] No code duplication
   - [ ] Meaningful variable names
   - [ ] Appropriate abstractions

2. **Security**
   - [ ] Input validation present
   - [ ] No hardcoded secrets
   - [ ] Safe file operations
   - [ ] Command execution is controlled

3. **Performance**
   - [ ] No obvious performance issues
   - [ ] Appropriate use of async/await
   - [ ] Memory usage considerations
   - [ ] Proper resource cleanup

4. **Testing**
   - [ ] Adequate test coverage
   - [ ] Tests are meaningful
   - [ ] Edge cases covered
   - [ ] Mocks are appropriate

5. **Documentation**
   - [ ] Public APIs documented
   - [ ] Complex logic explained
   - [ ] Examples provided where helpful
   - [ ] README updated if needed

### Review Etiquette

1. **Be Constructive**
   - Explain the "why" behind suggestions
   - Offer alternatives and solutions
   - Acknowledge good practices
   - Be specific in feedback

2. **Be Respectful**
   - Focus on code, not the person
   - Use collaborative language ("we could", "let's try")
   - Ask questions to understand reasoning
   - Appreciate the effort made

3. **Be Thorough but Efficient**
   - Review the entire PR carefully
   - Don't nitpick on style if tools handle it
   - Focus on logic, security, and design
   - Approve when ready, don't over-review

## 🏷️ Release Process

### Version Management

We follow [Semantic Versioning](https://semver.org/):
- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features, backward compatible
- **Patch** (0.0.1): Bug fixes, backward compatible

### Release Checklist

1. **Pre-Release**
   - [ ] All tests passing
   - [ ] Documentation updated
   - [ ] CHANGELOG.md updated
   - [ ] Version bumped in package.json
   - [ ] Security audit completed

2. **Release**
   - [ ] Create release branch
   - [ ] Final testing on release branch
   - [ ] Merge to main
   - [ ] Tag release
   - [ ] Publish to npm (if applicable)

3. **Post-Release**
   - [ ] Monitor for issues
   - [ ] Update documentation site
   - [ ] Announce release
   - [ ] Close milestone

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussion
- **Documentation**: Check docs/ directory first
- **Code Examples**: See examples/ directory

### Maintainer Contact

For security issues or urgent matters, contact maintainers directly through GitHub.

---

Thank you for contributing to AI CLI! Your efforts help make local AI coding assistance accessible to everyone. 🚀

**Guide Version**: 1.0.0  
**Last Updated**: December 2024  
**Next Review**: Q1 2025 