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

:: Show current configuration with auto-detection
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
echo 9. Auto-Setup (Detect & Configure)
echo 10. Model Switcher
echo 11. Performance Monitor
echo 12. Fix Terminal Colors
echo 13. Help
echo 14. Exit
echo.
set /p choice="Enter your choice (1-14): "

if "%choice%"=="1" goto chat
if "%choice%"=="2" goto quick
if "%choice%"=="3" goto suggest
if "%choice%"=="4" goto autoedit
if "%choice%"=="5" goto fullauto
if "%choice%"=="6" goto config
if "%choice%"=="7" goto init
if "%choice%"=="8" goto ollama
if "%choice%"=="9" goto autosetup
if "%choice%"=="10" goto model
if "%choice%"=="11" goto performance
if "%choice%"=="12" goto fixterminal
if "%choice%"=="13" goto help
if "%choice%"=="14" goto exit
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

:autosetup
echo.
echo ========================================
echo         Auto-Setup & Detection
echo ========================================
echo.
echo Choose an option:
echo.
echo 1. Quick Auto-Setup (Recommended)
echo 2. Force Auto-Setup (Download models, start services)
echo 3. Skip Ollama Setup
echo 4. Skip Project Detection
echo 5. Back to Main Menu
echo.
set /p autosetup_choice="Enter your choice (1-5): "

if "%autosetup_choice%"=="1" goto autosetup_quick
if "%autosetup_choice%"=="2" goto autosetup_force
if "%autosetup_choice%"=="3" goto autosetup_skip_ollama
if "%autosetup_choice%"=="4" goto autosetup_skip_project
if "%autosetup_choice%"=="5" goto menu
goto autosetup

:autosetup_quick
echo.
echo [INFO] Running quick auto-setup...
echo.
node dist\index.js setup
echo.
pause
goto menu

:autosetup_force
echo.
echo [WARNING] Force auto-setup will download models and start services!
echo.
set /p confirm="Are you sure? Type 'YES' to continue: "
if not "%confirm%"=="YES" goto autosetup
echo.
echo [INFO] Running force auto-setup...
echo.
node dist\index.js setup --force
echo.
pause
goto menu

:autosetup_skip_ollama
echo.
echo [INFO] Running auto-setup (skipping Ollama)...
echo.
node dist\index.js setup --skip-ollama
echo.
pause
goto menu

:autosetup_skip_project
echo.
echo [INFO] Running auto-setup (skipping project detection)...
echo.
node dist\index.js setup --skip-project
echo.
pause
goto menu

:performance
echo.
echo ========================================
echo        Performance Monitor
echo ========================================
echo.
echo Choose an option:
echo.
echo 1. Show Performance Dashboard
echo 2. Run Benchmarks (All)
echo 3. Run File Operations Benchmark
echo 4. Run Configuration Benchmark
echo 5. Run Ollama Benchmark
echo 6. Export Performance Metrics
echo 7. Clear Metrics and Caches
echo 8. Back to Main Menu
echo.
set /p perf_choice="Enter your choice (1-8): "

if "%perf_choice%"=="1" goto perf_show
if "%perf_choice%"=="2" goto perf_benchmark_all
if "%perf_choice%"=="3" goto perf_benchmark_file
if "%perf_choice%"=="4" goto perf_benchmark_config
if "%perf_choice%"=="5" goto perf_benchmark_ollama
if "%perf_choice%"=="6" goto perf_export
if "%perf_choice%"=="7" goto perf_clear
if "%perf_choice%"=="8" goto menu
goto performance

:perf_show
echo.
echo [INFO] Showing performance dashboard...
echo.
node dist\index.js performance --show
echo.
pause
goto performance

:perf_benchmark_all
echo.
echo [INFO] Running all benchmarks...
echo.
node dist\index.js performance --benchmark all
echo.
pause
goto performance

:perf_benchmark_file
echo.
echo [INFO] Running file operations benchmark...
echo.
node dist\index.js performance --benchmark file-ops
echo.
pause
goto performance

:perf_benchmark_config
echo.
echo [INFO] Running configuration benchmark...
echo.
node dist\index.js performance --benchmark config
echo.
pause
goto performance

:perf_benchmark_ollama
echo.
echo [INFO] Running Ollama benchmark...
echo.
node dist\index.js performance --benchmark ollama
echo.
pause
goto performance

:perf_export
echo.
echo [INFO] Exporting performance metrics...
echo.
node dist\index.js performance --export
echo.
pause
goto performance

:perf_clear
echo.
echo [WARNING] This will clear all performance metrics and caches!
echo.
set /p confirm="Are you sure? Type 'YES' to continue: "
if not "%confirm%"=="YES" goto performance
echo.
echo [INFO] Clearing metrics and caches...
echo.
node dist\index.js performance --clear
echo.
pause
goto performance

:model
echo.
echo ========================================
echo           Model Switcher
echo ========================================
echo.
echo Choose an option:
echo.
echo 1. Interactive Model Switcher
echo 2. List Available Models
echo 3. Show Current Model
echo 4. Set Model Directly
echo 5. Back to Main Menu
echo.
set /p model_choice="Enter your choice (1-5): "

if "%model_choice%"=="1" goto model_switch
if "%model_choice%"=="2" goto model_list
if "%model_choice%"=="3" goto model_current
if "%model_choice%"=="4" goto model_set
if "%model_choice%"=="5" goto menu
goto model

:model_switch
echo.
echo [INFO] Starting interactive model switcher...
echo.
node dist\index.js model --switch
echo.
pause
goto model

:model_list
echo.
echo [INFO] Listing available models...
echo.
node dist\index.js model --list
echo.
pause
goto model

:model_current
echo.
echo [INFO] Showing current model information...
echo.
node dist\index.js model --current
echo.
pause
goto model

:model_set
echo.
set /p modelname="Enter model name: "
if "%modelname%"=="" goto model
echo.
echo [INFO] Setting model to %modelname%...
echo.
node dist\index.js model --set "%modelname%"
echo.
pause
goto model

:fixterminal
echo.
echo [INFO] Fixing terminal colors and state...
echo.
node dist\index.js fix-terminal
echo.
pause
goto menu

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