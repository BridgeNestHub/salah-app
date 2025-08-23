import { Request, Response } from 'express';
import Event from '../../models/Event';
import { ApiResponse, PaginatedResponse } from '../../../../shared/types';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      eventType, 
      search, 
      startDate, 
      endDate 
    } = req.query;

    const query: any = { isActive: true };
    
    if (eventType) query.eventType = eventType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate as string);
      if (endDate) query.startDate.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Event.countDocuments(query);
    
    const events = await Event.find(query)
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'profile.name');

    const response: ApiResponse<PaginatedResponse<typeof events[0]>> = {
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
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const event = await Event.findOne({ 
      _id: req.params.id, 
      isActive: true 
    }).populate('createdBy', 'profile.name');

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    return res.json({
      success: true,
      data: event
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch event'
    });
  }
};