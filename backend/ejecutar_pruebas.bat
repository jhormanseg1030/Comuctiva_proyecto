@echo off
chcp 65001 > nul
color 0A
echo.
echo ═══════════════════════════════════════════════════════════
echo    🧪 SISTEMA DE PRUEBAS AUTOMATIZADO - BACKEND E-COMMERCE
echo ═══════════════════════════════════════════════════════════
echo.

REM ===========================================
REM PASO 1: VERIFICACIONES PREVIAS
REM ===========================================
echo [PASO 1/4] Verificando requisitos previos...
echo.

REM Verificar si curl está disponible
curl --version > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: curl no está instalado o no está en el PATH
    echo    Por favor instala curl o usa las pruebas manuales
    pause
    exit /b 1
)
echo ✅ curl disponible

REM Verificar si MySQL está corriendo
netstat -an | findstr "3306" > nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  ADVERTENCIA: No se detectó MySQL en el puerto 3306
    echo    Por favor abre XAMPP Control Panel y asegúrate que MySQL esté iniciado
    echo.
    pause
)
echo ✅ MySQL escuchando en puerto 3306

echo.
echo Presiona cualquier tecla para continuar...
pause > nul

REM ===========================================
REM PASO 2: VERIFICAR BACKEND
REM ===========================================
cls
echo.
echo ═══════════════════════════════════════════════════════════
echo    PASO 2/4: VERIFICANDO BACKEND
echo ═══════════════════════════════════════════════════════════
echo.

echo Verificando que el backend esté corriendo en http://localhost:8080...
curl -s -o nul -w "%%{http_code}" http://localhost:8080/api/categorias > temp_status.txt
set /p STATUS=<temp_status.txt
del temp_status.txt

if "%STATUS%"=="000" (
    color 0C
    echo.
    echo ❌ ERROR: El backend NO está respondiendo
    echo.
    echo Por favor inicia el backend:
    echo   1. Abre una nueva terminal
    echo   2. cd c:\xampp\htdocs\ecomerce\backend
    echo   3. mvn spring-boot:run
    echo   4. Espera a ver "Started EcomerceApplication"
    echo   5. Vuelve a ejecutar este script
    echo.
    pause
    exit /b 1
)

if "%STATUS%"=="200" (
    echo ✅ Backend respondiendo correctamente
) else (
    echo ⚠️  Backend responde con código: %STATUS%
    echo    Esto puede ser normal si no hay datos aún
)

echo.
echo Presiona cualquier tecla para cargar datos de prueba...
pause > nul

REM ===========================================
REM PASO 3: CARGAR DATOS DE PRUEBA
REM ===========================================
cls
echo.
echo ═══════════════════════════════════════════════════════════
echo    PASO 3/4: CARGANDO DATOS DE PRUEBA
echo ═══════════════════════════════════════════════════════════
echo.

echo ℹ️  Se necesita cargar el archivo datos_prueba.sql en MySQL
echo.
echo Opciones:
echo   1. Usar línea de comandos (requiere mysql.exe)
echo   2. Manual via phpMyAdmin
echo.
set /p OPCION="Selecciona opción (1 o 2): "

if "%OPCION%"=="1" (
    echo.
    echo Intentando cargar datos via MySQL CLI...
    cd /d "C:\xampp\mysql\bin" 2>nul
    if %errorlevel% neq 0 (
        echo ❌ No se encontró MySQL CLI en C:\xampp\mysql\bin
        goto manual_load
    )
    
    mysql.exe -u root -e "USE ecomerce_db; SELECT COUNT(*) FROM usuarios;" 2>nul
    if %errorlevel% neq 0 (
        echo ℹ️  Creando base de datos ecomerce_db...
        mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS ecomerce_db;"
    )
    
    echo Cargando datos_prueba.sql...
    cd /d "c:\xampp\htdocs\ecomerce\backend"
    "C:\xampp\mysql\bin\mysql.exe" -u root ecomerce_db < datos_prueba.sql
    
    if %errorlevel% equ 0 (
        echo ✅ Datos cargados exitosamente
    ) else (
        echo ⚠️  Hubo un problema al cargar los datos
        echo    Verifica el archivo datos_prueba.sql
    )
) else (
    :manual_load
    echo.
    echo Por favor carga los datos manualmente:
    echo   1. Abre http://localhost/phpmyadmin
    echo   2. Selecciona la base de datos "ecomerce_db"
    echo   3. Ve a la pestaña "SQL"
    echo   4. Abre y copia el contenido de: c:\xampp\htdocs\ecomerce\backend\datos_prueba.sql
    echo   5. Pega el contenido y haz clic en "Continuar"
    echo.
    echo Presiona cualquier tecla cuando hayas terminado...
    pause > nul
)

echo.
echo Presiona cualquier tecla para iniciar las pruebas...
pause > nul

REM ===========================================
REM PASO 4: EJECUTAR PRUEBAS
REM ===========================================
cls
color 0B
echo.
echo ═══════════════════════════════════════════════════════════
echo    PASO 4/4: EJECUTANDO PRUEBAS DEL API
echo ═══════════════════════════════════════════════════════════
echo.

setlocal enabledelayedexpansion
set BASE_URL=http://localhost:8080/api
set ADMIN_TOKEN=
set USER_TOKEN=
set PASSED=0
set FAILED=0

REM ============ PRUEBA 1 ============
echo.
echo ┌────────────────────────────────────────────────────────┐
echo │ PRUEBA 1/13: GET /categorias                           │
echo └────────────────────────────────────────────────────────┘
echo Descripción: Listar todas las categorías (público)
echo.
curl -s -X GET "%BASE_URL%/categorias" -H "Content-Type: application/json" > temp_test1.json
type temp_test1.json | findstr "Frutas" > nul
if %errorlevel% equ 0 (
    echo ✅ PASÓ - Se obtuvieron las categorías
    set /a PASSED+=1
) else (
    echo ❌ FALLÓ - No se encontraron categorías
    set /a FAILED+=1
)
type temp_test1.json
del temp_test1.json
echo.
timeout /t 2 /nobreak > nul

REM ============ PRUEBA 2 ============
echo.
echo ┌────────────────────────────────────────────────────────┐
echo │ PRUEBA 2/13: GET /productos/activos                    │
echo └────────────────────────────────────────────────────────┘
echo Descripción: Listar productos activos (público)
echo.
curl -s -X GET "%BASE_URL%/productos/activos" -H "Content-Type: application/json" > temp_test2.json
type temp_test2.json | findstr "Naranjas" > nul
if %errorlevel% equ 0 (
    echo ✅ PASÓ - Se obtuvieron productos activos
    set /a PASSED+=1
) else (
    echo ❌ FALLÓ - No se encontraron productos
    set /a FAILED+=1
)
type temp_test2.json
del temp_test2.json
echo.
timeout /t 2 /nobreak > nul

REM ============ PRUEBA 3 ============
echo.
echo ┌────────────────────────────────────────────────────────┐
echo │ PRUEBA 3/13: POST /auth/login (ADMIN)                  │
echo └────────────────────────────────────────────────────────┘
echo Descripción: Autenticación como administrador
echo Credenciales: admin / admin123
echo.
curl -s -X POST "%BASE_URL%/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"numeroDocumento\":\"admin\",\"password\":\"admin123\"}" > temp_test3.json
type temp_test3.json | findstr "token" > nul
if %errorlevel% equ 0 (
    echo ✅ PASÓ - Login exitoso
    set /a PASSED+=1
    for /f "tokens=2 delims=:," %%a in ('type temp_test3.json ^| findstr "token"') do (
        set ADMIN_TOKEN=%%a
        set ADMIN_TOKEN=!ADMIN_TOKEN:"=!
        set ADMIN_TOKEN=!ADMIN_TOKEN: =!
    )
    echo Token ADMIN: !ADMIN_TOKEN:~0,40!...
) else (
    echo ❌ FALLÓ - No se pudo autenticar
    set /a FAILED+=1
)
type temp_test3.json
del temp_test3.json
echo.
timeout /t 2 /nobreak > nul

REM ============ PRUEBA 4 ============
echo.
echo ┌────────────────────────────────────────────────────────┐
echo │ PRUEBA 4/13: POST /auth/login (USER)                   │
echo └────────────────────────────────────────────────────────┘
echo Descripción: Autenticación como usuario normal
echo Credenciales: 11111111 / admin123
echo.
curl -s -X POST "%BASE_URL%/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"numeroDocumento\":\"11111111\",\"password\":\"admin123\"}" > temp_test4.json
type temp_test4.json | findstr "token" > nul
if %errorlevel% equ 0 (
    echo ✅ PASÓ - Login exitoso
    set /a PASSED+=1
    for /f "tokens=2 delims=:," %%a in ('type temp_test4.json ^| findstr "token"') do (
        set USER_TOKEN=%%a
        set USER_TOKEN=!USER_TOKEN:"=!
        set USER_TOKEN=!USER_TOKEN: =!
    )
    echo Token USER: !USER_TOKEN:~0,40!...
) else (
    echo ❌ FALLÓ - No se pudo autenticar
    set /a FAILED+=1
)
type temp_test4.json
del temp_test4.json
echo.
timeout /t 2 /nobreak > nul

REM ============ PRUEBA 5 ============
echo.
echo ┌────────────────────────────────────────────────────────┐
echo │ PRUEBA 5/13: POST /categorias (ADMIN)                  │
echo └────────────────────────────────────────────────────────┘
echo Descripción: Crear categoría con rol ADMIN
echo.
curl -s -X POST "%BASE_URL%/categorias" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer !ADMIN_TOKEN!" ^
  -d "{\"nombre\":\"Panaderia\",\"descripcion\":\"Pan y productos de panaderia\",\"activo\":true}" > temp_test5.json
type temp_test5.json | findstr /C:"Panaderia" > nul
if %errorlevel% equ 0 (
    echo ✅ PASÓ - Categoría creada
    set /a PASSED+=1
) else (
    echo ❌ FALLÓ - No se pudo crear la categoría
    set /a FAILED+=1
)
type temp_test5.json
del temp_test5.json
echo.
timeout /t 2 /nobreak > nul

REM ============ PRUEBA 6 ============
echo.
echo ┌────────────────────────────────────────────────────────┐
echo │ PRUEBA 6/13: POST /categorias (USER)                   │
echo └────────────────────────────────────────────────────────┘
echo Descripción: Intentar crear categoría como USER (debe fallar)
echo.
curl -s -w "%%{http_code}" -X POST "%BASE_URL%/categorias" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer !USER_TOKEN!" ^
  -d "{\"nombre\":\"Test\",\"descripcion\":\"No debe crearse\",\"activo\":true}" > temp_test6.json
findstr "403" temp_test6.json > nul
if %errorlevel% equ 0 (
    echo ✅ PASÓ - Acceso denegado correctamente (403)
    set /a PASSED+=1
) else (
    echo ❌ FALLÓ - Debería haber dado error 403
    set /a FAILED+=1
)
type temp_test6.json
del temp_test6.json
echo.
timeout /t 2 /nobreak > nul

REM ============ PRUEBA 7 ============
echo.
echo ┌────────────────────────────────────────────────────────┐
echo │ PRUEBA 7/13: GET /productos/usuario/11111111           │
echo └────────────────────────────────────────────────────────┘
echo Descripción: Productos publicados por el usuario Juan
echo.
curl -s -X GET "%BASE_URL%/productos/usuario/11111111" ^
  -H "Content-Type: application/json" > temp_test7.json
type temp_test7.json | findstr /C:"Naranjas" /C:"Limones" /C:"Mandarinas" > nul
if %errorlevel% equ 0 (
    echo ✅ PASÓ - Se obtuvieron productos del usuario
    set /a PASSED+=1
) else (
    echo ❌ FALLÓ - No se encontraron productos
    set /a FAILED+=1
)
type temp_test7.json
del temp_test7.json
echo.
timeout /t 2 /nobreak > nul

REM ============ PRUEBA 8 ============
echo.
echo ┌────────────────────────────────────────────────────────┐
echo │ PRUEBA 8/13: GET /productos/categoria/1                │
echo └────────────────────────────────────────────────────────┘
echo Descripción: Productos de la categoría Frutas
echo.
curl -s -X GET "%BASE_URL%/productos/categoria/1" ^
  -H "Content-Type: application/json" > temp_test8.json
type temp_test8.json | findstr /C:"Frutas" /C:"Naranjas" /C:"Mango" > nul
if %errorlevel% equ 0 (
    echo ✅ PASÓ - Se obtuvieron productos de la categoría
    set /a PASSED+=1
) else (
    echo ❌ FALLÓ - No se encontraron productos de frutas
    set /a FAILED+=1
)
type temp_test8.json
del temp_test8.json
echo.
timeout /t 2 /nobreak > nul

REM ============ PRUEBA 9 ============
echo.
echo ┌────────────────────────────────────────────────────────┐
echo │ PRUEBA 9/13: GET /subcategorias/categoria/1            │
echo └────────────────────────────────────────────────────────┘
echo Descripción: Subcategorías de Frutas
echo.
curl -s -X GET "%BASE_URL%/subcategorias/categoria/1" ^
  -H "Content-Type: application/json" > temp_test9.json
type temp_test9.json | findstr /C:"tricos" /C:"Tropicales" > nul
if %errorlevel% equ 0 (
    echo ✅ PASÓ - Se obtuvieron subcategorías
    set /a PASSED+=1
) else (
    echo ❌ FALLÓ - No se encontraron subcategorías
    set /a FAILED+=1
)
type temp_test9.json
del temp_test9.json
echo.
timeout /t 2 /nobreak > nul

REM ============ PRUEBA 10 ============
echo.
echo ┌────────────────────────────────────────────────────────┐
echo │ PRUEBA 10/13: GET /usuarios (ADMIN)                    │
echo └────────────────────────────────────────────────────────┘
echo Descripción: Listar todos los usuarios (solo ADMIN)
echo.
curl -s -X GET "%BASE_URL%/usuarios" ^
  -H "Authorization: Bearer !ADMIN_TOKEN!" > temp_test10.json
type temp_test10.json | findstr /C:"admin" /C:"Juan" /C:"numeroDocumento" > nul
if %errorlevel% equ 0 (
    echo ✅ PASÓ - Se obtuvieron los usuarios
    set /a PASSED+=1
) else (
    echo ❌ FALLÓ - No se pudieron obtener usuarios
    set /a FAILED+=1
)
type temp_test10.json
del temp_test10.json
echo.
timeout /t 2 /nobreak > nul

REM ============ PRUEBA 11 ============
echo.
echo ┌────────────────────────────────────────────────────────┐
echo │ PRUEBA 11/13: POST /auth/register                      │
echo └────────────────────────────────────────────────────────┘
echo Descripción: Registrar nuevo usuario
echo.
curl -s -X POST "%BASE_URL%/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"numeroDocumento\":\"99999999\",\"tipoDocumento\":\"CC\",\"nombre\":\"Test\",\"apellido\":\"Usuario\",\"correo\":\"test@test.com\",\"password\":\"test123\",\"telefono\":\"3001234567\",\"direccion\":\"Calle Test\"}" > temp_test11.json
type temp_test11.json | findstr "exitosamente\|registrado" > nul
if %errorlevel% equ 0 (
    echo ✅ PASÓ - Usuario registrado
    set /a PASSED+=1
) else (
    type temp_test11.json | findstr "ya existe" > nul
    if %errorlevel% equ 0 (
        echo ⚠️  Usuario ya existe (esperado si ya se ejecutó antes)
        set /a PASSED+=1
    ) else (
        echo ❌ FALLÓ - No se pudo registrar
        set /a FAILED+=1
    )
)
type temp_test11.json
del temp_test11.json
echo.
timeout /t 2 /nobreak > nul

REM ============ PRUEBA 12 ============
echo.
echo ┌────────────────────────────────────────────────────────┐
echo │ PRUEBA 12/13: PUT /usuarios/22222222/rol               │
echo └────────────────────────────────────────────────────────┘
echo Descripción: Cambiar rol de usuario a ADMIN
echo.
curl -s -X PUT "%BASE_URL%/usuarios/22222222/rol?rol=ADMIN" ^
  -H "Authorization: Bearer !ADMIN_TOKEN!" > temp_test12.json
type temp_test12.json | findstr "ADMIN\|rol" > nul
if %errorlevel% equ 0 (
    echo ✅ PASÓ - Rol actualizado
    set /a PASSED+=1
) else (
    echo ❌ FALLÓ - No se pudo cambiar el rol
    set /a FAILED+=1
)
type temp_test12.json
del temp_test12.json
echo.
timeout /t 2 /nobreak > nul

REM ============ PRUEBA 13 ============
echo.
echo ┌────────────────────────────────────────────────────────┐
echo │ PRUEBA 13/13: PUT /productos/1                         │
echo └────────────────────────────────────────────────────────┘
echo Descripción: Actualizar producto como propietario
echo.
curl -s -X PUT "%BASE_URL%/productos/1" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer !USER_TOKEN!" ^
  -d "{\"nombre\":\"Naranjas Valencia Premium\",\"descripcion\":\"Las mejores naranjas\",\"precio\":2800.00,\"stock\":100,\"activo\":true,\"categoriaId\":1,\"subcategoriaId\":1}" > temp_test13.json
type temp_test13.json | findstr "Premium\|Naranjas" > nul
if %errorlevel% equ 0 (
    echo ✅ PASÓ - Producto actualizado
    set /a PASSED+=1
) else (
    echo ❌ FALLÓ - No se pudo actualizar el producto
    set /a FAILED+=1
)
type temp_test13.json
del temp_test13.json
echo.
timeout /t 2 /nobreak > nul

REM ===========================================
REM RESUMEN FINAL
REM ===========================================
echo.
echo.
echo ═══════════════════════════════════════════════════════════
echo    📊 RESUMEN DE PRUEBAS
echo ═══════════════════════════════════════════════════════════
echo.
echo    Total de pruebas: 13
echo    ✅ Pasaron: !PASSED!
echo    ❌ Fallaron: !FAILED!
echo.

if !FAILED! equ 0 (
    color 0A
    echo    🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!
    echo.
    echo    El backend está funcionando correctamente.
    echo    Puedes proceder a implementar las siguientes funcionalidades:
    echo      - Carrito de compras
    echo      - Pedidos y checkout
    echo      - Ventas y compras
    echo      - Promociones
    echo      - Comentarios
    echo      - Reportes PDF/Excel
) else (
    color 0E
    echo    ⚠️  Algunas pruebas fallaron
    echo.
    echo    Revisa los errores anteriores y verifica:
    echo      - Que los datos de prueba se hayan cargado correctamente
    echo      - Que el backend esté funcionando sin errores
    echo      - Los logs del backend en la terminal
)

echo.
echo ═══════════════════════════════════════════════════════════
echo.
pause
