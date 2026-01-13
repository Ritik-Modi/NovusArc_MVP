import { Request, Response, NextFunction } from 'express';
import UserModel, { IUser } from '../models/User.model';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
/**
 * Auth controller placeholders
 * - Handles login, logout, refresh token, signup, and password flows.
 * - Uses cookie-based JWT auth in the real implementation.
 */

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

// Store OTPs in memory (use Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || ''
  }
});

// Generate OTP
const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send email
const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@novusarc.com',
      to,
      subject,
      html
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const signupAdmin = async (req: Request, res: Response, next: NextFunction) => {
  // TODO: validate body, create user, hash password, send welcome email
  try {
     const { name, email, password } = req.body;

     if(!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
     }
     
     const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
      if(existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use'
        });
      }
      
      const newUser = new UserModel({
        name,
        email: email.toLowerCase(),
        password,
        role: 'admin',
        isActive: true
      });

      await newUser.save();

      // Send welcome email (commented out for now)
      // const emailHtml = `
      //   <h2>Welcome to NovusArc, ${name}!</h2>
      //   <p>Your admin account has been successfully created.</p>
      //   <p>If you have any questions, feel free to reach out to our support team.</p>
      //   <hr>
      //   <p>Best regards,<br>NovusArc Team</p>
      // `;
      
      // await sendEmail(email, 'Welcome to NovusArc', emailHtml);
      return res.status(201).json({
        success: true,
        message: 'Admin signup successful',
        data: {
          user: newUser.sanitize()
        }
      });
    
  } catch (error) {
    return next(error);
    console.log("Internal Server Error while Sign in ", error)
    
  }
  res.status(501).json({ message: 'signup not implemented' });
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY } as SignOptions
    );

    // Set token in cookie (httpOnly for security)
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return user data without password
    const userPayload = user.sanitize();

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userPayload,
        token
      }
    });

  } catch (error) {
    return next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Clear the authentication cookie
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    return next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  // TODO: verify refresh token, issue new access token cookie
  res.status(501).json({ message: 'refreshToken not implemented' });
};

export const sendOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user exists
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore.set(email.toLowerCase(), {
      otp,
      expiresAt,
      attempts: 0
    });

    // Send OTP email (commented out for now)
    // const emailHtml = `
    //   <h2>Password Reset Request</h2>
    //   <p>Hi ${user.name},</p>
    //   <p>Your OTP for password reset is:</p>
    //   <h3 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${otp}</h3>
    //   <p>This OTP will expire in 10 minutes.</p>
    //   <p>If you didn't request this, please ignore this email.</p>
    //   <hr>
    //   <p>Best regards,<br>NovusArc Team</p>
    // `;

    // await sendEmail(email, 'Password Reset OTP', emailHtml);

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
      data: {
        email: email,
        otp: otp // For testing, include OTP in response
      }
    });

  } catch (error) {
    return next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required'
      });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Password validation (minimum 8 characters, at least one uppercase, one lowercase, one number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters with uppercase, lowercase, and number'
      });
    }

    // Check OTP store
    const otpData = otpStore.get(email.toLowerCase());

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found for this email. Please request a new OTP'
      });
    }

    // Check OTP expiry
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP'
      });
    }

    // Check max attempts
    if (otpData.attempts >= 3) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP'
      });
    }

    // Verify OTP
    if (otp !== otpData.otp) {
      otpData.attempts++;
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Find user and update password
    const user = await UserModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    // Clear OTP
    otpStore.delete(email.toLowerCase());

    // Send confirmation email (commented out for now)
    // const confirmEmailHtml = `
    //   <h2>Password Reset Successful</h2>
    //   <p>Hi ${user.name},</p>
    //   <p>Your password has been successfully reset.</p>
    //   <p>If you didn't perform this action, please contact support immediately.</p>
    //   <hr>
    //   <p>Best regards,<br>NovusArc Team</p>
    // `;

    // await sendEmail(email, 'Password Reset Successful', confirmEmailHtml);

    return res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    return next(error);
  }
};

export default {
  signupAdmin,
  login,
  logout,
  refreshToken,
  sendOTP,
  resetPassword,
};
