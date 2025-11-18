// AnalyticsPanel
// Presents date range inputs, KPI cards, and room-wise revenue table.
// Expects analytics data and handlers passed from AdminView.
import React from 'react';
import { Calendar, TrendingUp, IndianRupeeIcon } from 'lucide-react';

export default function AnalyticsPanel({
  dateRange,
  setDateRange,
  loadingAnalytics,
  analyticsError,
  handleGetAnalytics,
  totalRevenue,
  totalHours,
  averageRate,
  analytics,
}) {
  return (
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
  );
}