import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type {
  CatalogoPublicoDto,
  FestaCatalogoExtraB2c,
  FestaCatalogoPacoteB2c,
  FestaCatalogoPlanoB2b,
  FestaCatalogoProduto,
  FestaCategoriaTemaEnum,
  FestaEfeitoExtraEnum,
  FestaTemaCatalogo,
} from "@/types/festa.types";

export const CATALOGO_QUERY_KEYS = {
  publico: ["festa", "catalogo", "publico"] as const,
  admin: ["festa", "catalogo", "admin"] as const,
};

export interface AtualizarProdutoB2cPayload {
  nome_exibicao?: string;
  descricao?: string | null;
  preco_centavos?: number;
  preco_ancora_centavos?: number | null;
  custo_creditos_b2b?: number;
  disponivel_b2b?: boolean;
  limite_molduras_base?: number;
  dias_validade_base?: number;
  ativo?: boolean;
}

export interface AtualizarPacoteB2cPayload {
  nome_exibicao?: string;
  descricao?: string | null;
  preco_centavos?: number;
  preco_ancora_centavos?: number | null;
  limite_molduras?: number;
  inclui_qr_tematico?: boolean;
  inclui_telao?: boolean;
  dias_galeria_ativa?: number;
  permite_video?: boolean;
  ativo?: boolean;
}

export interface SalvarExtraB2cPayload {
  slug: string;
  nome: string;
  descricao?: string | null;
  preco_centavos: number;
  custo_creditos_b2b?: number;
  disponivel_b2b?: boolean;
  efeito_tipo: FestaEfeitoExtraEnum;
  efeito_valor: number;
  ordem?: number;
  ativo?: boolean;
}

export interface SalvarTemaCatalogoPayload {
  nome: string;
  slug: string;
  categoria: FestaCategoriaTemaEnum;
  cor_primaria_padrao: string;
  cor_secundaria_padrao: string;
  thumb_url?: string | null;
  moldura_preview_url?: string | null;
  publico?: boolean;
  parceiro_proprietario_id?: string | null;
  ordem?: number;
  ativo?: boolean;
}

export interface AtualizarPlanoB2bPayload {
  nome?: string;
  descricao?: string | null;
  preco_mensal_centavos?: number;
  creditos_mensais?: number;
  custo_creditos_basico?: number;
  custo_creditos_completo?: number;
  preco_credito_avulso_centavos?: number;
  ativo?: boolean;
}

export function useCatalogoPublicoQuery(enabled = true) {
  return useQuery({
    queryKey: CATALOGO_QUERY_KEYS.publico,
    queryFn: () => apiRequest<CatalogoPublicoDto>("/api/public/catalogo"),
    enabled,
  });
}

export function useCatalogoAdminQuery(enabled = true) {
  return useQuery({
    queryKey: CATALOGO_QUERY_KEYS.admin,
    queryFn: () =>
      apiRequest<CatalogoPublicoDto>("/api/admin/catalogo", {
        requireAuth: true,
      }),
    enabled,
  });
}

function invalidarCatalogo(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: CATALOGO_QUERY_KEYS.admin });
  queryClient.invalidateQueries({ queryKey: CATALOGO_QUERY_KEYS.publico });
}

export function useAtualizarProdutoB2cMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AtualizarProdutoB2cPayload;
    }) =>
      apiRequest<FestaCatalogoProduto>(`/api/admin/catalogo/produtos/${id}`, {
        method: "PATCH",
        requireAuth: true,
        body: payload,
      }),
    onSuccess: () => invalidarCatalogo(queryClient),
  });
}

export function useAtualizarPacoteB2cMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AtualizarPacoteB2cPayload;
    }) =>
      apiRequest<FestaCatalogoPacoteB2c>(`/api/admin/catalogo/pacotes/${id}`, {
        method: "PATCH",
        requireAuth: true,
        body: payload,
      }),
    onSuccess: () => invalidarCatalogo(queryClient),
  });
}

export function useCriarExtraB2cMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SalvarExtraB2cPayload) =>
      apiRequest<FestaCatalogoExtraB2c>("/api/admin/catalogo/extras", {
        method: "POST",
        requireAuth: true,
        body: payload,
      }),
    onSuccess: () => invalidarCatalogo(queryClient),
  });
}

export function useAtualizarExtraB2cMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<SalvarExtraB2cPayload>;
    }) =>
      apiRequest<FestaCatalogoExtraB2c>(`/api/admin/catalogo/extras/${id}`, {
        method: "PATCH",
        requireAuth: true,
        body: payload,
      }),
    onSuccess: () => invalidarCatalogo(queryClient),
  });
}

export function useCriarTemaCatalogoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SalvarTemaCatalogoPayload) =>
      apiRequest<FestaTemaCatalogo>("/api/admin/catalogo/temas", {
        method: "POST",
        requireAuth: true,
        body: payload,
      }),
    onSuccess: () => invalidarCatalogo(queryClient),
  });
}

export function useAtualizarTemaCatalogoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<SalvarTemaCatalogoPayload>;
    }) =>
      apiRequest<FestaTemaCatalogo>(`/api/admin/catalogo/temas/${id}`, {
        method: "PATCH",
        requireAuth: true,
        body: payload,
      }),
    onSuccess: () => invalidarCatalogo(queryClient),
  });
}

export function useAtualizarPlanoB2bMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AtualizarPlanoB2bPayload;
    }) =>
      apiRequest<FestaCatalogoPlanoB2b>(
        `/api/admin/catalogo/planos-b2b/${id}`,
        {
          method: "PATCH",
          requireAuth: true,
          body: payload,
        }
      ),
    onSuccess: () => invalidarCatalogo(queryClient),
  });
}
