# 🧪 GUÍA DE PRUEBAS PASO A PASO

## 📋 PREPARACIÓN

### Paso 1: Verificar XAMPP MySQL
```
1. Abre XAMPP Control Panel
2. Asegúrate que MySQL esté en verde (Running)
3. Si no está corriendo, haz clic en "Start"
```

### Paso 2: Cargar Datos de Prueba
```
1. Abre http://localhost/phpmyadmin
2. Clic en la base de datos "ecomerce_db" (o créala si no existe)
3. Clic en la pestaña "SQL"
4. Copia y pega el contenido de datos_prueba.sql
5. Clic en "Continuar" o "Go"
6. Verifica que se insertaron los datos (5 usuarios, 6 categorías, etc.)
```

### Paso 3: Iniciar Backend
```
1. Abre una terminal en: c:\xampp\htdocs\ecomerce\backend
2. Ejecuta: mvn spring-boot:run
3. Espera a ver: "Started EcomerceApplication in X seconds"
4. Deja esta terminal abierta
```

---

## ✅ PRUEBAS AUTOMATIZADAS

### Opción A: Script Automático (Recomendado)
```
1. Abre una NUEVA terminal
2. Ve a: cd c:\xampp\htdocs\ecomerce\backend
3. Ejecuta: test_api.bat
4. Presiona ENTER después de cada prueba para continuar
```

### Opción B: Pruebas Manuales (continúa leyendo)

---

## 🧪 PRUEBAS MANUALES UNO POR UNO

### PRUEBA 1: Listar Categorías (Público) ✅
**Endpoint:** `GET /api/categorias`  
**Descripción:** Cualquiera puede ver las categorías  
**Comando:**
```bash
curl http://localhost:8080/api/categorias
```

**Resultado Esperado:**
```json
[
  {
    "id": 1,
    "nombre": "Frutas",
    "descripcion": "Frutas frescas y orgánicas de la región",
    "activo": true
  },
  ...más categorías...
]
```

✅ **¿Funcionó?** Deberías ver 6 categorías (5 activas + 1 inactiva)

---

### PRUEBA 2: Listar Productos Activos (Público) ✅
**Endpoint:** `GET /api/productos/activos`  
**Descripción:** Ver productos disponibles para comprar  
**Comando:**
```bash
curl http://localhost:8080/api/productos/activos
```

**Resultado Esperado:**
```json
[
  {
    "id": 1,
    "nombre": "Naranjas Valencia",
    "descripcion": "Naranjas dulces y jugosas...",
    "precio": 2500.00,
    "stock": 100,
    "activo": true
  },
  ...más productos...
]
```

✅ **¿Funcionó?** Deberías ver 13 productos activos

---

### PRUEBA 3: Login como Administrador 🔐
**Endpoint:** `POST /api/auth/login`  
**Descripción:** Obtener token JWT de administrador  
**Comando:**
```bash
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"numeroDocumento\":\"admin\",\"password\":\"admin123\"}"
```

**Resultado Esperado:**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTcwMDc...",
  "type": "Bearer",
  "numeroDocumento": "admin",
  "nombre": "Administrador",
  "apellido": "Sistema",
  "correo": "admin@ecomerce.com",
  "rol": "ADMIN"
}
```

⚠️ **IMPORTANTE:** Copia el valor de "token" (lo necesitarás para pruebas siguientes)

**Guarda el token:**
```
SET ADMIN_TOKEN=<pega_aquí_el_token_completo>
```

---

### PRUEBA 4: Login como Usuario Normal 🔐
**Endpoint:** `POST /api/auth/login`  
**Descripción:** Obtener token JWT de usuario  
**Comando:**
```bash
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"numeroDocumento\":\"11111111\",\"password\":\"admin123\"}"
```

**Resultado Esperado:**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMTExMTExMSIsImlhdCI6...",
  "type": "Bearer",
  "numeroDocumento": "11111111",
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan@gmail.com",
  "rol": "USER"
}
```

**Guarda el token:**
```
SET USER_TOKEN=<pega_aquí_el_token_completo>
```

---

### PRUEBA 5: Crear Categoría como ADMIN ✅
**Endpoint:** `POST /api/categorias`  
**Descripción:** Solo ADMIN puede crear categorías  
**Comando:**
```bash
curl -X POST http://localhost:8080/api/categorias ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %ADMIN_TOKEN%" ^
  -d "{\"nombre\":\"Artesanías\",\"descripcion\":\"Productos artesanales locales\",\"activo\":true}"
```

**Resultado Esperado:**
```json
{
  "id": 7,
  "nombre": "Artesanías",
  "descripcion": "Productos artesanales locales",
  "activo": true
}
```

✅ **¿Funcionó?** Deberías recibir la nueva categoría con ID 7

---

### PRUEBA 6: Crear Categoría como USER ❌
**Endpoint:** `POST /api/categorias`  
**Descripción:** USER NO puede crear categorías (debe dar 403)  
**Comando:**
```bash
curl -X POST http://localhost:8080/api/categorias ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %USER_TOKEN%" ^
  -d "{\"nombre\":\"Test\",\"descripcion\":\"No debe crearse\",\"activo\":true}"
```

**Resultado Esperado:**
```json
{
  "timestamp": "2024-11-23T...",
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied"
}
```

✅ **¿Funcionó?** Debe rechazar con error 403 Forbidden

---

### PRUEBA 7: Productos de un Usuario ✅
**Endpoint:** `GET /api/productos/usuario/11111111`  
**Descripción:** Ver productos publicados por Juan  
**Comando:**
```bash
curl http://localhost:8080/api/productos/usuario/11111111
```

**Resultado Esperado:**
```json
[
  {
    "id": 1,
    "nombre": "Naranjas Valencia",
    "usuarioDocumento": "11111111",
    ...
  },
  ...más productos...
]
```

✅ **¿Funcionó?** Deberías ver 5 productos (4 activos + 1 inactivo)

---

### PRUEBA 8: Productos por Categoría ✅
**Endpoint:** `GET /api/productos/categoria/1`  
**Descripción:** Ver productos de la categoría Frutas  
**Comando:**
```bash
curl http://localhost:8080/api/productos/categoria/1
```

**Resultado Esperado:**
```json
[
  { "nombre": "Naranjas Valencia", "categoriaId": 1, ... },
  { "nombre": "Limones Tahití", "categoriaId": 1, ... },
  { "nombre": "Mandarinas Baby", "categoriaId": 1, ... },
  ...más frutas...
]
```

✅ **¿Funcionó?** Deberías ver 9 productos de frutas

---

### PRUEBA 9: Subcategorías de una Categoría ✅
**Endpoint:** `GET /api/subcategorias/categoria/1`  
**Descripción:** Ver subcategorías de Frutas  
**Comando:**
```bash
curl http://localhost:8080/api/subcategorias/categoria/1
```

**Resultado Esperado:**
```json
[
  { "id": 1, "nombre": "Cítricos", "categoriaId": 1, ... },
  { "id": 2, "nombre": "Tropicales", "categoriaId": 1, ... },
  { "id": 3, "nombre": "Berries", "categoriaId": 1, ... },
  { "id": 4, "nombre": "Manzanas", "categoriaId": 1, ... }
]
```

✅ **¿Funcionó?** Deberías ver 4 subcategorías de frutas

---

### PRUEBA 10: Listar Usuarios como ADMIN 🔐
**Endpoint:** `GET /api/usuarios`  
**Descripción:** Solo ADMIN puede ver todos los usuarios  
**Comando:**
```bash
curl http://localhost:8080/api/usuarios ^
  -H "Authorization: Bearer %ADMIN_TOKEN%"
```

**Resultado Esperado:**
```json
[
  {
    "numeroDocumento": "admin",
    "nombre": "Administrador",
    "rol": "ADMIN",
    "activo": true
  },
  {
    "numeroDocumento": "11111111",
    "nombre": "Juan",
    "rol": "USER",
    "activo": true
  },
  ...más usuarios...
]
```

✅ **¿Funcionó?** Deberías ver 5 usuarios

---

### PRUEBA 11: Registrar Nuevo Usuario ✅
**Endpoint:** `POST /api/auth/register`  
**Descripción:** Crear cuenta nueva  
**Comando:**
```bash
curl -X POST http://localhost:8080/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"numeroDocumento\":\"99999999\",\"nombre\":\"Test\",\"apellido\":\"Usuario\",\"correo\":\"test@test.com\",\"password\":\"test123\",\"telefono\":\"3001234567\",\"direccion\":\"Calle Test\",\"rol\":\"USER\"}"
```

**Resultado Esperado:**
```json
{
  "message": "Usuario registrado exitosamente!"
}
```

✅ **¿Funcionó?** Deberías poder hacer login con 99999999/test123

---

### PRUEBA 12: Cambiar Rol de Usuario 🔐
**Endpoint:** `PUT /api/usuarios/22222222/rol?rol=ADMIN`  
**Descripción:** Promocionar usuario a ADMIN  
**Comando:**
```bash
curl -X PUT "http://localhost:8080/api/usuarios/22222222/rol?rol=ADMIN" ^
  -H "Authorization: Bearer %ADMIN_TOKEN%"
```

**Resultado Esperado:**
```json
{
  "numeroDocumento": "22222222",
  "nombre": "María",
  "rol": "ADMIN",
  ...
}
```

✅ **¿Funcionó?** María ahora es ADMIN

---

### PRUEBA 13: Actualizar Producto como Dueño ✅
**Endpoint:** `PUT /api/productos/1`  
**Descripción:** Juan actualiza su propio producto  
**Comando:**
```bash
curl -X PUT http://localhost:8080/api/productos/1 ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %USER_TOKEN%" ^
  -d "{\"nombre\":\"Naranjas Valencia Premium\",\"descripcion\":\"Las mejores naranjas\",\"precio\":2800.00,\"stock\":100,\"activo\":true,\"categoriaId\":1,\"subcategoriaId\":1}"
```

**Resultado Esperado:**
```json
{
  "id": 1,
  "nombre": "Naranjas Valencia Premium",
  "precio": 2800.00,
  ...
}
```

✅ **¿Funcionó?** El producto se actualizó

---

## 📊 RESUMEN DE RESULTADOS

| # | Prueba | Esperado | ¿Pasó? |
|---|--------|----------|--------|
| 1 | GET /categorias | 6 categorías | ⬜ |
| 2 | GET /productos/activos | 13 productos | ⬜ |
| 3 | Login ADMIN | Token recibido | ⬜ |
| 4 | Login USER | Token recibido | ⬜ |
| 5 | POST categoría ADMIN | Creada | ⬜ |
| 6 | POST categoría USER | 403 Forbidden | ⬜ |
| 7 | GET productos usuario | 5 productos | ⬜ |
| 8 | GET productos categoría | 9 frutas | ⬜ |
| 9 | GET subcategorías | 4 subcategorías | ⬜ |
| 10 | GET usuarios ADMIN | 5 usuarios | ⬜ |
| 11 | POST register | Registrado | ⬜ |
| 12 | PUT rol usuario | Rol cambiado | ⬜ |
| 13 | PUT producto dueño | Actualizado | ⬜ |

---

## 🔍 VERIFICAR EN BASE DE DATOS

Después de las pruebas, verifica en phpMyAdmin:

```sql
-- Ver usuarios
SELECT numero_documento, nombre, rol, activo FROM usuarios;

-- Ver categorías
SELECT * FROM categorias;

-- Ver productos con categoría
SELECT p.id, p.nombre, p.precio, c.nombre as categoria, p.activo 
FROM productos p 
JOIN categorias c ON p.categoria_id = c.id
ORDER BY p.id;

-- Ver usuario nuevo registrado
SELECT * FROM usuarios WHERE numero_documento = '99999999';

-- Ver cambio de rol
SELECT numero_documento, nombre, rol FROM usuarios WHERE numero_documento = '22222222';
```

---

## ❓ TROUBLESHOOTING

### Error: "Connection refused"
- ✅ Verifica que el backend esté corriendo (mvn spring-boot:run)
- ✅ Verifica que esté en el puerto 8080

### Error: "401 Unauthorized"
- ✅ Verifica que copiaste el token completo
- ✅ Verifica que el token no haya expirado (24 horas)
- ✅ Vuelve a hacer login

### Error: "403 Forbidden"
- ✅ Algunas operaciones requieren rol ADMIN
- ✅ Verifica que estás usando el token correcto

### No aparecen datos
- ✅ Verifica que ejecutaste datos_prueba.sql
- ✅ Verifica en phpMyAdmin que hay datos en las tablas

---

## 🎯 SIGUIENTES PASOS

Una vez que todas las pruebas pasen:

1. ✅ Backend básico funcional
2. ⏳ Implementar Carrito de Compras
3. ⏳ Implementar Pedidos y Checkout
4. ⏳ Implementar Ventas y Compras
5. ⏳ Implementar Promociones
6. ⏳ Implementar Comentarios
7. ⏳ Implementar Reportes PDF/Excel
8. ⏳ Crear Frontend en React

---

## 📞 AYUDA

Si alguna prueba falla, copia el error completo y revisa:
- Logs del backend en la terminal
- Estado de la base de datos en phpMyAdmin
- Formato de los datos que envías (JSON válido)
