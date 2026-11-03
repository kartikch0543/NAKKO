/**
 * NAKKO Platform - Environment Configuration & Validation
 */

import dotenv from 'dotenv';
dotenv.config();

function getEnv(key, defaultValue = undefined) {
  const value = process.env[key];
  if (value === undefined || value === '') {
    if (defaultValue !== undefined) return defaultValue;
    return undefined;
  }
  return value;
}

export const env = Object.freeze({
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: parseInt(getEnv('PORT', '5000'), 10),
  
  // Database
  MONGODB_URI: getEnv('MONGODB_URI', 'mongodb://127.0.0.1:27017/nakko'),

  // JWT Security
  JWT_SECRET: getEnv('JWT_SECRET', 'nakko_dev_jwt_secret_key_cooperative_2026'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '7d'),

  // CORS
  ALLOWED_ORIGINS: getEnv('ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000')
    .split(',')
    .map(s => s.trim()),

  // Matching & Dynamic Search Space Weights
  MATCHING: Object.freeze({
    MAX_SEARCH_RADIUS_KM: parseFloat(getEnv('MAX_SEARCH_RADIUS_KM', '15')),
    WEIGHT_PROXIMITY: parseFloat(getEnv('MATCH_WEIGHT_PROXIMITY', '0.40')),
    WEIGHT_WORKLOAD: parseFloat(getEnv('MATCH_WEIGHT_WORKLOAD', '0.30')),
    WEIGHT_RATING: parseFloat(getEnv('MATCH_WEIGHT_RATING', '0.15')),
    WEIGHT_COOPERATIVE: parseFloat(getEnv('MATCH_WEIGHT_COOPERATIVE', '0.15'))
  }),

  // Payments (Razorpay Sandbox)
  PAYMENT: Object.freeze({
    KEY_ID: getEnv('RAZORPAY_KEY_ID', 'rzp_test_nakko_mock_key_id'),
    KEY_SECRET: getEnv('RAZORPAY_KEY_SECRET', 'rzp_test_nakko_mock_secret'),
    WEBHOOK_SECRET: getEnv('PAYMENT_WEBHOOK_SECRET', 'nakko_webhook_secret_sandbox')
  }),

  // Maps
  MAPS: Object.freeze({
    API_KEY: getEnv('GOOGLE_MAPS_API_KEY', '')
  }),

  // Welfare API Simulation
  WELFARE: Object.freeze({
    SIMULATION_MODE: getEnv('WELFARE_API_SIMULATION_MODE', 'true') === 'true'
  })
});

export function validateEnvironment() {
  const warnings = [];
  if (env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('[Environment] JWT_SECRET must be at least 32 characters in production.');
    }
    if (!process.env.MONGODB_URI) {
      throw new Error('[Environment] MONGODB_URI is required in production.');
    }
  } else {
    if (!process.env.JWT_SECRET) {
      warnings.push('JWT_SECRET not provided, using fallback development secret.');
    }
  }

  if (warnings.length > 0) {
    warnings.forEach(w => console.warn(`[Config Warning] ${w}`));
  }
}

