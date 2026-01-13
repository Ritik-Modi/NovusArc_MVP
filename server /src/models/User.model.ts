import { Schema, model, Document, Model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  ADMIN = 'admin',
  CAMPUS = 'campus',
  COMPANY = 'company',
  STUDENT = 'student'
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  tenantId?: string; // optional for multi-tenant later
  comparePassword(candidate: string): Promise<boolean>;
  sanitize(): Partial<IUser>;
}

const SALT_ROUNDS = 10;

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: function () { return this.role !== UserRole.COMPANY; } }, // company users might use SSO
    role: { type: String, enum: Object.values(UserRole), default: UserRole.STUDENT },
    isActive: { type: Boolean, default: true },
    tenantId: { type: String, index: true }
  },
  { timestamps: true }
);

// Hash password before save (only if modified)
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err as any);
  }
});

// Instance method to compare password
UserSchema.methods.comparePassword = function (candidate: string) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

// Utility to return safe object (no password)
UserSchema.methods.sanitize = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Indexes
UserSchema.index({ email: 1 });

const UserModel: Model<IUser> = model<IUser>('User', UserSchema);
export default UserModel;
