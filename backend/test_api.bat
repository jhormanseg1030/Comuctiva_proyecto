@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion
echo ===================================
echo   PRUEBAS BACKEND E-COMMERCE
echo ===================================
echo.

REM Variables globales
set BASE_URL=http://localhost:8080/api
set ADMIN_TOKEN=
set USER_TOKEN=

echo [VERIFICACIÓN PREVIA]
echo Verificando que el backend esté corriendo...
curl -s -o nul -w "%%{http_code}" %BASE_URL%/categorias > temp_status.txt
set /p STATUS=<temp_status.txt
del temp_status.txt

if "%STATUS%"=="000" (
    echo ❌ ERROR: El backend NO está corriendo
    echo.
    echo Por favor inicia el backend con:
    echo   cd c:\xampp\htdocs\ecomerce\backend
    echo   mvn spring-boot:run
    echo.
    pause
    exit /b 1
)

echo ✅ Backend corriendo correctamente
echo.
pause

echo.
echo ===================================
echo   PRUEBA 1: GET /categorias
echo ===================================
echo Descripción: Obtener todas las categorías (público)
echo.
curl -X GET "%BASE_URL%/categorias" -H "Content-Type: application/json"
echo.
echo.
pause

echo.
echo ===================================
echo   PRUEBA 2: GET /productos/activos
echo ===================================
echo Descripción: Listar productos activos (público)
echo.
curl -X GET "%BASE_URL%/productos/activos" -H "Content-Type: application/json"
echo.
echo.
pause

echo.
echo ===================================
echo   PRUEBA 3: POST /auth/login (ADMIN)
echo ===================================
echo Descripción: Login como administrador
echo Usuario: admin / Contraseña: admin123
echo.
curl -X POST "%BASE_URL%/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"numeroDocumento\":\"admin\",\"password\":\"admin123\"}" > temp_admin_login.json
type temp_admin_login.json
echo.

REM Extraer token (método simple para Windows batch)
for /f "tokens=2 delims=:," %%a in ('type temp_admin_login.json ^| findstr "token"') do (
    set ADMIN_TOKEN=%%a
    set ADMIN_TOKEN=!ADMIN_TOKEN:"=!
    set ADMIN_TOKEN=!ADMIN_TOKEN: =!
)
echo.
echo Token ADMIN guardado: !ADMIN_TOKEN:~0,50!...
del temp_admin_login.json
echo.
pause

echo.
echo ===================================
echo   PRUEBA 4: POST /auth/login (USER)
echo ===================================
echo Descripción: Login como usuario normal
echo Usuario: 11111111 / Contraseña: admin123
echo.
curl -X POST "%BASE_URL%/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"numeroDocumento\":\"11111111\",\"password\":\"admin123\"}" > temp_user_login.json
type temp_user_login.json
echo.

for /f "tokens=2 delims=:," %%a in ('type temp_user_login.json ^| findstr "token"') do (
    set USER_TOKEN=%%a
    set USER_TOKEN=!USER_TOKEN:"=!
    set USER_TOKEN=!USER_TOKEN: =!
)
echo.
echo Token USER guardado: !USER_TOKEN:~0,50!...
del temp_user_login.json
echo.
pause

echo.
echo ===================================
echo   PRUEBA 5: POST /categorias (ADMIN)
echo ===================================
echo Descripción: Crear nueva categoría con rol ADMIN
echo.
curl -X POST "%BASE_URL%/categorias" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer !ADMIN_TOKEN!" ^
  -d "{\"nombre\":\"Artesanías\",\"descripcion\":\"Productos artesanales locales\",\"activo\":true}"
echo.
echo.
pause

echo.
echo ===================================
echo   PRUEBA 6: POST /categorias (USER)
echo ===================================
echo Descripción: Intentar crear categoría como USER (debe fallar 403)
echo.
curl -X POST "%BASE_URL%/categorias" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer !USER_TOKEN!" ^
  -d "{\"nombre\":\"Categoría No Permitida\",\"descripcion\":\"No debe crearse\",\"activo\":true}"
echo.
echo.
pause

echo.
echo ===================================
echo   PRUEBA 7: GET /productos/usuario/11111111
echo ===================================
echo Descripción: Productos del usuario 11111111
echo.
curl -X GET "%BASE_URL%/productos/usuario/11111111" ^
  -H "Content-Type: application/json"
echo.
echo.
pause

echo.
echo ===================================
echo   PRUEBA 8: GET /productos/categoria/1
echo ===================================
echo Descripción: Productos de la categoría 1 (Frutas)
echo.
curl -X GET "%BASE_URL%/productos/categoria/1" ^
  -H "Content-Type: application/json"
echo.
echo.
pause

echo.
echo ===================================
echo   PRUEBA 9: GET /subcategorias/categoria/1
echo ===================================
echo Descripción: Subcategorías de Frutas
echo.
curl -X GET "%BASE_URL%/subcategorias/categoria/1" ^
  -H "Content-Type: application/json"
echo.
echo.
pause

echo.
echo ===================================
echo   PRUEBA 10: GET /usuarios (ADMIN)
echo ===================================
echo Descripción: Listar todos los usuarios (solo ADMIN)
echo.
curl -X GET "%BASE_URL%/usuarios" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer !ADMIN_TOKEN!"
echo.
echo.
pause

echo.
echo ===================================
echo   PRUEBA 11: POST /auth/register
echo ===================================
echo Descripción: Registrar nuevo usuario
echo.
curl -X POST "%BASE_URL%/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"numeroDocumento\":\"99999999\",\"nombre\":\"Usuario\",\"apellido\":\"Prueba\",\"correo\":\"prueba@test.com\",\"password\":\"test123\",\"telefono\":\"3001234567\",\"direccion\":\"Calle Test 123\",\"rol\":\"USER\"}"
echo.
echo.
pause

echo.
echo ===================================
echo   PRUEBA 12: PUT /usuarios/22222222/rol
echo ===================================
echo Descripción: Cambiar rol de usuario a ADMIN
echo.
curl -X PUT "%BASE_URL%/usuarios/22222222/rol?rol=ADMIN" ^
  -H "Authorization: Bearer !ADMIN_TOKEN!"
echo.
echo.
pause

echo.
echo ===================================
echo   PRUEBA 13: GET /productos/activos (verificar)
echo ===================================
echo Descripción: Verificar productos activos nuevamente
echo.
curl -X GET "%BASE_URL%/productos/activos" ^
  -H "Content-Type: application/json"
echo.
echo.
pause

echo.
echo ===================================
echo   RESUMEN DE PRUEBAS
echo ===================================
echo ✅ Se ejecutaron 13 pruebas del backend
echo.
echo Tokens obtenidos:
echo   - ADMIN: !ADMIN_TOKEN:~0,30!...
echo   - USER:  !USER_TOKEN:~0,30!...
echo.
echo Para más pruebas detalladas, consulta PRUEBAS_COMPLETAS.md
echo.
pause
