# COMANDOS PARA EJECUTAR LA APP MÓVIL

## 📋 Lista de Comandos

### 1. Configurar IP Local
```bash
configurar_ip.bat
```
Este comando te mostrará tu IP local para configurar la conexión al backend.

### 2. Iniciar la Aplicación
```bash
iniciar.bat
```
Instala dependencias y ejecuta la aplicación con Expo.

### 3. Comandos Manuales

#### Instalar dependencias:
```bash
npm install
```

#### Iniciar servidor de desarrollo:
```bash
npx expo start
```

#### Limpiar caché y reiniciar:
```bash
npx expo start --clear
```

#### Usar túnel (para redes complicadas):
```bash
npx expo start --tunnel
```

## 🎯 Flujo de Trabajo Recomendado

1. **Primera vez:**
   ```bash
   configurar_ip.bat
   # Seguir las instrucciones para configurar la IP
   iniciar.bat
   ```

2. **Ejecuciones posteriores:**
   ```bash
   iniciar.bat
   ```

## 📱 Uso en el Dispositivo

1. Instala **Expo Go** desde:
   - Google Play Store (Android)
   - App Store (iOS)

2. Escanea el código QR que aparece en la terminal

3. La app se cargará automáticamente en tu dispositivo

## 🔐 Credenciales de Prueba

- **Usuario:** admin | **Contraseña:** admin123
- **Usuario:** coordinador | **Contraseña:** coord123

## ⚠️ Notas Importantes

- Asegúrate de que el backend esté ejecutándose en el puerto 8080
- Tu dispositivo móvil y PC deben estar en la misma red WiFi
- Si cambias de red, ejecuta `configurar_ip.bat` nuevamente