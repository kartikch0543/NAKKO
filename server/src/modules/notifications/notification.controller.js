/**
 * NAKKO Platform - Notification Controller
 */

import { NotificationAdapter } from '../../integrations/notifications/notificationAdapter.js';
import { ValidationError } from '../../shared/errors/AppError.js';

export async function sendNotification(req, res, next) {
  try {
    const { to, message, type = 'GENERAL_ALERT', bookingId } = req.body;
    if (!to || !message) {
      throw new ValidationError("Fields 'to' and 'message' are required.");
    }

    const result = await NotificationAdapter._dispatchSms({
      to,
      message,
      type,
      bookingId
    });

    res.status(200).json({
      success: true,
      message: 'Notification processed and dispatched',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

