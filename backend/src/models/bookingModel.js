import mongoose from 'mongoose';
// Booking model: records user reservations with pricing and status.

const BookingSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  userName: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['CONFIRMED', 'CANCELED'], required: true }
});

export const Booking = mongoose.model('Booking', BookingSchema);
// Expose the Mongoose model for reservations.

export async function createBooking({ roomId, userName, startTime, endTime, totalPrice, status }) {
  // Persist a new booking then return it from DB to ensure shape consistency.
  const b = new Booking({ roomId, userName, startTime: new Date(startTime), endTime: new Date(endTime), totalPrice, status });
  await b.save();
  return Booking.findById(b._id).lean();
}

export async function getBookingById(id) {
  return Booking.findById(id).lean();
}

export async function listBookings() {
  // Admin listing, newest first.
  return Booking.find().sort({ startTime: -1 }).lean();
}

export async function listConfirmedBetween(fromISO, toISO) {
  // Analytics source: only confirmed bookings whose start falls in range.
  return Booking.find({
    status: 'CONFIRMED',
    startTime: { $gte: new Date(fromISO), $lte: new Date(toISO) }
  }).sort({ startTime: 1 }).lean();
}

export async function findOverlap(roomId, startISO, endISO) {
  // Overlap rule: start < requestedEnd AND end > requestedStart.
  return Booking.findOne({
    roomId,
    status: 'CONFIRMED',
    startTime: { $lt: new Date(endISO) },
    endTime: { $gt: new Date(startISO) }
  }).sort({ startTime: 1 }).lean();
}

export async function cancelBooking(id) {
  const res = await Booking.updateOne({ _id: id }, { $set: { status: 'CANCELED' } });
  return res.modifiedCount > 0;
}