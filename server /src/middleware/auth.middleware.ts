// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserModel, { IUser } from "../models/User.model";

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
  iat?: number;
  exp?: number;
}



export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.authToken as string | undefined;

    if (!token) {
      return res.status(401).json({ message: "User not logged in" });
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    if (!secret) {
      return res.status(500).json({ message: "Server error: Missing JWT secret" });
    }

    // Decode token
    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (!decoded?.userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Fetch user without password
    const user = (await UserModel.findById(decoded.userId).select("-password")) as IUser | null;

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user to request
    (req as any).user = user;

    return next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
