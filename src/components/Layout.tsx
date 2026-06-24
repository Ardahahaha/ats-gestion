import { useState, useEffect } from "react";
import { Moon, Sun, Car, Gauge, LogOut, Shield, Wrench, Settings, CarFront } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import ChatWidget from "@/components/ChatWidget";

export function Layout({ children }: {children: React.ReactNode;}) {
  const { role, pseudo, logout } = useAuth();
  const { t } = useI18n();
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" ||
      !localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // Apply color theme class
  useEffect(() => {
    const colorTheme = localStorage.getItem("color-theme") || "red";
    const root = document.documentElement;
    root.classList.remove("theme-blue", "theme-green", "theme-orange");
    if (colorTheme !== "red") {
      root.classList.add(`theme-${colorTheme}`);
    }
  }, []);

  // Listen for color-theme changes from Compte
  useEffect(() => {
    const handler = () => {
      const colorTheme = localStorage.getItem("color-theme") || "red";
      const root = document.documentElement;
      root.classList.remove("theme-blue", "theme-green", "theme-orange");
      if (colorTheme !== "red") {
        root.classList.add(`theme-${colorTheme}`);
      }
    };
    window.addEventListener("color-theme-changed", handler);
    return () => window.removeEventListener("color-theme-changed", handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background carbon-pattern transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/70 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60">
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-racing-stripe" />

        <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3 sm:gap-4">
            {!isHome &&
            <Link
              to="/"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:text-primary hover:shadow-glow-primary"
              title={t("layout.back")}>

                <ArrowLeft className="h-5 w-5" />
              </Link>
            }
            <Link to="/" className="group flex items-center gap-3 sm:gap-4">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-glow-primary transition-transform duration-300 group-hover:scale-105">
                <CarFront className="h-6 w-6 text-primary-foreground" />
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
              </div>
              <div>
                <h1 className="font-display text-xl uppercase tracking-tight text-foreground sm:text-2xl">
                  A.T.S<span className="mx-1 text-muted-foreground/40">/</span><span className="text-gradient-primary">GESTION</span>
                </h1>
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <Gauge className="h-3 w-3" />
                  {t("layout.dashboard")}
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Role badge as link to account */}
            <Link to="/compte" className={`hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80 ${
            role === "admin" ? "bg-primary/10 text-primary" : "bg-blue-500/10 text-blue-500"}`
            } title={t("layout.myAccount")}>
              {role === "admin" ? <Shield className="h-3 w-3" /> : <Wrench className="h-3 w-3" />}
              {pseudo || (role === "admin" ? "Admin" : "Technicien")}
            </Link>

            <Link
              to="/compte"
              className="rounded-full border border-border bg-secondary p-3 text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:text-primary hover:shadow-lg"
              title={t("layout.myAccount")}>
              
              <Settings className="h-5 w-5" />
            </Link>

            <button
              onClick={() => setDark((d) => !d)}
              className="group relative rounded-full border border-border bg-secondary p-3 text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:text-foreground hover:shadow-lg hover:shadow-primary/10"
              title={dark ? t("layout.lightMode") : t("layout.darkMode")}>
              
              <div className="transition-transform duration-300 group-hover:rotate-12">
                {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </div>
            </button>

            <button
              onClick={logout}
              className="rounded-full border border-border bg-secondary p-3 text-muted-foreground transition-all duration-300 hover:border-destructive/50 hover:text-destructive hover:shadow-lg"
              title={t("layout.logout")}>
              
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
          <span>{t("layout.synced")}</span>
        </div>
      </footer>
      <ChatWidget />
    </div>);

}