import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Package, ShoppingCart, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function StoreAdminAuditLog() {
  const { storeId } = useAuth();

  const { data: logs, isLoading } = useQuery({
    queryKey: ["audit-log", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .eq("store_id", storeId!)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;

      // Fetch profiles for user names
      const userIds = [...new Set(data?.map(l => l.user_id).filter(Boolean) as string[])];
      const { data: profiles } = userIds.length > 0
        ? await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds)
        : { data: [] };

      return data?.map(log => ({
        ...log,
        userName: profiles?.find(p => p.user_id === log.user_id)?.full_name || "Sistema",
      })) || [];
    },
    enabled: !!storeId,
  });

  const getEntityIcon = (type: string) => {
    if (type === "product") return <Package className="w-4 h-4 text-primary" />;
    if (type === "order") return <ShoppingCart className="w-4 h-4 text-warning" />;
    return <History className="w-4 h-4 text-muted-foreground" />;
  };

  const getActionBadge = (action: string) => {
    if (action === "created") return <Badge className="bg-success/20 text-success border-success/30 text-xs">Criado</Badge>;
    if (action === "updated") return <Badge variant="secondary" className="text-xs">Atualizado</Badge>;
    if (action === "deleted") return <Badge variant="destructive" className="text-xs">Removido</Badge>;
    if (action === "status_changed") return <Badge variant="outline" className="text-xs">Status alterado</Badge>;
    return <Badge variant="outline" className="text-xs">{action}</Badge>;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Histórico de Alterações</h1>
        <p className="text-muted-foreground mt-1">Log de todas as ações realizadas na loja</p>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Carregando...</div>
          ) : !logs || logs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <History className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhuma alteração registrada</p>
              <p className="text-sm mt-1">As ações realizadas nos produtos e pedidos aparecerão aqui</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>Data/Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell>{getEntityIcon(log.entity_type)}</TableCell>
                    <TableCell>
                      <div>
                        <span className="text-sm font-medium capitalize">{log.entity_type === "product" ? "Produto" : log.entity_type === "order" ? "Pedido" : log.entity_type}</span>
                        {log.entity_id && (
                          <span className="text-xs text-muted-foreground block font-mono">#{log.entity_id.slice(0, 8)}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{log.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.details ? (
                        <span className="text-xs text-muted-foreground max-w-xs block truncate">
                          {typeof log.details === "object"
                            ? Object.entries(log.details as Record<string, any>).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(", ")
                            : String(log.details)}
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
