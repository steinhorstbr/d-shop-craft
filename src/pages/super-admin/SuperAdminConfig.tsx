import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Server, Mail, MessageSquare, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function SuperAdminConfig() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    s3_bucket_name: "", s3_region: "", s3_endpoint: "", s3_access_key: "", s3_secret_key: "",
    smtp_host: "", smtp_port: "", smtp_user: "", smtp_password: "", smtp_from_email: "",
    saas_whatsapp_number: "",
  });

  const { data: config } = useQuery({
    queryKey: ["saas-config"],
    queryFn: async () => {
      const { data, error } = await supabase.from("saas_config").select("*").limit(1).single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  useEffect(() => {
    if (config) {
      setForm({
        s3_bucket_name: config.s3_bucket_name || "",
        s3_region: config.s3_region || "",
        s3_endpoint: config.s3_endpoint || "",
        s3_access_key: config.s3_access_key || "",
        s3_secret_key: config.s3_secret_key || "",
        smtp_host: config.smtp_host || "",
        smtp_port: String(config.smtp_port || ""),
        smtp_user: config.smtp_user || "",
        smtp_password: config.smtp_password || "",
        smtp_from_email: config.smtp_from_email || "",
        saas_whatsapp_number: config.saas_whatsapp_number || "",
      });
    }
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      smtp_port: form.smtp_port ? parseInt(form.smtp_port) : null,
    };

    if (config) {
      const { error } = await supabase.from("saas_config").update(payload).eq("id", config.id);
      if (error) toast.error("Erro: " + error.message);
      else toast.success("Configurações salvas!");
    } else {
      const { error } = await supabase.from("saas_config").insert(payload);
      if (error) toast.error("Erro: " + error.message);
      else toast.success("Configurações criadas!");
    }
    queryClient.invalidateQueries({ queryKey: ["saas-config"] });
    setSaving(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Configurações gerais da plataforma</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" /> Armazenamento S3
            </CardTitle>
            <CardDescription>Configure o bucket S3 para fotos e arquivos STL/3MF</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bucket Name</Label>
                <Input value={form.s3_bucket_name} onChange={(e) => setForm({ ...form, s3_bucket_name: e.target.value })} placeholder="my-3d-bucket" />
              </div>
              <div className="space-y-2">
                <Label>Região</Label>
                <Input value={form.s3_region} onChange={(e) => setForm({ ...form, s3_region: e.target.value })} placeholder="us-east-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Endpoint (opcional)</Label>
              <Input value={form.s3_endpoint} onChange={(e) => setForm({ ...form, s3_endpoint: e.target.value })} placeholder="https://s3.amazonaws.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Access Key</Label>
                <Input type="password" value={form.s3_access_key} onChange={(e) => setForm({ ...form, s3_access_key: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Secret Key</Label>
                <Input type="password" value={form.s3_secret_key} onChange={(e) => setForm({ ...form, s3_secret_key: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" /> SMTP
            </CardTitle>
            <CardDescription>Configure o servidor de email para notificações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Host</Label>
                <Input value={form.smtp_host} onChange={(e) => setForm({ ...form, smtp_host: e.target.value })} placeholder="smtp.gmail.com" />
              </div>
              <div className="space-y-2">
                <Label>Porta</Label>
                <Input value={form.smtp_port} onChange={(e) => setForm({ ...form, smtp_port: e.target.value })} placeholder="587" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Usuário</Label>
                <Input value={form.smtp_user} onChange={(e) => setForm({ ...form, smtp_user: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input type="password" value={form.smtp_password} onChange={(e) => setForm({ ...form, smtp_password: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email de Envio</Label>
              <Input value={form.smtp_from_email} onChange={(e) => setForm({ ...form, smtp_from_email: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> WhatsApp
            </CardTitle>
            <CardDescription>Número do WhatsApp para troca de assinatura</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Número WhatsApp (com DDD)</Label>
              <Input value={form.saas_whatsapp_number} onChange={(e) => setForm({ ...form, saas_whatsapp_number: e.target.value })} placeholder="5511999999999" />
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
