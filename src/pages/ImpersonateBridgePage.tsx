import { Building2 } from "lucide-react";
import { useImpersonateBridgeViewModel } from "@/hooks/ui/useImpersonateBridgeViewModel";

export function ImpersonateBridgePage() {
  useImpersonateBridgeViewModel();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-3">
      <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center animate-pulse">
        <Building2 className="w-6 h-6" />
      </div>
      <p className="text-sm font-bold text-foreground">
        Conectando como parceiro B2B...
      </p>
      <p className="text-xs text-muted-foreground">
        Validando o link de acesso seguro...
      </p>
    </div>
  );
}
