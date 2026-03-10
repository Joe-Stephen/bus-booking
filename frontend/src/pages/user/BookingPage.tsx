import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import { Ticket, Users, AlertCircle, CheckCircle } from "lucide-react";

export default function BookingPage() {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);

  const { data: availability, isLoading: loadingAvail, error: availError } = useQuery({
    queryKey: ["availability", scheduleId],
    queryFn: async () => {
      const res = await apiClient.get(`/schedules/${scheduleId}/availability`);
      return res.data;
    },
    // Don't retry since 404 means it's gone
    retry: 0,
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/bookings", { scheduleId });
      return res.data;
    },
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      queryClient.invalidateQueries({ queryKey: ["myBookingsSummary"] });
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      setTimeout(() => navigate("/my-bookings"), 3000);
    },
  });

  if (loadingAvail) {
    return (
      <div className="animate-pulse bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-64 max-w-2xl mx-auto"></div>
    );
  }

  if (availError) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
         <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
         <h3 className="text-lg font-medium text-gray-900">Schedule Unavailable</h3>
         <p className="text-gray-500 mb-6">This schedule could not be found or has already departed.</p>
         <Link to="/routes" className="text-primary-600 hover:text-primary-700 font-medium">Browse Routes</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 bg-white rounded-2xl shadow-sm border border-green-100 ring-4 ring-green-50">
         <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
         <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
         <p className="text-gray-600 mb-6">Your seat has been successfully reserved.</p>
         <p className="text-sm text-gray-500">Redirecting to your bookings...</p>
      </div>
    );
  }

  const isSoldOut = availability?.available <= 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Ticket className="w-5 h-5 mr-2 text-primary-600" />
            Complete Your Booking
          </h3>
          <Link to="/routes" className="text-sm text-gray-500 hover:text-gray-700">Cancel</Link>
        </div>
        
        <div className="p-6 md:p-8">
          {bookMutation.isError && (
             <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start mb-6 text-sm font-medium border border-red-100">
               <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
               {/* @ts-ignore */}
               <p>{bookMutation.error.response?.data?.message || "Failed to secure booking. Another user may have just taken the last seat."}</p>
             </div>
          )}

          <div className="bg-primary-50 rounded-2xl p-6 mb-8 border border-primary-100 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white p-3 rounded-full shadow-sm mr-4">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Available Seats</p>
                <p className="text-2xl font-bold text-gray-900">{availability?.available} <span className="text-lg text-gray-500 font-normal">/ {availability?.capacity}</span></p>
              </div>
            </div>
            {isSoldOut && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800">
                SOLD OUT
              </span>
            )}
          </div>

          <button
            onClick={() => bookMutation.mutate()}
            disabled={bookMutation.isPending || isSoldOut}
            className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white transition-all active:scale-95 ${
              isSoldOut 
                ? "bg-gray-300 cursor-not-allowed" 
                : "bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            }`}
          >
            {bookMutation.isPending ? "Securing Seat..." : isSoldOut ? "No Seats Available" : "Confirm Reservation"}
          </button>
          
          <p className="text-center text-xs text-gray-500 mt-4">
            By confirming, your seat will be permanently locked under your account.
          </p>
        </div>
      </div>
    </div>
  );
}
