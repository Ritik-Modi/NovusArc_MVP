import { Request, Response, NextFunction } from 'express';
import InterviewModel, { InterviewStatus } from '../models/Interview.model';
import ApplicationModel from '../models/Application.model';

/**
 * Interviews controller placeholders
 * - Schedule interviews, update status, list by candidate/interviewer/job
 * - Integrates with calendar invites and notifications in full implementation
 */

export const scheduleInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { applicationId, jobId, candidateId, interviewerId, startTime, endTime, mode, location } = req.body;

    if (!applicationId || !candidateId || !startTime) {
      return res.status(400).json({
        success: false,
        message: 'Application ID, candidate ID, and start time are required'
      });
    }

    // Check if application exists
    const application = await ApplicationModel.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check for conflicts (same candidate, overlapping time)
    const startDate = new Date(startTime);
    const endDate = endTime ? new Date(endTime) : new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour default

    const conflict = await InterviewModel.findOne({
      candidate: candidateId,
      startTime: { $lt: endDate },
      endTime: { $gt: startDate },
      status: { $ne: InterviewStatus.CANCELLED }
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'Interview time conflicts with existing interview'
      });
    }

    const interview = new InterviewModel({
      application: applicationId,
      job: jobId,
      candidate: candidateId,
      interviewer: interviewerId,
      startTime: startDate,
      endTime: endDate,
      mode: mode || 'online',
      location,
      status: InterviewStatus.SCHEDULED
    });

    await interview.save();
    await interview.populate(['application', 'candidate', 'interviewer']);

    return res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: { interview }
    });
  } catch (error) {
    return next(error);
  }
};

export const getInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const interview = await InterviewModel.findById(id)
      .populate(['application', 'candidate', 'interviewer', 'job']);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: { interview }
    });
  } catch (error) {
    return next(error);
  }
};

export const listInterviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, candidateId, interviewerId, jobId, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query: any = {};

    if (candidateId) {
      query.candidate = candidateId;
    }

    if (interviewerId) {
      query.interviewer = interviewerId;
    }

    if (jobId) {
      query.job = jobId;
    }

    if (status) {
      query.status = status;
    }

    const interviews = await InterviewModel.find(query)
      .populate(['candidate', 'interviewer', 'job'])
      .skip(skip)
      .limit(Number(limit))
      .sort({ startTime: -1 });

    const total = await InterviewModel.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        interviews,
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

export const updateInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, status, notes, location, mode } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Interview ID is required'
      });
    }

    // Validate status
    if (status && !Object.values(InterviewStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updates: any = {};
    if (startTime) updates.startTime = new Date(startTime);
    if (endTime) updates.endTime = new Date(endTime);
    if (status) updates.status = status;
    if (notes) updates.notes = notes;
    if (location) updates.location = location;
    if (mode) updates.mode = mode;

    const interview = await InterviewModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).populate(['application', 'candidate', 'interviewer', 'job']);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Interview updated successfully',
      data: { interview }
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  scheduleInterview,
  getInterview,
  listInterviews,
  updateInterview
};
