@ECHO OFF
ECHO ====================================
ECHO    INICIANDO FRONTEND ECOMERCE
ECHO ====================================
ECHO.

REM Verificar si node_modules existe
IF NOT EXIST "node_modules\" (
    ECHO [1/2] Instalando dependencias...
    call npm install
    IF ERRORLEVEL 1 (
        ECHO.
        ECHO ERROR: Fallo la instalacion de dependencias
        ECHO Verifica que Node.js este instalado correctamente
        PAUSE
        EXIT /B 1
    )
    ECHO.
) ELSE (
    ECHO [OK] Dependencias ya instaladas
    ECHO.
)

ECHO [2/2] Iniciando servidor de desarrollo...
ECHO.
ECHO Frontend disponible en: http://localhost:3000
ECHO Backend debe estar en: http://localhost:8080
ECHO.
ECHO Presiona Ctrl+C para detener el servidor
ECHO.

call npm run dev

PAUSE
