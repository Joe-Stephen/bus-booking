import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { apiClient } from "../../api/client";
import { Calendar, Clock, ArrowRight, Bus } from "lucide-react";
import { format } from "date-fns";

export default function RouteSchedules() {
  const { id } = useParams<{ id: string }>();

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["schedules", id],
    queryFn: async () => {
      const res = await apiClient.get(`/routes/${id}/schedules`);
      return res.data;
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Available Schedules</h1>
        <Link to="/routes" className="text-sm font-medium text-primary-600 hover:text-primary-700">
          &larr; Back to Routes
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-32"></div>
          ))}
        </div>
      ) : schedules?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Schedules Present</h3>
          <p className="text-gray-500">There are no upcoming schedules for this route.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules?.map((schedule: any) => {
            const isFull = schedule.availableSeats <= 0;
            const isPast = schedule.isPast;
            return (
            <div key={schedule.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow ${isPast ? 'border-gray-100 opacity-70' : 'border-gray-100'}`}>
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="bg-indigo-50 p-2 rounded-lg mr-4">
                      <Clock className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {format(new Date(schedule.departureTime), "MMM d, yyyy - h:mm a")}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Arrival: {format(new Date(schedule.arrivalTime), "h:mm a")}
                      </p>
                    </div>
                  </div>
                  {isPast && (
                    <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Departed</span>
                  )}
                  {!isPast && isFull && (
                    <span className="text-xs font-medium bg-red-100 text-red-600 px-2 py-1 rounded-full">Full</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                   <div className="flex items-center">
                      <Bus className="w-4 h-4 mr-2" />
                      {schedule.bus?.name || 'Standard Bus'}
                   </div>
                   <div className="font-semibold text-gray-900">${schedule.price}</div>
                   <div className={`flex items-center font-medium ${isFull ? 'text-red-500' : 'text-emerald-600'}`}>
                      {schedule.availableSeats} seat{schedule.availableSeats !== 1 ? 's' : ''} left
                   </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t sm:border-t-0 sm:border-l border-gray-100 flex items-center justify-center sm:w-48">
                {isPast || isFull ? (
                  <button disabled className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-xl text-gray-400 bg-gray-100 cursor-not-allowed">
                    {isPast ? 'Departed' : 'Sold Out'}
                  </button>
                ) : (
                  <Link
                    to={`/booking/${schedule.id}`}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Book Seat <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
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
