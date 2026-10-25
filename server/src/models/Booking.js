import mongoose from 'mongoose';

const bookedSeatItemSchema = new mongoose.Schema(
  {
    seatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seat',
    },
    seatNumber: { type: String, required: true },
    row: { type: String, required: true },
    col: { type: Number, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
      index: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
    },
    seats: [bookedSeatItemSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    convenienceFee: {
      type: Number,
      default: 2.5,
    },
    discount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: '',
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'paid',
    },
    paymentId: {
      type: String,
      default: '',
    },
    qrCode: {
      type: String, // verification token / data
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Booking', bookingSchema);
