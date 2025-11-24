@echo off
echo ========================================
echo   Compilando E-commerce Backend
echo ========================================
echo.
echo Esto puede tomar 2-3 minutos...
echo.

mvn clean install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Compilacion exitosa!
    echo ========================================
    echo.
    echo Para iniciar la aplicacion ejecuta:
    echo   iniciar.bat
    echo.
) else (
    echo.
    echo ========================================
    echo   Error en la compilacion
    echo ========================================
    echo.
    echo Verifica que:
    echo 1. Java 17 este instalado
    echo 2. Maven este instalado
    echo 3. Estes en la carpeta backend/
    echo.
)

pause
