import { Schema, model, Document, Types } from 'mongoose';

export enum ApplicationStatus {
  APPLIED = 'applied',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  HIRED = 'hired',
  WITHDRAWN = 'withdrawn'
}

export interface IApplication extends Document {
  _id: Types.ObjectId;
  job: Types.ObjectId;
  student: Types.ObjectId; // reference to StudentProfile.user or User
  studentProfile?: Types.ObjectId;
  status: ApplicationStatus;
  resumeUrl?: string;
  coverLetter?: string;
  scores?: Record<string, any>;
  appliedAt?: Date;
  metadata?: Record<string, any>;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentProfile: { type: Schema.Types.ObjectId, ref: 'StudentProfile' },
    status: { type: String, enum: Object.values(ApplicationStatus), default: ApplicationStatus.APPLIED, index: true },
    resumeUrl: { type: String },
    coverLetter: { type: String },
    scores: { type: Schema.Types.Mixed },
    appliedAt: { type: Date, default: () => new Date() },
    metadata: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

// prevent duplicate application per job per student
ApplicationSchema.index({ job: 1, student: 1 }, { unique: true });

// helpful index for querying by status
ApplicationSchema.index({ status: 1 });

const ApplicationModel = model<IApplication>('Application', ApplicationSchema);
export default ApplicationModel;
