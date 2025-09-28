import { Patient, Consultation, Ingredient, Recipe, Document, ActivityFeed, MonthlyStats, DashboardStats } from '../types';

const API_BASE_URL = 'https://nutripractica-be.onrender.com/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Get token from localStorage
    const token = localStorage.getItem('auth_token');

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    };

    const config = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // If we can't parse error JSON, use the default message
        }

        throw new Error(errorMessage);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please make sure the backend is running.');
      }
      throw error;
    }
  }

  // Patients
  async createPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> {
    return this.request<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    });
  }

  async getPatient(id: string): Promise<Patient | null> {
    try {
      return await this.request<Patient>(`/patients/${id}`);
    } catch (error) {
      if ((error as Error).message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async getAllPatients(): Promise<Patient[]> {
    return this.request<Patient[]>('/patients');
  }

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    return this.request<Patient>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePatient(id: string): Promise<boolean> {
    try {
      await this.request(`/patients/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      if ((error as Error).message.includes('404')) {
        return false;
      }
      throw error;
    }
  }

  async getPatientConsultations(patientId: string): Promise<Consultation[]> {
    return this.request<Consultation[]>(`/patients/${patientId}/consultations`);
  }

  async getPatientDocuments(patientId: string): Promise<Document[]> {
    return this.request<Document[]>(`/patients/${patientId}/documents`);
  }

  async createDocument(formData: FormData): Promise<Document> {
    const url = `${API_BASE_URL}/documents`;
    const token = localStorage.getItem('auth_token');

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        // Don't set Content-Type for FormData, let browser set it with boundary
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // If we can't parse error JSON, use the default message
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please make sure the backend is running.');
      }
      throw error;
    }
  }

  async deleteDocument(id: string): Promise<boolean> {
    try {
      await this.request(`/documents/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      if ((error as Error).message.includes('404')) {
        return false;
      }
      throw error;
    }
  }

  // Consultations
  async createConsultation(consultation: Omit<Consultation, 'id' | 'created_at' | 'updated_at'>): Promise<Consultation> {
    return this.request<Consultation>('/consultations', {
      method: 'POST',
      body: JSON.stringify(consultation),
    });
  }

  async getConsultation(id: string): Promise<Consultation | null> {
    try {
      return await this.request<Consultation>(`/consultations/${id}`);
    } catch (error) {
      if ((error as Error).message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // Ingredients
  async createIngredient(ingredient: Omit<Ingredient, 'id' | 'created_at'>): Promise<Ingredient> {
    return this.request<Ingredient>('/ingredients', {
      method: 'POST',
      body: JSON.stringify(ingredient),
    });
  }

  async getIngredient(id: string): Promise<Ingredient | null> {
    try {
      return await this.request<Ingredient>(`/ingredients/${id}`);
    } catch (error) {
      if ((error as Error).message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async getAllIngredients(): Promise<Ingredient[]> {
    return this.request<Ingredient[]>('/ingredients');
  }

  async searchIngredients(query: string): Promise<Ingredient[]> {
    return this.request<Ingredient[]>(`/ingredients?search=${encodeURIComponent(query)}`);
  }

  async updateIngredient(id: string, updates: Partial<Ingredient>): Promise<Ingredient> {
    return this.request<Ingredient>(`/ingredients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteIngredient(id: string): Promise<boolean> {
    try {
      await this.request(`/ingredients/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      if ((error as Error).message.includes('404')) {
        return false;
      }
      throw error;
    }
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request('/dashboard/stats');
  }

  async getRecentPatients(limit: number = 5): Promise<Patient[]> {
    return this.request<Patient[]>(`/dashboard/recent-patients?limit=${limit}`);
  }

  async getRecentActivity(limit: number = 10): Promise<ActivityFeed[]> {
    return this.request<ActivityFeed[]>(`/dashboard/recent-activity?limit=${limit}`);
  }

  async getMonthlyStats(months: number = 6): Promise<MonthlyStats[]> {
    return this.request<MonthlyStats[]>(`/dashboard/monthly-stats?months=${months}`);
  }

  // Recipes
  async createRecipe(recipe: Omit<Recipe, 'id' | 'created_at'>): Promise<Recipe> {
    return this.request<Recipe>('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipe),
    });
  }

  async getRecipe(id: string): Promise<Recipe | null> {
    try {
      return await this.request<Recipe>(`/recipes/${id}`);
    } catch (error) {
      if ((error as Error).message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async getAllRecipes(): Promise<Recipe[]> {
    return this.request<Recipe[]>('/recipes');
  }

  async generateRecipeWithAI(request: {
    ingredientIds: string[];
    dietaryRestrictions?: string[];
    mealType?: 'desayuno' | 'almuerzo' | 'cena' | 'snack';
    servings?: number;
    maxCalories?: number;
    cuisine?: string;
    difficulty?: 'fácil' | 'intermedio' | 'difícil';
    cookingTime?: number;
  }): Promise<{ message: string; recipes: Recipe[] }> {
    return this.request('/recipes/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async testAIConnection(): Promise<{ status: string; provider?: string; error?: string }> {
    return this.request('/recipes/ai/test');
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default ApiService;