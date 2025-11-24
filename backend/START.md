# 🛒 E-commerce Backend - Instrucciones de Inicio Rápido

## ✅ Primer Paso: Verificar Requisitos

Asegúrate de tener instalado:
- ✅ **Java JDK 17** → Verifica con: `java -version`
- ✅ **Maven** → Verifica con: `mvn -version`
- ✅ **XAMPP** → Con MySQL

## 🚀 Iniciar el Proyecto (3 pasos)

### 1️⃣ Iniciar MySQL en XAMPP
```
1. Abre XAMPP Control Panel
2. Click en "Start" en MySQL
3. Espera a que aparezca el texto verde "Running"
```

### 2️⃣ Compilar el proyecto (primera vez)
Abre terminal en la carpeta `backend`:
```bash
cd c:\xampp\htdocs\ecomerce\backend
mvn clean install
```

⏱️ Esto tomará 2-3 minutos la primera vez (descarga dependencias).

### 3️⃣ Ejecutar la aplicación
```bash
mvn spring-boot:run
```

✅ **Aplicación iniciada correctamente cuando veas:**
```
Started EcomerceApplication in X.XXX seconds
```

🌐 **Backend corriendo en:** http://localhost:8080/api

---

## 🧪 Probar que Funciona

### Opción A: Con el navegador
Abre: http://localhost:8080/api/categorias

Deberías ver: `[]` (lista vacía)

### Opción B: Con Postman/cURL

**Registrar usuario admin:**
```bash
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "numeroDocumento": "admin",
  "tipoDocumento": "CC",
  "password": "admin123",
  "nombre": "Admin",
  "apellido": "Sistema",
  "telefono": "3001234567",
  "direccion": "Calle 123",
  "correo": "admin@test.com",
  "rol": "ADMIN"
}
```

**Login:**
```bash
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "numeroDocumento": "admin",
  "password": "admin123"
}
```

✅ Si recibes un `token`, **¡el backend está funcionando perfectamente!**

---

## 📊 Ver la Base de Datos

1. Abre: http://localhost/phpmyadmin
2. Haz click en la base de datos: **ecomerce_db**
3. Verás las tablas creadas automáticamente:
   - usuarios
   - categorias
   - subcategorias
   - productos
   - carrito
   - pedidos
   - ventas
   - compras
   - promociones
   - comentarios

---

## 📚 Documentación Detallada

- **README.md** → Información completa del proyecto y todos los endpoints
- **TESTING.md** → Guía paso a paso para probar todos los endpoints
- **db_init.sql** → Script SQL de referencia (opcional)

---

## ⚠️ Solución de Problemas Comunes

### ❌ Error: "Port 8080 was already in use"
**Solución:** Cambia el puerto en `application.properties`:
```properties
server.port=8081
```

### ❌ Error: "Access denied for user 'root'@'localhost'"
**Solución:** Verifica en `application.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=    <-- Si tu MySQL tiene contraseña, ponla aquí
```

### ❌ Error al compilar
**Solución:**
```bash
mvn clean install -U
```

### ❌ Base de datos no se crea
**Solución:** Verifica que MySQL en XAMPP esté corriendo (texto verde)

---

## 📋 Checklist de Funcionalidades Implementadas

### ✅ Completado (Backend Básico)
- ✅ Autenticación JWT con contraseña encriptada (BCrypt)
- ✅ Registro y Login de usuarios
- ✅ 2 Roles: ADMIN y USER con permisos diferenciados
- ✅ CRUD de Categorías (ADMIN)
- ✅ CRUD de Subcategorías (ADMIN)
- ✅ CRUD de Productos (USER/ADMIN)
- ✅ Gestión de Usuarios (ADMIN)
- ✅ Activar/Desactivar usuarios y productos
- ✅ Base de datos MySQL con todas las relaciones
- ✅ Entidades: Usuario, Categoria, Subcategoria, Producto
- ✅ Entidades: Carrito, Pedido, Venta, Compra, Promocion, Comentario

### 🔄 Pendiente (Siguiente Fase)
- ⏳ Servicios y Controladores de Carrito
- ⏳ Servicios y Controladores de Pedidos
- ⏳ Servicios y Controladores de Ventas y Compras
- ⏳ Servicios y Controladores de Promociones
- ⏳ Servicios y Controladores de Comentarios
- ⏳ Sistema de Reportes (PDF y Excel)
- ⏳ Métodos de pago en el carrito
- ⏳ Cálculo de flete
- ⏳ Frontend en React con Bootstrap

---

## 🎯 Próximos Pasos

Una vez que hayas probado que el backend funciona:

1. **Probar todos los endpoints** → Sigue la guía en `TESTING.md`
2. **Implementar funcionalidades del carrito** → Agregar/eliminar items, checkout
3. **Implementar pedidos y ventas** → Flujo completo de compra
4. **Implementar promociones** → Descuentos por fechas
5. **Implementar comentarios** → Calificaciones de productos
6. **Crear reportes** → Exportar a PDF y Excel
7. **Desarrollar el Frontend** → React + Bootstrap

---

## 🆘 Soporte

Si tienes problemas:
1. Verifica que MySQL esté corriendo en XAMPP
2. Revisa los logs en la terminal
3. Consulta `README.md` para más detalles
4. Verifica que el puerto 8080 esté libre

---

## 📞 Endpoints Principales

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/categorias` | Listar categorías | No |
| POST | `/api/categorias` | Crear categoría | ADMIN |
| GET | `/api/productos/activos` | Listar productos | No |
| POST | `/api/productos` | Crear producto | USER/ADMIN |
| GET | `/api/usuarios` | Listar usuarios | ADMIN |
| PUT | `/api/usuarios/{id}/estado` | Activar/Desactivar | ADMIN |

Para ver **TODOS** los endpoints → `README.md`

---

**¡Backend listo para probar! 🚀**
