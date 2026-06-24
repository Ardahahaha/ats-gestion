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
      accent: "hsl(28 95% 55%)",
      number: "01",
      tag: "SRV",
    },
    {
      titleKey: "menu.insurance",
      descKey: "menu.insuranceDesc",
      icon: BookA,
      path: "/vehicules",
      accent: "hsl(0 85% 55%)",
      number: "02",
      tag: "INS",
    },
    {
      titleKey: "menu.vehicles",
      descKey: "menu.vehiclesDesc",
      icon: Car,
      path: "/gestion-vehicules",
      accent: "hsl(220 90% 60%)",
      number: "03",
      tag: "VHC",
    },
    {
      titleKey: "menu.create",
      descKey: "menu.createDesc",
      icon: Brush,
      path: "/atelier",
      accent: "hsl(160 75% 45%)",
      number: "04",
      tag: "ATL",
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
                <div
                  className="absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
                  style={{ backgroundColor: section.accent }}
                />

                {/* Top racing stripe */}
                <div
                  className="absolute left-0 right-0 top-0 h-[2px] opacity-80 transition-opacity group-hover:opacity-100"
                  style={{ backgroundColor: section.accent }}
                />

                <div className="relative flex flex-col gap-5">
                  <div className="flex items-start justify-between">
                    {/* Mechanical badge: octagon plate with carbon grain + accent edge */}
                    <div className="relative">
                      <div
                        className="absolute -inset-[2px] opacity-90 transition-opacity group-hover:opacity-100"
                        style={{
                          clipPath:
                            "polygon(22% 0, 78% 0, 100% 22%, 100% 78%, 78% 100%, 22% 100%, 0 78%, 0 22%)",
                          backgroundColor: section.accent,
                        }}
                      />
                      <div
                        className="relative flex h-14 w-14 items-center justify-center transition-transform duration-500 group-hover:scale-[1.06]"
                        style={{
                          clipPath:
                            "polygon(22% 0, 78% 0, 100% 22%, 100% 78%, 78% 100%, 22% 100%, 0 78%, 0 22%)",
                          backgroundColor: "hsl(220 25% 10%)",
                          backgroundImage:
                            "repeating-linear-gradient(45deg, hsl(0 0% 100% / 0.04) 0 2px, transparent 2px 4px), repeating-linear-gradient(-45deg, hsl(0 0% 100% / 0.03) 0 2px, transparent 2px 4px)",
                        }}
                      >
                        <Icon
                          className="h-6 w-6"
                          strokeWidth={1.75}
                          style={{ color: section.accent }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className="rounded-sm border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em]"
                        style={{ borderColor: section.accent, color: section.accent }}
                      >
                        {section.tag}
                      </span>
                      <span className="font-display text-2xl leading-none text-muted-foreground/25 transition-colors group-hover:text-foreground/40">
                        {section.number}
                      </span>
                    </div>
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
