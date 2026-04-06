import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Salary Management System
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-4">
            <Link
              to="/employees"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/employees')
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Employees
            </Link>
            <Link
              to="/insights"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/insights')
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
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
