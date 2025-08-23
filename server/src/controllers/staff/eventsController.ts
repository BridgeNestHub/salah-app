import { Request, Response } from 'express';
import Event from '../../models/Event';
import { EventCreateRequest } from '../../../../shared/types';

interface AuthRequest extends Request {
  user?: any;
}

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const eventData: EventCreateRequest = req.body;
    const event = new Event({
      ...eventData,
      createdBy: req.user?._id || 'staff'
    });

    await event.save();

    return res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: 'Failed to create event'
    });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findOne({ 
      _id: req.params.id, 
      createdBy: req.user?._id || 'staff'
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found or unauthorized'
      });
    }

    Object.assign(event, req.body);
    await event.save();

    return res.json({
      success: true,
      data: event,
      message: 'Event updated successfully'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: 'Failed to update event'
    });
  }
};

export const getMyEvents = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const total = await Event.countDocuments({ createdBy: req.user?._id || 'staff' });
    const events = await Event.find({ createdBy: req.user?._id || 'staff' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      success: true,
      data: {
        data: events,
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
      error: 'Failed to fetch events'
    });
  }
};