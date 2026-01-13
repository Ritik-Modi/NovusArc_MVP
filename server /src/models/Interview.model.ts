import { Schema, model, Document, Types } from 'mongoose';

export enum InterviewStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export interface IInterview extends Document {
  _id: Types.ObjectId;
  application: Types.ObjectId;
  job: Types.ObjectId;
  candidate: Types.ObjectId;
  interviewer?: Types.ObjectId; // could be multiple later
  startTime: Date;
  endTime?: Date;
  mode?: 'online' | 'offline';
  location?: string;
  status: InterviewStatus;
  notes?: string;
}

const InterviewSchema = new Schema<IInterview>(
  {
    application: { type: Schema.Types.ObjectId, ref: 'Application', index: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job' },
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    interviewer: { type: Schema.Types.ObjectId, ref: 'User' },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    mode: { type: String, enum: ['online', 'offline'], default: 'online' },
    location: { type: String },
    status: { type: String, enum: Object.values(InterviewStatus), default: InterviewStatus.SCHEDULED },
    notes: { type: String }
  },
  { timestamps: true }
);

InterviewSchema.index({ candidate: 1, startTime: 1 });

const InterviewModel = model<IInterview>('Interview', InterviewSchema);
export default InterviewModel;
