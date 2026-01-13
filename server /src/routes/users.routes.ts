import { Router } from 'express';
import {
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  getMe,
  activateUser
} from '../controllers/users.controller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = Router();

/**
 * Users routes
 * - GET /users         -> list users (admin)
 * - GET /users/me      -> current user
 * - GET /users/:id     -> get user by id
 * - PUT /users/:id     -> update user
 * - DELETE /users/:id  -> delete user
 */

// router.use(authMiddleware, rbac('admin')) // example middleware

router.get('/', listUsers);
router.get('/me', getMe);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/:id/activate', isAuthenticated,activateUser);

export default router;
