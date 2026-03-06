import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, CalendarIcon, Car, Wrench, User, Tag, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { format, parse, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

type Vehicle = {
  id: string;
  immatriculation: string;
  entree: string;
  client: string;
  travaux: string;
  pieces: string;
  sortie: string;
};

const COLUMNS = [
  { key: "immatriculation", label: "Immatriculation", icon: Car },
  { key: "entree", label: "Entrée", icon: LogIn },
  { key: "client", label: "Client", icon: User },
  { key: "travaux", label: "Travaux", icon: Wrench },
  { key: "pieces", label: "Pièces", icon: Tag },
  { key: "sortie", label: "Sortie", icon: LogOut },
] as const;

type ColumnKey = (typeof COLUMNS)[number]["key"];

const DATE_COLUMNS: ColumnKey[] = ["entree", "sortie"];

const IMMAT_REGEX = /^[A-Za-z]{2}\s?\d{4}\s?[A-Za-z]{2}$/;

function formatImmatriculation(value: string): string {
  const clean = value.replace(/\s/g, "").toUpperCase();
  if (clean.length === 8) {
    return `${clean.slice(0, 2)} ${clean.slice(2, 6)} ${clean.slice(6, 8)}`;
  }
  return value.toUpperCase();
}

function parseDate(value: string): Date | undefined {
  if (!value) return undefined;
  const d = parse(value, "dd/MM/yyyy", new Date());
  return isValid(d) ? d : undefined;
}

function DateCell({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const date = parseDate(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-2 rounded-md bg-transparent px-3 py-2.5 text-left text-sm font-medium text-foreground outline-none transition-all duration-200 hover:bg-primary/5 focus:ring-2 focus:ring-ring",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-primary/60" />
          {date ? format(date, "dd/MM/yyyy") : <span>{placeholder}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-border shadow-automotive" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (d) onChange(format(d, "dd/MM/yyyy"));
          }}
          locale={fr}
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}

export function VehicleTable() {
  const [rows, setRows] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = useCallback(async () => {
    const { data, error } = await supabase
      .from("vehicules")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      toast.error("Erreur de chargement");
      return;
    }
    setRows(
      (data ?? []).map((d) => ({
        id: d.id,
        immatriculation: d.immatriculation ?? "",
        entree: d.entree ?? "",
        client: d.client ?? "",
        travaux: d.travaux ?? "",
        pieces: d.pieces ?? "",
        sortie: d.sortie ?? "",
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRows();

    const channel = supabase
      .channel("vehicules-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vehicules" },
        () => {
          fetchRows();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRows]);

  const addRow = async () => {
    const tempId = crypto.randomUUID();
    const newRow: Vehicle = { id: tempId, immatriculation: "", entree: "", client: "", travaux: "", pieces: "", sortie: "" };
    setRows((prev) => [...prev, newRow]);
    const { error } = await supabase.from("vehicules").insert({});
    if (error) { toast.error("Erreur lors de l'ajout"); fetchRows(); }
  };

  const deleteRow = async (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    const { error } = await supabase.from("vehicules").delete().eq("id", id);
    if (error) { toast.error("Erreur lors de la suppression"); fetchRows(); }
  };

  const updateCell = async (id: string, column: ColumnKey, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [column]: value } : r)));
    const { error } = await supabase.from("vehicules").update({ [column]: value }).eq("id", id);
    if (error) { toast.error("Erreur lors de la mise à jour"); fetchRows(); }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="font-display text-sm uppercase tracking-widest text-muted-foreground">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 px-4 py-2">
            <span className="font-display text-2xl font-bold text-primary">{rows.length}</span>
            <span className="ml-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">véhicule{rows.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <Button 
          onClick={addRow} 
          className="gap-2 bg-primary font-display text-sm font-semibold uppercase tracking-wider shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          Ajouter un véhicule
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-automotive">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-table-header text-table-header-foreground">
              {COLUMNS.map((col) => {
                const Icon = col.icon;
                return (
                  <th
                    key={col.key}
                    className="border-r border-white/10 px-4 py-4 text-left last:border-r-0"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="font-display text-xs font-semibold uppercase tracking-widest">
                        {col.label}
                      </span>
                    </div>
                  </th>
                );
              })}
              <th className="w-14 px-2 py-4" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Car className="h-10 w-10 text-muted-foreground/30" />
                    <p className="font-display text-sm uppercase tracking-widest text-muted-foreground">
                      Aucun véhicule enregistré
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      Cliquez sur "Ajouter un véhicule" pour commencer
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={cn(
                    "group border-t border-border transition-all duration-200 hover:bg-table-row-hover",
                    idx % 2 === 1 ? "bg-table-row-alt" : "bg-card"
                  )}
                >
                  {COLUMNS.map((col) => (
                    <td key={col.key} className="border-r border-border/50 px-1 py-1 last:border-r-0">
                      {DATE_COLUMNS.includes(col.key) ? (
                        <DateCell
                          value={row[col.key]}
                          onChange={(v) => updateCell(row.id, col.key, v)}
                          placeholder={col.label}
                        />
                      ) : col.key === "immatriculation" ? (
                        <input
                          className="w-full rounded-md border-0 bg-transparent px-3 py-2.5 text-sm font-bold uppercase tracking-wider text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/40 placeholder:font-normal placeholder:normal-case placeholder:tracking-normal hover:bg-primary/5 focus:bg-primary/5 focus:ring-2 focus:ring-ring"
                          defaultValue={row[col.key]}
                          maxLength={10}
                          onBlur={(e) => {
                            const val = e.target.value.trim();
                            if (!val) { updateCell(row.id, col.key, ""); return; }
                            if (!IMMAT_REGEX.test(val)) {
                              toast.error("Format invalide — utilisez : XX 1234 XX");
                              e.target.focus();
                              return;
                            }
                            const formatted = formatImmatriculation(val);
                            e.target.value = formatted;
                            updateCell(row.id, col.key, formatted);
                          }}
                          placeholder="AB 1234 CD"
                        />
                      ) : (
                        <input
                          className="w-full rounded-md border-0 bg-transparent px-3 py-2.5 text-sm font-medium text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/40 hover:bg-primary/5 focus:bg-primary/5 focus:ring-2 focus:ring-ring"
                          defaultValue={row[col.key]}
                          onBlur={(e) =>
                            updateCell(row.id, col.key, e.target.value)
                          }
                          placeholder={col.label}
                        />
                      )}
                    </td>
                  ))}
                  <td className="px-2 py-1">
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="rounded-lg p-2 text-muted-foreground/50 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
