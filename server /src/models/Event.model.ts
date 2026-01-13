import { Schema, model, Document, Types } from 'mongoose';

export interface IEvent extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  organizer?: Types.ObjectId;
  metadata?: Record<string, any>;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    location: { type: String },
    organizer: { type: Schema.Types.ObjectId, ref: 'User' },
    metadata: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

EventSchema.index({ title: 'text', description: 'text' });

const EventModel = model<IEvent>('Event', EventSchema);
export default EventModel;
