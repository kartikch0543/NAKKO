/**
 * NAKKO Platform - Cooperative Domain Model
 * Daily-wage worker cooperative entities, welfare pools, and fee rules
 */

import mongoose from 'mongoose';

const cooperativeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Cooperative name is required'],
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    default: ''
  },
  contactPhone: {
    type: String,
    default: '+91 120 445566'
  },
  welfarePoolBalance: {
    type: Number,
    default: 125000 // In INR
  },
  feePercentage: {
    type: Number,
    default: 5.0 // 5% allocated to cooperative collective welfare fund
  },
  memberCount: {
    type: Number,
    default: 48
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending_approval'],
    default: 'active'
  }
}, {
  timestamps: true
});

export const Cooperative = mongoose.models.Cooperative || mongoose.model('Cooperative', cooperativeSchema);

export const memoryCooperatives = [
  {
    _id: 'coop-1',
    id: 'coop-1',
    name: 'Noida Shramik Vikas Cooperative',
    code: 'NSVC-01',
    city: 'Noida, Uttar Pradesh',
    address: 'Sector 10 Industrial Area, Noida',
    contactPhone: '+91 120 2554411',
    welfarePoolBalance: 145000,
    feePercentage: 5.0,
    memberCount: 52,
    status: 'active'
  },
  {
    _id: 'coop-2',
    id: 'coop-2',
    name: 'NCR Karigar Sahakari Samiti',
    code: 'NKSS-02',
    city: 'Ghaziabad / Greater Noida',
    address: 'Ambedkar Road, Ghaziabad',
    contactPhone: '+91 120 3882299',
    welfarePoolBalance: 98000,
    feePercentage: 5.0,
    memberCount: 36,
    status: 'active'
  }
];

