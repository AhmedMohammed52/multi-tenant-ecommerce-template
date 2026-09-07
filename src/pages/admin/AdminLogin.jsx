import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "../../services/auth";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      navigate("/admin");
    } catch (err) {
      console.error(err);
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 sm:p-6 transition-colors duration-200">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8 space-y-8">
          {/* Header Section */}
          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight">
              Admin Portal
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your account details to access the dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-background border border-input text-foreground rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground/60"
                placeholder="admin@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-background border border-input text-foreground rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground/60"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 text-destructive border border-destructive/20 p-3.5 rounded-xl text-sm font-medium flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-xl font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
