import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard as Edit, Upload, FileText, Download, Trash2, Plus, Calendar, Phone, Mail, Stethoscope, TrendingUp, FileDown } from 'lucide-react';
import { Patient, Document, Consultation } from '../types';
import { PatientForm } from './PatientForm';
import { ConsultationForm } from './ConsultationForm';
import { ConsultationDetails } from './ConsultationDetails';
import { getDatabase } from '../lib/database';

interface PatientDetailsProps {
  patient: Patient;
  onBack: () => void;
  onUpdate: (patient: Patient) => void;
}

export function PatientDetails({ patient, onBack, onUpdate }: PatientDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadData, setUploadData] = useState({
    nombre: '',
    tipo: 'analisis',
    descripcion: '',
    file: null as File | null
  });

  // Load patient consultations and documents when component mounts
  useEffect(() => {
    const loadPatientData = async () => {
      try {
        setLoading(true);
        const db = getDatabase();

        // Load consultations and documents in parallel
        const [patientConsultations, patientDocuments] = await Promise.all([
          db.getPatientConsultations(patient.id),
          db.getPatientDocuments(patient.id)
        ]);

        setConsultations(patientConsultations);
        setDocuments(patientDocuments);
      } catch (error) {
        console.error('Error loading patient data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
  }, [patient.id]);

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

  const calculateIMC = () => {
    const heightInM = patient.altura / 100;
    return (patient.peso / (heightInM * heightInM)).toFixed(1);
  };

  const getIMCStatus = (imc: number) => {
    if (imc < 18.5) return { status: 'Bajo peso', color: 'text-blue-600' };
    if (imc < 25) return { status: 'Normal', color: 'text-green-600' };
    if (imc < 30) return { status: 'Sobrepeso', color: 'text-yellow-600' };
    return { status: 'Obesidad', color: 'text-red-600' };
  };

  const handleUploadDocument = async () => {
    if (!uploadData.nombre || !uploadData.file) return;

    try {
      setLoading(true);
      const db = getDatabase();

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('patient_id', patient.id);
      formData.append('nombre', uploadData.nombre);
      formData.append('tipo', uploadData.tipo);
      if (uploadData.descripcion) {
        formData.append('descripcion', uploadData.descripcion);
      }

      // Upload document
      await db.createDocument(formData);

      // Reload documents from server
      const updatedDocuments = await db.getPatientDocuments(patient.id);
      setDocuments(updatedDocuments);

      // Reset form and close modal
      setUploadData({ nombre: '', tipo: 'analisis', descripcion: '', file: null });
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading document:', error);
      // You could add a toast notification here for user feedback
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const db = getDatabase();

      // Delete document from server
      await db.deleteDocument(documentId);

      // Remove from local state
      setDocuments(documents.filter(doc => doc.id !== documentId));
    } catch (error) {
      console.error('Error deleting document:', error);
      // You could add a toast notification here for user feedback
    }
  };

  const handleAddConsultation = async (consultation: Consultation) => {
    try {
      setLoading(true);
      const db = getDatabase();

      // Create the consultation in the database
      await db.createConsultation(consultation);

      // Reload consultations from the database to ensure consistency
      const updatedConsultations = await db.getPatientConsultations(patient.id);
      setConsultations(updatedConsultations);

      setShowConsultationForm(false);
    } catch (error) {
      console.error('Error creating consultation:', error);
      // Optionally show an error message to user
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConsultation = (updatedConsultation: Consultation) => {
    setConsultations(consultations.map(c => c.id === updatedConsultation.id ? updatedConsultation : c));
    setSelectedConsultation(updatedConsultation);
  };

  const handleDownloadPatientRecord = () => {
    const patientData = {
      // Información personal
      informacionPersonal: {
        nombre: `${patient.nombre} ${patient.apellido}`,
        edad: calculateAge(patient.fecha_nacimiento),
        fechaNacimiento: new Date(patient.fecha_nacimiento).toLocaleDateString('es-ES'),
        telefono: patient.telefono,
        email: patient.email,
        genero: patient.genero,
        fechaRegistro: new Date(patient.created_at).toLocaleDateString('es-ES')
      },

      // Datos físicos
      datosActuales: {
        peso: `${patient.peso} kg`,
        altura: `${patient.altura} cm`,
        imc: `${calculateIMC()} (${getIMCStatus(Number(calculateIMC())).status})`
      },

      // Información médica
      informacionMedica: {
        objetivoNutricional: patient.objetivo_nutricional || 'No especificado',
        alergias: patient.alergias.length > 0 ? patient.alergias : ['Ninguna registrada'],
        condicionesMedicas: patient.condiciones_medicas.length > 0 ? patient.condiciones_medicas : ['Ninguna registrada'],
        notasMedicas: patient.notas_medicas || 'Sin notas adicionales'
      },

      // Historial de consultas
      historialConsultas: consultations.map(consultation => ({
        fecha: new Date(consultation.fecha_consulta).toLocaleDateString('es-ES'),
        peso: `${consultation.peso} kg`,
        masaMuscular: consultation.masa_muscular ? `${consultation.masa_muscular}%` : 'No registrado',
        grasaCorporal: consultation.grasa_corporal ? `${consultation.grasa_corporal}%` : 'No registrado',
        presionArterial: (consultation.presion_arterial_sistolica && consultation.presion_arterial_diastolica)
          ? `${consultation.presion_arterial_sistolica}/${consultation.presion_arterial_diastolica}`
          : 'No registrada',
        frecuenciaCardiaca: consultation.frecuencia_cardiaca ? `${consultation.frecuencia_cardiaca} bpm` : 'No registrada',
        notas: consultation.notas_consulta || 'Sin observaciones',
        planNutricional: consultation.plan_nutricional || 'Sin plan específico'
      }))
    };

    // Generar contenido del expediente
    const expedienteContent = `
EXPEDIENTE MÉDICO - NUTRICIÓN
=====================================

INFORMACIÓN PERSONAL
--------------------
Nombre: ${patientData.informacionPersonal.nombre}
Edad: ${patientData.informacionPersonal.edad} años
Fecha de Nacimiento: ${patientData.informacionPersonal.fechaNacimiento}
Género: ${patientData.informacionPersonal.genero}
Teléfono: ${patientData.informacionPersonal.telefono}
Email: ${patientData.informacionPersonal.email}
Fecha de Registro: ${patientData.informacionPersonal.fechaRegistro}

DATOS FÍSICOS ACTUALES
----------------------
Peso: ${patientData.datosActuales.peso}
Altura: ${patientData.datosActuales.altura}
IMC: ${patientData.datosActuales.imc}

INFORMACIÓN MÉDICA
------------------
Objetivo Nutricional: ${patientData.informacionMedica.objetivoNutricional}

Alergias:
${patientData.informacionMedica.alergias.map(alergia => `• ${alergia}`).join('\n')}

Condiciones Médicas:
${patientData.informacionMedica.condicionesMedicas.map(condicion => `• ${condicion}`).join('\n')}

Notas Médicas:
${patientData.informacionMedica.notasMedicas}

HISTORIAL DE CONSULTAS (${patientData.historialConsultas.length} consultas)
========================================
${patientData.historialConsultas.length === 0 ? 'No hay consultas registradas' :
  patientData.historialConsultas.map((consulta, index) => `
CONSULTA ${index + 1} - ${consulta.fecha}
-----------------------------------------
• Peso: ${consulta.peso}
• Masa Muscular: ${consulta.masaMuscular}
• Grasa Corporal: ${consulta.grasaCorporal}
• Presión Arterial: ${consulta.presionArterial}
• Frecuencia Cardíaca: ${consulta.frecuenciaCardiaca}
• Observaciones: ${consulta.notas}
• Plan Nutricional: ${consulta.planNutricional}
`).join('\n')}

=====================================
Expediente generado el: ${new Date().toLocaleString('es-ES')}
Sistema: NutriPráctica
=====================================
    `.trim();

    // Crear y descargar archivo
    const blob = new Blob([expedienteContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Expediente_${patient.nombre}_${patient.apellido}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const documentTypes = {
    analisis: 'Análisis Clínico',
    radiografia: 'Radiografía',
    receta: 'Receta Médica',
    informe: 'Informe Médico',
    otro: 'Otro'
  };

  if (isEditing) {
    return (
      <PatientForm
        patient={patient}
        onSave={(updatedPatient) => {
          if ('id' in updatedPatient) {
            onUpdate(updatedPatient as Patient);
          }
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  if (selectedConsultation) {
    return (
      <ConsultationDetails
        consultation={selectedConsultation}
        patient={patient}
        onBack={() => setSelectedConsultation(null)}
        onUpdate={handleUpdateConsultation}
      />
    );
  }

  if (showConsultationForm) {
    return (
      <ConsultationForm
        patient={patient}
        onSave={handleAddConsultation}
        onCancel={() => setShowConsultationForm(false)}
      />
    );
  }

  const imc = Number(calculateIMC());
  const imcStatus = getIMCStatus(imc);
  const latestConsultation = consultations[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Pacientes
        </button>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={handleDownloadPatientRecord}
            className="flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base"
          >
            <FileDown className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Descargar Expediente</span>
            <span className="sm:hidden">Expediente</span>
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {patient.nombre} {patient.apellido}
            </h1>
            <p className="text-gray-600">{calculateAge(patient.fecha_nacimiento)} años</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Paciente desde</div>
            <div className="font-medium">
              {new Date(patient.created_at).toLocaleDateString('es-ES')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center text-gray-600">
              <Phone className="h-4 w-4 mr-3" />
              {patient.telefono}
            </div>
            {patient.email && (
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-3" />
                {patient.email}
              </div>
            )}
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-3" />
              {new Date(patient.fecha_nacimiento).toLocaleDateString('es-ES')}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Peso</div>
              <div className="font-medium">{patient.peso} kg</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Altura</div>
              <div className="font-medium">{patient.altura} cm</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Género</div>
              <div className="font-medium capitalize">{patient.genero}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">IMC</div>
              <div className={`font-medium ${imcStatus.color}`}>
                {calculateIMC()} ({imcStatus.status})
              </div>
            </div>
          </div>
        </div>

        {patient.objetivo_nutricional && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Objetivo Nutricional</h3>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-blue-800">{patient.objetivo_nutricional}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {patient.alergias.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Alergias</h3>
              <div className="flex flex-wrap gap-2">
                {patient.alergias.map((alergia, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                  >
                    {alergia}
                  </span>
                ))}
              </div>
            </div>
          )}

          {patient.condiciones_medicas.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Condiciones Médicas</h3>
              <div className="flex flex-wrap gap-2">
                {patient.condiciones_medicas.map((condicion, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {condicion}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {patient.notas_medicas && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas Médicas</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-700 whitespace-pre-wrap">{patient.notas_medicas}</p>
            </div>
          </div>
        )}
      </div>

      {/* Consultas Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <Stethoscope className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Historial de Consultas</h2>
          </div>
          <button
            onClick={() => setShowConsultationForm(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Consulta
          </button>
        </div>

        <div className="p-6">
          {consultations.length === 0 ? (
            <div className="text-center py-12">
              <Stethoscope className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sin consultas registradas</h3>
              <p className="text-gray-500 mb-6">Registra la primera consulta para comenzar el seguimiento del paciente</p>
              <button
                onClick={() => setShowConsultationForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Registrar Primera Consulta
              </button>
            </div>
          ) : (
            <>
              {/* Latest Consultation Summary */}
              {latestConsultation && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-blue-900">Última Consulta</h3>
                    <span className="text-sm text-blue-600">
                      {new Date(latestConsultation.fecha_consulta).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-blue-600">Peso</div>
                      <div className="font-semibold text-blue-900">{latestConsultation.peso} kg</div>
                      {patient.peso !== latestConsultation.peso && (
                        <div className={`text-xs flex items-center ${latestConsultation.peso > patient.peso ? 'text-red-600' : 'text-green-600'}`}>
                          <TrendingUp className={`h-3 w-3 mr-1 ${latestConsultation.peso > patient.peso ? 'rotate-180' : ''}`} />
                          {latestConsultation.peso > patient.peso ? '+' : ''}{(latestConsultation.peso - patient.peso).toFixed(1)} kg
                        </div>
                      )}
                    </div>
                    {latestConsultation.masa_muscular && (
                      <div>
                        <div className="text-sm text-blue-600">Masa Muscular</div>
                        <div className="font-semibold text-blue-900">{latestConsultation.masa_muscular}%</div>
                      </div>
                    )}
                    {latestConsultation.grasa_corporal && (
                      <div>
                        <div className="text-sm text-blue-600">Grasa Corporal</div>
                        <div className="font-semibold text-blue-900">{latestConsultation.grasa_corporal}%</div>
                      </div>
                    )}
                    {latestConsultation.metabolismo_basal && (
                      <div>
                        <div className="text-sm text-blue-600">Metabolismo Basal</div>
                        <div className="font-semibold text-blue-900">{latestConsultation.metabolismo_basal} kcal</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Consultations List */}
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded mb-4"></div>
                      <div className="h-20 bg-gray-200 rounded mb-4"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                    <p className="text-gray-500 mt-4">Cargando historial de consultas...</p>
                  </div>
                ) : consultations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay consultas registradas</p>
                    <p className="text-sm">Haz clic en "Nueva Consulta" para agregar la primera consulta</p>
                  </div>
                ) : (
                  consultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    onClick={() => setSelectedConsultation(consultation)}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Consulta del {new Date(consultation.fecha_consulta).toLocaleDateString('es-ES')}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(consultation.created_at).toLocaleString('es-ES')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Peso</div>
                        <div className="font-semibold text-gray-900">{consultation.peso} kg</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {consultation.masa_muscular && (
                        <div>
                          <span className="text-gray-500">Masa Muscular: </span>
                          <span className="font-medium">{consultation.masa_muscular}%</span>
                        </div>
                      )}
                      {consultation.grasa_corporal && (
                        <div>
                          <span className="text-gray-500">Grasa: </span>
                          <span className="font-medium">{consultation.grasa_corporal}%</span>
                        </div>
                      )}
                      {consultation.presion_arterial_sistolica && consultation.presion_arterial_diastolica && (
                        <div>
                          <span className="text-gray-500">Presión: </span>
                          <span className="font-medium">{consultation.presion_arterial_sistolica}/{consultation.presion_arterial_diastolica}</span>
                        </div>
                      )}
                      {consultation.frecuencia_cardiaca && (
                        <div>
                          <span className="text-gray-500">FC: </span>
                          <span className="font-medium">{consultation.frecuencia_cardiaca} bpm</span>
                        </div>
                      )}
                    </div>
                    
                    {consultation.notas_consulta && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700 line-clamp-2">{consultation.notas_consulta}</p>
                      </div>
                    )}
                  </div>
                ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Documentos Generales</h2>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Subir Documento
          </button>
        </div>

        <div className="p-6">
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sin documentos</h3>
              <p className="text-gray-500 mb-6">No hay documentos subidos para este paciente</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Subir Primer Documento
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <FileText className="h-6 w-6 text-blue-500" />
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-1">{doc.nombre}</h4>
                  <p className="text-sm text-gray-500 mb-2">{documentTypes[doc.tipo as keyof typeof documentTypes]}</p>
                  
                  {doc.descripcion && (
                    <p className="text-sm text-gray-600 mb-3">{doc.descripcion}</p>
                  )}
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{new Date(doc.created_at).toLocaleDateString('es-ES')}</span>
                    <button className="text-blue-500 hover:text-blue-700 transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Subir Documento</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Documento *
                </label>
                <input
                  type="text"
                  value={uploadData.nombre}
                  onChange={(e) => setUploadData({ ...uploadData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ej: Análisis de sangre enero 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Documento *
                </label>
                <select
                  value={uploadData.tipo}
                  onChange={(e) => setUploadData({ ...uploadData, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="analisis">Análisis Clínico</option>
                  <option value="radiografia">Radiografía</option>
                  <option value="receta">Receta Médica</option>
                  <option value="informe">Informe Médico</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={uploadData.descripcion}
                  onChange={(e) => setUploadData({ ...uploadData, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Descripción opcional del documento..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivo *
                </label>
                <input
                  type="file"
                  onChange={(e) => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUploadDocument}
                disabled={!uploadData.nombre || !uploadData.file}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Subir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}