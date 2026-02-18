import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings, Server, Mail, MessageSquare } from "lucide-react";

export default function SuperAdminConfig() {
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
                <Input placeholder="my-3d-bucket" />
              </div>
              <div className="space-y-2">
                <Label>Região</Label>
                <Input placeholder="us-east-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Endpoint (opcional)</Label>
              <Input placeholder="https://s3.amazonaws.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Access Key</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>Secret Key</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
            </div>
            <Button>Salvar Configuração S3</Button>
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
                <Input placeholder="smtp.gmail.com" />
              </div>
              <div className="space-y-2">
                <Label>Porta</Label>
                <Input placeholder="587" type="number" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Usuário</Label>
                <Input placeholder="email@dominio.com" />
              </div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email de Envio</Label>
              <Input placeholder="noreply@dominio.com" />
            </div>
            <Button>Salvar Configuração SMTP</Button>
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
              <Input placeholder="5511999999999" />
            </div>
            <Button>Salvar</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
