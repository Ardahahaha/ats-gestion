import { Link } from "react-router-dom";
import { BookA, Brush, Car, ChevronRight, Wrench, Sparkles } from "lucide-react";
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
      accent: "primary",
      large: true,
    },
    {
      titleKey: "menu.vehicles",
      descKey: "menu.vehiclesDesc",
      icon: Car,
      path: "/gestion-vehicules",
      accent: "primary",
      large: true,
    },
    {
      titleKey: "menu.insurance",
      descKey: "menu.insuranceDesc",
      icon: BookA,
      path: "/vehicules",
      accent: "primary",
      large: false,
    },
    {
      titleKey: "menu.create",
      descKey: "menu.createDesc",
      icon: Brush,
      path: "/atelier",
      accent: "primary",
      large: false,
    },
  ];

  const largeItems = SECTIONS.filter((s) => s.large);
  const smallItems = SECTIONS.filter((s) => !s.large);

  return (
    <div className="space-y-10">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 md:p-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/8 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-widest">Dashboard</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            {t("menu.title")} <span className="text-primary">{pseudo || t("menu.titleHighlight")}</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            {t("menu.subtitle")}
          </p>
        </div>
      </div>

      {/* Main cards — 2 large */}
      <div className="grid gap-4 md:gap-5 grid-cols-1 md:grid-cols-2">
        {largeItems.map((section, i) => {
          const Icon = section.icon;
          return (
            <Link key={section.titleKey} to={section.path} className="group">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-7 md:p-8 transition-all duration-300 hover:border-primary/40 hover:shadow-automotive hover:scale-[1.01]">
                {/* Top accent bar */}
                <div className="absolute left-0 right-0 top-0 h-1 bg-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                
                {/* Glow effect on hover */}
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/0 group-hover:bg-primary/8 blur-2xl transition-all duration-500" />

                <div className="relative flex items-start gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 transition-all duration-300 group-hover:bg-primary group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/25">
                    <Icon className="h-8 w-8 text-primary transition-colors duration-300 group-hover:text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-xl md:text-2xl font-bold uppercase tracking-wide text-foreground group-hover:text-primary transition-colors duration-200">
                      {t(section.titleKey)}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                      {t(section.descKey)}
                    </p>
                  </div>
                  <div className="mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary transition-all duration-300 group-hover:bg-primary/10">
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Secondary cards — 2 small */}
      <div className="grid gap-4 md:gap-5 grid-cols-1 md:grid-cols-2">
        {smallItems.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.titleKey} to={section.path} className="group">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 md:p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-automotive hover:scale-[1.01]">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 transition-all duration-300 group-hover:bg-primary group-hover:border-primary group-hover:shadow-md group-hover:shadow-primary/20">
                    <Icon className="h-6 w-6 text-primary transition-colors duration-300 group-hover:text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg font-bold uppercase tracking-wide text-foreground group-hover:text-primary transition-colors duration-200">
                      {t(section.titleKey)}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t(section.descKey)}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
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
