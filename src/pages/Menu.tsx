import { Link } from "react-router-dom";
import { BookA, Brush, Car, ChevronRight, Wrench, Codesandbox } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

const Menu = () => {
  const { t } = useI18n();

  const SECTIONS = [
  {
    titleKey: "menu.services",
    descKey: "menu.servicesDesc",
    icon: Wrench,
    path: "/gestion-services",
    color: "from-amber-400 to-orange-500"
  },
  {
    titleKey: "menu.insurance",
    descKey: "menu.insuranceDesc",
    icon: BookA,
    path: "/vehicules",
    color: "from-red-400 to-rose-300"
  },
  {
    titleKey: "menu.vehicles",
    descKey: "menu.vehiclesDesc",
    icon: Car,
    path: "/gestion-vehicules",
    color: "from-violet-500 to-blue-600"
  },
  {
    titleKey: "menu.create",
    descKey: "menu.createDesc",
    icon: Brush,
    path: "/atelier",
    color: "from-lime-400 to-green-400"
  }];


  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold uppercase tracking-wider text-foreground">
          {t("menu.title")} <Codesandbox className="text-primary">{t("menu.titleHighlight")}</Codesandbox>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("menu.subtitle")}
        </p>
      </div>

      <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.titleKey} to={section.path}>
              <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-automotive hover:scale-[1.02]">
                <div className={`absolute left-0 right-0 top-0 h-1 bg-gradient-to-r ${section.color}`} />
                <div className="flex items-start gap-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${section.color} shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
                      {t(section.titleKey)}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t(section.descKey)}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </div>
            </Link>);

        })}
      </div>
    </div>);

};

export default Menu;