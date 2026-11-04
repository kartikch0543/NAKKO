/**
 * NAKKO Platform - Maps & Geospatial Routes
 */

import { Router } from 'express';
import {
  getMapConfig,
  geocode,
  reverseGeocode,
  getDistanceMatrix,
  getRoute,
  getBookingTracking
} from './maps.controller.js';

const router = Router();

router.get('/config', getMapConfig);
router.get('/geocode', geocode);
router.get('/reverse-geocode', reverseGeocode);
router.post('/distance-matrix', getDistanceMatrix);
router.get('/route', getRoute);
router.get('/tracking/:bookingId', getBookingTracking);

export default router;

