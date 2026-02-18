import { useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, MessageSquare, Plus, Minus, X, Send, Store, Box } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color?: string;
  customization?: string;
}

export default function PublicStorefront() {
  const { storeId } = useParams<{ storeId: string }>();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ["public-store", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", storeId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const { data: products } = useQuery({
    queryKey: ["public-products", storeId, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*")
        .eq("store_id", storeId!)
        .eq("is_active", true);
      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const { data: categories } = useQuery({
    queryKey: ["public-categories", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .eq("store_id", storeId!)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  if (storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Loja não encontrada</h1>
          <p className="text-muted-foreground">Verifique o endereço e tente novamente.</p>
        </div>
      </div>
    );
  }

  if (!store.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <Store className="w-16 h-16 mx-auto mb-4 text-warning opacity-60" />
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Loja Temporariamente Desativada</h1>
          <p className="text-muted-foreground">Esta loja está temporariamente indisponível. Por favor, tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  const addToCart = (product: any, color?: string, customization?: string) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.productId === product.id && item.color === color && item.customization === customization
      );
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.is_on_sale && product.sale_price_promotional ? product.sale_price_promotional : product.sale_price,
          quantity: 1,
          color,
          customization,
        },
      ];
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item, i) => (i === index ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const buildWhatsAppMessage = (items: CartItem[]) => {
    let msg = `🛒 *Novo Pedido*\n\n`;
    items.forEach((item, i) => {
      msg += `${i + 1}. *${item.name}* (Cód: ${item.productId.slice(0, 8)})\n`;
      msg += `   Qtd: ${item.quantity} | R$ ${(item.price * item.quantity).toFixed(2)}\n`;
      if (item.color) msg += `   Cor: ${item.color}\n`;
      if (item.customization) msg += `   Personalização: ${item.customization}\n`;
      msg += `\n`;
    });
    msg += `💰 *Total: R$ ${cartTotal.toFixed(2)}*`;
    return encodeURIComponent(msg);
  };

  const sendWhatsApp = (items: CartItem[]) => {
    const message = buildWhatsAppMessage(items);
    const url = `https://wa.me/${store.whatsapp_number}?text=${message}`;
    window.open(url, "_blank");
  };

  const primaryColor = store.primary_color || "#06b6d4";
  const columns = store.product_columns || 3;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="py-6 px-4 text-center"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Box className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="text-left">
              <h1 className="text-xl font-display font-bold text-white">{store.name}</h1>
              {store.header_text && (
                <p className="text-white/80 text-sm">{store.header_text}</p>
              )}
            </div>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="relative bg-white/10 border-white/20 text-white hover:bg-white/20">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Carrinho
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="font-display">Carrinho</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4 flex-1 overflow-auto">
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Carrinho vazio</p>
                ) : (
                  cart.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        {item.color && <p className="text-xs text-muted-foreground">Cor: {item.color}</p>}
                        {item.customization && <p className="text-xs text-muted-foreground">Pers.: {item.customization}</p>}
                        <p className="text-sm font-bold text-primary">R$ {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(i, -1)}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(i, 1)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(i)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="mt-6 space-y-4">
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-display font-bold text-lg">Total:</span>
                    <span className="font-display font-bold text-lg text-primary">R$ {cartTotal.toFixed(2)}</span>
                  </div>
                  <Button className="w-full gap-2" onClick={() => sendWhatsApp(cart)}>
                    <Send className="w-4 h-4" /> Finalizar via WhatsApp
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Todos
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {!products || products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Box className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Nenhum produto disponível</p>
          </div>
        ) : (
          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {products.map((product) => (
              <Card key={product.id} className="border-border/50 overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {product.photos && product.photos.length > 0 ? (
                    <img
                      src={product.photos[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Box className="w-12 h-12 text-muted-foreground opacity-30" />
                    </div>
                  )}
                  {product.is_on_sale && (
                    <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground">
                      Promoção
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">#{product.id.slice(0, 8)}</p>
                  <h3 className="font-display font-semibold text-lg truncate">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                  )}
                  <div className="mt-3 flex items-baseline gap-2">
                    {product.is_on_sale && product.sale_price_promotional ? (
                      <>
                        <span className="text-sm text-muted-foreground line-through">
                          R$ {Number(product.sale_price).toFixed(2)}
                        </span>
                        <span className="text-xl font-display font-bold text-destructive">
                          R$ {Number(product.sale_price_promotional).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-xl font-display font-bold text-foreground">
                        R$ {Number(product.sale_price).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1"
                      onClick={() => addToCart(product)}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Carrinho
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => sendWhatsApp([{
                        productId: product.id,
                        name: product.name,
                        price: product.is_on_sale && product.sale_price_promotional
                          ? Number(product.sale_price_promotional)
                          : Number(product.sale_price),
                        quantity: 1,
                      }])}
                    >
                      <Send className="w-3.5 h-3.5" /> Pedir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {store.footer_text && (
        <footer className="py-6 px-4 text-center border-t border-border">
          <p className="text-sm text-muted-foreground">{store.footer_text}</p>
        </footer>
      )}

      {/* WhatsApp floating button */}
      {store.whatsapp_floating_enabled && store.whatsapp_number && (
        <a
          href={`https://wa.me/${store.whatsapp_number}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-success flex items-center justify-center shadow-lg hover:scale-110 transition-transform animate-pulse-glow z-50"
        >
          <MessageSquare className="w-6 h-6 text-success-foreground" />
        </a>
      )}
    </div>
  );
}
