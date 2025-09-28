# 🚀 Guía Completa de Despliegue en Render

## **Configuración: TODO en Render**
- **Frontend**: Render Static Site
- **Backend**: Render Web Service
- **Database**: Render PostgreSQL

---

## **🔧 PARTE 1: CREAR BASE DE DATOS POSTGRESQL**

### **Paso 1: Crear PostgreSQL Database**
1. **Ve a [render.com](https://render.com)**
2. **New → PostgreSQL**
3. **Configuración:**
   ```
   Name: nutripractica-db
   Database: nutripractica
   User: nutripractica_user
   Region: Oregon (US West) - recomendado
   PostgreSQL Version: 16 (latest)
   Plan: Free
   ```

4. **Copia las credenciales** que aparecerán:
   ```
   Internal Database URL: postgresql://nutripractica_user:password@internal-host/nutripractica
   External Database URL: postgresql://nutripractica_user:password@external-host/nutripractica
   ```

---

## **🔧 PARTE 2: CREAR BACKEND (Web Service)**

### **Paso 1: Crear Web Service**
1. **New → Web Service**
2. **Conecta tu repositorio:** `keriman/NutriPractica`
3. **Configuración:**
   ```
   Name: nutripractica-be
   Environment: Node
   Region: Oregon (US West) - MISMO que la DB
   Branch: main
   Build Command: npm install
   Start Command: npm start
   ```

### **Paso 2: Variables de entorno**
En la sección **Environment** del Web Service:

```env
# Base de datos (usar URL INTERNA de tu PostgreSQL de Render)
DATABASE_URL=postgresql://nutripractica_user:password@internal-host/nutripractica

# JWT Secret (genera uno seguro)
JWT_SECRET=un_string_muy_largo_y_seguro_para_jwt_cambiar_en_produccion

# Node Environment
NODE_ENV=production

# Frontend URL (se llenará después)
FRONTEND_URL=URL

# APIs opcionales (si las usas)
OPENAI_API_KEY=KEY
GOOGLE_AI_API_KEY=KEY
```

### **Paso 3: Deploy Backend**
1. **Save & Deploy**
2. **Anota la URL:** `https://nutripractica-be.onrender.com`

---

## **🔧 PARTE 3: CREAR FRONTEND (Static Site)**

### **Paso 1: Actualizar código del frontend**
En tu computadora, edita `src/lib/apiService.ts`:

```typescript
// Cambiar línea 3:
const API_BASE_URL = 'https://nutripractica-be.onrender.com/api';
```

### **Paso 2: Recompilar frontend**
```bash
npm run build
```

### **Paso 3: Crear Static Site**
1. **New → Static Site**
2. **Conecta tu repositorio:** `keriman/NutriPractica`
3. **Configuración:**
   ```
   Name: nutripractica
   Branch: main
   Build Command: npm run build
   Publish Directory: dist
   ```

### **Paso 4: Deploy Frontend**
1. **Create Static Site**
2. **Anota la URL:** `https://nutripractica.onrender.com`

---

## **🔧 PARTE 4: CONFIGURACIÓN FINAL**

### **Paso 1: Actualizar CORS en Backend**
1. **Ve al Web Service (backend)**
2. **Environment → FRONTEND_URL**
3. **Cambia a:** `https://nutripractica.onrender.com`
4. **Manual Deploy**

### **Paso 2: Verificar conexiones**
1. **Backend Health:** `https://nutripractica-be.onrender.com/health`
2. **Frontend:** `https://nutripractica.onrender.com`
3. **Test completo:** Crear cuenta y paciente

---

## **⚙️ ESTRUCTURA FINAL**

```
🌐 Frontend (Static Site)
└── https://nutripractica.onrender.com

🔧 Backend (Web Service)
└── https://nutripractica-be.onrender.com

🗄️ Database (PostgreSQL)
└── Internal connection via DATABASE_URL
```

---

## **🔄 PROCESO PARA FUTURAS ACTUALIZACIONES**

### **Para actualizar código:**
```bash
# 1. Hacer cambios
# 2. Commit y push a GitHub
git add .
git commit -m "Update: descripción del cambio"
git push origin main

# 3. Render se actualiza automáticamente
```

### **Auto-Deploy configurado:**
- ✅ **Frontend**: Se actualiza al hacer push a `main`
- ✅ **Backend**: Se actualiza al hacer push a `main`
- ✅ **Database**: Persiste automáticamente

---

## **💰 COSTOS**

### **Plan Gratuito de Render:**
- ✅ **PostgreSQL**: 1GB, 1 mes retention
- ✅ **Web Service**: 512MB RAM, sleep after 15min
- ✅ **Static Site**: 100GB bandwidth
- ✅ **Custom domains**: Incluidos

### **Limitaciones del plan gratuito:**
- ⚠️ **Web Services "duermen"** después de 15 min de inactividad
- ⚠️ **Primera carga** puede tardar 30-60 segundos
- ⚠️ **Database retention** de solo 1 mes

---

## **🛠️ COMANDOS ÚTILES**

### **Para desarrollo local:**
```bash
npm run start:all        # Frontend + Backend
npm run dev             # Solo frontend
npm run server:dev      # Solo backend
```

### **Para verificar build:**
```bash
npm run build           # Compilar frontend
npm run build:server    # Compilar backend
npm run typecheck       # Verificar tipos
```

---

## **❗ PROBLEMAS COMUNES**

### **Error: Database connection failed**
- ✅ Verificar `DATABASE_URL` en variables de entorno
- ✅ Usar URL **INTERNA** de PostgreSQL (empieza con interno)
- ✅ Verificar que backend y DB estén en la misma región

### **Error: CORS**
- ✅ Verificar `FRONTEND_URL` en backend
- ✅ Verificar que las URLs sean exactas (sin / al final)

### **Error: API calls failing**
- ✅ Verificar URL en `apiService.ts`
- ✅ Verificar que backend esté corriendo (no dormido)

### **Backend "durmiendo"**
- ✅ Normal en plan gratuito después de 15 min
- ✅ Primera carga tardará ~30-60 segundos
- ✅ Considera upgrade a plan paid si es crítico

---

## **📞 CHECKLIST FINAL**

- [ ] ✅ PostgreSQL database creada
- [ ] ✅ Backend Web Service configurado y corriendo
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Frontend Static Site desplegado
- [ ] ✅ URLs actualizadas en el código
- [ ] ✅ CORS configurado correctamente
- [ ] ✅ Probado: registro/login funciona
- [ ] ✅ Probado: crear paciente funciona
- [ ] ✅ Probado: todas las funcionalidades principales

---

## **🎉 URLS FINALES**

Una vez completado el deploy:

- **🌐 App Principal:** `https://nutripractica.onrender.com`
- **🔧 API Backend:** `https://nutripractica-be.onrender.com`
- **🗄️ Database:** Conectada internamente

**¡Tu aplicación estará 100% funcional en la nube con Render!**

---

## **💡 VENTAJAS DE ESTA CONFIGURACIÓN**

✅ **Todo en una plataforma** - Fácil gestión
✅ **Auto-deploy** desde GitHub
✅ **Escalabilidad** - Fácil upgrade
✅ **SSL/HTTPS** automático
✅ **Backups** automáticos de DB
✅ **Monitoring** incluido
✅ **Custom domains** soportados