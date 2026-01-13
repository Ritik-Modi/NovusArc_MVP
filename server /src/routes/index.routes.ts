import { Router } from 'express';

import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import studentsRoutes from './students.routes';
import companiesRoutes from './companies.routes';
import jobsRoutes from './jobs.routes';
import applicationsRoutes from './applications.routes';
import interviewsRoutes from './interviews.routes';
import notificationsRoutes from './notifications.routes';
import analyticsRoutes from './analytics.routes';
import importsRoutes from './imports.routes';


const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/students', studentsRoutes);
router.use('/companies', companiesRoutes);
router.use('/jobs', jobsRoutes);
router.use('/applications', applicationsRoutes);
router.use('/interviews', interviewsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/imports', importsRoutes);


export default router;
