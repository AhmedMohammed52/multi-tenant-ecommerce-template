// @ts-nocheck
/// <reference lib="deno.ns" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";

const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
  Deno.env.get("SUPABASE_SECRET_KEY") ??
  "";

const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const APP_URL = Deno.env.get("APP_URL") ?? "";

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const jsonResponse = (body: Record<string, unknown>, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return jsonResponse({ message: "Method not allowed." }, 405);
  }

  try {
    // --------------------------------------------------
    // 1. Authenticate request
    // --------------------------------------------------

    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return jsonResponse({ message: "Unauthorized." }, 401);
    }

    const token = authHeader.replace("Bearer ", "").trim();

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const {
      data: { user: currentUser },
      error: currentUserError,
    } = await userClient.auth.getUser();

    if (currentUserError || !currentUser) {
      return jsonResponse({ message: "Unauthorized." }, 401);
    }

    // --------------------------------------------------
    // 2. Parse request body
    // --------------------------------------------------

    const body = await req.json();

    const storeId = String(body?.storeId ?? "").trim();

    const fullName = String(body?.fullName ?? "").trim();

    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();

    const role = String(body?.role ?? "")
      .trim()
      .toLowerCase();

    if (body?.action !== "invite" || !storeId || !fullName || !email || !role) {
      return jsonResponse(
        {
          message: "storeId, fullName, email, and role are required.",
        },
        400,
      );
    }

    // --------------------------------------------------
    // 3. Validate email
    // --------------------------------------------------

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return jsonResponse(
        {
          message: "Please enter a valid email address.",
        },
        400,
      );
    }

    // --------------------------------------------------
    // 4. Verify current user's membership
    // --------------------------------------------------

    const { data: membership, error: membershipError } = await adminClient
      .from("store_members")
      .select("id, store_id, user_id, role, status")
      .eq("user_id", currentUser.id)
      .eq("store_id", storeId)
      .eq("status", "active")
      .maybeSingle();

    if (membershipError || !membership) {
      return jsonResponse(
        {
          message: "You are not an active member of this store.",
        },
        403,
      );
    }

    // --------------------------------------------------
    // 5. Validate role
    // --------------------------------------------------

    const validRoles = ["owner", "admin", "manager", "editor", "support"];

    if (!validRoles.includes(role)) {
      return jsonResponse(
        {
          message: "Invalid role specified.",
        },
        400,
      );
    }

    // --------------------------------------------------
    // 6. Check whether store already has an owner
    // --------------------------------------------------

    const { data: existingOwner, error: ownerCheckError } = await adminClient
      .from("store_members")
      .select("id")
      .eq("store_id", storeId)
      .eq("role", "owner")
      .maybeSingle();

    if (ownerCheckError) {
      throw ownerCheckError;
    }

    const hasOwner = Boolean(existingOwner);

    // --------------------------------------------------
    // 7. Role hierarchy
    // --------------------------------------------------

    // If an owner already exists:
    // only the owner can invite Owner/Admin.
    if (
      hasOwner &&
      membership.role !== "owner" &&
      (role === "owner" || role === "admin")
    ) {
      return jsonResponse(
        {
          message: "Only the store owner can invite Owner or Admin roles.",
        },
        403,
      );
    }

    // If there is no owner:
    // only an existing Admin/Owner can bootstrap the first owner.
    if (
      !hasOwner &&
      role === "owner" &&
      membership.role !== "admin" &&
      membership.role !== "owner"
    ) {
      return jsonResponse(
        {
          message: "Only an Admin can create the first Owner.",
        },
        403,
      );
    }

    // --------------------------------------------------
    // 8. Find existing Auth user by email
    // --------------------------------------------------

    let targetUserId: string | null = null;

    const { data: usersData, error: usersError } =
      await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (usersError) {
      throw usersError;
    }

    const existingAuthUser = usersData?.users?.find(
      (user) => String(user.email || "").toLowerCase() === email,
    );

    if (existingAuthUser) {
      targetUserId = existingAuthUser.id;
    }

    // --------------------------------------------------
    // 9. Check duplicate membership
    // --------------------------------------------------

    if (targetUserId) {
      const { data: alreadyMember, error: alreadyMemberError } =
        await adminClient
          .from("store_members")
          .select("id")
          .eq("store_id", storeId)
          .eq("user_id", targetUserId)
          .maybeSingle();

      if (alreadyMemberError) {
        throw alreadyMemberError;
      }

      if (alreadyMember) {
        return jsonResponse(
          {
            message: "This user is already a member of this store.",
          },
          409,
        );
      }
    }

    // --------------------------------------------------
    // 10. Invite new Auth user
    // --------------------------------------------------

    let invitationSent = false;
    let createdNewAuthUser = false;

    if (!targetUserId) {
      if (!APP_URL) {
        return jsonResponse(
          {
            message: "APP_URL missing.",
          },
          500,
        );
      }

      const { data, error: inviteError } =
        await adminClient.auth.admin.inviteUserByEmail(email, {
          data: {
            full_name: fullName,
          },
          redirectTo: `${APP_URL}/auth/accept-invite`,
        });

      if (inviteError) {
        throw inviteError;
      }

      targetUserId = data.user.id;

      invitationSent = true;
      createdNewAuthUser = true;
    }

    // --------------------------------------------------
    // 11. Insert store membership
    // --------------------------------------------------

    const { error: membershipInsertError } = await adminClient
      .from("store_members")
      .insert({
        store_id: storeId,
        user_id: targetUserId,
        role,
        status: invitationSent ? "invited" : "active",
        invited_by: currentUser.id,
        invited_at: new Date().toISOString(),
        joined_at: invitationSent ? null : new Date().toISOString(),
      });

    if (membershipInsertError) {
      // Roll back newly created Auth user
      if (createdNewAuthUser && targetUserId) {
        await adminClient.auth.admin.deleteUser(targetUserId);
      }

      throw membershipInsertError;
    }

    // --------------------------------------------------
    // 12. Sync profile name
    // --------------------------------------------------

    await adminClient.from("profiles").upsert(
      {
        id: targetUserId,
        full_name: fullName,
      },
      {
        onConflict: "id",
      },
    );

    // --------------------------------------------------
    // 13. Success
    // --------------------------------------------------

    return jsonResponse({
      success: true,
      invitationSent,
      userId: targetUserId,
      memberRole: role,
      storeId,
      message: invitationSent
        ? "Invitation sent successfully."
        : "User added to the store successfully.",
    });
  } catch (error) {
    console.error("Invite User Function Error:", error);

    return jsonResponse(
      {
        success: false,
        message: error?.message || "Internal server error.",
      },
      500,
    );
  }
});
