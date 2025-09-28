import OpenAI from 'openai';
import { Ingredient, Recipe, RecipeIngredient } from '../../src/types';

export interface RecipeGenerationRequest {
  ingredients: Ingredient[];
  dietaryRestrictions?: string[];
  mealType?: 'desayuno' | 'almuerzo' | 'cena' | 'snack';
  servings?: number;
  maxCalories?: number;
  cuisine?: string;
  difficulty?: 'fácil' | 'intermedio' | 'difícil';
  cookingTime?: number; // in minutes
}

export interface GeneratedRecipe {
  nombre: string;
  descripcion: string;
  ingredientes: RecipeIngredient[];
  instrucciones: string[];
  calorias_totales: number;
  tiempo_preparacion: number;
  porciones: number;
  tips?: string[];
  categoria?: string;
}

export interface GeneratedRecipes {
  recetas: GeneratedRecipe[];
}

class AIService {
  private openai: OpenAI | null = null;

  constructor() {
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({
        apiKey: openaiKey,
      });
      console.log('✅ OpenAI initialized successfully');
    } else if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
      console.warn('⚠️  OpenAI not configured, but Gemini is available. Consider using OpenAI for better compatibility.');
    } else {
      console.warn('⚠️  No AI service configured. Please set OPENAI_API_KEY or GEMINI_API_KEY.');
    }
  }

  private buildPrompt(request: RecipeGenerationRequest): string {
    const ingredientsList = request.ingredients
      .map(ing => `ID: ${ing.id} | ${ing.nombre} (${ing.calorias_por_100g} kcal/100g, P:${ing.proteinas}g, C:${ing.carbohidratos}g, G:${ing.grasas}g)`)
      .join('\n');

    const restrictions = request.dietaryRestrictions?.length
      ? `\nRestricciones dietéticas: ${request.dietaryRestrictions.join(', ')}`
      : '';

    const mealType = request.mealType ? `\nTipo de comida: ${request.mealType}` : '';
    const servings = request.servings ? `\nPorciones REQUERIDAS: ${request.servings} (OBLIGATORIO)` : '\nPorciones: 2-4';
    const maxCals = request.maxCalories ? `\nCalorías máximas: ${request.maxCalories}` : '';
    const cuisine = request.cuisine ? `\nCocina: ${request.cuisine}` : '';
    const difficulty = request.difficulty ? `\nDificultad: ${request.difficulty}` : '';
    const cookTime = request.cookingTime ? `\nTiempo máximo de cocción: ${request.cookingTime} minutos` : '';

    return `
Eres un chef nutriólogo experto. Crea 4 recetas saludables y deliciosas diferentes usando ÚNICAMENTE los siguientes ingredientes disponibles:

${ingredientsList}${restrictions}${mealType}${servings}${maxCals}${cuisine}${difficulty}${cookTime}

INSTRUCCIONES IMPORTANTES:
1. USA SOLO los ingredientes de la lista proporcionada
2. USA LOS IDs EXACTOS mostrados (ID: xxx) para cada ingrediente en el campo ingredient_id
3. RESPETA EXACTAMENTE el número de porciones especificado arriba - es OBLIGATORIO
4. Crea 4 recetas DIFERENTES con variaciones en preparación, estilo de cocción y combinaciones
5. Calcula las cantidades exactas en gramos para cada ingrediente según el número de porciones requerido
6. Proporciona instrucciones paso a paso claras para cada receta
7. Calcula las calorías totales sumando los ingredientes usados en cada receta
8. Responde en formato JSON válido con esta estructura exacta:

{
  "recetas": [
    {
      "nombre": "Nombre atractivo de la receta 1",
      "descripcion": "Descripción breve y apetitosa (máximo 150 caracteres)",
      "ingredientes": [
        {
          "ingredient_id": "id_del_ingrediente",
          "cantidad": 150,
          "unidad": "g",
          "nombre": "nombre_del_ingrediente"
        }
      ],
      "instrucciones": [
        "Paso 1: instrucción detallada",
        "Paso 2: siguiente paso",
        "Paso 3: etc..."
      ],
      "calorias_totales": 450,
      "tiempo_preparacion": 25,
      "porciones": 2,
      "tips": [
        "Consejo útil 1",
        "Consejo útil 2"
      ],
      "categoria": "Plato principal/Ensalada/Postre/etc"
    },
    {
      "nombre": "Nombre atractivo de la receta 2",
      "descripcion": "Descripción breve y apetitosa diferente",
      "ingredientes": [
        {
          "ingredient_id": "id_del_ingrediente",
          "cantidad": 200,
          "unidad": "g",
          "nombre": "nombre_del_ingrediente"
        }
      ],
      "instrucciones": [
        "Paso 1: método de preparación diferente",
        "Paso 2: siguiente paso",
        "Paso 3: etc..."
      ],
      "calorias_totales": 380,
      "tiempo_preparacion": 20,
      "porciones": 2,
      "tips": [
        "Consejo útil 1",
        "Consejo útil 2"
      ],
      "categoria": "Plato principal/Ensalada/Postre/etc"
    },
    {
      "nombre": "Nombre atractivo de la receta 3",
      "descripcion": "Tercera variación creativa",
      "ingredientes": [
        {
          "ingredient_id": "id_del_ingrediente",
          "cantidad": 180,
          "unidad": "g",
          "nombre": "nombre_del_ingrediente"
        }
      ],
      "instrucciones": [
        "Paso 1: tercer estilo de preparación",
        "Paso 2: siguiente paso",
        "Paso 3: etc..."
      ],
      "calorias_totales": 420,
      "tiempo_preparacion": 30,
      "porciones": 2,
      "tips": [
        "Consejo útil 1",
        "Consejo útil 2"
      ],
      "categoria": "Plato principal/Ensalada/Postre/etc"
    },
    {
      "nombre": "Nombre atractivo de la receta 4",
      "descripcion": "Cuarta opción innovadora",
      "ingredientes": [
        {
          "ingredient_id": "id_del_ingrediente",
          "cantidad": 160,
          "unidad": "g",
          "nombre": "nombre_del_ingrediente"
        }
      ],
      "instrucciones": [
        "Paso 1: cuarto método único",
        "Paso 2: siguiente paso",
        "Paso 3: etc..."
      ],
      "calorias_totales": 400,
      "tiempo_preparacion": 22,
      "porciones": 2,
      "tips": [
        "Consejo útil 1",
        "Consejo útil 2"
      ],
      "categoria": "Plato principal/Ensalada/Postre/etc"
    }
  ]
}

IMPORTANTE:
- Responde ÚNICAMENTE con JSON válido, sin texto adicional
- Asegúrate de que las 4 recetas sean DIFERENTES en preparación y estilo
- TODAS las recetas deben tener EXACTAMENTE el número de porciones especificado arriba
- Las cantidades de ingredientes deben ser proporcionales al número de porciones requerido
- Los ingredient_id deben coincidir exactamente con los IDs mostrados arriba (ID: xxx)
- El nombre del ingrediente debe coincidir exactamente con el nombre mostrado
- El cálculo de calorías debe ser preciso basado en las cantidades usadas
- Varía los tiempos de preparación y métodos de cocción entre recetas
`;
  }

  async generateRecipe(request: RecipeGenerationRequest): Promise<GeneratedRecipes> {
    if (!this.openai) {
      throw new Error('AI service not configured. Please set OPENAI_API_KEY in environment variables.');
    }

    if (!request.ingredients || request.ingredients.length === 0) {
      throw new Error('At least one ingredient is required to generate a recipe.');
    }

    try {
      const prompt = this.buildPrompt(request);

      console.log('🤖 Generating recipe with OpenAI...');
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional nutritionist chef. You create healthy and delicious recipes using only the provided ingredients. You MUST respond with valid JSON only, no additional text before or after the JSON. Ensure all property names are in double quotes and the JSON is properly formatted.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 2000
      });

      const text = completion.choices[0]?.message?.content?.trim();
      if (!text) {
        throw new Error('No response received from OpenAI');
      }

      console.log('🤖 AI Response received, parsing JSON...');

      // Clean up the response to extract JSON
      let jsonText = text;

      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Find JSON object boundaries
      const jsonStart = jsonText.indexOf('{');
      const jsonEnd = jsonText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
      }

      // Clean up common JSON formatting issues
      jsonText = jsonText
        .replace(/,\s*}/g, '}')  // Remove trailing commas
        .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
        .replace(/'/g, '"');     // Replace single quotes with double quotes

      // Parse the JSON response
      const generatedRecipes: GeneratedRecipes = JSON.parse(jsonText);

      // Validate the response structure
      if (!generatedRecipes.recetas || !Array.isArray(generatedRecipes.recetas) || generatedRecipes.recetas.length === 0) {
        throw new Error('Invalid recipes structure received from AI');
      }

      // Validate each recipe
      for (const recipe of generatedRecipes.recetas) {
        if (!recipe.nombre || !recipe.ingredientes || !recipe.instrucciones) {
          throw new Error('Invalid recipe structure received from AI');
        }
      }

      // Ensure all ingredient IDs are valid for all recipes
      const validIngredientIds = new Set(request.ingredients.map(ing => ing.id));
      for (const recipe of generatedRecipes.recetas) {
        for (const recipeIng of recipe.ingredientes) {
          if (!validIngredientIds.has(recipeIng.ingredient_id)) {
            console.warn(`⚠️  Invalid ingredient ID in AI response: ${recipeIng.ingredient_id}`);
            // Try to find a matching ingredient by name
            const matchingIngredient = request.ingredients.find(ing =>
              ing.nombre.toLowerCase().includes(recipeIng.nombre.toLowerCase()) ||
              recipeIng.nombre.toLowerCase().includes(ing.nombre.toLowerCase())
            );
            if (matchingIngredient) {
              recipeIng.ingredient_id = matchingIngredient.id;
              recipeIng.nombre = matchingIngredient.nombre;
            }
          }
        }
      }

      console.log(`✅ ${generatedRecipes.recetas.length} recipes generated successfully`);
      return generatedRecipes;

    } catch (error) {
      console.error('❌ Error generating recipe with AI:', error);

      if (error instanceof SyntaxError) {
        throw new Error('AI returned invalid JSON. Please try again.');
      } else if ((error as any).message?.includes('API key')) {
        throw new Error('Invalid or missing OpenAI API key. Please check your configuration.');
      } else if ((error as any).message?.includes('quota') || (error as any).message?.includes('rate limit')) {
        throw new Error('AI service quota exceeded. Please try again later.');
      } else {
        throw new Error(`Failed to generate recipe: ${(error as Error).message}`);
      }
    }
  }

  // Test method to check if AI service is working
  async testConnection(): Promise<boolean> {
    if (!this.openai) {
      return false;
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: 'Respond with just "OK" if you can read this message.'
          }
        ],
        max_completion_tokens: 10
      });

      const text = completion.choices[0]?.message?.content?.trim().toLowerCase();
      return text?.includes('ok') ?? false;
    } catch (error) {
      console.error('❌ Error testing AI connection:', error);
      return false;
    }
  }
}

export const aiService = new AIService();
export default AIService;