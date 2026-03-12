import { Link } from "react-router-dom";
import { BookA, Brush, Car, ChevronRight, Wrench, LayoutDashboard } from "lucide-react";
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
      color: "from-amber-400 to-orange-500",
    },
    {
      titleKey: "menu.insurance",
      descKey: "menu.insuranceDesc",
      icon: BookA,
      path: "/vehicules",
      color: "from-red-400 to-rose-300",
    },
    {
      titleKey: "menu.vehicles",
      descKey: "menu.vehiclesDesc",
      icon: Car,
      path: "/gestion-vehicules",
      color: "from-violet-500 to-blue-600",
    },
    {
      titleKey: "menu.create",
      descKey: "menu.createDesc",
      icon: Brush,
      path: "/atelier",
      color: "from-lime-400 to-green-400",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header compact */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card px-5 py-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold uppercase tracking-wider text-foreground">
              {t("menu.title")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {pseudo ? `${t("menu.subtitle")} — ${pseudo}` : t("menu.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Grille 2x2 uniforme */}
      <div className="grid grid-cols-2 gap-3">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.titleKey} to={section.path} className="group">
              <div className="relative h-full overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-automotive hover:scale-[1.01]">
                <div className={`absolute left-0 right-0 top-0 h-1 bg-gradient-to-r ${section.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${section.color} shadow-md`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
                      {t(section.titleKey)}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
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
