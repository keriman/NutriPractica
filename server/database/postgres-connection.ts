import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuración para PostgreSQL en Render
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool for better performance
export const pool = new Pool(dbConfig);

// Initialize database and tables
export async function initializeDatabase() {
  let client;

  try {
    client = await pool.connect();

    console.log('🔗 Connected to PostgreSQL database');

    // Create tables
    await createTables(client);

    console.log('✅ Database initialized successfully');

  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function createTables(client: any) {
  // Enable UUID extension
  await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // Users table
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      nombre VARCHAR(100) NOT NULL,
      apellido VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      telefono VARCHAR(20),
      especialidad VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create index on email for users
  await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');

  // Patients table
  await client.query(`
    CREATE TABLE IF NOT EXISTS patients (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      nombre VARCHAR(100) NOT NULL,
      apellido VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      telefono VARCHAR(20) NOT NULL,
      fecha_nacimiento DATE NOT NULL,
      genero VARCHAR(20) NOT NULL CHECK (genero IN ('masculino', 'femenino', 'otro')),
      altura INTEGER NOT NULL,
      peso DECIMAL(5,2) NOT NULL,
      objetivo_nutricional TEXT NOT NULL,
      alergias JSONB DEFAULT '[]',
      condiciones_medicas JSONB DEFAULT '[]',
      notas_medicas TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, email)
    )
  `);

  // Create indexes for patients
  await client.query('CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at)');

  // Consultations table
  await client.query(`
    CREATE TABLE IF NOT EXISTS consultations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      fecha_consulta DATE NOT NULL,
      peso DECIMAL(5,2) NOT NULL,
      masa_muscular DECIMAL(5,2),
      grasa_corporal DECIMAL(5,2),
      agua_corporal DECIMAL(5,2),
      masa_osea DECIMAL(5,2),
      metabolismo_basal DECIMAL(6,2),
      presion_arterial_sistolica INTEGER,
      presion_arterial_diastolica INTEGER,
      frecuencia_cardiaca INTEGER,
      temperatura DECIMAL(4,2),
      notas_consulta TEXT NOT NULL,
      plan_nutricional TEXT,
      proxima_cita DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for consultations
  await client.query('CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_consultations_fecha ON consultations(fecha_consulta)');

  // Ingredients table
  await client.query(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      nombre VARCHAR(200) NOT NULL,
      calorias_por_100g DECIMAL(6,2) NOT NULL,
      proteinas DECIMAL(5,2) NOT NULL,
      carbohidratos DECIMAL(5,2) NOT NULL,
      grasas DECIMAL(5,2) NOT NULL,
      fibra DECIMAL(5,2) NOT NULL DEFAULT 0,
      categoria VARCHAR(100) NOT NULL,
      is_global BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for ingredients
  await client.query('CREATE INDEX IF NOT EXISTS idx_ingredients_user_id ON ingredients(user_id)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_ingredients_nombre ON ingredients(nombre)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_ingredients_categoria ON ingredients(categoria)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_ingredients_global ON ingredients(is_global)');

  // Recipes table
  await client.query(`
    CREATE TABLE IF NOT EXISTS recipes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      nombre VARCHAR(200) NOT NULL,
      descripcion TEXT NOT NULL,
      ingredientes JSONB NOT NULL,
      instrucciones JSONB NOT NULL,
      calorias_totales DECIMAL(7,2) NOT NULL,
      tiempo_preparacion INTEGER NOT NULL,
      porciones INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for recipes
  await client.query('CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_recipes_nombre ON recipes(nombre)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at)');

  // Documents table
  await client.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
      nombre VARCHAR(255) NOT NULL,
      tipo VARCHAR(100) NOT NULL,
      url TEXT NOT NULL,
      descripcion TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for documents
  await client.query('CREATE INDEX IF NOT EXISTS idx_documents_patient_id ON documents(patient_id)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_documents_consultation_id ON documents(consultation_id)');

  // Insert default ingredients if table is empty
  const result = await client.query('SELECT COUNT(*) as count FROM ingredients');
  const count = parseInt(result.rows[0].count);

  if (count === 0) {
    await insertDefaultIngredients(client);
  }

  // Create updated_at trigger function
  await client.query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Create triggers for updated_at
  const tables = ['users', 'patients', 'consultations'];
  for (const table of tables) {
    await client.query(`
      DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
      CREATE TRIGGER update_${table}_updated_at
        BEFORE UPDATE ON ${table}
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  }
}

async function insertDefaultIngredients(client: any) {
  const defaultIngredients = [
    {
      nombre: 'Pollo (pechuga)',
      calorias_por_100g: 165,
      proteinas: 31,
      carbohidratos: 0,
      grasas: 3.6,
      fibra: 0,
      categoria: 'Proteínas'
    },
    {
      nombre: 'Arroz blanco',
      calorias_por_100g: 130,
      proteinas: 2.7,
      carbohidratos: 28,
      grasas: 0.3,
      fibra: 0.4,
      categoria: 'Carbohidratos'
    },
    {
      nombre: 'Brócoli',
      calorias_por_100g: 34,
      proteinas: 2.8,
      carbohidratos: 7,
      grasas: 0.4,
      fibra: 2.6,
      categoria: 'Verduras'
    },
    {
      nombre: 'Aceite de oliva',
      calorias_por_100g: 884,
      proteinas: 0,
      carbohidratos: 0,
      grasas: 100,
      fibra: 0,
      categoria: 'Grasas'
    },
    {
      nombre: 'Aguacate',
      calorias_por_100g: 160,
      proteinas: 2,
      carbohidratos: 9,
      grasas: 15,
      fibra: 7,
      categoria: 'Grasas'
    },
    {
      nombre: 'Salmón',
      calorias_por_100g: 208,
      proteinas: 25,
      carbohidratos: 0,
      grasas: 12,
      fibra: 0,
      categoria: 'Proteínas'
    },
    {
      nombre: 'Quinoa',
      calorias_por_100g: 120,
      proteinas: 4.4,
      carbohidratos: 22,
      grasas: 1.9,
      fibra: 2.8,
      categoria: 'Cereales'
    },
    {
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
    await client.query(
      `INSERT INTO ingredients (user_id, nombre, calorias_por_100g, proteinas, carbohidratos, grasas, fibra, categoria, is_global)
       VALUES (NULL, $1, $2, $3, $4, $5, $6, $7, TRUE)`,
      [
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