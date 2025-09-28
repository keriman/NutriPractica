import { useState, useEffect } from 'react';
import { Plus, Search, User, Calendar, Phone, FileText } from 'lucide-react';
import { Patient } from '../types';
import { PatientForm } from './PatientForm';
import { PatientDetails } from './PatientDetails';
import { getDatabase } from '../lib/database';

export function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const db = getDatabase();
      const allPatients = await db.getAllPatients();
      setPatients(allPatients);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.apellido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPatient = async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const db = getDatabase();
      await db.createPatient(patientData);
      await loadPatients();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating patient:', error);
    }
  };

  const handleUpdatePatient = async (updatedPatient: Patient) => {
    try {
      const db = getDatabase();
      const updated = await db.updatePatient(updatedPatient.id, updatedPatient);
      await loadPatients();
      setSelectedPatient(updated);
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (selectedPatient) {
    return (
      <PatientDetails
        patient={selectedPatient}
        onBack={() => setSelectedPatient(null)}
        onUpdate={handleUpdatePatient}
      />
    );
  }

  if (showForm) {
    return (
      <PatientForm
        onSave={handleAddPatient}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pacientes</h2>
          <p className="text-gray-600">Gestiona la información de tus pacientes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Paciente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar pacientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {filteredPatients.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
          <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pacientes registrados</h3>
          <p className="text-gray-500 mb-6">Comienza agregando tu primer paciente para gestionar sus datos médicos</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Agregar Primer Paciente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => setSelectedPatient(patient)}
              className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {patient.nombre} {patient.apellido}
                    </h3>
                    <p className="text-sm text-gray-500">{calculateAge(patient.fecha_nacimiento)} años</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {patient.telefono}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(patient.fecha_nacimiento).toLocaleDateString('es-ES')}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FileText className="h-4 w-4 mr-2" />
                  Peso: {patient.peso}kg | Altura: {patient.altura}cm
                </div>
              </div>

              {patient.objetivo_nutricional && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700 font-medium">Objetivo:</p>
                  <p className="text-sm text-blue-600">{patient.objetivo_nutricional}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}