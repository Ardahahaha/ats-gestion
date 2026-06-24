import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "technicien";

type AuthContextType = {
  role: UserRole | null;
  user: User | null;
  pseudo: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [pseudo, setPseudo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();
    return (data?.role as UserRole) ?? null;
  };

  const fetchPseudo = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("pseudo")
      .eq("user_id", userId)
      .single();
    return data?.pseudo ?? null;
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        // Use setTimeout to avoid potential deadlock with Supabase internals
        setTimeout(async () => {
          if (!mounted) return;
          const [r, p] = await Promise.all([fetchRole(session.user.id), fetchPseudo(session.user.id)]);
          setRole(r);
          setPseudo(p);
          setLoading(false);
        }, 0);
      } else {
        setUser(null);
        setRole(null);
        setPseudo(null);
        setLoading(false);
      }
    });

    // Also check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        const [r, p] = await Promise.all([fetchRole(session.user.id), fetchPseudo(session.user.id)]);
        setRole(r);
        setPseudo(p);
      }
      setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    // Safety timeout - never stay loading forever
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 5000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const signup = async (email: string, password: string, selectedRole: UserRole, rolePassword: string, pseudo: string) => {
    const res = await supabase.functions.invoke("signup-with-role", {
      body: { email, password, role: selectedRole, rolePassword, pseudo },
    });
    if (res.error) {
      return { success: false, error: res.error.message || "Erreur lors de la création du compte" };
    }
    if (res.data?.error) {
      return { success: false, error: res.data.error };
    }
    // Auto-login after signup
    const loginResult = await login(email, password);
    return loginResult;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setPseudo(null);
  };

  return (
    <AuthContext.Provider value={{ role, user, pseudo, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
