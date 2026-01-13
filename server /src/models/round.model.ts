import { Schema, model, Document, Types } from "mongoose";

export enum RoundType {
  TEST = "test",
  INTERVIEW = "interview",
  ASSIGNMENT = "assignment",
  GROUP_DISCUSSION = "group_discussion",
  HR = "hr",
}

export enum RoundStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  SKIPPED = "skipped",
}

export interface IRound extends Document {
  _id: Types.ObjectId;
  job: Types.ObjectId;

  roundName: string;
  description?: string;

  type: RoundType;
  status: RoundStatus;

  order: number;              // 👈 IMPORTANT
  roundLocation?: string;
  scheduledAt?: Date;

  createdBy?: Types.ObjectId;
  metadata?: Record<string, any>;
}

const RoundSchema = new Schema<IRound>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    roundName: {
      type: String,
      required: true,
      trim: true,
    },

    description: String,

    type: {
      type: String,
      enum: Object.values(RoundType),
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(RoundStatus),
      default: RoundStatus.ACTIVE,
    },

    order: {
      type: Number,
      required: true,
    },

    roundLocation: String,
    scheduledAt: Date,

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

// ✅ One order per job (NOT one round per job)
RoundSchema.index({ job: 1, order: 1 }, { unique: true });

const RoundModel = model<IRound>("Round", RoundSchema);
export default RoundModel;
