import mongoose, { Schema, Document } from 'mongoose';

export interface IContactSubmission extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSubmissionSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    default: 'pending'
  }
}, {
  timestamps: true
});

ContactSubmissionSchema.index({ status: 1 });
ContactSubmissionSchema.index({ createdAt: -1 });

const ContactSubmission = mongoose.model<IContactSubmission>('ContactSubmission', ContactSubmissionSchema);
export default ContactSubmission;