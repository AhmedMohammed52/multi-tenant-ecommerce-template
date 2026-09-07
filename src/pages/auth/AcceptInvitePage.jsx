import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function AcceptInvitePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let mounted = true;

    const prepareInvitationSession = async () => {
      try {
        const url = new URL(window.location.href);

        // --------------------------------------------------
        // 1. Check if Supabase redirected with an auth error
        // --------------------------------------------------

        const hashParams = new URLSearchParams(
          window.location.hash.replace(/^#/, ""),
        );

        const errorCode =
          url.searchParams.get("error_code") || hashParams.get("error_code");

        const errorDescription =
          url.searchParams.get("error_description") ||
          hashParams.get("error_description");

        if (errorCode || errorDescription) {
          throw new Error(
            decodeURIComponent(
              errorDescription || errorCode || "Unable to verify invitation.",
            ).replace(/\+/g, " "),
          );
        }

        // --------------------------------------------------
        // 2. Check current Supabase session
        // --------------------------------------------------

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        // --------------------------------------------------
        // 3. Supabase should have created the invited user's
        //    session after /auth/v1/verify
        // --------------------------------------------------

        if (!session?.user) {
          throw new Error("This invitation link is invalid or has expired.");
        }

        console.log("INVITATION SESSION USER:", {
          id: session.user.id,
          email: session.user.email,
        });

        if (!mounted) return;

        setLoading(false);
      } catch (err) {
        console.error("Accept invitation session error:", err);

        if (!mounted) return;

        setError(err?.message || "Unable to verify the invitation.");

        setLoading(false);
      }
    };

    prepareInvitationSession();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSaving(true);

      // --------------------------------------------------
      // 1. Make sure we are using the invited user
      // --------------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Your invitation session is no longer valid.");
      }

      console.log("INVITED USER:", user.id, user.email);

      // --------------------------------------------------
      // 2. Set password for invited user
      // --------------------------------------------------

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      // --------------------------------------------------
      // 3. Activate store membership
      // --------------------------------------------------

      const { data: activationResult, error: activationError } =
        await supabase.rpc("accept_store_invite");

      if (activationError) {
        console.error("Accept store invite error:", activationError);

        throw new Error(
          activationError.message ||
            "Password was set, but the store invitation could not be activated.",
        );
      }

      console.log("INVITATION ACTIVATED:", activationResult);

      // --------------------------------------------------
      // 4. Success
      // --------------------------------------------------

      setSuccess(true);

      /*
       * Important:
       * Do NOT navigate directly to /admin while the
       * invited user is still using the temporary invite
       * session.
       *
       * We sign them out and let them login normally.
       */

      setTimeout(async () => {
        await supabase.auth.signOut();

        navigate("/admin/login", {
          replace: true,
        });
      }, 1200);
    } catch (err) {
      console.error("Failed to complete invitation:", err);

      setError(err?.message || "Failed to complete your invitation.");
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-sm text-gray-500">
          Verifying your invitation...
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error && !password && !confirmPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">
            Invitation unavailable
          </h1>

          <p className="mt-3 text-sm text-gray-500">{error}</p>

          <button
            type="button"
            onClick={() => navigate("/admin/login")}
            className="mt-6 w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Success
  // --------------------------------------------------

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            ✓
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-gray-900">
            Account setup complete
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Your account has been activated successfully. Redirecting you to
            login...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Password form
  // --------------------------------------------------

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Set your password
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Welcome to the team. Create a password to finish setting up your
            admin account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="new-password"
              disabled={saving}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Confirm password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              autoComplete="new-password"
              disabled={saving}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:opacity-60"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Setting password..." : "Complete setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
