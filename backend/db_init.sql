-- Base de datos para E-commerce
-- Se crea automáticamente por Spring Boot, este script es de referencia

CREATE DATABASE IF NOT EXISTS ecomerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ecomerce_db;

-- Tabla de usuarios
-- Se crea automáticamente por JPA

-- Insertar usuario administrador de prueba
-- Contraseña: admin123 (encriptada con BCrypt)
INSERT INTO usuarios (numero_documento, tipo_documento, password, nombre, apellido, telefono, direccion, correo, rol, activo, fecha_registro)
VALUES 
('admin', 'CC', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7q5OjRSV2', 'Administrador', 'Sistema', '3001234567', 'Calle Admin 123', 'admin@ecomerce.com', 'ADMIN', 1, NOW()),
('12345678', 'CC', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7q5OjRSV2', 'Usuario', 'Prueba', '3009876543', 'Calle User 456', 'user@ecomerce.com', 'USER', 1, NOW())
ON DUPLICATE KEY UPDATE numero_documento=numero_documento;

-- Insertar categorías de ejemplo
INSERT INTO categorias (nombre, descripcion, activo) VALUES
('Frutas', 'Frutas frescas y orgánicas', 1),
('Verduras', 'Verduras y hortalizas', 1),
('Lácteos', 'Productos lácteos', 1),
('Carnes', 'Carnes y embutidos', 1),
('Granos', 'Granos y cereales', 1)
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Insertar subcategorías de ejemplo
INSERT INTO subcategorias (nombre, descripcion, activo, categoria_id) VALUES
('Cítricos', 'Naranjas, limones, mandarinas', 1, 1),
('Tropicales', 'Mango, papaya, piña', 1, 1),
('Hortalizas', 'Lechuga, tomate, pepino', 1, 2),
('Tubérculos', 'Papa, yuca, zanahoria', 1, 2),
('Leche', 'Leche entera, deslactosada', 1, 3)
ON DUPLICATE KEY UPDATE nombre=nombre;
