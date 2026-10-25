@echo off
title BookVerse - Online Book Store (WT Lab 06)
color 0B

echo ================================================================
echo        BOOKVERSE - ONLINE BOOK STORE WEB APPLICATION
echo             Web Technology Lab Assignment 06
echo ================================================================
echo.

:: 1. Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in your system PATH!
    echo Please install Node.js from https://nodejs.org/ to proceed.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js detected:
node -v
echo.

:: 2. Check node_modules
if not exist "node_modules\" (
    echo [INFO] Installing required dependencies (Express, MySQL2, Bcrypt, etc.)...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install npm dependencies.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed successfully!
    echo.
)

:: 3. Launch Default Browser after 2 seconds
start "" cmd /c "timeout /t 2 >nul & start http://localhost:3000"

:: 4. Start Node.js Server
echo ================================================================
echo  Starting Node.js Server on http://localhost:3000 ...
echo  Database: Dual-mode (MySQL 8.0 + Automatic Safe Fallback)
echo.
echo  Pages Included:
echo    1) Home Page:         http://localhost:3000/
echo    2) Login Page:        http://localhost:3000/login
echo    3) Catalogue Page:    http://localhost:3000/catalogue
echo    4) Registration Page: http://localhost:3000/register
echo.
echo  Press Ctrl+C in this terminal window to stop the server.
echo ================================================================
echo.

node server.js
pause
