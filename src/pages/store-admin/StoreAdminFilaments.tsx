import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Layers } from "lucide-react";

export default function StoreAdminFilaments() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Filamentos</h1>
          <p className="text-muted-foreground mt-1">Controle de estoque de filamentos</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Novo Filamento
        </Button>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="text-center py-16 text-muted-foreground">
            <Layers className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Nenhum filamento cadastrado</p>
            <p className="text-sm mt-1">Gerencie seu estoque de filamentos aqui</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
