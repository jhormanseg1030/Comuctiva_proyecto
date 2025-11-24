@echo off
chcp 65001 > nul
echo ====================================
echo PRUEBAS DE NUEVOS MÓDULOS BACKEND
echo ====================================
echo.

set API_URL=http://localhost:8080/api
set TOKEN=

REM --- 1. Login para obtener token ---
echo [1/15] Login de usuario...
curl -X POST "%API_URL%/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"numeroDocumento\":\"12345678\",\"password\":\"password123\"}" > temp_login.json 2>nul

for /f "tokens=2 delims=:," %%a in ('type temp_login.json ^| findstr /r "\"token\""') do (
    set TOKEN=%%a
    set TOKEN=!TOKEN:"=!
    set TOKEN=!TOKEN: =!
)

if "%TOKEN%"=="" (
    echo ERROR: No se pudo obtener el token
    del temp_login.json 2>nul
    pause
    exit /b 1
)

echo ✓ Login exitoso
echo.

REM --- 2. MÓDULO CARRITO ---
echo ====================================
echo PRUEBAS MÓDULO CARRITO
echo ====================================
echo.

REM Agregar producto al carrito
echo [2/15] Agregar producto al carrito...
curl -X POST "%API_URL%/carrito/agregar" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"productoId\":1,\"cantidad\":2}" > temp_carrito1.json 2>nul

type temp_carrito1.json | findstr /c:"subtotal" >nul
if %errorlevel%==0 (
    echo ✓ Producto agregado al carrito
) else (
    echo ✗ Error al agregar producto
)
echo.

REM Ver carrito
echo [3/15] Ver carrito actual...
curl -X GET "%API_URL%/carrito" ^
  -H "Authorization: Bearer %TOKEN%" > temp_carrito2.json 2>nul

type temp_carrito2.json | findstr /c:"total" >nul
if %errorlevel%==0 (
    echo ✓ Carrito obtenido
) else (
    echo ✗ Error al obtener carrito
)
echo.

REM Agregar otro producto
echo [4/15] Agregar otro producto...
curl -X POST "%API_URL%/carrito/agregar" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"productoId\":2,\"cantidad\":1}" > temp_carrito3.json 2>nul

type temp_carrito3.json | findstr /c:"subtotal" >nul
if %errorlevel%==0 (
    echo ✓ Segundo producto agregado
) else (
    echo ✗ Error al agregar segundo producto
)
echo.

REM --- 3. MÓDULO PEDIDOS ---
echo ====================================
echo PRUEBAS MÓDULO PEDIDOS
echo ====================================
echo.

REM Crear pedido desde carrito
echo [5/15] Crear pedido desde carrito...
curl -X POST "%API_URL%/pedidos/crear" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"direccionEntrega\":\"Calle 123 #45-67\",\"costoFlete\":5000}" > temp_pedido1.json 2>nul

for /f "tokens=2 delims=:," %%a in ('type temp_pedido1.json ^| findstr /r "\"id\""') do (
    set PEDIDO_ID=%%a
    set PEDIDO_ID=!PEDIDO_ID: =!
)

type temp_pedido1.json | findstr /c:"total" >nul
if %errorlevel%==0 (
    echo ✓ Pedido creado (ID: %PEDIDO_ID%)
) else (
    echo ✗ Error al crear pedido
)
echo.

REM Ver mis pedidos
echo [6/15] Ver mis pedidos...
curl -X GET "%API_URL%/pedidos/mis-pedidos" ^
  -H "Authorization: Bearer %TOKEN%" > temp_pedido2.json 2>nul

type temp_pedido2.json | findstr /c:"estado" >nul
if %errorlevel%==0 (
    echo ✓ Pedidos obtenidos
) else (
    echo ✗ Error al obtener pedidos
)
echo.

REM Ver detalle de pedido
echo [7/15] Ver detalle de pedido...
curl -X GET "%API_URL%/pedidos/%PEDIDO_ID%" ^
  -H "Authorization: Bearer %TOKEN%" > temp_pedido3.json 2>nul

type temp_pedido3.json | findstr /c:"detalles" >nul
if %errorlevel%==0 (
    echo ✓ Detalle de pedido obtenido
) else (
    echo ✗ Error al obtener detalle
)
echo.

REM --- 4. MÓDULO COMENTARIOS ---
echo ====================================
echo PRUEBAS MÓDULO COMENTARIOS
echo ====================================
echo.

REM Crear comentario
echo [8/15] Crear comentario en producto...
curl -X POST "%API_URL%/comentarios" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"productoId\":1,\"contenido\":\"Excelente producto, muy buena calidad\",\"calificacion\":5}" > temp_comentario1.json 2>nul

type temp_comentario1.json | findstr /c:"contenido" >nul
if %errorlevel%==0 (
    echo ✓ Comentario creado
) else (
    echo ✗ Error al crear comentario
)
echo.

REM Ver comentarios del producto
echo [9/15] Ver comentarios del producto...
curl -X GET "%API_URL%/comentarios/producto/1" ^
  -H "Authorization: Bearer %TOKEN%" > temp_comentario2.json 2>nul

type temp_comentario2.json | findstr /c:"promedioCalificacion" >nul
if %errorlevel%==0 (
    echo ✓ Comentarios obtenidos
) else (
    echo ✗ Error al obtener comentarios
)
echo.

REM Ver mis comentarios
echo [10/15] Ver mis comentarios...
curl -X GET "%API_URL%/comentarios/mis-comentarios" ^
  -H "Authorization: Bearer %TOKEN%" > temp_comentario3.json 2>nul

type temp_comentario3.json | findstr /c:"contenido" >nul
if %errorlevel%==0 (
    echo ✓ Mis comentarios obtenidos
) else (
    echo ✗ Error al obtener mis comentarios
)
echo.

REM --- 5. PRUEBAS ADICIONALES CARRITO ---
echo ====================================
echo PRUEBAS ADICIONALES CARRITO
echo ====================================
echo.

REM Agregar producto para actualizar
echo [11/15] Agregar producto para actualizar...
curl -X POST "%API_URL%/carrito/agregar" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"productoId\":3,\"cantidad\":1}" > temp_carrito4.json 2>nul

for /f "tokens=2 delims=:," %%a in ('type temp_carrito4.json ^| findstr /r "\"id\""') do (
    set CARRITO_ID=%%a
    set CARRITO_ID=!CARRITO_ID: =!
)

echo ✓ Producto agregado (Carrito ID: %CARRITO_ID%)
echo.

REM Actualizar cantidad
echo [12/15] Actualizar cantidad en carrito...
curl -X PUT "%API_URL%/carrito/%CARRITO_ID%" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"cantidad\":3}" > temp_carrito5.json 2>nul

type temp_carrito5.json | findstr /c:"cantidad" >nul
if %errorlevel%==0 (
    echo ✓ Cantidad actualizada
) else (
    echo ✗ Error al actualizar cantidad
)
echo.

REM Ver carrito actualizado
echo [13/15] Ver carrito actualizado...
curl -X GET "%API_URL%/carrito" ^
  -H "Authorization: Bearer %TOKEN%" > temp_carrito6.json 2>nul

type temp_carrito6.json | findstr /c:"total" >nul
if %errorlevel%==0 (
    echo ✓ Carrito actualizado obtenido
) else (
    echo ✗ Error al obtener carrito actualizado
)
echo.

REM Eliminar item del carrito
echo [14/15] Eliminar item del carrito...
curl -X DELETE "%API_URL%/carrito/%CARRITO_ID%" ^
  -H "Authorization: Bearer %TOKEN%" > temp_carrito7.json 2>nul

type temp_carrito7.json | findstr /c:"eliminado" >nul
if %errorlevel%==0 (
    echo ✓ Item eliminado del carrito
) else (
    echo ✗ Error al eliminar item
)
echo.

REM Vaciar carrito
echo [15/15] Vaciar carrito completo...
curl -X DELETE "%API_URL%/carrito/vaciar" ^
  -H "Authorization: Bearer %TOKEN%" > temp_carrito8.json 2>nul

type temp_carrito8.json | findstr /c:"vaciado" >nul
if %errorlevel%==0 (
    echo ✓ Carrito vaciado
) else (
    echo ✗ Error al vaciar carrito
)
echo.

REM --- Limpieza ---
del temp_*.json 2>nul

echo ====================================
echo PRUEBAS COMPLETADAS
echo ====================================
echo.
echo Resumen: 
echo - Módulo Carrito: Funciones de agregar, actualizar, eliminar y vaciar
echo - Módulo Pedidos: Crear pedido desde carrito, ver pedidos y detalle
echo - Módulo Comentarios: Crear y ver comentarios con calificación
echo.
pause
