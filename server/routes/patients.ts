import express from 'express';
import { postgresService } from '../services/postgresService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/patients - Get all patients
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const patients = await postgresService.getPatientsByUserId(userId);
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// GET /api/patients/:id - Get patient by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const patient = await postgresService.getPatientById(id);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// POST /api/patients - Create new patient
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const patientData = req.body;
    const userId = req.user!.id;

    // Basic validation
    if (!patientData.nombre || !patientData.apellido || !patientData.email) {
      return res.status(400).json({ error: 'Missing required fields: nombre, apellido, email' });
    }

    const patient = await postgresService.createPatient({ ...patientData, user_id: userId });
    res.status(201).json(patient);
  } catch (error) {
    console.error('Error creating patient:', error);

    // Check for duplicate email error
    if ((error as any).code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A patient with this email already exists' });
    }

    res.status(500).json({ error: 'Failed to create patient' });
  }
});

// PUT /api/patients/:id - Update patient
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user!.id;

    const patient = await postgresService.updatePatient(id, updates);
    res.json(patient);
  } catch (error) {
    console.error('Error updating patient:', error);

    if ((error as Error).message.includes('not found')) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// DELETE /api/patients/:id - Delete patient
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const deleted = await postgresService.deletePatient(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

// GET /api/patients/:id/consultations - Get patient consultations
router.get('/:id/consultations', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const consultations = await postgresService.getConsultationsByPatientId(id);
    res.json(consultations);
  } catch (error) {
    console.error('Error fetching patient consultations:', error);
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

// GET /api/patients/:id/documents - Get patient documents
router.get('/:id/documents', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const documents = await postgresService.getPatientDocuments(id);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching patient documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

export default router;