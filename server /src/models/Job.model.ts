import { Schema, model, Document, Types } from "mongoose";
import { CounterModel } from "./counter.model";

export enum JobType {
  FULL_TIME = "full_time",
  PART_TIME = "part_time",
  INTERN = "intern",
  CONTRACT = "contract",
}

export enum JobStatus {
  DRAFT = "draft",
  OPEN = "open",
  CLOSED = "closed",
  ARCHIVED = "archived",
}

export interface IJob extends Document {
  _id: Types.ObjectId;
  title: string;
  jobCode?: string; // auto-generated
  company: Types.ObjectId;

  description?: string;
  location?: string;
  salaryRange?: { min?: number; max?: number };
  type?: JobType;
  status: JobStatus;
  postedBy?: Types.ObjectId;

  tags?: string[];
  applicationDeadline?: Date;
  listedAt?: Date;
  eligibilityCriteria?: string[];
  additionalAttechments?: string[];

  metadata?: Record<string, any>;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },

    jobCode: {
      type: String,
      unique: true,
      index: true,
    },

    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    description: String,
    location: String,

    salaryRange: {
      min: Number,
      max: Number,
    },

    type: {
      type: String,
      enum: Object.values(JobType),
      default: JobType.FULL_TIME,
    },

    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.DRAFT,
      index: true,
    },

    postedBy: { type: Schema.Types.ObjectId, ref: "User" },

    tags: [String],
    applicationDeadline: Date,
    listedAt: Date,

    eligibilityCriteria: [String],
    additionalAttechments: [String],

    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

// 🔍 indexes
JobSchema.index({ title: "text", description: "text", tags: "text" });
JobSchema.index({ company: 1, status: 1 });

// 🚫 Same title only once per company
JobSchema.index({ title: 1, company: 1 }, { unique: true });

/**
 * AUTO-GENERATE jobCode (SAFE)
 */
JobSchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  if (this.jobCode) return next();

  const counter = await CounterModel.findOneAndUpdate(
    { name: "job" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const sequence = String(counter.seq).padStart(4, "0");
  this.jobCode = `JOB_${sequence}`;

  next();
});

const JobModel = model<IJob>("Job", JobSchema);
export default JobModel;
