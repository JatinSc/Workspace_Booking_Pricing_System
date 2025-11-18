// AdminHeader
// Displays page title and toggles between Bookings and Analytics views.
export default function AdminHeader({ showAnalytics, setShowAnalytics }) {
  return (
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
  );
}