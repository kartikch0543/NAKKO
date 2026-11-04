/**
 * NAKKO Platform - Government Welfare & Social Security API Adapter
 * 
 * Demonstrates daily-wage worker social security status verification (e.g., e-Shram / BOCW).
 * Supports both live external registry query (when WELFARE_API_URL configured) and
 * compliant academic simulation mode with full immutable audit ledger tracking.
 */

import { AuditService } from '../../core/transactionProtocol/auditService.js';

export class WelfareApiAdapter {
  /**
   * Verifies daily-wage worker welfare entitlement status
   * @param {Object} worker { id, name, phone, cooperativeId, aadharLast4 }
   * @returns {Promise<Object>} Welfare verification report
   */
  static async verifyWorkerWelfareStatus(worker) {
    const workerId = String(worker._id || worker.id);
    const apiUrl = process.env.WELFARE_API_URL;
    const apiKey = process.env.WELFARE_API_KEY;

    // If an external live government registry endpoint is provided
    if (apiUrl) {
      try {
        const res = await fetch(`${apiUrl}/workers/verify/${workerId}`, {
          headers: {
            'Authorization': apiKey ? `Bearer ${apiKey}` : '',
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) {
          const liveData = await res.json();
          await AuditService.logTransition({
            transactionId: `WELFARE-LIVE-${Date.now()}`,
            bookingId: 'N/A',
            fromState: 'UNCHECKED',
            toState: 'VERIFIED_EXTERNAL',
            actorId: 'GOV_REGISTRY_API',
            actorRole: 'EXTERNAL_REGISTRY',
            metadata: liveData
          });
          return liveData;
        }
      } catch (e) {
        console.warn('[WelfareApiAdapter] External government API unreachable, using simulated safety net:', e.message);
      }
    }

    // High fidelity simulated lookup logic based on active cooperative status
    const isEnrolled = Boolean(worker.cooperativeId);
    const welfareId = `BOCW-UP-2026-${workerId.replace(/\D/g, '').slice(-4) || '1042'}`;

    const report = {
      isSimulated: true,
      simulationNotice: 'DEMONSTRATION SIMULATION: Verified against local cooperative labor records',
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
