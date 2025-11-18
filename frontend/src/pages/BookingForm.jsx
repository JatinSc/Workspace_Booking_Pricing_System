import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Calendar, Clock, User, DollarSign, CheckCircle,Activity, TrendingUp } from 'lucide-react';
import SummaryCard from '../components/SummaryCard';
import { api, toISTIso } from '../api/client';
import { BUSINESS_TZ, businessTodayISO, businessNowHM } from '../utils/time';
import { toast } from 'react-hot-toast';

export default function BookingForm() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const PREFIX = 'room-no-';
  const resolvedRoomId = roomId && roomId.startsWith(PREFIX) ? roomId.slice(PREFIX.length) : roomId;
  const [room, setRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [roomError, setRoomError] = useState('');
  const [formData, setFormData] = useState({
    userName: '',
    date: '',
    startTime: '',
    endTime: ''
  });

  const [pricing, setPricing] = useState({
    hours: 0,
    subtotal: 0,
    peakSurcharge: 0,
    total: 0
  });

  // Load room by route param; fallback to any state if provided
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingRoom(true);
      setRoomError('');
      try {
        const rooms = await api.getRooms();
        const found = (rooms || []).find(r => String(r.roomId) === String(resolvedRoomId) || String(r.id) === String(resolvedRoomId));
        if (!found) {
          setRoomError('Room not found');
          setRoom(null);
        } else {
          // Normalize to the shape BookingForm expects
          const normalized = {
            id: found.roomId || found.id,
            roomId: found.roomId || found.id,
            name: found.name,
            capacity: found.capacity,
            baseHourlyRate: found.baseHourlyRate,
            image: found.image || 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800'
          };
          setRoom(normalized);
        }
      } catch (e) {
        console.error('Failed to load room', e);
        setRoomError('Failed to load room');
        setRoom(null);
      } finally {
        if (mounted) setLoadingRoom(false);
      }
    })();
    return () => { mounted = false; };
  }, [resolvedRoomId]);

  const calculatePricing = () => {
    // Guard against missing inputs to prevent NaN
    if (!formData.date || !formData.startTime || !formData.endTime) {
      setPricing({ hours: 0, subtotal: 0, peakSurcharge: 0, total: 0 });
      return;
    }

    const startISO = toISTIso(formData.date, formData.startTime);
    const endISO = toISTIso(formData.date, formData.endTime);
    const start = new Date(startISO);
    const end = new Date(endISO);
    const startMs = start.getTime();
    const endMs = end.getTime();
    if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
      setPricing({ hours: 0, subtotal: 0, peakSurcharge: 0, total: 0 });
      return;
    }

    const diffMs = endMs - startMs;
    const minutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    const hours = minutes / 60;

    if (hours <= 0) {
      setPricing({ hours: 0, subtotal: 0, peakSurcharge: 0, total: 0 });
      return;
    }

    // Helpers to determine peak slots in BUSINESS_TZ
    const weekdayFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: BUSINESS_TZ });
    const hourFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: BUSINESS_TZ });
    const isWeekdayTZ = (d) => {
      const wd = weekdayFmt.format(d);
      return wd === 'Mon' || wd === 'Tue' || wd === 'Wed' || wd === 'Thu' || wd === 'Fri';
    };
    const hourInTZ = (d) => parseInt(hourFmt.format(d), 10);
    const isPeakTZ = (d) => {
      if (!isWeekdayTZ(d)) return false;
      const h = hourInTZ(d);
      return (h >= 10 && h < 13) || (h >= 16 && h < 19);
    };

    const baseRate = Number(room?.baseHourlyRate) || 0;
    const perMinuteBase = baseRate / 60;
    let baseSum = 0;
    let totalSum = 0;
    for (let i = 0; i < minutes; i++) {
      const t = new Date(startMs + i * 60 * 1000);
      baseSum += perMinuteBase;
      totalSum += isPeakTZ(t) ? perMinuteBase * 1.5 : perMinuteBase;
    }

    setPricing({
      hours: Number(hours.toFixed(1)),
      subtotal: Math.round(baseSum),
      peakSurcharge: Math.round(totalSum - baseSum),
      total: Math.round(totalSum)
    });
  };

  useEffect(() => {
    calculatePricing();
  }, [formData.date, formData.startTime, formData.endTime, room]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userName || !formData.date || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all fields');
      return;
    }
    const today = businessTodayISO();
    const nowHM = businessNowHM();
    if (formData.date < today) {
      toast.error('Selected date is in the past');
      return;
    }
    if (formData.date === today && formData.startTime < nowHM) {
      toast.error('Start time cannot be in the past');
      return;
    }
    if (formData.endTime <= formData.startTime) {
      toast.error('End time must be later than start time');
      return;
    }
    if (pricing.total <= 0) {
      toast.error('Please select valid time slots');
      return;
    }

    try {
      const payload = {
        roomId: (room?.roomId || room?.id),
        userName: formData.userName,
        startTime: toISTIso(formData.date, formData.startTime),
        endTime: toISTIso(formData.date, formData.endTime)
      };
      console.log('Sending payload:', payload);
      const res = await api.createBooking(payload);
      toast.success(`Booking confirmed: ₹${res.totalPrice}`);
      // Navigate to Admin View to show the new booking
      navigate('/admin-view');
    } catch (err) {
      toast.error(`Booking failed: ${err.message}`);
    }
  };

  if (loadingRoom) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12">
          <p className="text-gray-700">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12">
          <button onClick={() => navigate('/rooms')} className="mb-6 text-indigo-600 hover:text-indigo-700 font-semibold flex items-center">← Back to Rooms</button>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <p className="text-red-600 font-semibold">{roomError || 'Room not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12">
        <button
          onClick={() => navigate('/rooms')}
          className="mb-6 text-indigo-600 hover:text-indigo-700 font-semibold flex items-center"
        >
          ← Back to Rooms
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-lg text-gray-600">Just a few details to secure your workspace</p>
        </div>

        <div className="flex flex-row items-start gap-5">
          <div className="w-[30%]">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Details</h2>

              <div className="space-y-6">
                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 mr-2 text-indigo-600" />
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all text-lg"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={businessTodayISO()}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all text-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <Clock className="w-4 h-4 mr-2 text-indigo-600" />
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all text-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <Clock className="w-4 h-4 mr-2 text-indigo-600" />
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all text-lg"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Confirm Booking</span>
                </button>
              </div>
            </form>
          </div>

          <div className="w-[70%] flex flex-col gap-5">
            <div className=" w-[100%] gap-5 flex flex-row ">
              <SummaryCard title="Room Summary" className="flex-1">
                <div className="mb-6">
                  <img
                    src={room?.image}
                    alt={room?.name}
                    className="w-full h-40 object-cover rounded-xl mb-4"
                  />
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{room?.name}</h4>
                  <p className="text-gray-600">Capacity: {room?.capacity} people</p>
                  <p className="text-gray-600">Base Rate: ₹{room?.baseHourlyRate}/hour</p>
                </div>
              </SummaryCard>

              <SummaryCard title="Pricing Breakdown" className="flex-1">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-semibold text-gray-900">{pricing.hours} hours</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">₹ {pricing.subtotal}</span>
                  </div>
                  {pricing.peakSurcharge > 0 && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Peak Hour Surcharge (50%)</span>
                      <span className="font-semibold text-orange-600">₹ {pricing.peakSurcharge}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4">
                    <span className="text-lg font-bold text-gray-900 flex items-center">
                      Total Amount
                    </span>
                    <span className="text-2xl font-bold text-indigo-600">₹ {pricing.total}</span>
                  </div>
                </div>
              </SummaryCard>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6">
              <h4 className="font-bold text-indigo-900 mb-2">Peak Hour Policy</h4>
              <span className="text-sm text-indigo-700 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Mon–Fri bookings have peak pricing: 10 AM–1 PM and 4 PM–7 PM are charged at 1.5× the base rate.
              </span>
              <span className="text-sm text-indigo-700 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Off-peak hours are charged at the base rate.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
