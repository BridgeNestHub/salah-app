import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  eventType: 'islamic_holiday' | 'community_event' | 'educational' | 'community_services' | 'youth_sports' | 'faith_programs' | 'social_justice' | 'access_services' | 'health_advocacy' | 'environment_climate' | 'drug_violence_prevention' | 'voter_education' | 'mental_health' | 'youth_education';
  startDate: Date;
  endDate: Date;
  location: {
    name: string;
    address: string;
    coordinates: [number, number];
  };
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  eventType: { 
    type: String, 
    required: true, 
    enum: ['islamic_holiday', 'community_event', 'educational', 'community_services', 'youth_sports', 'faith_programs', 'social_justice', 'access_services', 'health_advocacy', 'environment_climate', 'drug_violence_prevention', 'voter_education', 'mental_health', 'youth_education'] 
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