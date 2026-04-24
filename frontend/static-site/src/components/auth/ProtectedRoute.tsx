import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type Props = {
  children: React.ReactNode;
  roles?: string[];
};

// For static site demo - allow access without authentication
const DEMO_MODE = true;

const ProtectedRoute = ({ children, roles }: Props) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // In demo mode, allow access to all dashboards without authentication
  if (DEMO_MODE) {
    return <>{children}</>;
  }

  // Original authentication logic (for production)
  if (isLoading) {
    return <div className="min-h-screen bg-muted flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user?.role && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
