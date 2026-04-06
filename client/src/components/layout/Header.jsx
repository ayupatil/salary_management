import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Salary Management System
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <Link
              to="/employees"
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                isActive('/employees')
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Employees
            </Link>
            <Link
              to="/insights"
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                isActive('/insights')
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Insights
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
