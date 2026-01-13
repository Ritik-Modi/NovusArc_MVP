import { Request, Response, NextFunction } from 'express';
import UserModel, { UserRole } from '../models/User.model';
import StudentProfileModel from '../models/StudentProfile.model';

/**
 * Users controller placeholders
 * - CRUD for User documents (admin-facing)
 * - Profile read/update for current user
 * - Role/permission management
 */

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query: any = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await UserModel.find(query)
      .select('-password')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await UserModel.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        users,
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


export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    return next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Prevent updating sensitive fields
    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase();
    // Only allow role update for admins (should be checked in middleware)
    if (role) updates.role = role;

    const user = await UserModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    return next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const user = await UserModel.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    return next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;
    const requestingUserRole = (req as any).user?.role;

    // Check authorization - only admin or campus (faculty) can create users
    if (!requestingUserRole || ![UserRole.ADMIN, UserRole.CAMPUS].includes(requestingUserRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins and faculty can create new users'
      });
    }

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required'
      });
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${Object.values(UserRole).join(', ')}`
      });
    }

    // Password validation (minimum 8 characters, at least one uppercase, one lowercase, one number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters with uppercase, lowercase, and number'
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const newUser = new UserModel({
      name,
      email: email.toLowerCase(),
      password,
      role,
      isActive: true
    });

    await newUser.save();

    // Automatically create student profile if role is student
    if (role === 'student') {
      const studentProfile = new StudentProfileModel({
        user: newUser._id
      });
      await studentProfile.save();
    }

    // Return user without password
    const userPayload = newUser.sanitize();

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: userPayload }
    });
  } catch (error) {
    return next(error);
  }
};

export const activateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const {user} = req.body;
    const { id } = req.params;
    const requestingUserRole = (req as any).user?.role;

    console.log('role', requestingUserRole);

    // Check authorization - only admin or campus (faculty) can activate users
    if (!requestingUserRole || ![UserRole.ADMIN, UserRole.CAMPUS].includes(requestingUserRole)) {
      return res.status(403).json({
        success: false,
        requestingUserRole,
        message: 'Only admins and faculty can activate users'
      });
    }

    const user = await UserModel.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User activated successfully',
      data: { user }
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  getMe,
  createUser,
  activateUser
};
