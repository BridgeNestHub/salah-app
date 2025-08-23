import { Request, Response } from 'express';
import ContactSubmission from '../../models/ContactSubmission';

export const getContactSubmissions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query: any = {};
    
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await ContactSubmission.countDocuments(query);
    
    const submissions = await ContactSubmission.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      success: true,
      data: {
        data: submissions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch contact submissions'
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