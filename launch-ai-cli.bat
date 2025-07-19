@echo off
title AI CLI - Local AI Coding Assistant
color 0A

echo.
echo ========================================
echo    AI CLI - Local AI Coding Assistant
echo ========================================
echo.

:: Check if we're in the right directory
if not exist "dist\index.js" (
    echo [ERROR] AI CLI not found in current directory!
    echo.
    echo Please run this batch file from your AI CLI project directory.
    echo Expected location: dist\index.js
    echo.
    pause
    exit /b 1
)

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if dist/index.js exists and is built
if not exist "dist\index.js" (
    echo [WARNING] AI CLI not built yet. Building now...
    echo.
    npm run build
    if errorlevel 1 (
        echo [ERROR] Build failed! Please check your installation.
        pause
        exit /b 1
    )
    echo [SUCCESS] Build completed!
    echo.
)

:: Show current configuration
echo [INFO] Current Configuration:
node dist\index.js config --list 2>nul
echo.

:: Main menu
:menu
echo ========================================
echo           AI CLI Launcher
echo ========================================
echo.
echo Choose an option:
echo.
echo 1. Chat Mode (Interactive)
echo 2. Quick Task (Single command)
echo 3. Suggest Mode (Safe - view only)
echo 4. Auto-Edit Mode (With confirmation)
echo 5. Full Auto Mode (Dangerous!)
echo 6. Configuration
echo 7. Initialize Project
echo 8. Ollama Models (Download/Manage AI models)
echo 9. Help
echo 10. Exit
echo.
set /p choice="Enter your choice (1-10): "

if "%choice%"=="1" goto chat
if "%choice%"=="2" goto quick
if "%choice%"=="3" goto suggest
if "%choice%"=="4" goto autoedit
if "%choice%"=="5" goto fullauto
if "%choice%"=="6" goto config
if "%choice%"=="7" goto init
if "%choice%"=="8" goto ollama
if "%choice%"=="9" goto help
if "%choice%"=="10" goto exit
goto menu

:chat
echo.
echo [INFO] Starting Chat Mode...
echo Type 'exit' to quit chat mode
echo.
node dist\index.js chat
goto menu

:quick
echo.
set /p prompt="Enter your task: "
if "%prompt%"=="" goto menu
echo.
echo [INFO] Running: %prompt%
echo.
node dist\index.js "%prompt%"
echo.
pause
goto menu

:suggest
echo.
set /p prompt="Enter your task (suggest mode): "
if "%prompt%"=="" goto menu
echo.
echo [INFO] Running in suggest mode: %prompt%
echo.
node dist\index.js --suggest "%prompt%"
echo.
pause
goto menu

:autoedit
echo.
set /p prompt="Enter your task (auto-edit mode): "
if "%prompt%"=="" goto menu
echo.
echo [INFO] Running in auto-edit mode: %prompt%
echo.
node dist\index.js --auto-edit "%prompt%"
echo.
pause
goto menu

:fullauto
echo.
echo [WARNING] Full Auto Mode is dangerous!
echo This will automatically apply ALL changes without confirmation.
echo.
set /p confirm="Are you sure? Type 'YES' to continue: "
if not "%confirm%"=="YES" goto menu
echo.
set /p prompt="Enter your task (full auto mode): "
if "%prompt%"=="" goto menu
echo.
echo [INFO] Running in full auto mode: %prompt%
echo.
node dist\index.js --full-auto "%prompt%"
echo.
pause
goto menu

:ollama
echo.
echo ========================================
echo         Ollama Model Management
echo ========================================
echo.
echo Choose an option:
echo.
echo 1. Quick Setup (Download Mistral 7B - Recommended)
echo 2. Show Available Models
echo 3. List Installed Models  
echo 4. Download Specific Model
echo 5. Start Ollama Server
echo 6. Back to Main Menu
echo.
set /p ollama_choice="Enter your choice (1-6): "

if "%ollama_choice%"=="1" goto ollama_setup
if "%ollama_choice%"=="2" goto ollama_available
if "%ollama_choice%"=="3" goto ollama_list
if "%ollama_choice%"=="4" goto ollama_pull
if "%ollama_choice%"=="5" goto ollama_serve
if "%ollama_choice%"=="6" goto menu
goto ollama

:ollama_setup
echo.
echo [INFO] Setting up Mistral 7B (recommended model)...
echo This will download ~4.1GB and configure the CLI
echo.
node dist\index.js ollama --setup
echo.
pause
goto ollama

:ollama_available
echo.
echo [INFO] Showing available models...
echo.
node dist\index.js ollama --available
echo.
pause
goto ollama

:ollama_list
echo.
echo [INFO] Listing installed models...
echo.
node dist\index.js ollama --list
echo.
pause
goto ollama

:ollama_pull
echo.
set /p model="Enter model name (e.g., mistral:7b): "
if "%model%"=="" goto ollama
echo.
echo [INFO] Downloading %model%...
echo.
node dist\index.js ollama --pull "%model%"
echo.
pause
goto ollama

:ollama_serve
echo.
echo [INFO] Starting Ollama server...
echo.
node dist\index.js ollama --serve
echo.
pause
goto ollama

:config
echo.
echo ========================================
echo           Configuration
echo ========================================
echo.
echo 1. View current config
echo 2. Set endpoint
echo 3. Set model
echo 4. List all settings
echo 5. Back to main menu
echo.
set /p config_choice="Enter choice (1-5): "

if "%config_choice%"=="1" (
    echo.
    node dist\index.js config --list
    echo.
    pause
    goto config
)
if "%config_choice%"=="2" (
    echo.
    set /p endpoint="Enter new endpoint (e.g., http://localhost:11434/v1): "
    node dist\index.js config --set endpoint "%endpoint%"
    echo [SUCCESS] Endpoint updated!
    echo.
    pause
    goto config
)
if "%config_choice%"=="3" (
    echo.
    set /p model="Enter new model (e.g., deepseek-coder:1.3b-q4_K_M): "
    node dist\index.js config --set model "%model%"
    echo [SUCCESS] Model updated!
    echo.
    pause
    goto config
)
if "%config_choice%"=="4" (
    echo.
    node dist\index.js config --list
    echo.
    pause
    goto config
)
if "%config_choice%"=="5" goto menu
goto config

:init
echo.
echo [INFO] Initializing project context...
echo.
node dist\index.js init
echo.
pause
goto menu

:help
echo.
echo ========================================
echo              Help
echo ========================================
echo.
echo AI CLI - Local AI Coding Assistant
echo.
echo Modes:
echo - Chat Mode: Interactive conversation with AI
echo - Quick Task: Single command execution
echo - Suggest Mode: View suggestions without applying
echo - Auto-Edit Mode: Apply changes with confirmation
echo - Full Auto Mode: Apply all changes automatically
echo.
echo Common Commands:
echo - "Create a React component for user login"
echo - "Refactor this function to use async/await"
echo - "Add TypeScript types to this JavaScript file"
echo - "Create unit tests for this module"
echo - "Review this code for security issues"
echo.
echo Configuration:
echo - Endpoint: Your local LLM server (default: Ollama)
echo - Model: AI model to use (e.g., mistral:7b)
echo.
echo Ollama Models:
echo - Quick Setup: Downloads and configures Mistral 7B
echo - Available Models: Shows recommended coding models
echo - Model Management: Download, list, and serve models
echo.
echo Recommended Models:
echo - mistral:7b (4.1GB) - Excellent general purpose coding
echo - deepseek-coder:1.3b-q4_K_M (0.8GB) - Fast and lightweight
echo - codellama:7b-q4_K_M (3.8GB) - Meta's specialized code model
echo.
echo For more help, visit the documentation in the docs/ folder.
echo.
pause
goto menu

:exit
echo.
echo Thanks for using AI CLI!
echo.
exit /b 0 