# Guía de Pruebas - Backend E-commerce

## Configuración Inicial

### 1. Iniciar XAMPP
- Abrir XAMPP Control Panel
- Iniciar **MySQL**
- Iniciar **Apache** (opcional, solo para phpMyAdmin)

### 2. Verificar Base de Datos
- Ir a http://localhost/phpmyadmin
- La base de datos `ecomerce_db` se creará automáticamente

### 3. Iniciar el Backend

Abre una terminal en la carpeta `backend`:

```bash
cd c:\xampp\htdocs\ecomerce\backend
mvn spring-boot:run
```

Espera a ver el mensaje: **"Started EcomerceApplication"**

## Pruebas con Postman o cURL

### Paso 1: Registrar Usuario Administrador

**POST** `http://localhost:8080/api/auth/register`

Body (JSON):
```json
{
  "numeroDocumento": "admin",
  "tipoDocumento": "CC",
  "password": "admin123",
  "nombre": "Administrador",
  "apellido": "Sistema",
  "telefono": "3001234567",
  "direccion": "Calle Admin 123",
  "correo": "admin@ecomerce.com",
  "rol": "ADMIN"
}
```

Respuesta esperada:
```json
{
  "message": "Usuario registrado exitosamente"
}
```

### Paso 2: Login con Admin

**POST** `http://localhost:8080/api/auth/login`

Body (JSON):
```json
{
  "numeroDocumento": "admin",
  "password": "admin123"
}
```

Respuesta esperada:
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbi...",
  "type": "Bearer",
  "numeroDocumento": "admin",
  "correo": "admin@ecomerce.com",
  "rol": "ADMIN",
  "nombre": "Administrador",
  "apellido": "Sistema"
}
```

**⚠️ IMPORTANTE:** Copia el valor de `token`, lo necesitarás para las siguientes peticiones.

### Paso 3: Crear Categorías

**POST** `http://localhost:8080/api/categorias`

Headers:
```
Authorization: Bearer {tu_token_aquí}
Content-Type: application/json
```

Body (JSON):
```json
{
  "nombre": "Frutas",
  "descripcion": "Frutas frescas y orgánicas",
  "activo": true
}
```

Respuesta esperada:
```json
{
  "id": 1,
  "nombre": "Frutas",
  "descripcion": "Frutas frescas y orgánicas",
  "activo": true,
  "subcategorias": []
}
```

**Crear más categorías:**

```json
{
  "nombre": "Verduras",
  "descripcion": "Verduras y hortalizas frescas",
  "activo": true
}
```

```json
{
  "nombre": "Lácteos",
  "descripcion": "Productos lácteos",
  "activo": true
}
```

### Paso 4: Consultar Categorías

**GET** `http://localhost:8080/api/categorias`

No requiere autenticación. Respuesta esperada:
```json
[
  {
    "id": 1,
    "nombre": "Frutas",
    "descripcion": "Frutas frescas y orgánicas",
    "activo": true
  },
  {
    "id": 2,
    "nombre": "Verduras",
    "descripcion": "Verduras y hortalizas frescas",
    "activo": true
  }
]
```

### Paso 5: Crear Subcategorías

**POST** `http://localhost:8080/api/subcategorias`

Headers:
```
Authorization: Bearer {tu_token_aquí}
Content-Type: application/json
```

Body (JSON):
```json
{
  "nombre": "Cítricos",
  "descripcion": "Naranjas, limones, mandarinas",
  "activo": true,
  "categoria": {
    "id": 1
  }
}
```

**Crear más subcategorías:**

```json
{
  "nombre": "Tropicales",
  "descripcion": "Mango, papaya, piña",
  "activo": true,
  "categoria": {
    "id": 1
  }
}
```

```json
{
  "nombre": "Hortalizas",
  "descripcion": "Lechuga, tomate, pepino",
  "activo": true,
  "categoria": {
    "id": 2
  }
}
```

### Paso 6: Registrar Usuario Normal

**POST** `http://localhost:8080/api/auth/register`

Body (JSON):
```json
{
  "numeroDocumento": "12345678",
  "tipoDocumento": "CC",
  "password": "user123",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "3009876543",
  "direccion": "Calle 123 #45-67",
  "correo": "juan@example.com",
  "rol": "USER"
}
```

### Paso 7: Login con Usuario Normal

**POST** `http://localhost:8080/api/auth/login`

Body (JSON):
```json
{
  "numeroDocumento": "12345678",
  "password": "user123"
}
```

**⚠️ Copia el nuevo token del usuario.**

### Paso 8: Crear Producto (Usuario Normal)

**POST** `http://localhost:8080/api/productos`

Headers:
```
Authorization: Bearer {token_del_usuario}
Content-Type: application/json
```

Body (JSON):
```json
{
  "nombre": "Naranjas Valencia",
  "descripcion": "Naranjas frescas de Valencia, 1kg",
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

**Crear más productos:**

```json
{
  "nombre": "Mango Tommy",
  "descripcion": "Mangos maduros, dulces y jugosos",
  "precio": 3000,
  "stock": 50,
  "fechaCosecha": "2024-01-10",
  "activo": true,
  "categoria": {
    "id": 1
  },
  "subcategoria": {
    "id": 2
  },
  "usuario": {
    "numeroDocumento": "12345678"
  }
}
```

### Paso 9: Consultar Productos Activos

**GET** `http://localhost:8080/api/productos/activos`

No requiere autenticación.

### Paso 10: Actualizar Producto

**PUT** `http://localhost:8080/api/productos/1`

Headers:
```
Authorization: Bearer {token_del_usuario}
Content-Type: application/json
```

Body (JSON):
```json
{
  "nombre": "Naranjas Valencia Premium",
  "descripcion": "Naranjas frescas de Valencia - Calidad Premium, 1kg",
  "precio": 3000,
  "stock": 80,
  "activo": true
}
```

### Paso 11: Cambiar Estado del Producto

**PUT** `http://localhost:8080/api/productos/1/estado?activo=false`

Headers:
```
Authorization: Bearer {token_del_usuario}
```

### Paso 12: Gestión de Usuarios (Solo Admin)

**GET** `http://localhost:8080/api/usuarios`

Headers:
```
Authorization: Bearer {token_del_admin}
```

**Cambiar rol de un usuario:**

**PUT** `http://localhost:8080/api/usuarios/12345678/rol?rol=ADMIN`

Headers:
```
Authorization: Bearer {token_del_admin}
```

**Desactivar un usuario:**

**PUT** `http://localhost:8080/api/usuarios/12345678/estado?activo=false`

Headers:
```
Authorization: Bearer {token_del_admin}
```

## Verificación en phpMyAdmin

1. Ir a http://localhost/phpmyadmin
2. Seleccionar base de datos `ecomerce_db`
3. Verificar las tablas:
   - `usuarios` - Debe tener 2 registros (admin y user)
   - `categorias` - Debe tener 3 registros
   - `subcategorias` - Debe tener 3 registros
   - `productos` - Debe tener 2 registros

## Resumen de Endpoints Testeados

✅ POST `/api/auth/register` - Registro de usuarios
✅ POST `/api/auth/login` - Login y JWT
✅ GET `/api/categorias` - Listar categorías
✅ POST `/api/categorias` - Crear categoría (ADMIN)
✅ PUT `/api/categorias/{id}` - Actualizar categoría (ADMIN)
✅ PUT `/api/categorias/{id}/estado` - Cambiar estado (ADMIN)
✅ GET `/api/subcategorias` - Listar subcategorías
✅ POST `/api/subcategorias` - Crear subcategoría (ADMIN)
✅ GET `/api/productos/activos` - Listar productos activos
✅ POST `/api/productos` - Crear producto (USER/ADMIN)
✅ PUT `/api/productos/{id}` - Actualizar producto (USER/ADMIN)
✅ PUT `/api/productos/{id}/estado` - Cambiar estado producto
✅ GET `/api/usuarios` - Listar usuarios (ADMIN)
✅ PUT `/api/usuarios/{id}/rol` - Cambiar rol (ADMIN)
✅ PUT `/api/usuarios/{id}/estado` - Cambiar estado usuario (ADMIN)

## Próximos Pasos

Una vez verificado que todo funciona correctamente:

1. ✅ Backend básico funcional
2. Implementar Carrito de Compras
3. Implementar Pedidos y Ventas
4. Implementar Promociones y Comentarios
5. Implementar Reportes (PDF/Excel)
6. Desarrollar Frontend en React
