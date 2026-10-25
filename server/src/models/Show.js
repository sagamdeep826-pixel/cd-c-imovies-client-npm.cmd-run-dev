import mongoose from 'mongoose';

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
      index: true,
    },
    screenName: {
      type: String,
      default: 'Audi 1 (IMAX 3D)',
    },
    showTime: {
      type: Date,
      required: [true, 'Show timing is required'],
      index: true,
    },
    endTime: {
      type: Date,
    },
    priceTier: {
      standard: { type: Number, default: 12 },
      premium: { type: Number, default: 18 },
      vip: { type: Number, default: 25 },
    },
    status: {
      type: String,
      enum: ['scheduled', 'running', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    totalSeats: {
      type: Number,
      default: 80,
    },
    availableSeatsCount: {
      type: Number,
      default: 80,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high performance querying
showSchema.index({ movie: 1, showTime: 1 });
showSchema.index({ theatre: 1, showTime: 1 });
showSchema.index({ showTime: 1, status: 1 });

export default mongoose.model('Show', showSchema);
