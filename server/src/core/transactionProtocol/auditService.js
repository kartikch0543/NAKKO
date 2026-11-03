/**
 * NAKKO Platform - Transaction Audit Service
 * Maintains an immutable append-only ledger of state transitions and actor actions
 */

import mongoose from 'mongoose';

const auditEntrySchema = new mongoose.Schema({
  transactionId: { type: String, required: true, index: true },
  bookingId: { type: String, required: true, index: true },
  fromState: { type: String, required: true },
  toState: { type: String, required: true },
  actorId: { type: String, default: 'SYSTEM' },
  actorRole: { type: String, default: 'SYSTEM' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now }
});

export const AuditEntry = mongoose.models.AuditEntry || mongoose.model('AuditEntry', auditEntrySchema);

// In-memory audit stream
export const memoryAuditLogs = [];

export class AuditService {
  /**
   * Records an immutable transition entry in the audit ledger
   */
  static async logTransition({
    transactionId,
    bookingId,
    fromState,
    toState,
    actorId = 'SYSTEM',
    actorRole = 'SYSTEM',
    metadata = {}
  }) {
    const entry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      transactionId,
      bookingId,
      fromState,
      toState,
      actorId,
      actorRole,
      metadata,
      timestamp: new Date().toISOString()
    };

    if (mongoose.connection.readyState === 1) {
      try {
        await AuditEntry.create({
          transactionId,
          bookingId,
          fromState,
          toState,
          actorId,
          actorRole,
          metadata
        });
      } catch (err) {
        console.warn('[AuditService] Failed persisting audit to DB, saved to memory:', err.message);
      }
    }

    memoryAuditLogs.unshift(entry);
    return entry;
  }

  static getAuditLogs({ bookingId, transactionId, limit = 50 } = {}) {
    let logs = [...memoryAuditLogs];
    if (bookingId) {
      logs = logs.filter(l => l.bookingId === bookingId);
    }
    if (transactionId) {
      logs = logs.filter(l => l.transactionId === transactionId);
    }
    return logs.slice(0, limit);
  }
}

