import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, FileBox, X, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface STLFileUploadProps {
  fileUrl: string | null;
  onChange: (url: string | null) => void;
}

export default function STLFileUpload({ fileUrl, onChange }: STLFileUploadProps) {
  const { storeId } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storeId) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["stl", "3mf"].includes(ext || "")) {
      toast.error("Apenas arquivos .STL e .3MF são aceitos");
      return;
    }

    setUploading(true);
    const path = `${storeId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("product-files").upload(path, file, { upsert: false });
    
    if (error) {
      toast.error("Erro ao enviar arquivo: " + error.message);
      setUploading(false);
      return;
    }

    const { data } = await supabase.storage.from("product-files").createSignedUrl(path, 60 * 60 * 24 * 365);
    onChange(data?.signedUrl || path);
    toast.success("Arquivo enviado!");
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const fileName = fileUrl ? fileUrl.split("/").pop()?.split("?")[0] || "arquivo" : null;

  return (
    <div className="space-y-2">
      {fileUrl ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30">
          <FileBox className="w-5 h-5 text-primary flex-shrink-0" />
          <span className="text-sm flex-1 truncate text-foreground">{fileName}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            asChild
          >
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              <Download className="w-4 h-4" />
            </a>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={() => onChange(null)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full p-4 rounded-lg border-2 border-dashed border-border/50 hover:border-primary/50 flex items-center justify-center gap-2 transition-colors text-muted-foreground hover:text-primary text-sm"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" /> Enviar arquivo .STL ou .3MF
            </>
          )}
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept=".stl,.3mf"
        className="hidden"
        onChange={handleUpload}
      />
      <p className="text-xs text-muted-foreground">Arquivo privado — apenas administradores têm acesso</p>
    </div>
  );
}
