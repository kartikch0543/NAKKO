/**
 * NAKKO Platform - Unit Test: Tamper-Proof Atomic State Execution Protocol
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { StateManager } from '../../src/core/transactionProtocol/stateManager.js';
import { SettlementService } from '../../src/core/transactionProtocol/settlementService.js';
import { RecoveryService } from '../../src/core/transactionProtocol/recoveryService.js';
import { AuditService } from '../../src/core/transactionProtocol/auditService.js';
import { TRANSACTION_STATE } from '../../src/shared/constants/status.js';

describe('Transaction Protocol & State Machine Tests', () => {
  test('StateManager should allow valid Saga state transitions', () => {
    assert.doesNotThrow(() => {
      StateManager.validateTransition(TRANSACTION_STATE.INITIATED, TRANSACTION_STATE.ESCROW_HOLD);
      StateManager.validateTransition(TRANSACTION_STATE.ESCROW_HOLD, TRANSACTION_STATE.MATCHED);
      StateManager.validateTransition(TRANSACTION_STATE.MATCHED, TRANSACTION_STATE.ACCEPTED);
      StateManager.validateTransition(TRANSACTION_STATE.ACCEPTED, TRANSACTION_STATE.IN_PROGRESS);
      StateManager.validateTransition(TRANSACTION_STATE.IN_PROGRESS, TRANSACTION_STATE.COMPLETED);
      StateManager.validateTransition(TRANSACTION_STATE.COMPLETED, TRANSACTION_STATE.SETTLED);
    });
  });

  test('StateManager should reject illegal state jumps with StateTransitionError', () => {
    assert.throws(
      () => {
        // Cannot jump directly from INITIATED to SETTLED without escrow & completion
        StateManager.validateTransition(TRANSACTION_STATE.INITIATED, TRANSACTION_STATE.SETTLED);
      },
      { name: 'StateTransitionError' }
    );
  });

  test('SettlementService should correctly compute 90/5/5 cooperative split', async () => {
    const grossAmount = 500;
    const settlement = await SettlementService.settleTransaction({
      transactionId: 'TXN-TEST-1',
      bookingId: 'NK-0099',
      grossAmount,
      workerId: 'w-101',
      cooperativeId: 'coop-1'
    });

    assert.equal(settlement.status, TRANSACTION_STATE.SETTLED);
    assert.equal(settlement.splits.workerPayout, 450.0); // 90%
    assert.equal(settlement.splits.cooperativeWelfare, 25.0); // 5%
    assert.equal(settlement.splits.platformFee, 25.0); // 5%
  });

  test('RecoveryService should issue compensating refund on cancellation', async () => {
    const refund = await RecoveryService.executeRefund({
      transactionId: 'TXN-REFUND-1',
      bookingId: 'NK-0088',
      currentState: TRANSACTION_STATE.ESCROW_HOLD,
      amount: 450,
      reason: 'Client requested cancellation prior to worker dispatch'
    });

    assert.equal(refund.status, TRANSACTION_STATE.REFUNDED);
    assert.equal(refund.refundedAmount, 450);

    const logs = AuditService.getAuditLogs({ transactionId: 'TXN-REFUND-1' });
    assert.ok(logs.length > 0);
    assert.equal(logs[0].toState, TRANSACTION_STATE.REFUNDED);
  });
});

