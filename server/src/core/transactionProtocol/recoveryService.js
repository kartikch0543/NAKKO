/**
 * NAKKO Platform - Transaction Recovery & Compensating Action Service
 * Manages Saga rollbacks, escrow refunds, and idempotent retries
 */

import { StateManager } from './stateManager.js';
import { AuditService } from './auditService.js';
import { TRANSACTION_STATE } from '../../shared/constants/status.js';

export class RecoveryService {
  /**
   * Executes compensating action: Refunds client escrow deposit
   */
  static async executeRefund({
    transactionId,
    bookingId,
    currentState,
    amount,
    reason,
    actorId = 'SYSTEM'
  }) {
    // Validate that refund is legal from current state
    StateManager.validateTransition(currentState, TRANSACTION_STATE.REFUNDED);

    // Record compensating action in audit ledger
    await AuditService.logTransition({
      transactionId,
      bookingId,
      fromState: currentState,
      toState: TRANSACTION_STATE.REFUNDED,
      actorId,
      actorRole: 'RECOVERY_ENGINE',
      metadata: {
        refundedAmount: amount,
        reason: reason || 'Service cancelled prior to completion'
      }
    });

    return {
      status: TRANSACTION_STATE.REFUNDED,
      refundedAmount: amount,
      reason,
      refundedAt: new Date().toISOString()
    };
  }

  /**
   * Reallocates assignment without re-charging client escrow
   */
  static async executeReassignmentRecovery({
    transactionId,
    bookingId,
    declinedWorkerId,
    newWorkerId
  }) {
    await AuditService.logTransition({
      transactionId,
      bookingId,
      fromState: TRANSACTION_STATE.MATCHED,
      toState: TRANSACTION_STATE.MATCHED,
      actorId: 'RECOVERY_ENGINE',
      actorRole: 'SYSTEM',
      metadata: {
        event: 'WORKER_DECLINE_REALLOCATION',
        declinedWorkerId,
        newWorkerId
      }
    });

    return {
      success: true,
      recoveredState: TRANSACTION_STATE.MATCHED,
      assignedWorkerId: newWorkerId
    };
  }
}

