# Script de prueba para nuevos módulos del backend
$API_URL = "http://localhost:8080/api"
$ErrorActionPreference = "Continue"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "PRUEBAS DE NUEVOS MÓDULOS BACKEND" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 1. Login
Write-Host "[1/10] Login de usuario..." -ForegroundColor Yellow
$loginBody = '{"numeroDocumento":"12345678","password":"password123"}'
try {
    $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $TOKEN = $loginResponse.token
    Write-Host "✓ Login exitoso" -ForegroundColor Green
    Write-Host "Token: $TOKEN" -ForegroundColor Gray
} catch {
    Write-Host "✗ Error en login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

# 2. Agregar al carrito
Write-Host "[2/10] Agregar producto al carrito..." -ForegroundColor Yellow
$carritoBody = '{"productoId":1,"cantidad":2}'
try {
    $carritoResp = Invoke-RestMethod -Uri "$API_URL/carrito/agregar" -Method Post -Body $carritoBody -Headers $headers
    Write-Host "✓ Producto agregado - Subtotal: $($carritoResp.subtotal)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al agregar: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 3. Ver carrito
Write-Host "[3/10] Ver carrito..." -ForegroundColor Yellow
try {
    $carrito = Invoke-RestMethod -Uri "$API_URL/carrito" -Method Get -Headers $headers
    Write-Host "✓ Carrito obtenido - Items: $($carrito.items.Count) - Total: $($carrito.total)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al ver carrito: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 4. Agregar otro producto
Write-Host "[4/10] Agregar segundo producto..." -ForegroundColor Yellow
$carritoBody2 = '{"productoId":2,"cantidad":1}'
try {
    $carritoResp2 = Invoke-RestMethod -Uri "$API_URL/carrito/agregar" -Method Post -Body $carritoBody2 -Headers $headers
    Write-Host "✓ Segundo producto agregado - Subtotal: $($carritoResp2.subtotal)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al agregar segundo producto: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 5. Crear pedido
Write-Host "[5/10] Crear pedido desde carrito..." -ForegroundColor Yellow
$pedidoBody = '{"direccionEntrega":"Calle 123 #45-67","costoFlete":"5000"}'
try {
    $pedido = Invoke-RestMethod -Uri "$API_URL/pedidos/crear" -Method Post -Body $pedidoBody -Headers $headers
    $PEDIDO_ID = $pedido.id
    Write-Host "✓ Pedido creado - ID: $PEDIDO_ID - Total: $($pedido.total)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al crear pedido: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 6. Ver mis pedidos
Write-Host "[6/10] Ver mis pedidos..." -ForegroundColor Yellow
try {
    $pedidos = Invoke-RestMethod -Uri "$API_URL/pedidos/mis-pedidos" -Method Get -Headers $headers
    Write-Host "✓ Pedidos obtenidos - Cantidad: $($pedidos.Count)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al obtener pedidos: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 7. Ver detalle pedido
if ($PEDIDO_ID) {
    Write-Host "[7/10] Ver detalle de pedido..." -ForegroundColor Yellow
    try {
        $detalle = Invoke-RestMethod -Uri "$API_URL/pedidos/$PEDIDO_ID" -Method Get -Headers $headers
        Write-Host "✓ Detalle obtenido - Detalles: $($detalle.detalles.Count) items" -ForegroundColor Green
    } catch {
        Write-Host "✗ Error al obtener detalle: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# 8. Crear comentario
Write-Host "[8/10] Crear comentario..." -ForegroundColor Yellow
$comentarioBody = '{"productoId":1,"contenido":"Excelente producto","calificacion":5}'
try {
    $comentario = Invoke-RestMethod -Uri "$API_URL/comentarios" -Method Post -Body $comentarioBody -Headers $headers
    Write-Host "✓ Comentario creado - ID: $($comentario.id)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al crear comentario: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 9. Ver comentarios del producto
Write-Host "[9/10] Ver comentarios del producto..." -ForegroundColor Yellow
try {
    $comentarios = Invoke-RestMethod -Uri "$API_URL/comentarios/producto/1" -Method Get -Headers $headers
    Write-Host "✓ Comentarios obtenidos - Total: $($comentarios.totalComentarios) - Promedio: $($comentarios.promedioCalificacion)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al obtener comentarios: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 10. Ver mis comentarios
Write-Host "[10/10] Ver mis comentarios..." -ForegroundColor Yellow
try {
    $misComentarios = Invoke-RestMethod -Uri "$API_URL/comentarios/mis-comentarios" -Method Get -Headers $headers
    Write-Host "✓ Mis comentarios obtenidos - Cantidad: $($misComentarios.Count)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al obtener mis comentarios: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "PRUEBAS COMPLETADAS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
