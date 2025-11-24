# Test completo de módulos del backend E-commerce
$API_URL = "http://localhost:8080/api"
$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  TEST COMPLETO BACKEND E-COMMERCE" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$tests_passed = 0
$tests_failed = 0

# Test 1: Login
Write-Host "--- MODULO: AUTENTICACION ---" -ForegroundColor Magenta
Write-Host ""
Write-Host "Test 1: Login de usuario..." -ForegroundColor Yellow
$loginBody = @{ numeroDocumento = "12345678"; password = "password123" } | ConvertTo-Json
try {
    $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $TOKEN = $loginResponse.token
    Write-Host "   OK - Login exitoso" -ForegroundColor Green
    $tests_passed++
} catch {
    Write-Host "   FAIL - Error en login" -ForegroundColor Red
    $tests_failed++
    exit 1
}

$headers = @{ "Authorization" = "Bearer $TOKEN"; "Content-Type" = "application/json" }
Write-Host ""

# Test 2-3: Categorías
Write-Host "--- MODULO: CATEGORIAS ---" -ForegroundColor Magenta
Write-Host ""
Write-Host "Test 2: Obtener categorías..." -ForegroundColor Yellow
try {
    $categorias = Invoke-RestMethod -Uri "$API_URL/categorias" -Method Get
    Write-Host "   OK - Categorías: $($categorias.Count)" -ForegroundColor Green
    $CATEGORIA_ID = $categorias[0].id
    $tests_passed++
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}

Write-Host "Test 3: Obtener categoría por ID..." -ForegroundColor Yellow
try {
    $categoria = Invoke-RestMethod -Uri "$API_URL/categorias/$CATEGORIA_ID" -Method Get
    Write-Host "   OK - Categoría: $($categoria.nombre)" -ForegroundColor Green
    $tests_passed++
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}
Write-Host ""

# Test 4-5: Subcategorías
Write-Host "--- MODULO: SUBCATEGORIAS ---" -ForegroundColor Magenta
Write-Host ""
Write-Host "Test 4: Obtener subcategorías..." -ForegroundColor Yellow
try {
    $subcategorias = Invoke-RestMethod -Uri "$API_URL/subcategorias" -Method Get
    Write-Host "   OK - Subcategorías: $($subcategorias.Count)" -ForegroundColor Green
    if ($subcategorias.Count -gt 0) { $SUBCATEGORIA_ID = $subcategorias[0].id }
    $tests_passed++
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}

Write-Host "Test 5: Subcategorías por categoría..." -ForegroundColor Yellow
try {
    $subcats = Invoke-RestMethod -Uri "$API_URL/subcategorias/categoria/$CATEGORIA_ID" -Method Get
    Write-Host "   OK - Subcategorías: $($subcats.Count)" -ForegroundColor Green
    $tests_passed++
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}
Write-Host ""

# Test 6-8: Productos
Write-Host "--- MODULO: PRODUCTOS ---" -ForegroundColor Magenta
Write-Host ""
Write-Host "Test 6: Obtener productos..." -ForegroundColor Yellow
try {
    $productos = Invoke-RestMethod -Uri "$API_URL/productos" -Method Get
    Write-Host "   OK - Productos: $($productos.Count)" -ForegroundColor Green
    if ($productos.Count -gt 0) {
        $PRODUCTO_ID_1 = $productos[0].id
        $PRODUCTO_ID_2 = if ($productos.Count -gt 1) { $productos[1].id } else { $productos[0].id }
    }
    $tests_passed++
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}

Write-Host "Test 7: Producto por ID..." -ForegroundColor Yellow
try {
    $producto = Invoke-RestMethod -Uri "$API_URL/productos/$PRODUCTO_ID_1" -Method Get
    Write-Host "   OK - Producto: $($producto.nombre)" -ForegroundColor Green
    $tests_passed++
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}

Write-Host "Test 8: Productos por categoría..." -ForegroundColor Yellow
try {
    $prods = Invoke-RestMethod -Uri "$API_URL/productos/categoria/$CATEGORIA_ID" -Method Get
    Write-Host "   OK - Productos: $($prods.Count)" -ForegroundColor Green
    $tests_passed++
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}
Write-Host ""

# Test 9-13: Carrito
Write-Host "--- MODULO: CARRITO ---" -ForegroundColor Magenta
Write-Host ""
Write-Host "Test 9: Ver carrito inicial..." -ForegroundColor Yellow
try {
    $carrito = Invoke-RestMethod -Uri "$API_URL/carrito" -Method Get -Headers $headers
    Write-Host "   OK - Items: $($carrito.items.Count)" -ForegroundColor Green
    $tests_passed++
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}

Write-Host "Test 10: Agregar primer producto..." -ForegroundColor Yellow
$carritoBody1 = @{ productoId = $PRODUCTO_ID_1; cantidad = 2 } | ConvertTo-Json
try {
    $carritoResp1 = Invoke-RestMethod -Uri "$API_URL/carrito/agregar" -Method Post -Body $carritoBody1 -Headers $headers
    Write-Host "   OK - Subtotal: $($carritoResp1.subtotal)" -ForegroundColor Green
    $CARRITO_ITEM_ID = $carritoResp1.id
    $tests_passed++
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}

Write-Host "Test 11: Agregar segundo producto..." -ForegroundColor Yellow
$carritoBody2 = @{ productoId = $PRODUCTO_ID_2; cantidad = 1 } | ConvertTo-Json
try {
    $carritoResp2 = Invoke-RestMethod -Uri "$API_URL/carrito/agregar" -Method Post -Body $carritoBody2 -Headers $headers
    Write-Host "   OK - Subtotal: $($carritoResp2.subtotal)" -ForegroundColor Green
    $tests_passed++
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}

Write-Host "Test 12: Ver carrito con productos..." -ForegroundColor Yellow
try {
    $carrito = Invoke-RestMethod -Uri "$API_URL/carrito" -Method Get -Headers $headers
    Write-Host "   OK - Items: $($carrito.items.Count), Total: $($carrito.total)" -ForegroundColor Green
    $tests_passed++
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}

Write-Host "Test 13: Actualizar cantidad..." -ForegroundColor Yellow
$updateBody = @{ cantidad = 3 } | ConvertTo-Json
try {
    $updated = Invoke-RestMethod -Uri "$API_URL/carrito/$CARRITO_ITEM_ID" -Method Put -Body $updateBody -Headers $headers
    Write-Host "   OK - Cantidad: $($updated.cantidad)" -ForegroundColor Green
    $tests_passed++
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}
Write-Host ""

# Test 14-17: Pedidos
Write-Host "--- MODULO: PEDIDOS ---" -ForegroundColor Magenta
Write-Host ""
Write-Host "Test 14: Crear pedido..." -ForegroundColor Yellow
$pedidoBody = @{ direccionEntrega = "Calle Principal 123"; costoFlete = "5000" } | ConvertTo-Json
try {
    $pedido = Invoke-RestMethod -Uri "$API_URL/pedidos/crear" -Method Post -Body $pedidoBody -Headers $headers
    $PEDIDO_ID = $pedido.id
    Write-Host "   OK - Pedido ID: $PEDIDO_ID, Total: $($pedido.total)" -ForegroundColor Green
    $tests_passed++
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}

Write-Host "Test 15: Ver mis pedidos..." -ForegroundColor Yellow
try {
    $pedidos = Invoke-RestMethod -Uri "$API_URL/pedidos/mis-pedidos" -Method Get -Headers $headers
    Write-Host "   OK - Pedidos: $($pedidos.Count)" -ForegroundColor Green
    $tests_passed++
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}

Write-Host "Test 16: Ver detalle pedido..." -ForegroundColor Yellow
try {
    $detallePedido = Invoke-RestMethod -Uri "$API_URL/pedidos/$PEDIDO_ID" -Method Get -Headers $headers
    Write-Host "   OK - Items: $($detallePedido.detalles.Count)" -ForegroundColor Green
    $tests_passed++
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}

Write-Host "Test 17: Verificar carrito vació..." -ForegroundColor Yellow
try {
    $carritoVacio = Invoke-RestMethod -Uri "$API_URL/carrito" -Method Get -Headers $headers
    if ($carritoVacio.items.Count -eq 0) {
        Write-Host "   OK - Carrito vacío" -ForegroundColor Green
        $tests_passed++
    } else {
        Write-Host "   FAIL - Carrito tiene items" -ForegroundColor Red
        $tests_failed++
    }
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}
Write-Host ""

# Test 18-21: Comentarios
Write-Host "--- MODULO: COMENTARIOS ---" -ForegroundColor Magenta
Write-Host ""
Write-Host "Test 18: Crear comentario..." -ForegroundColor Yellow
$comentarioBody = @{ productoId = $PRODUCTO_ID_1; contenido = "Excelente producto"; calificacion = 5 } | ConvertTo-Json
try {
    $comentario = Invoke-RestMethod -Uri "$API_URL/comentarios" -Method Post -Body $comentarioBody -Headers $headers
    $COMENTARIO_ID = $comentario.id
    Write-Host "   OK - Comentario ID: $COMENTARIO_ID" -ForegroundColor Green
    $tests_passed++
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}

Write-Host "Test 19: Ver comentarios producto..." -ForegroundColor Yellow
try {
    $comentarios = Invoke-RestMethod -Uri "$API_URL/comentarios/producto/$PRODUCTO_ID_1" -Method Get -Headers $headers
    Write-Host "   OK - Comentarios: $($comentarios.totalComentarios), Promedio: $($comentarios.promedioCalificacion)" -ForegroundColor Green
    $tests_passed++
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}

Write-Host "Test 20: Ver mis comentarios..." -ForegroundColor Yellow
try {
    $misComentarios = Invoke-RestMethod -Uri "$API_URL/comentarios/mis-comentarios" -Method Get -Headers $headers
    Write-Host "   OK - Mis comentarios: $($misComentarios.Count)" -ForegroundColor Green
    $tests_passed++
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}

Write-Host "Test 21: Actualizar comentario..." -ForegroundColor Yellow
$updateComentario = @{ contenido = "Producto excelente actualizado"; calificacion = 5 } | ConvertTo-Json
try {
    $comentarioUpd = Invoke-RestMethod -Uri "$API_URL/comentarios/$COMENTARIO_ID" -Method Put -Body $updateComentario -Headers $headers
    Write-Host "   OK - Comentario actualizado" -ForegroundColor Green
    $tests_passed++
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}
Write-Host ""

# Test 22: Usuario
Write-Host "--- MODULO: USUARIOS ---" -ForegroundColor Magenta
Write-Host ""
Write-Host "Test 22: Obtener perfil..." -ForegroundColor Yellow
try {
    $miPerfil = Invoke-RestMethod -Uri "$API_URL/usuarios/12345678" -Method Get -Headers $headers
    Write-Host "   OK - Usuario: $($miPerfil.nombres) $($miPerfil.apellidos)" -ForegroundColor Green
    $tests_passed++
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}
Write-Host ""

# Test 23-26: Relaciones
Write-Host "--- MODULO: RELACIONES ---" -ForegroundColor Magenta
Write-Host ""
Write-Host "Test 23: Producto-Categoría..." -ForegroundColor Yellow
try {
    $prod = Invoke-RestMethod -Uri "$API_URL/productos/$PRODUCTO_ID_1" -Method Get
    if ($prod.categoria) {
        Write-Host "   OK - Categoría: $($prod.categoria.nombre)" -ForegroundColor Green
        $tests_passed++
    } else {
        Write-Host "   FAIL - Sin categoría" -ForegroundColor Red
        $tests_failed++
    }
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}

Write-Host "Test 24: Producto-Subcategoría..." -ForegroundColor Yellow
try {
    $prod = Invoke-RestMethod -Uri "$API_URL/productos/$PRODUCTO_ID_1" -Method Get
    if ($prod.subcategoria) {
        Write-Host "   OK - Subcategoría: $($prod.subcategoria.nombre)" -ForegroundColor Green
        $tests_passed++
    } else {
        Write-Host "   WARN - Sin subcategoría (opcional)" -ForegroundColor Yellow
        $tests_passed++
    }
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}

Write-Host "Test 25: Pedido-DetallePedido..." -ForegroundColor Yellow
try {
    $ped = Invoke-RestMethod -Uri "$API_URL/pedidos/$PEDIDO_ID" -Method Get -Headers $headers
    if ($ped.detalles -and $ped.detalles.Count -gt 0) {
        Write-Host "   OK - Detalles: $($ped.detalles.Count)" -ForegroundColor Green
        $tests_passed++
    } else {
        Write-Host "   FAIL - Sin detalles" -ForegroundColor Red
        $tests_failed++
    }
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}

Write-Host "Test 26: Comentario-Usuario-Producto..." -ForegroundColor Yellow
try {
    $com = Invoke-RestMethod -Uri "$API_URL/comentarios/mis-comentarios" -Method Get -Headers $headers
    if ($com.Count -gt 0 -and $com[0].usuarioNumeroDocumento -and $com[0].productoNombre) {
        Write-Host "   OK - Relaciones correctas" -ForegroundColor Green
        $tests_passed++
    } else {
        Write-Host "   FAIL - Relaciones incompletas" -ForegroundColor Red
        $tests_failed++
    }
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}
Write-Host ""

# Test 27: Cancelación
Write-Host "--- MODULO: CANCELACION ---" -ForegroundColor Magenta
Write-Host ""
Write-Host "Test 27: Cancelar pedido..." -ForegroundColor Yellow
try {
    $cancelado = Invoke-RestMethod -Uri "$API_URL/pedidos/$PEDIDO_ID/cancelar" -Method Put -Headers $headers
    if ($cancelado.estado -eq "CANCELADO") {
        Write-Host "   OK - Pedido cancelado" -ForegroundColor Green
        $tests_passed++
    } else {
        Write-Host "   FAIL - Estado: $($cancelado.estado)" -ForegroundColor Red
        $tests_failed++
    }
} catch {
    Write-Host "   FAIL - Error" -ForegroundColor Red
    $tests_failed++
}
Write-Host ""

# RESUMEN
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  RESUMEN DE PRUEBAS" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$total_tests = $tests_passed + $tests_failed
$porcentaje = [math]::Round(($tests_passed / $total_tests) * 100, 2)

Write-Host "Total pruebas: $total_tests" -ForegroundColor White
Write-Host "Exitosas: $tests_passed" -ForegroundColor Green
Write-Host "Fallidas: $tests_failed" -ForegroundColor Red
Write-Host "Éxito: $porcentaje%" -ForegroundColor $(if ($porcentaje -ge 90) { "Green" } elseif ($porcentaje -ge 70) { "Yellow" } else { "Red" })
Write-Host ""

if ($tests_failed -eq 0) {
    Write-Host "TODAS LAS PRUEBAS EXITOSAS" -ForegroundColor Green
    Write-Host "Backend completamente funcional" -ForegroundColor Green
} else {
    Write-Host "ALGUNAS PRUEBAS FALLARON" -ForegroundColor Yellow
}
Write-Host ""
