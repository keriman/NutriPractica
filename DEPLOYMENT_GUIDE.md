# 🚀 Guía de Deployment - Sistema de Nutrición

## ✅ **Build Completado Exitosamente**

Tu proyecto se ha compilado correctamente y está listo para deployment. Los archivos se encuentran en la carpeta `dist/`.

## 📁 **Estructura de Archivos Generados**

```
dist/
├── index.html                    # Página principal (491 bytes)
├── assets/
│   ├── index-DO58NF9q.js        # JavaScript compilado (582 KB)
│   ├── index-BLvTyi0Z.css       # Estilos CSS (27 KB)
│   └── logonutri-DlewhRN6.png   # Tu logo (155 KB)
```

## 🌐 **Opciones de Deployment**

### **Opción 1: Servidor Compartido Tradicional (Recomendado para ti)**

#### **Frontend (Archivos Estáticos)**
1. **Sube toda la carpeta `dist/` a tu servidor compartido**
   - Puede ser a través de FTP, FileManager o cPanel
   - Colócala en la carpeta `public_html/` o `www/`

2. **Configuración del servidor web**
   - Asegúrate de que el servidor redirija todas las rutas a `index.html`
   - Esto es necesario para el enrutamiento de React

#### **Backend (Servidor Node.js)**
⚠️ **IMPORTANTE**: Tu aplicación tiene dos partes:

1. **Frontend**: Los archivos en `dist/` (archivos estáticos)
2. **Backend**: El servidor Node.js en la carpeta `server/`

**El backend necesita:**
- Servidor que soporte Node.js
- Base de datos MySQL
- Variables de entorno configuradas

### **Opción 2: Servicios de Hosting Modernos**

#### **Frontend + Backend Juntos:**
- **Vercel** (recomendado)
- **Netlify**
- **Railway**
- **Render**

#### **Solo Frontend (sin backend):**
- **GitHub Pages**
- **Vercel**
- **Netlify**

## 🔧 **Configuración Para Servidor Compartido**

### **Paso 1: Preparar Frontend**

1. **Subir archivos:**
   ```
   Sube todo el contenido de dist/ a tu servidor:
   - index.html → public_html/index.html
   - assets/ → public_html/assets/
   ```

2. **Crear archivo `.htaccess` (para Apache):**
   ```apache
   Options -MultiViews
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteRule ^ index.html [QSA,L]
   ```

### **Paso 2: Configurar Backend (si tu hosting soporta Node.js)**

1. **Verificar si tu hosting soporta Node.js:**
   - Muchos hostings compartidos NO soportan Node.js
   - Consulta con tu proveedor

2. **Si soporta Node.js:**
   ```bash
   # Subir carpeta server/ completa
   # Instalar dependencias en el servidor
   npm install

   # Configurar variables de entorno
   # Crear archivo .env en el servidor
   ```

## 🗄️ **Consideraciones de Base de Datos**

### **MySQL en Servidor Compartido:**

1. **Crear base de datos desde cPanel/Panel de control**

2. **Obtener credenciales:**
   - Host: generalmente `localhost`
   - Usuario: proporcionado por el hosting
   - Contraseña: proporcionado por el hosting
   - Base de datos: nombre que creaste

3. **Configurar `.env` en el servidor:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=tu_usuario_mysql
   DB_PASSWORD=tu_password_mysql
   DB_NAME=tu_base_datos
   PORT=3001
   ```

## ⚡ **Deployment Simplificado (Solo Frontend)**

Si tu hosting compartido NO soporta Node.js, puedes:

### **Opción A: Solo Frontend con API Externa**
- Usar servicios como **Supabase**, **Firebase** o **PlanetScale** para la base de datos
- Modificar el frontend para conectarse directamente a estos servicios

### **Opción B: Hosting Híbrido**
- **Frontend**: En tu servidor compartido
- **Backend**: En un servicio como Railway, Render o Vercel
- Modificar las URLs de API en el frontend

## 🛠️ **Scripts de Deployment**

### **Para re-compilar:**
```bash
npm run build
```

### **Para probar localmente:**
```bash
npm run preview
```

### **Para servidor completo:**
```bash
npm run start:all
```

## 📋 **Checklist de Deployment**

- [ ] ✅ Frontend compilado (`npm run build`)
- [ ] ✅ Archivos en `dist/` listos
- [ ] ⏳ Hosting compatible verificado
- [ ] ⏳ Base de datos MySQL configurada
- [ ] ⏳ Variables de entorno configuradas
- [ ] ⏳ Archivos subidos al servidor
- [ ] ⏳ Dominio/URL configurado

## 🌍 **URLs de Acceso Post-Deployment**

Una vez deployado:
- **Frontend**: `https://tu-dominio.com`
- **Backend API**: `https://tu-dominio.com/api` (si está en el mismo servidor)

## ❓ **¿Qué tipo de hosting tienes?**

Para darte instrucciones más específicas, me gustaría saber:

1. **¿Qué proveedor de hosting usas?** (ej: GoDaddy, Hostinger, etc.)
2. **¿Soporta Node.js tu hosting?**
3. **¿Tienes acceso a MySQL?**
4. **¿Prefieres una solución más simple (solo frontend)?**

## 🚨 **Problemas Comunes**

### **Error: Rutas no funcionan**
- Solución: Agregar `.htaccess` con redirección a `index.html`

### **Error: API no responde**
- Verificar que el backend esté corriendo
- Verificar URLs de API en el código

### **Error: Base de datos no conecta**
- Verificar credenciales en `.env`
- Verificar que MySQL esté activo

---

**¡Tu aplicación está lista para deployment!** 🎉

Los archivos en `dist/` contienen todo lo necesario para el frontend, incluyendo tu logo personalizado.