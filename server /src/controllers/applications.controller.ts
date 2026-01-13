import { Request, Response, NextFunction } from 'express';
import ApplicationModel, { ApplicationStatus } from '../models/Application.model';
import JobModel from '../models/Job.model';
import StudentProfileModel from '../models/StudentProfile.model';

/**
 * Applications controller placeholders
 * - Students apply to jobs
 * - Admins/companies can view, shortlist, reject, hire
 * - Endpoints: apply, list by job, list by student, update status, withdraw
 */

export const applyToJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;
    const { resumeUrl, coverLetter } = req.body;
    const userId = (req as any).user?.userId || (req as any).user?.id;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    // Check if job exists
    const job = await JobModel.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check for duplicate application
    const existingApplication = await ApplicationModel.findOne({
      job: jobId,
      student: userId
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied to this job'
      });
    }

    // Get student profile
    const studentProfile = await StudentProfileModel.findOne({ user: userId });

    const application = new ApplicationModel({
      job: jobId,
      student: userId,
      studentProfile: studentProfile?._id,
      resumeUrl,
      coverLetter,
      status: ApplicationStatus.APPLIED,
      appliedAt: new Date()
    });

    await application.save();
    await application.populate(['job', 'student']);

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { application }
    });
  } catch (error) {
    return next(error);
  }
};

export const listApplicationsForJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    let query: any = { job: jobId };

    if (status) {
      query.status = status;
    }

    const applications = await ApplicationModel.find(query)
      .populate('student', 'name email')
      .populate('studentProfile', 'rollNumber college department cgpa')
      .skip(skip)
      .limit(Number(limit))
      .sort({ appliedAt: -1 });

    const total = await ApplicationModel.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const listApplicationsForStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const skip = (Number(page) - 1) * Number(limit);

    let query: any = { student: userId };

    if (status) {
      query.status = status;
    }

    const applications = await ApplicationModel.find(query)
      .populate('job', 'title company')
      .skip(skip)
      .limit(Number(limit))
      .sort({ appliedAt: -1 });

    const total = await ApplicationModel.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Validate status
    if (!Object.values(ApplicationStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updates: any = { status };
    if (notes) updates.metadata = { ...updates.metadata, notes };

    const application = await ApplicationModel.findByIdAndUpdate(id, updates, {
      new: true
    }).populate(['job', 'student']);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: { application }
    });
  } catch (error) {
    return next(error);
  }
};

export const withdrawApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const application = await ApplicationModel.findByIdAndUpdate(
      id,
      { status: ApplicationStatus.WITHDRAWN },
      { new: true }
    ).populate(['job', 'student']);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully',
      data: { application }
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  applyToJob,
  listApplicationsForJob,
  listApplicationsForStudent,
  updateApplicationStatus,
  withdrawApplication
};
