import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { mysqlService } from '../services/mysqlService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp_originalname
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten: PDF, JPG, PNG, DOC, DOCX, TXT'));
    }
  }
});

// POST /api/documents - Upload new document
router.post('/', authenticateToken, upload.single('file'), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { patient_id, consultation_id, nombre, tipo, descripcion } = req.body;

    // Basic validation
    if (!patient_id || !nombre || !tipo) {
      return res.status(400).json({ error: 'Missing required fields: patient_id, nombre, tipo' });
    }

    // Create document record in database
    const documentData = {
      patient_id,
      consultation_id: consultation_id || null,
      nombre,
      tipo,
      url: `/uploads/${req.file.filename}`, // Store relative path
      descripcion: descripcion || null,
    };

    const document = await mysqlService.createDocument(documentData);
    res.status(201).json(document);
  } catch (error) {
    console.error('Error creating document:', error);

    // Clean up uploaded file if database insertion fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if ((error as Error).message.includes('no permitido')) {
      return res.status(400).json({ error: (error as Error).message });
    }

    res.status(500).json({ error: 'Failed to create document' });
  }
});

// GET /api/documents/:id - Get document by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const document = await mysqlService.getDocument(id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// DELETE /api/documents/:id - Delete document
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get document to find file path
    const document = await mysqlService.getDocument(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete from database
    const deleted = await mysqlService.deleteDocument(id);

    if (deleted) {
      // Delete physical file
      const filePath = path.join(__dirname, '..', document.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Document not found' });
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// GET /api/documents/download/:id - Download document file
router.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const document = await mysqlService.getDocument(id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const filePath = path.join(__dirname, '..', document.url);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set appropriate headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${document.nombre}"`);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

export default router;