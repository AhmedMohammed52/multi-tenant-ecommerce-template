import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

import PageHeader from "../../components/admin/PageHeader";
import { Button } from "../../components/admin/Button";
import { UserPlus, Save, Loader2 } from "lucide-react";

import AdminUsersTable from "../../components/admin/users/AdminUsersTable";
import RolesPermissions from "../../components/admin/users/RolesPermissions";
import InviteUserModal from "../../components/admin/users/InviteUserModal";

import {
  inviteAdminUser,
  updateAdminUserRole,
} from "../../services/adminUsers";

export default function UsersPage() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [pendingRoleChanges, setPendingRoleChanges] = useState({});

  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: inviteAdminUser,
    onSuccess: async () => {
      toast.success("Invitation sent successfully.");
      setIsInviteModalOpen(false);
      await queryClient.invalidateQueries({
        queryKey: ["admin-users"],
      });
    },
    onError: (error) => {
      console.error("Invite user error:", error);
      toast.error(error?.message || "Failed to invite user.");
    },
  });

  const saveRolesMutation = useMutation({
    mutationFn: async (changes) => {
      const promises = Object.entries(changes).map(([userId, role]) =>
        updateAdminUserRole(userId, role),
      );
      return Promise.all(promises);
    },
    onSuccess: async () => {
      toast.success("User roles updated successfully.");
      setPendingRoleChanges({});
      await queryClient.invalidateQueries({
        queryKey: ["admin-users"],
      });
    },
    onError: (error) => {
      console.error("Save roles error:", error);
      toast.error(error?.message || "Failed to save user roles.");
    },
  });

  const handleInviteUser = (formData) => {
    inviteMutation.mutate(formData);
  };

  const handleSaveAllChanges = () => {
    if (Object.keys(pendingRoleChanges).length === 0) return;
    saveRolesMutation.mutate(pendingRoleChanges);
  };

  const hasChanges = Object.keys(pendingRoleChanges).length > 0;

  return (
    <>
      <PageHeader
        title="Admin Users"
        subtitle="Team members with access to this admin console."
      >
        <Button
          variant="outline"
          onClick={handleSaveAllChanges}
          disabled={!hasChanges || saveRolesMutation.isPending}
        >
          {saveRolesMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save changes
        </Button>

        <Button
          onClick={() => setIsInviteModalOpen(true)}
          disabled={inviteMutation.isPending}
        >
          <UserPlus className="size-4" />
          Invite user
        </Button>
      </PageHeader>

      <AdminUsersTable
        pendingRoleChanges={pendingRoleChanges}
        setPendingRoleChanges={setPendingRoleChanges}
      />

      <RolesPermissions />

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => {
          if (!inviteMutation.isPending) {
            setIsInviteModalOpen(false);
          }
        }}
        onSubmit={handleInviteUser}
        isSubmitting={inviteMutation.isPending}
      />
    </>
  );
}
