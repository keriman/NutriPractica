import { pool } from '../database/postgres-connection';
import { Patient, Consultation, Ingredient, Recipe, Document } from '../../src/types';

export class PostgresService {
  // Users
  async createUser(userData: {
    nombre: string;
    apellido: string;
    email: string;
    password_hash: string;
    telefono?: string;
    especialidad?: string;
  }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO users (nombre, apellido, email, password_hash, telefono, especialidad)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userData.nombre, userData.apellido, userData.email, userData.password_hash, userData.telefono, userData.especialidad]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getUserByEmail(email: string) {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async getUserById(id: string) {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async updateUser(id: string, updates: Partial<any>) {
    const client = await pool.connect();
    try {
      const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
      const values = [id, ...Object.values(updates)];

      const result = await client.query(
        `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        values
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Patients
  async createPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO patients (user_id, nombre, apellido, email, telefono, fecha_nacimiento, genero, altura, peso, objetivo_nutricional, alergias, condiciones_medicas, notas_medicas)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          patient.user_id,
          patient.nombre,
          patient.apellido,
          patient.email,
          patient.telefono,
          patient.fecha_nacimiento,
          patient.genero,
          patient.altura,
          patient.peso,
          patient.objetivo_nutricional,
          JSON.stringify(patient.alergias || []),
          JSON.stringify(patient.condiciones_medicas || []),
          patient.notas_medicas
        ]
      );

      const row = result.rows[0];
      return {
        ...row,
        alergias: typeof row.alergias === 'string' ? JSON.parse(row.alergias) : row.alergias,
        condiciones_medicas: typeof row.condiciones_medicas === 'string' ? JSON.parse(row.condiciones_medicas) : row.condiciones_medicas
      };
    } finally {
      client.release();
    }
  }

  async getPatientById(id: string) {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM patients WHERE id = $1', [id]);
      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        ...row,
        alergias: typeof row.alergias === 'string' ? JSON.parse(row.alergias) : row.alergias,
        condiciones_medicas: typeof row.condiciones_medicas === 'string' ? JSON.parse(row.condiciones_medicas) : row.condiciones_medicas
      };
    } finally {
      client.release();
    }
  }

  async getPatientsByUserId(userId: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM patients WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );

      return result.rows.map(row => ({
        ...row,
        alergias: typeof row.alergias === 'string' ? JSON.parse(row.alergias) : row.alergias,
        condiciones_medicas: typeof row.condiciones_medicas === 'string' ? JSON.parse(row.condiciones_medicas) : row.condiciones_medicas
      }));
    } finally {
      client.release();
    }
  }

  async updatePatient(id: string, updates: Partial<Patient>) {
    const client = await pool.connect();
    try {
      const processedUpdates = { ...updates };
      if (processedUpdates.alergias) {
        processedUpdates.alergias = JSON.stringify(processedUpdates.alergias);
      }
      if (processedUpdates.condiciones_medicas) {
        processedUpdates.condiciones_medicas = JSON.stringify(processedUpdates.condiciones_medicas);
      }

      const setClause = Object.keys(processedUpdates).map((key, index) => `${key} = $${index + 2}`).join(', ');
      const values = [id, ...Object.values(processedUpdates)];

      const result = await client.query(
        `UPDATE patients SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        values
      );

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        ...row,
        alergias: typeof row.alergias === 'string' ? JSON.parse(row.alergias) : row.alergias,
        condiciones_medicas: typeof row.condiciones_medicas === 'string' ? JSON.parse(row.condiciones_medicas) : row.condiciones_medicas
      };
    } finally {
      client.release();
    }
  }

  async deletePatient(id: string) {
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM patients WHERE id = $1 RETURNING id', [id]);
      return result.rows.length > 0;
    } finally {
      client.release();
    }
  }

  // Consultations
  async createConsultation(consultation: Omit<Consultation, 'id' | 'created_at' | 'updated_at'>) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO consultations (patient_id, fecha_consulta, peso, masa_muscular, grasa_corporal, agua_corporal, masa_osea, metabolismo_basal, presion_arterial_sistolica, presion_arterial_diastolica, frecuencia_cardiaca, temperatura, notas_consulta, plan_nutricional, proxima_cita)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         RETURNING *`,
        [
          consultation.patient_id,
          consultation.fecha_consulta,
          consultation.peso,
          consultation.masa_muscular,
          consultation.grasa_corporal,
          consultation.agua_corporal,
          consultation.masa_osea,
          consultation.metabolismo_basal,
          consultation.presion_arterial_sistolica,
          consultation.presion_arterial_diastolica,
          consultation.frecuencia_cardiaca,
          consultation.temperatura,
          consultation.notas_consulta,
          consultation.plan_nutricional,
          consultation.proxima_cita
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getConsultationsByPatientId(patientId: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM consultations WHERE patient_id = $1 ORDER BY fecha_consulta DESC',
        [patientId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getConsultationById(id: string) {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM consultations WHERE id = $1', [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // Ingredients
  async createIngredient(ingredient: Omit<Ingredient, 'id' | 'created_at'>) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO ingredients (user_id, nombre, calorias_por_100g, proteinas, carbohidratos, grasas, fibra, categoria, is_global)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          ingredient.user_id,
          ingredient.nombre,
          ingredient.calorias_por_100g,
          ingredient.proteinas,
          ingredient.carbohidratos,
          ingredient.grasas,
          ingredient.fibra,
          ingredient.categoria,
          ingredient.is_global || false
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getIngredientsByUserId(userId: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM ingredients WHERE user_id = $1 OR is_global = TRUE ORDER BY nombre',
        [userId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getIngredientById(id: string) {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM ingredients WHERE id = $1', [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async searchIngredients(userId: string, query: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM ingredients WHERE (user_id = $1 OR is_global = TRUE) AND nombre ILIKE $2 ORDER BY nombre',
        [userId, `%${query}%`]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Recipes
  async createRecipe(recipe: Omit<Recipe, 'id' | 'created_at'>) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO recipes (user_id, nombre, descripcion, ingredientes, instrucciones, calorias_totales, tiempo_preparacion, porciones)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          recipe.user_id,
          recipe.nombre,
          recipe.descripcion,
          JSON.stringify(recipe.ingredientes),
          JSON.stringify(recipe.instrucciones),
          recipe.calorias_totales,
          recipe.tiempo_preparacion,
          recipe.porciones
        ]
      );

      const row = result.rows[0];
      return {
        ...row,
        ingredientes: typeof row.ingredientes === 'string' ? JSON.parse(row.ingredientes) : row.ingredientes,
        instrucciones: typeof row.instrucciones === 'string' ? JSON.parse(row.instrucciones) : row.instrucciones
      };
    } finally {
      client.release();
    }
  }

  async getRecipesByUserId(userId: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM recipes WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );

      return result.rows.map(row => ({
        ...row,
        ingredientes: typeof row.ingredientes === 'string' ? JSON.parse(row.ingredientes) : row.ingredientes,
        instrucciones: typeof row.instrucciones === 'string' ? JSON.parse(row.instrucciones) : row.instrucciones
      }));
    } finally {
      client.release();
    }
  }

  // Documents
  async getPatientDocuments(patientId: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM documents WHERE patient_id = $1 ORDER BY created_at DESC',
        [patientId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async createDocument(document: Omit<Document, 'id' | 'created_at'>) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO documents (patient_id, consultation_id, nombre, tipo, url, descripcion)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          document.patient_id,
          document.consultation_id,
          document.nombre,
          document.tipo,
          document.url,
          document.descripcion
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteDocument(id: string) {
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM documents WHERE id = $1 RETURNING id', [id]);
      return result.rows.length > 0;
    } finally {
      client.release();
    }
  }

  // Dashboard stats
  async getDashboardStats(userId: string) {
    const client = await pool.connect();
    try {
      const [patientsResult, consultationsResult, recipesResult] = await Promise.all([
        client.query('SELECT COUNT(*) as count FROM patients WHERE user_id = $1', [userId]),
        client.query('SELECT COUNT(*) as count FROM consultations c JOIN patients p ON c.patient_id = p.id WHERE p.user_id = $1', [userId]),
        client.query('SELECT COUNT(*) as count FROM recipes WHERE user_id = $1', [userId])
      ]);

      return {
        total_patients: parseInt(patientsResult.rows[0].count),
        total_consultations: parseInt(consultationsResult.rows[0].count),
        total_recipes: parseInt(recipesResult.rows[0].count),
        total_ingredients: 0 // Will be calculated separately if needed
      };
    } finally {
      client.release();
    }
  }

  async getRecentPatients(userId: string, limit: number = 5) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM patients WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
        [userId, limit]
      );

      return result.rows.map(row => ({
        ...row,
        alergias: typeof row.alergias === 'string' ? JSON.parse(row.alergias) : row.alergias,
        condiciones_medicas: typeof row.condiciones_medicas === 'string' ? JSON.parse(row.condiciones_medicas) : row.condiciones_medicas
      }));
    } finally {
      client.release();
    }
  }
}

export const postgresService = new PostgresService();