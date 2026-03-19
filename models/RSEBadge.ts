import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IDonationDoc {
  _id: Types.ObjectId;
  beneficiary: string;
  amount: number;
  receiptUrl: string;
  status: 'pending' | 'validated' | 'rejected';
  adminNote?: string;
  validatedAt?: Date;
  createdAt: Date;
}

export interface IRSEBadgeDoc extends Document {
  companyId: Types.ObjectId;
  badgeActive: boolean;
  donations: IDonationDoc[];
}

const DonationSchema = new Schema<IDonationDoc>(
  {
    beneficiary: { type: String, required: true, trim: true },
    amount:      { type: Number, required: true, min: 0 },
    receiptUrl:  { type: String, required: true },
    status:      { type: String, enum: ['pending', 'validated', 'rejected'], default: 'pending' },
    adminNote:   { type: String },
    validatedAt: { type: Date },
    createdAt:   { type: Date, default: Date.now },
  },
  { _id: true }
);

const RSEBadgeSchema = new Schema<IRSEBadgeDoc>({
  companyId:   { type: Schema.Types.ObjectId, ref: 'Company', required: true, unique: true },
  badgeActive: { type: Boolean, default: false },
  donations:   { type: [DonationSchema], default: [] },
});

export const RSEBadge: Model<IRSEBadgeDoc> =
  mongoose.models.RSEBadge ??
  mongoose.model<IRSEBadgeDoc>('RSEBadge', RSEBadgeSchema);
