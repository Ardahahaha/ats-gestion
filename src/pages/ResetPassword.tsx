import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Car, Lock, Eye, EyeOff, KeyRound } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase parses the recovery token from URL hash automatically and sets a session.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setReady(true);
      else {
        // Listen briefly for PASSWORD_RECOVERY event
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
          if (event === "PASSWORD_RECOVERY" || sess?.user) setReady(true);
        });
        setTimeout(() => subscription.unsubscribe(), 5000);
      }
    });
  }, []);

  const handleUpdate = async () => {
    if (password.length < 6) {
      toast.error("Le mot de passe doit faire au moins 6 caractères");
      return;
    }
    if (password !== confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Mot de passe mis à jour");
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background carbon-pattern">
      <header className="relative overflow-hidden border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="container mx-auto flex items-center justify-center px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
              <Car className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
              A.T.S/<span className="text-primary">GESTION</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <KeyRound className="h-7 w-7 text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold uppercase tracking-wider text-foreground">
              Nouveau mot de passe
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Définissez votre nouveau mot de passe ci-dessous
            </p>
          </div>

          {!ready ? (
            <p className="text-center text-sm text-muted-foreground">
              Vérification du lien de réinitialisation…
            </p>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="Nouveau mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="Confirmer le mot de passe"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleUpdate} className="w-full" disabled={loading || !password || !confirm}>
                {loading ? "Mise à jour…" : "Mettre à jour le mot de passe"}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
