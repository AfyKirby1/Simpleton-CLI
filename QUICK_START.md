# 🚀 AI CLI Quick Start Guide

## ⚡ Get Running in 5 Minutes

### 1. Build the CLI
```bash
npm install
npm run build
```

### 2. Set up Ollama (if you haven't)
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull a coding model (recommended for 8GB RAM)
ollama pull deepseek-coder:1.3b-q4_K_M

# Start Ollama
ollama serve &
```

### 3. Configure the CLI
```bash
# Set your local endpoint
node dist/index.js config --set endpoint http://localhost:11434/v1

# Set your model
node dist/index.js config --set model deepseek-coder:1.3b-q4_K_M

# Verify configuration
node dist/index.js config --list
```

### 4. Initialize your project
```bash
cd ~/your-project
node dist/index.js init
```

### 5. Start coding with AI!
```bash
# Ask for help
node dist/index.js "refactor this authentication to use JWT"

# Interactive chat
node dist/index.js chat

# Get suggestions only
node dist/index.js --suggest "add error handling to this function"
```

## 🎯 Example Commands

```bash
# Basic help
node dist/index.js "create a React component for user profile"

# Interactive mode
node dist/index.js chat

# Project initialization
node dist/index.js init

# Configuration
node dist/index.js config --list
node dist/index.js config --set model deepseek-coder:6.7b-q4_K_M
```

## 🔧 Available Modes

- **Default**: Shows changes and asks for approval
- **--suggest**: Only shows what would be changed
- **--auto-edit**: Applies changes with confirmation
- **--full-auto**: Applies all changes automatically (use with caution)

## 🧠 Model Recommendations

| RAM | Model | Speed | Quality |
|-----|-------|-------|---------|
| 8GB | `deepseek-coder:1.3b-q4_K_M` | Fast | Good |
| 16GB+ | `deepseek-coder:6.7b-q4_K_M` | Medium | Better |
| 32GB+ | `codellama:13b-q4_K_M` | Slow | Best |

## 🆘 Troubleshooting

**"Failed to connect to LLM endpoint"**
- Make sure Ollama is running: `ollama serve`
- Check endpoint: `node dist/index.js config --get endpoint`

**"Command not allowed"**
- The CLI uses safe allow-lists
- Use `--suggest` mode to see what would be executed

**"Project not initialized"**
- Run `node dist/index.js init` in your project directory

## 🎉 You're Ready!

Your AI CLI is now ready to help you code! Try asking it to:
- Explain code
- Refactor functions
- Add error handling
- Create new components
- Fix bugs
- Optimize performance

Happy coding! 🚀 