import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ISponsoringDoc extends Document {
  companyId?: Types.ObjectId;
  name: string;
  imageUrl: string;
  targetUrl: string;
  sector: string;
  status: 'pending' | 'active' | 'inactive';
  clickCount: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SponsoringSchema = new Schema<ISponsoringDoc>(
  {
    companyId:  { type: Schema.Types.ObjectId, ref: 'Company' },
    name:       { type: String, required: true, trim: true },
    imageUrl:   { type: String, required: true },
    targetUrl:  { type: String, required: true },
    sector:     { type: String, required: true, default: 'generic' },
    status:     { type: String, enum: ['pending', 'active', 'inactive'], default: 'pending' },
    clickCount: { type: Number, default: 0, min: 0 },
    startDate:  { type: Date },
    endDate:    { type: Date },
  },
  { timestamps: true }
);

// Index for active sponsor lookup by sector
SponsoringSchema.index({ status: 1, sector: 1, startDate: 1, endDate: 1 });

export const Sponsoring: Model<ISponsoringDoc> =
  mongoose.models.Sponsoring ??
  mongoose.model<ISponsoringDoc>('Sponsoring', SponsoringSchema);
