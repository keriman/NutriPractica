import { useState, useEffect } from 'react';
import { ChefHat, Plus, Minus, Sparkles, Clock, Users } from 'lucide-react';
import { Ingredient, Recipe, DishRequest } from '../types';
import { getDatabase } from '../lib/database';

export function RecipeCreator() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>([]);

  const [dishRequest, setDishRequest] = useState<DishRequest>({
    objetivo_calorias: 2500,
    ingredientes_requeridos: [],
    restricciones: [],
    tipo_comida: 'almuerzo'
  });

  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newRestriction, setNewRestriction] = useState('');
  const [servings, setServings] = useState(2);
  const [maxCalories, setMaxCalories] = useState<number | undefined>(undefined);
  const [cuisine, setCuisine] = useState('');
  const [difficulty, setDifficulty] = useState<'fácil' | 'intermedio' | 'difícil'>('fácil');
  const [cookingTime, setCookingTime] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      const db = getDatabase();
      const allIngredients = await db.getAllIngredients();
      setIngredients(allIngredients);
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  };

  const addIngredientToRequest = (ingredientId: string) => {
    if (!selectedIngredientIds.includes(ingredientId)) {
      setSelectedIngredientIds([...selectedIngredientIds, ingredientId]);
    }
  };

  const removeIngredientFromRequest = (ingredientId: string) => {
    setSelectedIngredientIds(selectedIngredientIds.filter(id => id !== ingredientId));
  };

  const addRestriction = () => {
    if (newRestriction.trim() && !dishRequest.restricciones.includes(newRestriction.trim())) {
      setDishRequest({
        ...dishRequest,
        restricciones: [...dishRequest.restricciones, newRestriction.trim()]
      });
      setNewRestriction('');
    }
  };

  const removeRestriction = (restriction: string) => {
    setDishRequest({
      ...dishRequest,
      restricciones: dishRequest.restricciones.filter(r => r !== restriction)
    });
  };

  const generateRecipes = async () => {
    if (selectedIngredientIds.length === 0) return;

    setIsGenerating(true);
    setError(null);

    try {
      const db = getDatabase();

      const response = await db.generateRecipeWithAI({
        ingredientIds: selectedIngredientIds,
        dietaryRestrictions: dishRequest.restricciones,
        mealType: dishRequest.tipo_comida,
        servings,
        maxCalories,
        cuisine: cuisine || undefined,
        difficulty,
        cookingTime
      });

      setGeneratedRecipes(response.recipes);
      console.log(`✅ ${response.recipes.length} recipes generated successfully`);

    } catch (error) {
      console.error('❌ Error generating recipe:', error);
      setError((error as Error).message || 'Error generando receta');
    } finally {
      setIsGenerating(false);
    }
  };

  const categorizedIngredients = ingredients.reduce((acc, ingredient) => {
    if (!acc[ingredient.categoria]) {
      acc[ingredient.categoria] = [];
    }
    acc[ingredient.categoria].push(ingredient);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Creador de Platillos con IA</h2>
        <p className="text-gray-600">Genera recetas personalizadas basadas en ingredientes y objetivos calóricos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración del Platillo</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objetivo Calórico
                </label>
                <input
                  type="number"
                  value={dishRequest.objetivo_calorias}
                  onChange={(e) => setDishRequest({
                    ...dishRequest,
                    objetivo_calorias: Number(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="2500"
                />
                <p className="text-sm text-gray-500 mt-1">Calorías totales deseadas para el día</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porciones
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calorías máximas por receta (opcional)
                </label>
                <input
                  type="number"
                  value={maxCalories || ''}
                  onChange={(e) => setMaxCalories(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ej: 500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de cocción máximo (minutos)
                </label>
                <input
                  type="number"
                  value={cookingTime || ''}
                  onChange={(e) => setCookingTime(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ej: 30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dificultad
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as 'fácil' | 'intermedio' | 'difícil')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="fácil">Fácil</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="difícil">Difícil</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de cocina (opcional)
                </label>
                <input
                  type="text"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ej: Mediterránea, Mexicana, Asiática"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Comida
                </label>
                <select
                  value={dishRequest.tipo_comida}
                  onChange={(e) => setDishRequest({
                    ...dishRequest,
                    tipo_comida: e.target.value as any
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="desayuno">Desayuno</option>
                  <option value="almuerzo">Almuerzo</option>
                  <option value="cena">Cena</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restricciones Dietéticas
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newRestriction}
                    onChange={(e) => setNewRestriction(e.target.value)}
                    placeholder="Ej: Sin gluten, vegano..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRestriction())}
                  />
                  <button
                    type="button"
                    onClick={addRestriction}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dishRequest.restricciones.map((restriction, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                    >
                      {restriction}
                      <button
                        type="button"
                        onClick={() => removeRestriction(restriction)}
                        className="ml-2 h-4 w-4 text-orange-600 hover:text-orange-800"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredientes Seleccionados</h3>

            {selectedIngredientIds.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Selecciona ingredientes de la lista para comenzar
              </p>
            ) : (
              <div className="space-y-2">
                {selectedIngredientIds.map((ingredientId) => {
                  const ingredient = ingredients.find(ing => ing.id === ingredientId);
                  if (!ingredient) return null;
                  return (
                    <div
                      key={ingredientId}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-md"
                    >
                      <span className="text-green-800 font-medium">{ingredient.nombre}</span>
                      <button
                        onClick={() => removeIngredientFromRequest(ingredientId)}
                        className="text-green-600 hover:text-green-800 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={generateRecipes}
              disabled={selectedIngredientIds.length === 0 || isGenerating}
              className="w-full mt-4 bg-purple-600 text-white px-4 py-3 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generando recetas...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generar Recetas con IA
                </>
              )}
            </button>
          </div>
        </div>

        {/* Ingredients Library */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Biblioteca de Ingredientes</h3>
          
          <div className="space-y-4 max-h-180 overflow-y-auto">
            {Object.entries(categorizedIngredients).map(([category, categoryIngredients]) => (
              <div key={category}>
                <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                <div className="space-y-2 ml-4">
                  {categoryIngredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{ingredient.nombre}</div>
                        <div className="text-sm text-gray-500">
                          {ingredient.calorias_por_100g} kcal/100g | 
                          P: {ingredient.proteinas}g | 
                          C: {ingredient.carbohidratos}g | 
                          G: {ingredient.grasas}g
                        </div>
                      </div>
                      <button
                        onClick={() => addIngredientToRequest(ingredient.id)}
                        disabled={selectedIngredientIds.includes(ingredient.id)}
                        className="ml-3 p-2 text-green-600 hover:text-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Generated Recipes */}
      {generatedRecipes.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Recetas Generadas</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {generatedRecipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{recipe.nombre}</h4>
                    <p className="text-gray-600 text-sm mt-1">{recipe.descripcion}</p>
                  </div>
                  <ChefHat className="h-6 w-6 text-purple-600" />
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-md">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{recipe.calorias_totales}</div>
                    <div className="text-xs text-gray-500">Calorías</div>
                  </div>
                  <div className="text-center flex items-center justify-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    <div>
                      <div className="font-semibold text-gray-900">{recipe.tiempo_preparacion}m</div>
                      <div className="text-xs text-gray-500">Tiempo</div>
                    </div>
                  </div>
                  <div className="text-center flex items-center justify-center">
                    <Users className="h-4 w-4 mr-1 text-gray-500" />
                    <div>
                      <div className="font-semibold text-gray-900">{recipe.porciones}</div>
                      <div className="text-xs text-gray-500">Porciones</div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">Ingredientes:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {recipe.ingredientes.map((ing, index) => (
                      <li key={index}>
                        • {ing.cantidad}{ing.unidad} de {ing.nombre}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Instrucciones:</h5>
                  <ol className="text-sm text-gray-600 space-y-1">
                    {recipe.instrucciones.map((instruction, index) => (
                      <li key={index} className="flex">
                        <span className="font-medium mr-2">{index + 1}.</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}