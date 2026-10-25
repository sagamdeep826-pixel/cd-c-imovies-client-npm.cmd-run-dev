import mongoose from 'mongoose';

const castSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    character: { type: String, default: '' },
    photo: { type: String, default: '' },
  },
  { _id: false }
);

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true,
    },
    tagline: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
    },
    genres: {
      type: [String],
      required: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
      index: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    rating: {
      type: Number,
      default: 8.5,
      min: 0,
      max: 10,
    },
    votesCount: {
      type: Number,
      default: 120,
    },
    ageRating: {
      type: String,
      enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'U', 'U/A', 'A'],
      default: 'PG-13',
    },
    director: {
      type: String,
      default: '',
    },
    cast: [castSchema],
    posterUrl: {
      type: String,
      required: [true, 'Poster image URL is required'],
    },
    backdropUrl: {
      type: String,
      default: '',
    },
    trailerUrl: {
      type: String,
      default: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon'],
      default: 'now_showing',
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for search
movieSchema.index({ title: 'text', description: 'text', director: 'text' });

export default mongoose.model('Movie', movieSchema);
