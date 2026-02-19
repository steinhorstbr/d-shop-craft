import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Pencil, Trash2, Calculator, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useStoreQuery, useStoreMutation } from "@/hooks/useStoreData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

// Cost calculator component
function CostCalculatorModal({ printers, filaments }: { printers: Tables<"printers">[]; filaments: Tables<"filaments">[] }) {
  const [calc, setCalc] = useState({
    printerId: "", filamentId: "", weightGrams: "", timeMinutes: "",
    wastePercent: "5", packagingCost: "0", postProductionCost: "0",
    cardFeePercent: "0", energyCostKwh: "0.80",
  });

  const printer = printers.find(p => p.id === calc.printerId);
  const filament = filaments.find(f => f.id === calc.filamentId);

  const weight = parseFloat(calc.weightGrams) || 0;
  const time = parseFloat(calc.timeMinutes) || 0;
  const waste = parseFloat(calc.wastePercent) || 0;
  const energyCost = parseFloat(calc.energyCostKwh) || 0;

  const filamentCostPerGram = filament ? Number(filament.price_per_kg) / 1000 : 0;
  const filamentTotal = weight * (1 + waste / 100) * filamentCostPerGram;
  const energyTotal = printer ? (Number(printer.power_consumption_watts) / 1000) * (time / 60) * energyCost : 0;
  const maintenancePerHour = printer ? Number(printer.maintenance_cost_monthly) / (30 * 8) : 0;
  const maintenanceTotal = maintenancePerHour * (time / 60);
  const packaging = parseFloat(calc.packagingCost) || 0;
  const postProduction = parseFloat(calc.postProductionCost) || 0;
  const subtotal = filamentTotal + energyTotal + maintenanceTotal + packaging + postProduction;
  const cardFee = parseFloat(calc.cardFeePercent) || 0;
  const totalCost = subtotal / (1 - cardFee / 100);
  const suggestedPrice2x = totalCost * 2;
  const suggestedPrice3x = totalCost * 3;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Impressora</Label>
          <Select value={calc.printerId} onValueChange={(v) => setCalc({ ...calc, printerId: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {printers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Filamento</Label>
          <Select value={calc.filamentId} onValueChange={(v) => setCalc({ ...calc, filamentId: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {filaments.map(f => <SelectItem key={f.id} value={f.id}>{f.name} ({f.material})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Peso (g)</Label>
          <Input type="number" value={calc.weightGrams} onChange={(e) => setCalc({ ...calc, weightGrams: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Tempo (min)</Label>
          <Input type="number" value={calc.timeMinutes} onChange={(e) => setCalc({ ...calc, timeMinutes: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Desperdício %</Label>
          <Input type="number" value={calc.wastePercent} onChange={(e) => setCalc({ ...calc, wastePercent: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Embalagem (R$)</Label>
          <Input type="number" step="0.01" value={calc.packagingCost} onChange={(e) => setCalc({ ...calc, packagingCost: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Pós-produção (R$)</Label>
          <Input type="number" step="0.01" value={calc.postProductionCost} onChange={(e) => setCalc({ ...calc, postProductionCost: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Taxa Cartão %</Label>
          <Input type="number" step="0.01" value={calc.cardFeePercent} onChange={(e) => setCalc({ ...calc, cardFeePercent: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Custo kWh (R$)</Label>
        <Input type="number" step="0.01" value={calc.energyCostKwh} onChange={(e) => setCalc({ ...calc, energyCostKwh: e.target.value })} />
      </div>

      <Separator />
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Filamento:</span><span>R$ {filamentTotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Energia:</span><span>R$ {energyTotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Manutenção:</span><span>R$ {maintenanceTotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Embalagem:</span><span>R$ {packaging.toFixed(2)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Pós-produção:</span><span>R$ {postProduction.toFixed(2)}</span></div>
        {cardFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Taxa Cartão:</span><span>R$ {(totalCost - subtotal).toFixed(2)}</span></div>}
        <Separator />
        <div className="flex justify-between font-bold text-base"><span>Custo Total:</span><span className="text-primary">R$ {totalCost.toFixed(2)}</span></div>
        <div className="flex justify-between text-success"><span>Sugerido (2x):</span><span>R$ {suggestedPrice2x.toFixed(2)}</span></div>
        <div className="flex justify-between text-success"><span>Sugerido (3x):</span><span>R$ {suggestedPrice3x.toFixed(2)}</span></div>
      </div>
    </div>
  );
}

export default function StoreAdminProducts() {
  const { storeId } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", sale_price: "", sale_price_promotional: "",
    is_on_sale: false, is_active: true, weight_grams: "", production_time_minutes: "",
    has_color_variation: false, color_options: "",
    is_customizable: false, customization_type: "",
    category_id: "", production_cost: "", packaging_cost: "", post_production_cost: "",
    card_fee_percent: "", waste_rate_percent: "5",
  });

  const { data: products, isLoading } = useStoreQuery<Tables<"products">>("products", "products");
  const { data: categories } = useStoreQuery<Tables<"product_categories">>("categories", "product_categories");
  const { data: printers } = useStoreQuery<Tables<"printers">>("printers", "printers");
  const { data: filaments } = useStoreQuery<Tables<"filaments">>("filaments", "filaments");
  const { insertMutation, updateMutation, deleteMutation } = useStoreMutation("products", "products");

  // Categories CRUD
  const [catOpen, setCatOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const handleAddCategory = async () => {
    if (!catName || !storeId) return;
    await supabase.from("product_categories").insert({ name: catName, store_id: storeId });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    setCatName("");
    setCatOpen(false);
    toast.success("Categoria criada!");
  };

  const resetForm = () => {
    setForm({
      name: "", description: "", sale_price: "", sale_price_promotional: "",
      is_on_sale: false, is_active: true, weight_grams: "", production_time_minutes: "",
      has_color_variation: false, color_options: "",
      is_customizable: false, customization_type: "",
      category_id: "", production_cost: "", packaging_cost: "", post_production_cost: "",
      card_fee_percent: "", waste_rate_percent: "5",
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, any> = {
      name: form.name, description: form.description || null,
      sale_price: parseFloat(form.sale_price) || 0,
      sale_price_promotional: form.sale_price_promotional ? parseFloat(form.sale_price_promotional) : null,
      is_on_sale: form.is_on_sale, is_active: form.is_active,
      weight_grams: form.weight_grams ? parseFloat(form.weight_grams) : 0,
      production_time_minutes: form.production_time_minutes ? parseInt(form.production_time_minutes) : 0,
      has_color_variation: form.has_color_variation,
      color_options: form.has_color_variation ? form.color_options.split(",").map(c => c.trim()).filter(Boolean) : [],
      is_customizable: form.is_customizable,
      customization_type: form.is_customizable ? form.customization_type : null,
      category_id: form.category_id || null,
      production_cost: form.production_cost ? parseFloat(form.production_cost) : 0,
      packaging_cost: form.packaging_cost ? parseFloat(form.packaging_cost) : 0,
      post_production_cost: form.post_production_cost ? parseFloat(form.post_production_cost) : 0,
      card_fee_percent: form.card_fee_percent ? parseFloat(form.card_fee_percent) : 0,
      waste_rate_percent: form.waste_rate_percent ? parseFloat(form.waste_rate_percent) : 5,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload }, { onSuccess: () => { setOpen(false); resetForm(); } });
    } else {
      insertMutation.mutate(payload, { onSuccess: () => { setOpen(false); resetForm(); } });
    }
  };

  const handleEdit = (p: Tables<"products">) => {
    setForm({
      name: p.name, description: p.description || "",
      sale_price: String(p.sale_price), sale_price_promotional: p.sale_price_promotional ? String(p.sale_price_promotional) : "",
      is_on_sale: p.is_on_sale ?? false, is_active: p.is_active ?? true,
      weight_grams: String(p.weight_grams || ""), production_time_minutes: String(p.production_time_minutes || ""),
      has_color_variation: p.has_color_variation ?? false,
      color_options: (p.color_options || []).join(", "),
      is_customizable: p.is_customizable ?? false,
      customization_type: p.customization_type || "",
      category_id: p.category_id || "",
      production_cost: String(p.production_cost || ""),
      packaging_cost: String(p.packaging_cost || ""),
      post_production_cost: String(p.post_production_cost || ""),
      card_fee_percent: String(p.card_fee_percent || ""),
      waste_rate_percent: String(p.waste_rate_percent || "5"),
    });
    setEditingId(p.id);
    setOpen(true);
  };

  const toggleActive = async (p: Tables<"products">) => {
    await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground mt-1">Gerencie os produtos da sua loja</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={catOpen} onOpenChange={setCatOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2"><Plus className="w-4 h-4" /> Categoria</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova Categoria</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Nome da categoria" />
                <Button className="w-full" onClick={handleAddCategory}>Criar</Button>
              </div>
              {categories && categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map(c => (
                    <Badge key={c.id} variant="secondary" className="gap-1">
                      {c.name}
                      <button className="ml-1 text-destructive hover:text-destructive/80" onClick={async () => {
                        await supabase.from("product_categories").delete().eq("id", c.id);
                        queryClient.invalidateQueries({ queryKey: ["categories"] });
                      }}>×</button>
                    </Badge>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={calcOpen} onOpenChange={setCalcOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2"><Calculator className="w-4 h-4" /> Calculadora</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">Calculadora de Custos</DialogTitle>
                <DialogDescription>Calcule o custo de produção e preço sugerido</DialogDescription>
              </DialogHeader>
              <CostCalculatorModal printers={printers || []} filaments={filaments || []} />
            </DialogContent>
          </Dialog>

          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Novo Produto</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">{editingId ? "Editar" : "Novo"} Produto</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Sem categoria" /></SelectTrigger>
                    <SelectContent>
                      {categories?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />
                <h4 className="font-display font-semibold text-sm">Preços</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Preço de Venda (R$) *</Label>
                    <Input type="number" step="0.01" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Preço Promocional (R$)</Label>
                    <Input type="number" step="0.01" value={form.sale_price_promotional} onChange={(e) => setForm({ ...form, sale_price_promotional: e.target.value })} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={form.is_on_sale} onCheckedChange={(v) => setForm({ ...form, is_on_sale: v })} />
                  <Label>Em promoção</Label>
                </div>

                <Separator />
                <h4 className="font-display font-semibold text-sm">Produção</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Peso (g)</Label>
                    <Input type="number" step="0.01" value={form.weight_grams} onChange={(e) => setForm({ ...form, weight_grams: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tempo (min)</Label>
                    <Input type="number" value={form.production_time_minutes} onChange={(e) => setForm({ ...form, production_time_minutes: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Desperdício %</Label>
                    <Input type="number" step="0.01" value={form.waste_rate_percent} onChange={(e) => setForm({ ...form, waste_rate_percent: e.target.value })} />
                  </div>
                </div>

                <Separator />
                <h4 className="font-display font-semibold text-sm">Custos</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Custo Produção (R$)</Label>
                    <Input type="number" step="0.01" value={form.production_cost} onChange={(e) => setForm({ ...form, production_cost: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Custo Embalagem (R$)</Label>
                    <Input type="number" step="0.01" value={form.packaging_cost} onChange={(e) => setForm({ ...form, packaging_cost: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pós-produção (R$)</Label>
                    <Input type="number" step="0.01" value={form.post_production_cost} onChange={(e) => setForm({ ...form, post_production_cost: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Taxa Cartão %</Label>
                    <Input type="number" step="0.01" value={form.card_fee_percent} onChange={(e) => setForm({ ...form, card_fee_percent: e.target.value })} />
                  </div>
                </div>

                <Separator />
                <h4 className="font-display font-semibold text-sm">Variações</h4>
                <div className="flex items-center gap-3">
                  <Switch checked={form.has_color_variation} onCheckedChange={(v) => setForm({ ...form, has_color_variation: v })} />
                  <Label>Variação de cor</Label>
                </div>
                {form.has_color_variation && (
                  <div className="space-y-2">
                    <Label>Cores (separadas por vírgula)</Label>
                    <Input value={form.color_options} onChange={(e) => setForm({ ...form, color_options: e.target.value })} placeholder="Branco, Preto, Vermelho" />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Switch checked={form.is_customizable} onCheckedChange={(v) => setForm({ ...form, is_customizable: v })} />
                  <Label>Personalizável</Label>
                </div>
                {form.is_customizable && (
                  <div className="space-y-2">
                    <Label>Tipo de personalização</Label>
                    <Select value={form.customization_type} onValueChange={(v) => setForm({ ...form, customization_type: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nome">Nome</SelectItem>
                        <SelectItem value="logotipo">Logotipo</SelectItem>
                        <SelectItem value="nome_logotipo">Nome e Logotipo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                  <Label>Produto ativo na loja</Label>
                </div>

                <Button type="submit" className="w-full" disabled={insertMutation.isPending || updateMutation.isPending}>
                  {editingId ? "Salvar Alterações" : "Cadastrar Produto"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Carregando...</div>
          ) : !products || products.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhum produto cadastrado</p>
              <p className="text-sm mt-1">Comece adicionando seus produtos impressos em 3D</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Tempo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id} className={!p.is_active ? "opacity-50" : ""}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{p.name}</span>
                        <span className="text-xs text-muted-foreground block">#{p.id.slice(0, 8)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {p.is_on_sale && p.sale_price_promotional ? (
                        <div>
                          <span className="text-xs text-muted-foreground line-through">R$ {Number(p.sale_price).toFixed(2)}</span>
                          <span className="block font-bold text-destructive">R$ {Number(p.sale_price_promotional).toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="font-bold">R$ {Number(p.sale_price).toFixed(2)}</span>
                      )}
                    </TableCell>
                    <TableCell>{p.weight_grams ? `${p.weight_grams}g` : "—"}</TableCell>
                    <TableCell>{p.production_time_minutes ? `${p.production_time_minutes}min` : "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {p.is_active ? <Badge variant="default" className="text-xs">Ativo</Badge> : <Badge variant="secondary" className="text-xs">Inativo</Badge>}
                        {p.is_on_sale && <Badge variant="destructive" className="text-xs">Promo</Badge>}
                        {p.is_customizable && <Badge variant="outline" className="text-xs">Pers.</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive(p)} title={p.is_active ? "Desativar" : "Ativar"}>
                          {p.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
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
