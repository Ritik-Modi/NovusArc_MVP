import { Schema, model, Document, Types } from 'mongoose';

export enum ImportJobStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  DONE = 'done',
  FAILED = 'failed'
}

export interface IImportJob extends Document {
  _id: Types.ObjectId;
  uploadedBy?: Types.ObjectId;
  type: string; // e.g., "students-csv"
  status: ImportJobStatus;
  fileUrl?: string;
  error?: string;
  meta?: Record<string, any>;
  resultSummary?: Record<string, any>;
}

const ImportJobSchema = new Schema<IImportJob>(
  {
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, required: true },
    status: { type: String, enum: Object.values(ImportJobStatus), default: ImportJobStatus.QUEUED, index: true },
    fileUrl: { type: String },
    error: { type: String },
    meta: { type: Schema.Types.Mixed },
    resultSummary: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

ImportJobSchema.index({ status: 1, createdAt: 1 });

const ImportJobModel = model<IImportJob>('ImportJob', ImportJobSchema);
export default ImportJobModel;
