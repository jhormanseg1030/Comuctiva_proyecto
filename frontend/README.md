# Comuctiva Frontend

Frontend moderno para la plataforma Comuctiva desarrollado con React 18, Vite y Bootstrap 5.

## 🚀 Tecnologías

- **React 18** - Librería UI
- **Vite** - Build tool
- **React Router v6** - Navegación
- **Bootstrap 5** - Framework CSS
- **React Bootstrap** - Componentes React
- **Axios** - Cliente HTTP
- **Context API** - Gestión de estado

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview
```

## 🏗️ Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/         # Componentes reutilizables
│   │   ├── NavigationBar.jsx
│   │   ├── ProductCard.jsx
│   │   ├── CategoryFilter.jsx
│   │   ├── CartItem.jsx
│   │   ├── ReviewCard.jsx
│   │   └── Footer.jsx
│   ├── pages/             # Páginas principales
│   │   ├── Home.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── MyAccount.jsx
│   │   └── MyOrders.jsx
│   ├── context/           # Context API
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── services/          # Servicios API
│   │   └── api.js
│   ├── App.jsx            # Componente principal
│   ├── main.jsx           # Punto de entrada
│   └── index.css          # Estilos globales
├── index.html
├── vite.config.js
└── package.json
```

## 🌟 Características

### Páginas Públicas
- **Home** - Catálogo de productos con filtros por categoría y búsqueda
- **Detalle de Producto** - Información completa, reseñas y agregar al carrito
- **Login/Registro** - Autenticación de usuarios

### Páginas Protegidas (Requieren autenticación)
- **Carrito** - Gestión del carrito de compras
- **Checkout** - Finalización de compra
- **Mi Cuenta** - Gestión de perfil de usuario
- **Mis Pedidos** - Historial de pedidos

### Funcionalidades
- ✅ Sistema de autenticación con JWT
- ✅ Carrito de compras persistente
- ✅ Filtrado por categorías
- ✅ Búsqueda de productos
- ✅ Sistema de reseñas con calificaciones
- ✅ Gestión de pedidos
- ✅ Diseño responsive (móvil y escritorio)
- ✅ Validación de stock en tiempo real
- ✅ Cálculo automático de totales

## 🔧 Configuración

### Variables de Entorno
El frontend se conecta al backend en `http://localhost:8080/api` por defecto.

Para cambiar la URL del API, edita `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://tu-servidor:puerto/api';
```

### Proxy de Desarrollo
Vite está configurado con proxy para evitar problemas de CORS en desarrollo:
```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true
  }
}
```

## 🎨 Personalización

### Colores
Los colores principales se definen en `src/index.css`:
```css
:root {
  --primary-color: #0d6efd;
  --secondary-color: #6c757d;
  --success-color: #198754;
  --danger-color: #dc3545;
}
```

### Componentes Bootstrap
Todos los componentes usan React Bootstrap. Consulta la [documentación](https://react-bootstrap.github.io/) para personalizaciones.

## 📱 Responsive Design

El frontend está optimizado para:
- 📱 Móviles (< 768px)
- 📱 Tablets (768px - 1024px)
- 💻 Escritorio (> 1024px)

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens):
- El token se almacena en `localStorage`
- Se envía automáticamente en cada request mediante interceptor de Axios
- Redirección automática a login en caso de token expirado

## 🛒 Gestión de Carrito

- Actualización en tiempo real
- Validación de stock
- Cálculo automático de totales
- Persistencia con el backend

## 📦 Producción

```bash
# Compilar para producción
npm run build

# Los archivos compilados estarán en dist/
```

Para desplegar, copia el contenido de `dist/` a tu servidor web.

## 🐛 Solución de Problemas

### El backend no responde
1. Verifica que el backend esté corriendo en `http://localhost:8080`
2. Revisa la consola del navegador para errores de CORS
3. Confirma que la URL del API en `src/services/api.js` sea correcta

### Problemas con el carrito
1. Verifica que estés autenticado
2. Revisa la consola del navegador
3. Confirma que el token JWT sea válido

### Errores de compilación
1. Elimina `node_modules` y ejecuta `npm install`
2. Verifica que tengas Node.js 16+ instalado
3. Limpia el cache: `npm cache clean --force`

## 🤝 Integración con Backend

Este frontend está diseñado para trabajar con el backend Spring Boot ubicado en `../backend/`.

**Endpoints utilizados:**
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrarse
- `GET /api/categorias` - Listar categorías
- `GET /api/productos` - Listar productos
- `GET /api/carrito` - Ver carrito
- `POST /api/pedidos` - Crear pedido
- Y más...

## 📄 Licencia

Este proyecto es parte del sistema Comuctiva.
