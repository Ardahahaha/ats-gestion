import { VehicleTable } from "@/components/VehicleTable";
import { useAuth } from "@/contexts/AuthContext";
import { Lock } from "lucide-react";

const Vehicules = () => {
  const { role } = useAuth();
  const isAdmin = role === "admin";

  return (
    <div>
      {!isAdmin && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          Mode lecture seule — accès technicien
        </div>
      )}
      <VehicleTable readOnly={!isAdmin} />
    </div>
  );
};

export default Vehicules;
