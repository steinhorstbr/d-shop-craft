import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: "super_admin" | "store_admin" }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (requiredRole && role !== requiredRole) {
    if (role === "super_admin") return <Navigate to="/super-admin" replace />;
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
