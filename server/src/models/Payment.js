import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet'],
      default: 'card',
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'refunded'],
      default: 'success',
      index: true,
    },
    cardLastFour: {
      type: String,
      default: '',
    },
    cardBrand: {
      type: String,
      default: 'Visa',
    },
    upiId: {
      type: String,
      default: '',
    },
    refundTransactionId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Payment', paymentSchema);
