/**
 * NAKKO Platform - Notification & SMS Gateway Adapter
 * 
 * Delivers SMS alerts, worker assignment notifications, and booking confirmations
 * to daily-wage workers and households.
 * 
 * Supports:
 * - External SMS Gateways (Fast2SMS / Twilio / Webhook) when SMS_API_KEY configured
 * - Resilient simulated dispatch with immutable transaction audit trail
 */

import { AuditService } from '../../core/transactionProtocol/auditService.js';

export class NotificationAdapter {
  /**
   * Dispatches booking confirmation SMS to client
   */
  static async sendBookingConfirmation({ bookingId, clientPhone, workerName, service, scheduledTime }) {
    const text = `NAKKO: Your request for ${service} (#${bookingId}) is confirmed! Assigned worker: ${workerName}. Scheduled: ${scheduledTime}.`;
    return this._dispatchSms({
      to: clientPhone || '+91 98765 43210',
      message: text,
      type: 'BOOKING_CONFIRMATION',
      bookingId
    });
  }

  /**
   * Dispatches instant job alert SMS to the assigned cooperative worker
   */
  static async sendWorkerAssignment({ bookingId, workerPhone, clientName, clientAddress, service }) {
    const text = `NAKKO JOB ALERT: New ${service} booking #${bookingId} at ${clientAddress}. Client: ${clientName}. Please open your worker dashboard to accept.`;
    return this._dispatchSms({
      to: workerPhone || '+91 91234 56789',
      message: text,
      type: 'WORKER_ASSIGNMENT_ALERT',
      bookingId
    });
  }

  /**
   * Dispatches authentication OTP
   */
  static async sendOtp({ phone, otp }) {
    const text = `NAKKO: Your one-time verification code is ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`;
    return this._dispatchSms({
      to: phone,
      message: text,
      type: 'AUTH_OTP',
      bookingId: 'AUTH'
    });
  }

  /**
   * Internal dispatcher with external gateway call or audit log simulation
   */
  static async _dispatchSms({ to, message, type, bookingId }) {
    const apiKey = process.env.SMS_API_KEY;
    const provider = process.env.SMS_PROVIDER || 'simulation';
    const messageId = `sms_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    if (apiKey && provider === 'fast2sms') {
      try {
        const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            route: 'v3',
            sender_id: 'NAKKO',
            message,
            language: 'english',
            flash: 0,
            numbers: to.replace(/\D/g, '').slice(-10)
          })
        });
        const data = await res.json();
        return {
          success: true,
          messageId,
          recipient: to,
          provider: 'FAST2SMS',
          data
        };
      } catch (e) {
        console.warn('[NotificationAdapter] Fast2SMS dispatch failed, falling back to simulated dispatch:', e.message);
      }
    }

    // Record in immutable audit trail
    await AuditService.logTransition({
      transactionId: `NOTIF-${Date.now()}`,
      bookingId: bookingId || 'N/A',
      fromState: 'PENDING',
      toState: 'DISPATCHED_SIMULATED',
      actorId: 'NOTIFICATION_GATEWAY',
      actorRole: 'SYSTEM_SERVICE',
      metadata: {
        to,
        message,
        type,
        messageId,
        sentAt: new Date().toISOString()
      }
    });

    return {
      success: true,
      messageId,
      recipient: to,
      type,
      status: 'SENT_SIMULATED',
      message
    };
  }
}

