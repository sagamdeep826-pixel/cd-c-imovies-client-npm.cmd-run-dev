import mongoose from 'mongoose';

const screenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'Audi 1',
    },
    screenType: {
      type: String,
      enum: ['Standard', 'IMAX 3D', '4DX', 'Dolby Atmos VIP'],
      default: 'IMAX 3D',
    },
    totalSeats: {
      type: Number,
      default: 80,
    },
  },
  { _id: true }
);

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
      index: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    state: {
      type: String,
      default: '',
    },
    zipCode: {
      type: String,
      default: '',
    },
    screens: [screenSchema],
    amenities: {
      type: [String],
      default: ['Dolby Atmos', '4K Projection', 'Food Court', 'Valet Parking', 'Wheelchair Accessible'],
    },
    contactNumber: {
      type: String,
      default: '+1 (800) 555-FILM',
    },
    email: {
      type: String,
      default: 'info@imovies.com',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Theatre', theatreSchema);
