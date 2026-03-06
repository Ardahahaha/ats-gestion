import { useState, useEffect } from "react";
import { VehicleTable } from "@/components/VehicleTable";
import { Moon, Sun, Car, Gauge } from "lucide-react";

const Index = () => {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="min-h-screen bg-background carbon-pattern transition-colors duration-300">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-border bg-card/80 backdrop-blur-sm">
        {/* Decorative red accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
        
        <div className="container mx-auto flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
              <Car className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
              A.T.S/<span className="text-primary">GESTION DES VÉHICULES</span>
              </h1>
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                <Gauge className="h-3 w-3" />
                Tableau de bord collaboratif
              </p>
            </div>
          </div>

          <button
            onClick={() => setDark((d) => !d)}
            className="group relative rounded-full border border-border bg-secondary p-3 text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:text-foreground hover:shadow-lg hover:shadow-primary/10"
            title={dark ? "Mode jour" : "Mode nuit"}
          >
            <div className="transition-transform duration-300 group-hover:rotate-12">
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </div>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <VehicleTable />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-center gap-2 px-6 py-4 text-xs text-muted-foreground">
          <Car className="h-3 w-3" />
          <span className="font-display uppercase tracking-widest">AutoGestion</span>
          <span>•</span>
          <span>Synchronisé en temps réel</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
