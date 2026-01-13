import { Router } from 'express';
import {
  createImportJob,
  getImportJob,
  listImportJobs,
  retryImportJob
} from '../controllers/imports.controller';

const router = Router();

/**
 * Imports routes
 * - POST /imports                -> create an import job (file upload)
 * - GET  /imports/:id            -> get import job status
 * - GET  /imports                -> list import jobs
 * - POST /imports/:id/retry      -> retry a failed import
 */

router.post('/', createImportJob);
router.get('/:id', getImportJob);
router.get('/', listImportJobs);
router.post('/:id/retry', retryImportJob);

export default router;
