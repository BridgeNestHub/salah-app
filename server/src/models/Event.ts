import mongoose, { Schema, Document } from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  eventType: { 
    type: String, 
    required: true
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: [Number]
  },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.model('Event', EventSchema);