import { Link } from "react-router-dom";
import { BookA, Brush, Car, Wrench } from "lucide-react";
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
      number: "01",
      tag: "Atelier",
    },
    {
      titleKey: "menu.insurance",
      descKey: "menu.insuranceDesc",
      icon: BookA,
      path: "/vehicules",
      number: "02",
      tag: "Dossiers",
    },
    {
      titleKey: "menu.vehicles",
      descKey: "menu.vehiclesDesc",
      icon: Car,
      path: "/gestion-vehicules",
      number: "03",
      tag: "Flotte",
    },
    {
      titleKey: "menu.create",
      descKey: "menu.createDesc",
      icon: Brush,
      path: "/atelier",
      number: "04",
      tag: "Studio",
    },
  ];

  const now = new Date();
  const dateLabel = now.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative">
      {/* Giant editorial backdrop word */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -left-6 select-none font-display text-[7rem] font-bold italic leading-none tracking-tighter text-foreground/[0.04] sm:-top-16 sm:text-[12rem]"
      >
        APEX
      </div>

      <div className="relative flex flex-col gap-12">
        {/* Editorial Header */}
        <header className="relative flex flex-col gap-6 border-l-4 border-primary pl-6 sm:flex-row sm:items-end sm:justify-between sm:pl-8">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-primary">
              {t("menu.title")} · 44.02
            </p>
            <h1 className="font-display text-5xl font-bold uppercase italic leading-[0.95] tracking-tight text-foreground sm:text-7xl">
              Main <span className="text-muted-foreground/40">Hub</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {pseudo ? `${t("menu.subtitle")} — ${pseudo}` : t("menu.subtitle")}
            </p>
          </div>
          <div className="hidden border-t border-border pt-3 sm:block">
            <p className="font-display text-2xl font-bold italic tabular-nums text-foreground">
              {dateLabel}
            </p>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">
              Session active
            </p>
          </div>
        </header>

        {/* Editorial grid — hairline divider aesthetic */}
        <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.titleKey}
                to={section.path}
                className="group relative block overflow-hidden bg-card p-8 transition-colors duration-500 hover:bg-card/60 sm:p-10"
              >
                {/* Giant ghost number */}
                <span className="pointer-events-none absolute right-4 top-2 select-none font-display text-[7rem] font-bold leading-none text-foreground/[0.04] transition-colors duration-500 group-hover:text-primary/10 sm:text-[9rem]">
                  {section.number}
                </span>

                {/* Left racing stripe — grows on hover */}
                <span className="absolute left-0 top-0 h-0 w-[3px] bg-primary transition-all duration-500 group-hover:h-full" />

                <div className="relative flex h-full flex-col justify-between gap-12">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-primary" strokeWidth={2.5} />
                    <span className="font-display text-[10px] font-bold uppercase tracking-[0.5em] text-primary">
                      {section.number} / {section.tag}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h2 className="font-display text-3xl font-bold uppercase italic leading-[0.95] tracking-tight text-foreground sm:text-4xl">
                      {t(section.titleKey)}
                    </h2>
                    <p className="max-w-[28ch] text-sm leading-relaxed text-muted-foreground">
                      {t(section.descKey)}
                    </p>

                    <div className="flex items-center gap-2 pt-3 transition-all duration-500 group-hover:gap-4">
                      <span className="h-px w-8 bg-primary transition-all duration-500 group-hover:w-14" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground">
                        Ouvrir
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Editorial footer */}
        <footer className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground">
            <span className="inline-flex items-center gap-2 text-foreground">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Système actif
            </span>
            <span>·</span>
            <span>{SECTIONS.length} modules</span>
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground">
            ATS · Racing Spec
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Menu;
