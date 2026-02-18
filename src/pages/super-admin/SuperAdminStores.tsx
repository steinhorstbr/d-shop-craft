import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Eye, ToggleLeft, ExternalLink } from "lucide-react";

export default function SuperAdminStores() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Empresas</h1>
          <p className="text-muted-foreground mt-1">Gerencie as lojas cadastradas na plataforma</p>
        </div>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="text-center py-16 text-muted-foreground">
            <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Nenhuma empresa cadastrada</p>
            <p className="text-sm mt-1">Quando novos clientes se cadastrarem, aparecerão aqui</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
