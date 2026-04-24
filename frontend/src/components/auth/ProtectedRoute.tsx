import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type Props = {
  children: React.ReactNode;
  roles?: string[];
};

const ProtectedRoute = ({ children, roles }: Props) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen bg-muted flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user?.role && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

