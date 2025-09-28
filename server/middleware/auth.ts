import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    especialidad?: string;
  };
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    // Verify token
    const decoded = authService.verifyToken(token);

    // Get user from database
    const user = await authService.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = authService.verifyToken(token);
        const user = await authService.getUserById(decoded.userId);
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid, but continue without user
        console.warn('Invalid token in optional auth:', error);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};