@echo off
setlocal
pushd "%~dp0.."
set "SKINS_NODE="
if defined HERMES_NODE if exist "%HERMES_NODE%" set "SKINS_NODE=%HERMES_NODE%"
if not defined SKINS_NODE if defined HERMES_HOME if exist "%HERMES_HOME%\node\node.exe" set "SKINS_NODE=%HERMES_HOME%\node\node.exe"
if not defined SKINS_NODE if exist "%LOCALAPPDATA%\hermes\node\node.exe" set "SKINS_NODE=%LOCALAPPDATA%\hermes\node\node.exe"
if not defined SKINS_NODE if exist "%USERPROFILE%\.hermes\node\node.exe" set "SKINS_NODE=%USERPROFILE%\.hermes\node\node.exe"
if not defined SKINS_NODE (
  where node.exe >nul 2>&1
  if not errorlevel 1 set "SKINS_NODE=node.exe"
)
if not defined SKINS_NODE (
  echo Node.js 22 or newer was not found. Install Node.js or set HERMES_NODE.
  popd
  pause
  exit /b 1
)
"%SKINS_NODE%" -e "if (Number(process.versions.node.split('.')[0]) < 22) process.exit(1)"
if errorlevel 1 (
  echo Node.js 22 or newer is required.
  popd
  pause
  exit /b 1
)
"%SKINS_NODE%" scripts\install-local.js %*
set "SKINS_RESULT=%errorlevel%"
popd
echo.
if "%SKINS_RESULT%"=="0" (echo Installation complete. Reload desktop plugins and restart the Hermes gateway for scene support.) else (echo Installation failed. See the messages above.)
pause
exit /b %SKINS_RESULT%
