# Configuración de MySQL para la Aplicación de Nutrióloga

Esta aplicación ahora utiliza MySQL como base de datos local. Sigue estos pasos para configurarla.

## 📋 Requisitos Previos

### 1. Instalar MySQL Server

**Windows:**
- Descarga MySQL Community Server desde: https://dev.mysql.com/downloads/mysql/
- Ejecuta el instalador y sigue las instrucciones
- Durante la instalación, configura una contraseña para el usuario `root`

**macOS:**
```bash
# Usando Homebrew
brew install mysql

# Iniciar MySQL
brew services start mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### 2. Verificar Instalación

```bash
# Conectar a MySQL
mysql -u root -p

# Dentro de MySQL, verificar que funciona
SHOW DATABASES;
EXIT;
```

## ⚙️ Configuración de la Aplicación

### 1. Configurar Variables de Entorno

Edita el archivo `.env` en la raíz del proyecto:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña_aquí
DB_NAME=nutrition_app

# Server Configuration
PORT=3001
```

**IMPORTANTE:** Cambia `tu_contraseña_aquí` por tu contraseña real de MySQL.

### 2. Iniciar la Aplicación

Opción 1 - Todo junto (recomendado):
```bash
npm run start:all
```

Opción 2 - Por separado:
```bash
# Terminal 1: Servidor backend
npm run server:dev

# Terminal 2: Frontend
npm run dev
```

## 🗄️ Base de Datos

La aplicación creará automáticamente:
- **Base de datos**: `nutrition_app`
- **Tablas**: `patients`, `consultations`, `ingredients`, `recipes`, `documents`
- **Datos iniciales**: Ingredientes básicos para empezar

## 🚀 URLs de Acceso

- **Frontend**: http://localhost:5173 o http://localhost:5174
- **API Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🛠️ Endpoints Disponibles

### Pacientes
- `GET /api/patients` - Obtener todos los pacientes
- `POST /api/patients` - Crear nuevo paciente
- `GET /api/patients/:id` - Obtener paciente específico
- `PUT /api/patients/:id` - Actualizar paciente
- `DELETE /api/patients/:id` - Eliminar paciente

### Ingredientes
- `GET /api/ingredients` - Obtener todos los ingredientes
- `POST /api/ingredients` - Crear nuevo ingrediente
- `GET /api/ingredients?search=query` - Buscar ingredientes
- `PUT /api/ingredients/:id` - Actualizar ingrediente
- `DELETE /api/ingredients/:id` - Eliminar ingrediente

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas del dashboard
- `GET /api/dashboard/recent-patients` - Pacientes recientes

## 🔧 Solución de Problemas

### Error: "ER_ACCESS_DENIED_ERROR"
- Verifica usuario y contraseña en `.env`
- Asegúrate de que MySQL esté ejecutándose

### Error: "ECONNREFUSED"
- MySQL no está ejecutándose
- Inicia MySQL: `brew services start mysql` (macOS) o `systemctl start mysql` (Linux)

### Error: "Database not found"
- La aplicación creará la base de datos automáticamente
- Verifica que el usuario tenga permisos para crear bases de datos

### Puerto 3001 en uso
- Cambia `PORT=3002` en `.env`
- O detén el proceso que usa el puerto 3001

## 💾 Ventajas de MySQL vs localStorage

✅ **Datos compartidos** entre aplicaciones y dispositivos
✅ **Persistencia real** - no se pierden al limpiar cache
✅ **Consultas complejas** y reportes avanzados
✅ **Respaldos** fáciles de la base de datos
✅ **Escalabilidad** para múltiples usuarios
✅ **Integridad de datos** con claves foráneas

## 🔄 Migración desde localStorage

Si tenías datos en localStorage, tendrás que ingresarlos nuevamente o crear un script de migración específico.