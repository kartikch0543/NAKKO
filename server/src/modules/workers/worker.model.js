/**
 * NAKKO Platform - Worker Domain Model
 * Geospatial coordinates, availability metrics, skills, and cooperative roster
 */

import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  skill: {
    type: String,
    required: true,
    index: true // Indexed for Dynamic Search Space Reduction Stage 1
  },
  skills: [{
    type: String,
    index: true
  }],
  phone: {
    type: String,
    default: '+91 91234 56789'
  },
  city: {
    type: String,
    default: 'Noida, Uttar Pradesh'
  },
  // GeoJSON Point for geospatial matching
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [77.3910, 28.5355]
    }
  },
  rating: {
    type: Number,
    default: 4.8,
    min: 1.0,
    max: 5.0
  },
  reviewsCount: {
    type: Number,
    default: 150
  },
  experience: {
    type: String,
    default: '5 years'
  },
  avatar: {
    type: String,
    default: 'W'
  },
  avatarBg: {
    type: String,
    default: '#d8f3dc'
  },
  avatarColor: {
    type: String,
    default: '#2d6a4f'
  },
  isAvailable: {
    type: Boolean,
    default: true,
    index: true // Indexed for Stage 1 filter
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'verified',
    index: true // Indexed for Stage 1 filter
  },
  cooperativeId: {
    type: String,
    default: 'coop-1',
    index: true
  },
  cooperativeName: {
    type: String,
    default: 'Noida Shramik Vikas Cooperative'
  },
  // Workload tracking for Fair Allocation
  totalJobs: {
    type: Number,
    default: 120
  },
  recentJobsLast7Days: {
    type: Number,
    default: 2
  },
  lastAssignedAt: {
    type: Date,
    default: () => new Date(Date.now() - 24 * 3600 * 1000)
  },
  completionRate: {
    type: Number,
    default: 98
  },
  earningsThisMonth: {
    type: Number,
    default: 18450
  },
  earningsToday: {
    type: Number,
    default: 1250
  }
}, {
  timestamps: true
});

// Compound 2dsphere index for spatial queries
workerSchema.index({ location: '2dsphere', isAvailable: 1, skill: 1 });

export const Worker = mongoose.models.Worker || mongoose.model('Worker', workerSchema);

// In-memory fallback repository aligned with frontend mocks
export const memoryWorkers = [
  {
    _id: 'w-101',
    id: 'w-101',
    name: 'Ramesh Kumar',
    skill: 'Plumbing',
    skills: ['Plumbing', 'Pipe Fitting', 'Sanitary Repair'],
    rating: 4.9,
    reviewsCount: 284,
    experience: '8 years',
    phone: '+91 91234 56789',
    city: 'Noida, Uttar Pradesh',
    location: { type: 'Point', coordinates: [77.3300, 28.5800] },
    avatar: 'R',
    avatarBg: '#d8f3dc',
    avatarColor: '#2d6a4f',
    isAvailable: true,
    kycStatus: 'verified',
    cooperativeId: 'coop-1',
    cooperativeName: 'Noida Shramik Vikas Cooperative',
    totalJobs: 142,
    recentJobsLast7Days: 3,
    lastAssignedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    completionRate: 98,
    earningsThisMonth: 18450,
    earningsToday: 1250,
    distanceKm: 1.2,
    etaMinutes: 12
  },
  {
    _id: 'w-102',
    id: 'w-102',
    name: 'Mohan Singh',
    skill: 'Plumbing',
    skills: ['Plumbing', 'Bathroom Fixtures', 'Water Tank Cleaning'],
    rating: 4.7,
    reviewsCount: 164,
    experience: '5 years',
    phone: '+91 98765 12340',
    city: 'Greater Noida, UP',
    location: { type: 'Point', coordinates: [77.3400, 28.5900] },
    avatar: 'M',
    avatarBg: '#e8f4f8',
    avatarColor: '#457b9d',
    isAvailable: true,
    kycStatus: 'verified',
    cooperativeId: 'coop-1',
    cooperativeName: 'Noida Shramik Vikas Cooperative',
    totalJobs: 98,
    recentJobsLast7Days: 1, // Lower recent workload -> favored by fairness engine
    lastAssignedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    completionRate: 95,
    earningsThisMonth: 14200,
    earningsToday: 800,
    distanceKm: 2.5,
    etaMinutes: 25
  },
  {
    _id: 'w-103',
    id: 'w-103',
    name: 'Sunita Devi',
    skill: 'Cleaning',
    skills: ['Cleaning', 'Deep Home Cleaning', 'Kitchen Sanitization'],
    rating: 4.95,
    reviewsCount: 312,
    experience: '6 years',
    phone: '+91 94567 89012',
    city: 'Sector 62, Noida',
    location: { type: 'Point', coordinates: [77.3600, 28.6200] },
    avatar: 'S',
    avatarBg: '#fef3c7',
    avatarColor: '#d97706',
    isAvailable: true,
    kycStatus: 'verified',
    cooperativeId: 'coop-1',
    cooperativeName: 'Noida Shramik Vikas Cooperative',
    totalJobs: 210,
    recentJobsLast7Days: 4,
    lastAssignedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    completionRate: 99,
    earningsThisMonth: 22100,
    earningsToday: 1400,
    distanceKm: 1.8,
    etaMinutes: 18
  },
  {
    _id: 'w-104',
    id: 'w-104',
    name: 'Mohan Yadav',
    skill: 'Electrical',
    skills: ['Electrical', 'Wiring', 'Switchboard Repair'],
    rating: 4.8,
    reviewsCount: 198,
    experience: '7 years',
    phone: '+91 93456 78901',
    city: 'Indirapuram, Ghaziabad',
    location: { type: 'Point', coordinates: [77.3700, 28.6400] },
    avatar: 'Y',
    avatarBg: '#ede9fe',
    avatarColor: '#6b46c1',
    isAvailable: false,
    kycStatus: 'verified',
    cooperativeId: 'coop-2',
    cooperativeName: 'NCR Karigar Sahakari Samiti',
    totalJobs: 115,
    recentJobsLast7Days: 0,
    lastAssignedAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    completionRate: 96,
    earningsThisMonth: 16800,
    earningsToday: 0,
    distanceKm: 3.1,
    etaMinutes: 30
  },
  {
    _id: 'w-105',
    id: 'w-105',
    name: 'Lakshmi Narayan',
    skill: 'Gardening',
    skills: ['Gardening', 'Lawn Trimming', 'Balcony Landscaping'],
    rating: 4.85,
    reviewsCount: 140,
    experience: '4 years',
    phone: '+91 92345 67890',
    city: 'Sector 15, Noida',
    location: { type: 'Point', coordinates: [77.3100, 28.5700] },
    avatar: 'L',
    avatarBg: '#d8f3dc',
    avatarColor: '#2d6a4f',
    isAvailable: true,
    kycStatus: 'verified',
    cooperativeId: 'coop-1',
    cooperativeName: 'Noida Shramik Vikas Cooperative',
    totalJobs: 82,
    recentJobsLast7Days: 2,
    lastAssignedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    completionRate: 97,
    earningsThisMonth: 12600,
    earningsToday: 700,
    distanceKm: 2.0,
    etaMinutes: 20
  }
];
