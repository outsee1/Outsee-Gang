import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!data);
      } else {
        setIsAdmin(false);
        setUserId(null);
      }
      setLoading(false);
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!data);
      } else {
        setIsAdmin(false);
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setUserId(null);
  };

  return { isAdmin, loading, userId, logout };
}

// Simple sync check for components that just need a boolean
export function isAdminActive(): boolean {
  // This is kept for backward compat but components should migrate to useAdminAuth
  // We'll check if there's a supabase session with admin role synchronously via a cached value
  return _cachedAdminState;
}

let _cachedAdminState = false;

// Initialize cache
supabase.auth.onAuthStateChange(async (_event, session) => {
  if (session?.user) {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();
    _cachedAdminState = !!data;
  } else {
    _cachedAdminState = false;
  }
});

// Initial check
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();
    _cachedAdminState = !!data;
  }
})();
