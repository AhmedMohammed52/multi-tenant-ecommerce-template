import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function ProtectedAdminRoute() {
  const { loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        جاري التحقق...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">غير مصرح</h1>

          <p className="text-gray-500">
            ليس لديك صلاحية للوصول إلى لوحة التحكم.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
