import { useEffect, useState } from 'react';
// Removed filtering UI; keep rooms listing simple
import RoomCard from '../components/RoomCard';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';

// Displays available rooms fetched from backend.
// Provides navigation to booking form for a selected room.
export default function RoomsListing() {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.getRooms();
        // Map backend shape to frontend expectations, add fallback image
        const mapped = (data || []).map(r => ({
          id: r.roomId,
          roomId: r.roomId,
          name: r.name,
          capacity: r.capacity,
          baseHourlyRate: r.baseHourlyRate,
          image: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800'
        }));
        if (mounted) setRooms(mapped);
      } catch (e) {
        console.error('Failed to load rooms', e);
        setRooms([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect Workspace
          </h1>
          <p className="text-xl text-gray-600">
            Book premium meeting rooms and collaboration spaces
          </p>
        </div>

        {/* Filtering UI removed per request */}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Available Rooms ({rooms.length})
          </h2>
        </div>

        <div className="h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <RoomCard
                key={room.roomId || room.id}
                room={room}
                onBook={(selectedRoom) => {
                  const id = selectedRoom?.roomId || selectedRoom?.id;
                  navigate(`/booking/room-no-${id}`);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
