import { VehicleTable } from "@/components/VehicleTable";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4">
        <h1 className="text-2xl font-bold text-foreground">
          Gestion des Véhicules
        </h1>
        <p className="text-sm text-muted-foreground">
          Tableau partagé — toutes les modifications sont visibles par tous
        </p>
      </header>
      <main className="container mx-auto py-8 px-4">
        <VehicleTable />
      </main>
    </div>
  );
};

export default Index;
