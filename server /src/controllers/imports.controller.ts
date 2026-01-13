import { Request, Response, NextFunction } from 'express';
import ImportJobModel, { ImportJobStatus } from '../models/ImportJob.model';

/**
 * Imports controller placeholders
 * - Handle creating ImportJob records, uploading files, listing import history, downloading error reports
 * - Endpoints: create import job, get job status, list imports, retry failed imports
 */

export const createImportJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileUrl, importType } = req.body;
    const userId = (req as any).user?.userId || (req as any).user?.id;

    if (!fileUrl || !importType) {
      return res.status(400).json({
        success: false,
        message: 'File URL and import type are required'
      });
    }

    // Validate import type
    const validTypes = ['students', 'companies', 'jobs'];
    if (!validTypes.includes(importType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid import type. Must be one of: students, companies, jobs'
      });
    }

    const importJob = new ImportJobModel({
      fileUrl,
      importType,
      createdBy: userId,
      status: 'pending',
      progress: 0,
      summary: {
        total: 0,
        successful: 0,
        failed: 0
      }
    });

    await importJob.save();

    // TODO: Enqueue BullMQ job for processing

    return res.status(201).json({
      success: true,
      message: 'Import job created successfully',
      data: { importJob }
    });
  } catch (error) {
    return next(error);
  }
};

export const getImportJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const importJob = await ImportJobModel.findById(id)
      .populate('createdBy', 'name email');

    if (!importJob) {
      return res.status(404).json({
        success: false,
        message: 'Import job not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: { importJob }
    });
  } catch (error) {
    return next(error);
  }
};

export const listImportJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, status, importType } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query: any = {};

    if (status) {
      query.status = status;
    }

    if (importType) {
      query.importType = importType;
    }

    const importJobs = await ImportJobModel.find(query)
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await ImportJobModel.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        importJobs,
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

export const retryImportJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const importJob = await ImportJobModel.findById(id);

    if (!importJob) {
      return res.status(404).json({
        success: false,
        message: 'Import job not found'
      });
    }

    // Check if job is in failed state
    if (importJob.status !== 'failed') {
      return res.status(400).json({
        success: false,
        message: 'Import job can only be retried if it is in failed state'
      });
    }

    // Reset job status
    importJob.status = ImportJobStatus.QUEUED;
    importJob.resultSummary = {
      total: 0,
      successful: 0,
      failed: 0
    };

    await importJob.save();

    // TODO: Enqueue BullMQ job for processing

    return res.status(200).json({
      success: true,
      message: 'Import job queued for retry',
      data: { importJob }
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  createImportJob,
  getImportJob,
  listImportJobs,
  retryImportJob
};
