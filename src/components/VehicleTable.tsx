import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, CalendarIcon } from "lucide-react";
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
  { key: "immatriculation", label: "Immatriculation" },
  { key: "entree", label: "Entrée" },
  { key: "client", label: "Client" },
  { key: "travaux", label: "Travaux" },
  { key: "pieces", label: "Pièces" },
  { key: "sortie", label: "Sortie" },
] as const;

type ColumnKey = (typeof COLUMNS)[number]["key"];

const DATE_COLUMNS: ColumnKey[] = ["entree", "sortie"];

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
            "flex w-full items-center gap-2 rounded bg-transparent px-3 py-2 text-left text-foreground outline-none focus:ring-2 focus:ring-ring",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" />
          {date ? format(date, "dd/MM/yyyy") : <span>{placeholder}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
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
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={addRow} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une ligne
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-table-header text-table-header-foreground">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-semibold tracking-wide border-r border-border last:border-r-0"
                >
                  {col.label}
                </th>
              ))}
              <th className="w-12 px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-muted-foreground"
                >
                  Aucune entrée — cliquez sur "Ajouter une ligne"
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`border-t border-border transition-colors hover:bg-table-row-hover ${
                    idx % 2 === 1 ? "bg-table-row-alt" : "bg-card"
                  }`}
                >
                  {COLUMNS.map((col) => (
                    <td key={col.key} className="px-1 py-1">
                      {DATE_COLUMNS.includes(col.key) ? (
                        <DateCell
                          value={row[col.key]}
                          onChange={(v) => updateCell(row.id, col.key, v)}
                          placeholder={col.label}
                        />
                      ) : (
                        <input
                          className="w-full rounded border-0 bg-transparent px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
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
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
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
