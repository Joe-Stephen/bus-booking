import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import { Plus, CalendarDays, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function ManageSchedules() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ busId: "", routeId: "", departureTime: "", arrivalTime: "", price: 0 });

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["adminSchedules"],
    queryFn: async () => (await apiClient.get("/admin/schedules")).data
  });

  const { data: buses } = useQuery({ queryKey: ["adminBuses"], queryFn: async () => (await apiClient.get("/admin/buses")).data });
  const { data: routes } = useQuery({ queryKey: ["adminRoutes"], queryFn: async () => (await apiClient.get("/admin/routes")).data });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/admin/schedule", {
          ...form,
          departureTime: new Date(form.departureTime).toISOString(),
          arrivalTime: new Date(form.arrivalTime).toISOString(),
          price: Number(form.price)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
      setIsAdding(false);
      setForm({ busId: "", routeId: "", departureTime: "", arrivalTime: "", price: 0 });
    }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dispatch Schedules</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Assign Schedule
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 animate-in fade-in slide-in-from-top-4 overflow-visible">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Launch Route Schedule</h3>
          
          {createMutation.isError && (
            <div className="mb-4 bg-red-50 p-3 rounded-lg border border-red-100 flex items-start text-sm text-red-600">
               <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
               {/* @ts-ignore */}
               <span>{createMutation.error.response?.data?.message || createMutation.error.response?.data?.error || "Failed to create schedule. Check overlaps or past times."}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-slate-700">Assign Bus</label>
              <select
                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border outline-none bg-white"
                value={form.busId}
                onChange={e => setForm({...form, busId: e.target.value})}
              >
                <option value="">Select Vehicle</option>
                {buses?.data?.map((bus: any) => <option key={bus.id} value={bus.id}>{bus.name || bus.registrationNo}</option>)}
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-slate-700">Set Route Path</label>
              <select
                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border outline-none bg-white"
                value={form.routeId}
                onChange={e => setForm({...form, routeId: e.target.value})}
              >
                <option value="">Select Path</option>
                {routes?.data?.map((route: any) => <option key={route.id} value={route.id}>{route.source} to {route.destination}</option>)}
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-slate-700">Departure</label>
              <input
                type="datetime-local"
                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border outline-none"
                value={form.departureTime}
                onChange={e => setForm({...form, departureTime: e.target.value})}
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-slate-700">Arrival</label>
              <input
                type="datetime-local"
                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border outline-none"
                value={form.arrivalTime}
                onChange={e => setForm({...form, arrivalTime: e.target.value})}
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-slate-700">Pricing Base ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border outline-none"
                value={form.price}
                onChange={e => setForm({...form, price: Number(e.target.value)})}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3 border-t border-slate-100 pt-4">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.busId || !form.routeId} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">Deploy Schedule</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mission Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time Windows</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Economics</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {isLoading ? (
              <tr><td colSpan={3} className="px-6 py-4 text-center text-sm text-slate-500">Syncing telemetry...</td></tr>
            ) : schedules?.data?.map((schedule: any) => (
              <tr key={schedule.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CalendarDays className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900">{schedule.route?.source} → {schedule.route?.destination}</div>
                      <div className="text-xs text-slate-500 font-medium">Bus: {schedule.bus?.name || schedule.bus?.registrationNo}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <div className="flex flex-col gap-1">
                     <span className="bg-slate-100 px-2 rounded w-fit">DEP: {format(new Date(schedule.departureTime), "MMM d - h:mm a")}</span>
                     <span className="bg-slate-100 px-2 rounded w-fit">ARR: {format(new Date(schedule.arrivalTime), "MMM d - h:mm a")}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                   <span className="font-mono text-emerald-600 font-semibold">\${schedule.price}</span> Base Rate
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
