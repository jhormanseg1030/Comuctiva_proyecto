# Sistema de Carga de Imágenes para Productos

## 📸 Funcionalidad Implementada

El backend ahora soporta **carga de imágenes** para productos con las siguientes características:

### ✅ Características

- 📁 **Almacenamiento local** en carpeta `uploads/productos/`
- 🔒 **Nombres únicos** usando UUID para evitar conflictos
- 🖼️ **Formatos soportados:** JPG, JPEG, PNG, GIF, WEBP
- 📏 **Tamaño máximo:** 10MB por archivo
- 🗑️ **Eliminación automática** al actualizar o borrar producto
- 🌐 **URLs públicas** para acceso desde frontend

---

## 🚀 Nuevos Endpoints

### 1. Crear Producto con Imagen

**POST** `/api/productos/con-imagen`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
```
nombre: "Naranjas Valencia"
descripcion: "Naranjas frescas de Valencia"
precio: "2500"
stock: "100"
fechaCosecha: "2024-01-15"
categoriaId: "1"
subcategoriaId: "1"
usuarioDocumento: "12345678"
imagen: [archivo de imagen]
```

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:8080/api/productos/con-imagen \
  -H "Authorization: Bearer TU_TOKEN" \
  -F "nombre=Naranjas Valencia" \
  -F "descripcion=Naranjas frescas" \
  -F "precio=2500" \
  -F "stock=100" \
  -F "fechaCosecha=2024-01-15" \
  -F "categoriaId=1" \
  -F "subcategoriaId=1" \
  -F "usuarioDocumento=12345678" \
  -F "imagen=@C:/ruta/a/imagen.jpg"
```

---

### 2. Actualizar Producto con Imagen

**PUT** `/api/productos/{id}/con-imagen`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data (todos opcionales):**
```
nombre: "Naranjas Valencia Premium"
descripcion: "Naranjas de calidad premium"
precio: "3000"
stock: "80"
fechaCosecha: "2024-01-20"
imagen: [nueva imagen] (opcional)
```

**Nota:** Si envías una nueva imagen, la anterior se eliminará automáticamente.

---

### 3. Eliminar Imagen de Producto

**DELETE** `/api/productos/{id}/imagen`

**Headers:**
```
Authorization: Bearer {token}
```

Elimina la imagen del producto sin borrar el producto.

---

### 4. Obtener Imagen de Producto

**GET** `/api/files/productos/{nombreArchivo}`

**Sin autenticación requerida** (público)

Ejemplo:
```
http://localhost:8080/api/files/productos/abc123-def456.jpg
```

---

## 📝 Ejemplo con Postman

### Crear Producto con Imagen:

1. **Método:** POST
2. **URL:** `http://localhost:8080/api/productos/con-imagen`
3. **Headers:**
   - `Authorization: Bearer {token}`
4. **Body:** Selecciona `form-data`
5. **Campos:**
   ```
   Key                  Type    Value
   nombre               Text    Naranjas Valencia
   descripcion          Text    Naranjas frescas de Valencia
   precio               Text    2500
   stock                Text    100
   fechaCosecha         Text    2024-01-15
   categoriaId          Text    1
   subcategoriaId       Text    1
   usuarioDocumento     Text    12345678
   imagen               File    [selecciona un archivo]
   ```

### Actualizar Producto con Imagen:

1. **Método:** PUT
2. **URL:** `http://localhost:8080/api/productos/1/con-imagen`
3. **Headers:**
   - `Authorization: Bearer {token}`
4. **Body:** Selecciona `form-data`
5. **Campos (solo los que quieres actualizar):**
   ```
   Key                  Type    Value
   nombre               Text    Naranjas Valencia Premium
   precio               Text    3000
   imagen               File    [selecciona nuevo archivo]
   ```

---

## 🔧 Configuración

### application.properties

```properties
# File Upload Configuration
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
file.upload-dir=uploads/productos
```

**Cambiar tamaño máximo:**
```properties
spring.servlet.multipart.max-file-size=20MB
spring.servlet.multipart.max-request-size=20MB
```

**Cambiar directorio de almacenamiento:**
```properties
file.upload-dir=C:/mis-imagenes/productos
```

---

## 📁 Estructura de Archivos

```
backend/
├── uploads/
│   └── productos/
│       ├── abc123-def456-ghi789.jpg
│       ├── xyz987-uvw654-rst321.png
│       └── ...
└── src/
    └── main/
        └── java/
            └── com/ecomerce/
                ├── controller/
                │   ├── FileController.java      (Nuevo)
                │   └── ProductoController.java  (Actualizado)
                └── service/
                    └── FileStorageService.java  (Nuevo)
```

---

## 🎯 Flujo Completo de Uso

### 1. Crear producto con imagen

```bash
POST /api/productos/con-imagen
→ Guarda imagen en uploads/productos/
→ Retorna producto con imagenUrl: "/api/files/productos/uuid.jpg"
```

### 2. Ver imagen desde frontend

```javascript
<img src="http://localhost:8080/api/files/productos/uuid.jpg" />
```

### 3. Actualizar imagen

```bash
PUT /api/productos/1/con-imagen
→ Elimina imagen anterior
→ Guarda nueva imagen
→ Actualiza imagenUrl
```

### 4. Eliminar solo la imagen

```bash
DELETE /api/productos/1/imagen
→ Elimina archivo físico
→ imagenUrl = null
```

### 5. Eliminar producto completo

```bash
DELETE /api/productos/1
→ Elimina producto de BD
→ Elimina imagen física
```

---

## 🧪 Pruebas con cURL

### Crear producto con imagen:

```bash
curl -X POST http://localhost:8080/api/productos/con-imagen ^
  -H "Authorization: Bearer eyJhbGc..." ^
  -F "nombre=Manzanas Red" ^
  -F "descripcion=Manzanas rojas frescas" ^
  -F "precio=3500" ^
  -F "stock=50" ^
  -F "fechaCosecha=2024-01-20" ^
  -F "categoriaId=1" ^
  -F "subcategoriaId=2" ^
  -F "usuarioDocumento=12345678" ^
  -F "imagen=@C:/imagenes/manzana.jpg"
```

### Actualizar solo el precio:

```bash
curl -X PUT http://localhost:8080/api/productos/1/con-imagen ^
  -H "Authorization: Bearer eyJhbGc..." ^
  -F "precio=4000"
```

### Actualizar imagen:

```bash
curl -X PUT http://localhost:8080/api/productos/1/con-imagen ^
  -H "Authorization: Bearer eyJhbGc..." ^
  -F "imagen=@C:/imagenes/nueva-manzana.jpg"
```

### Eliminar imagen:

```bash
curl -X DELETE http://localhost:8080/api/productos/1/imagen ^
  -H "Authorization: Bearer eyJhbGc..."
```

### Ver imagen:

```bash
curl http://localhost:8080/api/files/productos/abc123-def456.jpg --output imagen.jpg
```

---

## ⚠️ Consideraciones Importantes

### Seguridad:
- ✅ Endpoint de carga requiere autenticación
- ✅ Endpoint de descarga es público (para mostrar en frontend)
- ✅ Nombres aleatorios evitan conflictos
- ✅ Validación de extensiones de archivo

### Rendimiento:
- ✅ Imágenes se sirven directamente (sin procesamiento)
- ✅ Recomendado: optimizar imágenes antes de subir
- ⚠️ Considerar CDN para producción

### Producción:
- 📝 Configurar almacenamiento en cloud (AWS S3, Cloudinary, etc.)
- 📝 Implementar compresión de imágenes
- 📝 Generar miniaturas automáticamente
- 📝 Implementar caché de imágenes

---

## 🔄 Migración de Productos Existentes

Si ya tienes productos sin imagen, puedes actualizarlos:

```bash
# Actualizar producto 1 agregando imagen
PUT /api/productos/1/con-imagen
Form-data: imagen = [archivo]
```

---

## 🌐 Uso desde Frontend (React ejemplo)

### Crear producto con imagen:

```javascript
const formData = new FormData();
formData.append('nombre', 'Naranjas Valencia');
formData.append('descripcion', 'Naranjas frescas');
formData.append('precio', '2500');
formData.append('stock', '100');
formData.append('fechaCosecha', '2024-01-15');
formData.append('categoriaId', '1');
formData.append('subcategoriaId', '1');
formData.append('usuarioDocumento', '12345678');
formData.append('imagen', imagenFile); // File object

const response = await fetch('http://localhost:8080/api/productos/con-imagen', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const producto = await response.json();
console.log('URL de imagen:', producto.imagenUrl);
```

### Mostrar imagen:

```javascript
<img 
  src={`http://localhost:8080${producto.imagenUrl}`} 
  alt={producto.nombre}
  className="img-fluid"
/>
```

---

## 📊 Respuesta de Ejemplo

### Crear producto con imagen:

```json
{
  "id": 1,
  "nombre": "Naranjas Valencia",
  "descripcion": "Naranjas frescas de Valencia",
  "precio": 2500,
  "stock": 100,
  "fechaCosecha": "2024-01-15",
  "activo": true,
  "fechaPublicacion": "2024-11-23T10:30:00",
  "imagenUrl": "/api/files/productos/abc123-def456-ghi789.jpg",
  "categoria": { "id": 1 },
  "subcategoria": { "id": 1 },
  "usuario": { "numeroDocumento": "12345678" }
}
```

---

## ✅ Archivos Creados/Modificados

### Nuevos Archivos:
- ✅ `FileStorageService.java` - Servicio de almacenamiento
- ✅ `FileController.java` - Controlador de archivos
- ✅ `IMAGENES.md` - Esta documentación

### Archivos Modificados:
- ✅ `ProductoController.java` - Agregados endpoints con imagen
- ✅ `SecurityConfig.java` - Permitir acceso a /files/**
- ✅ `application.properties` - Configuración de uploads

---

## 🎉 ¡Sistema de Imágenes Listo!

El backend ahora soporta completamente la carga, actualización, eliminación y visualización de imágenes de productos.

**Próximo paso:** Probar con Postman o integrar con el frontend React.
