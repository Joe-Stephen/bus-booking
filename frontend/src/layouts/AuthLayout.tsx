import { Outlet } from "react-router-dom";
import { Bus } from "lucide-react";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="bg-primary-600 p-3 rounded-2xl shadow-lg ring-4 ring-primary-100">
            <Bus className="h-10 w-10 text-white" />
          </div>
        </div>
        <div className="glass p-8 rounded-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
