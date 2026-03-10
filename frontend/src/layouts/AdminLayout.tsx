import { Outlet, Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Bus, Map, Calendar, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
import { getAuthUser, logout } from "../utils/auth";

export default function AdminLayout() {
  const user = getAuthUser();
  const navigate = useNavigate();
  const location = useLocation();

  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
    { name: "Manage Buses", path: "/admin/buses", icon: <Bus className="w-5 h-5 mr-3" /> },
    { name: "Manage Routes", path: "/admin/routes", icon: <Map className="w-5 h-5 mr-3" /> },
    { name: "Manage Schedules", path: "/admin/schedules", icon: <Calendar className="w-5 h-5 mr-3" /> },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col shadow-xl z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <ShieldCheck className="w-8 h-8 text-indigo-400 mr-3" />
          <span className="text-xl font-bold tracking-tight text-white">Admin Portal</span>
        </div>
        <div className="p-4 flex-1">
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path !== "/admin" && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-400 mb-4 px-2 truncate">Logged in as {user?.email}</div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3 text-rose-400" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center px-8 z-10">
          <h1 className="text-xl font-semibold text-slate-800">System Management</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
