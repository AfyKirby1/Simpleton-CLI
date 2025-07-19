@echo off
echo.
echo Simpleton CLI - Simple Windows Installer
echo =========================================
echo.
echo This window will stay open to show installation progress...

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
echo Continuing to npm check...
timeout /t 1 >nul

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
echo Ready to install dependencies...
timeout /t 1 >nul

echo.
echo Step 3: Installing dependencies...
echo This may take several minutes, please wait...
echo.
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    echo Try running this script as Administrator
    pause
    exit /b 1
)

echo.
echo Dependencies installed! Moving to build step...
timeout /t 1 >nul

echo.
echo Step 4: Building project...
echo.
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build project
    pause
    exit /b 1
)

echo.
echo =========================================
echo SUCCESS: Installation complete!
echo =========================================
echo.
echo To use the CLI:
echo - Double-click: launch-ai-cli.bat
echo - Or run: node dist/index.js --help
echo.
echo Press any key to close this window...
pause >nul 