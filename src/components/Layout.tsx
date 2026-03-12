import { useState, useEffect } from "react";
import { Moon, Sun, Car, Gauge, LogOut, Shield, Wrench, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const { role, pseudo, logout } = useAuth();
  const { t } = useI18n();
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="min-h-screen flex flex-col bg-background carbon-pattern transition-colors duration-300">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

        <div className="container mx-auto flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            {!isHome && (
              <Link
                to="/"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:text-primary hover:shadow-md"
                title={t("layout.back")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            )}
            <Link to="/" className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
                <Car className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
                  A.T.S/<span className="text-primary">GESTION</span>
                </h1>
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  <Gauge className="h-3 w-3" />
                  {t("layout.dashboard")}
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Role badge as link to account */}
            <Link to="/compte" className={`hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80 ${
              role === "admin" ? "bg-primary/10 text-primary" : "bg-blue-500/10 text-blue-500"
            }`} title="Mon compte">
              {role === "admin" ? <Shield className="h-3 w-3" /> : <Wrench className="h-3 w-3" />}
              {pseudo || (role === "admin" ? "Admin" : "Technicien")}
            </Link>

            <Link
              to="/compte"
              className="rounded-full border border-border bg-secondary p-3 text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:text-primary hover:shadow-lg"
              title="Mon compte"
            >
              <Settings className="h-5 w-5" />
            </Link>

            <button
              onClick={() => setDark((d) => !d)}
              className="group relative rounded-full border border-border bg-secondary p-3 text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:text-foreground hover:shadow-lg hover:shadow-primary/10"
              title={dark ? "Mode jour" : "Mode nuit"}
            >
              <div className="transition-transform duration-300 group-hover:rotate-12">
                {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </div>
            </button>

            <button
              onClick={logout}
              className="rounded-full border border-border bg-secondary p-3 text-muted-foreground transition-all duration-300 hover:border-destructive/50 hover:text-destructive hover:shadow-lg"
              title="Se déconnecter"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-center gap-2 px-6 py-4 text-xs text-muted-foreground">
          <Car className="h-3 w-3" />
          <span className="font-display uppercase tracking-widest">A.T.S</span>
          <span>•</span>
          <span>Synchronisé en temps réel</span>
        </div>
      </footer>
    </div>
  );
}
