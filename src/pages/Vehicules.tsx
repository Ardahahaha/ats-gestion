import { VehicleTable } from "@/components/VehicleTable";
import { useAuth } from "@/contexts/AuthContext";
import { Lock } from "lucide-react";

const Vehicules = () => {
  const { role } = useAuth();

  if (role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <Lock className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="font-display text-xl font-bold uppercase tracking-wider text-foreground">Accès restreint</h2>
        <p className="text-sm text-muted-foreground">Ce module est réservé aux administrateurs.</p>
      </div>
    );
  }

  return <VehicleTable />;
};

export default Vehicules;
