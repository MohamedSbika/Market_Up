import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IBoostDoc extends Document {
  companyId: Types.ObjectId;
  profileType: 'brandup' | 'traceup' | 'linkup';
  profileId: Types.ObjectId;
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  endDate: Date;
  /** HT amount in Tunisian Dinar */
  amount: number;
  /** amount * 1.19 */
  amountTTC: number;
  paymentRef?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  viewsAtStart: number;
  createdAt: Date;
  updatedAt: Date;
}

const BoostSchema = new Schema<IBoostDoc>(
  {
    companyId:     { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    profileType:   { type: String, enum: ['brandup', 'traceup', 'linkup'], required: true },
    profileId:     { type: Schema.Types.ObjectId, required: true },
    status:        { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
    startDate:     { type: Date, required: true },
    endDate:       { type: Date, required: true },
    amount:        { type: Number, required: true, min: 0 },
    amountTTC:     { type: Number, required: true, min: 0 },
    paymentRef:    { type: String },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    viewsAtStart:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

// For cron job: find active boosts expiring soon
BoostSchema.index({ status: 1, endDate: 1 });
BoostSchema.index({ companyId: 1, status: 1 });

export const Boost: Model<IBoostDoc> =
  mongoose.models.Boost ??
  mongoose.model<IBoostDoc>('Boost', BoostSchema);
