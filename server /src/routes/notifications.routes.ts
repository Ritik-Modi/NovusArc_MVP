import { Router } from 'express';
import {
  listNotifications,
  markAsRead,
  createNotification,
  deleteNotification
} from '../controllers/notifications.controller';

const router = Router();

/**
 * Notifications routes
 * - GET /notifications             -> list current user's notifications
 * - POST /notifications            -> create notification (system/admin)
 * - POST /notifications/:id/read   -> mark as read
 * - DELETE /notifications/:id      -> delete notification
 */

router.get('/', listNotifications);
router.post('/', createNotification);
router.post('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;
