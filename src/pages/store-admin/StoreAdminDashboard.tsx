import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Clock, DollarSign, Printer, AlertCircle, CheckCircle2, Timer, TrendingUp } from "lucide-react";
import { useStoreQuery } from "@/hooks/useStoreData";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

export default function StoreAdminDashboard() {
  const navigate = useNavigate();
  const { data: orders } = useStoreQuery<Tables<"orders">>("orders", "orders");
  const { data: products } = useStoreQuery<Tables<"products">>("products", "products");
  const { data: printers } = useStoreQuery<Tables<"printers">>("printers", "printers");
  const { data: filaments } = useStoreQuery<Tables<"filaments">>("filaments", "filaments");

  const pendingOrders = orders?.filter(o => o.production_status === "aguardando") || [];
  const inProductionOrders = orders?.filter(o => o.production_status === "em_producao") || [];
  const completedOrders = orders?.filter(o => o.production_status === "concluido") || [];
  const activeProducts = products?.filter(p => p.is_active) || [];
  const paidOrders = orders?.filter(o => o.payment_status === "pago") || [];
  const awaitingPayment = orders?.filter(o => o.payment_status === "aguardando") || [];
  const revenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const pendingRevenue = awaitingPayment.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  // Low stock filaments (< 500g)
  const lowStockFilaments = filaments?.filter(f => Number(f.quantity_grams) < 500) || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral da sua loja 3D</p>
      </div>

      {/* Alerts */}
      {lowStockFilaments.length > 0 && (
        <div className="mb-6 p-4 rounded-lg border border-warning/40 bg-warning/10 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm text-foreground">Estoque baixo de filamento</p>
            <p className="text-xs text-muted-foreground mt-1">
              {lowStockFilaments.map(f => `${f.name} (${Number(f.quantity_grams).toFixed(0)}g)`).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aguardando</CardTitle>
            <ShoppingCart className="w-5 h-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">{pendingOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">pedidos para produzir</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em Produção</CardTitle>
            <Printer className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">{inProductionOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">sendo impressos agora</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Paga</CardTitle>
            <TrendingUp className="w-5 h-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">R$ {revenue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">confirmada</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">A Receber</CardTitle>
            <DollarSign className="w-5 h-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">R$ {pendingRevenue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">aguardando pagamento</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pending orders */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" /> Fila de Produção
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/orders")}>Ver todos</Button>
          </CardHeader>
          <CardContent>
            {pendingOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Nenhum pedido pendente 🎉</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingOrders.slice(0, 6).map(o => (
                  <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div>
                      <span className="text-xs text-muted-foreground font-mono">#{o.id.slice(0, 8).toUpperCase()}</span>
                      <p className="font-medium text-sm">R$ {Number(o.total_amount || 0).toFixed(2)}</p>
                      {o.production_notes && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{o.production_notes}</p>
                      )}
                    </div>
                    <Badge variant="secondary">Aguardando</Badge>
                  </div>
                ))}
                {pendingOrders.length > 6 && (
                  <p className="text-xs text-center text-muted-foreground pt-1">+{pendingOrders.length - 6} mais</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* In production */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display flex items-center gap-2">
              <Printer className="w-5 h-5 text-primary" /> Em Produção
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/orders")}>Ver todos</Button>
          </CardHeader>
          <CardContent>
            {inProductionOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Printer className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Nenhum pedido em produção</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inProductionOrders.slice(0, 6).map(o => (
                  <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div>
                      <span className="text-xs text-muted-foreground font-mono">#{o.id.slice(0, 8).toUpperCase()}</span>
                      <p className="font-medium text-sm">R$ {Number(o.total_amount || 0).toFixed(2)}</p>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      <Printer className="w-3 h-3 mr-1" /> Imprimindo
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" /> Produtos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold">{activeProducts.length}</div>
            <p className="text-xs text-muted-foreground">{products?.length || 0} total, {activeProducts.length} ativos</p>
            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => navigate("/admin/products")}>
              Gerenciar
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" /> Concluídos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold">{completedOrders.length}</div>
            <p className="text-xs text-muted-foreground">de {orders?.length || 0} pedidos totais</p>
            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => navigate("/admin/orders")}>
              Ver histórico
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Timer className="w-4 h-4 text-info" /> Impressoras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold">{printers?.length || 0}</div>
            <p className="text-xs text-muted-foreground">cadastradas</p>
            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => navigate("/admin/printers")}>
              Gerenciar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
