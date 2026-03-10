import { jwtDecode } from "jwt-decode";

export interface AuthUser {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
}

export const getAuthUser = (): AuthUser | null => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  try {
    const decoded: any = jwtDecode(token);
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (err) {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/login";
};
