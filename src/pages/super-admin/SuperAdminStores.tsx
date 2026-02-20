import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Eye, ToggleLeft, ExternalLink, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

export default function SuperAdminStores() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: stores, isLoading } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: async () => {
      const { data: storesData, error } = await supabase
        .from("stores")
        .select("*, subscription_plans(name, is_trial)")
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

  const { data: plans } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subscription_plans").select("*").eq("is_active", true);
      if (error) throw error;
      return data as Tables<"subscription_plans">[];
    },
  });

  const toggleActive = async (storeId: string, isActive: boolean) => {
    const { error } = await supabase.from("stores").update({ is_active: !isActive }).eq("id", storeId);
    if (error) toast.error("Erro: " + error.message);
    else { toast.success(isActive ? "Loja desativada!" : "Loja ativada!"); queryClient.invalidateQueries({ queryKey: ["admin-stores"] }); }
  };

  const changePlan = async (storeId: string, planId: string) => {
    const plan = plans?.find(p => p.id === planId);
    const { error } = await supabase.from("stores").update({
      subscription_plan_id: planId,
      subscription_status: plan?.is_trial ? "trial" : "active",
      subscription_started_at: new Date().toISOString(),
    }).eq("id", storeId);
    if (error) toast.error("Erro: " + error.message);
    else { toast.success("Plano atualizado!"); queryClient.invalidateQueries({ queryKey: ["admin-stores"] }); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Empresas</h1>
          <p className="text-muted-foreground mt-1">Gerencie as lojas cadastradas na plataforma</p>
        </div>
        <Badge variant="outline" className="text-sm">{stores?.length || 0} lojas</Badge>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Carregando...</div>
          ) : !stores || stores.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhuma empresa cadastrada</p>
              <p className="text-sm mt-1">Quando novos clientes se cadastrarem, aparecerão aqui</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loja</TableHead>
                  <TableHead>Proprietário</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Alterar Plano</TableHead>
                  <TableHead className="w-36">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((s: any) => {
                  const profile = s.profile;
                  return (
                    <TableRow key={s.id} className={!s.is_active ? "opacity-50" : ""}>
                      <TableCell>
                        <div>
                          <span className="font-medium">{s.name}</span>
                          <span className="text-xs text-muted-foreground block font-mono">#{s.id.slice(0, 8)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="text-sm">{profile?.full_name || "—"}</span>
                          <span className="text-xs text-muted-foreground block">{profile?.email || ""}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {s.subscription_plans?.is_trial ? (
                          <Badge variant="secondary">Trial</Badge>
                        ) : (
                          <Badge>{s.subscription_plans?.name || "Sem plano"}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={s.is_active ? "default" : "destructive"}>
                          {s.is_active ? "Ativa" : "Desativada"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select value={s.subscription_plan_id || ""} onValueChange={(v) => changePlan(s.id, v)}>
                          <SelectTrigger className="h-8 w-40"><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            {plans?.map(p => <SelectItem key={p.id} value={p.id}>{p.name} {p.is_trial ? "(Trial)" : `R$${p.price_monthly}`}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Ver vitrine"
                            onClick={() => window.open(`/loja/${s.id}`, "_blank")}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary"
                            title="Entrar como admin da loja"
                            onClick={() => {
                              // Store the store context for impersonation view
                              sessionStorage.setItem("superadmin_viewing_store", s.id);
                              window.open(`/loja/${s.id}`, "_blank");
                              toast.info(`Abrindo vitrine da loja: ${s.name}`);
                            }}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title={s.is_active ? "Desativar loja" : "Ativar loja"}
                            onClick={() => toggleActive(s.id, s.is_active)}
                          >
                            <ToggleLeft className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
