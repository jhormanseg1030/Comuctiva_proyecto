# 🔧 CARRITO CORREGIDO - Resumen de Cambios

## ✅ Problema Identificado

El frontend no podía comunicarse correctamente con el backend del carrito debido a **diferencias en los endpoints y formato de datos**.

## 🔍 Problemas Encontrados

### 1. **Endpoints Diferentes**
**Backend esperaba:**
- `/carrito/agregar?productoId=X&cantidad=Y` (parámetros query)
- `/carrito/{id}?cantidad=X` (parámetros query)
- `/carrito/vaciar` (no `/carrito/limpiar`)

**Frontend enviaba:**
- `/carrito` con body JSON `{ productoId, cantidad }`
- `/carrito/{id}` con body JSON `{ cantidad }`
- `/carrito/limpiar`

### 2. **Formato de Respuesta GET /carrito**
**Backend devuelve:**
```json
{
  "items": [...],
  "total": 12345.67,
  "cantidadItems": 5
}
```

**Frontend esperaba:**
```json
[...]  // Array directo
```

### 3. **costoFlete en Pedidos**
El backend NO aceptaba `costoFlete` en la creación de pedidos, solo calculaba con productos del carrito.

---

## 🛠️ Soluciones Implementadas

### 📄 Archivo: `frontend/src/services/api.js`

**ANTES:**
```javascript
export const getCarrito = () => api.get('/carrito');
export const addToCarrito = (productoId, cantidad) => 
  api.post('/carrito', { productoId, cantidad });
export const updateCarrito = (carritoId, cantidad) => 
  api.put(`/carrito/${carritoId}`, { cantidad });
export const clearCarrito = () => 
  api.delete('/carrito/limpiar');
export const createPedido = (pedidoData) => 
  api.post('/pedidos', pedidoData);
```

**DESPUÉS:**
```javascript
export const getCarrito = () => api.get('/carrito');
export const addToCarrito = (productoId, cantidad) => 
  api.post(`/carrito/agregar?productoId=${productoId}&cantidad=${cantidad}`);
export const updateCarrito = (carritoId, cantidad) => 
  api.put(`/carrito/${carritoId}?cantidad=${cantidad}`);
export const clearCarrito = () => 
  api.delete('/carrito/vaciar');
export const createPedido = (pedidoData) => 
  api.post(`/pedidos/crear?direccionEnvio=${encodeURIComponent(pedidoData.direccionEntrega)}&metodoPago=${pedidoData.metodoPago}&costoFlete=${pedidoData.costoFlete || 0}`);
```

### 📄 Archivo: `frontend/src/context/CartContext.jsx`

**ANTES:**
```javascript
const response = await getCarrito();
setCart(response.data);  // Array directo
```

**DESPUÉS:**
```javascript
const response = await getCarrito();
// El backend devuelve { items, total, cantidadItems }
setCart(response.data.items || []);
```

### 📄 Archivo: `backend/.../PedidoController.java`

**ANTES:**
```java
public ResponseEntity<?> crearPedido(
        @RequestParam(required = false) String direccionEnvio,
        @RequestParam(required = false) String metodoPago,
        Authentication authentication)
```

**DESPUÉS:**
```java
public ResponseEntity<?> crearPedido(
        @RequestParam(required = false) String direccionEnvio,
        @RequestParam(required = false) String metodoPago,
        @RequestParam(required = false, defaultValue = "0") Double costoFlete,
        Authentication authentication)
```

### 📄 Archivo: `backend/.../PedidoService.java`

**ANTES:**
```java
public Pedido crearPedidoDesdeCarrito(
    String numeroDocumento, String direccionEnvio, String metodoPago) {
    // ...
    double total = itemsCarrito.stream()
        .mapToDouble(item -> item.getProducto().getPrecio().doubleValue() * item.getCantidad())
        .sum();
    // ...
    pedido.setTotal(new BigDecimal(total));
```

**DESPUÉS:**
```java
public Pedido crearPedidoDesdeCarrito(
    String numeroDocumento, String direccionEnvio, String metodoPago, Double costoFlete) {
    // ...
    double subtotal = itemsCarrito.stream()
        .mapToDouble(item -> item.getProducto().getPrecio().doubleValue() * item.getCantidad())
        .sum();
    double fleteValue = costoFlete != null ? costoFlete : 0.0;
    double total = subtotal + fleteValue;
    // ...
    pedido.setTotal(new BigDecimal(total));
    pedido.setCostoFlete(new BigDecimal(fleteValue));
```

---

## ✅ Funcionalidades Corregidas

| Función | Estado | Endpoint |
|---------|--------|----------|
| Ver carrito | ✅ Funciona | `GET /carrito` |
| Agregar producto | ✅ Funciona | `POST /carrito/agregar?productoId=X&cantidad=Y` |
| Actualizar cantidad | ✅ Funciona | `PUT /carrito/{id}?cantidad=X` |
| Eliminar producto | ✅ Funciona | `DELETE /carrito/{id}` |
| Vaciar carrito | ✅ Funciona | `DELETE /carrito/vaciar` |
| Crear pedido | ✅ Funciona | `POST /pedidos/crear?direccionEnvio=...&metodoPago=...&costoFlete=X` |

---

## 🧪 Cómo Probar

### 1. Iniciar sesión
```
Usuario: 12345678
Contraseña: password123
```

### 2. Agregar productos al carrito
- Navega a la página de inicio
- Haz clic en "Agregar al Carrito" en cualquier producto
- Verifica que se agregue correctamente

### 3. Ver carrito
- Haz clic en el icono del carrito en la navbar
- Deberías ver tus productos

### 4. Actualizar cantidades
- Usa los botones + y - en cada producto
- La cantidad se actualizará

### 5. Eliminar productos
- Haz clic en "Eliminar"
- El producto se quitará del carrito

### 6. Proceder al checkout
- Completa el formulario de dirección
- Selecciona método de pago y envío
- Haz clic en "Confirmar Pedido"
- El pedido se creará exitosamente

---

## 📊 Estado Actual

**Backend**: ✅ Corriendo en http://localhost:8080/api  
**Frontend**: ✅ Corriendo en http://localhost:3000  
**Carrito**: ✅ **FUNCIONANDO COMPLETAMENTE**  
**Pedidos**: ✅ **FUNCIONANDO CON costoFlete**  

---

## 🎯 Cambios en el Backend

**Archivos modificados:**
1. `PedidoController.java` - Agregado parámetro `costoFlete`
2. `PedidoService.java` - Implementada lógica para calcular total con flete

**Backend recompilado:** ✅  
**Backend reiniciado:** ✅  

---

## 🚀 El carrito ahora funciona correctamente

Puedes:
- ✅ Agregar productos desde cualquier página
- ✅ Ver tu carrito con todos los productos
- ✅ Actualizar cantidades en tiempo real
- ✅ Eliminar productos individualmente
- ✅ Vaciar el carrito completo
- ✅ Crear pedidos con costo de envío incluido
- ✅ Ver el total actualizado automáticamente

---

**Fecha de corrección:** 23 de Noviembre de 2024  
**Estado:** ✅ RESUELTO
