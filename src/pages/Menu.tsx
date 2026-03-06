import { Link } from "react-router-dom";
import { Car, Wrench, Package, ClipboardList, ChevronRight } from "lucide-react";

const SECTIONS = [
  {
    title: "Gestion des Véhicules",
    description: "Suivi des entrées, sorties, travaux et pièces",
    icon: Car,
    path: "/vehicules",
    color: "from-primary to-red-600",
  },
  {
    title: "Atelier",
    description: "Créez vos propres tableaux personnalisés",
    icon: Wrench,
    path: "/atelier",
    color: "from-amber-500 to-orange-600",
  },
  {
    title: "Stock Pièces",
    description: "Bientôt disponible",
    icon: Package,
    path: "#",
    color: "from-emerald-500 to-green-600",
    disabled: true,
  },
  {
    title: "Rapports",
    description: "Bientôt disponible",
    icon: ClipboardList,
    path: "#",
    color: "from-blue-500 to-indigo-600",
    disabled: true,
  },
];

const Menu = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold uppercase tracking-wider text-foreground">
          Menu <span className="text-primary">Principal</span>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sélectionnez un module pour commencer
        </p>
      </div>

      <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const content = (
            <div
              className={`group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 ${
                section.disabled
                  ? "cursor-not-allowed opacity-50"
                  : "hover:border-primary/30 hover:shadow-automotive hover:scale-[1.02]"
              }`}
            >
              {/* Gradient accent top */}
              <div className={`absolute left-0 right-0 top-0 h-1 bg-gradient-to-r ${section.color}`} />

              <div className="flex items-start gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${section.color} shadow-lg`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
                    {section.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {section.description}
                  </p>
                </div>
                {!section.disabled && (
                  <ChevronRight className="mt-1 h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                )}
              </div>
            </div>
          );

          if (section.disabled) {
            return <div key={section.title}>{content}</div>;
          }

          return (
            <Link key={section.title} to={section.path}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Menu;
