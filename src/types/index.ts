export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  especialidad?: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  especialidad?: string;
}

export interface Patient {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  genero: 'masculino' | 'femenino' | 'otro';
  altura: number; // en cm
  peso: number; // en kg
  objetivo_nutricional: string;
  alergias: string[];
  condiciones_medicas: string[];
  notas_medicas: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  patient_id: string;
  consultation_id?: string;
  nombre: string;
  tipo: string;
  url: string;
  descripcion?: string;
  created_at: string;
}

export interface Consultation {
  id: string;
  patient_id: string;
  fecha_consulta: string;
  peso: number;
  masa_muscular?: number;
  grasa_corporal?: number;
  agua_corporal?: number;
  masa_osea?: number;
  metabolismo_basal?: number;
  presion_arterial_sistolica?: number;
  presion_arterial_diastolica?: number;
  frecuencia_cardiaca?: number;
  temperatura?: number;
  notas_consulta: string;
  plan_nutricional?: string;
  proxima_cita?: string;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: string;
  nombre: string;
  calorias_por_100g: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
  fibra: number;
  categoria: string;
  created_at: string;
}

export interface Recipe {
  id: string;
  nombre: string;
  descripcion: string;
  ingredientes: RecipeIngredient[];
  instrucciones: string[];
  calorias_totales: number;
  tiempo_preparacion: number;
  porciones: number;
  categoria?: string;
  tips?: string[];
  created_at: string;
}

export interface RecipeIngredient {
  ingredient_id: string;
  cantidad: number;
  unidad: string;
  nombre: string;
}

export interface DishRequest {
  objetivo_calorias: number;
  ingredientes_requeridos: string[];
  restricciones: string[];
  tipo_comida: 'desayuno' | 'almuerzo' | 'cena' | 'snack';
}

export interface ActivityFeed {
  type: 'patient' | 'consultation' | 'recipe' | 'document';
  action: 'create' | 'update' | 'delete';
  title: string;
  description: string;
  timestamp: string;
}

export interface MonthlyStats {
  month: string;
  patients: number;
  consultations: number;
  recipes: number;
}

export interface DashboardStats {
  patients: number;
  documents: number;
  recipes: number;
  consultationsThisMonth: number;
}