import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Palette, MessageSquare } from "lucide-react";

export default function StoreAdminStoreSettings() {
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
              <Input placeholder="Minha Loja 3D" />
            </div>
            <div className="space-y-2">
              <Label>Texto do Cabeçalho</Label>
              <Input placeholder="Bem-vindo à nossa loja!" />
            </div>
            <div className="space-y-2">
              <Label>Texto do Rodapé</Label>
              <Input placeholder="© 2025 Minha Loja 3D" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cor Primária</Label>
                <div className="flex gap-2">
                  <Input type="color" defaultValue="#06b6d4" className="w-12 h-10 p-1" />
                  <Input defaultValue="#06b6d4" className="flex-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input type="color" defaultValue="#0f172a" className="w-12 h-10 p-1" />
                  <Input defaultValue="#0f172a" className="flex-1" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Colunas de Produtos</Label>
              <Input type="number" defaultValue="3" min="1" max="5" />
            </div>
            <Button>Salvar Aparência</Button>
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
              <Input placeholder="5511999999999" />
            </div>
            <div className="flex items-center gap-3">
              <Switch defaultChecked />
              <Label>Ativar botão flutuante do WhatsApp</Label>
            </div>
            <Button>Salvar WhatsApp</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
