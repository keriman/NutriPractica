import { Patient, Consultation, Ingredient, Recipe, Document } from '../types';

// Fallback implementation using localStorage for browsers that don't support better-sqlite3
class LocalStorageService {
  private getKey(entity: string): string {
    return `nutrition_app_${entity}`;
  }

  private getData<T>(entity: string): T[] {
    try {
      const data = localStorage.getItem(this.getKey(entity));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setData<T>(entity: string, data: T[]): void {
    try {
      localStorage.setItem(this.getKey(entity), JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  // Pacientes
  createPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Patient {
    const patients = this.getData<Patient>('patients');
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newPatient: Patient = {
      ...patient,
      id,
      created_at: now,
      updated_at: now,
    };

    patients.push(newPatient);
    this.setData('patients', patients);
    return newPatient;
  }

  getPatient(id: string): Patient | null {
    const patients = this.getData<Patient>('patients');
    return patients.find(p => p.id === id) || null;
  }

  getAllPatients(): Patient[] {
    return this.getData<Patient>('patients').sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  updatePatient(id: string, updates: Partial<Patient>): Patient {
    const patients = this.getData<Patient>('patients');
    const index = patients.findIndex(p => p.id === id);

    if (index !== -1) {
      patients[index] = {
        ...patients[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      this.setData('patients', patients);
      return patients[index];
    }

    throw new Error('Patient not found');
  }

  deletePatient(id: string): boolean {
    const patients = this.getData<Patient>('patients');
    const filteredPatients = patients.filter(p => p.id !== id);

    if (filteredPatients.length !== patients.length) {
      this.setData('patients', filteredPatients);
      return true;
    }

    return false;
  }

  // Consultas
  createConsultation(consultation: Omit<Consultation, 'id' | 'created_at' | 'updated_at'>): Consultation {
    const consultations = this.getData<Consultation>('consultations');
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newConsultation: Consultation = {
      ...consultation,
      id,
      created_at: now,
      updated_at: now,
    };

    consultations.push(newConsultation);
    this.setData('consultations', consultations);
    return newConsultation;
  }

  getConsultation(id: string): Consultation | null {
    const consultations = this.getData<Consultation>('consultations');
    return consultations.find(c => c.id === id) || null;
  }

  getPatientConsultations(patientId: string): Consultation[] {
    return this.getData<Consultation>('consultations')
      .filter(c => c.patient_id === patientId)
      .sort((a, b) => new Date(b.fecha_consulta).getTime() - new Date(a.fecha_consulta).getTime());
  }

  // Ingredientes
  createIngredient(ingredient: Omit<Ingredient, 'id' | 'created_at'>): Ingredient {
    const ingredients = this.getData<Ingredient>('ingredients');
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newIngredient: Ingredient = {
      ...ingredient,
      id,
      created_at: now,
    };

    ingredients.push(newIngredient);
    this.setData('ingredients', ingredients);
    return newIngredient;
  }

  getIngredient(id: string): Ingredient | null {
    const ingredients = this.getData<Ingredient>('ingredients');
    return ingredients.find(i => i.id === id) || null;
  }

  getAllIngredients(): Ingredient[] {
    return this.getData<Ingredient>('ingredients').sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  updateIngredient(id: string, updates: Partial<Ingredient>): Ingredient {
    const ingredients = this.getData<Ingredient>('ingredients');
    const index = ingredients.findIndex(i => i.id === id);

    if (index !== -1) {
      ingredients[index] = { ...ingredients[index], ...updates };
      this.setData('ingredients', ingredients);
      return ingredients[index];
    }

    throw new Error('Ingredient not found');
  }

  deleteIngredient(id: string): boolean {
    const ingredients = this.getData<Ingredient>('ingredients');
    const filteredIngredients = ingredients.filter(i => i.id !== id);

    if (filteredIngredients.length !== ingredients.length) {
      this.setData('ingredients', filteredIngredients);
      return true;
    }

    return false;
  }

  searchIngredients(query: string): Ingredient[] {
    return this.getAllIngredients().filter(ingredient =>
      ingredient.nombre.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Recetas
  createRecipe(recipe: Omit<Recipe, 'id' | 'created_at'>): Recipe {
    const recipes = this.getData<Recipe>('recipes');
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newRecipe: Recipe = {
      ...recipe,
      id,
      created_at: now,
    };

    recipes.push(newRecipe);
    this.setData('recipes', recipes);
    return newRecipe;
  }

  getRecipe(id: string): Recipe | null {
    const recipes = this.getData<Recipe>('recipes');
    return recipes.find(r => r.id === id) || null;
  }

  getAllRecipes(): Recipe[] {
    return this.getData<Recipe>('recipes').sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // Documentos
  createDocument(document: Omit<Document, 'id' | 'created_at'>): Document {
    const documents = this.getData<Document>('documents');
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newDocument: Document = {
      ...document,
      id,
      created_at: now,
    };

    documents.push(newDocument);
    this.setData('documents', documents);
    return newDocument;
  }

  getDocument(id: string): Document | null {
    const documents = this.getData<Document>('documents');
    return documents.find(d => d.id === id) || null;
  }

  getPatientDocuments(patientId: string): Document[] {
    return this.getData<Document>('documents')
      .filter(d => d.patient_id === patientId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Estadísticas del dashboard
  getDashboardStats() {
    const patients = this.getData<Patient>('patients');
    const documents = this.getData<Document>('documents');
    const recipes = this.getData<Recipe>('recipes');
    const consultations = this.getData<Consultation>('consultations');

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const consultationsThisMonth = consultations.filter(c =>
      c.fecha_consulta.startsWith(currentMonth)
    );

    return {
      patients: patients.length,
      documents: documents.length,
      recipes: recipes.length,
      consultationsThisMonth: consultationsThisMonth.length,
    };
  }

  // Pacientes recientes
  getRecentPatients(limit: number = 5): Patient[] {
    return this.getAllPatients().slice(0, limit);
  }
}

export default LocalStorageService;