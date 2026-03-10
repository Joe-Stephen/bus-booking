import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Bus, Map, Clock, LogOut, User as UserIcon } from "lucide-react";
import { getAuthUser, logout } from "../utils/auth";

export default function MainLayout() {
  const user = getAuthUser();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: <UserIcon className="w-5 h-5 mr-2" /> },
    { name: "Routes", path: "/routes", icon: <Map className="w-5 h-5 mr-2" /> },
    { name: "My Bookings", path: "/my-bookings", icon: <Clock className="w-5 h-5 mr-2" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate("/dashboard")}>
                <div className="bg-primary-600 p-2 rounded-lg mr-3">
                  <Bus className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">BusConnect</span>
              </div>
              <nav className="ml-10 hidden md:flex space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname.startsWith(link.path)
                        ? "border-primary-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-4 font-medium">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="animate-in fade-in duration-300">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
