export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3005";

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://jztyffakurtekwxurclw.supabase.co";

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6dHlmZmFrdXJ0ZWt3eHVyY2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDkwNDMsImV4cCI6MjA3MjQyNTA0M30.n7PD7-FMXJ7ZmBUzpwu5rqHU4ak6g_pKm85pRWr551E";

export const WHATSAPP_COMERCIAL =
  import.meta.env.VITE_WHATSAPP_COMERCIAL || "5511962508068";

export const FESTA_BUCKET_MIDIAS = "festa-midias" as const;

export const FESTA_CANVAS_CONFIG = {
  FULL_WIDTH: 1080,
  FULL_HEIGHT: 1920,
  FULL_QUALITY: 0.88,
  THUMB_WIDTH: 360,
  THUMB_HEIGHT: 640,
  THUMB_QUALITY: 0.72,
} as const;

export const ENQUADRAMENTO_CAMERA = {
  QUADRO_INTEIRO: "QUADRO_INTEIRO",
  PREENCHER: "PREENCHER",
} as const;
export type EnquadramentoCamera =
  (typeof ENQUADRAMENTO_CAMERA)[keyof typeof ENQUADRAMENTO_CAMERA];

export const CAMERA_CONFIG = {
  ENQUADRAMENTO: ENQUADRAMENTO_CAMERA.PREENCHER as EnquadramentoCamera,
  PERMITIR_TROCA_LENTE: true,
  PARAMETRO_DIAGNOSTICO: "diagcamera",
} as const;

export const FESTA_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DEMO_CONVIDADO: "/e/demo",
  LEGACY_ADMIN: "/e/admin",
  LEGACY_PARCEIRO: "/e/parceiro",
  EVENTO_CONVIDADO: "/e/:slug",
  EVENTO_TELAO: "/telao/:slug",
  GESTAO_PAI: "/gestao/:token",
  ADMIN_LOGIN: "/admin/login",
  ADMIN_DASHBOARD: "/admin",
  PARCEIRO_LOGIN: "/parceiro/login",
  PARCEIRO_PORTAL: "/parceiro",
  IMPERSONATE_BRIDGE: "/impersonate-bridge",
} as const;

export const STORAGE_KEYS = {
  CONVIDADO_SESSAO_ID: "@albumqrfesta:convidado_sessao_id",
  CONVIDADO_NOME_AUTOR: "@albumqrfesta:convidado_nome_autor",
  CONVIDADO_CURTIDAS: "@albumqrfesta:convidado_curtidas",
  CONVIDADO_MINHAS_MIDIAS: "@albumqrfesta:convidado_minhas_midias",
  ADMIN_FILTRO_STATUS: "@albumqrfesta:admin_filtro_status",
  ADMIN_ABA_ATIVA: "@albumqrfesta:admin_aba_ativa",
  GESTAO_DICA_DISPENSADA: "@albumqrfesta:gestao_dica_dispensada",
  PARCEIRO_IMPERSONATING: "@albumqrfesta:parceiro_is_impersonating",
} as const;

export const FESTA_TIPO_PERFIL = {
  ADMIN: "ADMIN",
  ANFITRIAO: "ANFITRIAO",
  PARCEIRO_ADMIN: "PARCEIRO_ADMIN",
  PARCEIRO_OPERADOR: "PARCEIRO_OPERADOR",
} as const;

export const FESTA_PACOTE_TIPO = {
  BASICO: "BASICO",
  COMPLETO: "COMPLETO",
} as const;

export const FESTA_STATUS_PEDIDO = {
  AGUARDANDO_SINAL: "AGUARDANDO_SINAL",
  SINAL_PAGO: "SINAL_PAGO",
  AGUARDANDO_BRIEFING: "AGUARDANDO_BRIEFING",
  EM_MONTAGEM: "EM_MONTAGEM",
  ENTREGUE: "ENTREGUE",
  PAGO_COMPLETO: "PAGO_COMPLETO",
  CANCELADO: "CANCELADO",
} as const;

export const FESTA_STATUS_MODERACAO = {
  APROVADA: "APROVADA",
  PENDENTE: "PENDENTE",
  OCULTA: "OCULTA",
} as const;

export const FESTA_TIPO_MIDIA = {
  FOTO: "FOTO",
  VIDEO: "VIDEO",
} as const;

export const FESTA_METODO_PAGAMENTO = {
  PIX_MANUAL: "PIX_MANUAL",
  CARTAO_LINK: "CARTAO_LINK",
  CORTESIA: "CORTESIA",
  CREDITO_B2B: "CREDITO_B2B",
} as const;

export const FESTA_EFEITO_EXTRA = {
  MOLDURA_ADICIONAL: "MOLDURA_ADICIONAL",
  DIAS_GALERIA_ADICIONAIS: "DIAS_GALERIA_ADICIONAIS",
  LIBERAR_VIDEO: "LIBERAR_VIDEO",
  LIBERAR_TELAO: "LIBERAR_TELAO",
  ENTREGAVEL_MANUAL: "ENTREGAVEL_MANUAL",
} as const;

export const FESTA_TIPO_BAIXA_PAGAMENTO = {
  SINAL: "SINAL",
  QUITACAO_TOTAL: "QUITACAO_TOTAL",
  VALOR_PERSONALIZADO: "VALOR_PERSONALIZADO",
} as const;

export const FESTA_CATEGORIA_TEMA = {
  INFANTIL: "INFANTIL",
  QUINZE_ANOS: "QUINZE_ANOS",
  CASAMENTO: "CASAMENTO",
  ADULTO: "ADULTO",
  CORPORATIVO: "CORPORATIVO",
} as const;

export const FESTA_STATUS_ASSINATURA_B2B = {
  TRIAL: "TRIAL",
  ATIVA: "ATIVA",
  INADIMPLENTE: "INADIMPLENTE",
  CANCELADA: "CANCELADA",
} as const;

export const FESTA_TIPO_TRANSACAO_CREDITO = {
  RECARGA_PLANO: "RECARGA_PLANO",
  COMPRA_AVULSA: "COMPRA_AVULSA",
  CONSUMO_EVENTO: "CONSUMO_EVENTO",
  ESTORNO: "ESTORNO",
} as const;

export const FESTA_ADMIN_TABS = {
  EVENTOS: "EVENTOS",
  CATALOGO_B2C: "CATALOGO_B2C",
  TEMAS: "TEMAS",
  PARCEIROS_B2B: "PARCEIROS_B2B",
} as const;

export type FestaAdminTab =
  (typeof FESTA_ADMIN_TABS)[keyof typeof FESTA_ADMIN_TABS];

export const FESTA_PARCEIRO_TABS = {
  EVENTOS: "EVENTOS",
  CREDITOS: "CREDITOS",
  EQUIPE: "EQUIPE",
  MARCA: "MARCA",
} as const;

export type FestaParceiroTab =
  (typeof FESTA_PARCEIRO_TABS)[keyof typeof FESTA_PARCEIRO_TABS];

export const FESTA_GESTAO_PAI_TABS = {
  MODERACAO: "MODERACAO",
  BRIEFING: "BRIEFING",
  ACESSO_QR: "ACESSO_QR",
} as const;

export type FestaGestaoPaiTab =
  (typeof FESTA_GESTAO_PAI_TABS)[keyof typeof FESTA_GESTAO_PAI_TABS];

export const FESTA_FILTRO_MODERACAO = {
  TODAS: "TODAS",
  VISIVEIS: "VISIVEIS",
  PENDENTES: "PENDENTES",
  OCULTAS: "OCULTAS",
} as const;

export type FestaFiltroModeracao =
  (typeof FESTA_FILTRO_MODERACAO)[keyof typeof FESTA_FILTRO_MODERACAO];

export const FESTA_FILTRO_MIDIA_ADMIN = {
  TODAS: "TODAS",
  VISIVEIS: "VISIVEIS",
  PENDENTES: "PENDENTES",
  OCULTAS: "OCULTAS",
  DEMO: "DEMO",
} as const;

export type FestaFiltroMidiaAdmin =
  (typeof FESTA_FILTRO_MIDIA_ADMIN)[keyof typeof FESTA_FILTRO_MIDIA_ADMIN];

export const FESTA_MODO_TELAO = {
  MOSAICO: "MOSAICO",
  SLIDESHOW: "SLIDESHOW",
} as const;

export type FestaModoTelao =
  (typeof FESTA_MODO_TELAO)[keyof typeof FESTA_MODO_TELAO];

export const FESTA_ABA_GALERIA_CONVIDADO = {
  MURAL: "MURAL",
  MINHAS: "MINHAS",
} as const;

export type FestaAbaGaleriaConvidado =
  (typeof FESTA_ABA_GALERIA_CONVIDADO)[keyof typeof FESTA_ABA_GALERIA_CONVIDADO];

export const FESTA_DIALOG_NAMES = {
  CONFIRM_ACTION: "confirmActionDialog",
  EVENTO_FORM: "eventoFormDialog",
  PAGAMENTO_MANUAL: "pagamentoManualDialog",
  MOLDURAS_EVENTO: "moldurasEventoDialog",
  QRCODE_LINKS: "qrCodeLinksDialog",
  MIDIA_VIEWER: "midiaViewerDialog",
  MIDIAS_EVENTO_ADMIN: "midiasEventoAdminDialog",
  EXTRAS_EVENTO_ADMIN: "extrasEventoAdminDialog",
  PACOTE_B2C_FORM: "pacoteB2cFormDialog",
  EXTRA_B2C_FORM: "extraB2cFormDialog",
  TEMA_CATALOGO_FORM: "temaCatalogoFormDialog",
  PARCEIRO_B2B_FORM: "parceiroB2bFormDialog",
  PLANO_B2B_FORM: "planoB2bFormDialog",
  EVENTO_PARCEIRO_B2B_FORM: "eventoParceiroB2bFormDialog",
  OPERADOR_PARCEIRO_FORM: "operadorParceiroFormDialog",
  RECUPERAR_SENHA: "recuperarSenhaDialog",
} as const;

export type FestaDialogName =
  (typeof FESTA_DIALOG_NAMES)[keyof typeof FESTA_DIALOG_NAMES];
