import type { Enums, Tables } from "@/integrations/supabase/types";

export type FestaCatalogoPacoteB2c = Tables<"festa_catalogo_pacotes_b2c">;
export type FestaCatalogoExtraB2c = Tables<"festa_catalogo_extras_b2c">;
export type FestaCatalogoPlanoB2b = Tables<"festa_catalogo_planos_b2b">;
export type FestaTemaCatalogo = Tables<"festa_temas_catalogo">;
export type FestaUsuario = Tables<"festa_usuarios">;
export type FestaEvento = Tables<"festa_eventos">;
export type FestaEventoExtra = Tables<"festa_evento_extras">;
export type FestaEventoMoldura = Tables<"festa_evento_molduras">;
export type FestaEventoMidia = Tables<"festa_evento_midias">;
export type FestaParceiroB2b = Tables<"festa_parceiros_b2b">;
export type FestaTransacaoCreditoB2b = Tables<"festa_transacoes_creditos_b2b">;
export type FestaRecuperacaoSenha = Tables<"festa_recuperacoes_senha">;

export type FestaPacoteTipoEnum = Enums<"festa_pacote_tipo_enum">;
export type FestaStatusPedidoEnum = Enums<"festa_status_pedido_enum">;
export type FestaStatusModeracaoEnum = Enums<"festa_status_moderacao_enum">;
export type FestaTipoMidiaEnum = Enums<"festa_tipo_midia_enum">;
export type FestaMetodoPagamentoEnum = Enums<"festa_metodo_pagamento_enum">;
export type FestaEfeitoExtraEnum = Enums<"festa_efeito_extra_enum">;
export type FestaCategoriaTemaEnum = Enums<"festa_categoria_tema_enum">;
export type FestaStatusAssinaturaB2bEnum =
  Enums<"festa_status_assinatura_b2b_enum">;
export type FestaTipoTransacaoCreditoEnum =
  Enums<"festa_tipo_transacao_credito_enum">;
export type FestaTipoPerfilEnum = Enums<"festa_tipo_perfil_enum">;

export interface MolduraDto extends FestaEventoMoldura {
  arquivo_url: string;
}

export interface MidiaDto extends FestaEventoMidia {
  url_publica: string;
  url_miniatura: string;
}

export interface ListaMidiasPaginadaDto {
  itens: MidiaDto[];
  proximo_cursor: string | null;
  tem_mais: boolean;
}

export interface CatalogoPublicoDto {
  pacotes_b2c: FestaCatalogoPacoteB2c[];
  extras_b2c: FestaCatalogoExtraB2c[];
  temas: FestaTemaCatalogo[];
  planos_b2b: FestaCatalogoPlanoB2b[];
}

export interface EventoPublicoDto {
  id: string;
  slug: string;
  titulo: string;
  subtitulo: string | null;
  boas_vindas: string | null;
  nome_aniversariante: string | null;
  idade_aniversariante: string | null;
  data_evento: string | null;
  cor_primaria: string;
  cor_secundaria: string;
  capa_url: string | null;
  pacote: FestaPacoteTipoEnum;
  inclui_telao: boolean;
  galeria_publica: boolean;
  moderacao_previa: boolean;
  permite_envio_midias: boolean;
  permite_video: boolean;
  tempo_slideshow_segundos: number;
  is_demo: boolean;
  expira_em: string | null;
  galeria_expirada: boolean;
  molduras: MolduraDto[];
}

export interface EventoAdminDto extends FestaEvento {
  anfitriao: FestaUsuario | null;
  tema: FestaTemaCatalogo | null;
  extras: FestaEventoExtra[];
  molduras: MolduraDto[];
  total_midias: number;
  valor_restante_centavos: number;
}

export interface EventoGestaoDto {
  evento: FestaEvento;
  anfitriao: Pick<FestaUsuario, "id" | "nome" | "telefone" | "email"> | null;
  extras: FestaEventoExtra[];
  molduras: MolduraDto[];
  resumo_midias: {
    total: number;
    aprovadas: number;
    pendentes: number;
    ocultas: number;
  };
  valor_restante_centavos: number;
}

export interface ParceiroB2bAdminDto extends FestaParceiroB2b {
  plano: FestaCatalogoPlanoB2b | null;
  total_eventos: number;
  transacoes: FestaTransacaoCreditoB2b[];
  possui_login: boolean;
  email_acesso: string | null;
}

export interface PortalParceiroB2bDto {
  parceiro: ParceiroB2bAdminDto;
  perfil_usuario: FestaTipoPerfilEnum;
  planos_b2b: FestaCatalogoPlanoB2b[];
  eventos: EventoAdminDto[];
  temas: FestaTemaCatalogo[];
  operadores: FestaUsuario[];
}

export interface SolicitarRecuperacaoResponseDto {
  email_mascarado: string;
  enviado_por_email: boolean;
  codigo_dev?: string;
}

export interface ValidarCodigoRecuperacaoResponseDto {
  recovery_id: string;
}

export interface ResetarSenhaRecuperacaoResponseDto {
  session: {
    access_token: string;
    refresh_token: string;
  };
  tipo_perfil: FestaTipoPerfilEnum;
}

export interface SessaoUsuarioAutenticadoDto {
  id: string;
  nome: string;
  email: string | null;
  tipo_perfil: FestaTipoPerfilEnum;
  parceiro_id: string | null;
}
