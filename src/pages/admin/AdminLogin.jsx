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
    } catch (error) {
      console.error(error);

      setError(error.message || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Admin Login</h1>

          <p className="text-gray-500 mb-8">سجل الدخول لإدارة المتجر</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 font-medium">Email</label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Password</label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-bold disabled:opacity-50"
            >
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
