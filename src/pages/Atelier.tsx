import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Table2, Columns3, ChevronRight, ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

type CustomTable = { id: string; name: string };
type CustomColumn = { id: string; table_id: string; name: string; position: number };
type CustomRow = { id: string; table_id: string };
type CustomCell = { id: string; row_id: string; column_id: string; value: string };

/* ───── Liste des tableaux ───── */
function TableList({
  tables,
  onSelect,
  onCreate,
  onDelete,
  isAdmin,
}: {
  tables: CustomTable[];
  onSelect: (t: CustomTable) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}) {
  return (
    <div className="space-y-6">
      {!isAdmin && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          Mode lecture seule — accès technicien
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-500/10 px-4 py-2">
            <span className="font-display text-2xl font-bold text-amber-500">{tables.length}</span>
            <span className="ml-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              tableau{tables.length !== 1 ? "x" : ""}
            </span>
          </div>
        </div>
        {isAdmin && (
          <Button
            onClick={onCreate}
            className="gap-2 bg-amber-500 font-display text-sm font-semibold uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            Nouveau tableau
          </Button>
        )}
      </div>

      {tables.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 rounded-xl border border-border bg-card shadow-automotive">
          <Table2 className="h-10 w-10 text-muted-foreground/30" />
          <p className="font-display text-sm uppercase tracking-widest text-muted-foreground">
            Aucun tableau créé
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((t) => (
            <div
              key={t.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-amber-500/30 hover:shadow-automotive hover:scale-[1.02] cursor-pointer"
              onClick={() => onSelect(t)}
            >
              <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                  <Table2 className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-base font-bold uppercase tracking-wide text-foreground truncate">
                    {t.name || "Sans nom"}
                  </h3>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-amber-500" />
              </div>
              {isAdmin && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}
                  className="absolute right-2 top-3 rounded-lg p-1.5 text-muted-foreground/40 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                  title="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───── Vue d'un tableau ───── */
function TableView({ table, onBack, isAdmin }: { table: CustomTable; onBack: () => void; isAdmin: boolean }) {
  const [columns, setColumns] = useState<CustomColumn[]>([]);
  const [rows, setRows] = useState<CustomRow[]>([]);
  const [cells, setCells] = useState<CustomCell[]>([]);
  const [tableName, setTableName] = useState(table.name);
  const [newColName, setNewColName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [colRes, rowRes, cellRes] = await Promise.all([
      supabase.from("custom_columns").select("*").eq("table_id", table.id).order("position"),
      supabase.from("custom_rows").select("*").eq("table_id", table.id).order("created_at"),
      supabase
        .from("custom_cells")
        .select("*")
        .in("row_id", (await supabase.from("custom_rows").select("id").eq("table_id", table.id)).data?.map((r) => r.id) ?? []),
    ]);
    if (colRes.data) setColumns(colRes.data as CustomColumn[]);
    if (rowRes.data) setRows(rowRes.data as CustomRow[]);
    if (cellRes.data) setCells(cellRes.data as CustomCell[]);
    setLoading(false);
  }, [table.id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateTableName = async (name: string) => {
    if (!isAdmin) return;
    setTableName(name);
    await supabase.from("custom_tables").update({ name }).eq("id", table.id);
  };

  const addColumn = async () => {
    if (!isAdmin || !newColName.trim()) return;
    const pos = columns.length;
    const { error } = await supabase.from("custom_columns").insert({ table_id: table.id, name: newColName.trim(), position: pos });
    if (error) { toast.error("Erreur ajout colonne"); return; }
    setNewColName("");
    fetchAll();
  };

  const deleteColumn = async (colId: string) => {
    if (!isAdmin) return;
    await supabase.from("custom_cells").delete().eq("column_id", colId);
    await supabase.from("custom_columns").delete().eq("id", colId);
    fetchAll();
  };

  const addRow = async () => {
    if (!isAdmin) return;
    const { error } = await supabase.from("custom_rows").insert({ table_id: table.id });
    if (error) { toast.error("Erreur ajout ligne"); return; }
    fetchAll();
  };

  const deleteRow = async (rowId: string) => {
    if (!isAdmin) return;
    await supabase.from("custom_cells").delete().eq("row_id", rowId);
    await supabase.from("custom_rows").delete().eq("id", rowId);
    fetchAll();
  };

  const getCellValue = (rowId: string, colId: string) => cells.find((c) => c.row_id === rowId && c.column_id === colId)?.value ?? "";

  const updateCell = async (rowId: string, colId: string, value: string) => {
    if (!isAdmin) return;
    setCells((prev) => {
      const idx = prev.findIndex((c) => c.row_id === rowId && c.column_id === colId);
      if (idx >= 0) { const copy = [...prev]; copy[idx] = { ...copy[idx], value }; return copy; }
      return [...prev, { id: crypto.randomUUID(), row_id: rowId, column_id: colId, value }];
    });
    const { error } = await supabase.from("custom_cells").upsert({ row_id: rowId, column_id: colId, value }, { onConflict: "row_id,column_id" });
    if (error) { toast.error("Erreur mise à jour"); fetchAll(); }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        <span className="font-display text-sm uppercase tracking-widest text-muted-foreground">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-all duration-200 hover:border-amber-500/50 hover:text-amber-500">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <input
          className="flex-1 rounded-lg border border-border bg-card px-4 py-2.5 font-display text-lg font-bold uppercase tracking-wider text-foreground outline-none transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          onBlur={(e) => updateTableName(e.target.value)}
          placeholder="Nom du tableau"
          readOnly={!isAdmin}
        />
      </div>

      {isAdmin && (
        <div className="flex items-center gap-2">
          <Columns3 className="h-4 w-4 text-amber-500" />
          <Input className="max-w-xs" placeholder="Nom de la colonne" value={newColName} onChange={(e) => setNewColName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addColumn()} />
          <Button onClick={addColumn} size="sm" variant="outline" className="gap-1 border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
            <Plus className="h-3.5 w-3.5" /> Colonne
          </Button>
          <div className="flex-1" />
          <Button onClick={addRow} size="sm" className="gap-1 bg-amber-500 font-display text-xs font-semibold uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:bg-amber-600">
            <Plus className="h-3.5 w-3.5" /> Ligne
          </Button>
        </div>
      )}

      {columns.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 rounded-xl border border-border bg-card">
          <Columns3 className="h-10 w-10 text-muted-foreground/30" />
          <p className="font-display text-sm uppercase tracking-widest text-muted-foreground">
            {isAdmin ? "Ajoutez des colonnes pour commencer" : "Aucune colonne"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-automotive">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="bg-table-header text-table-header-foreground">
                {columns.map((col) => (
                  <th key={col.id} className="border-r border-white/10 px-4 py-4 text-left last:border-r-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xs font-semibold uppercase tracking-widest truncate">{col.name}</span>
                      {isAdmin && (
                        <button onClick={() => deleteColumn(col.id)} className="ml-auto shrink-0 rounded p-1 text-white/40 hover:bg-white/10 hover:text-destructive transition-colors" title="Supprimer colonne">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                {isAdmin && <th className="w-14 px-2 py-4" />}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (isAdmin ? 1 : 0)} className="py-12 text-center">
                    <p className="font-display text-sm uppercase tracking-widest text-muted-foreground">Aucune ligne</p>
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={row.id} className={cn("group border-t border-border transition-all duration-200 hover:bg-table-row-hover", idx % 2 === 1 ? "bg-table-row-alt" : "bg-card")}>
                    {columns.map((col) => (
                      <td key={col.id} className="border-r border-border/50 px-1 py-1 last:border-r-0">
                        <input
                          className="w-full rounded-md border-0 bg-transparent px-3 py-2.5 text-sm font-medium text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/40 hover:bg-amber-500/5 focus:bg-amber-500/5 focus:ring-2 focus:ring-ring"
                          defaultValue={getCellValue(row.id, col.id)}
                          onBlur={(e) => updateCell(row.id, col.id, e.target.value)}
                          placeholder="..."
                          readOnly={!isAdmin}
                        />
                      </td>
                    ))}
                    {isAdmin && (
                      <td className="px-2 py-1">
                        <button onClick={() => deleteRow(row.id)} className="rounded-lg p-2 text-muted-foreground/50 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive" title="Supprimer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ───── Page Atelier ───── */
const Atelier = () => {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [tables, setTables] = useState<CustomTable[]>([]);
  const [selected, setSelected] = useState<CustomTable | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTables = useCallback(async () => {
    const { data } = await supabase.from("custom_tables").select("*").order("created_at");
    setTables((data ?? []) as CustomTable[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  const createTable = async () => {
    if (!isAdmin) return;
    const { data, error } = await supabase.from("custom_tables").insert({ name: "Nouveau tableau" }).select().single();
    if (error) { toast.error("Erreur création"); return; }
    fetchTables();
    setSelected(data as CustomTable);
  };

  const deleteTable = async (id: string) => {
    if (!isAdmin) return;
    await supabase.from("custom_tables").delete().eq("id", id);
    fetchTables();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        <span className="font-display text-sm uppercase tracking-widest text-muted-foreground">Chargement...</span>
      </div>
    );
  }

  if (selected) {
    return <TableView table={selected} onBack={() => { setSelected(null); fetchTables(); }} isAdmin={isAdmin} />;
  }

  return (
    <TableList tables={tables} onSelect={setSelected} onCreate={createTable} onDelete={deleteTable} isAdmin={isAdmin} />
  );
};

export default Atelier;
