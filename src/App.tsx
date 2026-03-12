import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import Vehicules from "./pages/Vehicules";
import Atelier from "./pages/Atelier";
import GestionVehicules from "./pages/GestionVehicules";
import GestionServices from "./pages/GestionServices";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { role, loading } = useAuth();

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
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
