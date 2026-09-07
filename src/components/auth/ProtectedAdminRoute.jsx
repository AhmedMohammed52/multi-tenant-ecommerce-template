import { Navigate, Outlet, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function ProtectedAdminRoute() {
  const { loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm font-medium animate-pulse">
            Verifying credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Access Denied</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              You do not have permission to access the administrative panel.
              Please contact the store owner if you believe this is an error.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center w-full px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-all shadow-sm"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
