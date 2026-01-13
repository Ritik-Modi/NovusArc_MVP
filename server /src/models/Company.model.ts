import { Schema, model, Document, Types } from "mongoose";
import { CounterModel } from "./counter.model";
import slugify from "slugify";

export interface ICompany extends Document {
  _id: Types.ObjectId;
  name: string;

  companyCode_novusarc?: string; // auto-generated
  companyCode: string;           // manual

  slug?: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  isActive: boolean;
  createdBy?: Types.ObjectId;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },

    // AUTO-GENERATED
    companyCode_novusarc: {
      type: String,
      unique: true,
      index: true,
    },

    // MANUAL
    companyCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    slug: { type: String, lowercase: true, trim: true, index: true },
    website: { type: String },
    logoUrl: { type: String },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// 🔎 text search
CompanySchema.index({ name: "text", description: "text" });

/**
 * AUTO-GENERATE companyCode_novusarc (ONLY ON CREATE)
 */
CompanySchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  if (this.companyCode_novusarc) return next();

  const counter = await CounterModel.findOneAndUpdate(
    { name: "company_novusarc" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const sequence = String(counter.seq).padStart(4, "0");
  this.companyCode_novusarc = `COMP_NOVSARC_${sequence}`;

  // slug auto-set
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  next();
});

const CompanyModel = model<ICompany>("Company", CompanySchema);
export default CompanyModel;
