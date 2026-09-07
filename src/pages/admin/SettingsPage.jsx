import PageHeader from "../../components/admin/PageHeader";
import { Button } from "../../components/admin/Button";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import ProfileTab from "../../components/admin/settings/ProfileTab";
import NotificationsTab from "../../components/admin/settings/NotificationsTab";
import SecurityTab from "../../components/admin/settings/SecurityTab";

import { useAuth } from "../../contexts/AuthContext";

import {
  getUserProfile,
  updateUserProfile,
  updateUserEmail,
  getNotificationSettings,
  updateNotificationSettings,
  uploadAvatar,
} from "../../services/accountSettings";

const DEFAULT_PROFILE = {
  name: "",
  email: "",
  role: "",
  phone: "",
  avatarUrl: null,
};

const DEFAULT_NOTIFICATIONS = {
  newOrders: true,
  lowStock: true,
  reviews: true,
  payouts: false,
  weeklyDigest: true,
};

export default function SettingsPage() {
  const { user, refreshProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("Profile");
  const tabs = ["Profile", "Notifications", "Security"];

  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [savedProfile, setSavedProfile] = useState(DEFAULT_PROFILE);
  const [avatarFile, setAvatarFile] = useState(null);

  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [savedNotifications, setSavedNotifications] = useState(
    DEFAULT_NOTIFICATIONS,
  );

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: () => getUserProfile(user.id),
    enabled: !!user?.id,
  });

  const { data: notificationData, isLoading: notificationLoading } = useQuery({
    queryKey: ["user-notification-settings", user?.id],
    queryFn: () => getNotificationSettings(user.id),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!profileData) return;

    const newProfile = {
      name: profileData.full_name || "",
      email: user?.email || "",
      role: profileData.role === "admin" ? "Owner" : profileData.role || "",
      phone: profileData.phone || "",
      avatarUrl: profileData.avatar_url || null,
    };

    setProfile(newProfile);
    setSavedProfile(newProfile);
  }, [profileData, user?.email]);

  useEffect(() => {
    if (!notificationData) return;

    const newNotifications = {
      newOrders: Boolean(notificationData.new_orders),
      lowStock: Boolean(notificationData.low_stock),
      reviews: Boolean(notificationData.reviews),
      payouts: Boolean(notificationData.payouts),
      weeklyDigest: Boolean(notificationData.weekly_digest),
    };

    setNotifications(newNotifications);
    setSavedNotifications(newNotifications);
  }, [notificationData]);

  useEffect(() => {
    if (searchParams.get("email_confirmed") === "true") {
      toast.success("Email updated and verified successfully!");
      searchParams.delete("email_confirmed");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const getInitials = (name) => {
    if (!name || !name.trim()) return "U";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleAvatarChange = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2 MB.");
      return;
    }

    setAvatarFile(file);
    const imageUrl = URL.createObjectURL(file);
    handleProfileChange("avatarUrl", imageUrl);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    handleProfileChange("avatarUrl", null);
  };

  const profileChanged =
    JSON.stringify(profile) !== JSON.stringify(savedProfile) ||
    avatarFile !== null;

  const notificationsChanged =
    JSON.stringify(notifications) !== JSON.stringify(savedNotifications);

  const hasChanges = profileChanged || notificationsChanged;

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationChange = (field, value) => {
    setNotifications((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user?.id || !hasChanges || saving) {
      return;
    }

    try {
      setSaving(true);

      const currentEmail = user?.email || "";
      const isEmailChanged =
        profile.email.trim().toLowerCase() !==
        currentEmail.trim().toLowerCase();

      let finalAvatarUrl = profile.avatarUrl;

      if (profileChanged) {
        if (avatarFile) {
          finalAvatarUrl = await uploadAvatar(
            user.id,
            profileData?.store_id,
            avatarFile,
          );
        }

        await updateUserProfile(user.id, {
          fullName: profile.name,
          phone: profile.phone,
          avatarUrl: finalAvatarUrl,
        });

        setAvatarFile(null);
      }

      if (notificationsChanged) {
        await updateNotificationSettings(user.id, notifications);
      }

      let emailChangeInitiated = false;

      if (isEmailChanged) {
        try {
          await updateUserEmail(profile.email);
          emailChangeInitiated = true;
        } catch (emailError) {
          if (emailError?.message?.includes("rate limit")) {
            toast.error(
              "You have requested email changes too many times. Please wait a while before trying again.",
            );
          } else {
            toast.error(`Email update failed: ${emailError.message}`);
          }
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user-profile", user.id] }),
        queryClient.invalidateQueries({
          queryKey: ["user-notification-settings", user.id],
        }),
        refreshProfile(),
      ]);

      const updatedProfileState = {
        ...profile,
        avatarUrl: finalAvatarUrl,
      };

      setProfile(updatedProfileState);
      setSavedProfile(updatedProfileState);
      setSavedNotifications(notifications);

      if (emailChangeInitiated) {
        toast.info(
          `Confirmation link sent to ${profile.email}. Please verify it to complete updating your email.`,
          { duration: 6000 },
        );
      } else {
        toast.success("Settings saved successfully.");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error(error?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const loading = profileLoading || notificationLoading;

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Account, notifications and workspace preferences."
      >
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving || loading}
        >
          <Save className="size-4" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </PageHeader>

      <div dir="ltr">
        <div
          role="tablist"
          aria-orientation="horizontal"
          className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                data-state={isActive ? "active" : "inactive"}
                onClick={() => setActiveTab(tab)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
              >
                {tab}
              </button>
            );
          })}
        </div>

        {activeTab === "Profile" && (
          <ProfileTab
            profile={profile}
            onChange={handleProfileChange}
            initials={getInitials(profile.name)}
            onAvatarChange={handleAvatarChange}
            onAvatarRemove={handleRemoveAvatar}
          />
        )}

        {activeTab === "Notifications" && (
          <NotificationsTab
            notifications={notifications}
            onChange={handleNotificationChange}
          />
        )}

        {activeTab === "Security" && <SecurityTab />}
      </div>
    </>
  );
}
