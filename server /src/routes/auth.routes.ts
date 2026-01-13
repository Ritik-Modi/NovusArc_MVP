import { Router } from 'express';
import {
  signupAdmin,
  login,
  logout,
  refreshToken,
  sendOTP,
  resetPassword
} from '../controllers/auth.controller';

const router = Router();

/**
 * Auth routes
 * - POST /auth/signup
 * - POST /auth/login
 * - POST /auth/logout
 * - POST /auth/refresh
 */

// public
router.post('/signup', signupAdmin);
router.post('/login', login);

// token/cookie operations
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.post('/send-otp', sendOTP);
router.post('/reset-password', resetPassword);

export default router;
