import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, PackageOpen, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStoreQuery, useStoreMutation } from "@/hooks/useStoreData";
import type { Tables } from "@/integrations/supabase/types";

export default function StoreAdminPackaging() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", type: "caixa", dimensions: "", cost: "", quantity: "", supplier: "", notes: "" });

  const { data: packaging, isLoading } = useStoreQuery<Tables<"packaging">>("packaging", "packaging");
  const { insertMutation, updateMutation, deleteMutation } = useStoreMutation("packaging", "packaging");

  const resetForm = () => {
    setForm({ name: "", type: "caixa", dimensions: "", cost: "", quantity: "", supplier: "", notes: "" });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name, type: form.type,
      dimensions: form.dimensions || null, supplier: form.supplier || null, notes: form.notes || null,
      cost: form.cost ? parseFloat(form.cost) : 0,
      quantity: form.quantity ? parseInt(form.quantity) : 0,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload }, { onSuccess: () => { setOpen(false); resetForm(); } });
    } else {
      insertMutation.mutate(payload, { onSuccess: () => { setOpen(false); resetForm(); } });
    }
  };

  const handleEdit = (p: Tables<"packaging">) => {
    setForm({
      name: p.name, type: p.type, dimensions: p.dimensions || "",
      cost: String(p.cost || ""), quantity: String(p.quantity || ""),
      supplier: p.supplier || "", notes: p.notes || "",
    });
    setEditingId(p.id);
    setOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Embalagens</h1>
          <p className="text-muted-foreground mt-1">Controle de estoque de embalagens</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Nova Embalagem</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">{editingId ? "Editar" : "Nova"} Embalagem</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Caixa Pequena" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="caixa">Caixa</SelectItem>
                      <SelectItem value="sacola">Sacola</SelectItem>
                      <SelectItem value="envelope">Envelope</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Dimensões</Label>
                <Input value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} placeholder="20x15x10 cm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Custo (R$)</Label>
                  <Input type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Qtd em estoque</Label>
                  <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
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

      <Card className="border-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Carregando...</div>
          ) : !packaging || packaging.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <PackageOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhuma embalagem cadastrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Dimensões</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Custo</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packaging.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                    <TableCell>{p.dimensions || "—"}</TableCell>
                    <TableCell>{p.quantity || 0}</TableCell>
                    <TableCell>R$ {Number(p.cost || 0).toFixed(2)}</TableCell>
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
