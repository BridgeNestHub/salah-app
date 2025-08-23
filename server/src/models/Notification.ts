import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  type: 'general' | 'prayer_reminder' | 'event' | 'system';
  targetAudience: 'all' | 'users' | 'specific';
  targetUsers: mongoose.Types.ObjectId[];
  scheduledFor: Date;
  sent: boolean;
  sentAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['general', 'prayer_reminder', 'event', 'system'] 
  },
  targetAudience: { 
    type: String, 
    required: true, 
    enum: ['all', 'users', 'specific'] 
  },
  targetUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  scheduledFor: { type: Date, default: Date.now },
  sent: { type: Boolean, default: false },
  sentAt: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

NotificationSchema.index({ scheduledFor: 1, sent: 1 });
NotificationSchema.index({ targetAudience: 1 });
NotificationSchema.index({ type: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);