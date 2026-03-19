import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IVideoDoc {
  youtubeUrl: string;
  title: string;
  description?: string;
  category: 'actualite' | 'offres' | 'astuces' | 'emplois';
  addedAt: Date;
}

export interface ITraceUpProfileDoc extends Document {
  companyId: Types.ObjectId;
  slug: string;
  status: 'pending' | 'active' | 'disabled';
  videos: IVideoDoc[];
  isBoostActive: boolean;
  boostExpiresAt?: Date;
  viewCount: number;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema<IVideoDoc>(
  {
    youtubeUrl:  { type: String, required: true },
    title:       { type: String, required: true, maxlength: 200 },
    description: { type: String, maxlength: 1000 },
    category:    { type: String, enum: ['actualite', 'offres', 'astuces', 'emplois'], required: true },
    addedAt:     { type: Date, default: Date.now },
  },
  { _id: true }
);

const TraceUpProfileSchema = new Schema<ITraceUpProfileDoc>(
  {
    companyId:      { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    slug:           { type: String, required: true, unique: true, index: true },
    status:         { type: String, enum: ['pending', 'active', 'disabled'], default: 'pending' },
    videos:         { type: [VideoSchema], default: [] },
    isBoostActive:  { type: Boolean, default: false },
    boostExpiresAt: { type: Date },
    viewCount:      { type: Number, default: 0, min: 0 },
    adminNote:      { type: String },
  },
  { timestamps: true }
);

TraceUpProfileSchema.index({ status: 1, isBoostActive: 1, boostExpiresAt: 1 });

export const TraceUpProfile: Model<ITraceUpProfileDoc> =
  mongoose.models.TraceUpProfile ??
  mongoose.model<ITraceUpProfileDoc>('TraceUpProfile', TraceUpProfileSchema);
