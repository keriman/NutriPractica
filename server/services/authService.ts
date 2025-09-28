import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../database/postgres-connection';

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  especialidad?: string;
  created_at: Date;
}

export interface CreateUserData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  especialidad?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  private readonly SALT_ROUNDS = 12;

  async register(userData: CreateUserData): Promise<AuthResponse> {
    const client = await pool.connect();

    try {
      // Check if user already exists
      const existingUsers = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [userData.email]
      );

      if (existingUsers.rows.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, this.SALT_ROUNDS);

      // Create user
      const result = await client.query(
        `INSERT INTO users (nombre, apellido, email, password_hash, telefono, especialidad)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, nombre, apellido, email, telefono, especialidad, created_at`,
        [
          userData.nombre,
          userData.apellido,
          userData.email,
          hashedPassword,
          userData.telefono || null,
          userData.especialidad || null
        ]
      );

      const newUser = result.rows[0];

      // Generate JWT token
      const token = this.generateToken(newUser.id);

      return {
        user: {
          id: newUser.id,
          nombre: newUser.nombre,
          apellido: newUser.apellido,
          email: newUser.email,
          telefono: newUser.telefono,
          especialidad: newUser.especialidad,
          created_at: newUser.created_at
        },
        token
      };

    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async login(loginData: LoginData): Promise<AuthResponse> {
    const client = await pool.connect();

    try {
      // Get user by email
      const result = await client.query(
        'SELECT id, nombre, apellido, email, password_hash, telefono, especialidad, created_at FROM users WHERE email = $1',
        [loginData.email]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = result.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(loginData.password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = this.generateToken(user.id);

      return {
        user: {
          id: user.id,
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          telefono: user.telefono,
          especialidad: user.especialidad,
          created_at: user.created_at
        },
        token
      };

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getUserById(id: string): Promise<User | null> {
    const client = await pool.connect();

    try {
      const result = await client.query(
        'SELECT id, nombre, apellido, email, telefono, especialidad, created_at FROM users WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];

    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async updateProfile(id: string, updates: Partial<CreateUserData>): Promise<User> {
    const client = await pool.connect();

    try {
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramCount = 1;

      if (updates.nombre !== undefined) {
        updateFields.push(`nombre = $${paramCount++}`);
        values.push(updates.nombre);
      }
      if (updates.apellido !== undefined) {
        updateFields.push(`apellido = $${paramCount++}`);
        values.push(updates.apellido);
      }
      if (updates.telefono !== undefined) {
        updateFields.push(`telefono = $${paramCount++}`);
        values.push(updates.telefono);
      }
      if (updates.especialidad !== undefined) {
        updateFields.push(`especialidad = $${paramCount++}`);
        values.push(updates.especialidad);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `
        UPDATE users
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, nombre, apellido, email, telefono, especialidad, created_at
      `;

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return result.rows[0];

    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const client = await pool.connect();

    try {
      // Get current password hash
      const result = await client.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0];

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

      // Update password
      await client.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [hashedNewPassword, id]
      );

    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  private generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );
  }

  verifyToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string };
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  extractTokenFromHeader(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header');
    }

    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }
}

export const authService = new AuthService();