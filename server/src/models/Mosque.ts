import mongoose, { Schema, Document, Model } from 'mongoose';

// Separate the base interface from the Document interface
export interface IMosqueBase {
  name: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
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

// Extend Document separately to avoid complex union types
export interface IMosque extends IMosqueBase, Document {}

// Define the schema with proper typing
const MosqueSchema = new Schema<IMosque>({
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

// Add indexes
MosqueSchema.index({ location: '2dsphere' });
MosqueSchema.index({ verified: 1 });
MosqueSchema.index({ name: 'text', address: 'text' });

// Export with explicit typing to avoid complex union resolution
const MosqueModel: Model<IMosque> = mongoose.model<IMosque>('Mosque', MosqueSchema);

export default MosqueModel;