/**
 * NAKKO Platform - Cooperative Service
 */

import mongoose from 'mongoose';
import { Cooperative, memoryCooperatives } from './cooperative.model.js';
import { NotFoundError } from '../../shared/errors/AppError.js';

export class CooperativeService {
  static async listCooperatives() {
    if (mongoose.connection.readyState === 1) {
      try {
        return await Cooperative.find({ status: 'active' }).exec();
      } catch (e) {
        console.warn('[CooperativeService] DB query failed, fallback to memory:', e.message);
      }
    }
    return memoryCooperatives.filter(c => c.status === 'active');
  }

  static async getCooperativeById(id) {
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
      try {
        const coop = await Cooperative.findById(id).exec();
        if (coop) return coop;
      } catch (e) {
        console.warn('[CooperativeService] DB findById failed, fallback to memory:', e.message);
      }
    }
    const found = memoryCooperatives.find(c => String(c._id || c.id) === String(id));
    if (!found) {
      throw new NotFoundError('Cooperative not found.');
    }
    return found;
  }

  static async creditWelfarePool(cooperativeId, amount) {
    if (!cooperativeId || amount <= 0) return null;

    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(cooperativeId)) {
      try {
        return await Cooperative.findByIdAndUpdate(
          cooperativeId,
          { $inc: { welfarePoolBalance: amount } },
          { new: true }
        ).exec();
      } catch (e) {
        console.warn('[CooperativeService] Failed updating welfare pool in DB:', e.message);
      }
    }

    const memoryCoop = memoryCooperatives.find(c => String(c._id || c.id) === String(cooperativeId));
    if (memoryCoop) {
      memoryCoop.welfarePoolBalance = (memoryCoop.welfarePoolBalance || 0) + amount;
      return memoryCoop;
    }
    return null;
  }
}

