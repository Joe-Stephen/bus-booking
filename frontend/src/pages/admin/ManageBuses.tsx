import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import { Plus, Bus as BusIcon } from "lucide-react";

export default function ManageBuses() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ registrationNo: "", capacity: 40, features: "AC, WiFi" });

  const { data: buses, isLoading } = useQuery({
    queryKey: ["adminBuses"],
    queryFn: async () => (await apiClient.get("/admin/buses")).data
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        totalSeats: form.capacity,
        features: form.features.split(",").map(f => f.trim())
      };
      await apiClient.post("/admin/bus", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBuses"] });
      setIsAdding(false);
      setForm({ registrationNo: "", capacity: 40, features: "AC, WiFi" });
    }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Manage Fleet</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Bus
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Register New Bus</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Registration Number</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border outline-none"
                value={form.registrationNo}
                onChange={e => setForm({...form, registrationNo: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Total Seats</label>
              <input
                type="number"
                min="10"
                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border outline-none"
                value={form.capacity}
                onChange={e => setForm({...form, capacity: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Features (comma separated)</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border outline-none"
                value={form.features}
                onChange={e => setForm({...form, features: e.target.value})}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-slate-700bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">Save Bus</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bus Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Capacity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Features</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Added On</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {isLoading ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-slate-500">Loading fleet data...</td></tr>
            ) : buses?.data?.map((bus: any) => (
              <tr key={bus.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <BusIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900">{bus.name}</div>
                      <div className="text-sm text-slate-500 font-mono">{bus.registrationNo || 'No Plates'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    {bus.capacity || bus.totalSeats} Seats
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {bus.features?.join(", ") || "Standard"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(bus.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
