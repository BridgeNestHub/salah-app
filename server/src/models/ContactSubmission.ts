import mongoose from 'mongoose';

const ContactSubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: 'pending' }
}, {
  timestamps: true
});

ContactSubmissionSchema.index({ status: 1 });
ContactSubmissionSchema.index({ createdAt: -1 });

const ContactSubmission = mongoose.model('ContactSubmission', ContactSubmissionSchema);
export default ContactSubmission;