import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, ShoppingCart, Send, Box, ArrowLeft, Clock, Weight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color?: string;
  customization?: string;
}

export default function PublicProductPage() {
  const { storeId, productId } = useParams<{ storeId: string; productId: string }>();
  const navigate = useNavigate();
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [customizationText, setCustomizationText] = useState("");
  const [quantity, setQuantity] = useState(1);

  const { data: store } = useQuery({
    queryKey: ["public-store", storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from("stores").select("*").eq("id", storeId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ["public-product", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_categories(name)")
        .eq("id", productId!)
        .eq("is_active", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Box className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h1 className="text-2xl font-display font-bold">Produto não encontrado</h1>
        </div>
      </div>
    );
  }

  const photos: string[] = product.photos || [];
  const price = product.is_on_sale && product.sale_price_promotional
    ? Number(product.sale_price_promotional)
    : Number(product.sale_price);
  const originalPrice = Number(product.sale_price);
  const primaryColor = store?.primary_color || "#06b6d4";

  const buildWhatsAppCartItem = (): CartItem => ({
    productId: product.id,
    name: product.name,
    price,
    quantity,
    color: selectedColor || undefined,
    customization: customizationText || undefined,
  });

  const buildWhatsAppMessage = (item: CartItem) => {
    let msg = `🛒 *Pedido*\n\n`;
    msg += `*${item.name}*\n`;
    msg += `Cód: ${item.productId.slice(0, 8).toUpperCase()}\n`;
    msg += `Qtd: ${item.quantity}\n`;
    if (item.color) msg += `Cor: ${item.color}\n`;
    if (item.customization) msg += `Personalização: ${item.customization}\n`;
    msg += `\n💰 *Total: R$ ${(item.price * item.quantity).toFixed(2)}*`;
    return encodeURIComponent(msg);
  };

  const handleBuyNow = () => {
    if (product.has_color_variation && !selectedColor) {
      toast.error("Selecione uma cor antes de continuar");
      return;
    }
    if (!store?.whatsapp_number) {
      toast.error("Esta loja não configurou WhatsApp");
      return;
    }
    const item = buildWhatsAppCartItem();
    const msg = buildWhatsAppMessage(item);
    window.open(`https://wa.me/${store.whatsapp_number}?text=${msg}`, "_blank");
  };

  const handleAddToCart = () => {
    if (product.has_color_variation && !selectedColor) {
      toast.error("Selecione uma cor antes de adicionar ao carrinho");
      return;
    }
    // Store cart in sessionStorage so the storefront can pick it up
    const existing = JSON.parse(sessionStorage.getItem("cart") || "[]");
    const item = buildWhatsAppCartItem();
    const idx = existing.findIndex(
      (i: CartItem) => i.productId === item.productId && i.color === item.color && i.customization === item.customization
    );
    if (idx >= 0) {
      existing[idx].quantity += quantity;
    } else {
      existing.push(item);
    }
    sessionStorage.setItem("cart", JSON.stringify(existing));
    toast.success("Adicionado ao carrinho!");
    navigate(`/loja/${storeId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="py-4 px-4 sticky top-0 z-10 border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => navigate(`/loja/${storeId}`)}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar à loja</span>
          </Button>
          {store?.logo_url && (
            <img src={store.logo_url} alt={store.name} className="w-7 h-7 rounded object-cover" />
          )}
          <span className="font-display font-semibold text-sm">{store?.name}</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Photo carousel */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border/50">
              {photos.length > 0 ? (
                <img
                  src={photos[currentPhoto]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Box className="w-20 h-20 text-muted-foreground opacity-20" />
                </div>
              )}
              {product.is_on_sale && (
                <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-sm">
                  Promoção
                </Badge>
              )}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPhoto(p => Math.max(0, p - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPhoto(p => Math.min(photos.length - 1, p + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPhoto(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === currentPhoto ? "border-primary" : "border-border/50"
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-5">
            {/* Code */}
            <p className="text-xs font-mono text-muted-foreground bg-muted/60 rounded px-2 py-1 inline-block">
              #{product.id.slice(0, 8).toUpperCase()}
            </p>

            {/* Category */}
            {(product as any).product_categories?.name && (
              <Badge variant="outline" className="text-xs">
                {(product as any).product_categories.name}
              </Badge>
            )}

            <h1 className="text-3xl font-display font-bold text-foreground">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              {product.is_on_sale && product.sale_price_promotional ? (
                <>
                  <span className="text-3xl font-display font-bold text-destructive">
                    R$ {Number(product.sale_price_promotional).toFixed(2)}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    R$ {originalPrice.toFixed(2)}
                  </span>
                  <Badge variant="destructive" className="text-xs">
                    -{Math.round((1 - Number(product.sale_price_promotional) / originalPrice) * 100)}%
                  </Badge>
                </>
              ) : (
                <span className="text-3xl font-display font-bold text-foreground">
                  R$ {originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {/* Technical info */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              {product.weight_grams && Number(product.weight_grams) > 0 && (
                <div className="flex items-center gap-1">
                  <Weight className="w-4 h-4" />
                  <span>{Number(product.weight_grams).toFixed(0)}g</span>
                </div>
              )}
              {product.production_time_minutes && Number(product.production_time_minutes) > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {Number(product.production_time_minutes) >= 60
                      ? `${Math.floor(Number(product.production_time_minutes) / 60)}h${Number(product.production_time_minutes) % 60 > 0 ? ` ${Number(product.production_time_minutes) % 60}min` : ""}`
                      : `${Number(product.production_time_minutes)}min`
                    }
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Color variation */}
            {product.has_color_variation && product.color_options && product.color_options.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">
                  Cor <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {product.color_options.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedColor === color
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted/30 text-foreground hover:border-primary/50"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Customization */}
            {product.is_customizable && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Personalização — {product.customization_type === "nome" ? "Nome" : product.customization_type === "logotipo" ? "Logotipo" : "Personalização"}
                  <span className="text-muted-foreground font-normal ml-1">(opcional)</span>
                </Label>
                <Input
                  placeholder={
                    product.customization_type === "nome"
                      ? "Digite o nome que deseja"
                      : product.customization_type === "logotipo"
                      ? "Descreva ou envie seu logotipo via WhatsApp"
                      : "Descreva sua personalização"
                  }
                  value={customizationText}
                  onChange={(e) => setCustomizationText(e.target.value)}
                />
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Quantidade</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="w-10 text-center font-semibold text-lg">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                {quantity > 1 && (
                  <span className="text-sm text-muted-foreground ml-2">
                    Total: <strong className="text-foreground">R$ {(price * quantity).toFixed(2)}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4" />
                Adicionar ao Carrinho
              </Button>
              <Button
                className="flex-1 gap-2"
                style={{ backgroundColor: primaryColor }}
                onClick={handleBuyNow}
              >
                <Send className="w-4 h-4" />
                Pedir Agora via WhatsApp
              </Button>
            </div>

            {store?.whatsapp_number && (
              <p className="text-xs text-muted-foreground text-center">
                Ao clicar em "Pedir Agora", você será redirecionado ao WhatsApp da loja com as informações do produto
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
