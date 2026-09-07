import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, Check, Trash2 } from "lucide-react";

import ConfirmDeleteModal from "../ConfirmDeleteModal";
import { getAdminUsers, removeAdminUser } from "../../../services/adminUsers";

const availableRoles = ["Owner", "Admin", "Manager", "Editor", "Support"];

export default function AdminUsersTable({
  pendingRoleChanges,
  setPendingRoleChanges,
}) {
  const queryClient = useQueryClient();
  const [activeUserRoleDropdownId, setActiveUserRoleDropdownId] =
    useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState(null);

  const buttonRefs = useRef({});
  const dropdownMenuRef = useRef(null);

  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAdminUsers,
    staleTime: 30_000,
  });

  const removeUserMutation = useMutation({
    mutationFn: removeAdminUser,
    onSuccess: async () => {
      setDeletingUser(null);
      toast.success("User removed successfully.");
      await queryClient.invalidateQueries({
        queryKey: ["admin-users"],
      });
    },
    onError: (error) => {
      console.error("Remove user error:", error);
      toast.error(error?.message || "Failed to remove user.");
    },
  });

  const handleToggleDropdown = (userId) => {
    if (activeUserRoleDropdownId === userId) {
      setActiveUserRoleDropdownId(null);
      return;
    }

    const buttonEl = buttonRefs.current[userId];
    if (!buttonEl) return;

    const rect = buttonEl.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownHeight = 200;
    const openUpward = spaceBelow < dropdownHeight;

    let leftPos = rect.left;
    if (leftPos + rect.width > window.innerWidth) {
      leftPos = window.innerWidth - rect.width - 12;
    }
    leftPos = Math.max(12, leftPos);

    setDropdownPosition({
      left: leftPos,
      top: openUpward ? rect.top - 4 : rect.bottom + 4,
      width: rect.width,
      openUpward,
    });

    setActiveUserRoleDropdownId(userId);
  };

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(event.target) &&
        !Object.values(buttonRefs.current).some((button) =>
          button?.contains(event.target),
        )
      ) {
        setActiveUserRoleDropdownId(null);
      }
    }

    function handleScrollOrResize() {
      setActiveUserRoleDropdownId(null);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [activeUserRoleDropdownId]);

  // إضافة أو تحديث التغيير في الحالات المحلية
  const handleRoleChange = (userId, newRole) => {
    const user = users.find((u) => u.id === userId);

    setPendingRoleChanges((prev) => {
      if (user && user.role === newRole) {
        const next = { ...prev };
        delete next[userId];
        return next;
      }
      return {
        ...prev,
        [userId]: newRole,
      };
    });

    setActiveUserRoleDropdownId(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    removeUserMutation.mutate(deletingUser.id);
  };

  const getStatusBadgeClass = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "active":
        return "bg-success-soft text-success border-success/25";
      case "invited":
        return "bg-warning-soft text-warning-foreground border-warning/35";
      case "suspended":
        return "bg-destructive-soft text-destructive border-destructive/25";
      default:
        return "bg-surface-muted text-muted-foreground border-border";
    }
  };

  const activeUserId =
    typeof activeUserRoleDropdownId === "string"
      ? activeUserRoleDropdownId.replace("mobile-", "")
      : activeUserRoleDropdownId;

  const activeUser = users.find(
    (user) => String(user.id) === String(activeUserId),
  );

  if (isLoading) {
    return (
      <div className="panel min-w-0 max-w-full overflow-hidden">
        <div className="p-6 text-center text-sm text-muted-foreground">
          Loading users...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="panel min-w-0 max-w-full overflow-hidden">
        <div className="p-6 text-center text-sm text-destructive">
          {error?.message || "Failed to load users."}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="panel min-w-0 max-w-full overflow-hidden">
        {/* MOBILE */}
        <ul className="divide-y divide-border md:hidden">
          {users.length > 0 ? (
            users.map((user) => {
              const currentRole = pendingRoleChanges[user.id] || user.role;
              const isChanged = Boolean(pendingRoleChanges[user.id]);

              return (
                <li key={user.id} className="space-y-3 p-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold">
                        {user.initials}
                      </span>
                      <div className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {user.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${getStatusBadgeClass(
                        user.status,
                      )}`}
                    >
                      <span className="size-1.5 rounded-full bg-current opacity-80" />
                      {user.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                    <button
                      type="button"
                      ref={(el) =>
                        (buttonRefs.current[`mobile-${user.id}`] = el)
                      }
                      aria-label={`Role for ${user.name}`}
                      onClick={() => handleToggleDropdown(`mobile-${user.id}`)}
                      className={`flex items-center justify-between whitespace-nowrap rounded-md border px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring h-9 w-full min-w-0 ${
                        isChanged
                          ? "border-primary bg-primary/5 font-medium"
                          : "border-input bg-transparent"
                      }`}
                    >
                      <span>{currentRole}</span>
                      <ChevronDown
                        className={`h-4 w-4 opacity-50 transition-transform duration-200 ${
                          activeUserRoleDropdownId === `mobile-${user.id}`
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingUser(user)}
                      disabled={
                        user.role === "Owner" || removeUserMutation.isPending
                      }
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed border border-input bg-background shadow-sm hover:bg-accent h-8 rounded-md px-3 text-xs shrink-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {user.lastActive}
                  </p>
                </li>
              );
            })
          ) : (
            <li className="p-4 text-center text-xs text-muted-foreground">
              No users found.
            </li>
          )}
        </ul>

        {/* DESKTOP */}
        <div className="hidden md:block">
          <div className="min-w-0 max-w-full overflow-hidden">
            <div className="w-full max-w-full overflow-x-auto">
              <table className="w-full min-w-160 border-collapse text-sm">
                <caption className="sr-only">Admin users</caption>
                <thead>
                  <tr className="border-b border-border bg-surface-muted/70">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      User
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Role
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">
                      Last active
                    </th>
                    <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {users.length > 0 ? (
                    users.map((user) => {
                      const currentRole =
                        pendingRoleChanges[user.id] || user.role;
                      const isChanged = Boolean(pendingRoleChanges[user.id]);

                      return (
                        <tr key={user.id} className="transition-colors">
                          <td className="px-4 py-3 align-middle">
                            <div className="flex items-center gap-3">
                              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold">
                                {user.initials}
                              </span>
                              <div className="min-w-0">
                                <span className="block truncate text-sm font-medium">
                                  {user.name}
                                </span>
                                <span className="block truncate text-xs text-muted-foreground">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 align-middle">
                            <button
                              type="button"
                              ref={(el) => (buttonRefs.current[user.id] = el)}
                              aria-label={`Role for ${user.name}`}
                              onClick={() => handleToggleDropdown(user.id)}
                              className={`flex items-center justify-between whitespace-nowrap rounded-md border px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring h-8 w-36 transition-colors ${
                                isChanged
                                  ? "border-primary bg-primary/5 font-medium"
                                  : "border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
                              }`}
                            >
                              <span>{currentRole}</span>
                              <ChevronDown
                                className={`h-4 w-4 opacity-50 transition-transform duration-200 ${
                                  activeUserRoleDropdownId === user.id
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </button>
                          </td>

                          <td className="px-4 py-3 align-middle">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${getStatusBadgeClass(
                                user.status,
                              )}`}
                            >
                              <span className="size-1.5 rounded-full bg-current opacity-80" />
                              {user.status}
                            </span>
                          </td>

                          <td className="px-4 py-3 align-middle hidden md:table-cell">
                            {user.lastActive}
                          </td>

                          <td className="px-4 py-3 align-middle text-right">
                            <button
                              type="button"
                              aria-label={`Remove ${user.name}`}
                              onClick={() => setDeletingUser(user)}
                              disabled={
                                user.role === "Owner" ||
                                removeUserMutation.isPending
                              }
                              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-destructive/10 hover:text-destructive h-9 w-9 disabled:pointer-events-none disabled:opacity-50"
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-8 text-center text-xs text-muted-foreground"
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {activeUserRoleDropdownId !== null &&
        dropdownPosition &&
        activeUser &&
        createPortal(
          <div
            ref={dropdownMenuRef}
            role="presentation"
            className="z-50 rounded-md border border-border bg-popover text-popover-foreground shadow-md p-1 max-h-48 overflow-y-auto animate-in fade-in-80 zoom-in-95"
            style={{
              position: "fixed",
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              transform: dropdownPosition.openUpward
                ? "translateY(-100%)"
                : "none",
            }}
          >
            {availableRoles.map((role) => {
              const currentRole =
                pendingRoleChanges[activeUser.id] || activeUser.role;
              const isSelected = currentRole === role;

              return (
                <div
                  key={role}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={0}
                  onClick={() => handleRoleChange(activeUser.id, role)}
                  className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  <span>{role}</span>
                  <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                    {isSelected && <Check className="h-4 w-4" />}
                  </span>
                </div>
              );
            })}
          </div>,
          document.body,
        )}

      <ConfirmDeleteModal
        isOpen={Boolean(deletingUser)}
        title={`Remove ${deletingUser?.name}?`}
        description="This user will lose access to the admin console immediately. You can invite them back later."
        onClose={() => {
          if (!removeUserMutation.isPending) {
            setDeletingUser(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
