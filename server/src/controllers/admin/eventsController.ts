import { Request, Response } from 'express';
import Event from '../../models/Event';
import { EventCreateRequest } from '../../types/shared';

interface AuthRequest extends Request {
  user?: any;
}

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const eventData: EventCreateRequest = req.body;
    
    // Input validation
    if (!eventData.title || !eventData.description || !eventData.eventType) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, and event type are required'
      });
    }

    const event = new Event({
      ...eventData,
      createdBy: req.user?._id || 'admin'
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

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

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

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    return res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to delete event'
    });
  }
};

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, eventType, search } = req.query;
    const query: any = {};
    
    if (eventType) query.eventType = eventType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Event.countDocuments(query);
    
    const events = await Event.find(query)
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