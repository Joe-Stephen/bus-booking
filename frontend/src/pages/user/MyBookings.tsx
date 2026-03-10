import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import { CalendarDays, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

export default function MyBookings() {
  const queryClient = useQueryClient();
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["myBookings"],
    queryFn: async () => {
      const res = await apiClient.get("/bookings/my-bookings");
      return res.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.patch(`/bookings/${id}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      queryClient.invalidateQueries({ queryKey: ["myBookingsSummary"] });
      setCancelingId(null);
    },
    onError: () => {
      setCancelingId(null);
    }
  });

  const handleCancel = (id: string) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      setCancelingId(id);
      cancelMutation.mutate(id);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings history</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-32"></div>
          ))}
        </div>
      ) : bookings?.data?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No History Available</h3>
          <p className="text-gray-500">You haven't made any bookings yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
           {bookings?.data?.map((booking: any) => {
             const isPast = new Date(booking.schedule.departureTime) < new Date();
             const isCancelled = booking.status === "CANCELLED";

             return (
              <div key={booking.id} className={`bg-white rounded-2xl shadow-sm border ${isCancelled ? 'border-red-200' : 'border-gray-100'} overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow`}>
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between">
                     <div>
                        <div className="flex items-center mb-2">
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mr-3 ${
                             isCancelled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                           }`}>
                             {booking.status}
                           </span>
                           <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" /> Booked: {format(new Date(booking.bookedAt), "MMM d, yyyy")}
                           </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {booking.schedule.route.source} → {booking.schedule.route.destination}
                        </h3>
                     </div>
                  </div>
                  
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 gap-y-2 sm:gap-x-6">
                     <div>
                        <span className="font-semibold text-gray-900 block">Departure</span>
                        {format(new Date(booking.schedule.departureTime), "MMM d, yyyy - h:mm a")}
                     </div>
                     <div>
                        <span className="font-semibold text-gray-900 block">Arrival</span>
                        {format(new Date(booking.schedule.arrivalTime), "MMM d, yyyy - h:mm a")}
                     </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 border-t sm:border-t-0 sm:border-l border-gray-100 flex items-center justify-center sm:w-48">
                  {!isPast && !isCancelled ? (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancelingId === booking.id}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-200 text-sm font-medium rounded-xl text-red-700 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {cancelingId === booking.id ? "Canceling..." : <><XCircle className="w-4 h-4 mr-2" /> Cancel</>}
                    </button>
                  ) : isCancelled ? (
                     <span className="text-sm font-medium text-red-600">Cancelled</span>
                  ) : (
                     <span className="text-sm font-medium text-gray-500">Trip Completed</span>
                  )}
                </div>
              </div>
             );
           })}
        </div>
      )}
    </div>
  );
}
