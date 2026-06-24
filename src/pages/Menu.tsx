import { Link } from "react-router-dom";
import { BookA, Brush, Car, ChevronRight, Wrench, Gauge, Zap } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";

const Menu = () => {
  const { t } = useI18n();
  const { pseudo } = useAuth();

  const SECTIONS = [
    {
      titleKey: "menu.services",
      descKey: "menu.servicesDesc",
      icon: Wrench,
      path: "/gestion-services",
      accent: "from-amber-400 via-orange-500 to-red-500",
      glow: "amber-500",
      number: "01",
    },
    {
      titleKey: "menu.insurance",
      descKey: "menu.insuranceDesc",
      icon: BookA,
      path: "/vehicules",
      accent: "from-rose-400 via-red-500 to-primary",
      glow: "red-500",
      number: "02",
    },
    {
      titleKey: "menu.vehicles",
      descKey: "menu.vehiclesDesc",
      icon: Car,
      path: "/gestion-vehicules",
      accent: "from-indigo-500 via-violet-500 to-blue-600",
      glow: "violet-500",
      number: "03",
    },
    {
      titleKey: "menu.create",
      descKey: "menu.createDesc",
      icon: Brush,
      path: "/atelier",
      accent: "from-lime-400 via-emerald-500 to-teal-500",
      glow: "emerald-500",
      number: "04",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <div className="absolute inset-0 bg-hero opacity-95" />
        <div className="absolute inset-0 racing-stripes opacity-50" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-racing-stripe" />

        <div className="relative flex flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-10">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-glow-primary">
              <Zap className="h-7 w-7 text-primary-foreground" />
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
                <Gauge className="h-3 w-3" /> Cockpit
              </p>
              <h2 className="mt-1 font-display text-3xl uppercase tracking-tight text-white sm:text-4xl">
                {t("menu.title")}
              </h2>
              <p className="mt-1 text-sm text-white/60">
                {pseudo ? `${t("menu.subtitle")} — ${pseudo}` : t("menu.subtitle")}
              </p>
            </div>
          </div>
          <div className="hidden h-16 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent sm:block" />
          <div className="hidden sm:block">
            <p className="font-display text-5xl text-white/90">{SECTIONS.length}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">Modules actifs</p>
          </div>
        </div>
      </div>

      {/* Modules grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.titleKey} to={section.path} className="group">
              <div className="relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:shadow-automotive">
                {/* Accent corner glow */}
                <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${section.accent} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30`} />

                {/* Top racing stripe */}
                <div className={`absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r ${section.accent} opacity-70 transition-opacity group-hover:opacity-100`} />

                <div className="relative flex flex-col gap-5">
                  <div className="flex items-start justify-between">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${section.accent} shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                      <Icon className="h-6 w-6 text-white drop-shadow" />
                    </div>
                    <span className="font-display text-2xl text-muted-foreground/30 transition-colors group-hover:text-primary/40">
                      {section.number}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-lg uppercase tracking-tight text-foreground">
                      {t(section.titleKey)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t(section.descKey)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-primary">
                    Ouvrir
                    <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Menu;
