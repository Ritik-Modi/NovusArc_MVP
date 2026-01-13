import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import RoundModel, { RoundType, RoundStatus } from "../models/round.model";
import JobModel from "../models/Job.model";

export const createRound = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId } = req.params; // ✅ From route params
    const {
      roundName,
      description,
      type,
      roundLocation,
      scheduledAt,
    } = req.body;
    const userId = (req as any).user?.id || (req as any).user?.userId;

    // ---------------- VALIDATION ----------------
    if (!roundName || !type) {
      return res.status(400).json({
        success: false,
        message: "roundName and type are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid jobId",
      });
    }

    // Validate type enum
    if (!Object.values(RoundType).includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${Object.values(RoundType).join(", ")}`,
      });
    }

    // Validate scheduledAt if provided
    if (scheduledAt && new Date(scheduledAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "scheduledAt cannot be in the past",
      });
    }

    // ---------------- CHECK JOB ----------------
    const job = await JobModel.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Optional: Check if user has permission to add rounds to this job
    // if (job.createdBy.toString() !== userId) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "You don't have permission to add rounds to this job",
    //   });
    // }

    // ---------------- CHECK DUPLICATE ROUND NAME ----------------
    const existingRound = await RoundModel.findOne({
      job: jobId,
      roundName: roundName.trim(),
    });

    if (existingRound) {
      return res.status(409).json({
        success: false,
        message: "A round with this name already exists for this job",
      });
    }

    // ---------------- AUTO ROUND ORDER ----------------
    const lastRound = await RoundModel.findOne({ job: jobId })
      .sort({ order: -1 })
      .select("order");
    const nextOrder = lastRound ? lastRound.order + 1 : 1;

    // ---------------- CREATE ROUND ----------------
    const round = await RoundModel.create({
      job: jobId,
      roundName: roundName.trim(),
      description,
      type,
      status: RoundStatus.ACTIVE,
      order: nextOrder,
      roundLocation,
      scheduledAt,
      createdBy: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Round created successfully",
      data: round,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRound = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId, id } = req.params; // ✅ From route params
    const {
      roundName,
      description,
      type,
      status,
      roundLocation,
      scheduledAt,
    } = req.body;
    const userId = (req as any).user?.id || (req as any).user?.userId;

    // ---------------- VALIDATION ----------------
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid jobId",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid round id",
      });
    }

    // Validate type if provided
    if (type && !Object.values(RoundType).includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${Object.values(RoundType).join(", ")}`,
      });
    }

    // Validate status if provided
    if (status && !Object.values(RoundStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${Object.values(RoundStatus).join(", ")}`,
      });
    }

    // Validate scheduledAt if provided
    if (scheduledAt && new Date(scheduledAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "scheduledAt cannot be in the past",
      });
    }

    // ---------------- CHECK JOB ----------------
    const job = await JobModel.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // ---------------- FIND ROUND ----------------
    const round = await RoundModel.findOne({ _id: id, job: jobId });
    if (!round) {
      return res.status(404).json({
        success: false,
        message: "Round not found for this job",
      });
    }

    // Optional: Check permission
    // if (round.createdBy?.toString() !== userId) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "You don't have permission to update this round",
    //   });
    // }

    // ---------------- CHECK DUPLICATE NAME ----------------
    if (roundName && roundName.trim() !== round.roundName) {
      const duplicateRound = await RoundModel.findOne({
        job: jobId,
        roundName: roundName.trim(),
        _id: { $ne: id },
      });

      if (duplicateRound) {
        return res.status(409).json({
          success: false,
          message: "A round with this name already exists for this job",
        });
      }
    }

    // ---------------- UPDATE ROUND ----------------
    const updateData: any = {};
    if (roundName) updateData.roundName = roundName.trim();
    if (description !== undefined) updateData.description = description;
    if (type) updateData.type = type;
    if (status) updateData.status = status;
    if (roundLocation !== undefined) updateData.roundLocation = roundLocation;
    if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt;

    const updatedRound = await RoundModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Round updated successfully",
      data: updatedRound,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoundsByJob = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId } = req.params; // ✅ From route params
    const { status, type } = req.query;

    // ---------------- VALIDATION ----------------
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid jobId",
      });
    }

    // ---------------- CHECK JOB ----------------
    const job = await JobModel.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // ---------------- BUILD FILTER ----------------
    const filter: any = { job: jobId };
    if (status) filter.status = status;
    if (type) filter.type = type;

    // ---------------- FETCH ROUNDS ----------------
    const rounds = await RoundModel.find(filter)
      .sort({ order: 1 })
      .populate("createdBy", "name email")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Rounds fetched successfully",
      count: rounds.length,
      data: rounds,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoundById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId, id } = req.params; // ✅ From route params

    // ---------------- VALIDATION ----------------
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid jobId",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid round id",
      });
    }

    // ---------------- CHECK JOB ----------------
    const job = await JobModel.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // ---------------- FETCH ROUND ----------------
    const round = await RoundModel.findOne({ _id: id, job: jobId })
      .populate("job", "title company")
      .populate("createdBy", "name email")
      .lean();

    if (!round) {
      return res.status(404).json({
        success: false,
        message: "Round not found for this job",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Round fetched successfully",
      data: round,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRound = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId, id } = req.params; // ✅ From route params
    const userId = (req as any).user?.id || (req as any).user?.userId;

    // ---------------- VALIDATION ----------------
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid jobId",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid round id",
      });
    }

    // ---------------- CHECK JOB ----------------
    const job = await JobModel.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // ---------------- FIND ROUND ----------------
    const round = await RoundModel.findOne({ _id: id, job: jobId });
    if (!round) {
      return res.status(404).json({
        success: false,
        message: "Round not found for this job",
      });
    }

    // Optional: Check permission
    // if (round.createdBy?.toString() !== userId) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "You don't have permission to delete this round",
    //   });
    // }

    // ---------------- DELETE ROUND ----------------
    await RoundModel.findByIdAndDelete(id);

    // ---------------- REORDER REMAINING ROUNDS ----------------
    // Get all rounds for this job with order greater than deleted round
    const remainingRounds = await RoundModel.find({
      job: jobId,
      order: { $gt: round.order },
    }).sort({ order: 1 });

    // Decrement order for all subsequent rounds
    for (const r of remainingRounds) {
      await RoundModel.findByIdAndUpdate(r._id, { order: r.order - 1 });
    }

    return res.status(200).json({
      success: true,
      message: "Round deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const reorderRounds = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId } = req.params; // ✅ From route params
    const { rounds } = req.body; // Array of { roundId, newOrder }

    // ---------------- VALIDATION ----------------
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid jobId",
      });
    }

    if (!Array.isArray(rounds) || rounds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "rounds array is required with format: [{ roundId, newOrder }]",
      });
    }

    // Validate rounds array structure
    for (const r of rounds) {
      if (!r.roundId || !mongoose.Types.ObjectId.isValid(r.roundId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid roundId in rounds array",
        });
      }
      if (typeof r.newOrder !== "number" || r.newOrder < 1) {
        return res.status(400).json({
          success: false,
          message: "newOrder must be a positive number",
        });
      }
    }

    // ---------------- CHECK JOB ----------------
    const job = await JobModel.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // ---------------- VALIDATE ROUNDS BELONG TO JOB ----------------
    const roundIds = rounds.map((r) => r.roundId);
    const existingRounds = await RoundModel.find({
      _id: { $in: roundIds },
      job: jobId,
    });

    if (existingRounds.length !== rounds.length) {
      return res.status(400).json({
        success: false,
        message: "Some rounds don't belong to this job or don't exist",
      });
    }

    // Check for duplicate orders
    const orders = rounds.map((r) => r.newOrder);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      return res.status(400).json({
        success: false,
        message: "Duplicate order values are not allowed",
      });
    }

    // ---------------- UPDATE ORDERS ----------------
    // Two-pass update to avoid unique index conflicts:
    // Pass 1: Set all to temporary negative values
    // Pass 2: Set to final values
    
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Pass 1: Set temporary negative orders to avoid conflicts
      const tempOps = rounds.map((r, index) => ({
        updateOne: {
          filter: { _id: r.roundId, job: jobId },
          update: { order: -(index + 1) }, // Use negative numbers as temp values
        },
      }));
      await RoundModel.bulkWrite(tempOps, { session });

      // Pass 2: Set final order values
      const finalOps = rounds.map((r) => ({
        updateOne: {
          filter: { _id: r.roundId, job: jobId },
          update: { order: r.newOrder },
        },
      }));
      await RoundModel.bulkWrite(finalOps, { session });

      await session.commitTransaction();

      const updatedRounds = await RoundModel.find({ job: jobId }).sort({
        order: 1,
      });

      return res.status(200).json({
        success: true,
        message: "Rounds reordered successfully",
        data: updatedRounds,
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    next(error);
  }
};


export default {
  createRound,
  updateRound,
  getRoundsByJob,
  getRoundById,
  deleteRound,
  reorderRounds,
};