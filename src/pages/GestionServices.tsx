import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Maximize2, X, ChevronDown, Check, Camera, Image } from "lucide-react";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
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

const CARROSSERIE_PARTS = [
  "PC Avant", "Capot", "Aile AV G", "Aile AV D", "Toit",
  "Porte AV G", "Porte AV D", "Porte Arr G", "Porte Arr D",
  "Hayon", "Aile Arr G", "Aile Arr D", "PC Arr", "Pare Brise",
  "Bas de Caisse D", "Bas de Caisse G", "Rétros", "Jantes",
];

const CARROSSERIE_WORK_TYPES = ["Peint.", "Tolerie", "MO", "DSP", "Lust."];

type ValidationMap = Record<string, "ok" | "nok">;

function calcProgress(row: ServiceRow): { done: number; total: number; percent: number } {
  const allTasks: string[] = [];
  const allValidations: ValidationMap = {};
  if (row.has_mecanique) {
    allTasks.push(...row.mecanique_taches);
    Object.assign(allValidations, row.mecanique_validees);
  }
  if (row.has_carrosserie) {
    allTasks.push(...row.carrosserie_taches);
    Object.assign(allValidations, row.carrosserie_validees);
  }
  const total = allTasks.length;
  if (total === 0) return { done: 0, total: 0, percent: 0 };
  const done = allTasks.filter((t) => allValidations[t] === "ok").length;
  return { done, total, percent: Math.round((done / total) * 100) };
}

function ProgressBar({ row }: { row: ServiceRow }) {
  const { done, total, percent } = calcProgress(row);
  if (total === 0) return null;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-500"
          style={{
            width: `${percent}%`,
            boxShadow: percent > 0 ? "0 0 6px 1px rgba(34,197,94,0.5), 0 0 12px 2px rgba(34,197,94,0.25)" : "none",
          }}
        />
      </div>
      <span className={`text-[9px] font-bold tabular-nums ${percent === 100 ? "text-green-600" : "text-muted-foreground"}`}>
        {percent}%
      </span>
      <span className="text-[8px] text-muted-foreground">({done}/{total})</span>
    </div>
  );
}

/* ────────── Status Pastille ────────── */
function hasNok(row: ServiceRow): boolean {
  const check = (validations: ValidationMap) => Object.values(validations).some((v) => v === "nok");
  return (row.has_mecanique && check(row.mecanique_validees)) || (row.has_carrosserie && check(row.carrosserie_validees));
}

function StatusPastille({ row, isAdmin, onUpdate }: { row: ServiceRow; isAdmin: boolean; onUpdate: (id: string, field: string, value: unknown) => void }) {
  const { percent } = calcProgress(row);
  const problem = hasNok(row);

  // 4 states: probleme, en cours, à vérifier, fait
  const state = problem ? "probleme" : row.a_verifier ? "fait" : percent >= 100 ? "a_verifier" : "en_cours";

  const colors = {
    probleme: "bg-red-500 border-red-600 animate-pulse-glow-red",
    en_cours: "bg-amber-500 border-amber-600",
    a_verifier: "bg-amber-400 border-amber-500 animate-pulse-glow-amber",
    fait: "bg-green-500 border-green-600 shadow-[0_0_8px_2px_rgba(34,197,94,0.5)]",
  };
  const labels = { probleme: "Problème !", en_cours: "En cours", a_verifier: "À vérifier", fait: "Fait ✓" };

  const canToggle = isAdmin && (state === "a_verifier" || state === "fait");

  return (
    <div className="flex items-center gap-1.5">
      {canToggle ? (
        <button
          onClick={() => onUpdate(row.id, "a_verifier", !row.a_verifier)}
          className={`h-3.5 w-3.5 rounded-full border-2 transition-all ${colors[state]}`}
          title={state === "a_verifier" ? "Marquer comme fait" : "Remettre à vérifier"}
        />
      ) : (
        <div className={`h-3.5 w-3.5 rounded-full border-2 ${colors[state]}`} />
      )}
      <span className={`text-[9px] font-medium ${
        state === "probleme" ? "text-red-500" : state === "fait" ? "text-green-600" : state === "a_verifier" ? "text-amber-500" : "text-muted-foreground"
      }`}>{labels[state]}</span>
    </div>
  );
}
type ServiceRow = {
  id: string;
  modele: string;
  immatriculation: string;
  prenom: string;
  date_entree: string;
  date_sortie: string;
  kilometrage: string;
  a_verifier: boolean;
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
  mecanique_photos: string[];
  carrosserie_photos: string[];
};

function toStringArray(val: Json | undefined): string[] {
  if (Array.isArray(val)) return val.filter((v): v is string => typeof v === "string");
  return [];
}

function toValidationMap(val: Json | undefined): ValidationMap {
  if (val && typeof val === "object" && !Array.isArray(val)) {
    const map: ValidationMap = {};
    for (const [k, v] of Object.entries(val)) {
      if (v === "ok" || v === "nok") map[k] = v;
    }
    return map;
  }
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
function FullscreenModal({ title, value, onChange, onClose, readOnly }: { title: string; value: string; onChange: (v: string) => void; onClose: () => void; readOnly?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-xl border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        <Textarea className="min-h-[300px] text-sm" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Notes…" readOnly={readOnly} />
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
  tasks, validations, onSetStatus, readOnly,
}: { tasks: string[]; validations: ValidationMap; onSetStatus: (task: string, status: "ok" | "nok" | null) => void; readOnly?: boolean }) {
  if (tasks.length === 0) return <p className="text-[10px] text-muted-foreground italic">—</p>;
  return (
    <div className="space-y-px">
      {tasks.map((s) => {
        const status = validations[s] || null;
        return (
          <div key={s} className="flex items-center gap-1 py-px">
            <button
              onClick={() => !readOnly && onSetStatus(s, status === "ok" ? null : "ok")}
              disabled={readOnly}
              className={`flex-shrink-0 h-4 w-4 rounded-sm flex items-center justify-center border transition-colors ${
                status === "ok"
                  ? "bg-green-500 border-green-600 text-white"
                  : "border-muted-foreground/30 hover:border-green-400 text-transparent hover:text-green-400"
              } ${readOnly ? "opacity-50 cursor-not-allowed" : ""}`}
              title="Validé"
            >
              <Check className="h-2.5 w-2.5" />
            </button>
            <button
              onClick={() => !readOnly && onSetStatus(s, status === "nok" ? null : "nok")}
              disabled={readOnly}
              className={`flex-shrink-0 h-4 w-4 rounded-sm flex items-center justify-center border transition-colors ${
                status === "nok"
                  ? "bg-destructive border-destructive text-white"
                  : "border-muted-foreground/30 hover:border-destructive text-transparent hover:text-destructive"
              } ${readOnly ? "opacity-50 cursor-not-allowed" : ""}`}
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
function NotesField({ value, onChange, onSave, placeholder, fullscreenTitle, readOnly }: { value: string; onChange: (v: string) => void; onSave: () => void; placeholder: string; fullscreenTitle: string; readOnly?: boolean }) {
  const [fs, setFs] = useState(false);
  return (
    <>
      {fs && <FullscreenModal title={fullscreenTitle} value={value} onChange={onChange} onClose={() => { setFs(false); onSave(); }} readOnly={readOnly} />}
      <div className="relative">
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} onBlur={onSave} placeholder={placeholder} className="min-h-[28px] text-[10px] pr-6 resize-none" readOnly={readOnly} />
        <button onClick={() => setFs(true)} className="absolute right-0.5 top-0.5 p-0.5 rounded hover:bg-muted">
          <Maximize2 className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    </>
  );
}

/* ────────── Chef section (Mécanique) ────────── */
function ChefSection({ allServices, selected, onToggle, notes, onNotesChange, onSave, label, readOnly }: {
  allServices: string[]; selected: string[]; onToggle: (s: string) => void;
  notes: string; onNotesChange: (v: string) => void; onSave: () => void; label: string; readOnly?: boolean;
}) {
  return (
    <div className="space-y-1">
      {readOnly ? (
        selected.length > 0 ? null : <p className="text-[10px] text-muted-foreground italic">—</p>
      ) : (
        <TaskDropdown allServices={allServices} selected={selected} onToggle={onToggle} label={label} />
      )}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-0.5">
          {selected.map((s) => (
            <span key={s} className="inline-block rounded bg-primary/10 px-1 py-px text-[8px] font-medium text-primary">{s}</span>
          ))}
        </div>
      )}
      <NotesField value={notes} onChange={onNotesChange} onSave={onSave} placeholder="Notes chef…" fullscreenTitle={`${label} – Notes Chef`} readOnly={readOnly} />
    </div>
  );
}

/* ────────── Carrosserie Chef Section (two-step: Part → Work Type) ────────── */
function CarrosserieChefSection({ selected, onAddTask, onRemoveTask, notes, onNotesChange, onSave, readOnly }: {
  selected: string[]; onAddTask: (task: string) => void; onRemoveTask: (task: string) => void;
  notes: string; onNotesChange: (v: string) => void; onSave: () => void; readOnly?: boolean;
}) {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  const handlePartSelect = (part: string) => {
    setSelectedPart(part);
  };

  const handleWorkTypeSelect = (workType: string) => {
    if (!selectedPart) return;
    const task = `${selectedPart} – ${workType}`;
    if (!selected.includes(task)) {
      onAddTask(task);
    }
    setSelectedPart(null);
  };

  return (
    <div className="space-y-1.5">
      {!readOnly && (
        <div className="space-y-1">
          {/* Step 1: Part selection */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 w-full justify-between px-2 border-orange-400/50 hover:border-orange-400">
                <span className="truncate">{selectedPart ? `📍 ${selectedPart}` : "① Choisir un élément…"}</span>
                <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52 max-h-72 overflow-auto">
              <DropdownMenuLabel className="text-[10px] text-orange-600">Élément du véhicule</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {CARROSSERIE_PARTS.map((part) => (
                <DropdownMenuCheckboxItem
                  key={part}
                  checked={selectedPart === part}
                  onCheckedChange={() => handlePartSelect(part)}
                  className="text-[11px] cursor-pointer"
                >
                  {part}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Step 2: Work type (only visible after part selected) */}
          {selectedPart && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 w-full justify-between px-2 border-orange-500 bg-orange-500/5 hover:bg-orange-500/10 animate-pulse">
                  <span className="truncate">② Tâche pour <b>{selectedPart}</b></span>
                  <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel className="text-[10px] text-orange-600">{selectedPart}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {CARROSSERIE_WORK_TYPES.map((wt) => {
                  const task = `${selectedPart} – ${wt}`;
                  const alreadyAdded = selected.includes(task);
                  return (
                    <DropdownMenuCheckboxItem
                      key={wt}
                      checked={alreadyAdded}
                      onCheckedChange={() => {
                        if (alreadyAdded) onRemoveTask(task);
                        else handleWorkTypeSelect(wt);
                      }}
                      className="text-[11px] cursor-pointer"
                    >
                      {wt}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      {/* Display selected tasks as chips */}
      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-0.5">
          {selected.map((s) => (
            <span key={s} className="inline-flex items-center gap-0.5 rounded bg-orange-500/10 px-1.5 py-0.5 text-[8px] font-medium text-orange-700">
              {s}
              {!readOnly && (
                <button onClick={() => onRemoveTask(s)} className="ml-0.5 hover:text-destructive">
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </span>
          ))}
        </div>
      ) : (
        readOnly && <p className="text-[10px] text-muted-foreground italic">—</p>
      )}

      <NotesField value={notes} onChange={onNotesChange} onSave={onSave} placeholder="Notes chef…" fullscreenTitle="Carrosserie – Notes Chef" readOnly={readOnly} />
    </div>
  );
}

/* ────────── Photo Upload ────────── */
function PhotoUpload({ photos, serviceId, field, onUpdate, readOnly }: {
  photos: string[]; serviceId: string; field: string;
  onUpdate: (id: string, field: string, value: unknown) => void; readOnly?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [viewPhoto, setViewPhoto] = useState<string | null>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const newPhotos = [...photos];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${serviceId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("service-photos").upload(path, file);
      if (error) { toast.error("Erreur upload photo"); continue; }
      const { data } = supabase.storage.from("service-photos").getPublicUrl(path);
      newPhotos.push(data.publicUrl);
    }
    onUpdate(serviceId, field, newPhotos);
    setUploading(false);
    e.target.value = "";
  };

  const removePhoto = async (url: string) => {
    if (readOnly) return;
    const path = url.split("/service-photos/")[1];
    if (path) await supabase.storage.from("service-photos").remove([path]);
    onUpdate(serviceId, field, photos.filter((p) => p !== url));
  };

  return (
    <>
      {viewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setViewPhoto(null)}>
          <div className="relative max-w-3xl max-h-[90vh]">
            <button onClick={() => setViewPhoto(null)} className="absolute -top-3 -right-3 bg-card rounded-full p-1 shadow border">
              <X className="h-4 w-4" />
            </button>
            <img src={viewPhoto} alt="Photo" className="max-h-[85vh] rounded-lg object-contain" />
          </div>
        </div>
      )}
      <div className="space-y-1">
        {photos.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {photos.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} alt="" className="h-10 w-10 rounded object-cover cursor-pointer border" onClick={() => setViewPhoto(url)} />
                {!readOnly && (
                  <button onClick={() => removePhoto(url)}
                    className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-2 w-2" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {!readOnly && (
          <div className="flex gap-1">
            <button
              type="button"
              disabled={uploading}
              onClick={() => galleryRef.current?.click()}
              className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-dashed cursor-pointer hover:bg-muted/30 transition-colors ${uploading ? "opacity-50 pointer-events-none" : "text-muted-foreground"}`}
            >
              <Image className="h-3 w-3" />
              {uploading ? "Envoi…" : "Galerie"}
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={() => cameraRef.current?.click()}
              className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-dashed cursor-pointer hover:bg-muted/30 transition-colors ${uploading ? "opacity-50 pointer-events-none" : "text-muted-foreground"}`}
            >
              <Camera className="h-3 w-3" />
              Caméra
            </button>
            <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleUpload} />
          </div>
        )}
      </div>
    </>
  );
}

/* ────────── Technicien section ────────── */
function TechSection({ tasks, validations, onSetStatus, notes, onNotesChange, onSave, label, photos, serviceId, photosField, onUpdate, readOnly }: {
  tasks: string[]; validations: ValidationMap; onSetStatus: (task: string, status: "ok" | "nok" | null) => void;
  notes: string; onNotesChange: (v: string) => void; onSave: () => void; label: string;
  photos: string[]; serviceId: string; photosField: string;
  onUpdate: (id: string, field: string, value: unknown) => void; readOnly?: boolean;
}) {
  return (
    <div className="space-y-1">
      <ValidationTaskList tasks={tasks} validations={validations} onSetStatus={onSetStatus} readOnly={readOnly} />
      <NotesField value={notes} onChange={onNotesChange} onSave={onSave} placeholder="Notes technicien…" fullscreenTitle={`${label} – Notes Technicien`} readOnly={readOnly} />
      <PhotoUpload photos={photos} serviceId={serviceId} field={photosField} onUpdate={onUpdate} readOnly={readOnly} />
    </div>
  );
}

/* ────────── Service Card (mobile) ────────── */
function ServiceCardMobile({ row, onUpdate, onDelete, isAdmin }: { row: ServiceRow; onUpdate: (id: string, field: string, value: unknown) => void; onDelete: (id: string) => void; isAdmin: boolean }) {
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
      <div className="flex items-center gap-1 bg-muted/30 px-2 py-1.5">
        <Input value={row.modele} onChange={(e) => onUpdate(row.id, "modele", e.target.value)}
          placeholder="Modèle" className="h-7 text-[11px] flex-1 bg-transparent border-none shadow-none min-w-0" readOnly={!isAdmin} />
        <Input value={row.immatriculation} onChange={(e) => onUpdate(row.id, "immatriculation", e.target.value)}
          placeholder="Immat" className="h-7 text-[11px] font-bold flex-1 bg-transparent border-none shadow-none min-w-0" readOnly={!isAdmin} />
        <Input value={row.prenom} onChange={(e) => onUpdate(row.id, "prenom", e.target.value)}
          placeholder="Prénom" className="h-7 text-[11px] flex-1 min-w-0 border-2 border-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)] rounded-md bg-transparent" />
        {isAdmin && (
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => onDelete(row.id)}>
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-px bg-border">
        <div className="bg-card p-1.5">
          <p className="text-[9px] text-muted-foreground uppercase mb-0.5">Entrée</p>
          <Input type="date" value={row.date_entree} onChange={(e) => onUpdate(row.id, "date_entree", e.target.value)}
            className="h-6 text-[11px] border-none shadow-none bg-transparent p-0" readOnly={!isAdmin} />
        </div>
        <div className="bg-card p-1.5">
          <p className="text-[9px] text-muted-foreground uppercase mb-0.5">Sortie</p>
          <Input type="date" value={row.date_sortie} onChange={(e) => onUpdate(row.id, "date_sortie", e.target.value)}
            className="h-6 text-[11px] border-none shadow-none bg-transparent p-0" readOnly={!isAdmin} />
        </div>
        <div className="bg-card p-1.5">
          <p className="text-[9px] text-muted-foreground uppercase mb-0.5">Km</p>
          <Input value={row.kilometrage} onChange={(e) => onUpdate(row.id, "kilometrage", e.target.value)}
            placeholder="km" className="h-6 text-[11px] border-none shadow-none bg-transparent p-0" readOnly={!isAdmin} />
        </div>
      </div>

      {/* Pastille + Progress */}
      <div className="px-2 py-1 border-t bg-muted/10 flex items-center gap-3">
        <StatusPastille row={row} isAdmin={isAdmin} onUpdate={onUpdate} />
        <div className="flex-1"><ProgressBar row={row} /></div>
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
                onSave={() => {}} label="Mécanique" readOnly={!isAdmin} />
            </div>
            <div className="bg-card p-1.5">
              <p className="text-[8px] text-muted-foreground uppercase mb-0.5 font-semibold">Technicien</p>
              <TechSection tasks={row.mecanique_taches} validations={row.mecanique_validees}
                onSetStatus={(t, s) => setValidation("mecanique_validees", row.mecanique_validees, t, s)}
                notes={row.mecanique_notes_meca} onNotesChange={(v) => onUpdate(row.id, "mecanique_notes_meca", v)}
                onSave={() => {}} label="Mécanique"
                photos={row.mecanique_photos} serviceId={row.id} photosField="mecanique_photos" onUpdate={onUpdate} />
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
              <CarrosserieChefSection selected={row.carrosserie_taches}
                onAddTask={(task) => { const next = [...row.carrosserie_taches, task]; onUpdate(row.id, "carrosserie_taches", next); }}
                onRemoveTask={(task) => { const next = row.carrosserie_taches.filter((t) => t !== task); onUpdate(row.id, "carrosserie_taches", next); }}
                notes={row.carrosserie_notes_chef} onNotesChange={(v) => onUpdate(row.id, "carrosserie_notes_chef", v)}
                onSave={() => {}} readOnly={!isAdmin} />
            </div>
            <div className="bg-card p-1.5">
              <p className="text-[8px] text-muted-foreground uppercase mb-0.5 font-semibold">Technicien</p>
              <TechSection tasks={row.carrosserie_taches} validations={row.carrosserie_validees}
                onSetStatus={(t, s) => setValidation("carrosserie_validees", row.carrosserie_validees, t, s)}
                notes={row.carrosserie_notes_meca} onNotesChange={(v) => onUpdate(row.id, "carrosserie_notes_meca", v)}
                onSave={() => {}} label="Carrosserie"
                photos={row.carrosserie_photos} serviceId={row.id} photosField="carrosserie_photos" onUpdate={onUpdate} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────── Main Page ────────── */
export default function GestionServices() {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const fetchRows = useCallback(async () => {
    const { data, error } = await supabase.from("services").select("*").order("created_at", { ascending: true });
    if (error) { toast.error("Erreur chargement services"); return; }
    setRows(
      (data || []).map((d) => ({
        ...d,
        kilometrage: (d as Record<string, unknown>).kilometrage as string ?? "",
        a_verifier: (d as Record<string, unknown>).a_verifier === true,
        mecanique_taches: toStringArray(d.mecanique_taches as Json),
        mecanique_validees: toValidationMap(d.mecanique_validees as Json),
        carrosserie_taches: toStringArray(d.carrosserie_taches as Json),
        carrosserie_validees: toValidationMap(d.carrosserie_validees as Json),
        mecanique_photos: toStringArray(d.mecanique_photos as Json),
        carrosserie_photos: toStringArray(d.carrosserie_photos as Json),
        has_mecanique: (d as Record<string, unknown>).has_mecanique !== false,
        has_carrosserie: (d as Record<string, unknown>).has_carrosserie !== false,
      }))
    );
    setLoading(false);
  }, []);

  const skipNextRefetch = useRef(false);
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    fetchRows();
    const channel = supabase
      .channel("services-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "services" }, () => {
        if (skipNextRefetch.current) {
          skipNextRefetch.current = false;
          return;
        }
        fetchRows();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchRows]);

  const addRow = async (hasMeca: boolean, hasCarro: boolean) => {
    if (!isAdmin) return;
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
    if (!isAdmin) return;
    if (!confirm("Supprimer cette ligne ?")) return;
    await supabase.from("services").delete().eq("id", id);
    fetchRows();
  };

  // Technicien can only update: prenom, *_validees, *_notes_meca, *_photos
  const TECH_ALLOWED_FIELDS = [
    "prenom",
    "mecanique_validees", "carrosserie_validees",
    "mecanique_notes_meca", "carrosserie_notes_meca",
    "mecanique_photos", "carrosserie_photos",
  ];

  const updateField = useCallback(async (id: string, field: string, value: unknown) => {
    if (!isAdmin && !TECH_ALLOWED_FIELDS.includes(field)) return;
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    
    // Debounce DB save for text fields to avoid resetting input on every keystroke
    const key = `${id}-${field}`;
    if (debounceTimers.current[key]) clearTimeout(debounceTimers.current[key]);
    debounceTimers.current[key] = setTimeout(async () => {
      skipNextRefetch.current = true;
      await supabase.from("services").update({ [field]: value } as Record<string, unknown>).eq("id", id);
      delete debounceTimers.current[key];
    }, 500);
  }, [isAdmin]);

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
        {isAdmin && (
          <Button onClick={() => setShowAddDialog(true)} size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          Aucun véhicule en service.{isAdmin ? ' Cliquez sur "Ajouter" pour commencer.' : ""}
        </div>
      ) : (
        <>
          {/* Desktop - Grid of 4 cards */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-3">
            {rows.map((row) => (
              <ServiceCardMobile key={row.id} row={row} onUpdate={updateField} onDelete={deleteRow} isAdmin={isAdmin} />
            ))}
          </div>

          {/* Mobile */}
          <div className="lg:hidden space-y-3">
            {rows.map((row) => (
              <ServiceCardMobile key={row.id} row={row} onUpdate={updateField} onDelete={deleteRow} isAdmin={isAdmin} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ────────── Desktop Row ────────── */
function DesktopRow({ row, onUpdate, onDelete, showMeca, showCarro, isAdmin }: {
  row: ServiceRow; onUpdate: (id: string, field: string, value: unknown) => void; onDelete: (id: string) => void;
  showMeca: boolean; showCarro: boolean; isAdmin: boolean;
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
        <Input value={row.modele} onChange={(e) => onUpdate(row.id, "modele", e.target.value)}
          placeholder="Modèle" className="h-6 text-[11px] border-none shadow-none bg-transparent p-0" readOnly={!isAdmin} />
      </td>
      <td className="p-1.5">
        <Input value={row.immatriculation} onChange={(e) => onUpdate(row.id, "immatriculation", e.target.value)}
          placeholder="XX-000-XX" className="h-6 text-[11px] font-bold border-none shadow-none bg-transparent p-0" readOnly={!isAdmin} />
      </td>
      <td className="p-1.5">
        <Input value={row.prenom} onChange={(e) => onUpdate(row.id, "prenom", e.target.value)}
          placeholder="Prénom" className="h-6 text-[11px] border-2 border-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)] rounded-md bg-transparent p-0" />
      </td>
      <td className="p-1.5">
        <Input value={row.kilometrage} onChange={(e) => onUpdate(row.id, "kilometrage", e.target.value)}
          placeholder="km" className="h-6 text-[11px] border-none shadow-none bg-transparent p-0" readOnly={!isAdmin} />
      </td>
      <td className="p-1.5">
        <Input type="date" value={row.date_entree} onChange={(e) => onUpdate(row.id, "date_entree", e.target.value)}
          className="h-6 text-[11px] border-none shadow-none bg-transparent p-0" readOnly={!isAdmin} />
      </td>
      <td className="p-1.5">
        <Input type="date" value={row.date_sortie} onChange={(e) => onUpdate(row.id, "date_sortie", e.target.value)}
          className="h-6 text-[11px] border-none shadow-none bg-transparent p-0" readOnly={!isAdmin} />
      </td>
      <td className="p-1.5 min-w-[70px]">
        <ProgressBar row={row} />
      </td>
      <td className="p-1.5 text-center">
        <StatusPastille row={row} isAdmin={isAdmin} onUpdate={onUpdate} />
      </td>

      {showMeca && (
        <>
          <td className="p-1.5 border-l bg-blue-500/[0.02] min-w-[140px]">
            {row.has_mecanique ? (
              <ChefSection allServices={MECANIQUE_SERVICES} selected={row.mecanique_taches}
                onToggle={(s) => toggleTask("mecanique_taches", row.mecanique_taches, s)}
                notes={row.mecanique_notes_chef} onNotesChange={(v) => onUpdate(row.id, "mecanique_notes_chef", v)}
                onSave={() => {}} label="Mécanique" readOnly={!isAdmin} />
            ) : <span className="text-[10px] text-muted-foreground italic">—</span>}
          </td>
          <td className="p-1.5 bg-blue-500/[0.02] min-w-[140px]">
            {row.has_mecanique ? (
              <TechSection tasks={row.mecanique_taches} validations={row.mecanique_validees}
                onSetStatus={(t, s) => setValidation("mecanique_validees", row.mecanique_validees, t, s)}
                notes={row.mecanique_notes_meca} onNotesChange={(v) => onUpdate(row.id, "mecanique_notes_meca", v)}
                onSave={() => {}} label="Mécanique"
                photos={row.mecanique_photos} serviceId={row.id} photosField="mecanique_photos" onUpdate={onUpdate} />
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
                onSave={() => {}} label="Carrosserie" readOnly={!isAdmin} />
            ) : <span className="text-[10px] text-muted-foreground italic">—</span>}
          </td>
          <td className="p-1.5 bg-orange-500/[0.02] min-w-[140px]">
            {row.has_carrosserie ? (
              <TechSection tasks={row.carrosserie_taches} validations={row.carrosserie_validees}
                onSetStatus={(t, s) => setValidation("carrosserie_validees", row.carrosserie_validees, t, s)}
                notes={row.carrosserie_notes_meca} onNotesChange={(v) => onUpdate(row.id, "carrosserie_notes_meca", v)}
                onSave={() => {}} label="Carrosserie"
                photos={row.carrosserie_photos} serviceId={row.id} photosField="carrosserie_photos" onUpdate={onUpdate} />
            ) : <span className="text-[10px] text-muted-foreground italic">—</span>}
          </td>
        </>
      )}

      {isAdmin && (
        <td className="p-1.5">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDelete(row.id)}>
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </td>
      )}
    </tr>
  );
}
