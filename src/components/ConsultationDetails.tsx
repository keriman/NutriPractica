import { useState } from 'react';
import { ArrowLeft, CreditCard as Edit, Upload, FileText, Download, Trash2, Weight, Activity, Heart } from 'lucide-react';
import { Patient, Consultation, Document } from '../types';
import { ConsultationForm } from './ConsultationForm';

interface ConsultationDetailsProps {
  consultation: Consultation;
  patient: Patient;
  onBack: () => void;
  onUpdate: (consultation: Consultation) => void;
}

export function ConsultationDetails({ consultation, patient, onBack, onUpdate }: ConsultationDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    nombre: '',
    tipo: 'analisis',
    descripcion: '',
    file: null as File | null
  });

  const handleUploadDocument = () => {
    if (!uploadData.nombre || !uploadData.file) return;

    const newDocument: Document = {
      id: crypto.randomUUID(),
      patient_id: patient.id,
      consultation_id: consultation.id,
      nombre: uploadData.nombre,
      tipo: uploadData.tipo,
      url: URL.createObjectURL(uploadData.file),
      descripcion: uploadData.descripcion,
      created_at: new Date().toISOString()
    };

    setDocuments([...documents, newDocument]);
    setUploadData({ nombre: '', tipo: 'analisis', descripcion: '', file: null });
    setShowUploadModal(false);
  };

  const deleteDocument = (documentId: string) => {
    setDocuments(documents.filter(doc => doc.id !== documentId));
  };

  const documentTypes = {
    analisis: 'Análisis Clínico',
    radiografia: 'Radiografía',
    receta: 'Receta Médica',
    informe: 'Informe Médico',
    foto_progreso: 'Foto de Progreso',
    bioimpedancia: 'Bioimpedancia',
    otro: 'Otro'
  };


  const getComparisonText = (current: number, previous: number, unit: string = '') => {
    const diff = current - previous;
    if (diff === 0) return null;
    const color = diff > 0 ? 'text-red-600' : 'text-green-600';
    const sign = diff > 0 ? '+' : '';
    return (
      <span className={`text-sm ${color}`}>
        {sign}{diff.toFixed(1)}{unit}
      </span>
    );
  };

  if (isEditing) {
    return (
      <ConsultationForm
        patient={patient}
        consultation={consultation}
        onSave={(updatedConsultation) => {
          onUpdate(updatedConsultation);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Paciente
        </button>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar Consulta
        </button>
      </div>

      {/* Consultation Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Consulta del {new Date(consultation.fecha_consulta).toLocaleDateString('es-ES')}
            </h1>
            <p className="text-gray-600">
              {patient.nombre} {patient.apellido}
            </p>
            <p className="text-sm text-gray-500">
              Registrada: {new Date(consultation.created_at).toLocaleString('es-ES')}
            </p>
          </div>
          {consultation.proxima_cita && (
            <div className="text-right">
              <div className="text-sm text-gray-500">Próxima Cita</div>
              <div className="font-medium text-blue-600">
                {new Date(consultation.proxima_cita).toLocaleDateString('es-ES')}
              </div>
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <Weight className="h-8 w-8 text-blue-600" />
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">{consultation.peso} kg</div>
                <div className="text-sm text-blue-600">Peso</div>
                {getComparisonText(consultation.peso, patient.peso, ' kg')}
              </div>
            </div>
          </div>

          {consultation.masa_muscular && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <Activity className="h-8 w-8 text-green-600" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-900">{consultation.masa_muscular}%</div>
                  <div className="text-sm text-green-600">Masa Muscular</div>
                </div>
              </div>
            </div>
          )}

          {consultation.grasa_corporal && (
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <Activity className="h-8 w-8 text-orange-600" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-900">{consultation.grasa_corporal}%</div>
                  <div className="text-sm text-orange-600">Grasa Corporal</div>
                </div>
              </div>
            </div>
          )}

          {consultation.metabolismo_basal && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <Activity className="h-8 w-8 text-purple-600" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-900">{consultation.metabolismo_basal}</div>
                  <div className="text-sm text-purple-600">Metabolismo Basal</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Body Composition Details */}
        {(consultation.agua_corporal || consultation.masa_osea) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Composición Corporal Detallada</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {consultation.agua_corporal && (
                <div className="text-center p-3 bg-blue-50 rounded-md">
                  <div className="font-semibold text-blue-900">{consultation.agua_corporal}%</div>
                  <div className="text-sm text-blue-600">Agua Corporal</div>
                </div>
              )}
              {consultation.masa_osea && (
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <div className="font-semibold text-gray-900">{consultation.masa_osea} kg</div>
                  <div className="text-sm text-gray-600">Masa Ósea</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vital Signs */}
        {(consultation.presion_arterial_sistolica || consultation.frecuencia_cardiaca || consultation.temperatura) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-600" />
              Signos Vitales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {consultation.presion_arterial_sistolica && consultation.presion_arterial_diastolica && (
                <div className="text-center p-3 bg-red-50 rounded-md">
                  <div className="font-semibold text-red-900">
                    {consultation.presion_arterial_sistolica}/{consultation.presion_arterial_diastolica}
                  </div>
                  <div className="text-sm text-red-600">Presión Arterial (mmHg)</div>
                </div>
              )}
              {consultation.frecuencia_cardiaca && (
                <div className="text-center p-3 bg-pink-50 rounded-md">
                  <div className="font-semibold text-pink-900">{consultation.frecuencia_cardiaca} bpm</div>
                  <div className="text-sm text-pink-600">Frecuencia Cardíaca</div>
                </div>
              )}
              {consultation.temperatura && (
                <div className="text-center p-3 bg-yellow-50 rounded-md">
                  <div className="font-semibold text-yellow-900">{consultation.temperatura}°C</div>
                  <div className="text-sm text-yellow-600">Temperatura</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas de la Consulta</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-gray-700 whitespace-pre-wrap">{consultation.notas_consulta}</p>
          </div>
        </div>

        {/* Nutritional Plan */}
        {consultation.plan_nutricional && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Plan Nutricional</h3>
            <div className="bg-green-50 p-4 rounded-md">
              <p className="text-green-800 whitespace-pre-wrap">{consultation.plan_nutricional}</p>
            </div>
          </div>
        )}
      </div>

      {/* Documents Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Documentos de la Consulta</h2>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
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
              <p className="text-gray-500 mb-6">No hay documentos subidos para esta consulta</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
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

      {/* Upload Modal */}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Bioimpedancia enero 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Documento *
                </label>
                <select
                  value={uploadData.tipo}
                  onChange={(e) => setUploadData({ ...uploadData, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="analisis">Análisis Clínico</option>
                  <option value="bioimpedancia">Bioimpedancia</option>
                  <option value="foto_progreso">Foto de Progreso</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.mp4,.mov,.avi"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos soportados: PDF, imágenes (JPG, PNG), documentos (DOC, DOCX), videos (MP4, MOV, AVI)
                </p>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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