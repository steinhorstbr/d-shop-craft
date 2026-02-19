import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, CreditCard, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function SuperAdminDashboard() {
  const { data: stores } = useQuery({
    queryKey: ["admin-stores-dash"],
    queryFn: async () => {
      const { data: storesData, error } = await supabase
        .from("stores")
        .select("*, subscription_plans(name, is_trial, price_monthly)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const userIds = storesData?.map(s => s.user_id) || [];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, email").in("user_id", userIds);
      return storesData?.map(s => ({
        ...s,
        profile: profiles?.find(p => p.user_id === s.user_id) || null,
      })) || [];
    },
  });

  const totalStores = stores?.length || 0;
  const trialStores = stores?.filter((s: any) => s.subscription_status === "trial").length || 0;
  const activeSubscriptions = stores?.filter((s: any) => s.subscription_status === "active").length || 0;
  const revenue = stores?.reduce((sum: number, s: any) => {
    if (s.subscription_status === "active" && s.subscription_plans) {
      return sum + Number(s.subscription_plans.price_monthly || 0);
    }
    return sum;
  }, 0) || 0;

  const recentStores = stores?.slice(0, 5) || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral da plataforma Print3D</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Empresas</CardTitle>
            <Building2 className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">{totalStores}</div>
            <p className="text-xs text-muted-foreground mt-1">empresas cadastradas</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em Trial</CardTitle>
            <Users className="w-5 h-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">{trialStores}</div>
            <p className="text-xs text-muted-foreground mt-1">aguardando assinatura</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assinantes</CardTitle>
            <CreditCard className="w-5 h-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1">planos ativos</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Mensal</CardTitle>
            <TrendingUp className="w-5 h-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">R$ {revenue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">estimada</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="font-display">Empresas Recentes</CardTitle>
          <CardDescription>Últimas empresas que se cadastraram na plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          {recentStores.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma empresa cadastrada ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentStores.map((s: any) => {
                const profile = s.profile;
                return (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <span className="font-medium">{s.name}</span>
                      <span className="text-xs text-muted-foreground block">{profile?.full_name} — {profile?.email}</span>
                    </div>
                    <div className="flex gap-2">
                      {s.subscription_status === "trial" ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-warning/20 text-warning">Trial</span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success">Ativo</span>
                      )}
                      <span className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
