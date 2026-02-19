import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, Clock, DollarSign, Printer } from "lucide-react";
import { useStoreQuery } from "@/hooks/useStoreData";
import type { Tables } from "@/integrations/supabase/types";

export default function StoreAdminDashboard() {
  const { data: orders } = useStoreQuery<Tables<"orders">>("orders", "orders");
  const { data: products } = useStoreQuery<Tables<"products">>("products", "products");
  const { data: printers } = useStoreQuery<Tables<"printers">>("printers", "printers");

  const pendingOrders = orders?.filter(o => o.production_status === "aguardando") || [];
  const inProductionOrders = orders?.filter(o => o.production_status === "em_producao") || [];
  const activeProducts = products?.filter(p => p.is_active) || [];
  const paidOrders = orders?.filter(o => o.payment_status === "pago") || [];
  const revenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral da sua loja 3D</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pedidos Pendentes</CardTitle>
            <ShoppingCart className="w-5 h-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">{pendingOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">aguardando produção</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Produtos Ativos</CardTitle>
            <Package className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">{activeProducts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">na sua loja</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em Produção</CardTitle>
            <Printer className="w-5 h-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">{inProductionOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">itens sendo impressos</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
            <DollarSign className="w-5 h-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">R$ {revenue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">pedidos pagos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" /> Pedidos a Produzir
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>Nenhum pedido pendente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingOrders.slice(0, 5).map(o => (
                  <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <span className="text-xs text-muted-foreground">#{o.id.slice(0, 8)}</span>
                      <p className="font-medium text-sm">R$ {Number(o.total_amount || 0).toFixed(2)}</p>
                    </div>
                    <Badge variant="secondary">Aguardando</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Printer className="w-5 h-5 text-info" /> Em Produção
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inProductionOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Printer className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>Nenhum pedido em produção</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inProductionOrders.slice(0, 5).map(o => (
                  <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <span className="text-xs text-muted-foreground">#{o.id.slice(0, 8)}</span>
                      <p className="font-medium text-sm">R$ {Number(o.total_amount || 0).toFixed(2)}</p>
                    </div>
                    <Badge>Em Produção</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
