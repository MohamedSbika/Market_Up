import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type NotificationType =
  | 'account_approved'
  | 'profile_validated'
  | 'profile_rejected'
  | 'account_suspended'
  | 'rse_validated'
  | 'rse_rejected'
  | 'boost_activated'
  | 'boost_expiring_soon'
  | 'sponsoring_approved'
  | 'sponsoring_rejected';

export interface INotificationDoc extends Document {
  companyId: Types.ObjectId;
  type: NotificationType;
  data?: Record<string, unknown>;
  isRead: boolean;
  emailSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotificationDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    type:      {
      type: String,
      enum: [
        'account_approved', 'profile_validated', 'profile_rejected',
        'account_suspended', 'rse_validated', 'rse_rejected',
        'boost_activated', 'boost_expiring_soon',
        'sponsoring_approved', 'sponsoring_rejected',
      ],
      required: true,
    },
    data:      { type: Schema.Types.Mixed },
    isRead:    { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ companyId: 1, isRead: 1, createdAt: -1 });

export const Notification: Model<INotificationDoc> =
  mongoose.models.Notification ??
  mongoose.model<INotificationDoc>('Notification', NotificationSchema);
