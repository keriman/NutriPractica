import express from 'express';
import { mysqlService } from '../services/mysqlService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const stats = await mysqlService.getDashboardStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// GET /api/dashboard/recent-patients - Get recent patients
router.get('/recent-patients', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { limit } = req.query;
    const limitNumber = limit ? parseInt(limit as string, 10) : 5;
    const userId = req.user!.id;

    const patients = await mysqlService.getRecentPatients(limitNumber, userId);
    res.json(patients);
  } catch (error) {
    console.error('Error fetching recent patients:', error);
    res.status(500).json({ error: 'Failed to fetch recent patients' });
  }
});

// GET /api/dashboard/recent-activity - Get recent activity feed
router.get('/recent-activity', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { limit } = req.query;
    const limitNumber = limit ? parseInt(limit as string, 10) : 10;
    const userId = req.user!.id;

    const activities = await mysqlService.getRecentActivity(limitNumber, userId);
    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

// GET /api/dashboard/monthly-stats - Get monthly statistics for charts
router.get('/monthly-stats', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { months } = req.query;
    const monthsNumber = months ? parseInt(months as string, 10) : 6;
    const userId = req.user!.id;

    const stats = await mysqlService.getMonthlyStats(monthsNumber, userId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    res.status(500).json({ error: 'Failed to fetch monthly statistics' });
  }
});

export default router;