import { useState, useEffect } from 'react';
import { Recipe, Patient } from '../types';
import { getDatabase } from '../lib/database';

interface AssignRecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (patientId: string, recipeId: string) => void;
}

export default function AssignRecipeModal({ recipe, isOpen, onClose, onAssign }: AssignRecipeModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPatients();
      setSelectedPatient('');
      setSearchTerm('');
    }
  }, [isOpen]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const db = getDatabase();
      const allPatients = await db.getAllPatients();
      setPatients(allPatients);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.nombre} ${patient.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedPatient || !recipe) return;

    try {
      setAssigning(true);
      await onAssign(selectedPatient, recipe.id);
      onClose();
    } catch (error) {
      console.error('Error assigning recipe:', error);
    } finally {
      setAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Asignar Receta a Paciente
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {recipe && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">{recipe.nombre}</h3>
              <p className="text-sm text-gray-600 mt-1">{recipe.descripcion}</p>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>{recipe.calorias_totales} kcal</span>
                <span>{recipe.tiempo_preparacion} min</span>
                <span>{recipe.porciones} porción{recipe.porciones !== 1 ? 'es' : ''}</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Barra de búsqueda */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar paciente por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando pacientes...</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredPatients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <label
                    key={patient.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPatient === patient.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="patient"
                      value={patient.id}
                      checked={selectedPatient === patient.id}
                      onChange={(e) => setSelectedPatient(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {patient.nombre} {patient.apellido}
                          </h4>
                          <p className="text-sm text-gray-600">{patient.email}</p>
                        </div>
                        <div className="text-xs text-gray-500">
                          <div>Peso: {patient.peso} kg</div>
                          <div>Altura: {patient.altura} cm</div>
                        </div>
                      </div>
                      {patient.objetivo_nutricional && (
                        <p className="text-xs text-gray-500 mt-1">
                          Objetivo: {patient.objetivo_nutricional}
                        </p>
                      )}
                      {patient.alergias.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {patient.alergias.map((alergia, index) => (
                            <span
                              key={index}
                              className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full"
                            >
                              {alergia}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 ml-3 ${
                        selectedPatient === patient.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedPatient === patient.id && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedPatient || assigning}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {assigning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Asignando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Asignar Receta
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}