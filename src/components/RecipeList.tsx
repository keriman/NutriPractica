import { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { getDatabase } from '../lib/database';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import AssignRecipeModal from './AssignRecipeModal';

export default function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const db = getDatabase();
      const allRecipes = await db.getAllRecipes();
      setRecipes(allRecipes);
    } catch (err) {
      setError('Error al cargar las recetas');
      console.error('Error loading recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = (recipe: Recipe) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receta: ${recipe.nombre}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 20px; }
              .ingredients { margin-bottom: 20px; }
              .ingredient { margin: 5px 0; }
              .instructions { margin-bottom: 20px; }
              .instruction { margin: 8px 0; padding: 5px; background-color: #f9f9f9; }
              .nutrition { background-color: #e8f4fd; padding: 15px; border-radius: 5px; }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${recipe.nombre}</h1>
              <p><em>${recipe.descripcion || ''}</em></p>
            </div>

            <div class="section">
              <h3>📊 Información Nutricional</h3>
              <div class="nutrition">
                <p><strong>Calorías:</strong> ${recipe.calorias_totales} kcal</p>
                <p><strong>Porciones:</strong> ${recipe.porciones}</p>
                <p><strong>Tiempo de preparación:</strong> ${recipe.tiempo_preparacion} minutos</p>
                ${recipe.categoria ? `<p><strong>Categoría:</strong> ${recipe.categoria}</p>` : ''}
              </div>
            </div>

            <div class="section ingredients">
              <h3>🥘 Ingredientes</h3>
              ${recipe.ingredientes.map(ing => `
                <div class="ingredient">
                  • ${ing.cantidad}${ing.unidad} de ${ing.nombre}
                </div>
              `).join('')}
            </div>

            <div class="section instructions">
              <h3>👩‍🍳 Instrucciones</h3>
              ${recipe.instrucciones.map((inst, index) => `
                <div class="instruction">
                  <strong>${index + 1}.</strong> ${inst}
                </div>
              `).join('')}
            </div>

            ${recipe.tips && recipe.tips.length > 0 ? `
              <div class="section">
                <h3>💡 Consejos</h3>
                ${recipe.tips.map(tip => `<p>• ${tip}</p>`).join('')}
              </div>
            ` : ''}

            <div class="no-print" style="margin-top: 30px; text-align: center;">
              <button onclick="window.print()" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Imprimir Receta
              </button>
              <button onclick="window.close()" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                Cerrar
              </button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleAssignToPatient = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  const handleAssignRecipe = async (patientId: string, recipeId: string) => {
    // TODO: Implementar la lógica para guardar la asignación en la base de datos
    // Por ahora solo mostramos un mensaje de éxito
    alert(`Receta asignada exitosamente al paciente`);
    console.log('Assigning recipe:', recipeId, 'to patient:', patientId);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecipe(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando recetas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="text-red-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-700 ml-3">{error}</p>
        </div>
        <button
          onClick={loadRecipes}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recetas</h1>
          <p className="text-gray-600 mt-1">
            Gestiona todas las recetas creadas ({recipes.length} total)
          </p>
        </div>
        <button
          onClick={loadRecipes}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar recetas por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron recetas' : 'No hay recetas disponibles'}
          </h3>
          <p className="text-gray-600">
            {searchTerm
              ? 'Intenta con otros términos de búsqueda'
              : 'Crea tu primera receta en la sección "Crear Receta"'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {recipe.nombre}
                  </h3>
                  {recipe.categoria && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {recipe.categoria}
                    </span>
                  )}
                </div>

                {recipe.descripcion && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {recipe.descripcion}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {recipe.calorias_totales}
                    </div>
                    <div className="text-gray-500 text-xs">kcal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {recipe.tiempo_preparacion}
                    </div>
                    <div className="text-gray-500 text-xs">min</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">
                      {recipe.porciones}
                    </div>
                    <div className="text-gray-500 text-xs">porción{recipe.porciones !== 1 ? 'es' : ''}</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-xs text-gray-500 mb-3">
                    Creada {formatDistanceToNow(new Date(recipe.created_at), {
                      addSuffix: true,
                      locale: es
                    })}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePrint(recipe)}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Imprimir
                    </button>
                    <button
                      onClick={() => handleAssignToPatient(recipe)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Asignar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AssignRecipeModal
        recipe={selectedRecipe}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAssign={handleAssignRecipe}
      />
    </div>
  );
}