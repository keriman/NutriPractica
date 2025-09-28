import express from 'express';
import { authService } from '../services/authService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { nombre, apellido, email, password, telefono, especialidad } = req.body;

    // Basic validation
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({
        error: 'Campos requeridos: nombre, apellido, email, password'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const result = await authService.register({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.toLowerCase().trim(),
      password,
      telefono: telefono?.trim(),
      especialidad: especialidad?.trim()
    });

    res.status(201).json(result);

  } catch (error) {
    console.error('Registration error:', error);

    if ((error as Error).message.includes('ya está registrado')) {
      return res.status(409).json({ error: (error as Error).message });
    }

    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y contraseña son requeridos'
      });
    }

    const result = await authService.login({
      email: email.toLowerCase().trim(),
      password
    });

    res.json(result);

  } catch (error) {
    console.error('Login error:', error);

    if ((error as Error).message.includes('Credenciales inválidas')) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Error al obtener información del usuario' });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { nombre, apellido, email, telefono, especialidad } = req.body;
    const userId = req.user!.id;

    const updates: any = {};

    if (nombre !== undefined) updates.nombre = nombre.trim();
    if (apellido !== undefined) updates.apellido = apellido.trim();
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Email inválido' });
      }
      updates.email = email.toLowerCase().trim();
    }
    if (telefono !== undefined) updates.telefono = telefono?.trim();
    if (especialidad !== undefined) updates.especialidad = especialidad?.trim();

    const updatedUser = await authService.updateProfile(userId, updates);
    res.json({ user: updatedUser });

  } catch (error) {
    console.error('Update profile error:', error);

    if ((error as Error).message.includes('No hay campos')) {
      return res.status(400).json({ error: (error as Error).message });
    }

    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

// PUT /api/auth/change-password - Change user password
router.put('/change-password', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Contraseña actual y nueva contraseña son requeridas'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    await authService.changePassword(userId, currentPassword, newPassword);
    res.json({ message: 'Contraseña actualizada exitosamente' });

  } catch (error) {
    console.error('Change password error:', error);

    if ((error as Error).message.includes('incorrecta')) {
      return res.status(400).json({ error: (error as Error).message });
    }

    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
});

// POST /api/auth/logout - Logout user (client-side token removal)
router.post('/logout', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // Since we're using stateless JWT tokens, logout is handled client-side
    // by removing the token from storage
    res.json({ message: 'Sesión cerrada exitosamente' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
});

export default router;