import { Request, Response } from 'express';
import ContactSubmission from '../../models/ContactSubmission';

export const getContactSubmissions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query: any = {};
    
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await ContactSubmission.countDocuments(query);
    
    const submissions = await ContactSubmission.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('❌ Failed to fetch contact submissions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch contact submissions'
    });
  }
};

export const getSubmissionById = async (req: Request, res: Response) => {
  try {
    const submission = await ContactSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    return res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch submission'
    });
  }
};

export const updateSubmissionStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    const submission = await ContactSubmission.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    return res.json({
      success: true,
      data: submission,
      message: 'Status updated successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update submission status'
    });
  }
};

export const deleteSubmission = async (req: Request, res: Response) => {
  try {
    const submission = await ContactSubmission.findByIdAndDelete(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    return res.json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to delete submission'
    });
  }
};