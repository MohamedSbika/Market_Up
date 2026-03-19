import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IBillingRecordDoc extends Document {
  companyId: Types.ObjectId;
  type: 'boost' | 'sponsoring';
  referenceId: Types.ObjectId;
  label: string;
  /** HT amount in DT */
  amount: number;
  /** amount * 0.19 */
  tva: number;
  /** amount * 1.19 */
  amountTTC: number;
  status: 'paid' | 'failed' | 'refunded';
  paymentRef?: string;
  invoiceNumber: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BillingRecordSchema = new Schema<IBillingRecordDoc>(
  {
    companyId:     { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    type:          { type: String, enum: ['boost', 'sponsoring'], required: true },
    referenceId:   { type: Schema.Types.ObjectId, required: true },
    label:         { type: String, required: true },
    amount:        { type: Number, required: true, min: 0 },
    tva:           { type: Number, required: true, min: 0 },
    amountTTC:     { type: Number, required: true, min: 0 },
    status:        { type: String, enum: ['paid', 'failed', 'refunded'], default: 'paid' },
    paymentRef:    { type: String },
    invoiceNumber: { type: String, required: true, unique: true },
    paidAt:        { type: Date },
  },
  { timestamps: true }
);

BillingRecordSchema.index({ companyId: 1, createdAt: -1 });
// For invoice number generation: count by year
BillingRecordSchema.index({ createdAt: 1 });

export const BillingRecord: Model<IBillingRecordDoc> =
  mongoose.models.BillingRecord ??
  mongoose.model<IBillingRecordDoc>('BillingRecord', BillingRecordSchema);
