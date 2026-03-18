@echo off
echo ========================================
echo Waiting 60 seconds for IP whitelist to propagate...
echo ========================================
timeout /t 60 /nobreak
echo.
echo Testing MongoDB connection...
cd /d "C:\Users\dl009\OneDrive\Desktop\FInal_FYP_Bibushan\BibushanSingh_FYP"
call npx tsx scripts/test-mongodb-connection.ts
echo.
pause
