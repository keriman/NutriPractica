import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nutrition_app',
  charset: 'utf8mb4',
  timezone: '+00:00'
};

// Create connection pool for better performance
export const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database and tables
export async function initializeDatabase() {
  let connection;

  try {
    // Connect without database to create it if it doesn't exist
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      charset: dbConfig.charset
    });

    // Create database if it doesn't exist
    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await tempConnection.end();

    // Now connect to the created database
    connection = await pool.getConnection();

    // Create tables
    await createTables(connection);

    console.log('✅ Database initialized successfully');

  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function createTables(connection: mysql.PoolConnection) {
  // Users table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      apellido VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      telefono VARCHAR(20),
      especialidad VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Patients table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS patients (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      nombre VARCHAR(100) NOT NULL,
      apellido VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      telefono VARCHAR(20) NOT NULL,
      fecha_nacimiento DATE NOT NULL,
      genero ENUM('masculino', 'femenino', 'otro') NOT NULL,
      altura INT NOT NULL,
      peso DECIMAL(5,2) NOT NULL,
      objetivo_nutricional TEXT NOT NULL,
      alergias JSON,
      condiciones_medicas JSON,
      notas_medicas TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_email (email),
      INDEX idx_created_at (created_at),
      UNIQUE KEY unique_user_email (user_id, email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Consultations table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS consultations (
      id VARCHAR(36) PRIMARY KEY,
      patient_id VARCHAR(36) NOT NULL,
      fecha_consulta DATE NOT NULL,
      peso DECIMAL(5,2) NOT NULL,
      masa_muscular DECIMAL(5,2),
      grasa_corporal DECIMAL(5,2),
      agua_corporal DECIMAL(5,2),
      masa_osea DECIMAL(5,2),
      metabolismo_basal DECIMAL(6,2),
      presion_arterial_sistolica INT,
      presion_arterial_diastolica INT,
      frecuencia_cardiaca INT,
      temperatura DECIMAL(4,2),
      notas_consulta TEXT NOT NULL,
      plan_nutricional TEXT,
      proxima_cita DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
      INDEX idx_patient_id (patient_id),
      INDEX idx_fecha_consulta (fecha_consulta)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Ingredients table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36),
      nombre VARCHAR(200) NOT NULL,
      calorias_por_100g DECIMAL(6,2) NOT NULL,
      proteinas DECIMAL(5,2) NOT NULL,
      carbohidratos DECIMAL(5,2) NOT NULL,
      grasas DECIMAL(5,2) NOT NULL,
      fibra DECIMAL(5,2) NOT NULL DEFAULT 0,
      categoria VARCHAR(100) NOT NULL,
      is_global BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_nombre (nombre),
      INDEX idx_categoria (categoria),
      INDEX idx_global (is_global)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Recipes table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS recipes (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      nombre VARCHAR(200) NOT NULL,
      descripcion TEXT NOT NULL,
      ingredientes JSON NOT NULL,
      instrucciones JSON NOT NULL,
      calorias_totales DECIMAL(7,2) NOT NULL,
      tiempo_preparacion INT NOT NULL,
      porciones INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_nombre (nombre),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Documents table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS documents (
      id VARCHAR(36) PRIMARY KEY,
      patient_id VARCHAR(36) NOT NULL,
      consultation_id VARCHAR(36),
      nombre VARCHAR(255) NOT NULL,
      tipo VARCHAR(100) NOT NULL,
      url TEXT NOT NULL,
      descripcion TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
      FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE SET NULL,
      INDEX idx_patient_id (patient_id),
      INDEX idx_consultation_id (consultation_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Insert default ingredients if table is empty
  const [rows] = await connection.execute('SELECT COUNT(*) as count FROM ingredients');
  const count = (rows as any)[0].count;

  if (count === 0) {
    await insertDefaultIngredients(connection);
  }
}

async function insertDefaultIngredients(connection: mysql.PoolConnection) {
  const defaultIngredients = [
    {
      id: crypto.randomUUID(),
      nombre: 'Pollo (pechuga)',
      calorias_por_100g: 165,
      proteinas: 31,
      carbohidratos: 0,
      grasas: 3.6,
      fibra: 0,
      categoria: 'Proteínas'
    },
    {
      id: crypto.randomUUID(),
      nombre: 'Arroz blanco',
      calorias_por_100g: 130,
      proteinas: 2.7,
      carbohidratos: 28,
      grasas: 0.3,
      fibra: 0.4,
      categoria: 'Carbohidratos'
    },
    {
      id: crypto.randomUUID(),
      nombre: 'Brócoli',
      calorias_por_100g: 34,
      proteinas: 2.8,
      carbohidratos: 7,
      grasas: 0.4,
      fibra: 2.6,
      categoria: 'Verduras'
    },
    {
      id: crypto.randomUUID(),
      nombre: 'Aceite de oliva',
      calorias_por_100g: 884,
      proteinas: 0,
      carbohidratos: 0,
      grasas: 100,
      fibra: 0,
      categoria: 'Grasas'
    },
    {
      id: crypto.randomUUID(),
      nombre: 'Aguacate',
      calorias_por_100g: 160,
      proteinas: 2,
      carbohidratos: 9,
      grasas: 15,
      fibra: 7,
      categoria: 'Grasas'
    },
    {
      id: crypto.randomUUID(),
      nombre: 'Salmón',
      calorias_por_100g: 208,
      proteinas: 25,
      carbohidratos: 0,
      grasas: 12,
      fibra: 0,
      categoria: 'Proteínas'
    },
    {
      id: crypto.randomUUID(),
      nombre: 'Quinoa',
      calorias_por_100g: 120,
      proteinas: 4.4,
      carbohidratos: 22,
      grasas: 1.9,
      fibra: 2.8,
      categoria: 'Cereales'
    },
    {
      id: crypto.randomUUID(),
      nombre: 'Espinacas',
      calorias_por_100g: 23,
      proteinas: 2.9,
      carbohidratos: 3.6,
      grasas: 0.4,
      fibra: 2.2,
      categoria: 'Verduras'
    }
  ];

  for (const ingredient of defaultIngredients) {
    await connection.execute(
      `INSERT INTO ingredients (id, user_id, nombre, calorias_por_100g, proteinas, carbohidratos, grasas, fibra, categoria, is_global)
       VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        ingredient.id,
        ingredient.nombre,
        ingredient.calorias_por_100g,
        ingredient.proteinas,
        ingredient.carbohidratos,
        ingredient.grasas,
        ingredient.fibra,
        ingredient.categoria
      ]
    );
  }

  console.log('✅ Default ingredients inserted');
}

export default pool;