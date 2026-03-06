import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type GestionVehicule = {
  id: string;
  marque: string;
  modele: string;
  immatriculation: string;
  etat: string;
};

const MARQUES = ["Peugeot", "Automalin", "Renault"] as const;

const GestionVehicules = () => {
  const [vehicles, setVehicles] = useState<GestionVehicule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = useCallback(async () => {
    const { data, error } = await supabase
      .from("gestion_vehicules")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      toast.error("Erreur de chargement");
      return;
    }
    setVehicles((data as GestionVehicule[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVehicles();
    const channel = supabase
      .channel("gestion_vehicules_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "gestion_vehicules" }, fetchVehicles)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchVehicles]);

  const addVehicle = async (marque: string) => {
    const { error } = await supabase.from("gestion_vehicules").insert({ marque });
    if (error) toast.error("Erreur lors de l'ajout");
  };

  const deleteVehicle = async (id: string) => {
    const { error } = await supabase.from("gestion_vehicules").delete().eq("id", id);
    if (error) toast.error("Erreur lors de la suppression");
  };

  const updateField = async (id: string, field: string, value: string) => {
    const { error } = await supabase.from("gestion_vehicules").update({ [field]: value }).eq("id", id);
    if (error) toast.error("Erreur lors de la mise à jour");
  };

  const getByMarque = (marque: string) => vehicles.filter((v) => v.marque === marque);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
          Gestion des <span className="text-primary">Véhicules</span>
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {MARQUES.map((marque) => {
          const items = getByMarque(marque);
          return (
            <div key={marque} className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
                    {marque}
                  </h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {items.length}
                  </span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => addVehicle(marque)} className="h-7 w-7 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Items */}
              <div className="divide-y divide-border">
                {items.length === 0 && (
                  <p className="px-4 py-6 text-center text-xs text-muted-foreground">Aucun véhicule</p>
                )}
                {items.map((v) => (
                  <div key={v.id} className="group relative space-y-2 px-4 py-3">
                    <button
                      onClick={() => deleteVehicle(v.id)}
                      className="absolute right-2 top-2 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <EditableField label="Modèle" value={v.modele} onSave={(val) => updateField(v.id, "modele", val)} />
                    <EditableField label="Immat" value={v.immatriculation} onSave={(val) => updateField(v.id, "immatriculation", val)} />
                    <EditableField label="État" value={v.etat} onSave={(val) => updateField(v.id, "etat", val)} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EditableField = ({ label, value, onSave }: { label: string; value: string; onSave: (v: string) => void }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  useEffect(() => setVal(value), [value]);

  const save = () => {
    setEditing(false);
    if (val !== value) onSave(val);
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-14 shrink-0 font-medium text-muted-foreground">{label}</span>
      {editing ? (
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === "Enter" && save()}
          className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
        />
      ) : (
        <span
          onClick={() => setEditing(true)}
          className="flex-1 cursor-pointer rounded px-2 py-1 text-foreground hover:bg-muted/50"
        >
          {value || <span className="italic text-muted-foreground">—</span>}
        </span>
      )}
    </div>
  );
};

export default GestionVehicules;
