/**
 * NAKKO Platform - Client Domain Service
 */

import { AuthService } from '../auth/auth.service.js';
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

  static async getClientPayments(clientId) {
    // Collect transactions/payments associated with this client
    const userBookings = memoryBookings.filter(b => String(b.userId) === String(clientId));
    
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

