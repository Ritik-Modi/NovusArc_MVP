 import { Router } from 'express';
import {
  dashboardSummary,
  placementsOverTime,
  companyMetrics
} from '../controllers/analytics.controller';

const router = Router();

/**
 * Analytics routes
 * - GET /analytics/summary         -> dashboard summary KPIs
 * - GET /analytics/placements     -> placements over time (query params)
 * - GET /analytics/company/:id    -> metrics for a specific company
 */

router.get('/summary', dashboardSummary);
router.get('/placements', placementsOverTime);
router.get('/company/:id', companyMetrics);

export default router;
