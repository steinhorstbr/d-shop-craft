import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, PackageOpen } from "lucide-react";

export default function StoreAdminPackaging() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Embalagens</h1>
          <p className="text-muted-foreground mt-1">Controle de estoque de embalagens</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Nova Embalagem
        </Button>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="text-center py-16 text-muted-foreground">
            <PackageOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Nenhuma embalagem cadastrada</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
