import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type {
  ResetarSenhaRecuperacaoResponseDto,
  SolicitarRecuperacaoResponseDto,
  ValidarCodigoRecuperacaoResponseDto,
} from "@/types/festa.types";

export function useSolicitarRecuperacaoMutation() {
  return useMutation({
    mutationFn: (payload: { identificador: string }) =>
      apiRequest<SolicitarRecuperacaoResponseDto>(
        "/api/auth/recuperacao/solicitar",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      ),
  });
}

export function useValidarCodigoRecuperacaoMutation() {
  return useMutation({
    mutationFn: (payload: { identificador: string; codigo: string }) =>
      apiRequest<ValidarCodigoRecuperacaoResponseDto>(
        "/api/auth/recuperacao/validar",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      ),
  });
}

export function useResetarSenhaRecuperacaoMutation() {
  return useMutation({
    mutationFn: (payload: { recovery_id: string; nova_senha: string }) =>
      apiRequest<ResetarSenhaRecuperacaoResponseDto>(
        "/api/auth/recuperacao/resetar",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      ),
  });
}
