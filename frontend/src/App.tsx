import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getAuthUser } from "./utils/auth";
import { Toaster } from "sonner";

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

// Public Pages
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";

// User Pages
import Dashboard from "./pages/user/Dashboard";
import RoutesList from "./pages/user/RoutesList";
import RouteSchedules from "./pages/user/RouteSchedules";
import BookingPage from "./pages/user/BookingPage";
import MyBookings from "./pages/user/MyBookings";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageBuses from "./pages/admin/ManageBuses";
import ManageRoutes from "./pages/admin/ManageRoutes";
import ManageSchedules from "./pages/admin/ManageSchedules";

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole?: "USER" | "ADMIN" }) => {
  const user = getAuthUser();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === "ADMIN" ? "/admin" : "/dashboard"} replace />;
  }
  return children;
};

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <Router>
        <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* User Protected Routes */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/routes" element={<RoutesList />} />
          <Route path="/routes/:id/schedules" element={<RouteSchedules />} />
          <Route path="/booking/:scheduleId" element={<BookingPage />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRole="ADMIN"><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/buses" element={<ManageBuses />} />
          <Route path="/admin/routes" element={<ManageRoutes />} />
          <Route path="/admin/schedules" element={<ManageSchedules />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </Router>
    </>
  );
}
