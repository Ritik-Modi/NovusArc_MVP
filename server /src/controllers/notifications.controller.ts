import { Request, Response, NextFunction } from 'express';
import NotificationModel from '../models/Notification.model';

/**
 * Notifications controller placeholders
 * - CRUD for notifications, mark read/unread, push/email triggers
 * - Endpoints: list for user, mark read, create (system), delete
 */

export const listNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, read } = req.query;
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const skip = (Number(page) - 1) * Number(limit);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    let query: any = { receiver: userId };

    if (read !== undefined) {
      query.read = read === 'true';
    }

    const notifications = await NotificationModel.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await NotificationModel.countDocuments(query);

    // Get unread count
    const unreadCount = await NotificationModel.countDocuments({
      receiver: userId,
      read: false
    });

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Notification IDs are required'
      });
    }

    const result = await NotificationModel.updateMany(
      { _id: { $in: notificationIds } },
      { read: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Notifications marked as read',
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const createNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { receiverId, type, title, body, payload } = req.body;

    if (!receiverId || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID, title, and body are required'
      });
    }

    const notification = new NotificationModel({
      receiver: receiverId,
      type: type || 'in_app',
      title,
      body,
      payload,
      read: false,
      sentAt: new Date()
    });

    await notification.save();

    return res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: { notification }
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const notification = await NotificationModel.findByIdAndUpdate(
      id,
      { deleted: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  listNotifications,
  markAsRead,
  createNotification,
  deleteNotification
};
