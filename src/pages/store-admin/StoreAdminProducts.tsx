import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";

export default function StoreAdminProducts() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground mt-1">Gerencie os produtos da sua loja</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Novo Produto
        </Button>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="text-center py-16 text-muted-foreground">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Nenhum produto cadastrado</p>
            <p className="text-sm mt-1">Comece adicionando seus produtos impressos em 3D</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
