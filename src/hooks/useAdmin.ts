import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const checkAdmin = useCallback(async (sessionUserId?: string | null, sessionEmail?: string | null) => {
    if (!sessionUserId) {
      _cachedAdminState = false;
      setIsAdmin(false);
      setUserId(null);
      setEmail(null);
      setLoading(false);
      return false;
    }

    setUserId(sessionUserId);
    setEmail(sessionEmail ?? null);
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: sessionUserId,
      _role: "admin",
    });
    const nextIsAdmin = !error && data === true;
    _cachedAdminState = nextIsAdmin;
    setIsAdmin(nextIsAdmin);
    setLoading(false);
    return nextIsAdmin;
  }, []);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await checkAdmin(session?.user?.id ?? null, session?.user?.email ?? null);
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await checkAdmin(session?.user?.id ?? null, session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, [checkAdmin]);

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setUserId(null);
    setEmail(null);
  };

  return { isAdmin, loading, userId, email, logout };
}

// Simple sync check for components that just need a boolean
export function isAdminActive(): boolean {
  return _cachedAdminState;
}

let _cachedAdminState = false;

// Initialize cache
supabase.auth.onAuthStateChange(async (_event, session) => {
  if (session?.user) {
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: session.user.id,
      _role: "admin",
    });
    _cachedAdminState = !error && data === true;
  } else {
    _cachedAdminState = false;
  }
});

// Initial check
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: session.user.id,
      _role: "admin",
    });
    _cachedAdminState = !error && data === true;
  }
})();
