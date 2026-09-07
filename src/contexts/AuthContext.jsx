import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [store, setStore] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (userId) => {
    if (!userId) {
      setProfile(null);
      setStore(null);
      setMembership(null);
      return;
    }

    try {
      /*
       * 1. Load profile
       */
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        console.error("Failed to load profile:", profileError);
        setProfile(null);
      } else {
        setProfile(profileData);
      }

      /*
       * 2. Load active store membership
       */
      const { data: membershipData, error: membershipError } = await supabase
        .from("store_members")
        .select(
          `
          id,
          store_id,
          user_id,
          role,
          status,
          created_at,
          updated_at,
          invited_at,
          joined_at
        `,
        )
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", {
          ascending: true,
        })
        .limit(1)
        .maybeSingle();

      if (membershipError) {
        console.error("Failed to load store membership:", membershipError);

        setMembership(null);
        setStore(null);
      } else if (membershipData) {
        setMembership(membershipData);

        /*
         * 3. Load store using membership.store_id
         */
        const { data: storeData, error: storeError } = await supabase
          .from("stores")
          .select("*")
          .eq("id", membershipData.store_id)
          .maybeSingle();

        if (storeError) {
          console.error("Failed to load store:", storeError);
          setStore(null);
        } else {
          setStore(storeData);
        }
      } else {
        setMembership(null);
        setStore(null);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);

      setProfile(null);
      setMembership(null);
      setStore(null);
    }
  };

  /*
   * Keep the old function name so existing components
   * that already call refreshProfile() don't break.
   */
  const refreshProfile = async () => {
    if (user?.id) {
      await loadUserData(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await loadUserData(currentSession.user.id);
        } else {
          setProfile(null);
          setMembership(null);
          setStore(null);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await loadUserData(newSession.user.id);
      } else {
        setProfile(null);
        setMembership(null);
        setStore(null);
      }

      /*
       * Remove Supabase auth tokens from the URL
       * after invite/password recovery/sign-in.
       */
      if (
        (event === "USER_UPDATED" || event === "SIGNED_IN") &&
        window.location.hash.includes("access_token")
      ) {
        window.history.replaceState(
          null,
          document.title,
          window.location.pathname + window.location.search,
        );
      }

      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  };

  /*
   * Current store role comes from store_members,
   * NOT profiles.role.
   */
  const role = membership?.role ?? null;

  const isStaff = ["owner", "admin", "manager", "editor", "support"].includes(
    role,
  );

  const isOwner = role === "owner";

  const isAdmin = ["owner", "admin"].includes(role);

  const value = {
    session,
    user,
    profile,

    store,

    membership,

    storeId: membership?.store_id ?? store?.id ?? null,

    role,

    loading,

    isAuthenticated: !!user,

    isStaff,

    isOwner,

    isAdmin,

    signOut,

    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
