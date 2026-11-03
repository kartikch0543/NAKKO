/**
 * NAKKO Platform - Simulated Government Welfare API Adapter
 * 
 * Demonstrates daily-wage worker social security status verification (e.g., e-Shram / BOCW).
 * Clearly marked as SIMULATION for academic demonstration and compliance.
 */

import { AuditService } from '../../core/transactionProtocol/auditService.js';

export class WelfareApiAdapter {
  /**
   * Verifies daily-wage worker welfare entitlement status
   * @param {Object} worker { id, name, phone, cooperativeId, aadharLast4 }
   * @returns {Promise<Object>} Welfare verification report with simulation markers
   */
  static async verifyWorkerWelfareStatus(worker) {
    const isSimulated = true;
    const workerId = String(worker._id || worker.id);

    // Simulated lookup logic based on active cooperative status
    const isEnrolled = Boolean(worker.cooperativeId);
    const welfareId = `BOCW-UP-2026-${workerId.replace(/\D/g, '').slice(-4) || '1042'}`;

    const report = {
      isSimulated,
      simulationNotice: 'DEMONSTRATION SIMULATION: Not connected to live production government registry',
      scheme: 'BOCW / e-Shram Daily-Wage Welfare Safety Net',
      workerId,
      workerName: worker.name,
      welfareId,
      status: isEnrolled ? 'ACTIVE_ENROLLED' : 'ELIGIBLE_NOT_REGISTERED',
      benefitsEligible: {
        accidentalInsurance: isEnrolled,
        healthCheckupAllowance: isEnrolled,
        cooperativePensionAccess: isEnrolled
      },
      verifiedAt: new Date().toISOString()
    };

    // Maintain immutable audit log of government welfare check
    await AuditService.logTransition({
      transactionId: `WELFARE-${Date.now()}`,
      bookingId: 'N/A',
      fromState: 'UNCHECKED',
      toState: report.status,
      actorId: 'WELFARE_ADAPTER',
      actorRole: 'SYSTEM_SIMULATOR',
      metadata: report
    });

    return report;
  }
}

