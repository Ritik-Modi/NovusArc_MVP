import { Router } from 'express';
import {
  listCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  restoreCompany
} from '../controllers/companies.controller';
import upload from '../utils/upload';

const router = Router();

/**
 * Companies routes
 * - GET /companies
 * - GET /companies/:id
 * - POST /companies
 * - PUT /companies/:id
 * - DELETE /companies/:id
 */

// router.use(authMiddleware, rbac('admin, campus, company'))

router.get('/', listCompanies);
router.get('/:id', getCompany);
router.post('/', upload.fields([{ name: 'logo', maxCount: 1 }]), createCompany);
router.put('/:id', upload.fields([{ name: 'logo', maxCount: 1 }]), updateCompany);
router.delete('/:id', deleteCompany);
router.post('/:id/restore', restoreCompany);

export default router;
