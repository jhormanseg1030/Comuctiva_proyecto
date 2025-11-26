# Sistema de Gestión - Frontend Móvil

Esta es la aplicación móvil del Sistema de Gestión empresarial desarrollada con React Native y Expo.

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18 o superior
- Expo CLI
- Expo Go app en tu dispositivo móvil
- Backend ejecutándose en el puerto 8080

### Instalación y Ejecución

1. **Ejecuta el script de inicio:**
   ```bash
   iniciar.bat
   ```

2. **O manualmente:**
   ```bash
   npm install
   npx expo start
   ```

3. **Escanea el código QR** con Expo Go en tu dispositivo móvil

### 📱 Configuración para Dispositivos Móviles

**IMPORTANTE**: Para que la app funcione en tu dispositivo móvil, debes cambiar la URL de la API:

1. Abre `src/services/api.ts`
2. Cambia `192.168.1.100` por tu IP local:
   ```typescript
   const API_BASE_URL = 'http://TU_IP_LOCAL:8080/api';
   ```

#### ¿Cómo encontrar tu IP local?

**Windows:**
```cmd
ipconfig
```
Busca "IPv4 Address" en tu adaptador de red activo.

**Mac/Linux:**
```bash
ifconfig
```

### 🔐 Credenciales de Prueba

- **Admin**: `admin` / `admin123`
- **Coordinador**: `coordinador` / `coord123`

### 📂 Estructura del Proyecto

```
src/
├── screens/          # Pantallas de la aplicación
│   ├── LoginScreen.tsx          # Pantalla de inicio de sesión
│   ├── HomeScreen.tsx           # Pantalla principal con menú
│   ├── CreateProductScreen.tsx  # Crear nuevos productos
│   ├── ProductListScreen.tsx    # Listar productos existentes
│   ├── PublishProductScreen.tsx # Gestionar publicación de productos
│   └── PublishedProductsScreen.tsx # Ver catálogo público
├── context/          # Contextos de React
│   └── AuthContext.tsx
├── services/         # Servicios de API
│   └── api.ts
└── styles/           # Estilos globales
    ├── GlobalStyles.ts
    └── LoginStyles.ts
```

### 🛠️ Funcionalidades

- ✅ Autenticación de usuarios
- ✅ Navegación entre pantallas
- ✅ **Crear productos** con formulario completo
- ✅ **Listar productos** con información detallada
- ✅ **Publicar productos** - Gestionar visibilidad pública
- ✅ **Catálogo público** - Ver productos publicados
- ✅ **Estados de publicación** - Borrador vs Publicado
- ✅ Diseño responsivo y atractivo
- ✅ Gestión de estado con Context API
- ✅ Almacenamiento local con AsyncStorage
- ✅ Integración con API REST del backend

### 🔧 Desarrollo

Para agregar nuevas pantallas:

1. Crea el componente en `src/screens/`
2. Agrega la ruta en `App.tsx`
3. Actualiza la navegación según sea necesario

### 📝 Notas de Desarrollo

- La app está configurada para funcionar con Expo Go
- Se utiliza React Navigation para la navegación
- Los estilos están centralizados en `GlobalStyles.ts`
- La autenticación se maneja con Context API
- Los tokens se almacenan de forma segura con AsyncStorage

### 🐛 Solución de Problemas

**La app no se conecta al backend:**
- Verifica que el backend esté ejecutándose
- Confirma que la IP en `api.ts` sea correcta
- Asegúrate de que ambos dispositivos estén en la misma red

**El código QR no aparece:**
- Ejecuta `npx expo start --clear`
- Verifica que tengas Expo CLI instalado
- Prueba con `npx expo start --tunnel` si hay problemas de red