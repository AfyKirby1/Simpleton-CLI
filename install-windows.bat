@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   🤖 Simpleton CLI - Windows Installer
echo ========================================
echo.

:: Check if Node.js is installed
echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH!
    echo.
    echo 📋 Please install Node.js first:
    echo    1. Go to https://nodejs.org/
    echo    2. Download the LTS version
    echo    3. Run the installer and CHECK "Add to PATH"
    echo    4. Restart this command prompt
    echo    5. Run this script again
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js found: !NODE_VERSION!
)

:: Check if npm is installed
echo [2/4] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed or not in PATH!
    echo.
    echo 📋 npm should come with Node.js. Try:
    echo    1. Reinstalling Node.js from https://nodejs.org/
    echo    2. Make sure to check "Add to PATH" during installation
    echo    3. Restart your computer
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm found: !NPM_VERSION!
)

:: Install dependencies
echo [3/4] Installing dependencies...
echo Running: npm install
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies!
    echo.
    echo 💡 Try running as Administrator:
    echo    1. Right-click Command Prompt
    echo    2. Select "Run as administrator"  
    echo    3. Run this script again
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Dependencies installed successfully!
)

:: Build the project
echo [4/4] Building the project...
echo Running: npm run build
npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build the project!
    echo.
    echo 💡 Check the error messages above for details.
    pause
    exit /b 1
) else (
    echo ✅ Project built successfully!
)

echo.
echo 🎉 Installation complete!
echo.
echo 🚀 Next steps:
echo    1. Double-click 'launch-ai-cli.bat' to start using the CLI
echo    2. Or run: node dist/index.js --help
echo.
echo 📚 Need help? Check the README.md for detailed instructions.
echo.
pause 