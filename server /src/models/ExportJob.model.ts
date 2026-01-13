import { Schema, model, Document, Types } from 'mongoose';

export enum ExportJobStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  DONE = 'done',
  FAILED = 'failed'
}

export interface IExportJob extends Document {
  _id: Types.ObjectId;
  createdBy?: Types.ObjectId;
  type: string; // e.g., "applications-csv"
  status: ExportJobStatus;
  resultUrl?: string;
  error?: string;
  meta?: Record<string, any>;
}

const ExportJobSchema = new Schema<IExportJob>(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, required: true },
    status: { type: String, enum: Object.values(ExportJobStatus), default: ExportJobStatus.QUEUED, index: true },
    resultUrl: { type: String },
    error: { type: String },
    meta: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

ExportJobSchema.index({ status: 1, createdAt: 1 });

const ExportJobModel = model<IExportJob>('ExportJob', ExportJobSchema);
export default ExportJobModel;
