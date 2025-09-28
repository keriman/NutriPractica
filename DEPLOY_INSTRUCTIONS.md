# 🚀 Guía Completa de Despliegue

## **Configuración: Frontend + DB en Servidor Compartido | Backend en Render**

### **📋 PREPARATIVOS**

**Archivos generados para el despliegue:**
- ✅ `.htaccess` - Configuración para servidor compartido
- ✅ `.env.production` - Variables de entorno para producción
- ✅ `package.json.render` - Package.json optimizado para Render
- ✅ `tsconfig.server.json` - Configuración TypeScript para backend

---

## **🔧 PARTE 1: CONFIGURAR RENDER (Backend)**

### **Paso 1: Crear cuenta en Render**
1. Ve a [render.com](https://render.com) y crea una cuenta
2. Conecta tu repositorio de GitHub

### **Paso 2: Crear Web Service en Render**
1. **New → Web Service**
2. **Conecta tu repositorio**
3. **Configuración:**
   ```
   Name: nutri-practica-api (o el nombre que prefieras)
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

### **Paso 3: Variables de entorno en Render**
En la sección **Environment** de tu servicio, agrega:

```env
# Base de datos (usar datos de tu servidor compartido)
DB_HOST=tu_host_mysql_del_servidor_compartido
DB_PORT=3306
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql
DB_NAME=nutrition_app

# JWT Secret (genera uno seguro)
JWT_SECRET=un_string_muy_largo_y_seguro_para_jwt

# Frontend URL (tu dominio del servidor compartido)
FRONTEND_URL=https://tu-dominio.com

# APIs opcionales (si las usas)
OPENAI_API_KEY=tu_api_key_si_la_tienes
GOOGLE_AI_API_KEY=tu_google_api_key_si_la_tienes
```

### **Paso 4: Deploy en Render**
1. Hacer push a tu repositorio
2. Render detectará automáticamente los cambios
3. **Anotar la URL de Render:** `https://tu-app-name.onrender.com`

---

## **🌐 PARTE 2: CONFIGURAR SERVIDOR COMPARTIDO (Frontend + DB)**

### **Paso 1: Configurar Base de Datos MySQL**

**En cPanel o panel de tu hosting:**

1. **Crear Base de Datos:**
   ```
   Nombre: nutrition_app (o el que prefieras)
   ```

2. **Crear Usuario MySQL:**
   ```
   Usuario: nutrition_user (ejemplo)
   Password: [password seguro]
   ```

3. **Importar estructura de base de datos:**
   - Sube el archivo `nutrition_app.sql` via phpMyAdmin
   - O ejecuta las queries de `server/database/connection.ts`

### **Paso 2: Preparar Frontend**

**En tu computadora:**

1. **Actualizar URL del API:**
   ```bash
   # Editar src/lib/apiService.ts línea 3
   const API_BASE_URL = 'https://tu-app-render.onrender.com/api';
   ```

2. **Recompilar para producción:**
   ```bash
   npm run build
   ```

### **Paso 3: Subir Frontend al Servidor**

**Via FTP, FileManager o cPanel:**

1. **Subir archivos:**
   ```
   Sube TODO el contenido de la carpeta dist/ a:
   → public_html/ (o la carpeta pública de tu hosting)

   Los archivos deben quedar así:
   public_html/
   ├── index.html
   ├── assets/
   │   ├── index-[hash].js
   │   ├── index-[hash].css
   │   └── logonutri-[hash].png
   └── .htaccess
   ```

2. **Subir archivo .htaccess:**
   - Copia el archivo `.htaccess` generado a `public_html/`

---

## **⚙️ PARTE 3: CONFIGURACIÓN FINAL**

### **Paso 1: Actualizar CORS en Render**
En las variables de entorno de Render, asegúrate de tener:
```env
FRONTEND_URL=https://tu-dominio-real.com
```

### **Paso 2: Verificar conexión**
1. **Probar frontend:** `https://tu-dominio.com`
2. **Probar backend:** `https://tu-app-render.onrender.com/health`
3. **Probar conexión:** Crear cuenta en tu app

---

## **🗃️ ESTRUCTURA FINAL**

```
📁 Servidor Compartido (tu-dominio.com)
├── 🌐 Frontend (React compilado)
├── 🗄️ Base de datos MySQL
└── 📂 Archivos estáticos

☁️ Render (tu-app.onrender.com)
└── 🔧 Backend API (Node.js + Express)
```

---

## **🔄 PROCESO PARA FUTURAS ACTUALIZACIONES**

### **Para actualizar Frontend:**
```bash
# 1. Hacer cambios en el código
# 2. Actualizar URL si es necesario en apiService.ts
# 3. Recompilar
npm run build

# 4. Subir archivos de dist/ al servidor compartido
```

### **Para actualizar Backend:**
```bash
# 1. Hacer cambios en server/
# 2. Commit y push a GitHub
# 3. Render se actualiza automáticamente
```

---

## **🛠️ COMANDOS ÚTILES**

### **Para desarrollo local:**
```bash
npm run start:all        # Frontend + Backend juntos
npm run dev             # Solo frontend
npm run server:dev      # Solo backend
```

### **Para producción:**
```bash
npm run build           # Compilar frontend
npm run typecheck       # Verificar tipos
```

---

## **❗ PROBLEMAS COMUNES**

### **Error: CORS**
- ✅ Verificar `FRONTEND_URL` en variables de Render
- ✅ Verificar que el dominio sea correcto

### **Error: Base de datos no conecta**
- ✅ Verificar credenciales MySQL en Render
- ✅ Verificar que la base de datos esté creada
- ✅ Verificar permisos del usuario MySQL

### **Error: 404 en rutas**
- ✅ Verificar que `.htaccess` esté en public_html/
- ✅ Verificar que el servidor soporte mod_rewrite

### **Render app "durmiendo"**
- ✅ Render free tier hace que las apps "duerman" después de 15 min
- ✅ Primera carga puede tardar 30-60 segundos
- ✅ Considera upgrade a plan paid si es crítico

---

## **📞 CHECKLIST FINAL**

- [ ] ✅ Backend deployado en Render
- [ ] ✅ Variables de entorno configuradas en Render
- [ ] ✅ Base de datos MySQL creada en servidor compartido
- [ ] ✅ Frontend compilado con URL correcta de Render
- [ ] ✅ Archivos de dist/ subidos al servidor compartido
- [ ] ✅ Archivo .htaccess configurado
- [ ] ✅ Probado: registro/login funciona
- [ ] ✅ Probado: todas las funcionalidades principales

---

**🎉 ¡Tu aplicación estará funcionando en producción!**

**URLs finales:**
- **App:** `https://tu-dominio.com`
- **API:** `https://tu-app-render.onrender.com`