import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: "admin" | "partner" | "customer";
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // If logged in but wrong role, redirect to their respective dashboard
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "partner") return <Navigate to="/partner" replace />;
    if (user.role === "customer") return <Navigate to="/" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
