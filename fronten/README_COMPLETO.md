# 📱 E-Commerce Mobile App - Sistema Completo

## 📋 Descripción General

Aplicación móvil de e-commerce desarrollada en **React Native** con **Expo** que permite a los usuarios comprar y vender productos con un sistema de roles diferenciados (ADMIN/USUARIO).

## 🎯 Características Principales

### 🔐 Sistema de Autenticación
- Login con JWT tokens
- Registro de nuevos usuarios
- Manejo de roles: **ADMIN** y **USUARIO**
- Persistencia de sesión con AsyncStorage

### 👤 Funcionalidades para USUARIOS
- **🛒 Comprar productos**: Explorar y comprar productos del marketplace
- **📦 Crear productos**: Añadir nuevos productos al catálogo
- **📝 Gestionar productos**: Ver y editar productos propios
- **🏪 Publicar productos**: Poner productos en venta
- **📊 Reportes de ventas**: Ver estadísticas de productos vendidos
- **🧾 Historial de compras**: Ver productos comprados
- **👥 Marketplace**: Ver productos de otros usuarios

### 🛡️ Funcionalidades para ADMINISTRADORES
- **👥 Gestión de usuarios**: Administrar usuarios del sistema
- **📊 Reportes globales**: Ver estadísticas de todo el sistema
- **🔧 Moderación**: Herramientas de supervisión
- **📦 Gestión total de productos**: Supervisar todos los productos
- **🛠️ Configuración del sistema**: Panel administrativo

## 📱 Pantallas de la Aplicación

### Pantallas de Autenticación
- **`LoginScreen.tsx`**: Pantalla de inicio de sesión

### Pantallas Principales
- **`HomeScreen.tsx`**: Dashboard principal con menú adaptativo por rol
- **`PublishedProductsScreen.tsx`**: Marketplace principal (diferente UI por rol)

### Pantallas de Productos
- **`CreateProductScreen.tsx`**: Crear nuevos productos
- **`ProductListScreen.tsx`**: Lista de productos del usuario
- **`PublishProductScreen.tsx`**: Publicar productos en el marketplace

### Pantallas de Ventas y Compras
- **`SalesReportScreen.tsx`**: Reportes y estadísticas de ventas
- **`SaleDetailScreen.tsx`**: Detalle de ventas individuales
- **`PurchasesScreen.tsx`**: Historial de compras
- **`PurchaseDetailScreen.tsx`**: Detalle de compras individuales

### Pantallas Administrativas
- **`AdminUsersScreen.tsx`**: Gestión de usuarios (solo ADMIN)

## 🏗️ Arquitectura Técnica

### 📦 Dependencias Principales
```json
{
  "expo": "~54.0.25",
  "react": "18.2.0",
  "react-native": "0.76.5",
  "@react-navigation/native": "^6.0.0",
  "@react-navigation/native-stack": "^6.0.0",
  "axios": "^1.0.0",
  "@react-native-async-storage/async-storage": "^1.0.0",
  "typescript": "~5.9.2"
}
```

### 📁 Estructura de Carpetas
```
fronten/
├── src/
│   ├── screens/           # Pantallas de la app
│   ├── context/           # Context API (AuthContext)
│   ├── services/          # Servicios API
│   └── styles/            # Estilos globales
├── App.tsx               # Componente principal y navegación
└── package.json          # Configuración del proyecto
```

### 🔗 Sistema de Navegación
- **React Navigation Stack**: Navegación entre pantallas
- **Navegación condicional**: Basada en roles de usuario
- **Rutas protegidas**: Acceso restringido según permisos

### 📊 Gestión de Estado
- **AuthContext**: Manejo global de autenticación y roles
- **Local State**: Estado local en cada componente
- **AsyncStorage**: Persistencia de tokens y datos del usuario

## 🎨 Interfaz de Usuario

### 🎭 Sistema de Roles
- **ADMIN**: 
  - 🟣 Color púrpura (#9C27B0)
  - 🛡️ Iconos de escudo y gestión
  - 📊 Estadísticas globales del sistema
  - 🔧 Herramientas de moderación

- **USUARIO**: 
  - 🔵 Color azul (Colors.primary)
  - 👤 Iconos de usuario y comercio
  - 📈 Estadísticas personales
  - 🛒 Funciones de compra/venta

### 🎨 Diseño Visual
- **Material Design**: Componentes con sombras y bordes redondeados
- **Colores consistentes**: Paleta definida en GlobalStyles
- **Iconos emojis**: Interfaz amigable y visual
- **Responsive**: Adaptable a diferentes tamaños de pantalla

## 🚀 Configuración y Ejecución

### 📋 Prerrequisitos
```bash
# Node.js y npm
node --version  # v16+
npm --version   # v8+

# Expo CLI
npm install -g expo-cli
```

### 🛠️ Instalación
```bash
# Clonar e instalar dependencias
cd fronten
npm install

# Iniciar servidor de desarrollo
npx expo start

# Usar Expo Go para pruebas
# Escanear QR code con la app Expo Go
```

### 📱 Dispositivos Soportados
- **iOS**: iPhone 11+ (iOS 13+)
- **Android**: API Level 21+ (Android 5.0+)
- **Expo Go**: Para desarrollo y pruebas rápidas

## 🔧 Configuración del Backend

### 🌐 API Endpoints
La aplicación se conecta con un backend Java Spring Boot:
```
Base URL: http://localhost:8080/api

Endpoints principales:
- POST /auth/login         # Autenticación
- GET  /productos          # Lista de productos
- POST /productos          # Crear producto
- PUT  /productos/{id}     # Actualizar producto
- GET  /ventas            # Reportes de ventas
- GET  /compras           # Historial de compras
```

### ⚙️ Configuración de API
Editar `src/services/api.ts`:
```typescript
const BASE_URL = 'http://TU_SERVIDOR:8080/api';
```

## 🧪 Testing y Desarrollo

### 🏃‍♂️ Scripts Disponibles
```bash
# Desarrollo
npm start              # Iniciar Expo
npx expo start --web   # Versión web
npx expo start --ios   # Simulador iOS
npx expo start --android # Emulador Android

# Build
npx expo build:android  # Build para Android
npx expo build:ios     # Build para iOS
```

### 👥 Usuarios de Prueba
```
Administrador:
- Usuario: admin
- Contraseña: admin123
- Rol: ADMIN

Usuario Regular:
- Usuario: usuario1
- Contraseña: usuario123
- Rol: USUARIO
```

## 🔮 Funcionalidades Pendientes

### 🚧 Próximas Implementaciones
- **🔍 Búsqueda avanzada**: Filtros por categoría, precio, etc.
- **💬 Sistema de chat**: Comunicación comprador-vendedor
- **⭐ Calificaciones**: Sistema de reviews y ratings
- **📷 Galería de imágenes**: Múltiples fotos por producto
- **💳 Pagos integrados**: Stripe, PayPal, etc.
- **📱 Push notifications**: Notificaciones en tiempo real
- **🌍 Geolocalización**: Productos por ubicación
- **📊 Analytics avanzados**: Métricas detalladas

### 🛡️ Administración Avanzada
- **🔐 Gestión de permisos**: Roles más granulares
- **📋 Logs del sistema**: Auditoría completa
- **⚠️ Sistema de reportes**: Reportar productos/usuarios
- **🔄 Backup y restore**: Respaldo de datos
- **📈 Dashboard analytics**: Métricas en tiempo real

## 📚 Recursos y Referencias

### 📖 Documentación
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)

### 🎓 Aprendizaje
- [React Native Tutorial](https://reactnative.dev/docs/tutorial)
- [Expo Snacks](https://snack.expo.dev/) - Playground online
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 👨‍💻 Información del Desarrollador

```
Proyecto: E-Commerce Mobile App
Tecnología: React Native + Expo + TypeScript
Arquitectura: Context API + Stack Navigation
Estado: ✅ Funcional - Listo para producción
Última actualización: Diciembre 2024
```

## 🎉 ¡Aplicación Lista!

La aplicación móvil de e-commerce está **completamente funcional** con:

✅ **Sistema de autenticación completo**  
✅ **Roles diferenciados (ADMIN/USUARIO)**  
✅ **Marketplace funcional**  
✅ **Gestión de productos**  
✅ **Sistema de compras y ventas**  
✅ **Reportes y estadísticas**  
✅ **Panel administrativo**  
✅ **UI/UX optimizada por roles**  

**🚀 ¡Lista para usar con Expo Go y desplegar en producción!**