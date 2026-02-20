import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { logAudit } from "@/lib/auditLog";

export function useStoreQuery<T>(
  key: string,
  table: string,
  options?: { enabled?: boolean; select?: string; orderBy?: string }
) {
  const { storeId } = useAuth();
  return useQuery({
    queryKey: [key, storeId],
    queryFn: async () => {
      const query = supabase
        .from(table as any)
        .select(options?.select || "*")
        .eq("store_id", storeId!);
      
      if (options?.orderBy) {
        query.order(options.orderBy, { ascending: false });
      } else {
        query.order("created_at", { ascending: false });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as T[];
    },
    enabled: !!storeId && (options?.enabled !== false),
  });
}

export function useStoreMutation(table: string, key: string) {
  const queryClient = useQueryClient();
  const { storeId, user } = useAuth();

  // Determine entity type for audit
  const entityType = (
    table === "products" ? "product" :
    table === "orders" ? "order" :
    table === "filaments" ? "filament" :
    table === "store_customers" ? "customer" :
    table === "packaging" ? "packaging" :
    table === "printers" ? "printer" : "product"
  ) as "product" | "order" | "filament" | "customer" | "packaging" | "printer";

  const insertMutation = useMutation({
    mutationFn: async (values: Record<string, any>) => {
      const { data, error } = await supabase
        .from(table as any)
        .insert({ ...values, store_id: storeId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [key] });
      toast.success("Cadastrado com sucesso!");
      if (storeId && user?.id && data?.id) {
        logAudit({ storeId, userId: user.id, entityType, entityId: data.id, action: "created", details: { name: data.name } });
      }
    },
    onError: (error: any) => {
      toast.error("Erro: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...values }: Record<string, any>) => {
      const { data, error } = await supabase
        .from(table as any)
        .update(values)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [key] });
      toast.success("Atualizado com sucesso!");
      if (storeId && user?.id && data?.id) {
        logAudit({ storeId, userId: user.id, entityType, entityId: data.id, action: "updated", details: { name: data.name } });
      }
    },
    onError: (error: any) => {
      toast.error("Erro: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(table as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id: string) => {
      queryClient.invalidateQueries({ queryKey: [key] });
      toast.success("Removido com sucesso!");
      if (storeId && user?.id) {
        logAudit({ storeId, userId: user.id, entityType, entityId: id, action: "deleted" });
      }
    },
    onError: (error: any) => {
      toast.error("Erro: " + error.message);
    },
  });

  return { insertMutation, updateMutation, deleteMutation };
}
