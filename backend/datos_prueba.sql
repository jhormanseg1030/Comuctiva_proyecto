-- Script de Pruebas Completas para E-commerce Backend
-- Ejecutar después de que Spring Boot cree las tablas automáticamente

USE ecomerce_db;

-- ============================================
-- 1. INSERTAR USUARIOS DE PRUEBA
-- ============================================
-- Contraseña para todos: admin123 (ya encriptada con BCrypt)
INSERT INTO usuarios (numero_documento, tipo_documento, password, nombre, apellido, telefono, direccion, correo, rol, activo, fecha_registro) VALUES
('admin', 'CC', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7q5OjRSV2', 'Administrador', 'Sistema', '3001111111', 'Calle Admin 100', 'admin@ecomerce.com', 'ADMIN', 1, NOW()),
('11111111', 'CC', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7q5OjRSV2', 'Juan', 'Pérez', '3002222222', 'Carrera 10 #20-30', 'juan@gmail.com', 'USER', 1, NOW()),
('22222222', 'CC', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7q5OjRSV2', 'María', 'García', '3003333333', 'Calle 50 #15-25', 'maria@gmail.com', 'USER', 1, NOW()),
('33333333', 'CE', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7q5OjRSV2', 'Carlos', 'López', '3004444444', 'Avenida 80 #45-60', 'carlos@gmail.com', 'USER', 1, NOW()),
('44444444', 'CC', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7q5OjRSV2', 'Ana', 'Martínez', '3005555555', 'Transversal 30 #12-18', 'ana@gmail.com', 'USER', 0, NOW());

-- ============================================
-- 2. INSERTAR CATEGORÍAS
-- ============================================
INSERT INTO categorias (nombre, descripcion, activo) VALUES
('Frutas', 'Frutas frescas y orgánicas de la región', 1),
('Verduras', 'Verduras y hortalizas cultivadas localmente', 1),
('Lácteos', 'Productos lácteos frescos y derivados', 1),
('Granos', 'Granos, cereales y legumbres', 1),
('Carnes', 'Carnes frescas y procesadas', 1),
('Bebidas', 'Jugos naturales y bebidas', 0);

-- ============================================
-- 3. INSERTAR SUBCATEGORÍAS
-- ============================================
INSERT INTO subcategorias (nombre, descripcion, activo, categoria_id) VALUES
-- Frutas (categoria_id = 1)
('Cítricos', 'Naranjas, limones, mandarinas, toronjas', 1, 1),
('Tropicales', 'Mango, papaya, piña, maracuyá', 1, 1),
('Berries', 'Fresas, moras, arándanos', 1, 1),
('Manzanas', 'Diferentes variedades de manzanas', 1, 1),

-- Verduras (categoria_id = 2)
('Hortalizas de Hoja', 'Lechuga, espinaca, acelga', 1, 2),
('Tubérculos', 'Papa, yuca, zanahoria, remolacha', 1, 2),
('Crucíferas', 'Brócoli, coliflor, repollo', 1, 2),
('Solanáceas', 'Tomate, pimentón, berenjena', 1, 2),

-- Lácteos (categoria_id = 3)
('Leches', 'Leche entera, descremada, deslactosada', 1, 3),
('Quesos', 'Quesos frescos y madurados', 1, 3),
('Yogures', 'Yogur natural, griego, con sabores', 1, 3),

-- Granos (categoria_id = 4)
('Legumbres', 'Frijol, lenteja, garbanzo', 1, 4),
('Cereales', 'Arroz, avena, quinua', 1, 4);

-- ============================================
-- 4. INSERTAR PRODUCTOS
-- ============================================
INSERT INTO productos (nombre, descripcion, precio, stock, fecha_cosecha, activo, fecha_publicacion, categoria_id, subcategoria_id, usuario_documento, imagen_url) VALUES
-- Productos de Juan (11111111)
('Naranjas Valencia', 'Naranjas dulces y jugosas, perfectas para jugo. 1kg', 2500.00, 100, '2024-11-15', 1, NOW(), 1, 1, '11111111', NULL),
('Limones Tahití', 'Limones frescos y ácidos, ideales para cocinar. 500g', 1800.00, 80, '2024-11-10', 1, NOW(), 1, 1, '11111111', NULL),
('Mandarinas Baby', 'Mandarinas pequeñas y dulces, sin semillas. 1kg', 3200.00, 60, '2024-11-18', 1, NOW(), 1, 1, '11111111', NULL),
('Mangos Tommy', 'Mangos maduros, dulces y aromáticos. Unidad', 3500.00, 45, '2024-11-12', 1, NOW(), 1, 2, '11111111', NULL),

-- Productos de María (22222222)
('Lechuga Crespa', 'Lechuga fresca hidropónica. Unidad', 2000.00, 50, '2024-11-20', 1, NOW(), 2, 5, '22222222', NULL),
('Tomates Chonto', 'Tomates maduros para ensaladas. 1kg', 2800.00, 70, '2024-11-19', 1, NOW(), 2, 8, '22222222', NULL),
('Papas Criolla', 'Papas criollas amarillas. 1kg', 3000.00, 120, '2024-11-05', 1, NOW(), 2, 6, '22222222', NULL),
('Zanahorias', 'Zanahorias frescas y crujientes. 500g', 1500.00, 90, '2024-11-17', 1, NOW(), 2, 6, '22222222', NULL),
('Brócoli', 'Brócoli fresco y verde. Unidad', 2500.00, 40, '2024-11-21', 1, NOW(), 2, 7, '22222222', NULL),

-- Productos de Carlos (33333333)
('Fresas Premium', 'Fresas grandes y dulces. 250g', 4500.00, 30, '2024-11-22', 1, NOW(), 1, 3, '33333333', NULL),
('Moras Andinas', 'Moras frescas de los Andes. 250g', 5000.00, 25, '2024-11-22', 1, NOW(), 1, 3, '33333333', NULL),
('Manzanas Red', 'Manzanas rojas importadas. 1kg', 4200.00, 55, '2024-10-28', 1, NOW(), 1, 4, '33333333', NULL),
('Piñas Gold', 'Piñas dulces y jugosas. Unidad', 6000.00, 20, '2024-11-08', 1, NOW(), 1, 2, '33333333', NULL),

-- Productos inactivos
('Aguacates Hass', 'Aguacates maduros. Unidad', 2500.00, 15, '2024-10-15', 1, NOW(), 1, 2, '11111111', NULL),
('Pimentón Rojo', 'Pimentón rojo dulce. 500g', 3500.00, 15, '2024-11-16', 1, NOW(), 2, 8, '22222222', NULL);

-- ============================================
-- 5. INSERTAR PROMOCIONES
-- ============================================
INSERT INTO promociones (producto_id, creador_documento, porcentaje_descuento, precio_promocion, fecha_inicio, fecha_vencimiento, activo, fecha_creacion) VALUES
(1, '11111111', 20.00, 2000.00, '2024-11-20', '2024-11-30', 1, NOW()),
(4, '11111111', 15.00, 2975.00, '2024-11-22', '2024-11-25', 1, NOW()),
(10, '33333333', 25.00, 3375.00, '2024-11-23', '2024-11-26', 1, NOW()),
(6, '22222222', 10.00, 2520.00, '2024-11-15', '2024-11-22', 0, NOW());

-- ============================================
-- 6. INSERTAR ITEMS EN CARRITO
-- ============================================
INSERT INTO carrito (usuario_documento, producto_id, cantidad, precio_unitario, fecha_agregado) VALUES
('11111111', 5, 2, 2000.00, NOW()),
('11111111', 6, 3, 2800.00, NOW()),
('22222222', 1, 5, 2500.00, NOW()),
('22222222', 10, 2, 4500.00, NOW()),
('33333333', 7, 4, 3000.00, NOW());

-- ============================================
-- 7. INSERTAR PEDIDOS
-- ============================================
INSERT INTO pedidos (comprador_documento, fecha_pedido, total, estado, con_flete, costo_flete, direccion_entrega, metodo_pago) VALUES
('11111111', '2024-11-20 10:30:00', 35400.00, 'ENTREGADO', 1, 5000.00, 'Carrera 10 #20-30', 'Efectivo'),
('22222222', '2024-11-21 14:15:00', 28500.00, 'EN_CAMINO', 0, 0.00, 'Calle 50 #15-25 (Recoger en tienda)', 'Tarjeta'),
('33333333', '2024-11-22 09:45:00', 52000.00, 'CONFIRMADO', 1, 8000.00, 'Avenida 80 #45-60', 'Transferencia'),
('11111111', '2024-11-23 11:20:00', 19200.00, 'PENDIENTE', 1, 4000.00, 'Carrera 10 #20-30', 'Efectivo');

-- ============================================
-- 8. INSERTAR DETALLES DE PEDIDOS
-- ============================================
INSERT INTO detalle_pedido (pedido_id, producto_id, vendedor_documento, cantidad, precio_unitario, subtotal) VALUES
-- Pedido 1
(1, 5, '22222222', 3, 2000.00, 6000.00),
(1, 6, '22222222', 4, 2800.00, 11200.00),
(1, 1, '11111111', 5, 2500.00, 12500.00),
(1, 10, '33333333', 2, 4500.00, 9000.00),

-- Pedido 2
(2, 7, '22222222', 3, 3000.00, 9000.00),
(2, 4, '11111111', 4, 3500.00, 14000.00),
(2, 11, '33333333', 1, 5000.00, 5000.00),

-- Pedido 3
(3, 1, '11111111', 8, 2500.00, 20000.00),
(3, 12, '33333333', 4, 4200.00, 16800.00),
(3, 9, '22222222', 3, 2500.00, 7500.00),

-- Pedido 4
(4, 2, '11111111', 5, 1800.00, 9000.00),
(4, 8, '22222222', 4, 1500.00, 6000.00);

-- ============================================
-- 9. INSERTAR VENTAS
-- ============================================
INSERT INTO ventas (vendedor_documento, comprador_documento, producto_id, cantidad, precio_unitario, total, fecha_venta, pedido_id) VALUES
-- Ventas del pedido 1
('22222222', '11111111', 5, 3, 2000.00, 6000.00, '2024-11-20 10:30:00', 1),
('22222222', '11111111', 6, 4, 2800.00, 11200.00, '2024-11-20 10:30:00', 1),
('11111111', '11111111', 1, 5, 2500.00, 12500.00, '2024-11-20 10:30:00', 1),
('33333333', '11111111', 10, 2, 4500.00, 9000.00, '2024-11-20 10:30:00', 1),

-- Ventas del pedido 2
('22222222', '22222222', 7, 3, 3000.00, 9000.00, '2024-11-21 14:15:00', 2),
('11111111', '22222222', 4, 4, 3500.00, 14000.00, '2024-11-21 14:15:00', 2),
('33333333', '22222222', 11, 1, 5000.00, 5000.00, '2024-11-21 14:15:00', 2),

-- Ventas del pedido 3
('11111111', '33333333', 1, 8, 2500.00, 20000.00, '2024-11-22 09:45:00', 3),
('33333333', '33333333', 12, 4, 4200.00, 16800.00, '2024-11-22 09:45:00', 3),
('22222222', '33333333', 9, 3, 2500.00, 7500.00, '2024-11-22 09:45:00', 3);

-- ============================================
-- 10. INSERTAR COMPRAS
-- ============================================
INSERT INTO compras (comprador_documento, producto_id, cantidad, precio_total, fecha_compra, pedido_id, estado) VALUES
-- Compras del usuario 11111111
('11111111', 5, 3, 6000.00, '2024-11-20 10:30:00', 1, 'COMPLETADA'),
('11111111', 6, 4, 11200.00, '2024-11-20 10:30:00', 1, 'COMPLETADA'),
('11111111', 1, 5, 12500.00, '2024-11-20 10:30:00', 1, 'COMPLETADA'),
('11111111', 10, 2, 9000.00, '2024-11-20 10:30:00', 1, 'COMPLETADA'),

-- Compras del usuario 22222222
('22222222', 7, 3, 9000.00, '2024-11-21 14:15:00', 2, 'COMPLETADA'),
('22222222', 4, 4, 14000.00, '2024-11-21 14:15:00', 2, 'COMPLETADA'),
('22222222', 11, 1, 5000.00, '2024-11-21 14:15:00', 2, 'COMPLETADA'),

-- Compras del usuario 33333333
('33333333', 1, 8, 20000.00, '2024-11-22 09:45:00', 3, 'COMPLETADA'),
('33333333', 12, 4, 16800.00, '2024-11-22 09:45:00', 3, 'COMPLETADA'),
('33333333', 9, 3, 7500.00, '2024-11-22 09:45:00', 3, 'COMPLETADA');

-- ============================================
-- 11. INSERTAR COMENTARIOS
-- ============================================
INSERT INTO comentarios (producto_id, usuario_documento, contenido, calificacion, fecha_comentario, activo) VALUES
(1, '11111111', 'Excelentes naranjas, muy jugosas y dulces!', 5, '2024-11-21 15:30:00', 1),
(1, '33333333', 'Buena calidad, llegaron frescas', 4, '2024-11-22 10:15:00', 1),
(5, '11111111', 'Lechuga muy fresca, perfecta para ensaladas', 5, '2024-11-21 16:00:00', 1),
(6, '11111111', 'Tomates buenos pero un poco verdes', 3, '2024-11-21 16:05:00', 1),
(7, '22222222', 'Papas de excelente calidad, recomendadas', 5, '2024-11-22 11:30:00', 1),
(10, '11111111', 'Fresas deliciosas y grandes', 5, '2024-11-21 16:10:00', 1),
(4, '22222222', 'Mangos muy sabrosos y en su punto', 5, '2024-11-22 12:00:00', 1),
(12, '33333333', 'Manzanas crujientes, me encantaron', 4, '2024-11-23 09:00:00', 1);

-- ============================================
-- CONSULTAS DE VERIFICACIÓN
-- ============================================

-- Ver todos los usuarios
SELECT numero_documento, nombre, apellido, correo, rol, activo FROM usuarios;

-- Ver todas las categorías con subcategorías
SELECT c.nombre AS categoria, s.nombre AS subcategoria, s.activo
FROM categorias c
LEFT JOIN subcategorias s ON c.id = s.categoria_id
ORDER BY c.nombre, s.nombre;

-- Ver productos con sus categorías y vendedores
SELECT p.id, p.nombre, p.precio, p.stock, c.nombre AS categoria, s.nombre AS subcategoria,
       CONCAT(u.nombre, ' ', u.apellido) AS vendedor, p.activo
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
JOIN subcategorias s ON p.subcategoria_id = s.id
JOIN usuarios u ON p.usuario_documento = u.numero_documento
ORDER BY p.id;

-- Ver promociones vigentes
SELECT p.nombre AS producto, pr.porcentaje_descuento, p.precio AS precio_original,
       pr.precio_promocion, pr.fecha_inicio, pr.fecha_vencimiento
FROM promociones pr
JOIN productos p ON pr.producto_id = p.id
WHERE pr.activo = 1 AND pr.fecha_vencimiento >= CURDATE()
ORDER BY pr.fecha_vencimiento;

-- Ver pedidos con totales
SELECT ped.id, CONCAT(u.nombre, ' ', u.apellido) AS comprador,
       ped.fecha_pedido, ped.total, ped.estado, ped.metodo_pago
FROM pedidos ped
JOIN usuarios u ON ped.comprador_documento = u.numero_documento
ORDER BY ped.fecha_pedido DESC;

-- Ver detalles de un pedido específico
SELECT ped.id AS pedido, dp.cantidad, p.nombre AS producto,
       dp.precio_unitario, dp.subtotal, CONCAT(v.nombre, ' ', v.apellido) AS vendedor
FROM detalle_pedido dp
JOIN pedidos ped ON dp.pedido_id = ped.id
JOIN productos p ON dp.producto_id = p.id
JOIN usuarios v ON dp.vendedor_documento = v.numero_documento
WHERE ped.id = 1;

-- Ver ventas por vendedor
SELECT CONCAT(v.nombre, ' ', v.apellido) AS vendedor,
       COUNT(ve.id) AS total_ventas,
       SUM(ve.cantidad) AS unidades_vendidas,
       SUM(ve.total) AS monto_total
FROM ventas ve
JOIN usuarios v ON ve.vendedor_documento = v.numero_documento
GROUP BY v.numero_documento, v.nombre, v.apellido
ORDER BY monto_total DESC;

-- Ver comentarios de productos
SELECT p.nombre AS producto, CONCAT(u.nombre, ' ', u.apellido) AS usuario,
       c.calificacion, c.contenido, c.fecha_comentario
FROM comentarios c
JOIN productos p ON c.producto_id = p.id
JOIN usuarios u ON c.usuario_documento = u.numero_documento
WHERE c.activo = 1
ORDER BY c.fecha_comentario DESC;

-- Ver carrito actual por usuario
SELECT CONCAT(u.nombre, ' ', u.apellido) AS usuario, p.nombre AS producto,
       ca.cantidad, ca.precio_unitario, (ca.cantidad * ca.precio_unitario) AS subtotal
FROM carrito ca
JOIN usuarios u ON ca.usuario_documento = u.numero_documento
JOIN productos p ON ca.producto_id = p.id
ORDER BY u.nombre, p.nombre;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
