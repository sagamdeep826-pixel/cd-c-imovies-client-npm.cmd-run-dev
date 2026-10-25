import Movie from '../models/Movie.js';
import Show from '../models/Show.js';

export const getMovies = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      language,
      status,
      featured,
      sortBy = 'releaseDate',
      order = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { director: { $regex: search, $options: 'i' } },
        { 'cast.name': { $regex: search, $options: 'i' } },
      ];
    }

    if (genre && genre !== 'All') {
      query.genres = { $in: [genre] };
    }

    if (language && language !== 'All') {
      query.language = language;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (featured !== undefined) {
      query.featured = featured === 'true';
    }

    const sortOptions = {};
    if (sortBy === 'rating') {
      sortOptions.rating = order === 'asc' ? 1 : -1;
    } else if (sortBy === 'title') {
      sortOptions.title = order === 'asc' ? 1 : -1;
    } else {
      sortOptions.releaseDate = order === 'asc' ? 1 : -1;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      movies,
    });
  } catch (error) {
    next(error);
  }
};

export const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Get upcoming shows for this movie
    const upcomingShows = await Show.find({
      movie: movie._id,
      showTime: { $gte: new Date() },
      status: 'scheduled',
    })
      .populate('theatre', 'name city address screens')
      .sort({ showTime: 1 });

    res.json({
      success: true,
      movie,
      upcomingShows,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({ featured: true }).limit(5);
    res.json({ success: true, movies });
  } catch (error) {
    next(error);
  }
};

export const getGenres = async (req, res, next) => {
  try {
    const genres = await Movie.distinct('genres');
    res.json({ success: true, genres });
  } catch (error) {
    next(error);
  }
};

export const getLanguages = async (req, res, next) => {
  try {
    const languages = await Movie.distinct('language');
    res.json({ success: true, languages });
  } catch (error) {
    next(error);
  }
};

export const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, movie });
  } catch (error) {
    next(error);
  }
};

export const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({ success: true, movie });
  } catch (error) {
    next(error);
  }
};

export const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    await Movie.findByIdAndDelete(req.params.id);
    // Cancel or delete associated scheduled shows
    await Show.deleteMany({ movie: req.params.id, status: 'scheduled' });

    res.json({ success: true, message: 'Movie deleted successfully' });
  } catch (error) {
    next(error);
  }
};
