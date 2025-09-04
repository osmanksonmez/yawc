@echo off
echo Creating desktop shortcut for World Clock Gadget...

set "DESKTOP=%USERPROFILE%\Desktop"
set "GADGET_PATH=%~dp0dist\win-unpacked\World Clock Gadget.exe"
set "SHORTCUT_PATH=%DESKTOP%\World Clock Gadget.lnk"

REM Check if executable exists
if not exist "%GADGET_PATH%" (
    echo Executable not found. Please run 'run-gadget.bat' first to build the application.
    pause
    exit /b 1
)

REM Create VBS script to create shortcut
echo Set oWS = WScript.CreateObject("WScript.Shell") > CreateShortcut.vbs
echo sLinkFile = "%SHORTCUT_PATH%" >> CreateShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> CreateShortcut.vbs
echo oLink.TargetPath = "%GADGET_PATH%" >> CreateShortcut.vbs
echo oLink.WorkingDirectory = "%~dp0" >> CreateShortcut.vbs
echo oLink.Description = "World Clock Desktop Gadget" >> CreateShortcut.vbs
echo oLink.Save >> CreateShortcut.vbs

REM Run VBS script
cscript CreateShortcut.vbs >nul

REM Clean up
del CreateShortcut.vbs

if exist "%SHORTCUT_PATH%" (
    echo Desktop shortcut created successfully!
    echo You can now double-click "World Clock Gadget" on your desktop to launch the gadget.
) else (
    echo Failed to create desktop shortcut.
)

echo.
pause