@echo off
title Configuracion de IP - Sistema de Gestion
echo.
echo ================================================
echo        CONFIGURACION DE IP LOCAL
echo ================================================
echo.
echo Obteniendo tu IP local...
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)

:found
set IP=%IP: =%
echo Tu IP local es: %IP%
echo.
echo INSTRUCCIONES:
echo 1. Copia esta IP: %IP%
echo 2. Abre el archivo: src\services\api.ts
echo 3. Cambia la linea:
echo    const API_BASE_URL = 'http://192.168.1.100:8080/api';
echo    Por:
echo    const API_BASE_URL = 'http://%IP%:8080/api';
echo.
echo 4. Guarda el archivo y ejecuta: iniciar.bat
echo.
pause