-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: ecomerce_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `carrito`
--

DROP TABLE IF EXISTS `carrito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `carrito` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) NOT NULL,
  `fecha_agregado` datetime(6) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `producto_id` bigint(20) NOT NULL,
  `usuario_documento` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKa66gl3j7wnlwyc1i7rj5cm163` (`producto_id`),
  KEY `FKcciw7kggns7m52uo8ynjup2eg` (`usuario_documento`),
  CONSTRAINT `FKa66gl3j7wnlwyc1i7rj5cm163` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `FKcciw7kggns7m52uo8ynjup2eg` FOREIGN KEY (`usuario_documento`) REFERENCES `usuarios` (`numero_documento`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carrito`
--

LOCK TABLES `carrito` WRITE;
/*!40000 ALTER TABLE `carrito` DISABLE KEYS */;
INSERT INTO `carrito` VALUES (3,5,'2025-11-23 19:05:12.000000',2500.00,1,'22222222'),(4,2,'2025-11-23 19:05:12.000000',4500.00,10,'22222222'),(5,4,'2025-11-23 19:05:12.000000',3000.00,7,'33333333'),(8,3,'2025-11-24 20:00:56.000000',10000.00,16,'11111111'),(9,3,'2025-11-24 20:00:58.000000',2500.00,1,'11111111'),(11,2,'2025-11-26 21:55:41.000000',10000.00,16,'admin');
/*!40000 ALTER TABLE `carrito` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorias` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `activo` bit(1) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `nombre` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_qcog8b7hps1hioi9onqwjdt6y` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'','Frutas frescas y org??nicas de la regi??n','Frutas'),(2,'','Verduras y hortalizas cultivadas localmente','Verduras'),(3,'','Productos l??cteos frescos y derivados','Lácteos'),(4,'','Granos, cereales y legumbres','Granos'),(5,'','Carnes frescas y procesadas','Carnes'),(9,'',NULL,'Bebidas');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comentarios`
--

DROP TABLE IF EXISTS `comentarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comentarios` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `activo` bit(1) NOT NULL,
  `calificacion` int(11) NOT NULL,
  `contenido` varchar(1000) NOT NULL,
  `fecha_comentario` datetime(6) NOT NULL,
  `producto_id` bigint(20) NOT NULL,
  `usuario_documento` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK6vkhmonbxnjd9obsfwtkm9ehi` (`producto_id`),
  KEY `FKmlqljo0glqlpy17a7oxqwg2x5` (`usuario_documento`),
  CONSTRAINT `FK6vkhmonbxnjd9obsfwtkm9ehi` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `FKmlqljo0glqlpy17a7oxqwg2x5` FOREIGN KEY (`usuario_documento`) REFERENCES `usuarios` (`numero_documento`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comentarios`
--

LOCK TABLES `comentarios` WRITE;
/*!40000 ALTER TABLE `comentarios` DISABLE KEYS */;
INSERT INTO `comentarios` VALUES (1,'',5,'Excelentes naranjas, muy jugosas y dulces!','2024-11-21 15:30:00.000000',1,'11111111'),(2,'',4,'Buena calidad, llegaron frescas','2024-11-22 10:15:00.000000',1,'33333333'),(3,'',5,'Lechuga muy fresca, perfecta para ensaladas','2024-11-21 16:00:00.000000',5,'11111111'),(4,'',3,'Tomates buenos pero un poco verdes','2024-11-21 16:05:00.000000',6,'11111111'),(5,'',5,'Papas de excelente calidad, recomendadas','2024-11-22 11:30:00.000000',7,'22222222'),(6,'',5,'Fresas deliciosas y grandes','2024-11-21 16:10:00.000000',10,'11111111'),(7,'',5,'Mangos muy sabrosos y en su punto','2024-11-22 12:00:00.000000',4,'22222222'),(8,'',4,'Manzanas crujientes, me encantaron','2024-11-23 09:00:00.000000',12,'33333333');
/*!40000 ALTER TABLE `comentarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compras`
--

DROP TABLE IF EXISTS `compras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `compras` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) NOT NULL,
  `estado` varchar(255) NOT NULL,
  `fecha_compra` datetime(6) NOT NULL,
  `precio_total` decimal(10,2) NOT NULL,
  `comprador_documento` varchar(255) NOT NULL,
  `pedido_id` bigint(20) DEFAULT NULL,
  `producto_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKqitxkm0mdbjourca0lsmcscv4` (`comprador_documento`),
  KEY `FKklkqhk5ke4j3utp8hh2pmsata` (`pedido_id`),
  KEY `FKaa4hxtxd515jk59ete30aa3at` (`producto_id`),
  CONSTRAINT `FKaa4hxtxd515jk59ete30aa3at` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `FKklkqhk5ke4j3utp8hh2pmsata` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`),
  CONSTRAINT `FKqitxkm0mdbjourca0lsmcscv4` FOREIGN KEY (`comprador_documento`) REFERENCES `usuarios` (`numero_documento`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compras`
--

LOCK TABLES `compras` WRITE;
/*!40000 ALTER TABLE `compras` DISABLE KEYS */;
INSERT INTO `compras` VALUES (1,3,'COMPLETADA','2024-11-20 10:30:00.000000',6000.00,'11111111',1,5),(2,4,'COMPLETADA','2024-11-20 10:30:00.000000',11200.00,'11111111',1,6),(3,5,'COMPLETADA','2024-11-20 10:30:00.000000',12500.00,'11111111',1,1),(4,2,'COMPLETADA','2024-11-20 10:30:00.000000',9000.00,'11111111',1,10),(5,3,'COMPLETADA','2024-11-21 14:15:00.000000',9000.00,'22222222',2,7),(6,4,'COMPLETADA','2024-11-21 14:15:00.000000',14000.00,'22222222',2,4),(7,1,'COMPLETADA','2024-11-21 14:15:00.000000',5000.00,'22222222',2,11),(8,8,'COMPLETADA','2024-11-22 09:45:00.000000',20000.00,'33333333',3,1),(9,4,'COMPLETADA','2024-11-22 09:45:00.000000',16800.00,'33333333',3,12),(10,3,'COMPLETADA','2024-11-22 09:45:00.000000',7500.00,'33333333',3,9);
/*!40000 ALTER TABLE `compras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_pedido`
--

DROP TABLE IF EXISTS `detalle_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detalle_pedido` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `pedido_id` bigint(20) NOT NULL,
  `producto_id` bigint(20) NOT NULL,
  `vendedor_documento` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKg9h17fjynh9lgf1kbn0v9p4kf` (`pedido_id`),
  KEY `FKdfdl21316mnac14d7f4oi4m84` (`producto_id`),
  KEY `FKl1f8o222pwafyfhinebxqnvy6` (`vendedor_documento`),
  CONSTRAINT `FKdfdl21316mnac14d7f4oi4m84` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `FKg9h17fjynh9lgf1kbn0v9p4kf` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`),
  CONSTRAINT `FKl1f8o222pwafyfhinebxqnvy6` FOREIGN KEY (`vendedor_documento`) REFERENCES `usuarios` (`numero_documento`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_pedido`
--

LOCK TABLES `detalle_pedido` WRITE;
/*!40000 ALTER TABLE `detalle_pedido` DISABLE KEYS */;
INSERT INTO `detalle_pedido` VALUES (1,3,2000.00,6000.00,1,5,'22222222'),(2,4,2800.00,11200.00,1,6,'22222222'),(3,5,2500.00,12500.00,1,1,'11111111'),(4,2,4500.00,9000.00,1,10,'33333333'),(5,3,3000.00,9000.00,2,7,'22222222'),(6,4,3500.00,14000.00,2,4,'11111111'),(7,1,5000.00,5000.00,2,11,'33333333'),(8,8,2500.00,20000.00,3,1,'11111111'),(9,4,4200.00,16800.00,3,12,'33333333'),(10,3,2500.00,7500.00,3,9,'22222222'),(11,5,1800.00,9000.00,4,2,'11111111'),(12,4,1500.00,6000.00,4,8,'22222222');
/*!40000 ALTER TABLE `detalle_pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pedidos` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `con_flete` bit(1) NOT NULL,
  `costo_flete` decimal(10,2) DEFAULT NULL,
  `direccion_entrega` varchar(255) NOT NULL,
  `estado` varchar(255) NOT NULL,
  `fecha_pedido` datetime(6) NOT NULL,
  `metodo_pago` varchar(255) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `comprador_documento` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKc25tq65v3hvwbuvmifnvmvqhr` (`comprador_documento`),
  CONSTRAINT `FKc25tq65v3hvwbuvmifnvmvqhr` FOREIGN KEY (`comprador_documento`) REFERENCES `usuarios` (`numero_documento`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
INSERT INTO `pedidos` VALUES (1,'',5000.00,'Carrera 10 #20-30','ENTREGADO','2024-11-20 10:30:00.000000','Efectivo',35400.00,'11111111'),(2,'\0',0.00,'Calle 50 #15-25 (Recoger en tienda)','EN_CAMINO','2024-11-21 14:15:00.000000','Tarjeta',28500.00,'22222222'),(3,'',8000.00,'Avenida 80 #45-60','CONFIRMADO','2024-11-22 09:45:00.000000','Transferencia',52000.00,'33333333'),(4,'',4000.00,'Carrera 10 #20-30','PENDIENTE','2024-11-23 11:20:00.000000','Efectivo',19200.00,'11111111');
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `productos` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `activo` bit(1) NOT NULL,
  `descripcion` varchar(1000) DEFAULT NULL,
  `fecha_cosecha` date DEFAULT NULL,
  `fecha_publicacion` datetime(6) NOT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `nombre` varchar(255) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL,
  `categoria_id` bigint(20) NOT NULL,
  `subcategoria_id` bigint(20) NOT NULL,
  `usuario_documento` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK2fwq10nwymfv7fumctxt9vpgb` (`categoria_id`),
  KEY `FKlutwcid3o8b6ueh8a3u04vyjr` (`subcategoria_id`),
  KEY `FK7l9tqc5j9pwth6aq7nd97vd5y` (`usuario_documento`),
  CONSTRAINT `FK2fwq10nwymfv7fumctxt9vpgb` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `FK7l9tqc5j9pwth6aq7nd97vd5y` FOREIGN KEY (`usuario_documento`) REFERENCES `usuarios` (`numero_documento`),
  CONSTRAINT `FKlutwcid3o8b6ueh8a3u04vyjr` FOREIGN KEY (`subcategoria_id`) REFERENCES `subcategorias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'','Naranjas dulces y jugosas, perfectas para jugo. 1kg','2024-11-15','2025-11-23 19:05:12.000000',NULL,'Naranjas Valencia',2500.00,100,1,1,'11111111'),(2,'','Limones frescos y ?cidos, ideales para cocinar. 500g','2024-11-10','2025-11-23 19:05:12.000000',NULL,'Limones Tahit?',1800.00,80,1,1,'11111111'),(3,'','Mandarinas peque?as y dulces, sin semillas. 1kg','2024-11-18','2025-11-23 19:05:12.000000',NULL,'Mandarinas Baby',3200.00,60,1,1,'11111111'),(4,'','Mangos maduros, dulces y arom?ticos. Unidad','2024-11-12','2025-11-23 19:05:12.000000',NULL,'Mangos Tommy',3500.00,45,1,2,'11111111'),(5,'','Lechuga fresca hidrop?nica. Unidad','2024-11-20','2025-11-23 19:05:12.000000',NULL,'Lechuga Crespa',2000.00,50,2,5,'22222222'),(6,'','Tomates maduros para ensaladas. 1kg','2024-11-19','2025-11-23 19:05:12.000000',NULL,'Tomates Chonto',2800.00,70,2,8,'22222222'),(7,'','Papas criollas amarillas. 1kg','2024-11-05','2025-11-23 19:05:12.000000',NULL,'Papas Criolla',3000.00,120,2,6,'22222222'),(8,'','Zanahorias frescas y crujientes. 500g','2024-11-17','2025-11-23 19:05:12.000000',NULL,'Zanahorias',1500.00,90,2,6,'22222222'),(9,'','Br?coli fresco y verde. Unidad','2024-11-21','2025-11-23 19:05:12.000000',NULL,'Br?coli',2500.00,40,2,7,'22222222'),(10,'','Fresas grandes y dulces. 250g','2024-11-22','2025-11-23 19:05:12.000000',NULL,'Fresas Premium',4500.00,30,1,3,'33333333'),(11,'','Moras frescas de los Andes. 250g','2024-11-22','2025-11-23 19:05:12.000000',NULL,'Moras Andinas',5000.00,25,1,3,'33333333'),(12,'','Manzanas rojas importadas. 1kg','2024-10-28','2025-11-23 19:05:12.000000',NULL,'Manzanas Red',4200.00,55,1,4,'33333333'),(13,'','Pi?as dulces y jugosas. Unidad','2024-11-08','2025-11-23 19:05:12.000000',NULL,'Pi?as Gold',6000.00,20,1,2,'33333333'),(14,'\0','Aguacates maduros. Unidad','2024-10-15','2025-11-23 19:05:12.000000',NULL,'Aguacates Hass',2500.00,0,1,2,'11111111'),(15,'\0','Piment?n rojo dulce. 500g','2024-11-16','2025-11-23 19:05:12.000000',NULL,'Piment?n Rojo',3500.00,15,2,8,'22222222'),(16,'','sss','2025-11-11','2025-11-24 11:49:02.000000','http://localhost:8080/api/files/productos/f7ebadb3-f0bd-4b34-b18e-a42e2456fbb9.jpg','portatil',10000.00,20,2,6,'11111111');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promociones`
--

DROP TABLE IF EXISTS `promociones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `promociones` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `activo` bit(1) NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_inicio` datetime(6) NOT NULL,
  `fecha_vencimiento` datetime(6) NOT NULL,
  `porcentaje_descuento` decimal(5,2) NOT NULL,
  `precio_promocion` decimal(10,2) NOT NULL,
  `creador_documento` varchar(255) NOT NULL,
  `producto_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK9evrg8bx0i556e6850vde5qbq` (`creador_documento`),
  KEY `FKk5l1pwk8vl4f89ll9mc761dw6` (`producto_id`),
  CONSTRAINT `FK9evrg8bx0i556e6850vde5qbq` FOREIGN KEY (`creador_documento`) REFERENCES `usuarios` (`numero_documento`),
  CONSTRAINT `FKk5l1pwk8vl4f89ll9mc761dw6` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promociones`
--

LOCK TABLES `promociones` WRITE;
/*!40000 ALTER TABLE `promociones` DISABLE KEYS */;
INSERT INTO `promociones` VALUES (1,'','2025-11-23 19:05:12.000000','2024-11-20 00:00:00.000000','2024-11-30 00:00:00.000000',20.00,2000.00,'11111111',1),(2,'','2025-11-23 19:05:12.000000','2024-11-22 00:00:00.000000','2024-11-25 00:00:00.000000',15.00,2975.00,'11111111',4),(3,'','2025-11-23 19:05:12.000000','2024-11-23 00:00:00.000000','2024-11-26 00:00:00.000000',25.00,3375.00,'33333333',10),(4,'\0','2025-11-23 19:05:12.000000','2024-11-15 00:00:00.000000','2024-11-22 00:00:00.000000',10.00,2520.00,'22222222',6);
/*!40000 ALTER TABLE `promociones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subcategorias`
--

DROP TABLE IF EXISTS `subcategorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subcategorias` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `activo` bit(1) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `nombre` varchar(255) NOT NULL,
  `categoria_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKiucm5ipf0wvec50s8j67r33rk` (`categoria_id`),
  CONSTRAINT `FKiucm5ipf0wvec50s8j67r33rk` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subcategorias`
--

LOCK TABLES `subcategorias` WRITE;
/*!40000 ALTER TABLE `subcategorias` DISABLE KEYS */;
INSERT INTO `subcategorias` VALUES (1,'','Naranjas, limones, mandarinas, toronjas','Cítricos',1),(2,'','Mango, papaya, pi??a, maracuy??','Tropicales',1),(3,'','Fresas, moras, ar??ndanos','Dulces',1),(4,'','Diferentes variedades de manzanas','Frutos Secos',1),(5,'','Lechuga, espinaca, acelga','Hortalizas de Hoja',2),(6,'','Papa, yuca, zanahoria, remolacha','Tuberículos',2),(7,'','Br??coli, coliflor, repollo','Crucifíferas',2),(8,'','Tomate, piment??n, berenjena','Solanácea',2),(9,'','Leche entera, descremada, deslactosada','Leches',3),(10,'','Quesos frescos y madurados','Quesos',3),(11,'','Yogur natural, griego, con sabores','Yogures',3),(12,'','Frijol, lenteja, garbanzo','Legumbres',4),(13,'','Arroz, avena, quinua','Cereales',4),(14,'',NULL,'Hongos',2),(15,'',NULL,'Granos',2),(16,'',NULL,'Granos',9);
/*!40000 ALTER TABLE `subcategorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `numero_documento` varchar(255) NOT NULL,
  `activo` bit(1) NOT NULL,
  `apellido` varchar(255) NOT NULL,
  `correo` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `fecha_registro` datetime(6) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` varchar(255) NOT NULL,
  `telefono` varchar(255) NOT NULL,
  `tipo_documento` varchar(255) NOT NULL,
  PRIMARY KEY (`numero_documento`),
  UNIQUE KEY `UK_cdmw5hxlfj78uf4997i3qyyw5` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES ('11111111','','P??rez','juan@gmail.com','Carrera 10 #20-30','2025-11-23 19:05:12.000000','Juan','$2a$10$MKmQRNNOrXjra.KYhsu7JO9FVjsBlesYG0zQJnzni3nfHw2SXTVzK','USER','3002222222','CC'),('22222222','','Garc??a','maria@gmail.com','Calle 50 #15-25','2025-11-23 19:05:12.000000','Mar??a','$2a$10$MKmQRNNOrXjra.KYhsu7JO9FVjsBlesYG0zQJnzni3nfHw2SXTVzK','USER','3003333333','CC'),('33333333','','L??pez','carlos@gmail.com','Avenida 80 #45-60','2025-11-23 19:05:12.000000','Carlos','$2a$10$MKmQRNNOrXjra.KYhsu7JO9FVjsBlesYG0zQJnzni3nfHw2SXTVzK','USER','3004444444','CE'),('44444444','\0','Mart??nez','ana@gmail.com','Transversal 30 #12-18','2025-11-23 19:05:12.000000','Ana','$2a$10$MKmQRNNOrXjra.KYhsu7JO9FVjsBlesYG0zQJnzni3nfHw2SXTVzK','USER','3005555555','CC'),('99999999','','Usuario','test999@test.com','Calle Test','2025-11-24 03:13:02.000000','Test','$2a$10$MKmQRNNOrXjra.KYhsu7JO9FVjsBlesYG0zQJnzni3nfHw2SXTVzK','USER','3001234567','CC'),('admin','','Sistema','admin@ecomerce.com','Calle Admin 100','2025-11-23 19:05:12.000000','Administrador','$2a$10$MKmQRNNOrXjra.KYhsu7JO9FVjsBlesYG0zQJnzni3nfHw2SXTVzK','ADMIN','3001111111','CC');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ventas` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) NOT NULL,
  `fecha_venta` datetime(6) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `comprador_documento` varchar(255) NOT NULL,
  `pedido_id` bigint(20) DEFAULT NULL,
  `producto_id` bigint(20) NOT NULL,
  `vendedor_documento` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKdtwepfgvhya2ff4rrxd0t54l` (`comprador_documento`),
  KEY `FK6nyoh6wipbfvku01s87nyrbdc` (`pedido_id`),
  KEY `FKm2vj8hr3u07dh7lf45hq7tman` (`producto_id`),
  KEY `FK5443sx5xfk1bgcwnoy761hjit` (`vendedor_documento`),
  CONSTRAINT `FK5443sx5xfk1bgcwnoy761hjit` FOREIGN KEY (`vendedor_documento`) REFERENCES `usuarios` (`numero_documento`),
  CONSTRAINT `FK6nyoh6wipbfvku01s87nyrbdc` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`),
  CONSTRAINT `FKdtwepfgvhya2ff4rrxd0t54l` FOREIGN KEY (`comprador_documento`) REFERENCES `usuarios` (`numero_documento`),
  CONSTRAINT `FKm2vj8hr3u07dh7lf45hq7tman` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas`
--

LOCK TABLES `ventas` WRITE;
/*!40000 ALTER TABLE `ventas` DISABLE KEYS */;
INSERT INTO `ventas` VALUES (1,3,'2024-11-20 10:30:00.000000',2000.00,6000.00,'11111111',1,5,'22222222'),(2,4,'2024-11-20 10:30:00.000000',2800.00,11200.00,'11111111',1,6,'22222222'),(3,5,'2024-11-20 10:30:00.000000',2500.00,12500.00,'11111111',1,1,'11111111'),(4,2,'2024-11-20 10:30:00.000000',4500.00,9000.00,'11111111',1,10,'33333333'),(5,3,'2024-11-21 14:15:00.000000',3000.00,9000.00,'22222222',2,7,'22222222'),(6,4,'2024-11-21 14:15:00.000000',3500.00,14000.00,'22222222',2,4,'11111111'),(7,1,'2024-11-21 14:15:00.000000',5000.00,5000.00,'22222222',2,11,'33333333'),(8,8,'2024-11-22 09:45:00.000000',2500.00,20000.00,'33333333',3,1,'11111111'),(9,4,'2024-11-22 09:45:00.000000',4200.00,16800.00,'33333333',3,12,'33333333'),(10,3,'2024-11-22 09:45:00.000000',2500.00,7500.00,'33333333',3,9,'22222222');
/*!40000 ALTER TABLE `ventas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 17:28:57
