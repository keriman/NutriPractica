import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './database/postgres-connection';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRouter from './routes/auth';
import patientsRouter from './routes/patients';
import ingredientsRouter from './routes/ingredients';
import consultationsRouter from './routes/consultations';
import dashboardRouter from './routes/dashboard';
import recipesRouter from './routes/recipes';
import documentsRouter from './routes/documents';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176', // Vite dev server ports
  process.env.FRONTEND_URL, // URL del frontend en Render
  'https://keriman.github.io', // GitHub Pages fallback
  'https://nutripractica.onrender.com' // Render Static Site URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/ingredients', ingredientsRouter);
app.use('/api/consultations', consultationsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/documents', documentsRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔄 Initializing database...');
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
      console.log('📋 Available routes:');
      console.log('  - POST /api/auth/register');
      console.log('  - POST /api/auth/login');
      console.log('  - GET  /api/auth/me');
      console.log('  - PUT  /api/auth/profile');
      console.log('  - PUT  /api/auth/change-password');
      console.log('  - POST /api/auth/logout');
      console.log('  - GET  /api/patients');
      console.log('  - POST /api/patients');
      console.log('  - GET  /api/consultations/:id');
      console.log('  - POST /api/consultations');
      console.log('  - GET  /api/ingredients');
      console.log('  - POST /api/ingredients');
      console.log('  - GET  /api/recipes');
      console.log('  - POST /api/recipes/generate (AI)');
      console.log('  - GET  /api/dashboard/stats');
      console.log('  - GET  /api/dashboard/recent-patients');
      console.log('  - GET  /api/dashboard/recent-activity');
      console.log('  - GET  /api/dashboard/monthly-stats');
      console.log('  - POST /api/documents');
      console.log('  - GET  /api/documents/:id');
      console.log('  - DELETE /api/documents/:id');
      console.log('  - GET  /api/documents/download/:id');
      console.log('  - GET  /api/patients/:id/documents');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);

    if ((error as any).code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 MySQL connection failed. Please check your database credentials in .env file');
      console.error('💡 Default settings: host=localhost, user=root, password=(empty), port=3306');
    } else if ((error as any).code === 'ECONNREFUSED') {
      console.error('💡 Cannot connect to MySQL. Please make sure MySQL server is running');
      console.error('💡 You can start MySQL with: brew services start mysql (macOS) or systemctl start mysql (Linux)');
    }

    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Shutting down server gracefully...');
  process.exit(0);
});

startServer();