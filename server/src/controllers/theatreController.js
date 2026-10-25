import Theatre from '../models/Theatre.js';
import Show from '../models/Show.js';

export const getTheatres = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    const query = { isActive: true };

    if (city && city !== 'All') {
      query.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const theatres = await Theatre.find(query).sort({ name: 1 });
    res.json({ success: true, count: theatres.length, theatres });
  } catch (error) {
    next(error);
  }
};

export const getTheatreById = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }

    const shows = await Show.find({
      theatre: theatre._id,
      showTime: { $gte: new Date() },
      status: 'scheduled',
    })
      .populate('movie', 'title posterUrl duration rating ageRating genres language')
      .sort({ showTime: 1 });

    res.json({ success: true, theatre, shows });
  } catch (error) {
    next(error);
  }
};

export const getCities = async (req, res, next) => {
  try {
    const cities = await Theatre.distinct('city', { isActive: true });
    res.json({ success: true, cities });
  } catch (error) {
    next(error);
  }
};

export const createTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.create(req.body);
    res.status(201).json({ success: true, theatre });
  } catch (error) {
    next(error);
  }
};

export const updateTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }
    res.json({ success: true, theatre });
  } catch (error) {
    next(error);
  }
};

export const deleteTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }

    theatre.isActive = false;
    await theatre.save();

    res.json({ success: true, message: 'Theatre deactivated successfully' });
  } catch (error) {
    next(error);
  }
};
