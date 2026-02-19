import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Printer, Pencil, Trash2, Zap, Wrench } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStoreQuery, useStoreMutation } from "@/hooks/useStoreData";
import type { Tables } from "@/integrations/supabase/types";

export default function StoreAdminPrinters() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", model: "", power_consumption_watts: "", maintenance_cost_monthly: "", notes: "" });

  const { data: printers, isLoading } = useStoreQuery<Tables<"printers">>("printers", "printers");
  const { insertMutation, updateMutation, deleteMutation } = useStoreMutation("printers", "printers");

  const resetForm = () => {
    setForm({ name: "", model: "", power_consumption_watts: "", maintenance_cost_monthly: "", notes: "" });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      model: form.model || null,
      power_consumption_watts: form.power_consumption_watts ? parseFloat(form.power_consumption_watts) : 0,
      maintenance_cost_monthly: form.maintenance_cost_monthly ? parseFloat(form.maintenance_cost_monthly) : 0,
      notes: form.notes || null,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload }, { onSuccess: () => { setOpen(false); resetForm(); } });
    } else {
      insertMutation.mutate(payload, { onSuccess: () => { setOpen(false); resetForm(); } });
    }
  };

  const handleEdit = (p: Tables<"printers">) => {
    setForm({
      name: p.name,
      model: p.model || "",
      power_consumption_watts: String(p.power_consumption_watts || ""),
      maintenance_cost_monthly: String(p.maintenance_cost_monthly || ""),
      notes: p.notes || "",
    });
    setEditingId(p.id);
    setOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Impressoras 3D</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas impressoras</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Nova Impressora</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">{editingId ? "Editar" : "Nova"} Impressora</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Ex: Ender 3 V2" />
              </div>
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Ex: Creality Ender 3 V2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Consumo (W)</Label>
                  <Input type="number" step="0.01" value={form.power_consumption_watts} onChange={(e) => setForm({ ...form, power_consumption_watts: e.target.value })} placeholder="350" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Wrench className="w-3.5 h-3.5" /> Manutenção/mês (R$)</Label>
                  <Input type="number" step="0.01" value={form.maintenance_cost_monthly} onChange={(e) => setForm({ ...form, maintenance_cost_monthly: e.target.value })} placeholder="50.00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <Button type="submit" className="w-full" disabled={insertMutation.isPending || updateMutation.isPending}>
                {editingId ? "Salvar Alterações" : "Cadastrar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Carregando...</div>
          ) : !printers || printers.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Printer className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhuma impressora cadastrada</p>
              <p className="text-sm mt-1">Cadastre suas impressoras para gerenciar produção</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Consumo (W)</TableHead>
                  <TableHead>Manutenção/mês</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {printers.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.model || "—"}</TableCell>
                    <TableCell>{p.power_consumption_watts || 0}W</TableCell>
                    <TableCell>R$ {Number(p.maintenance_cost_monthly || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(p)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(p.id)}>
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
