import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/contexts/I18nContext";
import { Users, Shield, Wrench } from "lucide-react";

type Account = {
  pseudo: string;
  user_id: string;
  role: "admin" | "technicien" | null;
};

export default function AccountsList() {
  const { t } = useI18n();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("pseudo, user_id")
        .order("created_at", { ascending: true });

      if (!profiles) {
        setLoading(false);
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      const rolesMap = new Map(
        (roles || []).map((r) => [r.user_id, r.role as "admin" | "technicien"])
      );

      setAccounts(
        profiles.map((p) => ({
          pseudo: p.pseudo,
          user_id: p.user_id,
          role: rolesMap.get(p.user_id) ?? null,
        }))
      );
      setLoading(false);
    };

    fetchAccounts();
  }, []);

  return (
    <div className="rounded-xl border-2 border-border bg-card p-6 space-y-4">
      <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        {t("compte.allAccounts")}
      </h3>
      <p className="text-xs text-muted-foreground">{t("compte.allAccountsDesc")}</p>

      {loading ? (
        <p className="text-sm text-muted-foreground">{t("compte.loadingAccounts")}</p>
      ) : accounts.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("compte.noAccounts")}</p>
      ) : (
        <div className="space-y-2">
          {accounts.map((a) => (
            <div
              key={a.user_id}
              className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    a.role === "admin"
                      ? "bg-primary/15 text-primary"
                      : "bg-blue-500/15 text-blue-500"
                  }`}
                >
                  {a.role === "admin" ? (
                    <Shield className="h-4 w-4" />
                  ) : (
                    <Wrench className="h-4 w-4" />
                  )}
                </div>
                <span className="font-medium text-sm text-foreground">
                  {a.pseudo}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  a.role === "admin"
                    ? "bg-primary/10 text-primary"
                    : "bg-blue-500/10 text-blue-500"
                }`}
              >
                {a.role === "admin"
                  ? t("compte.administrator")
                  : t("compte.technician")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
