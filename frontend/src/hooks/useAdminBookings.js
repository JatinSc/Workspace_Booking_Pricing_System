// useAdminBookings
// Encapsulates bookings state, filters, pagination, and cancellation logic.
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { toast } from 'react-hot-toast';

export function useAdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roomFilter, setRoomFilter] = useState('ALL');

  // Load bookings
  useEffect(() => {
    (async () => {
      try {
        const list = await api.listBookings();
        setBookings(list || []);
      } catch (e) {
        console.error('Failed to load bookings', e);
        toast.error('Failed to load bookings');
        setBookings([]);
      }
    })();
  }, []);

  const uniqueStatuses = useMemo(() => {
    const set = new Set((bookings || []).map(b => b.status).filter(Boolean));
    return Array.from(set);
  }, [bookings]);

  const uniqueRoomIds = useMemo(() => {
    const set = new Set((bookings || []).map(b => b.roomId).filter(Boolean));
    return Array.from(set);
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return (bookings || []).filter(b => {
      const statusOk = statusFilter === 'ALL' || b.status === statusFilter;
      const roomOk = roomFilter === 'ALL' || String(b.roomId) === String(roomFilter);
      return statusOk && roomOk;
    });
  }, [bookings, statusFilter, roomFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [filteredBookings, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, roomFilter]);

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.cancelBooking(bookingId);
        setBookings(prev => prev.map(booking =>
          booking.id === bookingId ? { ...booking, status: 'CANCELED' } : booking
        ));
        toast.success('Booking cancelled successfully');
      } catch (e) {
        toast.error(`Cancel failed: ${e.message}`);
      }
    }
  };

  return {
    bookings,
    currentPage,
    setCurrentPage,
    ITEMS_PER_PAGE,
    statusFilter,
    setStatusFilter,
    roomFilter,
    setRoomFilter,
    uniqueStatuses,
    uniqueRoomIds,
    filteredBookings,
    totalPages,
    startIndex,
    paginatedBookings,
    handleCancelBooking,
  };
}