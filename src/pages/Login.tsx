import { useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Car, Shield, Wrench, Eye, EyeOff, Gauge, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Login() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setSubmitting(true);
    if (mode === "login") {
      const { success, error } = await login(email, password);
      if (success) {
        toast.success("Connexion réussie");
      } else {
        toast.error(error || "Erreur de connexion");
      }
    } else {
      const { success, error } = await signup(email, password, selectedRole);
      if (success) {
        toast.success("Compte créé avec succès");
      } else {
        toast.error(error || "Erreur lors de la création du compte");
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background carbon-pattern">
      {/* Header */}
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
                Tableau de bord collaboratif
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
              {mode === "login" ? "Connexion" : "Créer un "}
              <span className="text-primary">{mode === "login" ? "" : "compte"}</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "login"
                ? "Entrez vos identifiants pour accéder au tableau de bord"
                : "Créez un compte avec votre rôle"}
            </p>
          </div>

          {/* Role selection (signup only) */}
          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedRole("admin")}
                className={`group relative overflow-hidden rounded-xl border-2 p-5 transition-all duration-300 ${
                  selectedRole === "admin"
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                    : "border-border bg-card hover:border-primary/30 hover:shadow-md"
                }`}
              >
                <div className={`absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/70 transition-opacity ${selectedRole === "admin" ? "opacity-100" : "opacity-0"}`} />
                <div className="flex flex-col items-center gap-3">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl transition-all ${
                    selectedRole === "admin" ? "bg-primary shadow-lg shadow-primary/25" : "bg-secondary"
                  }`}>
                    <Shield className={`h-7 w-7 ${selectedRole === "admin" ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold uppercase tracking-wide text-foreground">Admin</p>
                    <p className="text-[10px] text-muted-foreground">Accès complet</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedRole("technicien")}
                className={`group relative overflow-hidden rounded-xl border-2 p-5 transition-all duration-300 ${
                  selectedRole === "technicien"
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                    : "border-border bg-card hover:border-primary/30 hover:shadow-md"
                }`}
              >
                <div className={`absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/70 transition-opacity ${selectedRole === "technicien" ? "opacity-100" : "opacity-0"}`} />
                <div className="flex flex-col items-center gap-3">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl transition-all ${
                    selectedRole === "technicien" ? "bg-primary shadow-lg shadow-primary/25" : "bg-secondary"
                  }`}>
                    <Wrench className={`h-7 w-7 ${selectedRole === "technicien" ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold uppercase tracking-wide text-foreground">Technicien</p>
                    <p className="text-[10px] text-muted-foreground">Accès limité</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Form */}
          <div className="space-y-3">
            <Input
              type="email"
              placeholder="Email…"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe…"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button onClick={handleSubmit} className="w-full gap-2" disabled={!email || !password || submitting}>
              {mode === "login" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {submitting ? "Chargement…" : mode === "login" ? "Se connecter" : "Créer le compte"}
            </Button>
          </div>

          {/* Toggle mode */}
          <div className="text-center">
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {mode === "login" ? "Pas encore de compte ? Créer un compte" : "Déjà un compte ? Se connecter"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
