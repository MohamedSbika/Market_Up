import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IGalleryItemDoc {
  url: string;
  uploadedAt: Date;
}

export interface IBrandUpProfileDoc extends Document {
  companyId: Types.ObjectId;
  slug: string;
  status: 'pending' | 'active' | 'disabled';
  shortDescription?: string;
  about?: string;
  sector?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  foundedYear?: number;
  employeesCount?: number;
  clientsCount?: number;
  gallery: IGalleryItemDoc[];
  isBoostActive: boolean;
  boostExpiresAt?: Date;
  viewCount: number;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryItemSchema = new Schema<IGalleryItemDoc>(
  {
    url:        { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const BrandUpProfileSchema = new Schema<IBrandUpProfileDoc>(
  {
    companyId:        { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    slug:             { type: String, required: true, unique: true, index: true },
    status:           { type: String, enum: ['pending', 'active', 'disabled'], default: 'pending' },
    shortDescription: { type: String, maxlength: 200 },
    about:            { type: String, maxlength: 2000 },
    sector:           { type: String },
    city:             { type: String },
    address:          { type: String },
    phone:            { type: String },
    email:            { type: String },
    foundedYear:      { type: Number, min: 1800, max: new Date().getFullYear() },
    employeesCount:   { type: Number, min: 0 },
    clientsCount:     { type: Number, min: 0 },
    gallery:          { type: [GalleryItemSchema], default: [], validate: { validator: (v: unknown[]) => v.length <= 10, message: 'Gallery max 10 images' } },
    isBoostActive:    { type: Boolean, default: false },
    boostExpiresAt:   { type: Date },
    viewCount:        { type: Number, default: 0, min: 0 },
    adminNote:        { type: String },
  },
  { timestamps: true }
);

// Compound index for search queries
BrandUpProfileSchema.index({ status: 1, isBoostActive: 1, boostExpiresAt: 1 });
BrandUpProfileSchema.index({ sector: 1, city: 1 });

export const BrandUpProfile: Model<IBrandUpProfileDoc> =
  mongoose.models.BrandUpProfile ??
  mongoose.model<IBrandUpProfileDoc>('BrandUpProfile', BrandUpProfileSchema);
