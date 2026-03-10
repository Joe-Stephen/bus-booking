import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import { Bus, Map, CalendarDays, Users } from "lucide-react";

export default function AdminDashboard() {
  const { data: buses } = useQuery({
    queryKey: ["adminBuses"],
    queryFn: async () => (await apiClient.get("/admin/buses")).data
  });
  
  const { data: routes } = useQuery({
    queryKey: ["adminRoutes"],
    queryFn: async () => (await apiClient.get("/admin/routes")).data
  });

  const { data: schedules } = useQuery({
    queryKey: ["adminSchedules"],
    queryFn: async () => (await apiClient.get("/admin/schedules")).data
  });

  const stats = [
    { name: "Total Fleet", value: buses?.data?.length || 0, icon: <Bus className="w-8 h-8 text-blue-500" />, bgColor: "bg-blue-50" },
    { name: "Active Routes", value: routes?.data?.length || 0, icon: <Map className="w-8 h-8 text-emerald-500" />, bgColor: "bg-emerald-50" },
    { name: "Upcoming Schedules", value: schedules?.data?.length || 0, icon: <CalendarDays className="w-8 h-8 text-indigo-500" />, bgColor: "bg-indigo-50" },
    { name: "Total Bookings", value: "System", icon: <Users className="w-8 h-8 text-purple-500" />, bgColor: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time metrics for BusConnect operations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative">
            <div className="p-5 flex items-center">
              <div className={`${item.bgColor} rounded-xl p-3 absolute right-5 top-5`}>
                {item.icon}
              </div>
              <div className="mt-2">
                 <p className="text-sm font-medium text-slate-500 truncate">{item.name}</p>
                 <p className="mt-1 text-3xl font-semibold text-slate-900">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mt-8">
         <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
         <div className="flex gap-4">
            <a href="/admin/buses" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-4 py-2 rounded-lg">Add New Bus</a>
            <a href="/admin/routes" className="text-sm font-medium text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-4 py-2 rounded-lg">Create Route</a>
            <a href="/admin/schedules" className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg">Dispatch Schedule</a>
         </div>
      </div>
    </div>
  );
}
