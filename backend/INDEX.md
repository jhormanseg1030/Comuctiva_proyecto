# 📚 Documentación E-commerce Backend

## 🚀 Inicio Rápido

Empieza aquí si es tu primera vez:

1. **[START.md](START.md)** 👈 **EMPIEZA AQUÍ**
   - Guía de inicio rápido (3 pasos)
   - Cómo compilar y ejecutar
   - Verificación rápida

---

## 📖 Documentación Completa

### 📘 [README.md](README.md)
La documentación principal del proyecto:
- Requisitos del sistema
- Configuración de XAMPP y MySQL
- Estructura del proyecto completa
- **Todos los endpoints REST** (26 endpoints)
- Ejemplos de uso con Postman/cURL
- Roles y permisos (ADMIN vs USER)
- Solución de problemas

### 🧪 [TESTING.md](TESTING.md)
Guía paso a paso para probar el backend:
- Configuración inicial
- **12 pasos de pruebas** con ejemplos
- Registrar usuarios (ADMIN y USER)
- Crear categorías, subcategorías y productos
- Verificación en phpMyAdmin
- Gestión de usuarios
- Todos los ejemplos con JSON completo

### 📊 [SUMMARY.md](SUMMARY.md)
Resumen ejecutivo del proyecto:
- Estructura de 48 archivos creados
- Base de datos con 11 tablas
- Sistema de autenticación JWT
- Roles y permisos detallados
- 26 endpoints implementados
- Tecnologías utilizadas
- Pendientes para siguiente fase

### 🔧 [COMANDOS.md](COMANDOS.md)
Comandos útiles y referencia rápida:
- Comandos Maven
- Consultas SQL útiles
- Comandos cURL para testing
- Debugging y troubleshooting
- Comandos Git
- Comandos de producción

### 🗄️ [db_init.sql](db_init.sql)
Script SQL de referencia:
- Estructura de la base de datos
- Datos de ejemplo
- Usuarios de prueba (admin/user123)

---

## 🛠️ Herramientas

### 📮 [Ecomerce_Backend.postman_collection.json](Ecomerce_Backend.postman_collection.json)
Colección de Postman lista para importar:
- Todos los endpoints configurados
- Variables de entorno incluidas
- Auto-guardado de token JWT
- Ejemplos de peticiones

**Cómo usar:**
1. Abre Postman
2. Import → Archivo
3. Selecciona `Ecomerce_Backend.postman_collection.json`
4. ¡Listo para probar!

### ⚙️ Scripts de Windows

#### [verificar.bat](verificar.bat)
Verifica que tengas todo instalado:
- Java 17+
- Maven
- Estructura del proyecto

```bash
verificar.bat
```

#### [compilar.bat](compilar.bat)
Compila el proyecto completo:
```bash
compilar.bat
```

#### [iniciar.bat](iniciar.bat)
Inicia el servidor backend:
```bash
iniciar.bat
```

---

## 🎯 Guías por Tarea

### Si quieres... → Lee esto:

| Tarea | Documento |
|-------|-----------|
| **Iniciar por primera vez** | [START.md](START.md) |
| **Ver todos los endpoints** | [README.md](README.md) |
| **Probar paso a paso** | [TESTING.md](TESTING.md) |
| **Ver qué se implementó** | [SUMMARY.md](SUMMARY.md) |
| **Comandos útiles** | [COMANDOS.md](COMANDOS.md) |
| **Usar Postman** | Importar `Ecomerce_Backend.postman_collection.json` |
| **Verificar instalación** | Ejecutar `verificar.bat` |
| **Compilar** | Ejecutar `compilar.bat` |
| **Iniciar servidor** | Ejecutar `iniciar.bat` |
| **Ver BD** | [db_init.sql](db_init.sql) + phpMyAdmin |

---

## 📂 Archivos del Proyecto

### Configuración
- `pom.xml` - Dependencias Maven
- `.gitignore` - Archivos ignorados en Git
- `application.properties` - Configuración de BD y JWT

### Código Fuente (48 archivos Java)
- **Controller** (5 archivos) - Endpoints REST
- **DTO** (4 archivos) - Objetos de transferencia
- **Model** (11 archivos) - Entidades de BD
- **Repository** (11 archivos) - Acceso a datos
- **Security** (5 archivos) - JWT y autenticación
- **Service** (4 archivos) - Lógica de negocio

---

## 🎓 Flujo de Lectura Recomendado

### Para principiantes:
1. **[START.md](START.md)** - Inicio rápido
2. **[TESTING.md](TESTING.md)** - Probar endpoints
3. **[README.md](README.md)** - Entender a fondo
4. **[COMANDOS.md](COMANDOS.md)** - Referencia rápida

### Para desarrolladores:
1. **[SUMMARY.md](SUMMARY.md)** - Vista general
2. **[README.md](README.md)** - Detalles técnicos
3. **Código fuente** - Revisar implementación
4. **[TESTING.md](TESTING.md)** - Casos de prueba

### Para project managers:
1. **[SUMMARY.md](SUMMARY.md)** - Estado del proyecto
2. **[START.md](START.md)** - Demo rápida
3. **[README.md](README.md)** - Capacidades completas

---

## 🔍 Búsqueda Rápida

### Necesito saber sobre...

**Autenticación JWT:**
- README.md → Sección "Autenticación"
- TESTING.md → Paso 1 y 2
- SUMMARY.md → "Sistema de Autenticación"

**Roles y Permisos:**
- README.md → Sección "Roles y Permisos"
- SUMMARY.md → "Sistema de Roles y Permisos"

**Endpoints:**
- README.md → Sección "Endpoints Principales"
- SUMMARY.md → "Endpoints Implementados"
- Postman Collection → Todos organizados

**Base de Datos:**
- SUMMARY.md → "Base de Datos Creada"
- db_init.sql → Script completo
- COMANDOS.md → Consultas SQL

**Problemas:**
- README.md → "Solución de Problemas"
- COMANDOS.md → "Comandos de Emergencia"
- START.md → "Solución de Problemas Comunes"

---

## 📞 Enlaces Útiles

Una vez que el backend esté corriendo:

- **Backend API:** http://localhost:8080/api
- **phpMyAdmin:** http://localhost/phpmyadmin
- **Health Check:** http://localhost:8080/api/categorias

---

## ✅ Checklist de Inicio

Antes de empezar, verifica:

- [ ] Java 17 instalado (`java -version`)
- [ ] Maven instalado (`mvn -version`)
- [ ] XAMPP instalado
- [ ] MySQL corriendo en XAMPP (texto verde)
- [ ] Puerto 8080 disponible
- [ ] Has leído [START.md](START.md)

---

## 🚀 Próximos Pasos

Después de probar el backend básico:

1. ✅ **Completado:** Autenticación, Usuarios, Categorías, Productos
2. ⏳ **Siguiente:** Implementar Carrito de Compras
3. ⏳ **Luego:** Pedidos y Ventas
4. ⏳ **Después:** Promociones y Comentarios
5. ⏳ **Finalmente:** Reportes y Frontend React

Ver [SUMMARY.md](SUMMARY.md) para detalles de pendientes.

---

## 📧 Soporte

Si tienes problemas:

1. **Revisa** [README.md](README.md) → Solución de Problemas
2. **Ejecuta** `verificar.bat` para diagnóstico
3. **Consulta** [COMANDOS.md](COMANDOS.md) → Comandos de Emergencia
4. **Verifica** logs en la terminal donde ejecutaste `mvn spring-boot:run`

---

## 📄 Resumen de Archivos de Documentación

| Archivo | Propósito | Cuándo Leer |
|---------|-----------|-------------|
| **INDEX.md** | Este archivo - Índice general | Primero |
| **START.md** | Inicio rápido | Al empezar |
| **README.md** | Documentación completa | Para entender todo |
| **TESTING.md** | Guía de pruebas | Para probar |
| **SUMMARY.md** | Resumen ejecutivo | Para overview |
| **COMANDOS.md** | Referencia rápida | Como consulta |
| **db_init.sql** | Script de BD | Para referencia |
| **Postman Collection** | Testing con Postman | Para probar API |

---

## 🎉 ¡Bienvenido!

Este backend está **completo y funcional** para:
- ✅ Registro y autenticación de usuarios
- ✅ Gestión de productos
- ✅ Gestión de categorías
- ✅ Control de acceso por roles
- ✅ Base de datos completa con 11 tablas

**Comienza con [START.md](START.md) y estarás probando en 5 minutos!** 🚀

---

**Última actualización:** Noviembre 2024
**Estado:** Backend Básico Completo ✅
