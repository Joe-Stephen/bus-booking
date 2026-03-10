import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import { Plus, MapPin } from "lucide-react";

export default function ManageRoutes() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ source: "", destination: "", distance: 0 });

  const { data: routes, isLoading } = useQuery({
    queryKey: ["adminRoutes"],
    queryFn: async () => (await apiClient.get("/admin/routes")).data
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/admin/route", {
         source: form.source,
         destination: form.destination,
         distance: form.distance
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRoutes"] });
      setIsAdding(false);
      setForm({ source: "", destination: "", distance: 0 });
    }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Manage Transit Routes</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Route
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Define New Logistics Route</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Source City / Terminal</label>
              <input
                type="text"
                placeholder="e.g. New York"
                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border outline-none"
                value={form.source}
                onChange={e => setForm({...form, source: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Destination</label>
              <input
                type="text"
                placeholder="e.g. Boston"
                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border outline-none"
                value={form.destination}
                onChange={e => setForm({...form, destination: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Distance Appx (KM)</label>
              <input
                type="number"
                min="1"
                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border outline-none"
                value={form.distance}
                onChange={e => setForm({...form, distance: Number(e.target.value)})}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">Save Route</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pathing Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Metric Distance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Generated</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {isLoading ? (
              <tr><td colSpan={3} className="px-6 py-4 text-center text-sm text-slate-500">Loading map data...</td></tr>
            ) : routes?.data?.map((route: any) => (
              <tr key={route.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900">{route.source} → {route.destination}</div>
                      <div className="text-xs text-slate-500 font-mono">ID: {route.id.split('-')[0]}***</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {route.distance} KM
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(route.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
