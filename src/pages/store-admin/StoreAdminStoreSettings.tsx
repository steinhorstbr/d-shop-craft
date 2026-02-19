import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Palette, MessageSquare, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";

export default function StoreAdminStoreSettings() {
  const { storeId } = useAuth();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", header_text: "", footer_text: "",
    primary_color: "#06b6d4", secondary_color: "#0f172a",
    product_columns: "3", whatsapp_number: "", whatsapp_floating_enabled: true,
  });

  const { data: store } = useQuery({
    queryKey: ["my-store", storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from("stores").select("*").eq("id", storeId!).single();
      if (error) throw error;
      return data as Tables<"stores">;
    },
    enabled: !!storeId,
  });

  useEffect(() => {
    if (store) {
      setForm({
        name: store.name || "",
        header_text: store.header_text || "",
        footer_text: store.footer_text || "",
        primary_color: store.primary_color || "#06b6d4",
        secondary_color: store.secondary_color || "#0f172a",
        product_columns: String(store.product_columns || 3),
        whatsapp_number: store.whatsapp_number || "",
        whatsapp_floating_enabled: store.whatsapp_floating_enabled ?? true,
      });
    }
  }, [store]);

  const handleSave = async () => {
    if (!storeId) return;
    setSaving(true);
    const { error } = await supabase.from("stores").update({
      name: form.name,
      header_text: form.header_text,
      footer_text: form.footer_text,
      primary_color: form.primary_color,
      secondary_color: form.secondary_color,
      product_columns: parseInt(form.product_columns) || 3,
      whatsapp_number: form.whatsapp_number,
      whatsapp_floating_enabled: form.whatsapp_floating_enabled,
    }).eq("id", storeId);

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success("Configurações salvas!");
      queryClient.invalidateQueries({ queryKey: ["my-store"] });
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Configurações da Loja</h1>
        <p className="text-muted-foreground mt-1">Personalize a aparência da sua vitrine</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" /> Aparência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Loja</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Texto do Cabeçalho</Label>
              <Input value={form.header_text} onChange={(e) => setForm({ ...form, header_text: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Texto do Rodapé</Label>
              <Input value={form.footer_text} onChange={(e) => setForm({ ...form, footer_text: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cor Primária</Label>
                <div className="flex gap-2">
                  <Input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="w-12 h-10 p-1" />
                  <Input value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="flex-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input type="color" value={form.secondary_color} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} className="w-12 h-10 p-1" />
                  <Input value={form.secondary_color} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} className="flex-1" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Colunas de Produtos</Label>
              <Input type="number" min="1" max="5" value={form.product_columns} onChange={(e) => setForm({ ...form, product_columns: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Número WhatsApp (com DDD)</Label>
              <Input value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} placeholder="5511999999999" />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.whatsapp_floating_enabled} onCheckedChange={(v) => setForm({ ...form, whatsapp_floating_enabled: v })} />
              <Label>Ativar botão flutuante do WhatsApp</Label>
            </div>
          </CardContent>
        </Card>

        <Button className="gap-2" onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar Todas as Configurações"}
        </Button>
      </div>
    </div>
  );
}
