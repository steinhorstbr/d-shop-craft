import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Printer } from "lucide-react";

export default function StoreAdminPrinters() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Impressoras 3D</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas impressoras</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Nova Impressora
        </Button>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="text-center py-16 text-muted-foreground">
            <Printer className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Nenhuma impressora cadastrada</p>
            <p className="text-sm mt-1">Cadastre suas impressoras para gerenciar produção</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
