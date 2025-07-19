# AI CLI Launcher - PowerShell Version
# Run this script with: powershell -ExecutionPolicy Bypass -File "launch-ai-cli.ps1"

param(
    [string]$Mode = "",
    [string]$Prompt = ""
)

# Set console title and colors
$Host.UI.RawUI.WindowTitle = "AI CLI - Local AI Coding Assistant"
$Host.UI.RawUI.ForegroundColor = "Green"

function Write-Header {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "    AI CLI - Local AI Coding Assistant" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Test-Prerequisites {
    # Check if we're in the right directory
    if (-not (Test-Path "dist\index.js")) {
        Write-Host "[ERROR] AI CLI not found in current directory!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please run this script from your AI CLI project directory." -ForegroundColor Yellow
        Write-Host "Expected location: dist\index.js" -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }

    # Check if Node.js is installed
    try {
        $nodeVersion = node --version 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw "Node.js not found"
        }
        Write-Host "[INFO] Node.js version: $nodeVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "[ERROR] Node.js is not installed or not in PATH!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }

    # Check if dist/index.js exists and is built
    if (-not (Test-Path "dist\index.js")) {
        Write-Host "[WARNING] AI CLI not built yet. Building now..." -ForegroundColor Yellow
        Write-Host ""
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Build failed! Please check your installation." -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }
        Write-Host "[SUCCESS] Build completed!" -ForegroundColor Green
        Write-Host ""
    }
}

function Show-Configuration {
    Write-Host "[INFO] Current Configuration:" -ForegroundColor Cyan
    try {
        node dist\index.js config --list 2>$null
    }
    catch {
        Write-Host "Could not load configuration" -ForegroundColor Yellow
    }
    Write-Host ""
}

function Show-Menu {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "           AI CLI Launcher" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Choose an option:" -ForegroundColor White
    Write-Host ""
    Write-Host "1. Chat Mode (Interactive)" -ForegroundColor Green
    Write-Host "2. Quick Task (Single command)" -ForegroundColor Green
    Write-Host "3. Suggest Mode (Safe - view only)" -ForegroundColor Green
    Write-Host "4. Auto-Edit Mode (With confirmation)" -ForegroundColor Green
    Write-Host "5. Full Auto Mode (Dangerous!)" -ForegroundColor Red
    Write-Host "6. Configuration" -ForegroundColor Yellow
    Write-Host "7. Initialize Project" -ForegroundColor Yellow
    Write-Host "8. Help" -ForegroundColor Blue
    Write-Host "9. Exit" -ForegroundColor Gray
    Write-Host ""
}

function Start-ChatMode {
    Write-Host ""
    Write-Host "[INFO] Starting Chat Mode..." -ForegroundColor Cyan
    Write-Host "Type 'exit' to quit chat mode" -ForegroundColor Yellow
    Write-Host ""
    node dist\index.js chat
}

function Start-QuickTask {
    Write-Host ""
    $prompt = Read-Host "Enter your task"
    if ([string]::IsNullOrWhiteSpace($prompt)) { return }
    
    Write-Host ""
    Write-Host "[INFO] Running: $prompt" -ForegroundColor Cyan
    Write-Host ""
    node dist\index.js $prompt
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Start-SuggestMode {
    Write-Host ""
    $prompt = Read-Host "Enter your task (suggest mode)"
    if ([string]::IsNullOrWhiteSpace($prompt)) { return }
    
    Write-Host ""
    Write-Host "[INFO] Running in suggest mode: $prompt" -ForegroundColor Cyan
    Write-Host ""
    node dist\index.js --suggest $prompt
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Start-AutoEditMode {
    Write-Host ""
    $prompt = Read-Host "Enter your task (auto-edit mode)"
    if ([string]::IsNullOrWhiteSpace($prompt)) { return }
    
    Write-Host ""
    Write-Host "[INFO] Running in auto-edit mode: $prompt" -ForegroundColor Cyan
    Write-Host ""
    node dist\index.js --auto-edit $prompt
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Start-FullAutoMode {
    Write-Host ""
    Write-Host "[WARNING] Full Auto Mode is dangerous!" -ForegroundColor Red
    Write-Host "This will automatically apply ALL changes without confirmation." -ForegroundColor Red
    Write-Host ""
    $confirm = Read-Host "Are you sure? Type 'YES' to continue"
    if ($confirm -ne "YES") { return }
    
    Write-Host ""
    $prompt = Read-Host "Enter your task (full auto mode)"
    if ([string]::IsNullOrWhiteSpace($prompt)) { return }
    
    Write-Host ""
    Write-Host "[INFO] Running in full auto mode: $prompt" -ForegroundColor Cyan
    Write-Host ""
    node dist\index.js --full-auto $prompt
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Show-ConfigurationMenu {
    do {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "           Configuration" -ForegroundColor White
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. View current config" -ForegroundColor Green
        Write-Host "2. Set endpoint" -ForegroundColor Green
        Write-Host "3. Set model" -ForegroundColor Green
        Write-Host "4. List all settings" -ForegroundColor Green
        Write-Host "5. Back to main menu" -ForegroundColor Gray
        Write-Host ""
        $configChoice = Read-Host "Enter choice (1-5)"

        switch ($configChoice) {
            "1" {
                Write-Host ""
                node dist\index.js config --list
                Write-Host ""
                Read-Host "Press Enter to continue"
            }
            "2" {
                Write-Host ""
                $endpoint = Read-Host "Enter new endpoint (e.g., http://localhost:11434/v1)"
                node dist\index.js config --set endpoint $endpoint
                Write-Host "[SUCCESS] Endpoint updated!" -ForegroundColor Green
                Write-Host ""
                Read-Host "Press Enter to continue"
            }
            "3" {
                Write-Host ""
                $model = Read-Host "Enter new model (e.g., deepseek-coder:1.3b-q4_K_M)"
                node dist\index.js config --set model $model
                Write-Host "[SUCCESS] Model updated!" -ForegroundColor Green
                Write-Host ""
                Read-Host "Press Enter to continue"
            }
            "4" {
                Write-Host ""
                node dist\index.js config --list
                Write-Host ""
                Read-Host "Press Enter to continue"
            }
            "5" { break }
            default { Write-Host "Invalid choice. Please try again." -ForegroundColor Red }
        }
    } while ($configChoice -ne "5")
}

function Initialize-Project {
    Write-Host ""
    Write-Host "[INFO] Initializing project context..." -ForegroundColor Cyan
    Write-Host ""
    node dist\index.js init
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Show-Help {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "              Help" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "AI CLI - Local AI Coding Assistant" -ForegroundColor White
    Write-Host ""
    Write-Host "Modes:" -ForegroundColor Yellow
    Write-Host "- Chat Mode: Interactive conversation with AI" -ForegroundColor Green
    Write-Host "- Quick Task: Single command execution" -ForegroundColor Green
    Write-Host "- Suggest Mode: View suggestions without applying" -ForegroundColor Green
    Write-Host "- Auto-Edit Mode: Apply changes with confirmation" -ForegroundColor Green
    Write-Host "- Full Auto Mode: Apply all changes automatically" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common Commands:" -ForegroundColor Yellow
    Write-Host "- 'Create a React component for user login'" -ForegroundColor Gray
    Write-Host "- 'Refactor this function to use async/await'" -ForegroundColor Gray
    Write-Host "- 'Add TypeScript types to this JavaScript file'" -ForegroundColor Gray
    Write-Host "- 'Create unit tests for this module'" -ForegroundColor Gray
    Write-Host "- 'Review this code for security issues'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Configuration:" -ForegroundColor Yellow
    Write-Host "- Endpoint: Your local LLM server (default: Ollama)" -ForegroundColor Gray
    Write-Host "- Model: AI model to use (e.g., deepseek-coder:1.3b-q4_K_M)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "For more help, visit the documentation in the docs/ folder." -ForegroundColor Blue
    Write-Host ""
    Read-Host "Press Enter to continue"
}

# Main execution
Write-Header
Test-Prerequisites
Show-Configuration

# If parameters are provided, run directly
if ($Mode -and $Prompt) {
    switch ($Mode.ToLower()) {
        "chat" { Start-ChatMode }
        "quick" { node dist\index.js $Prompt }
        "suggest" { node dist\index.js --suggest $Prompt }
        "autoedit" { node dist\index.js --auto-edit $Prompt }
        "fullauto" { node dist\index.js --full-auto $Prompt }
        default { Write-Host "Unknown mode: $Mode" -ForegroundColor Red }
    }
    exit 0
}

# Interactive menu
do {
    Show-Menu
    $choice = Read-Host "Enter your choice (1-9)"

    switch ($choice) {
        "1" { Start-ChatMode }
        "2" { Start-QuickTask }
        "3" { Start-SuggestMode }
        "4" { Start-AutoEditMode }
        "5" { Start-FullAutoMode }
        "6" { Show-ConfigurationMenu }
        "7" { Initialize-Project }
        "8" { Show-Help }
        "9" { 
            Write-Host ""
            Write-Host "Thanks for using AI CLI!" -ForegroundColor Green
            Write-Host ""
            exit 0
        }
        default { Write-Host "Invalid choice. Please try again." -ForegroundColor Red }
    }
} while ($true) 