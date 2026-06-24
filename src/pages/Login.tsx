import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { Car, Eye, EyeOff, Gauge, Mail, Lock, LogIn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const { t } = useI18n();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgot = async () => {
    if (!forgotEmail) return;
    setForgotLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Email envoyé ! Vérifiez votre boîte de réception.");
    setForgotOpen(false);
    setForgotEmail("");
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) return;
    setLoginLoading(true);
    const result = await login(loginEmail, loginPassword);
    setLoginLoading(false);
    if (result.success) toast.success(t("login.successLogin"));
    else toast.error(result.error || t("login.errorLogin"));
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
            <div>
              <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
                A.T.S/<span className="text-primary">GESTION</span>
              </h1>
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                <Gauge className="h-3 w-3" />
                {t("layout.dashboard")}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-center">
              <h2 className="font-display text-xl font-bold uppercase tracking-wider text-foreground flex items-center justify-center gap-2">
                <LogIn className="h-5 w-5 text-primary" /> {t("login.title")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("login.subtitle")}</p>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder={t("login.email")} value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)} className="pl-10" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type={showLoginPw ? "text" : "password"} placeholder={t("login.password")}
                  value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()} className="pl-10 pr-10" />
                <button type="button" onClick={() => setShowLoginPw(!showLoginPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showLoginPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button onClick={handleLogin} className="w-full gap-2"
                disabled={!loginEmail || !loginPassword || loginLoading}>
                {loginLoading ? t("login.loading") : t("login.submit")}
              </Button>
              <button type="button"
                onClick={() => { setForgotEmail(loginEmail); setForgotOpen(true); }}
                className="w-full text-center text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                Mot de passe oublié ?
              </button>
            </div>

            <div className="rounded-xl border-2 border-border bg-card/60 p-4 flex gap-3">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold uppercase tracking-wide text-foreground">Accès sur invitation</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  La création de comptes est désormais réservée aux administrateurs.
                  Contactez un admin de l'atelier pour obtenir un accès.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mot de passe oublié</DialogTitle>
            <DialogDescription>
              Entrez votre adresse email. Vous recevrez un lien pour réinitialiser votre mot de passe.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="email" placeholder="votre@email.com" value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleForgot()} className="pl-10" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForgotOpen(false)}>Annuler</Button>
            <Button onClick={handleForgot} disabled={!forgotEmail || forgotLoading}>
              {forgotLoading ? "Envoi…" : "Envoyer le lien"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
