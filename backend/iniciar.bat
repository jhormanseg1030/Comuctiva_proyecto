@echo off
echo ========================================
echo   Iniciando E-commerce Backend
echo ========================================
echo.
echo Asegurate de que MySQL en XAMPP este corriendo!
echo.
echo La aplicacion se iniciara en:
echo   http://localhost:8080/api
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
echo ========================================
echo.

mvn spring-boot:run
