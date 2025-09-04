@echo off
echo Starting World Clock Gadget...

REM Check if the built executable exists
if exist "dist\win-unpacked\World Clock Gadget.exe" (
    echo Launching standalone World Clock Gadget...
    start "" "dist\win-unpacked\World Clock Gadget.exe"
    echo World Clock Gadget is now running as a native Windows application!
) else (
    echo Executable not found. Building the application...
    
    REM Check if Node.js is installed
    node --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo Node.js is required to build the application.
        echo Please install Node.js from https://nodejs.org/
        pause
        exit /b 1
    )
    
    REM Install dependencies if needed
    if not exist "node_modules" (
        echo Installing dependencies...
        npm install
    )
    
    REM Build the application
    echo Building standalone executable...
    npm run build
    
    REM Launch the built executable
    if exist "dist\win-unpacked\World Clock Gadget.exe" (
        echo Launching World Clock Gadget...
        start "" "dist\win-unpacked\World Clock Gadget.exe"
        echo World Clock Gadget is now running as a native Windows application!
    ) else (
        echo Build failed. Please check the error messages above.
        pause
        exit /b 1
    )
)

echo.
echo The gadget will appear as a desktop widget with:
echo - Transparent background
echo - Always on top
echo - No taskbar icon
echo - Analog and digital clock views
echo - Beautiful glass UI theme
echo.
pause