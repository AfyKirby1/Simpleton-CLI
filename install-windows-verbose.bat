@echo off
setlocal enabledelayedexpansion

title Simpleton CLI - Windows Installer

echo.
echo ================================================================
echo              Simpleton CLI - Windows Installer
echo ================================================================
echo.
echo This installer will:
echo   1. Check for Node.js
echo   2. Check for npm 
echo   3. Install dependencies (this takes the longest)
echo   4. Build the project
echo.
echo The window will stay open so you can see all progress.
echo.
echo Starting installation...
timeout /t 3 >nul

echo.
echo ================================================================
echo STEP 1: Checking Node.js installation
echo ================================================================
echo.
echo Looking for Node.js...

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js is NOT installed or not in PATH!
    echo.
    echo You need to install Node.js first:
    echo   1. Go to: https://nodejs.org/
    echo   2. Download the LTS version
    echo   3. Run installer and CHECK "Add to PATH" option
    echo   4. Restart command prompt
    echo   5. Run this installer again
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
echo [SUCCESS] Node.js found: !NODE_VERSION!
echo Node.js is properly installed and accessible.
timeout /t 2 >nul

echo.
echo ================================================================
echo STEP 2: Checking npm installation
echo ================================================================
echo.
echo Looking for npm (Node Package Manager)...

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] npm is NOT installed or not in PATH!
    echo.
    echo npm should come with Node.js. Try:
    echo   1. Reinstalling Node.js from https://nodejs.org/
    echo   2. Make sure "Add to PATH" is checked
    echo   3. Restart your computer
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version 2^>nul') do set NPM_VERSION=%%i
echo [SUCCESS] npm found: !NPM_VERSION!
echo npm is working correctly.
timeout /t 2 >nul

echo.
echo ================================================================
echo STEP 3: Installing dependencies
echo ================================================================
echo.
echo This step downloads and installs all required packages.
echo It may take 2-5 minutes depending on your internet speed.
echo.
echo Starting npm install...
echo.

call npm install
set INSTALL_RESULT=%errorlevel%

echo.
if %INSTALL_RESULT% neq 0 (
    echo [ERROR] Failed to install dependencies!
    echo.
    echo Common solutions:
    echo   1. Run this script as Administrator (right-click, "Run as administrator")
    echo   2. Check your internet connection
    echo   3. Try: npm cache clean --force
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
) else (
    echo [SUCCESS] All dependencies installed successfully!
    echo Ready for build step...
    timeout /t 2 >nul
)

echo.
echo ================================================================
echo STEP 4: Building the project
echo ================================================================
echo.
echo Compiling TypeScript and preparing the CLI...
echo.

call npm run build
set BUILD_RESULT=%errorlevel%

echo.
if %BUILD_RESULT% neq 0 (
    echo [ERROR] Failed to build the project!
    echo.
    echo Check the error messages above for details.
    echo You may need to fix TypeScript errors or dependencies.
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
) else (
    echo [SUCCESS] Project built successfully!
)

echo.
echo ================================================================
echo INSTALLATION COMPLETE!
echo ================================================================
echo.
echo Your Simpleton CLI is ready to use!
echo.
echo Next steps:
echo   Option 1: Double-click "launch-ai-cli.bat" 
echo   Option 2: Run "node dist/index.js --help"
echo   Option 3: Run "node dist/index.js chat" for interactive mode
echo.
echo Need help? Check README.md for detailed usage instructions.
echo.
echo ================================================================
echo.
echo Press any key to close this installer...
pause >nul

echo.
echo Installer finished. You can close this window.
timeout /t 2 >nul 