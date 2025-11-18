import { listConfirmedBetween } from '../models/bookingModel.js';
import { Room } from '../models/roomModel.js';
import { serviceError } from '../utils/errors.js';
import { startOfDayISO, endOfDayISO } from '../utils/dateUtils.js';

const TZ = process.env.BUSINESS_TZ || 'Asia/Kolkata';

export async function computeAnalyticsService({ from, to }) {
  // Ensure both date boundaries are provided; throw if missing
  if (!from || !to) throw serviceError('VALIDATION_ERROR', 'from and to are required (YYYY-MM-DD)');

  // Convert incoming date strings to ISO strings representing start-of-day and end-of-day in the configured timezone
  let fromISO, toISO;
  try {
    fromISO = startOfDayISO(from, TZ);
    toISO = endOfDayISO(to, TZ);
  } catch (e) {
    throw serviceError('VALIDATION_ERROR', 'Invalid date');
  }

  // Fetch all confirmed bookings that fall within the given date range
  const rows = await listConfirmedBetween(fromISO, toISO);

  // Build a unique list of roomIds referenced by these bookings
  const roomIds = Array.from(new Set(rows.map(r => r.roomId)));

  // Retrieve room documents for those IDs and create a quick lookup map from roomId to room name
  const rooms = await Room.find({ roomId: { $in: roomIds } }).lean();
  const roomNameById = new Map(rooms.map(r => [r.roomId, r.name]));
  // example output: Map(2) {'A101' => 'Meeting Room A101', 'A102' => 'Meeting Room A102'}

  // Aggregate booking metrics per room using a Map to avoid multiple passes
  const byRoom = new Map();
  for (const r of rows) {
    const key = r.roomId;
    // Compute duration in hours from startTime to endTime
    const durationHrs = (new Date(r.endTime) - new Date(r.startTime)) / (1000 * 60 * 60);
    // Fetch or initialize the accumulator for this room
    const current = byRoom.get(key) || {
      roomId: r.roomId,
      roomName: roomNameById.get(r.roomId) || r.roomId, // fallback to roomId if name missing
      totalHours: 0,
      totalRevenue: 0
    };
    current.totalHours += durationHrs;
    current.totalRevenue += r.totalPrice;
    byRoom.set(key, current);
  }
  //example output:
  // Map(2) {
  //   'A101' => { roomId: 'A101', roomName: 'Meeting Room A101', totalHours: 12.5, totalRevenue: 250.00 },
  //   'A102' => { roomId: 'A102', roomName: 'Meeting Room A102', totalHours: 8.0, totalRevenue: 160.00 }
  // }

  
  const data = Array.from(byRoom.values()).map(x => ({
  // Convert the aggregated Map values into a plain array, rounding totals to 2 decimals
    roomId: x.roomId,
    roomName: x.roomName,
    totalHours: Math.round(x.totalHours * 100) / 100,
    totalRevenue: Math.round(x.totalRevenue * 100) / 100
  }));
  // example output:
  // [
  //   { roomId: 'A101', roomName: 'Meeting Room A101', totalHours: 12.5, totalRevenue: 250.00 },
  //   { roomId: 'A102', roomName: 'Meeting Room A102', totalHours: 8.0, totalRevenue: 160.00 }
  // ]

  return data;
  // Return the final analytics breakdown per room
}