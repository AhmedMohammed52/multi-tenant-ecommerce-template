import { useState } from "react";
import { KeyRound, Shield, Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import Switch from "../Switch";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "sonner";

export default function SecurityTab() {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const [twoFactor, setTwoFactor] = useState({
    authenticator: false,
    smsBackup: false,
  });

  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  const isMatching =
    newPassword === confirmPassword && confirmPassword.length > 0;

  const isValid =
    currentPassword.trim().length > 0 && hasMinLength && isMatching;

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (!isValid) return;

    try {
      setLoading(true);

      // 1. التحقق من كلمة المرور الحالية
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email,
        password: currentPassword,
      });

      if (signInError) {
        toast.error("Current password is incorrect.");
        setLoading(false);
        return;
      }

      // 2. تحديث كلمة المرور في Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      toast.success("Password updated successfully!");

      // 3. تفريغ المدخلات
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Password update error:", error);
      toast.error(error?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticatorToggle = async (checked) => {
    if (checked) {
      // هنا مستقبلاً يتم فتح Modal الـ QR Code لربط التطبيق
      toast.info(
        "Authenticator App setup requires scanning a QR Code (Coming soon).",
      );
    } else {
      setTwoFactor((prev) => ({ ...prev, authenticator: false }));
      toast.success("Authenticator App disabled.");
    }
  };

  const handleSmsToggle = (checked) => {
    if (checked) {
      toast.info("SMS authentication service requires phone verification.");
    }
    setTwoFactor((prev) => ({ ...prev, smsBackup: checked }));
  };

  return (
    <div className="mt-4 grid gap-4 xl:grid-cols-2" dir="ltr">
      {/* Password Section */}
      <section className="panel p-5 border rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="mb-4">
          <h2 className="text-sm font-semibold">Password</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Ensure your account is using a long and random password to stay
            secure.
          </p>
        </div>

        <form onSubmit={handlePasswordUpdate} className="grid gap-4">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="pw-old">
              Current password
            </label>
            <div className="relative">
              <input
                id="pw-old"
                type={showCurrent ? "text" : "password"}
                placeholder="••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-10 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showCurrent ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="pw-new">
              New password
            </label>
            <div className="relative">
              <input
                id="pw-new"
                type={showNew ? "text" : "password"}
                placeholder="••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-10 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNew ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>

            {/* Password Requirements Guidance (قائمة الإرشادات) */}
            {newPassword.length > 0 && (
              <div className="mt-2 space-y-1 text-xs">
                <div
                  className={`flex items-center gap-1.5 ${hasMinLength ? "text-green-600" : "text-muted-foreground"}`}
                >
                  {hasMinLength ? (
                    <Check className="size-3" />
                  ) : (
                    <X className="size-3 text-red-500" />
                  )}
                  At least 8 characters
                </div>
                <div
                  className={`flex items-center gap-1.5 ${hasNumber ? "text-green-600" : "text-muted-foreground"}`}
                >
                  {hasNumber ? (
                    <Check className="size-3" />
                  ) : (
                    <X className="size-3 text-red-500" />
                  )}
                  Contains a number (0-9)
                </div>
                <div
                  className={`flex items-center gap-1.5 ${hasSpecialChar ? "text-green-600" : "text-muted-foreground"}`}
                >
                  {hasSpecialChar ? (
                    <Check className="size-3" />
                  ) : (
                    <X className="size-3 text-red-500" />
                  )}
                  Contains a special character (!@#$)
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="pw-conf">
              Confirm new password
            </label>
            <div className="relative">
              <input
                id="pw-conf"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-10 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirm ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>

            {/* Error Message for non-matching passwords */}
            {confirmPassword.length > 0 && !isMatching && (
              <p className="text-xs text-red-500 font-medium mt-1">
                Passwords do not match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid || loading}
            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 justify-self-start transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Updating...
              </>
            ) : (
              <>
                <KeyRound className="size-4" /> Update password
              </>
            )}
          </button>
        </form>
      </section>

      {/* Two-Factor Authentication Section */}
      <section className="panel p-5 border rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="mb-4">
          <h2 className="text-sm font-semibold">Two-factor authentication</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Add an extra layer of security to your account
          </p>
        </div>

        <div className="space-y-3">
          {/* Authenticator App */}
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div className="space-y-0.5">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Shield className="size-4 text-primary" /> Authenticator app
              </span>
              <p className="text-xs text-muted-foreground">
                Use an app like Google Authenticator or Authy
              </p>
            </div>
            <Switch
              checked={twoFactor.authenticator}
              onCheckedChange={handleAuthenticatorToggle}
            />
          </div>

          {/* SMS Backup */}
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div className="space-y-0.5">
              <span className="text-sm font-medium">SMS backup codes</span>
              <p className="text-xs text-muted-foreground">
                Receive security codes via mobile phone
              </p>
            </div>
            <Switch
              checked={twoFactor.smsBackup}
              onCheckedChange={handleSmsToggle}
            />
          </div>

          {/* Active Sessions Info */}
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Active sessions: 1 device · Cairo, Egypt</span>
            <span className="inline-flex items-center gap-1 text-green-600 font-medium">
              <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>{" "}
              Current session
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
