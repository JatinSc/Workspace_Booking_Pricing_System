import { useState } from 'react';
import AdminHeader from '../components/admin/AdminHeader';
import AnalyticsPanel from '../components/admin/AnalyticsPanel';
import BookingsManagement from '../components/admin/BookingsManagement';
import { useAdminAnalytics } from '../hooks/useAdminAnalytics';
import { useAdminBookings } from '../hooks/useAdminBookings';

// Unified admin dashboard for bookings management and analytics.
// Provides filters, pagination, cancellation, and revenue/hour KPIs.

export default function AdminView() {
  const [showAnalytics, setShowAnalytics] = useState(false);

  const {
    analytics,
    dateRange,
    setDateRange,
    loadingAnalytics,
    analyticsError,
    handleGetAnalytics,
    totalRevenue,
    totalHours,
    averageRate,
  } = useAdminAnalytics();

  const {
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
    totalPages,
    startIndex,
    paginatedBookings,
    handleCancelBooking,
  } = useAdminBookings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className=" mx-auto px-4 sm:px-6 lg:px-12">
        <AdminHeader showAnalytics={showAnalytics} setShowAnalytics={setShowAnalytics} />

        {
          showAnalytics ? (
            <AnalyticsPanel
              dateRange={dateRange}
              setDateRange={setDateRange}
              loadingAnalytics={loadingAnalytics}
              analyticsError={analyticsError}
              handleGetAnalytics={handleGetAnalytics}
              totalRevenue={totalRevenue}
              totalHours={totalHours}
              averageRate={averageRate}
              analytics={analytics}
            />
          ) : (
            <BookingsManagement
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              roomFilter={roomFilter}
              setRoomFilter={setRoomFilter}
              uniqueStatuses={uniqueStatuses}
              uniqueRoomIds={uniqueRoomIds}
              bookings={bookings}
              paginatedBookings={paginatedBookings}
              handleCancelBooking={handleCancelBooking}
              startIndex={startIndex}
              ITEMS_PER_PAGE={ITEMS_PER_PAGE}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          )
        }


      </div>
    </div>
  );
}