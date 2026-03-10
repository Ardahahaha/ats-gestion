import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "admin" | "technicien";

type AuthContextType = {
  role: UserRole | null;
  login: (role: UserRole, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PASSWORDS: Record<UserRole, string> = {
  admin: "MoteurPneu33!",
  technicien: "RS3sport33!",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(() => {
    const saved = sessionStorage.getItem("ats_role");
    return saved === "admin" || saved === "technicien" ? saved : null;
  });

  useEffect(() => {
    if (role) sessionStorage.setItem("ats_role", role);
    else sessionStorage.removeItem("ats_role");
  }, [role]);

  const login = (r: UserRole, password: string): boolean => {
    if (PASSWORDS[r] === password) {
      setRole(r);
      return true;
    }
    return false;
  };

  const logout = () => setRole(null);

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
