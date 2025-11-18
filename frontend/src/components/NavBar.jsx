import { Building2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function NavBar() {
  const navItems = [
    { to: '/rooms', id: 'rooms', label: 'Book Rooms' },
    { to: '/admin-view', id: 'admin-view', label: 'Admin View' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3 hover:cursor-pointer" onClick={() => window.location.href = '/'}>
            <Building2 className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">WorkSpace</span>
          </div>

          <div className="flex space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
