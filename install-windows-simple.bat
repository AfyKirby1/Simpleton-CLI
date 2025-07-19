@echo off
echo.
echo Simpleton CLI - Simple Windows Installer
echo =========================================
echo.

echo Step 1: Checking for Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    echo Make sure to check "Add to PATH" during installation
    pause
    exit /b 1
)
echo Node.js found!

echo.
echo Step 2: Checking for npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm not found!
    echo Please reinstall Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo npm found!

echo.
echo Step 3: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    echo Try running this script as Administrator
    pause
    exit /b 1
)

echo.
echo Step 4: Building project...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build project
    pause
    exit /b 1
)

echo.
echo SUCCESS: Installation complete!
echo.
echo To use the CLI:
echo - Double-click: launch-ai-cli.bat
echo - Or run: node dist/index.js --help
echo.
pause 