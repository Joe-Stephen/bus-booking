import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import { Link } from "react-router-dom";
import { Map, ArrowRight } from "lucide-react";

export default function RoutesList() {
  const { data: routes, isLoading } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      const res = await apiClient.get("/routes");
      return res.data;
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Available Routes</h1>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-40"></div>
          ))}
        </div>
      ) : routes?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Map className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Routes Currently Active</h3>
          <p className="text-gray-500">Check back later for new destinations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes?.map((route: any) => (
            <div key={route.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-primary-50 p-2 rounded-lg inline-flex">
                    <Map className="w-6 h-6 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                    {route.distance} km
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{route.source}</h3>
                <div className="flex items-center text-gray-500 mb-2">
                   <ArrowRight className="w-4 h-4 mx-2" />
                   <h3 className="text-xl font-bold text-gray-900">{route.destination}</h3>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <Link
                  to={`/routes/${route.id}/schedules`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center"
                >
                  View Schedules <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
