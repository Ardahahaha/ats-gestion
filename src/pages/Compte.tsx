import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { User, Trash2, Save, AlertTriangle, Shield, Wrench, Globe } from "lucide-react";
import AccountsList from "@/components/AccountsList";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Compte() {
  const { user, role, pseudo, logout } = useAuth();
  const { t, lang, setLang, langs } = useI18n();
  const [newPseudo, setNewPseudo] = useState(pseudo || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleSavePseudo = async () => {
    if (!newPseudo.trim() || newPseudo.trim() === pseudo) return;
    setSaving(true);

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("pseudo", newPseudo.trim())
      .neq("user_id", user!.id)
      .maybeSingle();

    if (existing) {
      toast.error(t("compte.pseudoTaken"));
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ pseudo: newPseudo.trim() })
      .eq("user_id", user!.id);

    setSaving(false);
    if (error) {
      toast.error(t("compte.updateError"));
    } else {
      toast.success(t("compte.pseudoUpdated"));
      window.location.reload();
    }
  };

  const confirmWord = t("compte.deleteConfirmWord");

  const handleDeleteAccount = async () => {
    if (confirmText !== confirmWord) return;
    setDeleting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error(t("compte.sessionExpired"));
      setDeleting(false);
      return;
    }

    const res = await supabase.functions.invoke("delete-account", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (res.error || res.data?.error) {
      toast.error(res.data?.error || t("compte.deleteError"));
      setDeleting(false);
      return;
    }

    toast.success(t("compte.deleted"));
    await logout();
  };

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
          {t("compte.title").split(" ").slice(0, -1).join(" ")}{" "}
          <span className="text-primary">{t("compte.title").split(" ").slice(-1)}</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{t("compte.subtitle")}</p>
      </div>

      {/* Info section */}
      <div className="rounded-xl border-2 border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            role === "admin" ? "bg-primary shadow-lg shadow-primary/25" : "bg-blue-500 shadow-lg shadow-blue-500/25"
          }`}>
            {role === "admin" ? <Shield className="h-6 w-6 text-primary-foreground" /> : <Wrench className="h-6 w-6 text-white" />}
          </div>
          <div>
            <p className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
              {pseudo || t("compte.noPseudo")}
            </p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              role === "admin" ? "bg-primary/10 text-primary" : "bg-blue-500/10 text-blue-500"
            }`}>
              {role === "admin" ? t("compte.administrator") : t("compte.technician")}
            </span>
          </div>
        </div>
      </div>

      {/* Change pseudo */}
      <div className="rounded-xl border-2 border-border bg-card p-6 space-y-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          {t("compte.changePseudo")}
        </h3>
        <div className="flex gap-2">
          <Input
            value={newPseudo}
            onChange={(e) => setNewPseudo(e.target.value)}
            placeholder={t("compte.newPseudo")}
            className="flex-1"
          />
          <Button
            onClick={handleSavePseudo}
            disabled={!newPseudo.trim() || newPseudo.trim() === pseudo || saving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "…" : t("compte.save")}
          </Button>
        </div>
      </div>

      {/* Language */}
      <div className="rounded-xl border-2 border-border bg-card p-6 space-y-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          {t("compte.language")}
        </h3>
        <p className="text-xs text-muted-foreground">{t("compte.languageDesc")}</p>
        <div className="flex gap-2">
          {langs.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                lang === l.code
                  ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              <span className="text-lg">{l.flag}</span>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Admin: all accounts */}
      {role === "admin" && <AccountsList />}

      {/* Delete account */}
      <div className="rounded-xl border-2 border-destructive/30 bg-card p-6 space-y-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {t("compte.dangerZone")}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t("compte.deleteWarning")}
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              {t("compte.deleteAccount")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {t("compte.deleteTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <span className="block">{t("compte.deleteDesc")}</span>
                <span className="block text-sm">{t("compte.deleteConfirmLabel")}</span>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={confirmWord}
                  className="mt-2"
                />
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmText("")}>{t("compte.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={confirmText !== confirmWord || deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? t("compte.deleting") : t("compte.confirmDelete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
