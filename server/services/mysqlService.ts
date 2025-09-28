import { pool } from '../database/connection';
import { Patient, Consultation, Ingredient, Recipe, Document } from '../../src/types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class MySQLService {
  // Patients
  async createPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'> & { user_id: string }): Promise<Patient> {
    const connection = await pool.getConnection();
    const id = crypto.randomUUID();

    try {
      await connection.execute(
        `INSERT INTO patients (id, user_id, nombre, apellido, email, telefono, fecha_nacimiento, genero, altura, peso, objetivo_nutricional, alergias, condiciones_medicas, notas_medicas)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
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
          JSON.stringify(patient.alergias),
          JSON.stringify(patient.condiciones_medicas),
          patient.notas_medicas
        ]
      );

      const createdPatient = await this.getPatient(id);
      if (!createdPatient) {
        throw new Error('Failed to create patient');
      }

      return createdPatient;
    } finally {
      connection.release();
    }
  }

  async getPatient(id: string, userId?: string): Promise<Patient | null> {
    const connection = await pool.getConnection();

    try {
      const query = userId
        ? 'SELECT * FROM patients WHERE id = ? AND user_id = ?'
        : 'SELECT * FROM patients WHERE id = ?';

      const params = userId ? [id, userId] : [id];

      const [rows] = await connection.execute<RowDataPacket[]>(query, params);

      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        id: row.id,
        nombre: row.nombre,
        apellido: row.apellido,
        email: row.email,
        telefono: row.telefono,
        fecha_nacimiento: row.fecha_nacimiento,
        genero: row.genero,
        altura: row.altura,
        peso: row.peso,
        objetivo_nutricional: row.objetivo_nutricional,
        alergias: JSON.parse(row.alergias || '[]'),
        condiciones_medicas: JSON.parse(row.condiciones_medicas || '[]'),
        notas_medicas: row.notas_medicas,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } finally {
      connection.release();
    }
  }

  async getAllPatients(userId?: string): Promise<Patient[]> {
    const connection = await pool.getConnection();

    try {
      const query = userId
        ? 'SELECT * FROM patients WHERE user_id = ? ORDER BY created_at DESC'
        : 'SELECT * FROM patients ORDER BY created_at DESC';

      const params = userId ? [userId] : [];

      const [rows] = await connection.execute<RowDataPacket[]>(query, params);

      return rows.map(row => ({
        id: row.id,
        nombre: row.nombre,
        apellido: row.apellido,
        email: row.email,
        telefono: row.telefono,
        fecha_nacimiento: row.fecha_nacimiento,
        genero: row.genero,
        altura: row.altura,
        peso: row.peso,
        objetivo_nutricional: row.objetivo_nutricional,
        alergias: JSON.parse(row.alergias || '[]'),
        condiciones_medicas: JSON.parse(row.condiciones_medicas || '[]'),
        notas_medicas: row.notas_medicas,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
    } finally {
      connection.release();
    }
  }

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const connection = await pool.getConnection();

    try {
      const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at');
      const setClause = fields.map(field => `${field} = ?`).join(', ');

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      const values = fields.map(field => {
        const value = (updates as any)[field];
        return Array.isArray(value) ? JSON.stringify(value) : value;
      });

      await connection.execute(
        `UPDATE patients SET ${setClause} WHERE id = ?`,
        [...values, id]
      );

      const updatedPatient = await this.getPatient(id);
      if (!updatedPatient) {
        throw new Error('Patient not found after update');
      }

      return updatedPatient;
    } finally {
      connection.release();
    }
  }

  async deletePatient(id: string): Promise<boolean> {
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute<ResultSetHeader>(
        'DELETE FROM patients WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  // Consultations
  async createConsultation(consultation: Omit<Consultation, 'id' | 'created_at' | 'updated_at'>): Promise<Consultation> {
    const connection = await pool.getConnection();
    const id = crypto.randomUUID();

    try {
      await connection.execute(
        `INSERT INTO consultations (id, patient_id, fecha_consulta, peso, masa_muscular, grasa_corporal, agua_corporal, masa_osea, metabolismo_basal, presion_arterial_sistolica, presion_arterial_diastolica, frecuencia_cardiaca, temperatura, notas_consulta, plan_nutricional, proxima_cita)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          consultation.patient_id,
          consultation.fecha_consulta,
          consultation.peso,
          consultation.masa_muscular ?? null,
          consultation.grasa_corporal ?? null,
          consultation.agua_corporal ?? null,
          consultation.masa_osea ?? null,
          consultation.metabolismo_basal ?? null,
          consultation.presion_arterial_sistolica ?? null,
          consultation.presion_arterial_diastolica ?? null,
          consultation.frecuencia_cardiaca ?? null,
          consultation.temperatura ?? null,
          consultation.notas_consulta ?? null,
          consultation.plan_nutricional ?? null,
          consultation.proxima_cita ?? null
        ]
      );

      const createdConsultation = await this.getConsultation(id);
      if (!createdConsultation) {
        throw new Error('Failed to create consultation');
      }

      return createdConsultation;
    } finally {
      connection.release();
    }
  }

  async getConsultation(id: string): Promise<Consultation | null> {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM consultations WHERE id = ?',
        [id]
      );

      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        id: row.id,
        patient_id: row.patient_id,
        fecha_consulta: row.fecha_consulta,
        peso: row.peso,
        masa_muscular: row.masa_muscular,
        grasa_corporal: row.grasa_corporal,
        agua_corporal: row.agua_corporal,
        masa_osea: row.masa_osea,
        metabolismo_basal: row.metabolismo_basal,
        presion_arterial_sistolica: row.presion_arterial_sistolica,
        presion_arterial_diastolica: row.presion_arterial_diastolica,
        frecuencia_cardiaca: row.frecuencia_cardiaca,
        temperatura: row.temperatura,
        notas_consulta: row.notas_consulta,
        plan_nutricional: row.plan_nutricional,
        proxima_cita: row.proxima_cita,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } finally {
      connection.release();
    }
  }

  async getPatientConsultations(patientId: string): Promise<Consultation[]> {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM consultations WHERE patient_id = ? ORDER BY fecha_consulta DESC',
        [patientId]
      );

      return rows.map(row => ({
        id: row.id,
        patient_id: row.patient_id,
        fecha_consulta: row.fecha_consulta,
        peso: row.peso,
        masa_muscular: row.masa_muscular,
        grasa_corporal: row.grasa_corporal,
        agua_corporal: row.agua_corporal,
        masa_osea: row.masa_osea,
        metabolismo_basal: row.metabolismo_basal,
        presion_arterial_sistolica: row.presion_arterial_sistolica,
        presion_arterial_diastolica: row.presion_arterial_diastolica,
        frecuencia_cardiaca: row.frecuencia_cardiaca,
        temperatura: row.temperatura,
        notas_consulta: row.notas_consulta,
        plan_nutricional: row.plan_nutricional,
        proxima_cita: row.proxima_cita,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
    } finally {
      connection.release();
    }
  }

  // Ingredients
  async createIngredient(ingredient: Omit<Ingredient, 'id' | 'created_at'>): Promise<Ingredient> {
    const connection = await pool.getConnection();
    const id = crypto.randomUUID();

    try {
      await connection.execute(
        `INSERT INTO ingredients (id, nombre, calorias_por_100g, proteinas, carbohidratos, grasas, fibra, categoria)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          ingredient.nombre,
          ingredient.calorias_por_100g,
          ingredient.proteinas,
          ingredient.carbohidratos,
          ingredient.grasas,
          ingredient.fibra,
          ingredient.categoria
        ]
      );

      const createdIngredient = await this.getIngredient(id);
      if (!createdIngredient) {
        throw new Error('Failed to create ingredient');
      }

      return createdIngredient;
    } finally {
      connection.release();
    }
  }

  async getIngredient(id: string): Promise<Ingredient | null> {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM ingredients WHERE id = ?',
        [id]
      );

      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        id: row.id,
        nombre: row.nombre,
        calorias_por_100g: row.calorias_por_100g,
        proteinas: row.proteinas,
        carbohidratos: row.carbohidratos,
        grasas: row.grasas,
        fibra: row.fibra,
        categoria: row.categoria,
        created_at: row.created_at
      };
    } finally {
      connection.release();
    }
  }

  async getAllIngredients(): Promise<Ingredient[]> {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM ingredients ORDER BY nombre'
      );

      return rows.map(row => ({
        id: row.id,
        nombre: row.nombre,
        calorias_por_100g: row.calorias_por_100g,
        proteinas: row.proteinas,
        carbohidratos: row.carbohidratos,
        grasas: row.grasas,
        fibra: row.fibra,
        categoria: row.categoria,
        created_at: row.created_at
      }));
    } finally {
      connection.release();
    }
  }

  async updateIngredient(id: string, updates: Partial<Ingredient>): Promise<Ingredient> {
    const connection = await pool.getConnection();

    try {
      const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at');
      const setClause = fields.map(field => `${field} = ?`).join(', ');

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      const values = fields.map(field => (updates as any)[field]);

      await connection.execute(
        `UPDATE ingredients SET ${setClause} WHERE id = ?`,
        [...values, id]
      );

      const updatedIngredient = await this.getIngredient(id);
      if (!updatedIngredient) {
        throw new Error('Ingredient not found after update');
      }

      return updatedIngredient;
    } finally {
      connection.release();
    }
  }

  async deleteIngredient(id: string): Promise<boolean> {
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute<ResultSetHeader>(
        'DELETE FROM ingredients WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async searchIngredients(query: string): Promise<Ingredient[]> {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM ingredients WHERE nombre LIKE ? ORDER BY nombre',
        [`%${query}%`]
      );

      return rows.map(row => ({
        id: row.id,
        nombre: row.nombre,
        calorias_por_100g: row.calorias_por_100g,
        proteinas: row.proteinas,
        carbohidratos: row.carbohidratos,
        grasas: row.grasas,
        fibra: row.fibra,
        categoria: row.categoria,
        created_at: row.created_at
      }));
    } finally {
      connection.release();
    }
  }

  // Recipes
  async createRecipe(recipe: Omit<Recipe, 'id' | 'created_at'> & { user_id: string }): Promise<Recipe> {
    const connection = await pool.getConnection();
    const id = crypto.randomUUID();

    try {
      await connection.execute(
        `INSERT INTO recipes (id, user_id, nombre, descripcion, ingredientes, instrucciones, calorias_totales, tiempo_preparacion, porciones)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
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

      const createdRecipe = await this.getRecipe(id);
      if (!createdRecipe) {
        throw new Error('Failed to create recipe');
      }

      return createdRecipe;
    } finally {
      connection.release();
    }
  }

  async getRecipe(id: string): Promise<Recipe | null> {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM recipes WHERE id = ?',
        [id]
      );

      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        id: row.id,
        nombre: row.nombre,
        descripcion: row.descripcion,
        ingredientes: JSON.parse(row.ingredientes),
        instrucciones: JSON.parse(row.instrucciones),
        calorias_totales: row.calorias_totales,
        tiempo_preparacion: row.tiempo_preparacion,
        porciones: row.porciones,
        created_at: row.created_at
      };
    } finally {
      connection.release();
    }
  }

  async getAllRecipes(): Promise<Recipe[]> {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM recipes ORDER BY created_at DESC'
      );

      return rows.map(row => ({
        id: row.id,
        nombre: row.nombre,
        descripcion: row.descripcion,
        ingredientes: JSON.parse(row.ingredientes),
        instrucciones: JSON.parse(row.instrucciones),
        calorias_totales: row.calorias_totales,
        tiempo_preparacion: row.tiempo_preparacion,
        porciones: row.porciones,
        created_at: row.created_at
      }));
    } finally {
      connection.release();
    }
  }

  // Documents
  async createDocument(document: Omit<Document, 'id' | 'created_at'>): Promise<Document> {
    const connection = await pool.getConnection();
    const id = crypto.randomUUID();

    try {
      await connection.execute(
        `INSERT INTO documents (id, patient_id, consultation_id, nombre, tipo, url, descripcion)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          document.patient_id,
          document.consultation_id,
          document.nombre,
          document.tipo,
          document.url,
          document.descripcion
        ]
      );

      const createdDocument = await this.getDocument(id);
      if (!createdDocument) {
        throw new Error('Failed to create document');
      }

      return createdDocument;
    } finally {
      connection.release();
    }
  }

  async getDocument(id: string): Promise<Document | null> {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM documents WHERE id = ?',
        [id]
      );

      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        id: row.id,
        patient_id: row.patient_id,
        consultation_id: row.consultation_id,
        nombre: row.nombre,
        tipo: row.tipo,
        url: row.url,
        descripcion: row.descripcion,
        created_at: row.created_at
      };
    } finally {
      connection.release();
    }
  }

  async getPatientDocuments(patientId: string): Promise<Document[]> {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM documents WHERE patient_id = ? ORDER BY created_at DESC',
        [patientId]
      );

      return rows.map(row => ({
        id: row.id,
        patient_id: row.patient_id,
        consultation_id: row.consultation_id,
        nombre: row.nombre,
        tipo: row.tipo,
        url: row.url,
        descripcion: row.descripcion,
        created_at: row.created_at
      }));
    } finally {
      connection.release();
    }
  }

  async deleteDocument(id: string): Promise<boolean> {
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute<ResultSetHeader>(
        'DELETE FROM documents WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  // Dashboard stats
  async getDashboardStats(userId?: string) {
    const connection = await pool.getConnection();

    try {
      // Count patients for this user
      const patientQuery = userId
        ? 'SELECT COUNT(*) as count FROM patients WHERE user_id = ?'
        : 'SELECT COUNT(*) as count FROM patients';
      const patientParams = userId ? [userId] : [];
      const [patientsResult] = await connection.execute<RowDataPacket[]>(patientQuery, patientParams);

      // Count documents for this user's patients
      const documentQuery = userId
        ? 'SELECT COUNT(*) as count FROM documents d JOIN patients p ON d.patient_id = p.id WHERE p.user_id = ?'
        : 'SELECT COUNT(*) as count FROM documents';
      const documentParams = userId ? [userId] : [];
      const [documentsResult] = await connection.execute<RowDataPacket[]>(documentQuery, documentParams);

      // Count recipes for this user
      const recipeQuery = userId
        ? 'SELECT COUNT(*) as count FROM recipes WHERE user_id = ?'
        : 'SELECT COUNT(*) as count FROM recipes';
      const recipeParams = userId ? [userId] : [];
      const [recipesResult] = await connection.execute<RowDataPacket[]>(recipeQuery, recipeParams);

      // Count consultations this month for this user's patients
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const consultationQuery = userId
        ? 'SELECT COUNT(*) as count FROM consultations c JOIN patients p ON c.patient_id = p.id WHERE p.user_id = ? AND c.fecha_consulta LIKE ?'
        : 'SELECT COUNT(*) as count FROM consultations WHERE fecha_consulta LIKE ?';
      const consultationParams = userId ? [userId, `${currentMonth}%`] : [`${currentMonth}%`];
      const [consultationsResult] = await connection.execute<RowDataPacket[]>(consultationQuery, consultationParams);

      return {
        patients: patientsResult[0].count,
        documents: documentsResult[0].count,
        recipes: recipesResult[0].count,
        consultationsThisMonth: consultationsResult[0].count
      };
    } finally {
      connection.release();
    }
  }

  async getRecentPatients(limit: number = 5, userId?: string): Promise<Patient[]> {
    const connection = await pool.getConnection();

    try {
      const query = userId
        ? 'SELECT * FROM patients WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
        : 'SELECT * FROM patients ORDER BY created_at DESC LIMIT ?';
      const params = userId ? [userId, limit] : [limit];

      const [rows] = await connection.execute<RowDataPacket[]>(query, params);

      return rows.map(row => ({
        id: row.id,
        nombre: row.nombre,
        apellido: row.apellido,
        email: row.email,
        telefono: row.telefono,
        fecha_nacimiento: row.fecha_nacimiento,
        genero: row.genero,
        altura: row.altura,
        peso: row.peso,
        objetivo_nutricional: row.objetivo_nutricional,
        alergias: JSON.parse(row.alergias || '[]'),
        condiciones_medicas: JSON.parse(row.condiciones_medicas || '[]'),
        notas_medicas: row.notas_medicas,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
    } finally {
      connection.release();
    }
  }

  async getRecentActivity(limit: number = 10, userId?: string): Promise<any[]> {
    const connection = await pool.getConnection();
    try {
      const activities: any[] = [];

      // Get recent patients for this user
      try {
        const patientQuery = userId
          ? `SELECT 'patient' as type, 'create' as action,
                    CONCAT(nombre, ' ', apellido) as title,
                    'Nuevo paciente registrado' as description,
                    created_at as timestamp
             FROM patients
             WHERE user_id = ?
             ORDER BY created_at DESC LIMIT ?`
          : `SELECT 'patient' as type, 'create' as action,
                    CONCAT(nombre, ' ', apellido) as title,
                    'Nuevo paciente registrado' as description,
                    created_at as timestamp
             FROM patients
             ORDER BY created_at DESC LIMIT ?`;

        const patientParams = userId ? [userId, limit] : [limit];
        const [patientRows] = await connection.execute<RowDataPacket[]>(patientQuery, patientParams);

        activities.push(...patientRows.map(row => ({
          type: row.type,
          action: row.action,
          title: row.title,
          description: row.description,
          timestamp: row.timestamp
        })));
      } catch (error) {
        console.error('Error fetching patients for activity:', error);
      }

      // Get recent consultations for this user's patients
      try {
        const consultationQuery = userId
          ? `SELECT 'consultation' as type, 'create' as action,
                    CONCAT('Consulta - ', p.nombre, ' ', p.apellido) as title,
                    COALESCE(c.notas_consulta, 'Consulta médica') as description,
                    c.fecha_consulta as timestamp
             FROM consultations c
             JOIN patients p ON c.patient_id = p.id
             WHERE p.user_id = ?
             ORDER BY c.fecha_consulta DESC LIMIT ?`
          : `SELECT 'consultation' as type, 'create' as action,
                    CONCAT('Consulta - ', p.nombre, ' ', p.apellido) as title,
                    COALESCE(c.notas_consulta, 'Consulta médica') as description,
                    c.fecha_consulta as timestamp
             FROM consultations c
             JOIN patients p ON c.patient_id = p.id
             ORDER BY c.fecha_consulta DESC LIMIT ?`;

        const consultationParams = userId ? [userId, limit] : [limit];
        const [consultationRows] = await connection.execute<RowDataPacket[]>(consultationQuery, consultationParams);

        activities.push(...consultationRows.map(row => ({
          type: row.type,
          action: row.action,
          title: row.title,
          description: row.description,
          timestamp: row.timestamp
        })));
      } catch (error) {
        console.error('Error fetching consultations for activity:', error);
      }

      // Get recent recipes for this user
      try {
        const recipeQuery = userId
          ? `SELECT 'recipe' as type, 'create' as action,
                    nombre as title,
                    'Nueva receta creada' as description,
                    created_at as timestamp
             FROM recipes
             WHERE user_id = ?
             ORDER BY created_at DESC LIMIT ?`
          : `SELECT 'recipe' as type, 'create' as action,
                    nombre as title,
                    'Nueva receta creada' as description,
                    created_at as timestamp
             FROM recipes
             ORDER BY created_at DESC LIMIT ?`;

        const recipeParams = userId ? [userId, limit] : [limit];
        const [recipeRows] = await connection.execute<RowDataPacket[]>(recipeQuery, recipeParams);

        activities.push(...recipeRows.map(row => ({
          type: row.type,
          action: row.action,
          title: row.title,
          description: row.description,
          timestamp: row.timestamp
        })));
      } catch (error) {
        console.error('Error fetching recipes for activity:', error);
      }

      // Sort by timestamp and limit results
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } finally {
      connection.release();
    }
  }

  async getMonthlyStats(months: number = 6, userId?: string): Promise<any[]> {
    const connection = await pool.getConnection();
    try {
      let query: string;
      let queryParams: any[];

      if (userId) {
        query = `
          SELECT
            DATE_FORMAT(month_date, '%Y-%m') as month,
            COALESCE(patients, 0) as patients,
            COALESCE(consultations, 0) as consultations,
            COALESCE(recipes, 0) as recipes
          FROM (
            SELECT DATE_FORMAT(CURDATE() - INTERVAL n.number MONTH, '%Y-%m-01') as month_date
            FROM (
              SELECT 0 as number UNION SELECT 1 UNION SELECT 2 UNION SELECT 3
              UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7
              UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11
            ) n
            WHERE n.number < ?
          ) months
          LEFT JOIN (
            SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as patients
            FROM patients
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH) AND user_id = ?
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
          ) p ON months.month_date = STR_TO_DATE(CONCAT(p.month, '-01'), '%Y-%m-%d')
          LEFT JOIN (
            SELECT DATE_FORMAT(c.fecha_consulta, '%Y-%m') as month, COUNT(*) as consultations
            FROM consultations c
            JOIN patients pt ON c.patient_id = pt.id
            WHERE c.fecha_consulta >= DATE_SUB(CURDATE(), INTERVAL ? MONTH) AND pt.user_id = ?
            GROUP BY DATE_FORMAT(c.fecha_consulta, '%Y-%m')
          ) c ON months.month_date = STR_TO_DATE(CONCAT(c.month, '-01'), '%Y-%m-%d')
          LEFT JOIN (
            SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as recipes
            FROM recipes
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH) AND user_id = ?
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
          ) r ON months.month_date = STR_TO_DATE(CONCAT(r.month, '-01'), '%Y-%m-%d')
          ORDER BY months.month_date ASC
        `;
        queryParams = [months, months, userId, months, userId, months, userId];
      } else {
        query = `
          SELECT
            DATE_FORMAT(month_date, '%Y-%m') as month,
            COALESCE(patients, 0) as patients,
            COALESCE(consultations, 0) as consultations,
            COALESCE(recipes, 0) as recipes
          FROM (
            SELECT DATE_FORMAT(CURDATE() - INTERVAL n.number MONTH, '%Y-%m-01') as month_date
            FROM (
              SELECT 0 as number UNION SELECT 1 UNION SELECT 2 UNION SELECT 3
              UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7
              UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11
            ) n
            WHERE n.number < ?
          ) months
          LEFT JOIN (
            SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as patients
            FROM patients
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
          ) p ON months.month_date = STR_TO_DATE(CONCAT(p.month, '-01'), '%Y-%m-%d')
          LEFT JOIN (
            SELECT DATE_FORMAT(fecha_consulta, '%Y-%m') as month, COUNT(*) as consultations
            FROM consultations
            WHERE fecha_consulta >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
            GROUP BY DATE_FORMAT(fecha_consulta, '%Y-%m')
          ) c ON months.month_date = STR_TO_DATE(CONCAT(c.month, '-01'), '%Y-%m-%d')
          LEFT JOIN (
            SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as recipes
            FROM recipes
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
          ) r ON months.month_date = STR_TO_DATE(CONCAT(r.month, '-01'), '%Y-%m-%d')
          ORDER BY months.month_date ASC
        `;
        queryParams = [months, months, months, months];
      }

      const [rows] = await connection.execute<RowDataPacket[]>(query, queryParams);

      return rows.map(row => ({
        month: row.month,
        patients: row.patients,
        consultations: row.consultations,
        recipes: row.recipes
      }));
    } finally {
      connection.release();
    }
  }
}

export const mysqlService = new MySQLService();