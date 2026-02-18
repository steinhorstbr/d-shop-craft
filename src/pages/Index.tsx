import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Box } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (role === "super_admin") {
        navigate("/super-admin");
      } else {
        navigate("/admin");
      }
    }
  }, [user, role, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <Box className="w-9 h-9 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-5xl font-display font-bold text-foreground mb-4">
          Print<span className="text-gradient">3D</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
          Plataforma SaaS para catálogo de produtos impressos em 3D
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate("/auth")} className="gap-2 font-display">
            Começar Agora
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="font-display">
            Fazer Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
