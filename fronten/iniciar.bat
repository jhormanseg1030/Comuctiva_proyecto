@echo off
title Sistema de Gestion - Frontend Movil
echo.
echo ================================================
echo        SISTEMA DE GESTION - FRONTEND MOVIL
echo ================================================
echo.
echo Iniciando aplicacion movil con Expo...
echo.
echo IMPORTANTE:
echo 1. Asegurate de tener el backend ejecutandose en el puerto 8080
echo 2. Cambia la IP en src/services/api.ts por tu IP local
echo 3. Instala Expo Go en tu dispositivo movil
echo 4. Escanea el codigo QR que aparecera
echo.
pause
echo.
echo Instalando dependencias...
call npm install
echo.
echo Iniciando servidor de desarrollo...
call npx expo start --clear
pause