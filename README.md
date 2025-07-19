# 🤖 Simpleton CLI - Local AI-Powered Coding Agent

A **100% local** AI-powered coding agent CLI that runs entirely on your machine with local LLMs (like Ollama). No API keys, no cloud calls, just pure local AI coding assistance!

[![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## ✨ Features

- **🔒 100% Local** - No API keys or cloud dependencies
- **🧠 Local LLM Integration** - Works with Ollama, LiteLLM, or any OpenAI-compatible endpoint
- **📁 Project Context Awareness** - Auto-indexes your project files and git status
- **💬 Interactive Chat Mode** - REPL-style conversation with your AI assistant
- **🔧 Smart Code Editing** - Suggests, auto-edits, or full-auto modes
- **🛡️ Safe Execution** - Sandboxed shell commands with approval prompts
- **📊 Beautiful Diffs** - Colored diffs for all file changes
- **⚙️ Flexible Configuration** - Easy setup and customization

## 🚀 Quick Start

### Prerequisites

- **Node.js 22+** - [Download here](https://nodejs.org/)
- **Ollama** (optional) - [Install here](https://ollama.com/)

> **⚠️ Windows Users**: If you get "'npm' is not recognized" error, see the [Windows Setup Guide](#-windows-setup-guide) below!

### Installation

#### For Windows Users (Easy Way)
```cmd
# Clone the repository
git clone https://github.com/AfyKirby1/Simpleton-CLI.git
cd Simpleton-CLI

# Choose one of these installer scripts:

# Option 1: Full-featured installer (recommended)
install-windows.bat

# Option 2: Verbose installer (shows detailed progress)
install-windows-verbose.bat

# Option 3: Simple installer (if others have issues)
install-windows-simple.bat
```

#### For All Platforms
```bash
# Clone the repository
git clone https://github.com/AfyKirby1/Simpleton-CLI.git
cd Simpleton-CLI

# Install dependencies
npm install

# Build the project
npm run build

# Link globally (optional)
npm link
```

## 🪟 Windows Setup Guide

### Step 1: Install Node.js Properly

1. **Download Node.js** from [nodejs.org](https://nodejs.org/) 
2. **Choose the LTS version** (recommended for most users)
3. **Run the installer** with these important options:
   - ✅ **Check "Add to PATH"** during installation
   - ✅ **Check "Automatically install necessary tools"**
4. **Restart your command prompt/PowerShell** after installation

### Step 2: Verify Installation

Open a **new** Command Prompt or PowerShell window and run:

```cmd
node --version
npm --version
```

You should see version numbers like:
```
v22.x.x
10.x.x
```

### Step 3: Install the CLI

```cmd
# Clone the repository
git clone https://github.com/AfyKirby1/Simpleton-CLI.git
cd Simpleton-CLI

# Install dependencies
npm install

# Build the project
npm run build
```

### Step 4: Use the Easy Launcher

For Windows users, we provide easy-to-use batch files:

```cmd
# Double-click this file in File Explorer:
launch-ai-cli.bat

# Or from command line:
.\launch-ai-cli.bat
```

### Windows Troubleshooting

**❌ "'npm' is not recognized as an internal or external command"**

**Solution 1**: Reinstall Node.js
1. Uninstall Node.js from Control Panel
2. Download fresh installer from [nodejs.org](https://nodejs.org/)
3. ✅ **Make sure to check "Add to PATH"** during installation
4. Restart your computer
5. Open new Command Prompt and try `npm --version`

**Solution 2**: Manual PATH Fix
1. Search for "Environment Variables" in Windows
2. Click "Environment Variables" button
3. In "System Variables", find and select "Path"
4. Click "Edit" and add these paths:
   - `C:\Program Files\nodejs\`
   - `C:\Users\[YourUsername]\AppData\Roaming\npm`
5. Click OK and restart Command Prompt

**Solution 3**: Use Node.js Command Prompt
1. Search for "Node.js Command Prompt" in Start Menu
2. Run installation commands from there

**❌ "Permission denied" or access errors**

Run Command Prompt as Administrator:
1. Right-click Command Prompt
2. Select "Run as administrator"
3. Try the installation again

### Setup Ollama (Recommended)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull a coding model (recommended for 8GB RAM systems)
ollama pull deepseek-coder:1.3b-q4_K_M

# Start Ollama
ollama serve &
```

### Configuration

```bash
# Set your local endpoint
npx ts-node src/index.ts config --set endpoint http://localhost:11434/v1

# Set your model
npx ts-node src/index.ts config --set model deepseek-coder:1.3b-q4_K_M

# Verify configuration
npx ts-node src/index.ts config --list
```

### Initialize a Project

```bash
cd ~/my-project
npx ts-node ../Simpleton-CLI/src/index.ts init
```

### Quick Model Setup with Ollama

```bash
# Install Ollama (if not already installed)
# Visit: https://ollama.com/

# Quick setup - Downloads Mistral 7B and configures everything
node dist/index.js ollama --setup

# Or browse available models first
node dist/index.js ollama --available

# Or use the launcher menu (Option 8: Ollama Models)
./launch-ai-cli.bat
```

### Start Coding with AI!

```bash
# Ask the AI to help with your code
node dist/index.js "refactor this authentication to use JWT"

# Start interactive chat mode
node dist/index.js chat

# Get suggestions only (no changes applied)
node dist/index.js --suggest "add error handling to this function"

# Auto-apply changes
node dist/index.js --auto-edit "fix the linting issues"
```

## 📋 Usage Examples

### Basic Commands

```bash
# Help with a specific task
node dist/index.js "create a React component for user profile"

# Interactive chat mode
node dist/index.js chat

# Initialize project context
node dist/index.js init

# Manage configuration
node dist/index.js config --list
node dist/index.js config --set model mistral:7b

# Manage Ollama models
node dist/index.js ollama --setup        # Quick setup with Mistral 7B
node dist/index.js ollama --available    # Show available models
node dist/index.js ollama --list         # List installed models
```

### Advanced Usage

```bash
# Suggest mode - see what the AI would change
node dist/index.js --suggest "optimize this database query"

# Auto-edit mode - apply changes with confirmation
node dist/index.js --auto-edit "add TypeScript types to this file"

# Full-auto mode - apply all changes automatically (use with caution)
node dist/index.js --full-auto "run the test suite and fix any failures"
```

## 🏗️ Architecture

The Simpleton CLI is built with a modular TypeScript architecture:

```
src/
├── index.ts              # Main CLI entry point
├── config/               # Configuration management
│   └── ConfigManager.ts
├── agent/                # AI agent logic
│   └── AgentLoop.ts
├── llm/                  # LLM client integration
│   └── LLMClient.ts
├── tools/                # File and shell operations
│   ├── FileManager.ts
│   └── ShellExecutor.ts
├── ui/                   # User interface components
│   ├── ChatMode.ts
│   ├── DiffRenderer.ts
│   └── ApprovalPrompt.ts
└── commands/             # CLI commands
    ├── InitCommand.ts
    └── ConfigCommand.ts
```

## 🔧 Configuration

### Available Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `endpoint` | `http://localhost:11434/v1` | LLM API endpoint |
| `model` | `deepseek-coder:1.3b-q4_K_M` | LLM model name |
| `autoApprove` | `false` | Auto-approve changes |
| `suggestOnly` | `false` | Only suggest changes |
| `fullAuto` | `false` | Full automatic mode |

### Configuration Commands

```bash
# List all settings
npx ts-node src/index.ts config --list

# Set a value
npx ts-node src/index.ts config --set model deepseek-coder:6.7b-q4_K_M

# Get a value
npx ts-node src/index.ts config --get endpoint
```

## 🧠 Supported Models

### Recommended for Different Hardware

| Model | Size | RAM Needed | Speed | Best For |
|-------|------|------------|-------|----------|
| `mistral:7b` ⭐ | 4.1GB | ~8GB | 8-15 t/s | **Recommended** - Excellent coding & general use |
| `deepseek-coder:1.3b-q4_K_M` | 0.8GB | ~2GB | 15-25 t/s | Lightweight systems |
| `deepseek-coder:6.7b-q4_K_M` | 3.7GB | ~8GB | 6-10 t/s | High-quality coding |
| `codellama:7b-q4_K_M` | 3.8GB | ~8GB | 8-12 t/s | Meta's specialized code model |
| `codegemma:2b-q4_K_M` | 1.6GB | ~4GB | 12-18 t/s | Google's lightweight coding |

### Setting up with Ollama

```bash
# Quick setup (recommended) - downloads Mistral 7B and configures everything
node dist/index.js ollama --setup

# Or manually:
# Pull a model
ollama pull mistral:7b

# Test the model
ollama run mistral:7b "Write a Python function"

# Configure the CLI to use it
node dist/index.js config --set model mistral:7b
```

## 🛡️ Security & Privacy

- **🔒 All prompts stay on localhost** - No data leaves your machine
- **📁 File writes are sandboxed** - Limited to project root
- **⚡ Safe command execution** - Allow-listed commands only
- **🛡️ Git protection** - Warns if directory isn't tracked by git

## 🚀 Development

### Building from Source

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

- **TypeScript** for type safety
- **Modular architecture** for easy extension
- **Comprehensive error handling**
- **Beautiful terminal UI** with colors and emojis
- **Streaming responses** for real-time feedback

## 📚 Documentation

- **[API Documentation](docs/API.md)** - Complete API reference
- **[Architecture Guide](docs/ARCHITECTURE.md)** - System design and data flow
- **[Contributing Guide](docs/CONTRIBUTING.md)** - Development guidelines
- **[Examples](docs/EXAMPLES.md)** - Usage examples and tutorials
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Installation and distribution
- **[Changelog](CHANGELOG.md)** - Version history and updates

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Claude Code and Codex CLI
- Built with Ollama for local LLM hosting
- Uses OpenAI-compatible API for maximum compatibility

## 🆘 Troubleshooting

### Windows-Specific Issues

**❌ "'npm' is not recognized as an internal or external command"**
- **Solution**: Node.js is not properly installed or not in PATH
- **Fix**: Follow the [Windows Setup Guide](#-windows-setup-guide) above
- **Quick Fix**: Use the `install-windows.bat` or `install-windows-simple.bat` script included in this repo

**❌ "'node' is not recognized as an internal or external command"**
- **Solution**: Same as npm issue - Node.js not in PATH
- **Fix**: Reinstall Node.js and check "Add to PATH" option

**❌ "Permission denied" or "EPERM" errors**
- **Solution**: Run Command Prompt as Administrator
- **Alternative**: Install in a folder you have write access to

**❌ "npm ERR! code EACCES"**
- **Solution**: Permission issue with npm global folder
- **Fix**: Run `npm install --no-optional` or use Administrator

**❌ PowerShell execution policy errors**
- **Solution**: Change execution policy
- **Fix**: Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

**❌ Windows installer script hangs or shows weird characters**
- **Solution**: Try a different installer script
- **Fix**: Run `install-windows-verbose.bat` (shows detailed progress) or `install-windows-simple.bat` (minimal version)
- **Alternative**: Copy and paste commands manually from the Quick Start guide

### Common Issues

**"Failed to connect to LLM endpoint"**
- Make sure Ollama is running: `ollama serve`
- Check the endpoint URL: `npx ts-node src/index.ts config --get endpoint`
- Verify the model is installed: `ollama list`

**"Command not allowed"**
- The CLI uses a safe allow-list for commands
- Check available commands in the ShellExecutor
- Use `--suggest` mode to see what would be executed

**"Project not initialized"**
- Run `npx ts-node src/index.ts init` in your project directory
- Make sure you're in a git repository or have project files

### Getting Help

- Check the configuration: `npx ts-node src/index.ts config --list`
- Try interactive mode: `npx ts-node src/index.ts chat`
- Review the logs for detailed error messages
- Check the [documentation](docs/) for detailed guides

---

**Happy coding with AI! 🚀**

---

<div align="center">
  <p>Made with ❤️ for the local AI community</p>
  <p>
    <a href="https://github.com/AfyKirby1/Simpleton-CLI/stargazers">
      <img alt="GitHub stars" src="https://img.shields.io/github/stars/AfyKirby1/Simpleton-CLI?style=social">
    </a>
    <a href="https://github.com/AfyKirby1/Simpleton-CLI/forks">
      <img alt="GitHub forks" src="https://img.shields.io/github/forks/AfyKirby1/Simpleton-CLI?style=social">
    </a>
  </p>
</div> 