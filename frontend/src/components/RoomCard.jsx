
import { Users, Clock } from 'lucide-react';

// Display card for a single room with capacity and base hourly rate.
// Shows a "Peak Hour" badge for visually distinguishing higher-rate rooms.
export default function RoomCard({ room, onBook }) {
  const isPeakHour = room.baseHourlyRate >= 300;

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative h-56 overflow-hidden">
        <img
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {isPeakHour && (
          <span className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            Peak Hour
          </span>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{room.name}</h3>

        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center text-gray-600">
            <Users className="w-5 h-5 mr-2" />
            <span className="text-sm">{room.capacity} People</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-2" />
            <span className="text-sm font-semibold text-indigo-600">₹{room.baseHourlyRate}/hr</span>
          </div>
        </div>

        <button
          onClick={() => onBook(room)}
          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
