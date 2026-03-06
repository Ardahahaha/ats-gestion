import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Car, Building2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type GestionVehicule = {
  id: string;
  marque: string;
  modele: string;
  immatriculation: string;
  etat: string;
  concession: string;
};

const GestionVehicules = () => {
  const [vehicles, setVehicles] = useState<GestionVehicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [newConcession, setNewConcession] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

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

  // Récupérer les concessions uniques
  const concessions = [...new Set(vehicles.map((v) => v.concession).filter(Boolean))].sort();

  const addConcession = () => {
    const name = newConcession.trim();
    if (!name) return;
    if (concessions.includes(name)) {
      toast.error("Cette concession existe déjà");
      return;
    }
    // On ajoute un véhicule vide pour créer la concession
    addVehicle(name);
    setNewConcession("");
    setDialogOpen(false);
  };

  const addVehicle = async (concession: string) => {
    const { error } = await supabase.from("gestion_vehicules").insert({ concession });
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

  const deleteConcession = async (concession: string) => {
    const { error } = await supabase
      .from("gestion_vehicules")
      .delete()
      .eq("concession", concession);
    if (error) toast.error("Erreur lors de la suppression");
    else await fetchVehicles();
  };

  const getByConc = (c: string) => vehicles.filter((v) => v.concession === c);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
            Gestion des <span className="text-primary">Véhicules</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {vehicles.length} véhicule{vehicles.length > 1 ? "s" : ""} · {concessions.length} concession{concessions.length > 1 ? "s" : ""}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Building2 className="h-4 w-4" />
              Nouvelle concession
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une concession</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2 pt-2">
              <Input
                placeholder="Nom de la concession…"
                value={newConcession}
                onChange={(e) => setNewConcession(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addConcession()}
                autoFocus
              />
              <Button onClick={addConcession}>Ajouter</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Concessions vides */}
      {concessions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Building2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Aucune concession pour le moment</p>
          <p className="text-xs text-muted-foreground/70">Cliquez sur « Nouvelle concession » pour commencer</p>
        </div>
      )}

      {/* Grille des concessions */}
      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {concessions.map((concession) => {
          const items = getByConc(concession);
          return (
            <div key={concession} className="flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              {/* Concession header */}
              <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
                    {concession}
                  </h3>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {items.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => addVehicle(concession)} className="h-7 w-7 p-0" title="Ajouter un véhicule">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Supprimer la concession « ${concession} » et tous ses véhicules ?`)) {
                        deleteConcession(concession);
                      }
                    }}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    title="Supprimer la concession"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Véhicules */}
              <div className="flex-1 divide-y divide-border">
                {items.length === 0 && (
                  <p className="px-4 py-8 text-center text-xs text-muted-foreground italic">Aucun véhicule</p>
                )}
              {items.map((v) => (
                  <div key={v.id} className="group relative flex items-center gap-2 px-2.5 py-1.5 transition-colors hover:bg-muted/30">
                    <div className="grid flex-1 grid-cols-4 gap-x-2">
                      <EditableField label="Marque" value={v.marque} onSave={(val) => updateField(v.id, "marque", val)} />
                      <EditableField label="Modèle" value={v.modele} onSave={(val) => updateField(v.id, "modele", val)} />
                      <EditableField label="Immat" value={v.immatriculation} onSave={(val) => updateField(v.id, "immatriculation", val)} />
                      <EditableField label="État" value={v.etat} onSave={(val) => updateField(v.id, "etat", val)} />
                    </div>
                    <button
                      onClick={() => deleteVehicle(v.id)}
                      className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
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
    <div className="text-xs">
      <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {editing ? (
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === "Enter" && save()}
          className="mt-0.5 w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
        />
      ) : (
        <span
          onClick={() => setEditing(true)}
          className="mt-0.5 block cursor-pointer rounded px-1 py-0.5 text-foreground hover:bg-muted/50"
        >
          {value || <span className="italic text-muted-foreground">—</span>}
        </span>
      )}
    </div>
  );
};

export default GestionVehicules;
