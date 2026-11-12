export const NOME_MARCA = "Festalgia" as const;

export const LOGO_VARIANTE = {
  HORIZONTAL: "HORIZONTAL",
  ICONE: "ICONE",
} as const;
export type LogoVariante = (typeof LOGO_VARIANTE)[keyof typeof LOGO_VARIANTE];

export const LOGO_FUNDO = {
  CLARO: "CLARO",
  ESCURO: "ESCURO",
} as const;
export type LogoFundo = (typeof LOGO_FUNDO)[keyof typeof LOGO_FUNDO];

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3005";

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://nvhncylfoyougmjeswhy.supabase.co";

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_hQvL_3A9XYnQrIBz3-6t9Q_XeLLTEF6";

export const WHATSAPP_COMERCIAL =
  import.meta.env.VITE_WHATSAPP_COMERCIAL || "5511962508068";

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
  DEMO_CONVITE: "/convite/demo",
  DEMO_TELAO: "/telao/demo",
  LEGACY_ADMIN: "/e/admin",
  LEGACY_PARCEIRO: "/e/parceiro",
  EVENTO_CONVIDADO: "/e/:codigoUrl/:slug",
  EVENTO_CONVIDADO_CURTO: "/e/:slug",
  EVENTO_CONVITE: "/convite/:codigoUrl/:slug",
  EVENTO_CONVITE_CURTO: "/convite/:slug",
  EVENTO_TELAO: "/telao/:codigoUrl/:slug",
  EVENTO_TELAO_CURTO: "/telao/:slug",
  GESTAO_PAI: "/gestao/:token",
  LEGACY_ADMIN_LOGIN: "/admin/login",
  ADMIN_DASHBOARD: "/admin",
  PARCEIRO_LOGIN: "/parceiro/login",
  PARCEIRO_PORTAL: "/parceiro",
  IMPERSONATE_BRIDGE: "/impersonate-bridge",
} as const;

export const STORAGE_KEYS = {
  CONVIDADO_SESSAO_ID: "@festalgia:convidado_sessao_id",
  CONVIDADO_NOME_AUTOR: "@festalgia:convidado_nome_autor",
  CONVIDADO_CURTIDAS: "@festalgia:convidado_curtidas",
  CONVIDADO_MINHAS_MIDIAS: "@festalgia:convidado_minhas_midias",
  CONVITE_CONFIRMADO_POR_SLUG: "@festalgia:convite_confirmado_por_slug",
  ADMIN_FILTRO_STATUS: "@festalgia:admin_filtro_status",
  ADMIN_ABA_ATIVA: "@festalgia:admin_aba_ativa",
  GESTAO_DICA_DISPENSADA: "@festalgia:gestao_dica_dispensada",
  PARCEIRO_IMPERSONATING: "@festalgia:parceiro_is_impersonating",
  TEMA: "@festalgia:tema",
} as const;

export const TEMA = {
  CLARO: "CLARO",
  ESCURO: "ESCURO",
  SISTEMA: "SISTEMA",
} as const;
export type Tema = (typeof TEMA)[keyof typeof TEMA];

export const TEMA_CLASSE_ESCURO = "dark" as const;

export const TEMA_COR_BARRA = {
  CLARO: "#54074B", // cor-fixa: meta theme-color precisa de hex
  ESCURO: "#150716",
} as const;

/** Cores de arquivos gerados em canvas (plaquinha do QR, foto composta). Canvas não lê CSS, então ficam aqui. */
export const CORES_ARTE = {
  FUNDO_FOTO: "#111111",
  ESCURECER_FUNDO_FOTO: "rgba(0, 0, 0, 0.35)",
  PLAQUINHA_CIRCULO: "rgba(255, 255, 255, 0.10)",
  PLAQUINHA_SOMBRA: "rgba(31, 16, 43, 0.28)",
  PLAQUINHA_CARTAO: "#FDFBFF",
  PLAQUINHA_TEXTO_SELO: "#FFFFFF",
  PLAQUINHA_TITULO: "#1E1028",
  PLAQUINHA_TEXTO_SUAVE: "#5C4D68",
  PLAQUINHA_URL: "#7A6A86",
  PLAQUINHA_PASSO: "#F5EFFA",
  QR_TINTA: "#1E1028",
  QR_FUNDO: "#FFFFFF",
} as const;

export const COR_DESTAQUE_MOLDURA_PADRAO = "#ffffff" as const;

/** Só admin, parceiro e gestão dos pais aceitam tema escuro. Convidado, convite e telão ficam sempre claros. */
export const TEMA_ROTAS_PREFIXOS = [
  "/admin",
  "/parceiro",
  "/gestao",
  "/login",
  "/impersonate-bridge",
] as const;

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

export const FESTA_CODIGO_MODULO = {
  GALERIA: "GALERIA",
  CONVITE: "CONVITE",
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
  CONVITE_CONFIRMADOS: "CONVITE_CONFIRMADOS",
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

export const FESTA_MODO_CONVIDADO = {
  GALERIA: "GALERIA",
  CAMERA: "CAMERA",
  REVISAO: "REVISAO",
} as const;

export type FestaModoConvidado =
  (typeof FESTA_MODO_CONVIDADO)[keyof typeof FESTA_MODO_CONVIDADO];

export const FESTA_TELA_CONVIDADO = {
  INICIO: "INICIO",
  MURAL: "MURAL",
} as const;

export type FestaTelaConvidado =
  (typeof FESTA_TELA_CONVIDADO)[keyof typeof FESTA_TELA_CONVIDADO];

export const FESTA_FILTRO_STATUS_TODOS = "TODOS" as const;

export const FESTA_ACAO_MIDIA = {
  VISIBILIDADE: "VISIBILIDADE",
  PIN: "PIN",
  EXCLUIR: "EXCLUIR",
} as const;

export type FestaAcaoMidia =
  (typeof FESTA_ACAO_MIDIA)[keyof typeof FESTA_ACAO_MIDIA];

export const FESTA_ACAO_MOLDURA = {
  ATIVA: "ATIVA",
  EXCLUIR: "EXCLUIR",
} as const;

export type FestaAcaoMoldura =
  (typeof FESTA_ACAO_MOLDURA)[keyof typeof FESTA_ACAO_MOLDURA];

export const FESTA_DESTINO_UPLOAD_EXTRA = {
  CAPA: "capa",
  PDF: "pdf",
  CONVITE_FOTO: "convite-foto",
  CONVITE_BANNER: "convite-banner",
  CONVITE_MUSICA: "convite-musica",
  CONVITE_AUDIO_OBRIGADO: "convite-audio-obrigado",
} as const;

export type FestaDestinoUploadExtra =
  (typeof FESTA_DESTINO_UPLOAD_EXTRA)[keyof typeof FESTA_DESTINO_UPLOAD_EXTRA];

export const FESTA_ETAPA_RECUPERACAO_SENHA = {
  IDENTIFICACAO: 1,
  VALIDAR_CODIGO: 2,
  NOVA_SENHA: 3,
} as const;

export type FestaEtapaRecuperacaoSenha =
  (typeof FESTA_ETAPA_RECUPERACAO_SENHA)[keyof typeof FESTA_ETAPA_RECUPERACAO_SENHA];

export const FESTA_DIALOG_NAMES = {
  CONFIRM_ACTION: "confirmActionDialog",
  EVENTO_FORM: "eventoFormDialog",
  PAGAMENTO_MANUAL: "pagamentoManualDialog",
  MOLDURAS_EVENTO: "moldurasEventoDialog",
  QRCODE_LINKS: "qrCodeLinksDialog",
  MIDIA_VIEWER: "midiaViewerDialog",
  MIDIAS_EVENTO_ADMIN: "midiasEventoAdminDialog",
  EXTRAS_EVENTO_ADMIN: "extrasEventoAdminDialog",
  PRODUTO_B2C_FORM: "produtoB2cFormDialog",
  PACOTE_B2C_FORM: "pacoteB2cFormDialog",
  EXTRA_B2C_FORM: "extraB2cFormDialog",
  TEMA_CATALOGO_FORM: "temaCatalogoFormDialog",
  PARCEIRO_B2B_FORM: "parceiroB2bFormDialog",
  PLANO_B2B_FORM: "planoB2bFormDialog",
  EVENTO_PARCEIRO_B2B_FORM: "eventoParceiroB2bFormDialog",
  OPERADOR_PARCEIRO_FORM: "operadorParceiroFormDialog",
  RECUPERAR_SENHA: "recuperarSenhaDialog",
  CONFIRMACAO_RSVP_FORM: "confirmacaoRsvpFormDialog",
  CONFIRMACOES_EVENTO: "confirmacoesEventoDialog",
} as const;

export type FestaDialogName =
  (typeof FESTA_DIALOG_NAMES)[keyof typeof FESTA_DIALOG_NAMES];

export const FESTA_CORES_PADRAO = {
  PRIMARIA: "#54074B",
  SECUNDARIA: "#F7AF1F",
  PARCEIRO_MARCA: "#54074B",
} as const;
