import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";

const paymentMethodOptions = [
  { value: "pix", label: "PIX" },
  { value: "cartao", label: "Cartão" },
  { value: "boleto", label: "Boleto" },
  { value: "transferencia", label: "Transferência" },
];

export default function SuperAdminPlans() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", max_products: "10", max_photos_per_product: "6",
    price_monthly: "0", is_trial: false, payment_methods: [] as string[],
  });

  const { data: plans, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subscription_plans").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Tables<"subscription_plans">[];
    },
  });

  const resetForm = () => {
    setForm({ name: "", description: "", max_products: "10", max_photos_per_product: "6", price_monthly: "0", is_trial: false, payment_methods: [] });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description || null,
      max_products: parseInt(form.max_products),
      max_photos_per_product: parseInt(form.max_photos_per_product),
      price_monthly: parseFloat(form.price_monthly),
      is_trial: form.is_trial,
      payment_methods: form.payment_methods,
    };

    if (editingId) {
      const { error } = await supabase.from("subscription_plans").update(payload).eq("id", editingId);
      if (error) toast.error("Erro: " + error.message);
      else toast.success("Plano atualizado!");
    } else {
      const { error } = await supabase.from("subscription_plans").insert(payload);
      if (error) toast.error("Erro: " + error.message);
      else toast.success("Plano criado!");
    }
    queryClient.invalidateQueries({ queryKey: ["plans"] });
    setOpen(false);
    resetForm();
  };

  const handleEdit = (p: Tables<"subscription_plans">) => {
    setForm({
      name: p.name, description: p.description || "",
      max_products: String(p.max_products), max_photos_per_product: String(p.max_photos_per_product),
      price_monthly: String(p.price_monthly), is_trial: p.is_trial,
      payment_methods: (p.payment_methods || []) as string[],
    });
    setEditingId(p.id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("subscription_plans").delete().eq("id", id);
    if (error) toast.error("Erro: " + error.message);
    else { toast.success("Plano removido!"); queryClient.invalidateQueries({ queryKey: ["plans"] }); }
  };

  const togglePaymentMethod = (method: string) => {
    setForm(prev => ({
      ...prev,
      payment_methods: prev.payment_methods.includes(method)
        ? prev.payment_methods.filter(m => m !== method)
        : [...prev.payment_methods, method],
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Planos de Assinatura</h1>
          <p className="text-muted-foreground mt-1">Gerencie os planos disponíveis para assinantes</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Novo Plano</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">{editingId ? "Editar" : "Criar"} Plano</DialogTitle>
              <DialogDescription>Configure um plano de assinatura</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Plano *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Ex: Profissional" />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Max. Produtos</Label>
                  <Input type="number" value={form.max_products} onChange={(e) => setForm({ ...form, max_products: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Max. Fotos</Label>
                  <Input type="number" value={form.max_photos_per_product} onChange={(e) => setForm({ ...form, max_photos_per_product: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Preço Mensal (R$)</Label>
                  <Input type="number" step="0.01" value={form.price_monthly} onChange={(e) => setForm({ ...form, price_monthly: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Meios de Pagamento</Label>
                <div className="flex gap-4 flex-wrap">
                  {paymentMethodOptions.map(pm => (
                    <div key={pm.value} className="flex items-center gap-2">
                      <Checkbox checked={form.payment_methods.includes(pm.value)} onCheckedChange={() => togglePaymentMethod(pm.value)} />
                      <span className="text-sm">{pm.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.is_trial} onCheckedChange={(v) => setForm({ ...form, is_trial: v })} />
                <Label>Plano Trial (gratuito)</Label>
              </div>
              <Button type="submit" className="w-full">{editingId ? "Salvar" : "Criar Plano"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Carregando...</div>
          ) : !plans || plans.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhum plano criado</p>
              <p className="text-sm mt-1">Crie um plano trial para que novos usuários possam se cadastrar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Max. Produtos</TableHead>
                  <TableHead>Pagamentos</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>R$ {Number(p.price_monthly).toFixed(2)}</TableCell>
                    <TableCell>{p.max_products}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {((p.payment_methods || []) as string[]).map(m => (
                          <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{p.is_trial ? <Badge variant="secondary">Trial</Badge> : <Badge>Pago</Badge>}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(p)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
