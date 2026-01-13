import { Router } from 'express';
import {
  listJobs,
  getJob,
  createJob,
  updateJob,
  closeJob
} from '../controllers/jobs.controller';
import { 
  createRound,
  updateRound,
  getRoundsByJob,
  getRoundById,
  deleteRound,
  reorderRounds,
} from '../controllers/round.controller';
import upload from '../utils/upload'; // Import the upload utility

const router = Router();

/**
 * Jobs routes
 * - GET /jobs
 * - GET /jobs/:id
 * - POST /jobs
 * - PUT /jobs/:id
 * - POST /jobs/:id/close
 */

// public listing
router.get('/', listJobs);
router.get('/:id', getJob);

// protected
router.post(
  "/create",
  upload.fields([
    { name: "additionalAttechments", maxCount: 10 }
  ]),
  createJob
);
router.put('/:id',
  upload.fields([
    { name: "additionalAttechments", maxCount: 10 }
  ]),
  updateJob);


router.post('/:id', closeJob);



// rounds routes 
router.post('/:jobId/rounds/create', createRound);
router.get('/:jobId/rounds', getRoundsByJob);
router.get('/:jobId/rounds/:id', getRoundById);
router.put('/:jobId/rounds/reorder', reorderRounds);
router.put('/:jobId/rounds/:id', updateRound);
router.delete('/:jobId/rounds/:id', deleteRound);

export default router;

