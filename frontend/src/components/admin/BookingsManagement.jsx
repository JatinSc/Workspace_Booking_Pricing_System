// BookingsManagement
// Renders filters, bookings table, and pagination controls.
// Receives booking data and handlers from AdminView.
import React from 'react';
import { Calendar, Clock, X, Filter } from 'lucide-react';
import { formatDateTime, hoursUntil } from '../../utils/time';

export default function BookingsManagement({
  statusFilter,
  setStatusFilter,
  roomFilter,
  setRoomFilter,
  uniqueStatuses,
  uniqueRoomIds,
  bookings,
  paginatedBookings,
  handleCancelBooking,
  startIndex,
  ITEMS_PER_PAGE,
  currentPage,
  totalPages,
  setCurrentPage,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Bookings Management</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center text-white gap-2">
            <Filter className="w-5 h-5 opacity-90" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          <div className="flex flex-col">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="font-medium bg-white/20 text-gray-800 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-white border border-white/30"
            >
              <option value="ALL">All Statuses</option>
              {uniqueStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="font-medium bg-white/20 text-gray-800 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-white border border-white/30"
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
  );
}