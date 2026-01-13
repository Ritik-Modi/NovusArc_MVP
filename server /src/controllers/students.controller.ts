/// <reference path="../types/express.d.ts" />

import { Request, Response, NextFunction } from 'express';
import { uploadToCloudinary } from '../utils/upload';
import StudentProfileModel from '../models/StudentProfile.model';
import UserModel from '../models/User.model';
import fs from 'fs';
import cloudinary from 'cloudinary';

/**
 * Students controller placeholders
 * - Manage student profiles (student-facing + admin-facing)
 * - Import/export hooks may reference these endpoints
 * - Endpoints: list, get, create (maybe via import), update profile, upload resume
 */

export const listStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, role = 'student', search, college, department, year } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query: any = {};

    if (college) {
      query.college = college;
    }

    if (department) {
      query.department = department;
    }

    if (year) {
      query.year = Number(year);
    }

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await UserModel.find(query)
      .select('-password')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await UserModel.countDocuments(query);

    // Populate student profiles
    const studentsWithProfiles = await Promise.all(
      students.map(async (student) => {
        let studentProfile = await StudentProfileModel.findOne({ user: student._id }).populate(
          'user',
          'name email',
        );

        let autoCreated = false;
        if (!studentProfile) {
          // Create empty profile
          studentProfile = new StudentProfileModel({
            user: student._id,
          });
          await studentProfile.save();
          autoCreated = true;
        }

        // Ensure all fields are included in the response, even if null/undefined
        const profileData = studentProfile.toObject();
        const fullProfile = {
          _id: profileData._id,
          // user: profileData.user,
          rollNumber: profileData.rollNumber || null,
          collageIdCardUrl: profileData.collageIdCardUrl || null,

          dob: profileData.dob || null,
          fatherName: profileData.fatherName || null,
          motherName: profileData.motherName || null,
          fatherNumber: profileData.fatherNumber || null,
          motherNumber: profileData.motherNumber || null,

          college: profileData.college || null,
          branch: profileData.branch || null,
          department: profileData.department || null,

          year: profileData.year || null,
          semester: profileData.semester || null,

          percentage10th: profileData.percentage10th || null,
          percentage12th: profileData.percentage12th || null,
          cgpa: profileData.cgpa || null,

          backlogs: profileData.backlogs || false,
          activeBacklogs: profileData.activeBacklogs || 0,

          skills: profileData.skills || [],

          markSheet10thUrl: profileData.markSheet10thUrl || null,
          markSheet12thUrl: profileData.markSheet12thUrl || null,
          resumeUrl: profileData.resumeUrl || null,

          metadata: profileData.metadata || null,
          createdAt: profileData.createdAt,
          updatedAt: profileData.updatedAt,
          __v: profileData.__v,
        };

        return {
          student,
          studentProfile: fullProfile,
          autoCreated,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      data: {
        students: studentsWithProfiles,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const student = await UserModel.findById(id).select('-password');

    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    let studentProfile = await StudentProfileModel.findOne({ user: id }).populate(
      'user',
      'name email',
    );

    let autoCreated = false;
    if (!studentProfile) {
      // Create empty profile
      studentProfile = new StudentProfileModel({
        user: id,
      });
      await studentProfile.save();
      autoCreated = true;
    }

    // Ensure all fields are included
    const profileData = studentProfile.toObject();
    const fullProfile = {
      _id: profileData._id,
      // user: profileData.user,
      rollNumber: profileData.rollNumber || null,
      collageIdCardUrl: profileData.collageIdCardUrl || null,

      dob: profileData.dob || null,
      fatherName: profileData.fatherName || null,
      motherName: profileData.motherName || null,
      fatherNumber: profileData.fatherNumber || null,
      motherNumber: profileData.motherNumber || null,

      college: profileData.college || null,
      branch: profileData.branch || null,
      department: profileData.department || null,

      year: profileData.year || null,
      semester: profileData.semester || null,

      percentage10th: profileData.percentage10th || null,
      percentage12th: profileData.percentage12th || null,
      cgpa: profileData.cgpa || null,

      backlogs: profileData.backlogs || false,
      activeBacklogs: profileData.activeBacklogs || 0,

      skills: profileData.skills || [],

      markSheet10thUrl: profileData.markSheet10thUrl || null,
      markSheet12thUrl: profileData.markSheet12thUrl || null,
      resumeUrl: profileData.resumeUrl || null,

      metadata: profileData.metadata || null,
      createdAt: profileData.createdAt,
      updatedAt: profileData.updatedAt,
      __v: profileData.__v,
    };

    return res.status(200).json({
      success: true,
      data: {
        student,
        studentProfile: fullProfile,
        autoCreated,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateStudent = async (
  req: Request, // Use the existing extended Request type
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const user = req.user; // This is already typed as IUser | null | undefined

    console.log('Authenticated user:', user);

    // Authorization: Admins/faculty can update any profile; students can only update their own
    if (!user || (user.role !== 'admin' && user._id.toString() !== id)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to update this profile',
      });
    }

    const {
      rollNumber,
      collageIdCardUrl,
      dob,
      fatherName,
      motherName,
      fatherNumber,
      motherNumber,
      college,
      branch,
      department,
      year,
      semester,
      percentage10th,
      percentage12th,
      cgpa,
      backlogs,
      activeBacklogs,
      skills,
      markSheet10thUrl,
      markSheet12thUrl,
      resumeUrl,
      metadata,
    } = req.body;

    // Validate inputs
    if (cgpa !== undefined && (cgpa < 0 || cgpa > 10)) {
      return res.status(400).json({
        success: false,
        message: 'CGPA must be between 0 and 10',
      });
    }
    if (year !== undefined && (year < 1 || year > 4)) {
      return res.status(400).json({
        success: false,
        message: 'Year must be between 1 and 4',
      });
    }
    if (semester !== undefined && (semester < 1 || semester > 8)) {
      return res.status(400).json({
        success: false,
        message: 'Semester must be between 1 and 8',
      });
    }

    // Check if user exists and is a student
    const userCheck = await UserModel.findById(id);
    if (!userCheck || userCheck.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const updates: any = {};

    // Add text fields to updates
    if (rollNumber !== undefined) updates.rollNumber = rollNumber;
    if (dob !== undefined) updates.dob = dob;
    if (fatherName !== undefined) updates.fatherName = fatherName;
    if (motherName !== undefined) updates.motherName = motherName;
    if (fatherNumber !== undefined) updates.fatherNumber = fatherNumber;
    if (motherNumber !== undefined) updates.motherNumber = motherNumber;
    if (college !== undefined) updates.college = college;
    if (branch !== undefined) updates.branch = branch;
    if (department !== undefined) updates.department = department;
    if (year !== undefined) updates.year = year;
    if (semester !== undefined) updates.semester = semester;
    if (percentage10th !== undefined) updates.percentage10th = percentage10th;
    if (percentage12th !== undefined) updates.percentage12th = percentage12th;
    if (cgpa !== undefined) updates.cgpa = cgpa;
    if (backlogs !== undefined) updates.backlogs = backlogs;
    if (activeBacklogs !== undefined) updates.activeBacklogs = activeBacklogs;
    if (skills !== undefined) updates.skills = skills;
    if (metadata !== undefined) updates.metadata = metadata;

    // Handle file uploads from buffers
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    try {
      // Upload resume
      if (files?.resume && files.resume[0]) {
        console.log('Uploading resume...');
        const result = await uploadToCloudinary(
          files.resume[0].buffer,
          'students/resumes',
          files.resume[0].originalname,
          files.resume[0].mimetype,
        );
        updates.resumeUrl = result.secure_url;
        console.log('Resume uploaded:', result.secure_url);
      } else if (resumeUrl) {
        updates.resumeUrl = resumeUrl;
      }

      // Upload 10th marksheet
      if (files?.markSheet10th && files.markSheet10th[0]) {
        console.log('Uploading 10th marksheet...');
        const result = await uploadToCloudinary(
          files.markSheet10th[0].buffer,
          'students/marksheets',
          files.markSheet10th[0].originalname,
        );
        updates.markSheet10thUrl = result.secure_url;
        console.log('10th marksheet uploaded:', result.secure_url);
      } else if (markSheet10thUrl) {
        updates.markSheet10thUrl = markSheet10thUrl;
      }

      // Upload 12th marksheet
      if (files?.markSheet12th && files.markSheet12th[0]) {
        console.log('Uploading 12th marksheet...');
        const result = await uploadToCloudinary(
          files.markSheet12th[0].buffer,
          'students/marksheets',
          files.markSheet12th[0].originalname,
        );
        updates.markSheet12thUrl = result.secure_url;
        console.log('12th marksheet uploaded:', result.secure_url);
      } else if (markSheet12thUrl) {
        updates.markSheet12thUrl = markSheet12thUrl;
      }

      // Upload college ID card
      if (files?.collageIdCard && files.collageIdCard[0]) {
        console.log('Uploading college ID card...');
        const result = await uploadToCloudinary(
          files.collageIdCard[0].buffer,
          'students/id-cards',
          files.collageIdCard[0].originalname,
        );
        updates.collageIdCardUrl = result.secure_url;
        console.log('College ID card uploaded:', result.secure_url);
      } else if (collageIdCardUrl) {
        updates.collageIdCardUrl = collageIdCardUrl;
      }
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload files to cloud storage',
        error: uploadError instanceof Error ? uploadError.message : 'Unknown error',
      });
    }

    // Update student profile in database
    const studentProfile = await StudentProfileModel.findOneAndUpdate({ user: id }, updates, {
      new: true,
      runValidators: true,
    }).populate('user', 'name email');

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    // Format response
    const profileData = studentProfile.toObject();
    const fullProfile = {
      _id: profileData._id,
      rollNumber: profileData.rollNumber || null,
      collageIdCardUrl: profileData.collageIdCardUrl || null,
      dob: profileData.dob || null,
      fatherName: profileData.fatherName || null,
      motherName: profileData.motherName || null,
      fatherNumber: profileData.fatherNumber || null,
      motherNumber: profileData.motherNumber || null,
      college: profileData.college || null,
      branch: profileData.branch || null,
      department: profileData.department || null,
      year: profileData.year || null,
      semester: profileData.semester || null,
      percentage10th: profileData.percentage10th || null,
      percentage12th: profileData.percentage12th || null,
      cgpa: profileData.cgpa || null,
      backlogs: profileData.backlogs || false,
      activeBacklogs: profileData.activeBacklogs || 0,
      skills: profileData.skills || [],
      markSheet10thUrl: profileData.markSheet10thUrl || null,
      markSheet12thUrl: profileData.markSheet12thUrl || null,
      resumeUrl: profileData.resumeUrl || null,
      metadata: profileData.metadata || null,
      createdAt: profileData.createdAt,
      updatedAt: profileData.updatedAt,
      __v: profileData.__v,
    };

    return res.status(200).json({
      success: true,
      message: 'Student profile updated successfully',
      data: { studentProfile: fullProfile },
    });
  } catch (error) {
    console.error('Error in updateStudent:', error);
    return next(error);
  }
};

export const uploadResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    console.log("user:", user);
    
    if (!user || user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the student can upload their resume',
      });
    }

    const { resumeUrl } = req.body;
    const updates: any = {};
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Handle file upload with proper error handling
    if (files?.resume && files.resume[0]) {
      try {
        console.log('=== FILE UPLOAD DEBUG ===');
    console.log('File size:', files.resume[0].size);
    console.log('File mimetype:', files.resume[0].mimetype);
    console.log('File originalname:', files.resume[0].originalname);
    console.log('Buffer length:', files.resume[0].buffer.length);
    console.log('========================');
        console.log('Uploading resume...');
        const result = await uploadToCloudinary(
          files.resume[0].buffer,
          'students/resumes',
          files.resume[0].originalname,
          files.resume[0].mimetype,
        );
        updates.resumeUrl = result.secure_url;
        console.log('Resume uploaded:', result.secure_url);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload resume to cloud storage',
          error: uploadError instanceof Error ? uploadError.message : 'Unknown error',
        });
      }
    } else if (resumeUrl) {
      updates.resumeUrl = resumeUrl;
    } else {
      return res.status(400).json({
        success: false,
        message: 'No resume file or URL provided',
      });
    }

    // Verify updates object is not empty
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No resume data to update',
      });
    }

    // Update student profile in database
    const studentProfile = await StudentProfileModel.findOneAndUpdate(
      { user: user._id }, 
      updates, 
      {
        new: true,
        runValidators: true,
      }
    ).populate('user', 'name email');

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const profileData = studentProfile.toObject();
    const fullProfile = {
      _id: profileData._id,
      rollNumber: profileData.rollNumber || null,
      collageIdCardUrl: profileData.collageIdCardUrl || null,
      dob: profileData.dob || null,
      fatherName: profileData.fatherName || null,
      motherName: profileData.motherName || null,
      fatherNumber: profileData.fatherNumber || null,
      motherNumber: profileData.motherNumber || null,
      college: profileData.college || null,
      branch: profileData.branch || null,
      department: profileData.department || null,
      year: profileData.year || null,
      semester: profileData.semester || null,
      percentage10th: profileData.percentage10th || null,
      percentage12th: profileData.percentage12th || null,
      cgpa: profileData.cgpa || null,
      backlogs: profileData.backlogs || false,
      activeBacklogs: profileData.activeBacklogs || 0,
      skills: profileData.skills || [],
      markSheet10thUrl: profileData.markSheet10thUrl || null,
      markSheet12thUrl: profileData.markSheet12thUrl || null,
      resumeUrl: profileData.resumeUrl || null,
      metadata: profileData.metadata || null,
      createdAt: profileData.createdAt,
      updatedAt: profileData.updatedAt,
      __v: profileData.__v,
    };

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: { studentProfile: fullProfile },
    });
  } catch (error) {
    console.error('Error in uploadResume:', error);
    return next(error);
  }
};


export default {
  listStudents,
  getStudent,
  updateStudent,
  uploadResume,
};
