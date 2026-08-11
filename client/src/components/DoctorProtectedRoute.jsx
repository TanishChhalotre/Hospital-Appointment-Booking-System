import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DoctorProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/doctor-login" replace />;
  }

  if (user.role !== "doctor") {
    return <Navigate to="/home" replace />;
  }

  return children;
}
