import mongoose, { Schema, Document } from 'mongoose';

export interface IMosque extends Document {
  name: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  contact: {
    phone?: string;
    website?: string;
  };
  verified: boolean;
  addedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MosqueSchema = new Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v: number[]) {
          return v.length === 2;
        },
        message: 'Coordinates must be [longitude, latitude]'
      }
    }
  },
  contact: {
    phone: { type: String, trim: true },
    website: { type: String, trim: true }
  },
  verified: { type: Boolean, default: false },
  addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

MosqueSchema.index({ location: '2dsphere' });
MosqueSchema.index({ verified: 1 });
MosqueSchema.index({ name: 'text', address: 'text' });

export default mongoose.model('Mosque', MosqueSchema);