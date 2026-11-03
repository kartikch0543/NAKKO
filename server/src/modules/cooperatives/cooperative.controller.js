/**
 * NAKKO Platform - Cooperative Controller
 */

import { CooperativeService } from './cooperative.service.js';

export async function getCooperatives(req, res, next) {
  try {
    const list = await CooperativeService.listCooperatives();
    res.status(200).json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (err) {
    next(err);
  }
}

export async function getCooperativeById(req, res, next) {
  try {
    const coop = await CooperativeService.getCooperativeById(req.params.id);
    res.status(200).json({
      success: true,
      data: coop
    });
  } catch (err) {
    next(err);
  }
}

