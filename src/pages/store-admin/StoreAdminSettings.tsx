import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, User, CreditCard } from "lucide-react";

export default function StoreAdminSettings() {
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
              <Input placeholder="Seu nome" />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input placeholder="(11) 99999-9999" />
            </div>
            <Button>Salvar</Button>
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
              <Badge variant="secondary">Trial</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Para trocar de plano, entre em contato via WhatsApp.
            </p>
            <Button variant="outline" className="gap-2">
              <CreditCard className="w-4 h-4" /> Solicitar Upgrade
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
