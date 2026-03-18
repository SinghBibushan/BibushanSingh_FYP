@echo off
echo ========================================
echo MongoDB Connection Test
echo ========================================
echo.
echo Testing connection to MongoDB Atlas...
echo.
cd /d "C:\Users\dl009\OneDrive\Desktop\FInal_FYP_Bibushan\BibushanSingh_FYP"
call npx tsx scripts/test-mongodb-connection.ts
echo.
echo ========================================
echo If connection successful, restart server with: npm run dev
echo ========================================
pause
