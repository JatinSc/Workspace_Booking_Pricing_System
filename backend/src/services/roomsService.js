  import { getAllRooms, seedRooms } from '../models/roomModel.js';

  export async function getAllRoomsService() {
    return getAllRooms();
  }

  export async function seedDefaultRoomsService() {
    const defaults = [
      { roomId: '101', name: 'Cabin 1', baseHourlyRate: 150, capacity: 4 },
      { roomId: '102', name: 'Cabin 2', baseHourlyRate: 200, capacity: 6 },
      { roomId: '201', name: 'Board Room', baseHourlyRate: 300, capacity: 12 },
      { roomId: '301', name: 'Open Collab', baseHourlyRate: 120, capacity: 8 }
    ];
    await seedRooms(defaults);
    return getAllRooms();
  }