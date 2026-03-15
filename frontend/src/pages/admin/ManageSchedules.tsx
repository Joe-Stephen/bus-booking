import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import { Plus, CalendarDays, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function ManageSchedules() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [form, setForm] = useState({ busId: "", routeId: "", departureTime: "", arrivalTime: "", price: 0, repeatType: 1 });

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
          price: Number(form.price),
          repeatType: Number(form.repeatType)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
      setIsAdding(false);
      setForm({ busId: "", routeId: "", departureTime: "", arrivalTime: "", price: 0, repeatType: 1 });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      await apiClient.put(`/admin/schedule/${editingScheduleId}`, {
          ...form,
          departureTime: new Date(form.departureTime).toISOString(),
          arrivalTime: new Date(form.arrivalTime).toISOString(),
          price: Number(form.price)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
      setIsAdding(false);
      setEditingScheduleId(null);
      setForm({ busId: "", routeId: "", departureTime: "", arrivalTime: "", price: 0 });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/schedule/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
    }
  });

  const pauseMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/admin/schedule/${id}/pause`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
    }
  });

  const resumeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/admin/schedule/${id}/resume`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
    }
  });

  const handleEdit = (schedule: any) => {
    // Convert dates to local datetime-local format for input
    const toLocalDatetime = (dateString: string) => {
      const d = new Date(dateString);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    setForm({ 
      busId: schedule.busId, 
      routeId: schedule.routeId, 
      departureTime: toLocalDatetime(schedule.departureTime), 
      arrivalTime: toLocalDatetime(schedule.arrivalTime), 
      price: schedule.price 
    });
    setEditingScheduleId(schedule.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingScheduleId(null);
    setForm({ busId: "", routeId: "", departureTime: "", arrivalTime: "", price: 0 });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dispatch Schedules</h1>
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            if (isAdding) handleCancel();
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Assign Schedule
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 animate-in fade-in slide-in-from-top-4 overflow-visible">
          <h3 className="text-lg font-medium text-slate-900 mb-4">{editingScheduleId ? "Edit Route Schedule" : "Launch Route Schedule"}</h3>
          
          {(createMutation.isError || updateMutation.isError) && (
            <div className="mb-4 bg-red-50 p-3 rounded-lg border border-red-100 flex items-start text-sm text-red-600">
               <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
               {/* @ts-ignore */}
               <span>{(createMutation.error || updateMutation.error).response?.data?.message || (createMutation.error || updateMutation.error).response?.data?.error || "Failed to save schedule. Check overlaps or past times."}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
            {!editingScheduleId && (
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-slate-700">Repeat</label>
              <select
                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border outline-none bg-white"
                value={form.repeatType || 1}
                onChange={e => setForm({...form, repeatType: Number(e.target.value)})}
              >
                <option value={1}>Format: Once</option>
                <option value={2}>Daily runs</option>
              </select>
            </div>
            )}
          </div>
          <div className="mt-6 flex justify-end space-x-3 border-t border-slate-100 pt-4">
            <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={() => editingScheduleId ? updateMutation.mutate() : createMutation.mutate()} disabled={createMutation.isPending || updateMutation.isPending || !form.busId || !form.routeId} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {editingScheduleId ? "Update Schedule" : "Deploy Schedule"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mission Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time Windows</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Capacity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Economics</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
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
                      <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                        <span>{schedule.route?.source} → {schedule.route?.destination}</span>
                        {schedule.repeatType === 2 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">Daily</span>
                        )}
                        {schedule.isPaused && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">Paused</span>
                        )}
                      </div>
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
                   <div className="flex flex-col gap-1">
                     <div className="flex items-center gap-2">
                       <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-indigo-500 rounded-full" 
                           style={{ width: `${Math.min(100, ((schedule._count?.bookings || 0) / (schedule.bus?.totalSeats || 1)) * 100)}%` }}
                         />
                       </div>
                       <span className="font-medium text-slate-700">
                         {schedule._count?.bookings || 0} / {schedule.bus?.totalSeats || 0} Booked
                       </span>
                     </div>
                     <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded w-fit">
                       Available: {Math.max(0, (schedule.bus?.totalSeats || 0) - (schedule._count?.bookings || 0))}
                     </span>
                   </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                   <span className="font-mono text-emerald-600 font-semibold">${schedule.price}</span> Base Rate
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {schedule.isPaused ? (
                    <button onClick={() => resumeMutation.mutate(schedule.id)} className="text-emerald-600 hover:text-emerald-900 mr-4">Resume</button>
                  ) : (
                    <button onClick={() => pauseMutation.mutate(schedule.id)} className="text-amber-600 hover:text-amber-900 mr-4">{schedule.isGroup ? "Pause Series" : "Pause"}</button>
                  )}
                  <button onClick={() => handleEdit(schedule)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                  <button onClick={() => { if(confirm('Are you sure you want to delete this schedule item?')) deleteMutation.mutate(schedule.id) }} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
