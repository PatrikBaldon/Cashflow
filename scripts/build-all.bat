@echo off
REM Build script for Windows
REM This script builds the application for all platforms on Windows

echo 🚀 Starting build process for all platforms...

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Clean previous builds
echo [INFO] Cleaning previous builds...
call npm run clean

REM Install dependencies
echo [INFO] Installing dependencies...
call npm install

REM Build frontend
echo [INFO] Building frontend...
call npm run build:frontend

REM Check if frontend build was successful
if not exist "frontend\dist" (
    echo [ERROR] Frontend build failed. No dist directory found.
    pause
    exit /b 1
)

echo [SUCCESS] Frontend build completed successfully!

REM Build for all platforms
echo [INFO] Building for all platforms...
call npm run build:all

REM List built files
echo [INFO] Build artifacts:
if exist "dist" (
    dir dist
) else (
    echo [WARNING] No dist directory found. Build may have failed.
)

echo [SUCCESS] Build process completed!
echo [INFO] You can find the built applications in the 'dist' directory.

echo.
echo 📦 Distribution files created:
echo    • Windows: .exe installer in dist\
echo    • macOS: .dmg file in dist\
echo    • Linux: .AppImage file in dist\
echo.
echo 🎯 Next steps:
echo    1. Test the applications on their respective platforms
echo    2. Distribute the installer files to users
echo    3. Users can install without any additional setup required

pause
