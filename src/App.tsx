import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import Vehicules from "./pages/Vehicules";
import Atelier from "./pages/Atelier";
import GestionVehicules from "./pages/GestionVehicules";
import GestionServices from "./pages/GestionServices";
import Compte from "./pages/Compte";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

function AppRoutes() {
  const { role, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") navigate("/reset-password", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Public route: reset-password (accessible via email recovery link)
  if (location.pathname === "/reset-password") {
    return <ResetPassword />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!role) return <Login />;


  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/vehicules" element={<Vehicules />} />
        <Route path="/atelier" element={<Atelier />} />
        <Route path="/gestion-vehicules" element={<GestionVehicules />} />
        <Route path="/gestion-services" element={<GestionServices />} />
        <Route path="/compte" element={<Compte />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <I18nProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </I18nProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
