import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, Image, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ProductPhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export default function ProductPhotoUpload({ photos, onChange, maxPhotos = 6 }: ProductPhotoUploadProps) {
  const { storeId } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !storeId) return;
    
    const remaining = maxPhotos - photos.length;
    if (remaining <= 0) {
      toast.error(`Máximo de ${maxPhotos} fotos atingido`);
      return;
    }

    const filesToUpload = files.slice(0, remaining);
    setUploading(true);

    const newUrls: string[] = [];
    for (const file of filesToUpload) {
      const ext = file.name.split(".").pop();
      const path = `${storeId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-photos").upload(path, file, { upsert: false });
      if (error) {
        toast.error("Erro ao enviar foto: " + error.message);
        continue;
      }
      const { data } = supabase.storage.from("product-photos").getPublicUrl(path);
      newUrls.push(data.publicUrl);
    }

    onChange([...photos, ...newUrls]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {photos.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border/50 bg-muted group">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 text-[10px] bg-background/80 text-foreground px-1.5 py-0.5 rounded">
                Principal
              </span>
            )}
          </div>
        ))}
        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-border/50 hover:border-primary/50 flex flex-col items-center justify-center gap-1 transition-colors text-muted-foreground hover:text-primary"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span className="text-xs">Adicionar</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleUpload}
      />

      <p className="text-xs text-muted-foreground">
        {photos.length}/{maxPhotos} fotos • A primeira foto é a capa do produto
      </p>
    </div>
  );
}
