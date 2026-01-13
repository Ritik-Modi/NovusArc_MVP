import { Router } from 'express';
import {
  applyToJob,
  listApplicationsForJob,
  listApplicationsForStudent,
  updateApplicationStatus,
  withdrawApplication
} from '../controllers/applications.controller';

const router = Router();

/**
 * Applications routes
 * - POST /applications/:jobId/apply          -> student applies to a job
 * - GET  /applications/job/:jobId           -> list applications for a job
 * - GET  /applications/student              -> list current student's applications
 * - PATCH /applications/:id/status          -> change status (shortlist/reject/hire)
 * - POST /applications/:id/withdraw         -> student withdraws application
 */

// apply
router.post('/:jobId/apply', applyToJob);

// list by job (company/admin)
router.get('/job/:jobId', listApplicationsForJob);

// list by student (current user)
router.get('/student', listApplicationsForStudent);

// update status & withdraw
router.patch('/:id/status', updateApplicationStatus);
router.post('/:id/withdraw', withdrawApplication);

export default router;
