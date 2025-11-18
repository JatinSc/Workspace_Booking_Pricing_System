import { getRoomByRoomId } from '../models/roomModel.js';
import { createBooking, findOverlap, getBookingById, cancelBooking, listBookings } from '../models/bookingModel.js';
import { serviceError } from '../utils/errors.js';
import { parseISO } from '../utils/dateUtils.js';
import { computeDynamicPrice } from '../utils/pricingUtils.js';
import { formatTime } from '../utils/timeUtils.js';

// helpers moved to utils: errors, date parsing, pricing
const TZ = process.env.BUSINESS_TZ || 'Asia/Kolkata';

export async function createBookingService({ roomId, userName, startTime, endTime }) {
  if (!roomId || !userName || !startTime || !endTime) {
    throw serviceError('VALIDATION_ERROR', 'Missing required fields');
  }

  const start = parseISO(startTime);
  const end = parseISO(endTime);
  if (!(start < end)) throw serviceError('VALIDATION_ERROR', 'startTime must be before endTime');

  const maxDurationMs = 12 * 60 * 60 * 1000;
  if ((end.getTime() - start.getTime()) > maxDurationMs) {
    throw serviceError('VALIDATION_ERROR', 'Duration must be ≤ 12 hours');
  }

  const room = await getRoomByRoomId(roomId);
  if (!room) throw serviceError('NOT_FOUND', 'Room not found');

  const overlap = await findOverlap(roomId, start.toISOString(), end.toISOString());
  if (overlap) {
    throw serviceError('CONFLICT', `Room already booked from ${formatTime(overlap.startTime, TZ)} to ${formatTime(overlap.endTime, TZ)}`);
  }

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
  const b = await getBookingById(id);
  console.log(b, "booking to cancel");
  if (!b) throw serviceError('NOT_FOUND', 'Booking not found');

  if (b.status === 'CANCELED') {
    throw serviceError('VALIDATION_ERROR', 'Booking already canceled');
  }

  const now = new Date();
  const start = new Date(b.startTime);
  const diffMs = start.getTime() - now.getTime();
  const twoHoursMs = 2 * 60 * 60 * 1000;
  if (diffMs <= twoHoursMs) {
    throw serviceError('VALIDATION_ERROR', 'Cancellation allowed only > 2 hours before startTime');
  }

  const ok = await cancelBooking(id);
  if (!ok) throw serviceError('INTERNAL', 'Cancellation failed');
  return { status: 'CANCELED' };
}

export async function listBookingsService() {
  return listBookings();
}