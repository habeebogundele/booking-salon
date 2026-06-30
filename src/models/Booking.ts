import mongoose, { Schema, model, models, type InferSchemaType } from 'mongoose';

const BookingSchema = new Schema(
  {
    service: {
      type: String,
      required: [true, 'Service is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true,
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

export type Booking = InferSchemaType<typeof BookingSchema>;

const Booking =
  (models.Booking as mongoose.Model<Booking>) ||
  model<Booking>('Booking', BookingSchema);

export default Booking;
