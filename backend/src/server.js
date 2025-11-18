import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectPromise } from './config/db.js';
import roomsRouter from './routes/rooms.js';
import bookingsRouter from './routes/bookings.js';
import analyticsRouter from './routes/analytics.js';
import { seedDefaultRoomsService, getAllRoomsService } from './services/roomsService.js';
// HTTP server bootstrap: waits for DB, seeds rooms, sets up routes.

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/rooms', roomsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/analytics', analyticsRouter);

const PORT = process.env.PORT || 3001;

// Start after DB connection and seed if needed.
await connectPromise;
const existingRooms = await getAllRoomsService();
if (existingRooms.length === 0){
  await seedDefaultRoomsService();
}

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});