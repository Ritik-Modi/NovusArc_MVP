import { Router } from 'express';
import upload from '../utils/upload'; // Import the upload utility
import {
  listStudents,
  getStudent,
  updateStudent,
  uploadResume,
} from '../controllers/students.controller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = Router();

/**
 * Students routes
 * - GET /students
 * - GET /students/:id
 * - PUT /students/:id
 * - POST /students/:id/resume  (file upload)
 */

// router.use(authMiddleware)

router.get('/', listStudents);
router.get('/:id', getStudent);

// Update route with Multer for multiple files
router.put(
  '/:id',
  isAuthenticated,
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'markSheet10th', maxCount: 1 },
    { name: 'markSheet12th', maxCount: 1 },
    { name: 'collageIdCard', maxCount: 1 },
  ]),
  updateStudent
);

// Resume upload (if separate)
router.post('/resume', isAuthenticated , upload.fields([{name : 'resume', maxCount: 1}]), uploadResume);

export default router;
