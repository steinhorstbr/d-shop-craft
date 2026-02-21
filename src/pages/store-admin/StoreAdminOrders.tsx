import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingCart, Pencil, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useStoreQuery, useStoreMutation } from "@/hooks/useStoreData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

const productionStatuses = [
  { value: "aguardando", label: "Aguardando", color: "secondary" },
  { value: "em_producao", label: "Em Produção", color: "default" },
  { value: "concluido", label: "Concluído", color: "default" },
] as const;

const paymentStatuses = [
  { value: "aguardando", label: "Aguardando" },
  { value: "pago", label: "Pago" },
  { value: "reembolsado", label: "Reembolsado" },
  { value: "cancelado", label: "Cancelado" },
];

export default function StoreAdminOrders() {
  const { storeId } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    customer_id: "", printer_id: "", filament_id: "", packaging_id: "",
    production_status: "aguardando", payment_status: "aguardando",
    production_notes: "", total_amount: "",
  });
  const [orderItems, setOrderItems] = useState<{ product_id: string; quantity: string; unit_price: string; color_selected: string; customization_text: string; notes: string }[]>([]);

  const { data: orders, isLoading } = useStoreQuery<any>("orders", "orders");
  const { data: customers } = useStoreQuery<Tables<"store_customers">>("customers", "store_customers");
  const { data: products } = useStoreQuery<Tables<"products">>("products", "products");
  const { data: printers } = useStoreQuery<Tables<"printers">>("printers", "printers");
  const { data: filaments } = useStoreQuery<Tables<"filaments">>("filaments", "filaments");
  const { data: packaging } = useStoreQuery<Tables<"packaging">>("packaging", "packaging");
  const { deleteMutation } = useStoreMutation("orders", "orders");

  const resetForm = () => {
    setForm({
      customer_id: "", printer_id: "", filament_id: "", packaging_id: "",
      production_status: "aguardando", payment_status: "aguardando",
      production_notes: "", total_amount: "",
    });
    setOrderItems([]);
    setEditingId(null);
  };

  const addItem = () => {
    setOrderItems([...orderItems, { product_id: "", quantity: "1", unit_price: "0", color_selected: "", customization_text: "", notes: "" }]);
  };

  const updateItem = (index: number, field: string, value: string) => {
    const items = [...orderItems];
    (items[index] as any)[field] = value;
    // Auto-fill price when product selected
    if (field === "product_id") {
      const product = products?.find(p => p.id === value);
      if (product) {
        items[index].unit_price = String(product.is_on_sale && product.sale_price_promotional ? product.sale_price_promotional : product.sale_price);
      }
    }
    setOrderItems(items);
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const totalCalc = orderItems.reduce((sum, item) => sum + (parseFloat(item.unit_price) || 0) * (parseInt(item.quantity) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;

    const orderPayload = {
      store_id: storeId,
      customer_id: form.customer_id || null,
      printer_id: form.printer_id || null,
      filament_id: form.filament_id || null,
      packaging_id: form.packaging_id || null,
      production_status: form.production_status,
      payment_status: form.payment_status,
      production_notes: form.production_notes || null,
      total_amount: totalCalc,
    };

    if (editingId) {
      const { error } = await supabase.from("orders").update(orderPayload).eq("id", editingId);
      if (error) { toast.error("Erro: " + error.message); return; }
      // Delete existing items and re-insert
      await supabase.from("order_items").delete().eq("order_id", editingId);
      if (orderItems.length > 0) {
        await supabase.from("order_items").insert(orderItems.map(item => ({
          order_id: editingId,
          product_id: item.product_id || null,
          quantity: parseInt(item.quantity) || 1,
          unit_price: parseFloat(item.unit_price) || 0,
          color_selected: item.color_selected || null,
          customization_text: item.customization_text || null,
          notes: item.notes || null,
        })));
      }
      toast.success("Pedido atualizado!");
    } else {
      const { data: order, error } = await supabase.from("orders").insert(orderPayload).select().single();
      if (error) { toast.error("Erro: " + error.message); return; }
      if (orderItems.length > 0) {
        await supabase.from("order_items").insert(orderItems.map(item => ({
          order_id: order.id,
          product_id: item.product_id || null,
          quantity: parseInt(item.quantity) || 1,
          unit_price: parseFloat(item.unit_price) || 0,
          color_selected: item.color_selected || null,
          customization_text: item.customization_text || null,
          notes: item.notes || null,
        })));
      }
      toast.success("Pedido criado!");
    }

    queryClient.invalidateQueries({ queryKey: ["orders"] });
    setOpen(false);
    resetForm();
  };

  const handleComplete = async (order: any) => {
    // Mark as completed and deduct filament
    await supabase.from("orders").update({ production_status: "concluido" }).eq("id", order.id);

    if (order.filament_id) {
      // Get order items to calculate total weight
      const { data: items } = await supabase.from("order_items").select("product_id, quantity").eq("order_id", order.id);
      if (items) {
        let totalWeight = 0;
        for (const item of items) {
          if (item.product_id) {
            const product = products?.find(p => p.id === item.product_id);
            if (product) totalWeight += Number(product.weight_grams || 0) * item.quantity;
          }
        }
        if (totalWeight > 0) {
          const filament = filaments?.find(f => f.id === order.filament_id);
          if (filament) {
            const newQty = Math.max(0, Number(filament.quantity_grams) - totalWeight);
            await supabase.from("filaments").update({ quantity_grams: newQty }).eq("id", order.filament_id);
            queryClient.invalidateQueries({ queryKey: ["filaments"] });
          }
        }
      }
    }
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    toast.success("Pedido concluído! Estoque de filamento atualizado.");
  };

  const handleEdit = async (order: any) => {
    setForm({
      customer_id: order.customer_id || "",
      printer_id: order.printer_id || "",
      filament_id: order.filament_id || "",
      packaging_id: order.packaging_id || "",
      production_status: order.production_status || "aguardando",
      payment_status: order.payment_status || "aguardando",
      production_notes: order.production_notes || "",
      total_amount: String(order.total_amount || ""),
    });
    // Load order items
    const { data: items } = await supabase.from("order_items").select("*").eq("order_id", order.id);
    if (items && items.length > 0) {
      setOrderItems(items.map((item: any) => ({
        product_id: item.product_id || "",
        quantity: String(item.quantity),
        unit_price: String(item.unit_price),
        color_selected: item.color_selected || "",
        customization_text: item.customization_text || "",
        notes: item.notes || "",
      })));
    } else {
      setOrderItems([]);
    }
    setEditingId(order.id);
    setOpen(true);
  };

  const updateOrderStatus = async (orderId: string, field: string, value: string) => {
    await supabase.from("orders").update({ [field]: value }).eq("id", orderId);
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const getStatusBadge = (status: string, type: "production" | "payment") => {
    const map: Record<string, string> = {
      aguardando: "secondary",
      em_producao: "default",
      concluido: "outline",
      pago: "default",
      reembolsado: "destructive",
      cancelado: "destructive",
    };
    return <Badge variant={(map[status] || "secondary") as any}>{status === "em_producao" ? "Em Produção" : status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Pedidos</h1>
          <p className="text-muted-foreground mt-1">Gerencie os pedidos de produção</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Novo Pedido</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">{editingId ? "Editar" : "Novo"} Pedido</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {customers?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Impressora</Label>
                  <Select value={form.printer_id} onValueChange={(v) => setForm({ ...form, printer_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {printers?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Filamento</Label>
                  <Select value={form.filament_id} onValueChange={(v) => setForm({ ...form, filament_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {filaments?.map(f => <SelectItem key={f.id} value={f.id}>{f.name} - {f.color} ({Number(f.quantity_grams).toFixed(0)}g)</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Embalagem</Label>
                  <Select value={form.packaging_id} onValueChange={(v) => setForm({ ...form, packaging_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {packaging?.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.quantity} un)</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status Produção</Label>
                  <Select value={form.production_status} onValueChange={(v) => setForm({ ...form, production_status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {productionStatuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status Pagamento</Label>
                  <Select value={form.payment_status} onValueChange={(v) => setForm({ ...form, payment_status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {paymentStatuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />
              <div className="flex items-center justify-between">
                <h4 className="font-display font-semibold text-sm">Itens do Pedido</h4>
                <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
                  <Plus className="w-3 h-3" /> Adicionar Item
                </Button>
              </div>

              {orderItems.map((item, i) => (
                <div key={i} className="p-3 rounded-lg border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Item {i + 1}</span>
                    <Button type="button" variant="ghost" size="sm" className="text-destructive h-7" onClick={() => removeItem(i)}>Remover</Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Produto</Label>
                      <Select value={item.product_id} onValueChange={(v) => updateItem(i, "product_id", v)}>
                        <SelectTrigger className="h-8"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {products?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Qtd</Label>
                      <Input className="h-8" type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Preço Unit.</Label>
                      <Input className="h-8" type="number" step="0.01" value={item.unit_price} onChange={(e) => updateItem(i, "unit_price", e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Cor</Label>
                      <Input className="h-8" value={item.color_selected} onChange={(e) => updateItem(i, "color_selected", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Personalização</Label>
                      <Input className="h-8" value={item.customization_text} onChange={(e) => updateItem(i, "customization_text", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center font-display font-bold text-lg">
                <span>Total:</span>
                <span className="text-primary">R$ {totalCalc.toFixed(2)}</span>
              </div>

              <div className="space-y-2">
                <Label>Observações de Produção</Label>
                <Textarea value={form.production_notes} onChange={(e) => setForm({ ...form, production_notes: e.target.value })} />
              </div>

              <Button type="submit" className="w-full">{editingId ? "Salvar" : "Criar Pedido"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Carregando...</div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhum pedido cadastrado</p>
              <p className="text-sm mt-1">Os pedidos aparecerão aqui quando cadastrados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Produção</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-32">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o: any) => {
                  const customer = customers?.find(c => c.id === o.customer_id);
                  return (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium text-xs">#{o.id.slice(0, 8)}</TableCell>
                      <TableCell>{customer?.name || "—"}</TableCell>
                      <TableCell className="font-bold">R$ {Number(o.total_amount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Select value={o.production_status} onValueChange={(v) => updateOrderStatus(o.id, "production_status", v)}>
                          <SelectTrigger className="h-7 w-auto">{getStatusBadge(o.production_status, "production")}</SelectTrigger>
                          <SelectContent>
                            {productionStatuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select value={o.payment_status} onValueChange={(v) => updateOrderStatus(o.id, "payment_status", v)}>
                          <SelectTrigger className="h-7 w-auto">{getStatusBadge(o.payment_status, "payment")}</SelectTrigger>
                          <SelectContent>
                            {paymentStatuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar pedido" onClick={() => handleEdit(o)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {o.production_status !== "concluido" && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Marcar como concluído" onClick={() => handleComplete(o)}>
                              <CheckCircle className="w-4 h-4 text-success" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(o.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
