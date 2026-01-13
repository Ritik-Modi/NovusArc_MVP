import { Request, Response, NextFunction } from 'express';
import ApplicationModel, { ApplicationStatus } from '../models/Application.model';
import StudentProfileModel from '../models/StudentProfile.model';
import CompanyModel from '../models/Company.model';
import JobModel from '../models/Job.model';

/**
 * Analytics controller placeholders
 * - Expose aggregated metrics (placements, conversion funnels, CTC tiers, company-wise stats)
 * - Endpoints: dashboard summary, placements over time, company metrics, export reports
 */

export const dashboardSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Total students
    const totalStudents = await StudentProfileModel.countDocuments();

    // Total placed (hired applications)
    const totalPlaced = await ApplicationModel.countDocuments({
      status: ApplicationStatus.HIRED
    });

    // Total applications
    const totalApplications = await ApplicationModel.countDocuments();

    // Total companies
    const totalCompanies = await CompanyModel.countDocuments({ isActive: true });

    // Total active jobs
    const totalJobs = await JobModel.countDocuments({ status: 'open' });

    // Average CGPA of placed students
    const placedStudents = await ApplicationModel.find({
      status: ApplicationStatus.HIRED
    }).populate('studentProfile');

    const cgpas = placedStudents
      .map((app: any) => app.studentProfile?.cgpa)
      .filter((cgpa: any) => cgpa);

    const avgCGPA = cgpas.length > 0
      ? (cgpas.reduce((a: number, b: number) => a + b, 0) / cgpas.length).toFixed(2)
      : 'N/A';

    // Conversion rate (hired / applied)
    const conversionRate = totalApplications > 0
      ? ((totalPlaced / totalApplications) * 100).toFixed(2)
      : 0;

    // Top companies by hires
    const topCompanies = await ApplicationModel.aggregate([
      { $match: { status: ApplicationStatus.HIRED } },
      {
        $group: {
          _id: '$job',
          hireCount: { $sum: 1 }
        }
      },
      { $sort: { hireCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'job'
        }
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'job.company',
          foreignField: '_id',
          as: 'company'
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalPlaced,
        totalApplications,
        totalCompanies,
        totalJobs,
        avgCGPA,
        conversionRate: `${conversionRate}%`,
        topCompanies: topCompanies.map((tc: any) => ({
          name: tc.company[0]?.name || 'Unknown',
          hires: tc.hireCount
        }))
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const placementsOverTime = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { months = 12 } = req.query;

    const placementsData = await ApplicationModel.aggregate([
      { $match: { status: ApplicationStatus.HIRED } },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: Number(months) }
    ]);

    // Format data for chart
    const formattedData = placementsData.map((item: any) => ({
      month: `${item._id.month}/${item._id.year}`,
      placements: item.count
    }));

    return res.status(200).json({
      success: true,
      data: {
        placements: formattedData
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const companyMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.query;

    let query: any = {};
    if (companyId) {
      query.company = companyId;
    }

    // Get all company metrics
    const companyMetrics = await JobModel.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: 'job',
          as: 'applications'
        }
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'company',
          foreignField: '_id',
          as: 'company'
        }
      },
      {
        $group: {
          _id: '$company',
          totalJobs: { $sum: 1 },
          totalApplications: { $sum: { $size: '$applications' } },
          totalHires: {
            $sum: {
              $size: {
                $filter: {
                  input: '$applications',
                  as: 'app',
                  cond: { $eq: ['$$app.status', ApplicationStatus.HIRED] }
                }
              }
            }
          }
        }
      }
    ]);

    // Format response
    const metrics = companyMetrics.map((metric: any) => ({
      company: metric._id[0]?.name || 'Unknown',
      totalJobs: metric.totalJobs,
      totalApplications: metric.totalApplications,
      totalHires: metric.totalHires,
      hireRate: metric.totalApplications > 0
        ? ((metric.totalHires / metric.totalApplications) * 100).toFixed(2)
        : 0
    }));

    return res.status(200).json({
      success: true,
      data: {
        metrics
      }
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  dashboardSummary,
  placementsOverTime,
  companyMetrics
};
