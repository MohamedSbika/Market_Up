import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ILinkUpProfileDoc extends Document {
  companyId: Types.ObjectId;
  slug: string;
  status: 'pending' | 'active' | 'disabled';
  whatsapp: string;
  gpsUrl: string;
  website?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  isBoostActive: boolean;
  boostExpiresAt?: Date;
  viewCount: number;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LinkUpProfileSchema = new Schema<ILinkUpProfileDoc>(
  {
    companyId:      { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    slug:           { type: String, required: true, unique: true, index: true },
    status:         { type: String, enum: ['pending', 'active', 'disabled'], default: 'pending' },
    whatsapp:       { type: String, default: '' },
    gpsUrl:         { type: String, default: '' },
    website:        { type: String },
    linkedin:       { type: String },
    facebook:       { type: String },
    instagram:      { type: String },
    youtube:        { type: String },
    isBoostActive:  { type: Boolean, default: false },
    boostExpiresAt: { type: Date },
    viewCount:      { type: Number, default: 0, min: 0 },
    adminNote:      { type: String },
  },
  { timestamps: true }
);

LinkUpProfileSchema.index({ status: 1, isBoostActive: 1, boostExpiresAt: 1 });

export const LinkUpProfile: Model<ILinkUpProfileDoc> =
  mongoose.models.LinkUpProfile ??
  mongoose.model<ILinkUpProfileDoc>('LinkUpProfile', LinkUpProfileSchema);
