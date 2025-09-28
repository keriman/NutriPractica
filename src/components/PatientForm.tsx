import React, { useState } from 'react';
import { Save, X, Plus, Minus } from 'lucide-react';
import { Patient } from '../types';

interface PatientFormProps {
  patient?: Patient;
  onSave: (patient: Patient | Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

export function PatientForm({ patient, onSave, onCancel }: PatientFormProps) {
  const [formData, setFormData] = useState({
    nombre: patient?.nombre || '',
    apellido: patient?.apellido || '',
    email: patient?.email || '',
    telefono: patient?.telefono || '',
    fecha_nacimiento: patient?.fecha_nacimiento || '',
    genero: patient?.genero || 'masculino' as const,
    altura: patient?.altura || 0,
    peso: patient?.peso || 0,
    objetivo_nutricional: patient?.objetivo_nutricional || '',
    alergias: patient?.alergias || [],
    condiciones_medicas: patient?.condiciones_medicas || [],
    notas_medicas: patient?.notas_medicas || '',
  });

  const [newAlergia, setNewAlergia] = useState('');
  const [newCondicion, setNewCondicion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (patient) {
      // Editando paciente existente
      const patientData: Patient = {
        ...patient,
        ...formData,
        updated_at: new Date().toISOString(),
      };
      onSave(patientData);
    } else {
      // Creando nuevo paciente
      onSave(formData);
    }
  };

  const addAlergia = () => {
    if (newAlergia.trim()) {
      setFormData({
        ...formData,
        alergias: [...formData.alergias, newAlergia.trim()]
      });
      setNewAlergia('');
    }
  };

  const removeAlergia = (index: number) => {
    setFormData({
      ...formData,
      alergias: formData.alergias.filter((_, i) => i !== index)
    });
  };

  const addCondicion = () => {
    if (newCondicion.trim()) {
      setFormData({
        ...formData,
        condiciones_medicas: [...formData.condiciones_medicas, newCondicion.trim()]
      });
      setNewCondicion('');
    }
  };

  const removeCondicion = (index: number) => {
    setFormData({
      ...formData,
      condiciones_medicas: formData.condiciones_medicas.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {patient ? 'Editar Paciente' : 'Nuevo Paciente'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
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
                Apellido *
              </label>
              <input
                type="text"
                required
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                required
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                required
                value={formData.fecha_nacimiento}
                onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Género *
              </label>
              <select
                required
                value={formData.genero}
                onChange={(e) => setFormData({ ...formData, genero: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Altura (cm) *
              </label>
              <input
                type="number"
                required
                value={formData.altura}
                onChange={(e) => setFormData({ ...formData, altura: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.peso}
                onChange={(e) => setFormData({ ...formData, peso: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objetivo Nutricional
            </label>
            <textarea
              value={formData.objetivo_nutricional}
              onChange={(e) => setFormData({ ...formData, objetivo_nutricional: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Ej: Pérdida de peso, ganancia de masa muscular, mantenimiento..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alergias
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newAlergia}
                onChange={(e) => setNewAlergia(e.target.value)}
                placeholder="Agregar alergia..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAlergia())}
              />
              <button
                type="button"
                onClick={addAlergia}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.alergias.map((alergia, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                >
                  {alergia}
                  <button
                    type="button"
                    onClick={() => removeAlergia(index)}
                    className="ml-2 h-4 w-4 text-red-600 hover:text-red-800"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condiciones Médicas
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newCondicion}
                onChange={(e) => setNewCondicion(e.target.value)}
                placeholder="Agregar condición médica..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondicion())}
              />
              <button
                type="button"
                onClick={addCondicion}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.condiciones_medicas.map((condicion, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {condicion}
                  <button
                    type="button"
                    onClick={() => removeCondicion(index)}
                    className="ml-2 h-4 w-4 text-blue-600 hover:text-blue-800"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Médicas
            </label>
            <textarea
              value={formData.notas_medicas}
              onChange={(e) => setFormData({ ...formData, notas_medicas: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Observaciones médicas adicionales..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}