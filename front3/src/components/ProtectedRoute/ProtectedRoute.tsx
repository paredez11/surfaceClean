// front3/src/components/ProtectedRoute/ProtectedRoute.tsx

import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import type { RootState } from "../../redux/store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const user = useSelector((state: RootState) => state.session.user);
  const loading = useSelector((state: RootState) => state.session.loading);

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;