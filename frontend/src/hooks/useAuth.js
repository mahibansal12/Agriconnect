// src/hooks/useAuth.js
import { useSelector } from "react-redux";
 
export default function useAuth() {
  const { user, token, loading } = useSelector((s) => s.auth);
 
  return {
    user,
    token,
    loading,
    isLoggedIn:  !!token && !!user,
    isFarmer:    user?.role === "farmer",
    isBuyer:     user?.role === "buyer",
    isAdmin:     user?.role === "admin",
    role:        user?.role || null,
    name:        user?.name || "",
    email:       user?.email || "",
  };
}