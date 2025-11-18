import { createBookingService, cancelBookingService, listBookingsService } from '../services/bookingService.js';

// Bookings controller: HTTP concerns (status codes, payloads) for booking operations.
// Controller-only: business logic lives in services.

export async function createBooking(req, res) {
  try {
    const { roomId, userName, startTime, endTime } = req.body || {};
    const created = await createBookingService({ roomId, userName, startTime, endTime });

    return res.status(201).json({
      id: created._id,
      roomId: created.roomId,
      userName: created.userName,
      totalPrice: created.totalPrice,
      status: created.status
    });
  } catch (e) {
    const code = e.code;
    if (code === 'VALIDATION_ERROR') return res.status(400).json({ error: e.message });
    if (code === 'NOT_FOUND') return res.status(404).json({ error: e.message });
    if (code === 'CONFLICT') return res.status(409).json({ error: e.message });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function cancelBooking(req, res) {
  try {
    const id = req.params.id;
    const result = await cancelBookingService(id);
    return res.json(result);
  } catch (e) {
    const code = e.code;
    if (code === 'VALIDATION_ERROR') return res.status(400).json({ error: e.message });
    if (code === 'NOT_FOUND') return res.status(404).json({ error: e.message });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function listBookings(req, res) {
  const list = await listBookingsService();
  const mapped = list.map(b => ({
    id: b._id,
    roomId: b.roomId,
    userName: b.userName,
    startTime: b.startTime,
    endTime: b.endTime,
    totalPrice: b.totalPrice,
    status: b.status
  }));
  res.json(mapped);
}