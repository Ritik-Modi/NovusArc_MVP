import { Schema, model, Document, Types } from 'mongoose';

export enum NotificationType {
  SYSTEM = 'system',
  EMAIL = 'email',
  PUSH = 'push',
  IN_APP = 'in_app'
}

export interface INotification extends Document {
  _id: Types.ObjectId;
  receiver: Types.ObjectId; // user
  type: NotificationType;
  title?: string;
  body?: string;
  payload?: Record<string, any>;
  read: boolean;
  sentAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: Object.values(NotificationType), default: NotificationType.IN_APP },
    title: { type: String },
    body: { type: String },
    payload: { type: Schema.Types.Mixed },
    read: { type: Boolean, default: false },
    sentAt: { type: Date }
  },
  { timestamps: true }
);

NotificationSchema.index({ receiver: 1, read: 1 });

const NotificationModel = model<INotification>('Notification', NotificationSchema);
export default NotificationModel;
