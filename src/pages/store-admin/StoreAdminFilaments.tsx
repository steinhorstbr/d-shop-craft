import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Layers, Pencil, Trash2, PackagePlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStoreQuery, useStoreMutation } from "@/hooks/useStoreData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";

export default function StoreAdminFilaments() {
  const { storeId } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [entryOpen, setEntryOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [entryFilamentId, setEntryFilamentId] = useState<string | null>(null);
  const [entryForm, setEntryForm] = useState({ quantity_grams: "", price_paid: "", supplier: "", brand: "", notes: "" });
  const [form, setForm] = useState({
    name: "", material: "", color: "", brand: "", price_per_kg: "", quantity_grams: "", supplier: "", notes: ""
  });

  const { data: filaments, isLoading } = useStoreQuery<Tables<"filaments">>("filaments", "filaments");
  const { insertMutation, updateMutation, deleteMutation } = useStoreMutation("filaments", "filaments");

  const resetForm = () => {
    setForm({ name: "", material: "", color: "", brand: "", price_per_kg: "", quantity_grams: "", supplier: "", notes: "" });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name, material: form.material, color: form.color,
      brand: form.brand || null, supplier: form.supplier || null, notes: form.notes || null,
      price_per_kg: parseFloat(form.price_per_kg) || 0,
      quantity_grams: parseFloat(form.quantity_grams) || 0,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload }, { onSuccess: () => { setOpen(false); resetForm(); } });
    } else {
      insertMutation.mutate(payload, { onSuccess: () => { setOpen(false); resetForm(); } });
    }
  };

  const handleEdit = (f: Tables<"filaments">) => {
    setForm({
      name: f.name, material: f.material, color: f.color,
      brand: f.brand || "", supplier: f.supplier || "", notes: f.notes || "",
      price_per_kg: String(f.price_per_kg), quantity_grams: String(f.quantity_grams),
    });
    setEditingId(f.id);
    setOpen(true);
  };

  const handleEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryFilamentId) return;
    const qty = parseFloat(entryForm.quantity_grams);
    // Add purchase record
    const { error: purchaseError } = await supabase.from("filament_purchases").insert({
      filament_id: entryFilamentId,
      quantity_grams: qty,
      price_paid: entryForm.price_paid ? parseFloat(entryForm.price_paid) : null,
      supplier: entryForm.supplier || null,
      brand: entryForm.brand || null,
      notes: entryForm.notes || null,
    });
    if (purchaseError) { toast.error("Erro: " + purchaseError.message); return; }
    // Update filament stock
    const filament = filaments?.find(f => f.id === entryFilamentId);
    if (filament) {
      await supabase.from("filaments").update({
        quantity_grams: Number(filament.quantity_grams) + qty,
        last_purchase_date: new Date().toISOString().split("T")[0],
      }).eq("id", entryFilamentId);
    }
    queryClient.invalidateQueries({ queryKey: ["filaments"] });
    toast.success("Entrada de estoque registrada!");
    setEntryOpen(false);
    setEntryForm({ quantity_grams: "", price_paid: "", supplier: "", brand: "", notes: "" });
  };

  const openEntry = (id: string) => {
    setEntryFilamentId(id);
    setEntryOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Filamentos</h1>
          <p className="text-muted-foreground mt-1">Controle de estoque de filamentos</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Novo Filamento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">{editingId ? "Editar" : "Novo"} Filamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Ex: PLA Branco" />
                </div>
                <div className="space-y-2">
                  <Label>Material *</Label>
                  <Input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} required placeholder="PLA, PETG, ABS..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cor *</Label>
                  <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} required placeholder="Branco" />
                </div>
                <div className="space-y-2">
                  <Label>Marca</Label>
                  <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="3D Fila" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço/kg (R$) *</Label>
                  <Input type="number" step="0.01" value={form.price_per_kg} onChange={(e) => setForm({ ...form, price_per_kg: e.target.value })} required placeholder="89.90" />
                </div>
                <div className="space-y-2">
                  <Label>Estoque (g)</Label>
                  <Input type="number" step="0.01" value={form.quantity_grams} onChange={(e) => setForm({ ...form, quantity_grams: e.target.value })} placeholder="1000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <Button type="submit" className="w-full" disabled={insertMutation.isPending || updateMutation.isPending}>
                {editingId ? "Salvar" : "Cadastrar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Entry dialog */}
      <Dialog open={entryOpen} onOpenChange={setEntryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Entrada de Estoque</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEntry} className="space-y-4">
            <div className="space-y-2">
              <Label>Quantidade (g) *</Label>
              <Input type="number" step="0.01" value={entryForm.quantity_grams} onChange={(e) => setEntryForm({ ...entryForm, quantity_grams: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço Pago (R$)</Label>
                <Input type="number" step="0.01" value={entryForm.price_paid} onChange={(e) => setEntryForm({ ...entryForm, price_paid: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Input value={entryForm.supplier} onChange={(e) => setEntryForm({ ...entryForm, supplier: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Marca</Label>
              <Input value={entryForm.brand} onChange={(e) => setEntryForm({ ...entryForm, brand: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={entryForm.notes} onChange={(e) => setEntryForm({ ...entryForm, notes: e.target.value })} />
            </div>
            <Button type="submit" className="w-full">Registrar Entrada</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="border-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Carregando...</div>
          ) : !filaments || filaments.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Layers className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhum filamento cadastrado</p>
              <p className="text-sm mt-1">Gerencie seu estoque de filamentos aqui</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Preço/kg</TableHead>
                  <TableHead className="w-32">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filaments.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell><Badge variant="secondary">{f.material}</Badge></TableCell>
                    <TableCell>{f.color}</TableCell>
                    <TableCell>
                      <span className={Number(f.quantity_grams) < 200 ? "text-destructive font-bold" : ""}>
                        {Number(f.quantity_grams).toFixed(0)}g
                      </span>
                    </TableCell>
                    <TableCell>R$ {Number(f.price_per_kg).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Entrada de estoque" onClick={() => openEntry(f.id)}>
                          <PackagePlus className="w-4 h-4 text-success" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(f)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(f.id)}>
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
