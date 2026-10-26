import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import Seat from '../models/Seat.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';

export const createBooking = async (req, res, next) => {
  try {
    const { showId, seatNumbers, paymentMethod = 'card', couponCode = '', paymentDetails = {} } = req.body;
    const userId = req.user._id;

    if (!showId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one seat.' });
    }

    const show = await Show.findById(showId).populate('movie').populate('theatre');
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    if (new Date(show.showTime) < new Date()) {
      return res.status(400).json({ success: false, message: 'Cannot book seats for past shows.' });
    }

    // Find requested seats
    const seats = await Seat.find({
      show: showId,
      seatNumber: { $in: seatNumbers },
    });

    if (seats.length !== seatNumbers.length) {
      return res.status(400).json({ success: false, message: 'One or more selected seats do not exist.' });
    }

    // Check availability (must be available OR locked by this user)
    const unavailableSeats = seats.filter(
      (s) => s.status === 'booked' || (s.status === 'locked' && s.lockedBy !== userId.toString())
    );

    if (unavailableSeats.length > 0) {
      const seatNames = unavailableSeats.map((s) => s.seatNumber).join(', ');
      return res.status(400).json({
        success: false,
        message: `Seats ${seatNames} are no longer available. Please choose other seats.`,
      });
    }

    // Calculate amounts
    const subtotal = seats.reduce((acc, curr) => acc + curr.price, 0);
    const convenienceFee = 25 * seats.length;
    let discount = 0;

    const normalizedCoupon = (couponCode || '').toUpperCase().trim();
    if (normalizedCoupon === 'IMOVIES20') {
      discount = Math.round(subtotal * 0.2); // 20% off
    } else if (normalizedCoupon === 'FIRST50') {
      discount = Math.round(subtotal * 0.5); // 50% off
    } else if (normalizedCoupon === 'FLAT100' || normalizedCoupon === 'FLAT10') {
      discount = Math.min(100, subtotal);
    }

    const totalAmount = Math.max(0, subtotal + convenienceFee - discount);

    // Generate unique booking number
    const timestamp = Date.now().toString().slice(-6);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = `IMO-${timestamp}-${randomSuffix}`;

    // Format booked seats
    const bookedSeatItems = seats.map((s) => ({
      seatId: s._id,
      seatNumber: s.seatNumber,
      row: s.row,
      col: s.col,
      category: s.category,
      price: s.price,
    }));

    // Create Booking
    const booking = await Booking.create({
      bookingNumber,
      user: userId,
      show: show._id,
      movie: show.movie._id,
      theatre: show.theatre._id,
      seats: bookedSeatItems,
      subtotal,
      convenienceFee,
      discount,
      couponCode: normalizedCoupon,
      totalAmount,
      status: 'confirmed',
      paymentStatus: 'paid',
      qrCode: `IMO-TICKET:${bookingNumber}:USER:${userId}:SHOW:${show._id}`,
    });

    // Mark seats as booked
    await Seat.updateMany(
      { _id: { $in: seats.map((s) => s._id) } },
      {
        $set: {
          status: 'booked',
          bookedBy: userId,
          bookingId: booking._id,
          lockedBy: null,
          lockExpiresAt: null,
        },
      }
    );

    // Update remaining available seats count on Show
    const remainingCount = await Seat.countDocuments({ show: showId, status: 'available' });
    await Show.findByIdAndUpdate(showId, { availableSeatsCount: remainingCount });

    // Create Payment Record
    const transactionId = `TXN-${Date.now()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const payment = await Payment.create({
      booking: booking._id,
      user: userId,
      paymentMethod,
      transactionId,
      amount: totalAmount,
      currency: 'INR',
      status: 'success',
      cardLastFour: paymentDetails.cardLastFour || '4242',
      cardBrand: paymentDetails.cardBrand || 'Visa',
      upiId: paymentDetails.upiId || '',
    });

    booking.paymentId = transactionId;
    await booking.save();

    // Create Notification
    await Notification.create({
      user: userId,
      title: 'Booking Confirmed!',
      message: `Your booking #${bookingNumber} for ${show.movie.title} at ${show.theatre.name} is confirmed. Seats: ${seatNumbers.join(', ')}.`,
      type: 'booking_confirmation',
      data: {
        bookingId: booking._id,
        showId: show._id,
      },
    });

    // Broadcast socket event if socket io is available
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`show:${showId}`).emit('seats:booked', {
        showId,
        bookedSeats: seatNumbers,
      });
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie')
      .populate('theatre')
      .populate('show');

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: populatedBooking,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'User requested cancellation' } = req.body;
    const userId = req.user._id;

    const booking = await Booking.findById(id).populate('show').populate('movie');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check ownership or admin
    if (booking.user.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // Check show time: allow cancellation up to 1 hour before show
    const showTime = new Date(booking.show.showTime);
    const now = new Date();
    const diffHours = (showTime - now) / (1000 * 60 * 60);

    if (diffHours < 1 && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Bookings cannot be cancelled less than 1 hour before showtime.',
      });
    }

    // Refund calculation: 90% refund if before 24h, 75% if within 24h
    let refundPercent = diffHours >= 24 ? 0.9 : 0.75;
    const refundAmount = Math.round(booking.totalAmount * refundPercent * 100) / 100;

    // Update booking
    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();
    booking.refundAmount = refundAmount;
    await booking.save();

    // Release seats
    const seatIds = booking.seats.map((s) => s.seatId).filter(Boolean);
    const seatNumbers = booking.seats.map((s) => s.seatNumber);

    if (seatIds.length > 0) {
      await Seat.updateMany(
        { _id: { $in: seatIds } },
        {
          $set: {
            status: 'available',
            bookedBy: null,
            bookingId: null,
            lockedBy: null,
            lockExpiresAt: null,
          },
        }
      );
    } else {
      await Seat.updateMany(
        { show: booking.show._id, seatNumber: { $in: seatNumbers } },
        {
          $set: {
            status: 'available',
            bookedBy: null,
            bookingId: null,
            lockedBy: null,
            lockExpiresAt: null,
          },
        }
      );
    }

    // Recalculate show available seats
    const remainingCount = await Seat.countDocuments({
      show: booking.show._id,
      status: 'available',
    });
    await Show.findByIdAndUpdate(booking.show._id, { availableSeatsCount: remainingCount });

    // Record refund payment
    const refundTxnId = `REF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await Payment.create({
      booking: booking._id,
      user: booking.user,
      paymentMethod: 'wallet',
      transactionId: refundTxnId,
      amount: refundAmount,
      currency: 'INR',
      status: 'refunded',
    });

    // Create Notification
    await Notification.create({
      user: booking.user,
      title: 'Booking Cancelled & Refund Initiated',
      message: `Your booking #${booking.bookingNumber} for ${booking.movie.title} has been cancelled. Refund of ₹${refundAmount} has been credited.`,
      type: 'cancellation',
      data: { bookingId: booking._id },
    });

    // Broadcast socket update
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`show:${booking.show._id}`).emit('seats:released', {
        showId: booking.show._id,
        releasedSeats: seatNumbers,
      });
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Refund initiated.',
      booking,
      refundAmount,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (req, res, next) => {
  try {
    const { status, filter = 'all' } = req.query;
    const query = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('movie')
      .populate('theatre')
      .populate('show')
      .sort({ createdAt: -1 });

    const now = new Date();
    let filteredBookings = bookings;

    if (filter === 'upcoming') {
      filteredBookings = bookings.filter(
        (b) => b.show && new Date(b.show.showTime) >= now && b.status === 'confirmed'
      );
    } else if (filter === 'past') {
      filteredBookings = bookings.filter(
        (b) => (b.show && new Date(b.show.showTime) < now) || b.status === 'cancelled'
      );
    }

    res.json({
      success: true,
      count: filteredBookings.length,
      bookings: filteredBookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movie')
      .populate('theatre')
      .populate('show')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    const payment = await Payment.findOne({ booking: booking._id }).sort({ createdAt: -1 });

    res.json({ success: true, booking, payment });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.bookingNumber = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('movie', 'title posterUrl duration')
      .populate('theatre', 'name city')
      .populate('user', 'name email')
      .populate('show', 'showTime screenName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      bookings,
    });
  } catch (error) {
    next(error);
  }
};
