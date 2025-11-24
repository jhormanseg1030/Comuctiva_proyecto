-- Actualizar passwords con BCrypt hash correcto para admin123
USE ecomerce_db;

-- Hash BCrypt para "admin123": $2a$10$MKmQRNNOrXjra.KYhsu7JO9FVjsBlesYG0zQJnzni3nfHw2SXTVzK
UPDATE usuarios 
SET password = '$2a$10$MKmQRNNOrXjra.KYhsu7JO9FVjsBlesYG0zQJnzni3nfHw2SXTVzK'
WHERE numero_documento IN ('admin', '11111111', '22222222', '33333333', '44444444');

SELECT numero_documento, nombre, 'Password actualizado' as status FROM usuarios 
WHERE numero_documento IN ('admin', '11111111', '22222222', '33333333', '44444444');
