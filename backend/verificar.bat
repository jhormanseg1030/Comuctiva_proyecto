@echo off
echo ========================================
echo   E-commerce Backend - Verificacion
echo ========================================
echo.

echo [1/3] Verificando Java...
java -version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Java no esta instalado o no esta en el PATH
    pause
    exit /b 1
)
echo OK: Java instalado
echo.

echo [2/3] Verificando Maven...
mvn -version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Maven no esta instalado o no esta en el PATH
    pause
    exit /b 1
)
echo OK: Maven instalado
echo.

echo [3/3] Verificando estructura del proyecto...
if not exist "pom.xml" (
    echo ERROR: No se encuentra pom.xml
    echo Asegurate de estar en la carpeta backend/
    pause
    exit /b 1
)
echo OK: Estructura correcta
echo.

echo ========================================
echo   Todas las verificaciones pasaron!
echo ========================================
echo.
echo Para compilar el proyecto ejecuta:
echo   mvn clean install
echo.
echo Para iniciar la aplicacion ejecuta:
echo   mvn spring-boot:run
echo.
pause
