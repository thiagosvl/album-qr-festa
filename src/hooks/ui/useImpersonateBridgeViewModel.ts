import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { FESTA_ROUTES } from "@/constants";
import { supabase } from "@/integrations/supabase/client";
import { marcarComoImpersonating } from "@/lib/impersonate";

export function useImpersonateBridgeViewModel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleImpersonate = async () => {
      const tokenHash =
        searchParams.get("token_hash") || searchParams.get("token");

      if (!tokenHash) {
        toast.error("Link de acesso inválido ou expirado.");
        navigate(FESTA_ROUTES.PARCEIRO_LOGIN, { replace: true });
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "magiclink",
        });

        if (error) {
          throw error;
        }

        marcarComoImpersonating();
        toast.success("Conectado na visão do Parceiro B2B!");
        navigate(FESTA_ROUTES.PARCEIRO_PORTAL, { replace: true });
      } catch {
        toast.error(
          "Link de acesso expirado ou inválido. Gere um novo link no painel Admin."
        );
        navigate(FESTA_ROUTES.PARCEIRO_LOGIN, { replace: true });
      }
    };

    handleImpersonate();
  }, [searchParams, navigate]);
}
