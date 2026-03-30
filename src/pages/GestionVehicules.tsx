import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Car, Building2, X, Lock, CalendarIcon, Pencil } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { format, parse, isValid, differenceInWeeks } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
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
  date_entree: string;
};

function parseDateEntree(value: string): Date | undefined {
  if (!value) return undefined;
  const d = parse(value, "dd/MM/yyyy", new Date());
  return isValid(d) ? d : undefined;
}

function getWeeksColor(dateStr: string): { dot: string; glow: string; bg: string; label: string } {
  const d = parseDateEntree(dateStr);
  if (!d) return { dot: "bg-muted-foreground/30", glow: "", bg: "", label: "" };
  const weeks = differenceInWeeks(new Date(), d);
  if (weeks < 1) return { dot: "bg-green-500", glow: "shadow-[0_0_8px_2px_rgba(34,197,94,0.6)]", bg: "bg-green-500/5", label: "< 1 sem" };
  if (weeks < 2) return { dot: "bg-yellow-500", glow: "shadow-[0_0_8px_2px_rgba(234,179,8,0.6)]", bg: "bg-yellow-500/5", label: "1 sem" };
  if (weeks < 3) return { dot: "bg-orange-500", glow: "shadow-[0_0_8px_2px_rgba(249,115,22,0.6)]", bg: "bg-orange-500/5", label: "2 sem" };
  return { dot: "bg-red-500", glow: "shadow-[0_0_8px_2px_rgba(239,68,68,0.6)]", bg: "bg-red-500/5", label: "3+ sem" };
}

const DateEntreeCell = ({ value, onSave, readOnly }: { value: string; onSave: (v: string) => void; readOnly?: boolean }) => {
  const date = parseDateEntree(value);
  const colors = getWeeksColor(value);

  return (
    <div className="flex items-center gap-1 text-[11px] min-w-0">
      <span className="shrink-0 text-[10px] font-medium text-muted-foreground">Entrée:</span>
      <div className="flex items-center gap-1 min-w-0">
        <Popover>
          <PopoverTrigger asChild>
            <button
              disabled={readOnly}
              className={cn(
                "flex items-center gap-1 rounded px-1 py-0.5 text-[11px] text-foreground outline-none transition-all hover:bg-muted/30 focus:ring-1 focus:ring-ring disabled:opacity-60",
                !date && "italic text-muted-foreground/50"
              )}
            >
              <CalendarIcon className="h-3 w-3 shrink-0 text-primary/60" />
              {date ? format(date, "dd/MM/yyyy") : "Date"}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-border shadow-lg" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => { if (d) onSave(format(d, "dd/MM/yyyy")); }}
              locale={fr}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};


const ETAT_OPTIONS = [
  "Carrosserie",
  "Mécanique",
  "Contrôle mécanique",
  "Devis accord",
  "Travaux",
  "Contrôle des travaux",
];

function getEtatColor(etat: string): string {
  switch (etat) {
    case "Carrosserie": return "bg-blue-500/10 text-blue-600 ring-blue-500/30";
    case "Mécanique": return "bg-purple-500/10 text-purple-600 ring-purple-500/30";
    default: return "";
  }
}

const StateDropdown = ({ value, onSave, readOnly, label }: { value: string; label: string; onSave: (v: string) => void; readOnly?: boolean }) => {
  const [customMode, setCustomMode] = useState(false);
  const [customVal, setCustomVal] = useState("");

  const isCustom = value && !ETAT_OPTIONS.includes(value);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (v === "__custom__") {
      setCustomMode(true);
      setCustomVal("");
    } else {
      setCustomMode(false);
      onSave(v);
    }
  };

  const saveCustom = () => {
    if (customVal.trim()) {
      onSave(customVal.trim());
    }
    setCustomMode(false);
  };

  if (customMode) {
    return (
      <div className="flex items-center gap-1 text-[11px] min-w-0">
        <span className="shrink-0 text-[10px] font-medium text-muted-foreground">{label}:</span>
        <input
          value={customVal}
          onChange={(e) => setCustomVal(e.target.value)}
          onBlur={saveCustom}
          onKeyDown={(e) => e.key === "Enter" && saveCustom()}
          placeholder="Saisir..."
          autoFocus
          className="w-full min-w-0 rounded bg-background px-1 py-0.5 text-[11px] text-foreground outline-none ring-1 ring-ring"
        />
      </div>
    );
  }

  const etatColor = getEtatColor(value);

  return (
    <div className="flex items-center gap-1 text-[11px] min-w-0">
      <span className="shrink-0 text-[10px] font-medium text-muted-foreground">{label}:</span>
      <select
        value={isCustom ? "__custom_display__" : value}
        onChange={handleChange}
        disabled={readOnly}
        className={cn(
          "w-full min-w-0 rounded px-1 py-0.5 text-[11px] font-medium outline-none hover:bg-muted/30 focus:bg-background focus:ring-1 focus:ring-ring disabled:opacity-60",
          etatColor || "bg-transparent text-foreground"
        )}
      >
        <option value="">—</option>
        {ETAT_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
        {isCustom && <option value="__custom_display__">{value}</option>}
        <option value="__custom__">✏️ Personnalisé...</option>
      </select>
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

  const createServiceCard = async (vehicle: GestionVehicule, etat: string) => {
    const technicien = vehicle.technicien;
    if (!technicien) return; // pas de technicien = pas de carte

    const isCarrosserie = etat === "Carrosserie";
    const isMecanique = etat === "Mécanique";
    if (!isCarrosserie && !isMecanique) return;

    const dateEntree = vehicle.date_entree || "";
    // Convert dd/MM/yyyy to yyyy-MM-dd for services table
    let serviceDateEntree = "";
    if (dateEntree) {
      const parsed = parseDateEntree(dateEntree);
      if (parsed) serviceDateEntree = format(parsed, "yyyy-MM-dd");
    }

    const { error } = await supabase.from("services").insert({
      modele: [vehicle.marque, vehicle.modele].filter(Boolean).join(" ") || "",
      immatriculation: vehicle.immatriculation || "",
      prenom: technicien,
      date_entree: serviceDateEntree,
      has_carrosserie: isCarrosserie,
      has_mecanique: isMecanique,
    });

    if (error) {
      toast.error("Erreur lors de la création de la fiche service");
    } else {
      toast.success(
        `📋 Fiche ${etat} créée dans Gestion des Services`,
        { description: `${vehicle.marque} ${vehicle.modele} — ${technicien}` }
      );
    }
  };

  const updateField = async (id: string, field: string, value: string) => {
    const { error } = await supabase.from("gestion_vehicules").update({ [field]: value }).eq("id", id);
    if (error) {
      toast.error(t("vehicles.errorUpdate"));
      return;
    }

    // Si on change l'état vers Carrosserie/Mécanique, créer une fiche service
    if (field === "etat" && (value === "Carrosserie" || value === "Mécanique")) {
      const vehicle = vehicles.find((v) => v.id === id);
      if (vehicle) {
        await createServiceCard({ ...vehicle, etat: value }, value);
      }
    }

    // Si on assigne un technicien et que l'état est déjà Carrosserie/Mécanique
    if (field === "technicien" && value) {
      const vehicle = vehicles.find((v) => v.id === id);
      if (vehicle && (vehicle.etat === "Carrosserie" || vehicle.etat === "Mécanique")) {
        await createServiceCard({ ...vehicle, technicien: value }, vehicle.etat);
      }
    }
  };

  const renameConcession = async (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    const { error } = await supabase
      .from("gestion_vehicules")
      .update({ concession: trimmed })
      .eq("concession", oldName);
    if (error) toast.error("Erreur lors du renommage");
    else {
      toast.success(`Concession renommée en "${trimmed}"`);
      await fetchVehicles();
    }
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
                  placeholder={t("vehicles.concessionName")}
                  value={newConcession}
                  onChange={(e) => setNewConcession(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addConcession()}
                  autoFocus
                />
                <Button onClick={addConcession}>{t("vehicles.add")}</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Concessions vides */}
      {concessions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Building2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t("vehicles.noConcessions")}</p>
          <p className="text-xs text-muted-foreground/70">{t("vehicles.noConcessionsSub")}</p>
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
                      <Button size="sm" variant="ghost" onClick={() => {
                        const newName = prompt("Nouveau nom de la concession :", concession);
                        if (newName) renameConcession(concession, newName);
                      }} className="h-7 w-7 p-0" title="Renommer la concession">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => addVehicle(concession)} className="h-7 w-7 p-0" title={t("vehicles.addVehicle")}>
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(t("vehicles.deleteConcessionConfirm", { name: concession }))) {
                            deleteConcession(concession);
                          }
                        }}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        title={t("vehicles.deleteConcession")}
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
                  <p className="px-3 py-4 text-center text-xs text-muted-foreground italic">{t("vehicles.noVehicles")}</p>
                )}
              {items.map((v) => {
                  const colors = getWeeksColor(v.date_entree);
                  return (
                    <div key={v.id} className={cn("group relative flex items-center gap-2 px-2.5 py-1.5 transition-colors hover:bg-muted/30", v.date_entree && colors.bg)}>
                      {/* Indicateur lumineux à gauche */}
                      <span className={cn("h-3 w-3 shrink-0 rounded-full", v.date_entree ? cn(colors.dot, colors.glow) : "bg-muted-foreground/20")} title={colors.label} />
                      <div className="grid flex-1 grid-cols-6 gap-x-2">
                        <DateEntreeCell value={v.date_entree} onSave={(val) => updateField(v.id, "date_entree", val)} readOnly={!isAdmin} />
                        <EditableField label={t("vehicles.brand")} value={v.marque} onSave={(val) => updateField(v.id, "marque", val)} readOnly={!isAdmin} />
                        <EditableField label={t("vehicles.model")} value={v.modele} onSave={(val) => updateField(v.id, "modele", val)} readOnly={!isAdmin} />
                        <EditableField label={t("vehicles.plate")} value={v.immatriculation} onSave={(val) => updateField(v.id, "immatriculation", val)} readOnly={!isAdmin} />
                        <StateDropdown value={v.etat} onSave={(val) => updateField(v.id, "etat", val)} readOnly={!isAdmin} label={t("vehicles.state")} />
                        <div className="flex items-center gap-1 text-[11px] min-w-0">
                          <span className="shrink-0 text-[10px] font-medium text-muted-foreground">{t("vehicles.tech")}:</span>
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
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GestionVehicules;
