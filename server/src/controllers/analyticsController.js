import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';
import User from '../models/User.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalMovies = await Movie.countDocuments();
    const totalTheatres = await Theatre.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });

    // Calculate total revenue
    const revenueAgg = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Last 7 days revenue
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyRevenueAgg = await Booking.aggregate([
      {
        $match: {
          status: 'confirmed',
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          bookingsCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top movies by bookings
    const topMoviesAgg = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: '$movie',
          bookingCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalTickets: { $sum: { $size: '$seats' } },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movieDetails',
        },
      },
      { $unwind: '$movieDetails' },
    ]);

    // Recent 5 bookings
    const recentBookings = await Booking.find()
      .populate('movie', 'title posterUrl')
      .populate('user', 'name email')
      .populate('theatre', 'name city')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalBookings,
        confirmedBookings,
        totalUsers,
        totalMovies,
        totalTheatres,
      },
      dailyRevenue: dailyRevenueAgg,
      topMovies: topMoviesAgg,
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};
