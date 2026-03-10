import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Maximize2, X } from "lucide-react";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

const MECANIQUE_SERVICES = [
  "Diagnostique",
  "Vidange",
  "Freins",
  "Distribution",
  "Embrayage",
  "Suspension",
  "Direction",
  "Échappement",
  "Climatisation",
  "Électrique",
  "Courroie",
  "Démarreur",
  "Alternateur",
  "Batterie",
];

const CARROSSERIE_SERVICES = [
  "Peinture",
  "Débosselage",
  "Pare-chocs",
  "Aile",
  "Capot",
  "Portière",
  "Lustrage",
  "Vitrage",
  "Phares",
  "Rétroviseur",
];

type ServiceRow = {
  id: string;
  immatriculation: string;
  date_entree: string;
  date_sortie: string;
  mecanique_taches: string[];
  mecanique_validees: string[];
  mecanique_notes_chef: string;
  mecanique_notes_meca: string;
  carrosserie_taches: string[];
  carrosserie_validees: string[];
  carrosserie_notes_chef: string;
  carrosserie_notes_meca: string;
};

function toStringArray(val: Json | undefined): string[] {
  if (Array.isArray(val)) return val.filter((v): v is string => typeof v === "string");
  return [];
}

/* ────────── Fullscreen Modal ────────── */
function FullscreenModal({
  title,
  value,
  onChange,
  onClose,
  readOnly,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
  readOnly?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-xl border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Textarea
          className="min-h-[300px] text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          placeholder="Notes…"
        />
      </div>
    </div>
  );
}

/* ────────── Task Section (Chef / Mécanicien) ────────── */
function TaskSection({
  label,
  allServices,
  selected,
  onToggle,
  notes,
  onNotesChange,
  onSave,
  validated,
  onToggleValidated,
  validatedNotes,
  onValidatedNotesChange,
  onSaveValidated,
}: {
  label: string;
  allServices: string[];
  selected: string[];
  onToggle: (s: string) => void;
  notes: string;
  onNotesChange: (v: string) => void;
  onSave: () => void;
  validated: string[];
  onToggleValidated: (s: string) => void;
  validatedNotes: string;
  onValidatedNotesChange: (v: string) => void;
  onSaveValidated: () => void;
}) {
  const [fullscreen, setFullscreen] = useState<null | "chef" | "meca">(null);

  return (
    <>
      {fullscreen === "chef" && (
        <FullscreenModal
          title={`${label} – Notes Chef`}
          value={notes}
          onChange={onNotesChange}
          onClose={() => {
            setFullscreen(null);
            onSave();
          }}
        />
      )}
      {fullscreen === "meca" && (
        <FullscreenModal
          title={`${label} – Notes Mécanicien`}
          value={validatedNotes}
          onChange={onValidatedNotesChange}
          onClose={() => {
            setFullscreen(null);
            onSaveValidated();
          }}
        />
      )}

      <div className="grid grid-cols-2 gap-px bg-border">
        {/* Chef column */}
        <div className="bg-card p-2">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Chef d'atelier
          </p>
          <div className="space-y-1">
            {allServices.map((s) => (
              <label key={s} className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                <Checkbox
                  checked={selected.includes(s)}
                  onCheckedChange={() => onToggle(s)}
                  className="h-3.5 w-3.5"
                />
                <span className={selected.includes(s) ? "text-foreground font-medium" : "text-muted-foreground"}>
                  {s}
                </span>
              </label>
            ))}
          </div>
          <div className="mt-2 relative">
            <Textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              onBlur={onSave}
              placeholder="Notes chef…"
              className="min-h-[40px] text-[11px] pr-7 resize-none"
            />
            <button
              onClick={() => setFullscreen("chef")}
              className="absolute right-1 top-1 p-0.5 rounded hover:bg-muted"
            >
              <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Mécanicien column */}
        <div className="bg-card p-2">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Mécanicien
          </p>
          <div className="space-y-1">
            {selected.length === 0 ? (
              <p className="text-[10px] text-muted-foreground italic">Aucune tâche assignée</p>
            ) : (
              selected.map((s) => (
                <label key={s} className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                  <Checkbox
                    checked={validated.includes(s)}
                    onCheckedChange={() => onToggleValidated(s)}
                    className="h-3.5 w-3.5"
                  />
                  <span
                    className={
                      validated.includes(s)
                        ? "text-green-600 line-through font-medium"
                        : "text-foreground"
                    }
                  >
                    {s}
                  </span>
                </label>
              ))
            )}
          </div>
          <div className="mt-2 relative">
            <Textarea
              value={validatedNotes}
              onChange={(e) => onValidatedNotesChange(e.target.value)}
              onBlur={onSaveValidated}
              placeholder="Notes mécanicien…"
              className="min-h-[40px] text-[11px] pr-7 resize-none"
            />
            <button
              onClick={() => setFullscreen("meca")}
              className="absolute right-1 top-1 p-0.5 rounded hover:bg-muted"
            >
              <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ────────── Service Card (mobile) ────────── */
function ServiceCardMobile({
  row,
  onUpdate,
  onDelete,
}: {
  row: ServiceRow;
  onUpdate: (id: string, field: string, value: unknown) => void;
  onDelete: (id: string) => void;
}) {
  const toggle = (field: string, current: string[], item: string) => {
    const next = current.includes(item)
      ? current.filter((s) => s !== item)
      : [...current, item];
    onUpdate(row.id, field, next);
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 bg-muted/30 px-3 py-2">
        <Input
          value={row.immatriculation}
          onChange={(e) => onUpdate(row.id, "immatriculation", e.target.value)}
          onBlur={() => {}}
          placeholder="Immat"
          className="h-7 text-xs font-bold flex-1 bg-transparent border-none shadow-none"
        />
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => onDelete(row.id)}>
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-px bg-border">
        <div className="bg-card p-2">
          <p className="text-[9px] text-muted-foreground uppercase mb-0.5">Entrée</p>
          <Input
            type="date"
            value={row.date_entree}
            onChange={(e) => onUpdate(row.id, "date_entree", e.target.value)}
            className="h-7 text-[11px] border-none shadow-none bg-transparent p-0"
          />
        </div>
        <div className="bg-card p-2">
          <p className="text-[9px] text-muted-foreground uppercase mb-0.5">Sortie</p>
          <Input
            type="date"
            value={row.date_sortie}
            onChange={(e) => onUpdate(row.id, "date_sortie", e.target.value)}
            className="h-7 text-[11px] border-none shadow-none bg-transparent p-0"
          />
        </div>
      </div>

      {/* Mécanique */}
      <div className="border-t">
        <div className="px-3 py-1.5 bg-blue-500/10">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">🔧 Mécanique</p>
        </div>
        <div className="p-1">
          <TaskSection
            label="Mécanique"
            allServices={MECANIQUE_SERVICES}
            selected={row.mecanique_taches}
            onToggle={(s) => toggle("mecanique_taches", row.mecanique_taches, s)}
            notes={row.mecanique_notes_chef}
            onNotesChange={(v) => onUpdate(row.id, "mecanique_notes_chef", v)}
            onSave={() => {}}
            validated={row.mecanique_validees}
            onToggleValidated={(s) => toggle("mecanique_validees", row.mecanique_validees, s)}
            validatedNotes={row.mecanique_notes_meca}
            onValidatedNotesChange={(v) => onUpdate(row.id, "mecanique_notes_meca", v)}
            onSaveValidated={() => {}}
          />
        </div>
      </div>

      {/* Carrosserie */}
      <div className="border-t">
        <div className="px-3 py-1.5 bg-orange-500/10">
          <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">🎨 Carrosserie</p>
        </div>
        <div className="p-1">
          <TaskSection
            label="Carrosserie"
            allServices={CARROSSERIE_SERVICES}
            selected={row.carrosserie_taches}
            onToggle={(s) => toggle("carrosserie_taches", row.carrosserie_taches, s)}
            notes={row.carrosserie_notes_chef}
            onNotesChange={(v) => onUpdate(row.id, "carrosserie_notes_chef", v)}
            onSave={() => {}}
            validated={row.carrosserie_validees}
            onToggleValidated={(s) => toggle("carrosserie_validees", row.carrosserie_validees, s)}
            validatedNotes={row.carrosserie_notes_meca}
            onValidatedNotesChange={(v) => onUpdate(row.id, "carrosserie_notes_meca", v)}
            onSaveValidated={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

/* ────────── Main Page ────────── */
export default function GestionServices() {
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = useCallback(async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      toast.error("Erreur chargement services");
      return;
    }
    setRows(
      (data || []).map((d) => ({
        ...d,
        mecanique_taches: toStringArray(d.mecanique_taches as Json),
        mecanique_validees: toStringArray(d.mecanique_validees as Json),
        carrosserie_taches: toStringArray(d.carrosserie_taches as Json),
        carrosserie_validees: toStringArray(d.carrosserie_validees as Json),
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRows();
    const channel = supabase
      .channel("services-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "services" }, () => fetchRows())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchRows]);

  const addRow = async () => {
    const { error } = await supabase.from("services").insert({});
    if (error) toast.error("Erreur ajout");
    else fetchRows();
  };

  const deleteRow = async (id: string) => {
    if (!confirm("Supprimer cette ligne ?")) return;
    await supabase.from("services").delete().eq("id", id);
    fetchRows();
  };

  const updateField = useCallback(
    async (id: string, field: string, value: unknown) => {
      // Optimistic
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
      );
      await supabase
        .from("services")
        .update({ [field]: value } as Record<string, unknown>)
        .eq("id", id);
    },
    []
  );

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Chargement…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold uppercase tracking-wider text-foreground">
            Gestion des <span className="text-primary">Services</span>
          </h2>
          <p className="text-xs text-muted-foreground">{rows.length} véhicule(s) en service</p>
        </div>
        <Button onClick={addRow} size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> Ajouter
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          Aucun véhicule en service. Cliquez sur "Ajouter" pour commencer.
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-auto rounded-xl border">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-2 text-left font-bold uppercase tracking-wide text-[10px] w-[100px]">Immat</th>
                  <th className="p-2 text-left font-bold uppercase tracking-wide text-[10px] w-[100px]">Entrée</th>
                  <th className="p-2 text-left font-bold uppercase tracking-wide text-[10px] w-[100px]">Sortie</th>
                  <th colSpan={2} className="p-2 text-center font-bold uppercase tracking-wide text-[10px] border-l bg-blue-500/5">
                    🔧 Mécanique
                  </th>
                  <th colSpan={2} className="p-2 text-center font-bold uppercase tracking-wide text-[10px] border-l bg-orange-500/5">
                    🎨 Carrosserie
                  </th>
                  <th className="p-2 w-[40px]"></th>
                </tr>
                <tr className="bg-muted/30 text-[9px]">
                  <th colSpan={3}></th>
                  <th className="p-1 text-center border-l bg-blue-500/5">Chef</th>
                  <th className="p-1 text-center bg-blue-500/5">Mécanicien</th>
                  <th className="p-1 text-center border-l bg-orange-500/5">Chef</th>
                  <th className="p-1 text-center bg-orange-500/5">Mécanicien</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <DesktopRow key={row.id} row={row} onUpdate={updateField} onDelete={deleteRow} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {rows.map((row) => (
              <ServiceCardMobile key={row.id} row={row} onUpdate={updateField} onDelete={deleteRow} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ────────── Desktop Row ────────── */
function DesktopRow({
  row,
  onUpdate,
  onDelete,
}: {
  row: ServiceRow;
  onUpdate: (id: string, field: string, value: unknown) => void;
  onDelete: (id: string) => void;
}) {
  const [fullscreen, setFullscreen] = useState<null | string>(null);

  const toggle = (field: string, current: string[], item: string) => {
    const next = current.includes(item)
      ? current.filter((s) => s !== item)
      : [...current, item];
    onUpdate(row.id, field, next);
  };

  const notesMap: Record<string, { value: string; field: string }> = {
    meca_chef: { value: row.mecanique_notes_chef, field: "mecanique_notes_chef" },
    meca_meca: { value: row.mecanique_notes_meca, field: "mecanique_notes_meca" },
    carro_chef: { value: row.carrosserie_notes_chef, field: "carrosserie_notes_chef" },
    carro_meca: { value: row.carrosserie_notes_meca, field: "carrosserie_notes_meca" },
  };

  return (
    <>
      {fullscreen && notesMap[fullscreen] && (
        <FullscreenModal
          title={fullscreen.replace("_", " ")}
          value={notesMap[fullscreen].value}
          onChange={(v) => onUpdate(row.id, notesMap[fullscreen].field, v)}
          onClose={() => setFullscreen(null)}
        />
      )}
      <tr className="border-b align-top hover:bg-muted/20">
        {/* Immat */}
        <td className="p-2">
          <Input
            value={row.immatriculation}
            onChange={(e) => onUpdate(row.id, "immatriculation", e.target.value)}
            placeholder="XX-000-XX"
            className="h-7 text-[11px] font-bold border-none shadow-none bg-transparent p-0"
          />
        </td>
        {/* Entrée */}
        <td className="p-2">
          <Input
            type="date"
            value={row.date_entree}
            onChange={(e) => onUpdate(row.id, "date_entree", e.target.value)}
            className="h-7 text-[11px] border-none shadow-none bg-transparent p-0"
          />
        </td>
        {/* Sortie */}
        <td className="p-2">
          <Input
            type="date"
            value={row.date_sortie}
            onChange={(e) => onUpdate(row.id, "date_sortie", e.target.value)}
            className="h-7 text-[11px] border-none shadow-none bg-transparent p-0"
          />
        </td>

        {/* Mécanique Chef */}
        <td className="p-2 border-l bg-blue-500/[0.02] min-w-[160px]">
          <div className="space-y-0.5">
            {MECANIQUE_SERVICES.map((s) => (
              <label key={s} className="flex items-center gap-1 cursor-pointer">
                <Checkbox
                  checked={row.mecanique_taches.includes(s)}
                  onCheckedChange={() => toggle("mecanique_taches", row.mecanique_taches, s)}
                  className="h-3 w-3"
                />
                <span className={`text-[10px] ${row.mecanique_taches.includes(s) ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                  {s}
                </span>
              </label>
            ))}
          </div>
          <div className="mt-1.5 relative">
            <Textarea
              value={row.mecanique_notes_chef}
              onChange={(e) => onUpdate(row.id, "mecanique_notes_chef", e.target.value)}
              placeholder="Notes…"
              className="min-h-[30px] text-[10px] pr-6 resize-none"
            />
            <button onClick={() => setFullscreen("meca_chef")} className="absolute right-0.5 top-0.5 p-0.5 rounded hover:bg-muted">
              <Maximize2 className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        </td>

        {/* Mécanique Mécanicien */}
        <td className="p-2 bg-blue-500/[0.02] min-w-[160px]">
          <div className="space-y-0.5">
            {row.mecanique_taches.length === 0 ? (
              <p className="text-[10px] text-muted-foreground italic">—</p>
            ) : (
              row.mecanique_taches.map((s) => (
                <label key={s} className="flex items-center gap-1 cursor-pointer">
                  <Checkbox
                    checked={row.mecanique_validees.includes(s)}
                    onCheckedChange={() => toggle("mecanique_validees", row.mecanique_validees, s)}
                    className="h-3 w-3"
                  />
                  <span className={`text-[10px] ${row.mecanique_validees.includes(s) ? "text-green-600 line-through" : "text-foreground"}`}>
                    {s}
                  </span>
                </label>
              ))
            )}
          </div>
          <div className="mt-1.5 relative">
            <Textarea
              value={row.mecanique_notes_meca}
              onChange={(e) => onUpdate(row.id, "mecanique_notes_meca", e.target.value)}
              placeholder="Notes…"
              className="min-h-[30px] text-[10px] pr-6 resize-none"
            />
            <button onClick={() => setFullscreen("meca_meca")} className="absolute right-0.5 top-0.5 p-0.5 rounded hover:bg-muted">
              <Maximize2 className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        </td>

        {/* Carrosserie Chef */}
        <td className="p-2 border-l bg-orange-500/[0.02] min-w-[160px]">
          <div className="space-y-0.5">
            {CARROSSERIE_SERVICES.map((s) => (
              <label key={s} className="flex items-center gap-1 cursor-pointer">
                <Checkbox
                  checked={row.carrosserie_taches.includes(s)}
                  onCheckedChange={() => toggle("carrosserie_taches", row.carrosserie_taches, s)}
                  className="h-3 w-3"
                />
                <span className={`text-[10px] ${row.carrosserie_taches.includes(s) ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                  {s}
                </span>
              </label>
            ))}
          </div>
          <div className="mt-1.5 relative">
            <Textarea
              value={row.carrosserie_notes_chef}
              onChange={(e) => onUpdate(row.id, "carrosserie_notes_chef", e.target.value)}
              placeholder="Notes…"
              className="min-h-[30px] text-[10px] pr-6 resize-none"
            />
            <button onClick={() => setFullscreen("carro_chef")} className="absolute right-0.5 top-0.5 p-0.5 rounded hover:bg-muted">
              <Maximize2 className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        </td>

        {/* Carrosserie Mécanicien */}
        <td className="p-2 bg-orange-500/[0.02] min-w-[160px]">
          <div className="space-y-0.5">
            {row.carrosserie_taches.length === 0 ? (
              <p className="text-[10px] text-muted-foreground italic">—</p>
            ) : (
              row.carrosserie_taches.map((s) => (
                <label key={s} className="flex items-center gap-1 cursor-pointer">
                  <Checkbox
                    checked={row.carrosserie_validees.includes(s)}
                    onCheckedChange={() => toggle("carrosserie_validees", row.carrosserie_validees, s)}
                    className="h-3 w-3"
                  />
                  <span className={`text-[10px] ${row.carrosserie_validees.includes(s) ? "text-green-600 line-through" : "text-foreground"}`}>
                    {s}
                  </span>
                </label>
              ))
            )}
          </div>
          <div className="mt-1.5 relative">
            <Textarea
              value={row.carrosserie_notes_meca}
              onChange={(e) => onUpdate(row.id, "carrosserie_notes_meca", e.target.value)}
              placeholder="Notes…"
              className="min-h-[30px] text-[10px] pr-6 resize-none"
            />
            <button onClick={() => setFullscreen("carro_meca")} className="absolute right-0.5 top-0.5 p-0.5 rounded hover:bg-muted">
              <Maximize2 className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        </td>

        <td className="p-2">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDelete(row.id)}>
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </td>
      </tr>
    </>
  );
}
