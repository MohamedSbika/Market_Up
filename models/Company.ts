import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICompanyDoc extends Document {
  slug: string;
  email: string;
  passwordHash: string;
  type: 'B2B' | 'B2C';
  country: string;
  name: string;
  rneNumber: string;
  taxId?: string;
  phone?: string;
  logo?: string;
  role: 'company' | 'admin';
  status: 'pending' | 'active' | 'suspended';
  emailVerified: boolean;
  isDeleted: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompanyDoc>(
  {
    slug:          { type: String, required: true, unique: true, index: true },
    email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash:  { type: String, required: true },
    type:          { type: String, enum: ['B2B', 'B2C'], required: true },
    country:       { type: String, default: 'TN' },
    name:          { type: String, required: true, trim: true },
    rneNumber:     { type: String, required: true, trim: true },
    taxId:         { type: String, trim: true },
    phone:         { type: String, trim: true },
    logo:          { type: String },
    role:          { type: String, enum: ['company', 'admin'], default: 'company' },
    status:        { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' },
    emailVerified: { type: Boolean, default: false },
    isDeleted:             { type: Boolean, default: false },
    resetPasswordToken:   { type: String, index: true, sparse: true },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

// Text index for name search
CompanySchema.index({ name: 'text' });

export const Company: Model<ICompanyDoc> =
  mongoose.models.Company ??
  mongoose.model<ICompanyDoc>('Company', CompanySchema);
