import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Maximize2, X, ChevronDown, Check, Ban } from "lucide-react";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const MECANIQUE_SERVICES = [
  "Diagnostique", "Vidange", "Freins", "Distribution", "Embrayage",
  "Suspension", "Direction", "Échappement", "Climatisation", "Électrique",
  "Courroie", "Démarreur", "Alternateur", "Batterie",
];

const CARROSSERIE_SERVICES = [
  "Peinture", "Débosselage", "Pare-chocs", "Aile", "Capot",
  "Portière", "Lustrage", "Vitrage", "Phares", "Rétroviseur",
];

// validees is now Record<string, "ok"|"nok"> stored as jsonb object
type ValidationMap = Record<string, "ok" | "nok">;

type ServiceRow = {
  id: string;
  modele: string;
  immatriculation: string;
  prenom: string;
  date_entree: string;
  date_sortie: string;
  mecanique_taches: string[];
  mecanique_validees: ValidationMap;
  mecanique_notes_chef: string;
  mecanique_notes_meca: string;
  carrosserie_taches: string[];
  carrosserie_validees: ValidationMap;
  carrosserie_notes_chef: string;
  carrosserie_notes_meca: string;
  has_mecanique: boolean;
  has_carrosserie: boolean;
};

function toStringArray(val: Json | undefined): string[] {
  if (Array.isArray(val)) return val.filter((v): v is string => typeof v === "string");
  return [];
}

function toValidationMap(val: Json | undefined): ValidationMap {
  // Support old format (string[]) and new format (object)
  if (val && typeof val === "object" && !Array.isArray(val)) {
    const map: ValidationMap = {};
    for (const [k, v] of Object.entries(val)) {
      if (v === "ok" || v === "nok") map[k] = v;
    }
    return map;
  }
  // Migrate old array format: treat as all "ok"
  if (Array.isArray(val)) {
    const map: ValidationMap = {};
    for (const v of val) {
      if (typeof v === "string") map[v] = "ok";
    }
    return map;
  }
  return {};
}

/* ────────── Add Dialog ────────── */
function AddServiceDialog({ onAdd, onClose }: { onAdd: (meca: boolean, carro: boolean) => void; onClose: () => void }) {
  const [meca, setMeca] = useState(true);
  const [carro, setCarro] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-xl border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Nouveau service</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Sections à inclure :</p>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer rounded-lg border p-3 hover:bg-muted/30 transition-colors">
            <Checkbox checked={meca} onCheckedChange={(v) => setMeca(!!v)} />
            <div>
              <span className="text-sm font-medium text-foreground">🔧 Mécanique</span>
              <p className="text-xs text-muted-foreground">Diagnostique, vidange, freins…</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer rounded-lg border p-3 hover:bg-muted/30 transition-colors">
            <Checkbox checked={carro} onCheckedChange={(v) => setCarro(!!v)} />
            <div>
              <span className="text-sm font-medium text-foreground">🎨 Carrosserie</span>
              <p className="text-xs text-muted-foreground">Peinture, débosselage, lustrage…</p>
            </div>
          </label>
        </div>
        <div className="mt-6 flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>Annuler</Button>
          <Button size="sm" disabled={!meca && !carro} onClick={() => { onAdd(meca, carro); onClose(); }}>Ajouter</Button>
        </div>
      </div>
    </div>
  );
}

/* ────────── Fullscreen Modal ────────── */
function FullscreenModal({ title, value, onChange, onClose }: { title: string; value: string; onChange: (v: string) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-xl border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        <Textarea className="min-h-[300px] text-sm" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Notes…" />
      </div>
    </div>
  );
}

/* ────────── Dropdown Task Selector (Chef) ────────── */
function TaskDropdown({ allServices, selected, onToggle, label }: { allServices: string[]; selected: string[]; onToggle: (s: string) => void; label: string }) {
  const count = selected.length;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1 w-full justify-between px-2">
          <span>{count > 0 ? `${count} tâche(s)` : `Sélectionner…`}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 max-h-64 overflow-auto">
        <DropdownMenuLabel className="text-[10px]">{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allServices.map((s) => (
          <DropdownMenuCheckboxItem key={s} checked={selected.includes(s)} onCheckedChange={() => onToggle(s)} className="text-[11px]">
            {s}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ────────── Validation buttons for technician ────────── */
function ValidationTaskList({
  tasks, validations, onSetStatus,
}: { tasks: string[]; validations: ValidationMap; onSetStatus: (task: string, status: "ok" | "nok" | null) => void }) {
  if (tasks.length === 0) return <p className="text-[10px] text-muted-foreground italic">—</p>;

  return (
    <div className="space-y-px">
      {tasks.map((s) => {
        const status = validations[s] || null;
        return (
          <div key={s} className="flex items-center gap-1 py-px">
            <button
              onClick={() => onSetStatus(s, status === "ok" ? null : "ok")}
              className={`flex-shrink-0 h-4 w-4 rounded-sm flex items-center justify-center border transition-colors ${
                status === "ok"
                  ? "bg-green-500 border-green-600 text-white"
                  : "border-muted-foreground/30 hover:border-green-400 text-transparent hover:text-green-400"
              }`}
              title="Validé"
            >
              <Check className="h-2.5 w-2.5" />
            </button>
            <button
              onClick={() => onSetStatus(s, status === "nok" ? null : "nok")}
              className={`flex-shrink-0 h-4 w-4 rounded-sm flex items-center justify-center border transition-colors ${
                status === "nok"
                  ? "bg-destructive border-destructive text-white"
                  : "border-muted-foreground/30 hover:border-destructive text-transparent hover:text-destructive"
              }`}
              title="Impossible"
            >
              <X className="h-2.5 w-2.5" />
            </button>
            <span className={`text-[10px] leading-tight ${
              status === "ok" ? "text-green-600 line-through" : status === "nok" ? "text-destructive line-through opacity-60" : "text-foreground"
            }`}>
              {s}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ────────── Notes with fullscreen ────────── */
function NotesField({ value, onChange, onSave, placeholder, fullscreenTitle }: { value: string; onChange: (v: string) => void; onSave: () => void; placeholder: string; fullscreenTitle: string }) {
  const [fs, setFs] = useState(false);
  return (
    <>
      {fs && <FullscreenModal title={fullscreenTitle} value={value} onChange={onChange} onClose={() => { setFs(false); onSave(); }} />}
      <div className="relative">
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} onBlur={onSave} placeholder={placeholder} className="min-h-[28px] text-[10px] pr-6 resize-none" />
        <button onClick={() => setFs(true)} className="absolute right-0.5 top-0.5 p-0.5 rounded hover:bg-muted">
          <Maximize2 className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    </>
  );
}

/* ────────── Chef section (dropdown + badges + notes) ────────── */
function ChefSection({ allServices, selected, onToggle, notes, onNotesChange, onSave, label }: {
  allServices: string[]; selected: string[]; onToggle: (s: string) => void;
  notes: string; onNotesChange: (v: string) => void; onSave: () => void; label: string;
}) {
  return (
    <div className="space-y-1">
      <TaskDropdown allServices={allServices} selected={selected} onToggle={onToggle} label={label} />
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-0.5">
          {selected.map((s) => (
            <span key={s} className="inline-block rounded bg-primary/10 px-1 py-px text-[8px] font-medium text-primary">{s}</span>
          ))}
        </div>
      )}
      <NotesField value={notes} onChange={onNotesChange} onSave={onSave} placeholder="Notes chef…" fullscreenTitle={`${label} – Notes Chef`} />
    </div>
  );
}

/* ────────── Technicien section (validate/reject + notes) ────────── */
function TechSection({ tasks, validations, onSetStatus, notes, onNotesChange, onSave, label }: {
  tasks: string[]; validations: ValidationMap; onSetStatus: (task: string, status: "ok" | "nok" | null) => void;
  notes: string; onNotesChange: (v: string) => void; onSave: () => void; label: string;
}) {
  return (
    <div className="space-y-1">
      <ValidationTaskList tasks={tasks} validations={validations} onSetStatus={onSetStatus} />
      <NotesField value={notes} onChange={onNotesChange} onSave={onSave} placeholder="Notes technicien…" fullscreenTitle={`${label} – Notes Technicien`} />
    </div>
  );
}

/* ────────── Service Card (mobile) ────────── */
function ServiceCardMobile({ row, onUpdate, onDelete }: { row: ServiceRow; onUpdate: (id: string, field: string, value: unknown) => void; onDelete: (id: string) => void }) {
  const toggleTask = (field: string, current: string[], item: string) => {
    const next = current.includes(item) ? current.filter((s) => s !== item) : [...current, item];
    onUpdate(row.id, field, next);
  };
  const setValidation = (field: string, current: ValidationMap, task: string, status: "ok" | "nok" | null) => {
    const next = { ...current };
    if (status === null) delete next[task]; else next[task] = status;
    onUpdate(row.id, field, next);
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5">
        <Input value={row.immatriculation} onChange={(e) => onUpdate(row.id, "immatriculation", e.target.value)}
          placeholder="Immat" className="h-7 text-xs font-bold flex-1 bg-transparent border-none shadow-none" />
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => onDelete(row.id)}>
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-px bg-border">
        <div className="bg-card p-1.5">
          <p className="text-[9px] text-muted-foreground uppercase mb-0.5">Entrée</p>
          <Input type="date" value={row.date_entree} onChange={(e) => onUpdate(row.id, "date_entree", e.target.value)}
            className="h-6 text-[11px] border-none shadow-none bg-transparent p-0" />
        </div>
        <div className="bg-card p-1.5">
          <p className="text-[9px] text-muted-foreground uppercase mb-0.5">Sortie</p>
          <Input type="date" value={row.date_sortie} onChange={(e) => onUpdate(row.id, "date_sortie", e.target.value)}
            className="h-6 text-[11px] border-none shadow-none bg-transparent p-0" />
        </div>
      </div>

      {row.has_mecanique && (
        <div className="border-t">
          <div className="px-3 py-1 bg-blue-500/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">🔧 Mécanique</p>
          </div>
          <div className="grid grid-cols-2 gap-px bg-border">
            <div className="bg-card p-1.5">
              <p className="text-[8px] text-muted-foreground uppercase mb-0.5 font-semibold">Chef</p>
              <ChefSection allServices={MECANIQUE_SERVICES} selected={row.mecanique_taches}
                onToggle={(s) => toggleTask("mecanique_taches", row.mecanique_taches, s)}
                notes={row.mecanique_notes_chef} onNotesChange={(v) => onUpdate(row.id, "mecanique_notes_chef", v)}
                onSave={() => {}} label="Mécanique" />
            </div>
            <div className="bg-card p-1.5">
              <p className="text-[8px] text-muted-foreground uppercase mb-0.5 font-semibold">Technicien</p>
              <TechSection tasks={row.mecanique_taches} validations={row.mecanique_validees}
                onSetStatus={(t, s) => setValidation("mecanique_validees", row.mecanique_validees, t, s)}
                notes={row.mecanique_notes_meca} onNotesChange={(v) => onUpdate(row.id, "mecanique_notes_meca", v)}
                onSave={() => {}} label="Mécanique" />
            </div>
          </div>
        </div>
      )}

      {row.has_carrosserie && (
        <div className="border-t">
          <div className="px-3 py-1 bg-orange-500/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">🎨 Carrosserie</p>
          </div>
          <div className="grid grid-cols-2 gap-px bg-border">
            <div className="bg-card p-1.5">
              <p className="text-[8px] text-muted-foreground uppercase mb-0.5 font-semibold">Chef</p>
              <ChefSection allServices={CARROSSERIE_SERVICES} selected={row.carrosserie_taches}
                onToggle={(s) => toggleTask("carrosserie_taches", row.carrosserie_taches, s)}
                notes={row.carrosserie_notes_chef} onNotesChange={(v) => onUpdate(row.id, "carrosserie_notes_chef", v)}
                onSave={() => {}} label="Carrosserie" />
            </div>
            <div className="bg-card p-1.5">
              <p className="text-[8px] text-muted-foreground uppercase mb-0.5 font-semibold">Technicien</p>
              <TechSection tasks={row.carrosserie_taches} validations={row.carrosserie_validees}
                onSetStatus={(t, s) => setValidation("carrosserie_validees", row.carrosserie_validees, t, s)}
                notes={row.carrosserie_notes_meca} onNotesChange={(v) => onUpdate(row.id, "carrosserie_notes_meca", v)}
                onSave={() => {}} label="Carrosserie" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────── Main Page ────────── */
export default function GestionServices() {
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const fetchRows = useCallback(async () => {
    const { data, error } = await supabase.from("services").select("*").order("created_at", { ascending: true });
    if (error) { toast.error("Erreur chargement services"); return; }
    setRows(
      (data || []).map((d) => ({
        ...d,
        mecanique_taches: toStringArray(d.mecanique_taches as Json),
        mecanique_validees: toValidationMap(d.mecanique_validees as Json),
        carrosserie_taches: toStringArray(d.carrosserie_taches as Json),
        carrosserie_validees: toValidationMap(d.carrosserie_validees as Json),
        has_mecanique: (d as Record<string, unknown>).has_mecanique !== false,
        has_carrosserie: (d as Record<string, unknown>).has_carrosserie !== false,
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

  const addRow = async (hasMeca: boolean, hasCarro: boolean) => {
    const insertData: Record<string, unknown> = {
      mecanique_validees: {},
      carrosserie_validees: {},
      has_mecanique: hasMeca,
      has_carrosserie: hasCarro,
    };
    const { error } = await supabase.from("services").insert(insertData);
    if (error) toast.error("Erreur ajout");
    else fetchRows();
  };

  const deleteRow = async (id: string) => {
    if (!confirm("Supprimer cette ligne ?")) return;
    await supabase.from("services").delete().eq("id", id);
    fetchRows();
  };

  const updateField = useCallback(async (id: string, field: string, value: unknown) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    await supabase.from("services").update({ [field]: value } as Record<string, unknown>).eq("id", id);
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Chargement…</div>;

  return (
    <div className="space-y-3">
      {showAddDialog && <AddServiceDialog onAdd={addRow} onClose={() => setShowAddDialog(false)} />}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold uppercase tracking-wider text-foreground">
            Gestion des <span className="text-primary">Services</span>
          </h2>
          <p className="text-xs text-muted-foreground">{rows.length} véhicule(s)</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> Ajouter
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          Aucun véhicule en service. Cliquez sur "Ajouter" pour commencer.
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden lg:block overflow-auto rounded-xl border">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-1.5 text-left font-bold uppercase tracking-wide text-[10px] w-[90px]">Immat</th>
                  <th className="p-1.5 text-left font-bold uppercase tracking-wide text-[10px] w-[90px]">Entrée</th>
                  <th className="p-1.5 text-left font-bold uppercase tracking-wide text-[10px] w-[90px]">Sortie</th>
                  {rows.some(r => r.has_mecanique) && (
                    <th colSpan={2} className="p-1.5 text-center font-bold uppercase tracking-wide text-[10px] border-l bg-blue-500/5">🔧 Mécanique</th>
                  )}
                  {rows.some(r => r.has_carrosserie) && (
                    <th colSpan={2} className="p-1.5 text-center font-bold uppercase tracking-wide text-[10px] border-l bg-orange-500/5">🎨 Carrosserie</th>
                  )}
                  <th className="p-1 w-[32px]"></th>
                </tr>
                <tr className="bg-muted/30 text-[9px]">
                  <th colSpan={3}></th>
                  {rows.some(r => r.has_mecanique) && (
                    <>
                      <th className="p-1 text-center border-l bg-blue-500/5">Chef</th>
                      <th className="p-1 text-center bg-blue-500/5">Technicien</th>
                    </>
                  )}
                  {rows.some(r => r.has_carrosserie) && (
                    <>
                      <th className="p-1 text-center border-l bg-orange-500/5">Chef</th>
                      <th className="p-1 text-center bg-orange-500/5">Technicien</th>
                    </>
                  )}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <DesktopRow key={row.id} row={row} onUpdate={updateField} onDelete={deleteRow}
                    showMeca={rows.some(r => r.has_mecanique)} showCarro={rows.some(r => r.has_carrosserie)} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
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
function DesktopRow({ row, onUpdate, onDelete, showMeca, showCarro }: {
  row: ServiceRow; onUpdate: (id: string, field: string, value: unknown) => void; onDelete: (id: string) => void;
  showMeca: boolean; showCarro: boolean;
}) {
  const toggleTask = (field: string, current: string[], item: string) => {
    const next = current.includes(item) ? current.filter((s) => s !== item) : [...current, item];
    onUpdate(row.id, field, next);
  };
  const setValidation = (field: string, current: ValidationMap, task: string, status: "ok" | "nok" | null) => {
    const next = { ...current };
    if (status === null) delete next[task]; else next[task] = status;
    onUpdate(row.id, field, next);
  };

  return (
    <tr className="border-b align-top hover:bg-muted/20">
      <td className="p-1.5">
        <Input value={row.immatriculation} onChange={(e) => onUpdate(row.id, "immatriculation", e.target.value)}
          placeholder="XX-000-XX" className="h-6 text-[11px] font-bold border-none shadow-none bg-transparent p-0" />
      </td>
      <td className="p-1.5">
        <Input type="date" value={row.date_entree} onChange={(e) => onUpdate(row.id, "date_entree", e.target.value)}
          className="h-6 text-[11px] border-none shadow-none bg-transparent p-0" />
      </td>
      <td className="p-1.5">
        <Input type="date" value={row.date_sortie} onChange={(e) => onUpdate(row.id, "date_sortie", e.target.value)}
          className="h-6 text-[11px] border-none shadow-none bg-transparent p-0" />
      </td>

      {showMeca && (
        <>
          <td className="p-1.5 border-l bg-blue-500/[0.02] min-w-[140px]">
            {row.has_mecanique ? (
              <ChefSection allServices={MECANIQUE_SERVICES} selected={row.mecanique_taches}
                onToggle={(s) => toggleTask("mecanique_taches", row.mecanique_taches, s)}
                notes={row.mecanique_notes_chef} onNotesChange={(v) => onUpdate(row.id, "mecanique_notes_chef", v)}
                onSave={() => {}} label="Mécanique" />
            ) : <span className="text-[10px] text-muted-foreground italic">—</span>}
          </td>
          <td className="p-1.5 bg-blue-500/[0.02] min-w-[140px]">
            {row.has_mecanique ? (
              <TechSection tasks={row.mecanique_taches} validations={row.mecanique_validees}
                onSetStatus={(t, s) => setValidation("mecanique_validees", row.mecanique_validees, t, s)}
                notes={row.mecanique_notes_meca} onNotesChange={(v) => onUpdate(row.id, "mecanique_notes_meca", v)}
                onSave={() => {}} label="Mécanique" />
            ) : <span className="text-[10px] text-muted-foreground italic">—</span>}
          </td>
        </>
      )}

      {showCarro && (
        <>
          <td className="p-1.5 border-l bg-orange-500/[0.02] min-w-[140px]">
            {row.has_carrosserie ? (
              <ChefSection allServices={CARROSSERIE_SERVICES} selected={row.carrosserie_taches}
                onToggle={(s) => toggleTask("carrosserie_taches", row.carrosserie_taches, s)}
                notes={row.carrosserie_notes_chef} onNotesChange={(v) => onUpdate(row.id, "carrosserie_notes_chef", v)}
                onSave={() => {}} label="Carrosserie" />
            ) : <span className="text-[10px] text-muted-foreground italic">—</span>}
          </td>
          <td className="p-1.5 bg-orange-500/[0.02] min-w-[140px]">
            {row.has_carrosserie ? (
              <TechSection tasks={row.carrosserie_taches} validations={row.carrosserie_validees}
                onSetStatus={(t, s) => setValidation("carrosserie_validees", row.carrosserie_validees, t, s)}
                notes={row.carrosserie_notes_meca} onNotesChange={(v) => onUpdate(row.id, "carrosserie_notes_meca", v)}
                onSave={() => {}} label="Carrosserie" />
            ) : <span className="text-[10px] text-muted-foreground italic">—</span>}
          </td>
        </>
      )}

      <td className="p-1.5">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDelete(row.id)}>
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </td>
    </tr>
  );
}
