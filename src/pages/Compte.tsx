import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { User, Trash2, Save, AlertTriangle, Shield, Wrench } from "lucide-react";
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
  const [newPseudo, setNewPseudo] = useState(pseudo || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleSavePseudo = async () => {
    if (!newPseudo.trim() || newPseudo.trim() === pseudo) return;
    setSaving(true);

    // Check uniqueness
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("pseudo", newPseudo.trim())
      .neq("user_id", user!.id)
      .maybeSingle();

    if (existing) {
      toast.error("Ce pseudo est déjà pris");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ pseudo: newPseudo.trim() })
      .eq("user_id", user!.id);

    setSaving(false);
    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      toast.success("Pseudo mis à jour !");
      // Force reload to update context
      window.location.reload();
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== "SUPPRIMER") return;
    setDeleting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Session expirée");
      setDeleting(false);
      return;
    }

    const res = await supabase.functions.invoke("delete-account", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (res.error || res.data?.error) {
      toast.error(res.data?.error || "Erreur lors de la suppression");
      setDeleting(false);
      return;
    }

    toast.success("Compte supprimé");
    await logout();
  };

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
          Mon <span className="text-primary">Compte</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Gérez vos informations personnelles</p>
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
              {pseudo || "Sans pseudo"}
            </p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              role === "admin" ? "bg-primary/10 text-primary" : "bg-blue-500/10 text-blue-500"
            }`}>
              {role === "admin" ? "Administrateur" : "Technicien"}
            </span>
          </div>
        </div>
      </div>

      {/* Change pseudo */}
      <div className="rounded-xl border-2 border-border bg-card p-6 space-y-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          Modifier le pseudo
        </h3>
        <div className="flex gap-2">
          <Input
            value={newPseudo}
            onChange={(e) => setNewPseudo(e.target.value)}
            placeholder="Nouveau pseudo"
            className="flex-1"
          />
          <Button
            onClick={handleSavePseudo}
            disabled={!newPseudo.trim() || newPseudo.trim() === pseudo || saving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "…" : "Enregistrer"}
          </Button>
        </div>
      </div>

      {/* Delete account */}
      <div className="rounded-xl border-2 border-destructive/30 bg-card p-6 space-y-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Zone dangereuse
        </h3>
        <p className="text-xs text-muted-foreground">
          La suppression de votre compte est irréversible. Toutes vos données seront perdues.
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Supprimer mon compte
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Supprimer le compte
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <span className="block">Cette action est <strong>irréversible</strong>. Votre compte et toutes vos données seront définitivement supprimés.</span>
                <span className="block text-sm">Tapez <strong>SUPPRIMER</strong> pour confirmer :</span>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="SUPPRIMER"
                  className="mt-2"
                />
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmText("")}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={confirmText !== "SUPPRIMER" || deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? "Suppression…" : "Confirmer la suppression"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
