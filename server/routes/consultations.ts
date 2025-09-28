import express from 'express';
import { mysqlService } from '../services/mysqlService';

const router = express.Router();

// GET /api/consultations/:id - Get consultation by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await mysqlService.getConsultation(id);

    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    res.json(consultation);
  } catch (error) {
    console.error('Error fetching consultation:', error);
    res.status(500).json({ error: 'Failed to fetch consultation' });
  }
});

// POST /api/consultations - Create new consultation
router.post('/', async (req, res) => {
  try {
    const consultationData = req.body;

    // Basic validation
    if (!consultationData.patient_id || !consultationData.fecha_consulta || !consultationData.peso) {
      return res.status(400).json({ error: 'Missing required fields: patient_id, fecha_consulta, peso' });
    }

    const consultation = await mysqlService.createConsultation(consultationData);
    res.status(201).json(consultation);
  } catch (error) {
    console.error('Error creating consultation:', error);
    res.status(500).json({ error: 'Failed to create consultation' });
  }
});

export default router;