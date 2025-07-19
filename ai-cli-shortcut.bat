@echo off
title AI CLI Launcher

:: Change to your AI CLI project directory
cd /d "C:\Users\motor\Desktop\_AI_PROJECTS\New folder (2)"

:: Check if the project directory exists
if not exist "dist\index.js" (
    echo [ERROR] AI CLI project not found!
    echo.
    echo Please update the path in this batch file to point to your AI CLI project.
    echo Current path: C:\Users\motor\Desktop\_AI_PROJECTS\New folder (2)
    echo.
    pause
    exit /b 1
)

:: Launch the main batch file
call "launch-ai-cli.bat" 