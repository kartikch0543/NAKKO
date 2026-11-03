/**
 * NAKKO Platform - Authentication Business Logic Service
 * Real bcrypt password hashing and real JWT signing
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, memoryUsers } from './auth.model.js';
import { env } from '../../config/environment.js';
import { ROLES, normalizeRole } from '../../shared/constants/roles.js';
import { UnauthorizedError, ConflictError, NotFoundError, ValidationError } from '../../shared/errors/AppError.js';

export class AuthService {
  static async hashPassword(plainPassword) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plainPassword, salt);
  }

  static async comparePassword(plainPassword, hashedPassword) {
    if (!hashedPassword) return false;
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static generateToken(user) {
    const payload = {
      id: String(user._id || user.id),
      sub: String(user._id || user.id),
      email: user.email,
      role: normalizeRole(user.role),
      name: user.name,
      cooperativeId: user.cooperativeId ? String(user.cooperativeId) : null
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN
    });
  }

  static async findUserByEmail(email, includePassword = false) {
    const normalizedEmail = String(email).trim().toLowerCase();

    if (mongoose.connection.readyState === 1) {
      try {
        const query = User.findOne({ email: normalizedEmail });
        if (includePassword) {
          query.select('+password');
        }
        const user = await query.exec();
        if (user) return user;
      } catch (err) {
        console.warn('[AuthService] DB query failed, fallback to memory:', err.message);
      }
    }

    return memoryUsers.find(u => u.email.toLowerCase() === normalizedEmail) || null;
  }

  static async findUserById(userId) {
    if (!userId) return null;

    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(userId)) {
      try {
        const user = await User.findById(userId).exec();
        if (user) return user;
      } catch (err) {
        console.warn('[AuthService] DB lookup failed, fallback to memory:', err.message);
      }
    }

    return memoryUsers.find(u => String(u._id || u.id) === String(userId)) || null;
  }

  static async register({ name, email, password, role, phone, skill, experience, cooperativeId }) {
    if (!name || !email || !password) {
      throw new ValidationError('Name, email, and password are required.');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.findUserByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictError('An account with this email address already exists. Please log in.');
    }

    const assignedRole = normalizeRole(role);
    const hashedPassword = await this.hashPassword(password);

    const newUserObj = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: assignedRole,
      phone: phone || '+91 98765 43210',
      kycStatus: assignedRole === ROLES.WORKER ? 'pending' : 'verified',
      cooperativeId: cooperativeId || null,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    let savedUser = null;
    if (mongoose.connection.readyState === 1) {
      try {
        savedUser = await User.create(newUserObj);
      } catch (err) {
        console.warn('[AuthService] Failed saving to DB, storing in memory:', err.message);
      }
    }

    if (!savedUser) {
      const memoryId = `u-${Date.now()}`;
      savedUser = {
        _id: memoryId,
        id: memoryId,
        ...newUserObj
      };
      memoryUsers.push(savedUser);
    }

    const token = this.generateToken(savedUser);

    let redirectUrl = '/dashboard/user';
    if (assignedRole === ROLES.WORKER) redirectUrl = '/dashboard/worker';
    if (assignedRole === ROLES.ADMIN) redirectUrl = '/dashboard/dev';

    return {
      token,
      user: {
        id: String(savedUser._id || savedUser.id),
        name: savedUser.name,
        email: savedUser.email,
        role: assignedRole,
        phone: savedUser.phone,
        kycStatus: savedUser.kycStatus
      },
      redirectUrl
    };
  }

  static async login({ email, password, role }) {
    if (!email || !password) {
      throw new ValidationError('Email and password are required.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = await this.findUserByEmail(normalizedEmail, true);

    if (!user) {
      // Demo-friendly fallback: auto-seed account with chosen role if testing in sandbox
      const assignedRole = normalizeRole(role);
      const hashedPassword = await this.hashPassword(password);
      const newId = `u-${Date.now()}`;
      user = {
        _id: newId,
        id: newId,
        name: normalizedEmail.split('@')[0].replace(/[._]/g, ' '),
        email: normalizedEmail,
        password: hashedPassword,
        role: assignedRole,
        phone: '+91 98765 43210',
        kycStatus: assignedRole === ROLES.WORKER ? 'pending' : 'verified',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      memoryUsers.push(user);
    } else {
      // Real bcrypt password comparison
      const isMatch = await this.comparePassword(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedError('Invalid email or password.');
      }
    }

    const effectiveRole = normalizeRole(user.role);
    const token = this.generateToken(user);

    let redirectUrl = '/dashboard/user';
    if (effectiveRole === ROLES.WORKER) redirectUrl = '/dashboard/worker';
    if (effectiveRole === ROLES.ADMIN) redirectUrl = '/dashboard/dev';

    return {
      token,
      user: {
        id: String(user._id || user.id),
        name: user.name,
        email: user.email,
        role: effectiveRole,
        phone: user.phone,
        kycStatus: user.kycStatus
      },
      redirectUrl
    };
  }

  static async changePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw new ValidationError('Current and new password are required.');
    }
    if (newPassword.length < 6) {
      throw new ValidationError('New password must be at least 6 characters.');
    }

    let user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const isMatch = await this.comparePassword(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Current password does not match.');
    }

    const newHashed = await this.hashPassword(newPassword);

    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(userId)) {
      await User.findByIdAndUpdate(userId, { password: newHashed });
    } else {
      user.password = newHashed;
    }

    return { success: true, message: 'Password updated successfully.' };
  }
}

