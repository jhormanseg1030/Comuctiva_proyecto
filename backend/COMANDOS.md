# 🔧 Comandos Útiles - E-commerce Backend

## 📋 Comandos Maven

### Compilar el proyecto
```bash
mvn clean install
```

### Compilar sin ejecutar tests
```bash
mvn clean install -DskipTests
```

### Ejecutar la aplicación
```bash
mvn spring-boot:run
```

### Limpiar archivos compilados
```bash
mvn clean
```

### Ver dependencias
```bash
mvn dependency:tree
```

### Actualizar dependencias
```bash
mvn clean install -U
```

---

## 🗄️ Comandos MySQL (desde terminal)

### Conectar a MySQL
```bash
mysql -u root -p
```

### Mostrar bases de datos
```sql
SHOW DATABASES;
```

### Seleccionar base de datos
```sql
USE ecomerce_db;
```

### Mostrar tablas
```sql
SHOW TABLES;
```

### Ver estructura de una tabla
```sql
DESCRIBE usuarios;
DESCRIBE categorias;
DESCRIBE productos;
```

### Ver registros de una tabla
```sql
SELECT * FROM usuarios;
SELECT * FROM categorias;
SELECT * FROM productos;
```

### Contar registros
```sql
SELECT COUNT(*) FROM usuarios;
SELECT COUNT(*) FROM productos WHERE activo = 1;
```

### Eliminar la base de datos (CUIDADO!)
```sql
DROP DATABASE ecomerce_db;
```

---

## 🧪 Comandos cURL para Probar API

### Registrar Usuario
```bash
curl -X POST http://localhost:8080/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"numeroDocumento\":\"admin\",\"tipoDocumento\":\"CC\",\"password\":\"admin123\",\"nombre\":\"Admin\",\"apellido\":\"Sistema\",\"telefono\":\"3001234567\",\"direccion\":\"Calle 123\",\"correo\":\"admin@test.com\",\"rol\":\"ADMIN\"}"
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"numeroDocumento\":\"admin\",\"password\":\"admin123\"}"
```

### Listar Categorías
```bash
curl http://localhost:8080/api/categorias
```

### Crear Categoría (con token)
```bash
curl -X POST http://localhost:8080/api/categorias ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer TU_TOKEN_AQUI" ^
  -d "{\"nombre\":\"Frutas\",\"descripcion\":\"Frutas frescas\",\"activo\":true}"
```

### Listar Productos
```bash
curl http://localhost:8080/api/productos/activos
```

---

## 🐛 Comandos de Debugging

### Ver logs en tiempo real
```bash
mvn spring-boot:run | findstr "ERROR"
```

### Ver puerto ocupado (Windows)
```bash
netstat -ano | findstr :8080
```

### Matar proceso en puerto 8080
```bash
# Primero obtener el PID
netstat -ano | findstr :8080

# Luego matar el proceso (reemplaza PID con el número obtenido)
taskkill /PID [PID] /F
```

### Ver versión de Java
```bash
java -version
```

### Ver versión de Maven
```bash
mvn -version
```

### Ver variables de entorno
```bash
echo %JAVA_HOME%
echo %PATH%
```

---

## 📊 Consultas SQL Útiles

### Ver todos los usuarios con su rol
```sql
SELECT numeroDocumento, nombre, apellido, correo, rol, activo 
FROM usuarios;
```

### Ver productos con categoría y subcategoría
```sql
SELECT p.id, p.nombre, p.precio, p.stock, 
       c.nombre AS categoria, s.nombre AS subcategoria
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
JOIN subcategorias s ON p.subcategoria_id = s.id
WHERE p.activo = 1;
```

### Ver productos por usuario
```sql
SELECT u.nombre, u.apellido, p.nombre AS producto, p.precio, p.stock
FROM productos p
JOIN usuarios u ON p.usuario_documento = u.numeroDocumento
WHERE u.numeroDocumento = '12345678';
```

### Contar productos por categoría
```sql
SELECT c.nombre, COUNT(p.id) AS total_productos
FROM categorias c
LEFT JOIN productos p ON c.id = p.categoria_id
GROUP BY c.id, c.nombre;
```

### Ver subcategorías con su categoría
```sql
SELECT c.nombre AS categoria, s.nombre AS subcategoria, s.descripcion
FROM subcategorias s
JOIN categorias c ON s.categoria_id = c.id
WHERE s.activo = 1;
```

### Productos más vendidos (cuando se implemente ventas)
```sql
SELECT p.nombre, COUNT(v.id) AS total_ventas, SUM(v.cantidad) AS unidades_vendidas
FROM productos p
LEFT JOIN ventas v ON p.id = v.producto_id
GROUP BY p.id, p.nombre
ORDER BY total_ventas DESC
LIMIT 10;
```

---

## 🔄 Reiniciar Base de Datos

### Opción 1: Desde phpMyAdmin
1. Ir a http://localhost/phpmyadmin
2. Seleccionar `ecomerce_db`
3. Click en "Operaciones" → "Eliminar base de datos"
4. Reiniciar la aplicación (creará la BD de nuevo)

### Opción 2: Desde MySQL Command Line
```sql
DROP DATABASE ecomerce_db;
```
Luego reinicia la aplicación.

---

## 📦 Comandos Git (si usas control de versiones)

### Inicializar repositorio
```bash
git init
```

### Agregar archivos
```bash
git add .
```

### Commit
```bash
git commit -m "Backend inicial completo"
```

### Ver estado
```bash
git status
```

### Ver historial
```bash
git log --oneline
```

---

## 🚀 Comandos de Producción

### Compilar JAR
```bash
mvn clean package
```

### Ejecutar JAR compilado
```bash
java -jar target/ecomerce-backend-1.0.0.jar
```

### Ejecutar con perfil específico
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

### Ejecutar en background (Linux/Mac)
```bash
nohup mvn spring-boot:run &
```

---

## 🔧 Configuración Útil

### Cambiar puerto en application.properties
```properties
server.port=8081
```

### Cambiar nivel de logging
```properties
logging.level.root=INFO
logging.level.com.ecomerce=DEBUG
```

### Deshabilitar creación automática de tablas
```properties
spring.jpa.hibernate.ddl-auto=none
```

---

## 📝 Notas Importantes

1. **Antes de iniciar:** Verifica que MySQL en XAMPP esté corriendo
2. **Puerto ocupado:** Si el puerto 8080 está en uso, cámbialo en `application.properties`
3. **Credenciales BD:** Por defecto XAMPP tiene usuario `root` sin contraseña
4. **Token JWT:** Expira en 24 horas, necesitarás hacer login de nuevo
5. **Logs:** Los errores aparecen en la consola donde ejecutas `mvn spring-boot:run`

---

## 🆘 Comandos de Emergencia

### Limpiar todo y recompilar
```bash
mvn clean install -U -DskipTests
```

### Reiniciar MySQL en XAMPP
```
1. Abrir XAMPP Control Panel
2. Click "Stop" en MySQL
3. Esperar 5 segundos
4. Click "Start" en MySQL
```

### Verificar conexión a MySQL
```bash
mysql -u root -p
# Presiona Enter (sin contraseña por defecto)
```

### Ver si la aplicación está corriendo
```bash
curl http://localhost:8080/api/categorias
```

Si recibes respuesta, está funcionando ✅

---

## 📞 Endpoints para Verificar Rápido

```bash
# Health check (debe retornar lista vacía o con datos)
http://localhost:8080/api/categorias

# Debe retornar lista de productos
http://localhost:8080/api/productos/activos

# Debe retornar error 401 (no autorizado)
http://localhost:8080/api/usuarios
```

---

**Tip:** Guarda estos comandos en un lugar accesible para referencia rápida.
