import NavBar from './components/NavBar';
import RoomsListing from './pages/RoomsListing';
import BookingForm from './pages/BookingForm';
import AdminView from './pages/AdminView';
import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
  <Routes>
    <Route path="/rooms" element={<RoomsListing />} />
    <Route path="/booking/:roomId" element={<BookingForm />} />
    <Route path="/admin-view" element={<AdminView />} />
    <Route path="/" element={<Navigate to="/rooms" replace />} />
    <Route path="*" element={<Navigate to="/rooms" replace />} />
  </Routes>
    </div>
  );
}

export default App;
