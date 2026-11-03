/**
 * NAKKO Platform - Client Controller
 */

import { ClientService } from './client.service.js';

export async function getClientPayments(req, res, next) {
  try {
    const clientId = req.user.id;
    const payments = await ClientService.getClientPayments(clientId);
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (err) {
    next(err);
  }
}

export async function getClientProfile(req, res, next) {
  try {
    const clientId = req.user.id;
    const profile = await ClientService.getClientProfile(clientId);
    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (err) {
    next(err);
  }
}

