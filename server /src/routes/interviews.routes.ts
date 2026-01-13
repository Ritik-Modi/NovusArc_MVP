import { Router } from 'express';
import {
  scheduleInterview,
  getInterview,
  listInterviews,
  updateInterview
} from '../controllers/interviews.controller';

const router = Router();

/**
 * Interviews routes
 * - POST /interviews             -> schedule interview
 * - GET  /interviews/:id         -> get interview
 * - GET  /interviews             -> list interviews (filters)
 * - PATCH /interviews/:id        -> update interview (reschedule/cancel/complete)
 */

router.post('/', scheduleInterview);
router.get('/:id', getInterview);
router.get('/', listInterviews);
router.patch('/:id', updateInterview);
// router.post('/:id/cancel', cancelInterview);

export default router;
