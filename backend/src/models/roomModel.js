// src/models/room.model.js
import mongoose from "mongoose";
/**
 * Room model: stores static attributes for meeting rooms.
 * We use `roomId` as the business identifier (e.g., "101").
 */

const RoomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    baseHourlyRate: {
      type: Number,
      required: true,
      min: [0, "baseHourlyRate must be >= 0"]
    },
    capacity: { type: Number, required: true, min: [1, "capacity must be >= 1"] }
  },
  {
    timestamps: true // createdAt / updatedAt
  }
);

// Avoid model overwrite errors in dev/hot reload
export const Room = mongoose.models.Room || mongoose.model("Room", RoomSchema);

// ------- helper/model functions -------

export async function getAllRooms() {
  // List rooms sorted by name for UI display.
  return Room.find().sort({ name: 1 }).lean();
}

export async function getRoomByRoomId(roomId) {
  // Fetch a single room by our business ID (string like '101').
  return Room.findOne({ roomId }).lean();
}

export async function seedRooms(rooms) {
  // Upsert a fixed set of rooms to quickly bootstrap the system.
  if (!Array.isArray(rooms) || rooms.length === 0) return [];

  const ops = rooms.map((r) => ({
    updateOne: {
      filter: { roomId: r.roomId },
      update: { $set: r },
      upsert: true
    }
  }));

  const res = await Room.bulkWrite(ops);
  // Optionally ensure indexes (creates unique index if not present)
  // await Room.syncIndexes();
  return res;
}
