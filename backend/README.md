# E-commerce Backend - Spring Boot

Backend del sistema de e-commerce con Spring Boot, JWT, MySQL y XAMPP.

## Requisitos Previos

- **Java JDK 17** o superior
- **Maven 3.6+**
- **XAMPP** con MySQL activado
- **Postman** o similar para probar endpoints

## Configuración Inicial

### 1. Configurar XAMPP y MySQL

1. Inicia **XAMPP Control Panel**
2. Inicia los servicios **Apache** y **MySQL**
3. Abre **phpMyAdmin** en tu navegador: `http://localhost/phpmyadmin`
4. La base de datos `ecomerce_db` se creará automáticamente al iniciar la aplicación

### 2. Verificar Configuración de Base de Datos

El archivo `application.properties` ya está configurado para XAMPP:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ecomerce_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=
```

Si tu MySQL tiene contraseña, actualiza el campo `spring.datasource.password`.

### 3. Compilar el Proyecto

Abre una terminal en la carpeta `backend` y ejecuta:

```bash
mvn clean install
```

### 4. Ejecutar la Aplicación

```bash
mvn spring-boot:run
```

La aplicación se iniciará en: **http://localhost:8080/api**

## Estructura del Proyecto

```
backend/
├── src/main/java/com/ecomerce/
│   ├── controller/          # Controladores REST
│   ├── dto/                 # Objetos de transferencia
│   ├── model/               # Entidades JPA
│   ├── repository/          # Repositorios JPA
│   ├── security/            # Configuración JWT
│   ├── service/             # Lógica de negocio
│   └── EcomerceApplication.java
├── src/main/resources/
│   └── application.properties
└── pom.xml
```

## Endpoints Principales

### Autenticación

#### Registrar Usuario
```
POST /api/auth/register
Content-Type: application/json

{
  "numeroDocumento": "12345678",
  "tipoDocumento": "CC",
  "password": "password123",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "3001234567",
  "direccion": "Calle 123 #45-67",
  "correo": "juan@example.com",
  "rol": "USER"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "numeroDocumento": "12345678",
  "password": "password123"
}
```

Respuesta:
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "numeroDocumento": "12345678",
  "correo": "juan@example.com",
  "rol": "USER",
  "nombre": "Juan",
  "apellido": "Pérez"
}
```

### Categorías

#### Obtener todas las categorías
```
GET /api/categorias
```

#### Crear categoría (Solo ADMIN)
```
POST /api/categorias
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Frutas",
  "descripcion": "Frutas frescas y orgánicas",
  "activo": true
}
```

#### Actualizar categoría (Solo ADMIN)
```
PUT /api/categorias/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Frutas Frescas",
  "descripcion": "Frutas frescas de la región",
  "activo": true
}
```

#### Cambiar estado (Solo ADMIN)
```
PUT /api/categorias/{id}/estado?activo=false
Authorization: Bearer {token}
```

#### Eliminar categoría (Solo ADMIN)
```
DELETE /api/categorias/{id}
Authorization: Bearer {token}
```

### Subcategorías

#### Obtener subcategorías por categoría
```
GET /api/subcategorias/categoria/{categoriaId}
```

#### Crear subcategoría (Solo ADMIN)
```
POST /api/subcategorias
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Cítricos",
  "descripcion": "Naranjas, limones, mandarinas",
  "activo": true,
  "categoria": {
    "id": 1
  }
}
```

### Productos

#### Obtener todos los productos activos
```
GET /api/productos/activos
```

#### Obtener producto por ID
```
GET /api/productos/{id}
```

#### Crear producto (USER o ADMIN)
```
POST /api/productos
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Naranjas Valencia",
  "descripcion": "Naranjas frescas de Valencia",
  "precio": 2500,
  "stock": 100,
  "fechaCosecha": "2024-01-15",
  "activo": true,
  "categoria": {
    "id": 1
  },
  "subcategoria": {
    "id": 1
  },
  "usuario": {
    "numeroDocumento": "12345678"
  }
}
```

#### Actualizar producto (USER o ADMIN)
```
PUT /api/productos/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Naranjas Valencia Premium",
  "descripcion": "Naranjas frescas de Valencia - Calidad Premium",
  "precio": 3000,
  "stock": 80
}
```

#### Cambiar estado producto (USER o ADMIN)
```
PUT /api/productos/{id}/estado?activo=false
Authorization: Bearer {token}
```

### Usuarios

#### Obtener todos los usuarios (Solo ADMIN)
```
GET /api/usuarios
Authorization: Bearer {token}
```

#### Obtener usuario específico
```
GET /api/usuarios/{numeroDocumento}
Authorization: Bearer {token}
```

#### Cambiar rol (Solo ADMIN)
```
PUT /api/usuarios/{numeroDocumento}/rol?rol=ADMIN
Authorization: Bearer {token}
```

#### Cambiar estado (Solo ADMIN)
```
PUT /api/usuarios/{numeroDocumento}/estado?activo=false
Authorization: Bearer {token}
```

## Roles y Permisos

### ADMIN
- CRUD completo en categorías y subcategorías
- Puede activar/desactivar usuarios
- Puede cambiar roles de usuarios
- Puede eliminar productos
- Acceso a todas las funcionalidades

### USER
- Puede crear, editar y desactivar sus propios productos
- Puede consultar categorías, subcategorías y productos
- No puede eliminar productos (solo desactivar)
- Puede comprar y vender productos

## Probar con Postman

1. **Registrar un usuario ADMIN:**
   - POST `/api/auth/register` con `"rol": "ADMIN"`

2. **Login:**
   - POST `/api/auth/login`
   - Copiar el `token` de la respuesta

3. **Crear categoría:**
   - POST `/api/categorias`
   - Header: `Authorization: Bearer {token}`

4. **Crear subcategoría:**
   - POST `/api/subcategorias`
   - Header: `Authorization: Bearer {token}`

5. **Registrar un usuario normal:**
   - POST `/api/auth/register` con `"rol": "USER"`

6. **Login con usuario normal y crear producto:**
   - POST `/api/auth/login`
   - POST `/api/productos` con token del usuario

## Base de Datos

La aplicación crea automáticamente las siguientes tablas:

- `usuarios` - Usuarios del sistema
- `categorias` - Categorías de productos
- `subcategorias` - Subcategorías relacionadas a categorías
- `productos` - Productos publicados
- `carrito` - Items del carrito de compras
- `pedidos` - Pedidos realizados
- `detalle_pedido` - Detalles de cada pedido
- `ventas` - Registro de ventas
- `compras` - Registro de compras
- `promociones` - Promociones de productos
- `comentarios` - Comentarios en productos

## Próximos Pasos

Para continuar con el desarrollo:

1. ✅ **Completado:** Autenticación, Usuarios, Categorías, Subcategorías, Productos
2. **Pendiente:** Carrito de compras, Pedidos, Ventas, Compras
3. **Pendiente:** Promociones y Comentarios
4. **Pendiente:** Reportes en PDF y Excel
5. **Pendiente:** Frontend en React con Bootstrap

## Solución de Problemas

### Error: "Access denied for user 'root'@'localhost'"
- Verifica que MySQL en XAMPP esté iniciado
- Verifica la contraseña en `application.properties`

### Error: Puerto 8080 en uso
- Cambia el puerto en `application.properties`:
  ```properties
  server.port=8081
  ```

### Error de compilación
- Verifica que tienes Java 17: `java -version`
- Limpia el proyecto: `mvn clean install`

## Contacto y Soporte

Si encuentras algún problema, verifica:
1. XAMPP MySQL está corriendo
2. Java 17 está instalado
3. Maven está instalado
4. El puerto 8080 está disponible
