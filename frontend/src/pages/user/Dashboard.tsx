import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import { Bus, MapPin, CalendarDays, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["myBookingsSummary"],
    queryFn: async () => {
      const res = await apiClient.get("/bookings/my-bookings");
      return res.data;
    },
  });

  const recentBookings = bookings?.data?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Welcome to BusConnect</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="bg-primary-50 p-4 rounded-full mb-4">
            <MapPin className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Find a Route</h3>
          <p className="text-gray-500 mb-6 flex-1">Browse our extensive network of bus routes and plan your next journey.</p>
          <Link to="/routes" className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700">
            Browse Routes <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="bg-indigo-50 p-4 rounded-full mb-4">
            <CalendarDays className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">My Bookings</h3>
          <p className="text-gray-500 mb-6 flex-1">View your upcoming trips, past journeys, or modify your current reservations.</p>
          <Link to="/my-bookings" className="w-full inline-flex justify-center items-center px-4 py-2 border border-indigo-100 text-sm font-medium rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
            View History <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Activity</h3>
        </div>
        <div className="px-6 py-5 flex items-center justify-center text-gray-500 min-h-[150px]">
          {isLoading ? (
            <div className="animate-pulse flex space-x-4">
               <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="text-center">
               <Bus className="w-10 h-10 text-gray-300 mx-auto mb-2" />
               <p>No recent bookings found.</p>
            </div>
          ) : (
            <ul className="w-full divide-y divide-gray-100">
              {recentBookings.map((b: any) => (
                <li key={b.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {b.schedule?.route?.source} → {b.schedule?.route?.destination}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(b.schedule?.departureTime).toLocaleString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    b.status === 'BOOKED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {b.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
