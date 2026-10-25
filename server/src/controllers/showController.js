import Show from '../models/Show.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';
import Seat from '../models/Seat.js';

// Helper to generate seat grid for a show
export const generateSeatsForShow = async (showId, priceTier = { standard: 12, premium: 18, vip: 25 }) => {
  const existingSeats = await Seat.countDocuments({ show: showId });
  if (existingSeats > 0) return;

  const rowsConfig = [
    { row: 'A', category: 'standard', price: priceTier.standard || 12 },
    { row: 'B', category: 'standard', price: priceTier.standard || 12 },
    { row: 'C', category: 'standard', price: priceTier.standard || 12 },
    { row: 'D', category: 'premium', price: priceTier.premium || 18 },
    { row: 'E', category: 'premium', price: priceTier.premium || 18 },
    { row: 'F', category: 'premium', price: priceTier.premium || 18 },
    { row: 'G', category: 'vip', price: priceTier.vip || 25 },
    { row: 'H', category: 'vip', price: priceTier.vip || 25 },
  ];

  const seatsToInsert = [];
  const colsPerRow = 10;

  for (const { row, category, price } of rowsConfig) {
    for (let col = 1; col <= colsPerRow; col++) {
      seatsToInsert.push({
        show: showId,
        seatNumber: `${row}${col}`,
        row,
        col,
        category,
        price,
        status: 'available',
      });
    }
  }

  await Seat.insertMany(seatsToInsert);
  await Show.findByIdAndUpdate(showId, {
    totalSeats: seatsToInsert.length,
    availableSeatsCount: seatsToInsert.length,
  });
};

export const getShows = async (req, res, next) => {
  try {
    const { movieId, theatreId, city, date } = req.query;
    const query = { status: { $ne: 'cancelled' } };

    if (movieId) {
      query.movie = movieId;
    }

    if (theatreId) {
      query.theatre = theatreId;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.showTime = { $gte: startOfDay, $lte: endOfDay };
    } else {
      // Default: future shows or starting now
      query.showTime = { $gte: new Date(Date.now() - 30 * 60 * 1000) }; // up to 30 mins ago
    }

    let shows = await Show.find(query)
      .populate('movie', 'title posterUrl duration rating ageRating genres language')
      .populate('theatre', 'name city address screens')
      .sort({ showTime: 1 });

    if (city && city !== 'All') {
      shows = shows.filter(
        (s) => s.theatre && s.theatre.city.toLowerCase() === city.toLowerCase()
      );
    }

    res.json({ success: true, count: shows.length, shows });
  } catch (error) {
    next(error);
  }
};

export const getShowById = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theatre');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // Release any expired seat locks (older than 10 mins)
    const now = new Date();
    await Seat.updateMany(
      {
        show: show._id,
        status: 'locked',
        lockExpiresAt: { $lt: now },
      },
      {
        $set: {
          status: 'available',
          lockedBy: null,
          lockExpiresAt: null,
        },
      }
    );

    // Verify seats exist or generate them
    let seats = await Seat.find({ show: show._id }).sort({ row: 1, col: 1 });
    if (seats.length === 0) {
      await generateSeatsForShow(show._id, show.priceTier);
      seats = await Seat.find({ show: show._id }).sort({ row: 1, col: 1 });
    }

    const availableCount = seats.filter((s) => s.status === 'available').length;
    await Show.findByIdAndUpdate(show._id, { availableSeatsCount: availableCount });

    res.json({
      success: true,
      show,
      seats,
    });
  } catch (error) {
    next(error);
  }
};

export const createShow = async (req, res, next) => {
  try {
    const { movieId, theatreId, screenName, showTime, priceTier } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }

    const startTime = new Date(showTime);
    const durationMs = (movie.duration + 20) * 60 * 1000;
    const endTime = new Date(startTime.getTime() + durationMs);

    const show = await Show.create({
      movie: movieId,
      theatre: theatreId,
      screenName: screenName || 'Screen 1 (IMAX)',
      showTime: startTime,
      endTime,
      priceTier: priceTier || { standard: 12, premium: 18, vip: 25 },
      totalSeats: 80,
      availableSeatsCount: 80,
    });

    // Auto generate seats for this show
    await generateSeatsForShow(show._id, show.priceTier);

    const populatedShow = await Show.findById(show._id)
      .populate('movie')
      .populate('theatre');

    res.status(201).json({ success: true, show: populatedShow });
  } catch (error) {
    next(error);
  }
};

export const updateShow = async (req, res, next) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('movie')
      .populate('theatre');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    res.json({ success: true, show });
  } catch (error) {
    next(error);
  }
};

export const deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    show.status = 'cancelled';
    await show.save();

    res.json({ success: true, message: 'Show cancelled successfully' });
  } catch (error) {
    next(error);
  }
};
