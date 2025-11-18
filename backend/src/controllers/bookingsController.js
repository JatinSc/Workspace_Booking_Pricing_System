import { createBookingService, cancelBookingService, listBookingsService } from '../services/bookingService.js';

// Bookings controller: HTTP concerns (status codes, payloads) for booking operations.
// Controller-only: business logic lives in services.

export async function createBooking(req, res) {
  try {
    // Extract booking details from request body
    const { roomId, userName, startTime, endTime } = req.body || {};
    // Delegate creation logic to service layer
    const created = await createBookingService({ roomId, userName, startTime, endTime });

    // Return 201 with selected fields of the newly created booking
    return res.status(201).json({
      id: created._id,
      roomId: created.roomId,
      userName: created.userName,
      totalPrice: created.totalPrice,
      status: created.status
    });
  } catch (e) {
    // Map service-level error codes to appropriate HTTP status codes
    const code = e.code;
    if (code === 'VALIDATION_ERROR') return res.status(400).json({ error: e.message });
    if (code === 'NOT_FOUND') return res.status(404).json({ error: e.message });
    if (code === 'CONFLICT') return res.status(409).json({ error: e.message });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function cancelBooking(req, res) {
  try {
    // Retrieve booking id from route parameter
    const id = req.params.id;
    // Call service to perform cancellation
    const result = await cancelBookingService(id);
    // Return cancellation result as JSON
    return res.json(result);
  } catch (e) {
    // Translate service errors into HTTP responses
    const code = e.code;
    if (code === 'VALIDATION_ERROR') return res.status(400).json({ error: e.message });
    if (code === 'NOT_FOUND') return res.status(404).json({ error: e.message });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function listBookings(req, res) {
  // Fetch all bookings via service
  const list = await listBookingsService();
  // Map each booking to a simplified public view
  const mapped = list.map(b => ({
    id: b._id,
    roomId: b.roomId,
    userName: b.userName,
    startTime: b.startTime,
    endTime: b.endTime,
    totalPrice: b.totalPrice,
    status: b.status
  }));
  // Respond with the mapped list
  res.json(mapped);
}