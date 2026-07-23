@echo off
echo 🚀 Starting Incremental Deployment via Robocopy...

set SRC="C:\workbench\js\nodejs\psb\frontend\.next\standalone"
set DEST="\\psbiis\d$\ASD\PSBIIS\psb\psbnode\next\frontend\standalone"

:: /MIR  - Mirrors the directory tree (deletes files in dest that no longer exist in src)
:: /MT:16 - Enables multi-threaded copying (uses 16 threads for massive speed)
:: /R:3   - Retry 3 times on failed connections
:: /W:5   - Wait 5 seconds between retries
:: /XD    - Exclude specific folders if needed (e.g. cache)

robocopy %SRC% %DEST% /MIR /MT:16 /R:3 /W:5

echo ✨ Deployment Complete!
pause