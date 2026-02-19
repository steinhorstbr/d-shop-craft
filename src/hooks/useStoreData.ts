import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  const { storeId } = useAuth();

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [key] });
      toast.success("Cadastrado com sucesso!");
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [key] });
      toast.success("Atualizado com sucesso!");
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [key] });
      toast.success("Removido com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro: " + error.message);
    },
  });

  return { insertMutation, updateMutation, deleteMutation };
}
