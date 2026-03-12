import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Car, Building2, X, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
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
  technicien: string;
};

const GestionVehicules = () => {
  const { role } = useAuth();
  const { t } = useI18n();
  const isAdmin = role === "admin";
  const [vehicles, setVehicles] = useState<GestionVehicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [newConcession, setNewConcession] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [techniciens, setTechniciens] = useState<string[]>([]);

  useEffect(() => {
    const fetchTechniciens = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "technicien");
      if (data && data.length > 0) {
        const userIds = data.map((d) => d.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("pseudo")
          .in("user_id", userIds);
        if (profiles) {
          setTechniciens(profiles.map((p) => p.pseudo).filter(Boolean));
        }
      }
    };
    fetchTechniciens();
  }, []);

  const fetchVehicles = useCallback(async () => {
    const { data, error } = await supabase
      .from("gestion_vehicules")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      toast.error(t("vehicles.errorLoad"));
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
      toast.error(t("vehicles.alreadyExists"));
      return;
    }
    // On ajoute un véhicule vide pour créer la concession
    addVehicle(name);
    setNewConcession("");
    setDialogOpen(false);
  };

  const addVehicle = async (concession: string) => {
    const { error } = await supabase.from("gestion_vehicules").insert({ concession });
    if (error) toast.error(t("vehicles.errorAdd"));
  };

  const deleteVehicle = async (id: string) => {
    const { error } = await supabase.from("gestion_vehicules").delete().eq("id", id);
    if (error) toast.error(t("vehicles.errorDelete"));
  };

  const updateField = async (id: string, field: string, value: string) => {
    const { error } = await supabase.from("gestion_vehicules").update({ [field]: value }).eq("id", id);
    if (error) toast.error(t("vehicles.errorUpdate"));
  };

  const deleteConcession = async (concession: string) => {
    const { error } = await supabase
      .from("gestion_vehicules")
      .delete()
      .eq("concession", concession);
    if (error) toast.error(t("vehicles.errorDelete"));
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
      {!isAdmin && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          {t("vehicles.readOnly")}
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
            {t("vehicles.title")} <span className="text-primary">{t("vehicles.titleHighlight")}</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {vehicles.length} {vehicles.length > 1 ? t("vehicles.vehicles") : t("vehicles.vehicle")} · {concessions.length} {concessions.length > 1 ? t("vehicles.concessions") : t("vehicles.concession")}
          </p>
        </div>

        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Building2 className="h-4 w-4" />
                {t("vehicles.newConcession")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("vehicles.addConcession")}</DialogTitle>
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
        )}
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
      <div className="grid gap-3 xl:grid-cols-2">
        {concessions.map((concession) => {
          const items = getByConc(concession);
          return (
            <div key={concession} className="flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              {/* Concession header */}
              <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-primary/5 px-3 py-2">
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
                  {isAdmin && (
                    <>
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
                    </>
                  )}
                </div>
              </div>

              {/* Véhicules */}
              <div className="flex-1 divide-y divide-border">
                {items.length === 0 && (
                  <p className="px-3 py-4 text-center text-xs text-muted-foreground italic">Aucun véhicule</p>
                )}
              {items.map((v) => (
                  <div key={v.id} className="group relative flex items-center gap-2 px-2.5 py-1.5 transition-colors hover:bg-muted/30">
                    <div className="grid flex-1 grid-cols-5 gap-x-2">
                      <EditableField label="Marque" value={v.marque} onSave={(val) => updateField(v.id, "marque", val)} readOnly={!isAdmin} />
                      <EditableField label="Modèle" value={v.modele} onSave={(val) => updateField(v.id, "modele", val)} readOnly={!isAdmin} />
                      <EditableField label="Immat" value={v.immatriculation} onSave={(val) => updateField(v.id, "immatriculation", val)} readOnly={!isAdmin} />
                      <EditableField label="État" value={v.etat} onSave={(val) => updateField(v.id, "etat", val)} readOnly={!isAdmin} />
                      <div className="flex items-center gap-1 text-[11px] min-w-0">
                        <span className="shrink-0 text-[10px] font-medium text-muted-foreground">Tech:</span>
                        <select
                          value={v.technicien}
                          onChange={(e) => updateField(v.id, "technicien", e.target.value)}
                          disabled={!isAdmin}
                          className="w-full min-w-0 rounded bg-transparent px-1 py-0.5 text-[11px] text-foreground outline-none hover:bg-muted/30 focus:bg-background focus:ring-1 focus:ring-ring disabled:opacity-60"
                        >
                          <option value="">—</option>
                          {techniciens.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => deleteVehicle(v.id)}
                        className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
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

const EditableField = ({ label, value, onSave, readOnly }: { label: string; value: string; onSave: (v: string) => void; readOnly?: boolean }) => {
  const [val, setVal] = useState(value);

  useEffect(() => setVal(value), [value]);

  const save = () => {
    if (!readOnly && val !== value) onSave(val);
  };

  return (
    <div className="flex items-center gap-1 text-[11px] min-w-0">
      <span className="shrink-0 text-[10px] font-medium text-muted-foreground">{label}:</span>
      <input
        value={val}
        onChange={(e) => !readOnly && setVal(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => e.key === "Enter" && save()}
        placeholder={label}
        readOnly={readOnly}
        className="w-full min-w-0 rounded bg-transparent px-1 py-0.5 text-[11px] text-foreground outline-none placeholder:italic placeholder:text-muted-foreground/50 hover:bg-muted/30 focus:bg-background focus:ring-1 focus:ring-ring"
      />
    </div>
  );
};

export default GestionVehicules;
