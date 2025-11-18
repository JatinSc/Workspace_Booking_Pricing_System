import { getRoomByRoomId } from '../models/roomModel.js';
import { createBooking, findOverlap, getBookingById, cancelBooking, listBookings } from '../models/bookingModel.js';
import { serviceError } from '../utils/errors.js';
import { parseISO } from '../utils/dateUtils.js';
import { computeDynamicPrice } from '../utils/pricingUtils.js';
import { formatTime } from '../utils/timeUtils.js';
const TZ = process.env.BUSINESS_TZ || 'Asia/Kolkata';

export async function createBookingService({ roomId, userName, startTime, endTime }) {
  // Validate required fields
  if (!roomId || !userName || !startTime || !endTime) {
    throw serviceError('VALIDATION_ERROR', 'Missing required fields');
  }

  // Parse and validate time order
  const start = parseISO(startTime);
  const end = parseISO(endTime);
  if (!(start < end)) throw serviceError('VALIDATION_ERROR', 'startTime must be before endTime');

  // Enforce max 12-hour booking duration
  const maxDurationMs = 12 * 60 * 60 * 1000;
  if ((end.getTime() - start.getTime()) > maxDurationMs) {
    throw serviceError('VALIDATION_ERROR', 'Duration must be ≤ 12 hours');
  }

  // Ensure room exists
  const room = await getRoomByRoomId(roomId);
  if (!room) throw serviceError('NOT_FOUND', 'Room not found');

  // Check for overlapping bookings
  const overlap = await findOverlap(roomId, start.toISOString(), end.toISOString());
  if (overlap) {
    throw serviceError('CONFLICT', `Room already booked from ${formatTime(overlap.startTime, TZ)} to ${formatTime(overlap.endTime, TZ)}`);
  }

  // Compute dynamic price and create booking
  const totalPrice = computeDynamicPrice(start, end, room.baseHourlyRate, TZ);
  const created = await createBooking({
    roomId,
    userName,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    totalPrice,
    status: 'CONFIRMED'
  });
  return created;
}

export async function cancelBookingService(id) {
  // Fetch booking to cancel
  const b = await getBookingById(id);
  console.log(b, "booking to cancel");
  if (!b) throw serviceError('NOT_FOUND', 'Booking not found');

  // Prevent double cancellation
  if (b.status === 'CANCELED') {
    throw serviceError('VALIDATION_ERROR', 'Booking already canceled');
  }

  // Allow cancellation only if > 2 hours before start
  const now = new Date();
  const start = new Date(b.startTime);
  const diffMs = start.getTime() - now.getTime();
  const twoHoursMs = 2 * 60 * 60 * 1000;
  if (diffMs <= twoHoursMs) {
    throw serviceError('VALIDATION_ERROR', 'Cancellation allowed only > 2 hours before startTime');
  }

  // Perform cancellation
  const ok = await cancelBooking(id);
  if (!ok) throw serviceError('INTERNAL', 'Cancellation failed');
  return { status: 'CANCELED' };
}

export async function listBookingsService() {
  // Return all bookings
  return listBookings();
}