// src/context/AuthContext.jsx
// Provides auth state via React Context so any component
// can call useContext(AuthContext) without using Redux directly.
// useAuth.js is the cleaner hook — use that in most components.
// AuthContext is here for components that can't use hooks directly.
 
import { createContext, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/slices/authSlice";
 
export const AuthContext = createContext(null);
 
export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { user, token, loading } = useSelector((s) => s.auth);
 
  const logout = () => dispatch(logoutUser());
 
  const value = {
    user,
    token,
    loading,
    isLoggedIn: !!token && !!user,
    isFarmer:   user?.role === "farmer",
    isBuyer:    user?.role === "buyer",
    isAdmin:    user?.role === "admin",
    role:       user?.role || null,
    logout,
  };
 
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
 
// Convenience hook — use this instead of useContext(AuthContext)
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside <AuthProvider>");
  return ctx;
}