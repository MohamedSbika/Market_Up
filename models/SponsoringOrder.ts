import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ISponsoringOrderDoc extends Document {
  companyId: Types.ObjectId;
  sponsoringId?: Types.ObjectId;
  name: string;
  imageUrl: string;
  targetUrl: string;
  sector: string;
  desiredStart?: Date;
  desiredEnd?: Date;
  amount?: number;
  amountTTC?: number;
  paymentRef?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  adminStatus: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SponsoringOrderSchema = new Schema<ISponsoringOrderDoc>(
  {
    companyId:     { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    sponsoringId:  { type: Schema.Types.ObjectId, ref: 'Sponsoring' },
    name:          { type: String, required: true, trim: true },
    imageUrl:      { type: String, required: true },
    targetUrl:     { type: String, required: true },
    sector:        { type: String, required: true, default: 'generic' },
    desiredStart:  { type: Date },
    desiredEnd:    { type: Date },
    amount:        { type: Number, min: 0 },
    amountTTC:     { type: Number, min: 0 },
    paymentRef:    { type: String },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    adminStatus:   { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote:     { type: String },
  },
  { timestamps: true }
);

export const SponsoringOrder: Model<ISponsoringOrderDoc> =
  mongoose.models.SponsoringOrder ??
  mongoose.model<ISponsoringOrderDoc>('SponsoringOrder', SponsoringOrderSchema);
