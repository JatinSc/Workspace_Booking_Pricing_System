import { getAllRoomsService, seedDefaultRoomsService } from '../services/roomsService.js';

// Rooms controller: HTTP-level handling for rooms endpoints.
export async function getRooms(req, res) {
  const rooms = await getAllRoomsService();
  res.json(rooms);
}

export async function seedRoomsController(req, res) {
  const rooms = await seedDefaultRoomsService();
  res.json({ seeded: true, rooms });
}