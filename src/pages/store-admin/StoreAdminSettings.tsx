import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, CreditCard, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export default function StoreAdminSettings() {
  const { user, storeId } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "" });

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: store } = useQuery({
    queryKey: ["my-store-sub", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*, subscription_plans(*)")
        .eq("id", storeId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const { data: saasConfig } = useQuery({
    queryKey: ["saas-whatsapp"],
    queryFn: async () => {
      const { data } = await supabase.from("saas_config").select("saas_whatsapp_number").limit(1).single();
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setForm({ full_name: profile.full_name || "", phone: profile.phone || "" });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name,
      phone: form.phone,
    }).eq("user_id", user.id);
    if (error) toast.error("Erro: " + error.message);
    else toast.success("Dados atualizados!");
    setSaving(false);
  };

  const planName = (store as any)?.subscription_plans?.name || "Sem plano";
  const subscriptionStatus = store?.subscription_status || "trial";

  const handleUpgrade = () => {
    const whatsapp = saasConfig?.saas_whatsapp_number;
    if (whatsapp) {
      const msg = encodeURIComponent(`Olá! Gostaria de alterar meu plano de assinatura. Loja: ${store?.name || "N/A"}`);
      window.open(`https://wa.me/${whatsapp}?text=${msg}`, "_blank");
    } else {
      toast.info("Entre em contato com o administrador da plataforma.");
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Dados pessoais e assinatura</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="opacity-60" />
            </div>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Plano atual:</span>
              <Badge variant={subscriptionStatus === "trial" ? "secondary" : "default"}>{planName}</Badge>
              <Badge variant="outline">{subscriptionStatus}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Para trocar de plano, entre em contato via WhatsApp.
            </p>
            <Button variant="outline" className="gap-2" onClick={handleUpgrade}>
              <ExternalLink className="w-4 h-4" /> Solicitar Upgrade via WhatsApp
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
