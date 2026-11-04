/**
 * NAKKO Platform - Client Domain Service
 */

import mongoose from 'mongoose';
import { AuthService } from '../auth/auth.service.js';
import { User } from '../auth/auth.model.js';
import { memoryBookings } from '../bookings/booking.model.js';
import { NotFoundError } from '../../shared/errors/AppError.js';

export class ClientService {
  static async getClientProfile(clientId) {
    const user = await AuthService.findUserById(clientId);
    if (!user) {
      throw new NotFoundError('Client profile not found.');
    }
    return user;
  }

  static async updateClientProfile(clientId, { name, phone, address }) {
    const user = await AuthService.findUserById(clientId);
    if (!user) {
      throw new NotFoundError('Client profile not found.');
    }
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(clientId)) {
      try {
        await User.findByIdAndUpdate(clientId, {
          name: user.name,
          phone: user.phone,
          address: user.address
        });
      } catch (e) {
        console.warn('[ClientService] DB profile update failed, kept in memory:', e.message);
      }
    }
    return user;
  }

  static async getClientPayments(clientId) {
    // Collect transactions/payments associated with this client
    const userBookings = memoryBookings.filter(b => String(b.userId || b.clientId) === String(clientId));
    
    return userBookings.map((b, idx) => ({
      transactionId: `TXN-${1000 + idx}`,
      bookingId: b.id,
      service: b.service,
      amount: b.amount || 350,
      status: b.status === 'completed' ? 'Paid & Settled' : (b.status === 'cancelled' ? 'Refunded' : 'Escrow Hold'),
      date: b.date || 'Recent',
      method: 'UPI / Escrow'
    }));
  }
}
