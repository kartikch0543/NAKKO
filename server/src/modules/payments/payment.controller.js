/**
 * NAKKO Platform - Payments Controller
 */

import { RazorpayAdapter } from '../../integrations/payments/razorpayAdapter.js';
import { SettlementService } from '../../core/transactionProtocol/settlementService.js';
import { ValidationService } from '../../core/transactionProtocol/validationService.js';
import { ServiceRequestService } from '../serviceRequests/serviceRequest.service.js';

export async function createPaymentOrder(req, res, next) {
  try {
    const { amount, bookingId, idempotencyKey } = req.body;
    ValidationService.validateOrderPayload({ amount, bookingId });

    // Idempotency check
    const cached = ValidationService.checkIdempotency(idempotencyKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const order = await RazorpayAdapter.createOrder({
      amount,
      currency: 'INR',
      receipt: `rcpt_${bookingId}`,
      notes: { bookingId, clientId: req.user ? req.user.id : 'guest' }
    });

    const response = {
      success: true,
      message: 'Payment order created in sandbox escrow',
      data: order
    };

    ValidationService.recordIdempotency(idempotencyKey, response);
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function verifyPayment(req, res, next) {
  try {
    const { orderId, paymentId, signature, bookingId } = req.body;

    const isValid = RazorpayAdapter.verifyPaymentSignature({
      orderId,
      paymentId,
      signature
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature verification failed.'
      });
    }

    // Update booking status if bookingId provided
    if (bookingId) {
      await ServiceRequestService.updateStatus(bookingId, 'in_progress');
    }

    res.status(200).json({
      success: true,
      message: 'Payment signature verified and escrow deposit locked.',
      data: {
        orderId,
        paymentId,
        verified: true,
        status: 'ESCROW_HOLD'
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function handleWebhook(req, res, next) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const isValid = RazorpayAdapter.verifyWebhookSignature(req.body, signature);

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (err) {
    next(err);
  }
}

