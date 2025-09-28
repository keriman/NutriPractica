import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Search } from 'lucide-react';
import { Ingredient } from '../types';
import { getDatabase } from '../lib/database';

export function IngredientManager() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    loadIngredients();
    seedDefaultIngredients();
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

  const seedDefaultIngredients = async () => {
    try {
      const db = getDatabase();
      const existingIngredients = await db.getAllIngredients();

      if (existingIngredients.length === 0) {
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
          }
        ];

        for (const ingredient of defaultIngredients) {
          try {
            await db.createIngredient(ingredient);
          } catch (e) {
            console.error('Error creating ingredient:', e);
          }
        }

        await loadIngredients();
      }
    } catch (e) {
      console.error('Error seeding ingredients:', e);
    }
  };
  
  const [formData, setFormData] = useState({
    nombre: '',
    calorias_por_100g: 0,
    proteinas: 0,
    carbohidratos: 0,
    grasas: 0,
    fibra: 0,
    categoria: 'Proteínas'
  });

  const categories = ['Proteínas', 'Carbohidratos', 'Verduras', 'Frutas', 'Grasas', 'Lácteos', 'Cereales', 'Legumbres'];

  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || ingredient.categoria === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const db = getDatabase();

      if (editingIngredient) {
        // Actualizar ingrediente existente
        await db.updateIngredient(editingIngredient.id, formData);
      } else {
        // Crear nuevo ingrediente
        await db.createIngredient(formData);
      }

      await loadIngredients();
      resetForm();
    } catch (error) {
      console.error('Error saving ingredient:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      calorias_por_100g: 0,
      proteinas: 0,
      carbohidratos: 0,
      grasas: 0,
      fibra: 0,
      categoria: 'Proteínas'
    });
    setEditingIngredient(null);
    setShowForm(false);
  };

  const startEdit = (ingredient: Ingredient) => {
    setFormData({
      nombre: ingredient.nombre,
      calorias_por_100g: ingredient.calorias_por_100g,
      proteinas: ingredient.proteinas,
      carbohidratos: ingredient.carbohidratos,
      grasas: ingredient.grasas,
      fibra: ingredient.fibra,
      categoria: ingredient.categoria
    });
    setEditingIngredient(ingredient);
    setShowForm(true);
  };

  const deleteIngredient = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este ingrediente?')) {
      try {
        const db = getDatabase();
        await db.deleteIngredient(id);
        await loadIngredients();
      } catch (error) {
        console.error('Error deleting ingredient:', error);
      }
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Proteínas': 'bg-red-100 text-red-800',
      'Carbohidratos': 'bg-blue-100 text-blue-800',
      'Verduras': 'bg-green-100 text-green-800',
      'Frutas': 'bg-orange-100 text-orange-800',
      'Grasas': 'bg-yellow-100 text-yellow-800',
      'Lácteos': 'bg-purple-100 text-purple-800',
      'Cereales': 'bg-indigo-100 text-indigo-800',
      'Legumbres': 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Ingredientes</h2>
          <p className="text-gray-600">Administra tu base de datos nutricional</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Ingrediente
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar ingredientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingIngredient ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Ingrediente *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  required
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calorías (por 100g) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.calorias_por_100g}
                  onChange={(e) => setFormData({ ...formData, calorias_por_100g: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proteínas (g) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.proteinas}
                  onChange={(e) => setFormData({ ...formData, proteinas: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carbohidratos (g) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.carbohidratos}
                  onChange={(e) => setFormData({ ...formData, carbohidratos: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grasas (g) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.grasas}
                  onChange={(e) => setFormData({ ...formData, grasas: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fibra (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.fibra}
                  onChange={(e) => setFormData({ ...formData, fibra: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                {editingIngredient ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ingredients List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Ingredientes ({filteredIngredients.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingrediente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calorías/100g
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Macronutrientes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIngredients.map((ingredient) => (
                <tr key={ingredient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{ingredient.nombre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(ingredient.categoria)}`}>
                      {ingredient.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ingredient.calorias_por_100g} kcal
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    P: {ingredient.proteinas}g | C: {ingredient.carbohidratos}g | G: {ingredient.grasas}g
                    {ingredient.fibra > 0 && ` | F: ${ingredient.fibra}g`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(ingredient)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteIngredient(ingredient.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredIngredients.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm || filterCategory ? 'No se encontraron ingredientes con los filtros aplicados' : 'No hay ingredientes registrados'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}