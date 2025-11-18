// Routes for room listing and seeding default room data.
import { Router } from 'express';
import { getRooms, seedRoomsController } from '../controllers/roomsController.js';
// Rooms API: routes wired to controllers.

const router = Router();

router.get('/', getRooms);

router.post('/seed', seedRoomsController);

export default router;