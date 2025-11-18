import { useEffect, useMemo, useState } from 'react';
import { Calendar, TrendingUp, DollarSign, Clock, X, IndianRupeeIcon, Filter } from 'lucide-react';
import { api } from '../api/client';
import { formatDateTime, hoursUntil } from '../utils/time';
import { toast } from 'react-hot-toast';

export default function AdminView() {
  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roomFilter, setRoomFilter] = useState('ALL');

  // Analytics state
  const [analytics, setAnalytics] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');

  // Initialize last 7 days
  useEffect(() => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const fmt = (d) => d.toISOString().slice(0, 10);
    setDateRange({ startDate: fmt(sevenDaysAgo), endDate: fmt(today) });
  }, []);

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

  // Analytics helpers
  const totalRevenue = useMemo(() => analytics.reduce((sum, item) => sum + item.totalRevenue, 0), [analytics]);
  const totalHours = useMemo(() => analytics.reduce((sum, item) => sum + item.totalHours, 0), [analytics]);
  const averageRate = useMemo(() => (totalHours > 0 ? (totalRevenue / totalHours).toFixed(0) : 0), [totalHours, totalRevenue]);

  const handleGetAnalytics = async () => {
    const { startDate, endDate } = dateRange;
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }
    setLoadingAnalytics(true);
    setAnalyticsError('');
    try {
      const data = await api.getAnalytics(startDate, endDate);
      setAnalytics(data || []);
    } catch (e) {
      setAnalyticsError(e.message || 'Failed to load analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className=" mx-auto px-4 sm:px-6 lg:px-12">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin View</h1>
            <p className="text-lg text-gray-600">Manage bookings and view analytics</p>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAnalytics(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${!showAnalytics
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Bookings
              </button>
              <button
                onClick={() => setShowAnalytics(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${showAnalytics
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Analytics
              </button>
            </div>
          </div>
        </div>

        {
          showAnalytics ? (
            <>
              {/* Analytics Section */}
              <div className='flex flex-row gap-2 mb-4'>
                <div className="w-2/4 bg-white rounded-2xl shadow-xl p-4 mb-0">
                  <div className="flex items-center mb-3">
                    <Calendar className="w-5 h-5 text-indigo-600 mr-2" />
                    <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1 block">Start Date</label>
                      <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1 block">End Date</label>
                      <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div className="mt-10 flex items-center space-x-2">
                    <button
                      onClick={handleGetAnalytics}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700"
                    >
                      Get Analytics
                    </button>
                    {loadingAnalytics && <span className="text-xs text-gray-600">Loading…</span>}
                    {analyticsError && <span className="text-xs text-red-600">{analyticsError}</span>}
                  </div>
                </div>

                {/* Analytics KPIs */}
                <div className="w-2/4 flex flex-row gap-2">
                  <div className='w-[60%] flex flex-col gap-2'>
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-xl p-4 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wide opacity-90">Total Revenue</h3>
                        <IndianRupeeIcon className="w-6 h-6 opacity-80" />
                      </div>
                      <p className="text-3xl font-bold mb-1">₹{totalRevenue.toLocaleString()}</p>
                      <p className="text-xs opacity-80">Across all rooms</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-xl p-4 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wide opacity-90">Total Hours Booked</h3>
                        <TrendingUp className="w-6 h-6 opacity-80" />
                      </div>
                      <p className="text-3xl font-bold mb-1">{totalHours.toFixed(1)}</p>
                      <p className="text-xs opacity-80">Hours of usage</p>
                    </div>
                  </div>
                  <div className="w-[40%] bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl shadow-xl p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wide opacity-90">Average Rate</h3>
                      <IndianRupeeIcon className="w-6 h-6 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold mb-1">₹{averageRate}/hr</p>
                    <p className="text-xs opacity-80">Per hour average</p>
                  </div>
                </div>
              </div>


              {/* Analytics Table */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700">
                  <h2 className="text-xl font-bold text-white">Room-wise Revenue Breakdown</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Room ID</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Room Name</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Total Hours</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Total Revenue</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Avg. Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.map((item, index) => {
                        const avgRate = (item.totalRevenue / item.totalHours).toFixed(0);
                        return (
                          <tr key={item.roomId} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <td className="px-6 py-4"><span className="font-semibold text-gray-900">{item.roomId}</span></td>
                            <td className="px-6 py-4"><span className="text-gray-900 font-medium">{item.roomName}</span></td>
                            <td className="px-6 py-4"><span className="text-gray-900">{item.totalHours.toFixed(1)} hrs</span></td>
                            <td className="px-6 py-4"><span className="text-lg font-bold text-green-600">₹{item.totalRevenue.toLocaleString()}</span></td>
                            <td className="px-6 py-4"><span className="text-gray-900">₹{avgRate}/hr</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {analytics.length > 0 && (
                      <tfoot className="bg-indigo-50">
                        <tr>
                          <td colSpan="2" className="px-6 py-4 text-right font-bold text-gray-900 text-lg">TOTAL</td>
                          <td className="px-6 py-4"><span className="font-bold text-gray-900 text-lg">{totalHours.toFixed(1)} hrs</span></td>
                          <td className="px-6 py-4"><span className="text-xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</span></td>
                          <td className="px-6 py-4"><span className="font-bold text-gray-900 text-lg">₹{averageRate}/hr</span></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
                {analytics.length === 0 && (
                  <div className="text-center py-12"><p className="text-gray-500 text-lg">No analytics data available</p></div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Bookings Section */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Bookings Management</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center text-white gap-2">
                      <Filter className="w-5 h-5 opacity-90" />
                      <span className="text-sm font-medium">Filters</span>
                    </div>
                    <div className="flex flex-col">
                      {/* <label className="text-xs text-white/90 mb-1">Status</label> */}
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="font-medium bg-white/20 text-white rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-white border border-white/30"
                      >
                        <option value="ALL">All Statuses</option>
                        {uniqueStatuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      {/* <label className="text-xs text-white/90 mb-1">Room</label> */}
                      <select
                        value={roomFilter}
                        onChange={(e) => setRoomFilter(e.target.value)}
                        className="font-medium bg-white/20 text-white rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-white border border-white/30"
                      >
                        <option value="ALL">All Rooms</option>
                        {uniqueRoomIds.map((id) => (
                          <option key={id} value={id}>{`Room ${id}`}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => { setStatusFilter('ALL'); setRoomFilter('ALL'); }}
                      className="px-3 py-2 rounded-md text-white bg-white/40 hover:bg-white/30 text-sm font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Room ID</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">User Name</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Date & Time</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Total Price (₹)</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedBookings.map((booking, index) => {
                        const startDateTime = formatDateTime(booking.startTime);
                        const endDateTime = formatDateTime(booking.endTime);
                        const hoursUntilStart = hoursUntil(booking.startTime);
                        const canCancel = booking.status === 'CONFIRMED' && hoursUntilStart > 2;
                        const getStatusBadge = (status) => {
                          const styles = {
                            CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
                            CANCELED: 'bg-red-100 text-red-800 border-red-200',
                            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          };
                          return (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.PENDING}`}>
                              {status}
                            </span>
                          );
                        };
                        return (
                          <tr key={booking.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <td className="px-6 py-4"><span className="text-gray-900 font-medium">{booking.roomId}</span></td>
                            <td className="px-6 py-4"><span className="text-gray-900">{booking.userName}</span></td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <div className="flex items-center text-sm text-gray-600"><Calendar className="w-4 h-4 mr-2 text-indigo-600" />{startDateTime.date}</div>
                                <div className="flex items-center text-sm text-gray-600"><Clock className="w-4 h-4 mr-2 text-indigo-600" />{startDateTime.time} - {endDateTime.time}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4"><span className="text-gray-900 font-medium">₹{booking.totalPrice}</span></td>
                            <td className="px-6 py-4">{getStatusBadge(booking.status)}</td>
                            <td className="px-6 py-4">
                              {canCancel ? (
                                <button onClick={() => handleCancelBooking(booking.id)} className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                                  <X className="w-4 h-4" />
                                  <span>Cancel</span>
                                </button>
                              ) : (
                                <>
                                  {booking.status === 'CONFIRMED' && (
                                    <span className="text-sm text-gray-500 italic">Cancellation window closed</span>
                                  )}
                                  {booking.status === 'CANCELED' && (
                                    <span className="text-sm text-gray-400 italic">Already cancelled</span>
                                  )}
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {bookings.length > 0 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Showing {bookings.length === 0 ? 0 : startIndex + 1}-{Math.min(bookings.length, startIndex + ITEMS_PER_PAGE)} of {bookings.length}</span>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`px-3 py-2 rounded-lg border ${currentPage === 1 ? 'text-gray-400 bg-gray-100 border-gray-200' : 'text-indigo-700 bg-white hover:bg-indigo-50 border-gray-300'}`}>Previous</button>
                      {Array.from({ length: totalPages }).map((_, i) => {
                        const page = i + 1;
                        const isActive = page === currentPage;
                        return (
                          <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-2 rounded-lg border ${isActive ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-700 hover:bg-indigo-50 border-gray-300'}`}>{page}</button>
                        );
                      })}
                      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || bookings.length === 0} className={`px-3 py-2 rounded-lg border ${(currentPage === totalPages || bookings.length === 0) ? 'text-gray-400 bg-gray-100 border-gray-200' : 'text-indigo-700 bg-white hover:bg-indigo-50 border-gray-300'}`}>Next</button>
                    </div>
                  </div>
                )}
                {bookings.length === 0 && (
                  <div className="text-center py-12"><p className="text-gray-500 text-lg">No bookings found</p></div>
                )}
              </div>
            </>
          )
        }


      </div>
    </div>
  );
}