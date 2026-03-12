import { useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { Car, Shield, Wrench, Eye, EyeOff, Gauge, Mail, Lock, KeyRound, UserPlus, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Tab = "login" | "signup";

export default function Login() {
  const { login, signup } = useAuth();
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup state
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [rolePassword, setRolePassword] = useState("");
  const [signupPseudo, setSignupPseudo] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showRolePw, setShowRolePw] = useState(false);
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) return;
    setLoginLoading(true);
    const result = await login(loginEmail, loginPassword);
    setLoginLoading(false);
    if (result.success) {
      toast.success("Connecté avec succès");
    } else {
      toast.error(result.error || "Identifiants incorrects");
    }
  };

  const handleSignup = async () => {
    if (!selectedRole || !rolePassword || !signupPseudo.trim() || !signupEmail || !signupPassword) return;
    if (signupPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setSignupLoading(true);
    const result = await signup(signupEmail, signupPassword, selectedRole, rolePassword, signupPseudo.trim());
    setSignupLoading(false);
    if (result.success) {
      toast.success("Compte créé et connecté avec succès !");
    } else {
      toast.error(result.error || "Erreur lors de la création du compte");
    }
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
          {/* Tab selector */}
          <div className="flex rounded-xl border-2 border-border overflow-hidden">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-wide transition-all ${
                tab === "login"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <LogIn className="h-4 w-4" /> Connexion
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-wide transition-all ${
                tab === "signup"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus className="h-4 w-4" /> Créer un compte
            </button>
          </div>

          {/* LOGIN TAB */}
          {tab === "login" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="text-center">
                <h2 className="font-display text-xl font-bold uppercase tracking-wider text-foreground">
                  Se <span className="text-primary">connecter</span>
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">Entrez vos identifiants</p>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Adresse e-mail"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showLoginPw ? "text" : "password"}
                    placeholder="Mot de passe"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPw(!showLoginPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showLoginPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button onClick={handleLogin} className="w-full gap-2" disabled={!loginEmail || !loginPassword || loginLoading}>
                  {loginLoading ? "Connexion…" : "Se connecter"}
                </Button>
              </div>
            </div>
          )}

          {/* SIGNUP TAB */}
          {tab === "signup" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="text-center">
                <h2 className="font-display text-xl font-bold uppercase tracking-wider text-foreground">
                  Créer un <span className="text-primary">compte</span>
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">Choisissez votre type de compte</p>
              </div>

              {/* Role selection */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setSelectedRole("admin"); setRolePassword(""); }}
                  className={`group relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-300 ${
                    selectedRole === "admin"
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                      : "border-border bg-card hover:border-primary/30 hover:shadow-md"
                  }`}
                >
                  <div className={`absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/70 transition-opacity ${selectedRole === "admin" ? "opacity-100" : "opacity-0"}`} />
                  <div className="flex flex-col items-center gap-2">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
                      selectedRole === "admin" ? "bg-primary shadow-lg shadow-primary/25" : "bg-secondary"
                    }`}>
                      <Shield className={`h-6 w-6 ${selectedRole === "admin" ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    </div>
                    <p className="font-display text-sm font-bold uppercase tracking-wide text-foreground">Admin</p>
                  </div>
                </button>

                <button
                  onClick={() => { setSelectedRole("technicien"); setRolePassword(""); }}
                  className={`group relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-300 ${
                    selectedRole === "technicien"
                      ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                      : "border-border bg-card hover:border-blue-500/30 hover:shadow-md"
                  }`}
                >
                  <div className={`absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400 transition-opacity ${selectedRole === "technicien" ? "opacity-100" : "opacity-0"}`} />
                  <div className="flex flex-col items-center gap-2">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
                      selectedRole === "technicien" ? "bg-blue-500 shadow-lg shadow-blue-500/25" : "bg-secondary"
                    }`}>
                      <Wrench className={`h-6 w-6 ${selectedRole === "technicien" ? "text-white" : "text-muted-foreground"}`} />
                    </div>
                    <p className="font-display text-sm font-bold uppercase tracking-wide text-foreground">Technicien</p>
                  </div>
                </button>
              </div>

              {/* Role password + account details */}
              {selectedRole && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Role password */}
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showRolePw ? "text" : "password"}
                      placeholder={`Mot de passe ${selectedRole === "admin" ? "Admin" : "Technicien"}…`}
                      value={rolePassword}
                      onChange={(e) => setRolePassword(e.target.value)}
                      autoFocus
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRolePw(!showRolePw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showRolePw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Pseudo */}
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Votre pseudo"
                      value={signupPseudo}
                      onChange={(e) => setSignupPseudo(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Email + Password */}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Votre adresse e-mail"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showSignupPw ? "text" : "password"}
                      placeholder="Votre mot de passe (min. 6 caractères)"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPw(!showSignupPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showSignupPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <Button
                    onClick={handleSignup}
                    className="w-full gap-2"
                    disabled={!rolePassword || !signupPseudo.trim() || !signupEmail || !signupPassword || signupLoading}
                  >
                    {signupLoading ? "Création…" : "Créer le compte"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
