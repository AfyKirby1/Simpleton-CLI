# 🚀 AI CLI Launchers

Simple launcher scripts to make using your AI CLI easier on Windows!

## 📁 Files Created

- **`launch-ai-cli.bat`** - Main batch file launcher (run from project directory)
- **`ai-cli-shortcut.bat`** - Desktop shortcut (can be placed anywhere)
- **`launch-ai-cli.ps1`** - PowerShell version with better colors and features

## 🎯 How to Use

### Option 1: Main Batch File (Recommended)

1. **Double-click** `launch-ai-cli.bat` from your AI CLI project directory
2. **Choose an option** from the menu:
   - **Chat Mode** - Interactive conversation
   - **Quick Task** - Single command execution
   - **Suggest Mode** - Safe, view-only suggestions
   - **Auto-Edit Mode** - Apply changes with confirmation
   - **Full Auto Mode** - Apply all changes (dangerous!)
   - **Configuration** - Manage settings
   - **Initialize Project** - Set up project context
   - **Help** - Show usage information

### Option 2: Desktop Shortcut

1. **Copy** `ai-cli-shortcut.bat` to your desktop
2. **Double-click** to launch from anywhere
3. **Update the path** in the file if your project is in a different location

### Option 3: PowerShell Version

1. **Right-click** `launch-ai-cli.ps1` and select "Run with PowerShell"
2. **Or run** from command line:
   ```powershell
   powershell -ExecutionPolicy Bypass -File "launch-ai-cli.ps1"
   ```

## 🎮 Quick Commands

You can also run commands directly:

```bash
# Quick task
launch-ai-cli.bat
# Then choose option 2 and enter: "Create a React component"

# PowerShell with parameters
powershell -ExecutionPolicy Bypass -File "launch-ai-cli.ps1" -Mode "quick" -Prompt "Create a Python API"
```

## 🔧 Features

### ✅ **Automatic Checks**
- Verifies Node.js is installed
- Checks if AI CLI is built
- Validates project directory
- Shows current configuration

### 🎨 **User-Friendly Interface**
- Color-coded menus
- Clear error messages
- Help system
- Configuration management

### 🛡️ **Safety Features**
- Confirmation for dangerous operations
- Suggest mode for safe exploration
- Clear warnings for full-auto mode

## 📋 Menu Options Explained

| Option | Description | Use Case |
|--------|-------------|----------|
| **Chat Mode** | Interactive conversation | Learning, debugging, complex tasks |
| **Quick Task** | Single command | Simple coding tasks |
| **Suggest Mode** | View suggestions only | Safe exploration, code review |
| **Auto-Edit Mode** | Apply with confirmation | Regular development work |
| **Full Auto Mode** | Apply all changes | Batch operations (use carefully!) |
| **Configuration** | Manage settings | Change models, endpoints |
| **Initialize Project** | Set up context | First time in a project |
| **Help** | Show usage info | Learn how to use the CLI |

## 🎯 Common Workflows

### 🆕 **First Time Setup**
1. Run launcher
2. Choose "Configuration" → Set your model
3. Choose "Initialize Project" → Set up context
4. Choose "Chat Mode" → Test the system

### 💻 **Daily Development**
1. Run launcher
2. Choose "Quick Task" or "Auto-Edit Mode"
3. Enter your coding task
4. Review and apply changes

### 🔍 **Code Review**
1. Run launcher
2. Choose "Suggest Mode"
3. Enter "Review this code for issues"
4. Review suggestions without applying

### 🛠️ **Complex Tasks**
1. Run launcher
2. Choose "Chat Mode"
3. Have a conversation about your task
4. Work through it step by step

## 🚨 Troubleshooting

### "AI CLI not found"
- Make sure you're in the correct project directory
- Run `npm run build` to build the project
- Check that `dist/index.js` exists

### "Node.js not installed"
- Download and install Node.js from [nodejs.org](https://nodejs.org/)
- Restart your terminal/command prompt

### "Build failed"
- Check your Node.js version (needs 22+)
- Run `npm install` to install dependencies
- Check for any error messages

## 🎉 Tips

- **Use Suggest Mode** when trying new things
- **Chat Mode** is great for learning and complex tasks
- **Keep the launcher** in your project directory for easy access
- **Update the shortcut path** if you move your project
- **Use PowerShell version** for better colors and features

## 🔄 Updating

To update the launchers:
1. Replace the batch/PowerShell files with new versions
2. Update the path in `ai-cli-shortcut.bat` if needed
3. Test with a simple command

---

**Happy coding with AI CLI! 🚀** 