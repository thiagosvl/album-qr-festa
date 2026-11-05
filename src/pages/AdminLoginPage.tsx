import { useState } from "react";
import { Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FESTA_ROUTES } from "@/constants";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        toast.error("Credenciais inválidas. Verifique seu e-mail e senha.");
        return;
      }
      toast.success("Bem-vindo ao Backoffice Álbum QR Festa!");
      navigate(FESTA_ROUTES.ADMIN_DASHBOARD, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl">Álbum QR Festa • Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Banner
            variant="neutral"
            title="Acesso restrito à gestão comercial"
            description="Entre com sua conta administrativa vinculada em festa_usuarios."
          />

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold">E-mail</label>
              <Input
                type="email"
                required
                placeholder="seu-email@dominio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold">Senha</label>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              <Lock className="w-4 h-4" />
              <span>{loading ? "Entrando..." : "Entrar no Painel"}</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
