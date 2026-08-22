@echo off
echo ========================================================
echo   Sincronizando Mintbes-Web con GitHub...
echo ========================================================
cd /d "c:\Lovable\mintbes-validator"
git push origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [OK] Sincronizacion con GitHub completada con exito!
) else (
    echo [ERROR] Hubo un problema al sincronizar con GitHub.
)
echo ========================================================
pause
