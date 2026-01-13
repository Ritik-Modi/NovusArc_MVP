import { Request, Response, NextFunction } from 'express';
import JobModel, { JobStatus, JobType } from '../models/Job.model';
import CompanyModel from '../models/Company.model';
import { uploadToCloudinary } from '../utils/upload';
import mongoose from "mongoose";


/**
 * Jobs controller placeholders
 * - CRUD for Job postings
 * - Apply filters, status transitions (draft -> open -> closed)
 * - Endpoints: list, get, create, update, close, apply (application handled elsewhere)
 */

export const listJobs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      type,
      company,
      status,
    } = req.query;

    // ---------------- PAGINATION SAFE GUARDS ----------------
    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Math.max(Number(limit), 1), 50); // max 50
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};

    // ---------------- STATUS FILTER ----------------
    // default: only open jobs (public)
    // if (status) {
    //   query.status = status;
    // } else {
    //   query.status = "open";
    // }

    // ---------------- TYPE FILTER ----------------
    if (type) {
      query.type = type;
    }

    // ---------------- COMPANY FILTER ----------------
    if (company) {
      if (!mongoose.Types.ObjectId.isValid(company as string)) {
        return res.status(400).json({
          success: false,
          message: "Invalid company id",
        });
      }
      query.company = company;
    }

    // ---------------- SEARCH (FAST TEXT SEARCH) ----------------
    if (search) {
      query.$text = { $search: search as string };
    }

    // ---------------- FETCH DATA ----------------
    const [jobs, total] = await Promise.all([
      JobModel.find(query)
        .populate("company", "name logoUrl")
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),

      JobModel.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const job = await JobModel.findById(id)
      .populate('company', 'name logoUrl website')
      .populate('postedBy', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: { job }
    });
  } catch (error) {
    return next(error);
  }
};

export const createJob = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      company,
      description,
      location,
      salaryRange,
      type,
      tags,
      applicationDeadline,
      listedAt,
      eligibilityCriteria,
    } = req.body;

    const userId = (req as any).user?.userId || (req as any).user?.id;

    if (!title || !company) {
      return res.status(400).json({
        success: false,
        message: "title and company are required",
      });
    }

    // ---------------- COMPANY CHECK ----------------
    const companyExists = await CompanyModel.findById(company);
    if (!companyExists) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // ---------------- DUPLICATE TITLE (PER COMPANY) ----------------
    const titleExists = await JobModel.findOne({
      title: { $regex: `^${title}$`, $options: "i" },
      company,
    });

    if (titleExists) {
      return res.status(409).json({
        success: false,
        message: "Job with this title already exists for this company",
      });
    }

    // ---------------- ATTACHMENTS ----------------
    let additionalAttechments: string[] = [];
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files?.additionalAttechments?.length) {
      for (const file of files.additionalAttechments) {
        const result = await uploadToCloudinary(
          file.buffer,
          "job_attachments",
          file.originalname,
          file.mimetype
        );
        additionalAttechments.push(result.secure_url);
      }
    }

    // ---------------- CREATE JOB ----------------
    const job = await JobModel.create({
      title: title.trim(),
      company,
      description,
      location,
      salaryRange,
      type: type || JobType.FULL_TIME,
      status: JobStatus.OPEN,
      postedBy: userId,
      tags,
      applicationDeadline,
      listedAt,
      eligibilityCriteria,
      additionalAttechments,
    });

    await job.populate("company", "name logoUrl");

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};



export const updateJob = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // ---------------- ID VALIDATION ----------------
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job id",
      });
    }

    const body = req.body || {};
    const {
      title,
      description,
      location,
      type,
      applicationDeadline,
      status,
    } = body;

    const updates: any = {};

    if (title) updates.title = title.trim();
    if (description) updates.description = description;
    if (location) updates.location = location;
    if (type) updates.type = type;
    if (status) updates.status = status;

    // ---------------- TAGS (form-data safe) ----------------
    if (body.tags) {
      updates.tags = Array.isArray(body.tags)
        ? body.tags
        : [body.tags];
    }

    // ---------------- SALARY RANGE ----------------
    if (body.salaryRange) {
      try {
        updates.salaryRange =
          typeof body.salaryRange === "string"
            ? JSON.parse(body.salaryRange)
            : body.salaryRange;
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid salaryRange format",
        });
      }
    }

    // ---------------- APPLICATION DEADLINE ----------------
    if (applicationDeadline) {
      updates.applicationDeadline = new Date(applicationDeadline);
    }

    // ---------------- FILE UPLOAD (OPTIONAL) ----------------
    const files = req.files as { [key: string]: Express.Multer.File[] };

    if (files?.additionalAttechments?.length) {
      updates.$push = {
        additionalAttechments: {
          $each: [],
        },
      };

      for (const file of files.additionalAttechments) {
        const result = await uploadToCloudinary(
          file.buffer,
          "job_attachments",
          file.originalname,
          file.mimetype
        );
        updates.$push.additionalAttechments.$each.push(
          result.secure_url
        );
      }
    }

    // 🚫 NEVER ALLOW jobCode UPDATE
    delete updates.jobCode;

    const job = await JobModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("company", "name logoUrl");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};


export const closeJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const job = await JobModel.findByIdAndUpdate(
      id,
      { status: JobStatus.CLOSED },
      { new: true }
    ).populate('company', 'name logoUrl');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Job closed successfully',
      data: { job }
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  listJobs,
  getJob,
  createJob,
  updateJob,
  closeJob
};
