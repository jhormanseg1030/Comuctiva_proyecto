-- Script para activar los productos que estaban marcados como inactivos
USE ecomerce_db;

-- Activar productos específicos que estaban causando problemas
UPDATE productos 
SET activo = 1, stock = 15 
WHERE nombre IN ('Aguacates Hass', 'Pimentón Rojo');

-- Verificar que se actualizaron correctamente
SELECT id, nombre, precio, stock, activo, fecha_publicacion 
FROM productos 
WHERE nombre IN ('Aguacates Hass', 'Pimentón Rojo');

-- También activar todos los productos que tengan stock > 0 pero estén inactivos
UPDATE productos 
SET activo = 1 
WHERE stock > 0 AND activo = 0;

-- Mostrar todos los productos activos
SELECT id, nombre, precio, stock, activo 
FROM productos 
WHERE activo = 1 
ORDER BY id;