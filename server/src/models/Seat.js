import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema(
  {
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
      index: true,
    },
    seatNumber: {
      type: String,
      required: true,
      trim: true,
    },
    row: {
      type: String,
      required: true,
      uppercase: true,
    },
    col: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ['standard', 'premium', 'vip'],
      default: 'standard',
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'locked', 'booked', 'blocked'],
      default: 'available',
      index: true,
    },
    lockedBy: {
      type: String, // userId or socketId
      default: null,
    },
    lockExpiresAt: {
      type: Date,
      default: null,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Unique seat per show
seatSchema.index({ show: 1, seatNumber: 1 }, { unique: true });
seatSchema.index({ show: 1, status: 1 });

export default mongoose.model('Seat', seatSchema);
