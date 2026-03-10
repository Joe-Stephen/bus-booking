import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import { UserPlus, AlertCircle, CheckCircle } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/auth/register", { name, email, password });
      return res.data;
    },
    onSuccess: () => {
      setIsSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
        <p className="text-gray-600">Please check your email to verify your account. Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">Create Account</h2>
      {mutation.isError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center mb-4 text-sm font-medium">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          {/* @ts-ignore */}
          {mutation.error.response?.data?.errors?.[0]?.message || mutation.error.response?.data?.error || "Registration failed"}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 border outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            required
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
            minLength={6}
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
          {mutation.isPending ? "Creating..." : <><UserPlus className="w-5 h-5 mr-2" /> Sign Up</>}
        </button>
      </form>
      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">Already have an account? </span>
        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500">
          Sign In
        </Link>
      </div>
    </div>
  );
}
