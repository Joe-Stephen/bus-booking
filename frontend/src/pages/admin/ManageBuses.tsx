import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import { Plus, Bus as BusIcon, MapPin, ChevronDown, ChevronUp, Navigation, Clock } from "lucide-react";

export default function ManageBuses() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingBusId, setEditingBusId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", totalSeats: 40 });
  const [locationPanelBusId, setLocationPanelBusId] = useState<string | null>(null);

  const { data: buses, isLoading } = useQuery({
    queryKey: ["adminBuses"],
    queryFn: async () => (await apiClient.get("/admin/buses")).data
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/admin/bus", {
        name: form.name,
        totalSeats: form.totalSeats,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBuses"] });
      setIsAdding(false);
      setForm({ name: "", totalSeats: 40 });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      await apiClient.put(`/admin/bus/${editingBusId}`, {
        name: form.name,
        totalSeats: form.totalSeats,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBuses"] });
      setIsAdding(false);
      setEditingBusId(null);
      setForm({ name: "", totalSeats: 40 });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/bus/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBuses"] });
    }
  });

  const handleEdit = (bus: any) => {
    setForm({ name: bus.name, totalSeats: bus.totalSeats });
    setEditingBusId(bus.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingBusId(null);
    setForm({ name: "", totalSeats: 40 });
  };

  const toggleLocationPanel = (busId: string) => {
    setLocationPanelBusId(prev => prev === busId ? null : busId);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Manage Fleet</h1>
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            if (isAdding) handleCancel();
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Bus
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-medium text-slate-900 mb-4">{editingBusId ? "Edit Bus" : "Register New Bus"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Bus Name</label>
              <input
                type="text"
                placeholder="e.g. KL-01-AB-1234"
                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border outline-none"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Total Seats</label>
              <input
                type="number"
                min="10"
                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border outline-none"
                value={form.totalSeats}
                onChange={e => setForm({...form, totalSeats: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={() => editingBusId ? updateMutation.mutate() : createMutation.mutate()} disabled={createMutation.isPending || updateMutation.isPending || !form.name} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {editingBusId ? "Update Bus" : "Save Bus"}
            </button>
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
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">Loading fleet data...</td></tr>
            ) : buses?.data?.map((bus: any) => (
              <>
                <tr key={bus.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <BusIcon className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{bus.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{bus.id.slice(0, 8)}…</div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => toggleLocationPanel(bus.id)}
                      className="inline-flex items-center text-emerald-600 hover:text-emerald-900 mr-4"
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      Location
                      {locationPanelBusId === bus.id ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
                    </button>
                    <button onClick={() => handleEdit(bus)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                    <button onClick={() => { if(confirm('Are you sure you want to delete this bus?')) deleteMutation.mutate(bus.id) }} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
                {/* Location Panel Expanded Row */}
                {locationPanelBusId === bus.id && (
                  <tr key={`loc-${bus.id}`}>
                    <td colSpan={5} className="px-6 py-0 bg-slate-50">
                      <BusLocationPanel busId={bus.id} busName={bus.name} />
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Location Panel Sub-component ─────────────────────────────────────────────

function BusLocationPanel({ busId, busName }: { busId: string; busName: string }) {
  const queryClient = useQueryClient();
  const [locationForm, setLocationForm] = useState({ latitude: "", longitude: "", speed: "" });
  const [submitMsg, setSubmitMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data: locationData, isLoading, error } = useQuery({
    queryKey: ["busLocation", busId],
    queryFn: async () => {
      const res = await apiClient.get(`/tracking/bus/${busId}`);
      return res.data?.data;
    },
    // Refresh every 10s so the panel stays reasonably fresh
    refetchInterval: 10_000,
    retry: false,
  });

  const setLocationMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        latitude: parseFloat(locationForm.latitude),
        longitude: parseFloat(locationForm.longitude),
      };
      if (locationForm.speed) payload.speed = parseFloat(locationForm.speed);
      const res = await apiClient.post(`/tracking/bus/${busId}`, payload);
      return res.data;
    },
    onSuccess: () => {
      setSubmitMsg({ type: "success", text: "Location updated!" });
      queryClient.invalidateQueries({ queryKey: ["busLocation", busId] });
      setTimeout(() => setSubmitMsg(null), 3000);
    },
    onError: (err: any) => {
      setSubmitMsg({ type: "error", text: err.response?.data?.message || "Failed to update location." });
    },
  });

  return (
    <div className="py-4 border-t border-slate-200">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Current Location Card ── */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-emerald-600" /> Current Location
          </h4>

          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </div>
          ) : error || !locationData ? (
            <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-100 rounded-xl p-4">
              <MapPin className="w-4 h-4 text-slate-300" />
              <span>No location data available for this bus.</span>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Latitude</p>
                  <p className="font-mono text-slate-800 font-semibold">{locationData.latitude.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Longitude</p>
                  <p className="font-mono text-slate-800 font-semibold">{locationData.longitude.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Speed</p>
                  <p className="font-semibold text-slate-800">
                    {locationData.speed != null ? `${locationData.speed} mph` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Maps Link</p>
                  <a
                    href={`https://maps.google.com/?q=${locationData.latitude},${locationData.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Open in Maps ↗
                  </a>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                Last updated: {new Date(locationData.updatedAt).toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* ── Set Test Location Form ── */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-indigo-600" /> Set / Update Location
          </h4>
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  placeholder="e.g. 12.9716"
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-1.5 outline-none focus:border-indigo-400"
                  value={locationForm.latitude}
                  onChange={e => setLocationForm(f => ({ ...f, latitude: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  placeholder="e.g. 77.5946"
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-1.5 outline-none focus:border-indigo-400"
                  value={locationForm.longitude}
                  onChange={e => setLocationForm(f => ({ ...f, longitude: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Speed (mph) <span className="text-slate-400 font-normal">— optional</span></label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 55"
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-1.5 outline-none focus:border-indigo-400"
                value={locationForm.speed}
                onChange={e => setLocationForm(f => ({ ...f, speed: e.target.value }))}
              />
            </div>

            {submitMsg && (
              <p className={`text-xs font-medium ${submitMsg.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
                {submitMsg.text}
              </p>
            )}

            <button
              onClick={() => setLocationMutation.mutate()}
              disabled={setLocationMutation.isPending || !locationForm.latitude || !locationForm.longitude}
              className="w-full py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 transition-colors"
            >
              {setLocationMutation.isPending ? "Saving..." : "Save Location"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
