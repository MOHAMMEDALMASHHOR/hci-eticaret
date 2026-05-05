@echo off
chcp 65001 >nul
color 0A
echo ========================================================
echo        TRENDSEPET E-TICARET (HCI) OTOMATIK BASLATICI
echo ========================================================
echo.
echo Lutfen bekleyin, sisteminiz hazirlaniyor...
echo (Ilk acilista kurulum yapacagi icin biraz surebilir)
echo.

:: Backend kurulum ve başlatma
echo [1/3] Arka plan veritabani sunucusu (Backend) baslatiliyor...
cd hci-backend
call npm install >nul 2>&1
start "TrendSepet - Backend Sunucusu" cmd /c "color 0E && echo Arkaplan sunucusu calisiyor, lutfen bu pencereyi KAPATMAYIN! && echo. && node server.js"
cd ..

:: Frontend kurulum ve başlatma
echo [2/3] Kullanici arayuzu (Frontend) hazirlaniyor...
cd hci-eticaret
call npm install >nul 2>&1
start "TrendSepet - Kullanici Arayuzu" cmd /c "color 0B && echo Arayuz sunucusu calisiyor, lutfen bu pencereyi KAPATMAYIN! && echo. && npm run dev"
cd ..

:: Tarayıcıyı otomatik açma
echo [3/3] Uygulama tarayicida aciliyor...
timeout /t 6 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================================
echo HER SEY HAZIR! 
echo.
echo Acilan iki adet siyah pencereyi (Backend ve Frontend) 
echo uygulamayi kullandiginiz surece LUTFEN KAPATMAYIN.
echo.
echo Uygulamayi kapatmak istediginizde o siyah pencereleri 
echo (X) tusuna basarak kapatabilirsiniz.
echo ========================================================
pause
