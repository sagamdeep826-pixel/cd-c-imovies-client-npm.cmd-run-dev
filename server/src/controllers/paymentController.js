import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';

export const processPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod = 'card', cardDetails, upiId } = req.body;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Booking is already paid' });
    }

    const transactionId = `TXN-${Date.now()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const payment = await Payment.create({
      booking: booking._id,
      user: userId,
      paymentMethod,
      transactionId,
      amount: booking.totalAmount,
      currency: 'INR',
      status: 'success',
      cardLastFour: cardDetails?.cardNumber ? cardDetails.cardNumber.slice(-4) : '4242',
      cardBrand: cardDetails?.brand || 'Visa',
      upiId: upiId || '',
    });

    booking.paymentStatus = 'paid';
    booking.paymentId = transactionId;
    await booking.save();

    res.json({
      success: true,
      message: 'Payment processed successfully',
      payment,
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate({
        path: 'booking',
        populate: [{ path: 'movie', select: 'title posterUrl' }, { path: 'theatre', select: 'name city' }],
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    next(error);
  }
};
