import { Request, Response, NextFunction } from 'express';
import CompanyModel from '../models/Company.model';
import { slugify } from '../utils/validators';
import JobModel from '../models/Job.model';
import { uploadToCloudinary } from '../utils/upload';

/**
 * Companies controller placeholders
 * - CRUD for companies
 * - Company profile, logo upload, link jobs posted by company
 */

export const listCompanies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query: any = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const companies = await CompanyModel.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await CompanyModel.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        companies,
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

export const getCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const company = await CompanyModel.findOne({
      $or: [
        { _id: id },
        { slug: id }
      ]
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    let jobs = await JobModel.find({ company: company._id, })

    return res.status(200).json({
      success: true,
      data: { company, jobs }
    });
  } catch (error) {
    return next(error);
  }
};

export const createCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { name, website, description, companyCode } = req.body;
    const userId = (req as any).user?.id || (req as any).user?.userId;

    if (!name || !companyCode) {
      return res.status(400).json({
        success: false,
        message: "name and companyCode are required",
      });
    }

    name = name.trim();
    companyCode = companyCode.trim().toUpperCase();

    // ❌ duplicate name
    const nameExists = await CompanyModel.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });
    if (nameExists) {
      return res.status(409).json({
        success: false,
        message: "Company name already exists",
      });
    }

    // ❌ duplicate companyCode
    const codeExists = await CompanyModel.findOne({ companyCode });
    if (codeExists) {
      return res.status(409).json({
        success: false,
        message: "companyCode already exists",
      });
    }

    // ---------------- LOGO UPLOAD ----------------
    let logoUrl: string | undefined;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files?.logo?.[0]) {
      const result = await uploadToCloudinary(
        files.logo[0].buffer,
        "company_logos",
        files.logo[0].originalname
      );
      logoUrl = result.secure_url;
    }

    const company = await CompanyModel.create({
      name,
      companyCode,
      slug: slugify(name),
      website,
      description,
      logoUrl,
      createdBy: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: company,
    });
  } catch (error) {
    next(error);
  }
};


export const updateCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, website, description } = req.body;

    const updates: any = {};

    if (name) {
      const exists = await CompanyModel.findOne({
        _id: { $ne: id },
        name: { $regex: `^${name}$`, $options: "i" },
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Company name already exists",
        });
      }

      updates.name = name.trim();
      updates.slug = slugify(name);
    }

    if (website) updates.website = website;
    if (description) updates.description = description;

    // LOGO UPDATE
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (files?.logo?.[0]) {
      const result = await uploadToCloudinary(
        files.logo[0].buffer,
        "company_logos",
        files.logo[0].originalname
      );
      updates.logoUrl = result.secure_url;
    }

    // 🚫 DO NOT ALLOW CODE UPDATES
    delete updates.companyCode;
    delete updates.companyCode_novusarc;

    const company = await CompanyModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company updated successfully",
      data: company,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const company = await CompanyModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    return next(error);
  }
};


export const restoreCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const company = await CompanyModel.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Company restored successfully',
      data: company
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
}

export default {
  listCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany
};
