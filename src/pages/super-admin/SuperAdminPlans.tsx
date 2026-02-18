import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function SuperAdminPlans() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxProducts, setMaxProducts] = useState("10");
  const [price, setPrice] = useState("0");
  const [isTrial, setIsTrial] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("subscription_plans").insert({
      name,
      description,
      max_products: parseInt(maxProducts),
      price_monthly: parseFloat(price),
      is_trial: isTrial,
    });

    if (error) {
      toast.error("Erro ao criar plano: " + error.message);
    } else {
      toast.success("Plano criado com sucesso!");
      setOpen(false);
      setName("");
      setDescription("");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Planos de Assinatura</h1>
          <p className="text-muted-foreground mt-1">Gerencie os planos disponíveis para assinantes</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Criar Plano</DialogTitle>
              <DialogDescription>Configure um novo plano de assinatura</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Plano</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: Profissional" />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição do plano" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max. Produtos</Label>
                  <Input type="number" value={maxProducts} onChange={(e) => setMaxProducts(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Preço Mensal (R$)</Label>
                  <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={isTrial} onCheckedChange={setIsTrial} />
                <Label>Plano Trial (gratuito)</Label>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Criando..." : "Criar Plano"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="text-center py-16 text-muted-foreground">
            <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Nenhum plano criado</p>
            <p className="text-sm mt-1">Crie um plano trial para que novos usuários possam se cadastrar</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
