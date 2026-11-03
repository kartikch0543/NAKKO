/**
 * NAKKO Platform - Tamper-Proof Atomic State Execution Protocol
 * State Machine & Transition Guard
 */

import { TRANSACTION_STATE } from '../../shared/constants/status.js';
import { StateTransitionError } from '../../shared/errors/AppError.js';

// Strict directed acyclic transition graph for the multi-party Saga
const ALLOWED_TRANSITIONS = Object.freeze({
  [TRANSACTION_STATE.INITIATED]: [
    TRANSACTION_STATE.ESCROW_HOLD,
    TRANSACTION_STATE.FAILED
  ],
  [TRANSACTION_STATE.ESCROW_HOLD]: [
    TRANSACTION_STATE.MATCHED,
    TRANSACTION_STATE.REFUNDED,
    TRANSACTION_STATE.FAILED
  ],
  [TRANSACTION_STATE.MATCHED]: [
    TRANSACTION_STATE.ACCEPTED,
    TRANSACTION_STATE.MATCHED, // Worker reassignment without re-payment
    TRANSACTION_STATE.REFUNDED,
    TRANSACTION_STATE.FAILED
  ],
  [TRANSACTION_STATE.ACCEPTED]: [
    TRANSACTION_STATE.IN_PROGRESS,
    TRANSACTION_STATE.MATCHED, // If worker fails to show up
    TRANSACTION_STATE.REFUNDED
  ],
  [TRANSACTION_STATE.IN_PROGRESS]: [
    TRANSACTION_STATE.COMPLETED,
    TRANSACTION_STATE.FAILED
  ],
  [TRANSACTION_STATE.COMPLETED]: [
    TRANSACTION_STATE.SETTLED
  ],
  [TRANSACTION_STATE.SETTLED]: [], // Terminal success
  [TRANSACTION_STATE.REFUNDED]: [], // Terminal compensation
  [TRANSACTION_STATE.FAILED]: []    // Terminal failure
});

export class StateManager {
  /**
   * Validates if a state transition is legally permissible
   */
  static validateTransition(currentState, nextState) {
    const validNextStates = ALLOWED_TRANSITIONS[currentState] || [];
    if (!validNextStates.includes(nextState)) {
      throw new StateTransitionError(
        `Illegal Saga state transition from '${currentState}' to '${nextState}'. Legal targets: [${validNextStates.join(', ')}]`
      );
    }
    return true;
  }
}

