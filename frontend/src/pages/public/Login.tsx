import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import { LogIn, AlertCircle } from "lucide-react";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/auth/login", { email, password });
      return res.data;
    },
    onSuccess: (data) => {
      const { accessToken, refreshToken } = data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      try {
        const decoded: any = jwtDecode(accessToken);
        if (decoded.role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } catch {
        navigate("/dashboard");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div>
      <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">Welcome Back</h2>
      {mutation.isError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center mb-4 text-sm font-medium">
          <AlertCircle className="w-5 h-5 mr-2" />
          {/* @ts-ignore */}
          {mutation.error.response?.data?.message || mutation.error.response?.data?.error || "Login failed"}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            required
            spellCheck="false"
            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 border outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            required
            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 border outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-transform active:scale-95"
        >
          {mutation.isPending ? "Signing in..." : <><LogIn className="w-5 h-5 mr-2" /> Sign In</>}
        </button>
      </form>
      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">Don't have an account? </span>
        <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500">
          Create one now
        </Link>
      </div>
    </div>
  );
}
