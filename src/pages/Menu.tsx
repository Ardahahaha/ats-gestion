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
    },
    {
      titleKey: "menu.vehicles",
      descKey: "menu.vehiclesDesc",
      icon: Car,
      path: "/gestion-vehicules",
    },
    {
      titleKey: "menu.insurance",
      descKey: "menu.insuranceDesc",
      icon: BookA,
      path: "/vehicules",
    },
    {
      titleKey: "menu.create",
      descKey: "menu.createDesc",
      icon: Brush,
      path: "/atelier",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Compact hero */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card px-6 py-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/8" />
        <div className="relative flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              {t("menu.title")} <span className="text-primary">{pseudo || t("menu.titleHighlight")}</span>
            </h2>
            <p className="text-xs text-muted-foreground">{t("menu.subtitle")}</p>
          </div>
        </div>
      </div>

      {/* Uniform 2x2 grid */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.titleKey} to={section.path} className="group">
              <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 h-full transition-all duration-300 hover:border-primary/40 hover:shadow-automotive hover:scale-[1.02]">
                <div className="absolute left-0 right-0 top-0 h-0.5 bg-primary opacity-40 group-hover:opacity-100 transition-opacity" />

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 transition-all duration-300 group-hover:bg-primary group-hover:border-primary group-hover:shadow-md group-hover:shadow-primary/20">
                      <Icon className="h-5 w-5 text-primary transition-colors duration-300 group-hover:text-primary-foreground" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm md:text-base font-bold uppercase tracking-wide text-foreground group-hover:text-primary transition-colors duration-200">
                      {t(section.titleKey)}
                    </h3>
                    <p className="mt-0.5 text-[11px] md:text-xs text-muted-foreground leading-snug line-clamp-2">
                      {t(section.descKey)}
                    </p>
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
