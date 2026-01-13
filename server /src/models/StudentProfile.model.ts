import { Schema, model, Document, Types } from 'mongoose';

export interface IStudentProfile extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId; // ref to User

  rollNumber?: string;
  collageIdCardUrl?: String,

  dob ?: String,
  fatherName ?: String,
  motherName ?: String,
  fatherNumber ?: String,
  motherNumber ?: String,

  college?: string;
  branch?: string;
  department?: string;

  year?: number;
  semester?: number;

  percentage10th?: number;
  percentage12th?: number;
  cgpa?: number;

  backlogs?: boolean;
  activeBacklogs?: number;

  skills?: string[];

  markSheet10thUrl?: string;
  markSheet12thUrl?: string;
  resumeUrl?: string;

  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    rollNumber: { type: String, index: true, sparse: true },
    collageIdCardUrl: { type: String },

    dob: { type: String },
    fatherName: { type: String },
    motherName: { type: String },
    fatherNumber: { type: String },
    motherNumber: { type: String },


    college: { type: String },
    branch: { type: String },
    department: { type: String },
    
    year: { type: Number },
    semester: { type: Number },

    percentage10th: { type: Number },
    percentage12th: { type: Number },
    cgpa: { type: Number },

    backlogs: { type: Boolean, default: false },
    activeBacklogs: { type: Number, default: 0 },

    skills: [{ type: String }],

    markSheet10thUrl: { type: String },
    markSheet12thUrl: { type: String },
    resumeUrl: { type: String },

    metadata: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }

  },
  { timestamps: true }
);

// ensure one profile per user
StudentProfileSchema.index({ user: 1 }, { unique: true });

const StudentProfileModel = model<IStudentProfile>('StudentProfile', StudentProfileSchema);
export default StudentProfileModel;
