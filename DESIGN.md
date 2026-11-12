# Festalgia: guia visual

Uma só identidade para landing, convidado, telão e gestão dos pais: **ingresso de festa com foto e legenda**. Admin, portal do parceiro e gestão dos pais usam os mesmos tokens e têm tema claro e escuro (seção Tema).

## Cores

| Nome | Valor | Uso |
|------|-------|-----|
| Ameixa | `#240A21` | Texto principal, fundos escuros (telão, câmera, sidebar) |
| Ameixa suave | `#664763` | Texto secundário |
| Algodão | `#ffe4f0` | Fundo rosado da landing; no app o fundo é `--background` (creme rosado) |
| Papel | `#fdfbff` | Barras fixas (header) com blur |
| Uva (roxo ameixa do logo) | `#54074B` | Ação primária (`--primary`), hover `#390533`. Some em fundo escuro, ali use Gema |
| Uva claro | `#EFE6F6` | Botões suaves, fundos de ícone (mesmo lilás do ícone de app) |
| Rosa | `#e6007e` / `#ff4f9a` | Destaques, curtidas, ações destrutivas leves |
| Gema (dourado do logo) | `#F7AF1F` | Selos (data, "Demonstração", status) e estado ativo em fundo escuro, sempre com texto ameixa |

Nas telas `/e/:slug` e `/telao/:slug`, `--cor1` e `--cor2` (cores do evento) mandam nos botões principais, seleção de moldura e brilho do telão. As cores da marca ficam em tudo o mais.

Os tokens shadcn (`--background`, `--primary`, `--muted`, `--border` etc.) em `src/index.css` seguem essa paleta; use-os em vez de hex.

## Logo

O símbolo é um "f" minúsculo de traço grosso e arredondado, com o braço levantado segurando uma faísca dourada. O nome vai sempre em minúsculo (**festalgia**), com uma estrelinha dourada no pingo do "i".

| Cor do logo | Valor | Uso |
|-------------|-------|-----|
| Roxo ameixa | `#54074B` | "f" e nome sobre fundo claro |
| Dourado | `#F7AF1F` | Faísca e estrelinha, nunca o nome |
| Lilás claro | `#EFE6F6` | Fundo do ícone de app e do avatar social |

A interface usa os mesmos roxo e dourado do logo (Uva e Gema na seção Cores). Use os tokens, não o hex.

- **Componente:** `LogoFestalgia` (`src/components/ui/LogoFestalgia.tsx`), com `variante` (`LOGO_VARIANTE.HORIZONTAL` ou `ICONE`) e `fundo` (`LOGO_FUNDO.CLARO` ou `ESCURO`). Defina só a altura em `className`; a largura é automática.
- **Fundo escuro** (sidebar, telão, rodapé): versão branca com faísca dourada.
- **Sobre foto:** use a versão toda branca. Os arquivos estão em `src/assets/marca`.
- **Tamanho mínimo:** 24 px de altura no logo horizontal e 16 px no ícone. O favicon usa o ícone ampliado e só com a faísca grande.
- **Respiro:** pelo menos metade da altura do "f" em volta do logo.
- **Não fazer:** recolorir, esticar, aplicar o "f" branco dentro de círculo ou quadrado de cor sólida (lembra logo de rede social), nem trocar a faísca por outro símbolo.

## Tipografia

- **Bricolage Grotesque** (variável, self-hosted): títulos, números grandes e botões de destaque. Peso 800, entrelinha 1 a 1,1, espaçamento levemente negativo.
- **Inter** (400 a 700, self-hosted): corpo e controles.
- Sem rótulos em caixa-alta e sem texto decorativo acima dos títulos. Frases em português simples, em caixa de frase.

## Formas e sombras

- Cartões: `rounded-card` (28px). Botões: pílula (`rounded-button`, 999px). Fotos: 24px.
- Sombras tingidas de ameixa: `shadow-card` (repouso), `shadow-suave` (elemento em destaque), `shadow-palco` (hero, telão).
- Assinatura visual (usar com moderação): **ticket** (entalhes circulares nas laterais + linha `.picotado`) e **foto com legenda** (tarja branca com nome e curtida, classe `.legenda-foto`).
- Selo de data inclinado (`-rotate-3`, fundo gema) no hero do convidado. Moldura selecionada sobe 4px e inclina levemente.
- `.xadrez` mostra a transparência das molduras PNG.

## Componentes

- **Header do convidado e da gestão:** barra fixa `bg-papel/90` com blur, título em Bricolage, abas em controle segmentado (pílula branca sobre trilho `ameixa/6`).
- **Hero do convidado:** ticket com capa (foto ou gradiente `--cor1` a `--cor2`), título grande, selo de data; abaixo da linha picotada, seletor de molduras e dois botões grandes.
- **Mural:** grade de cartões com foto 9:16 e legenda (nome + curtida). Estado vazio com ícone gema inclinado.
- **Telão:** fundo ameixa com dois brilhos nas cores do evento; mural com legenda; slideshow com foto-palco (anel branco + brilho), nome do convidado em 60px e QR em ticket.
- **Gestão:** contadores grandes que funcionam como filtros (Todas, Visíveis, Pendentes, Ocultas), cartões de foto com selo de situação, barra flutuante de ações em lote.
- **Banner:** tinta suave (8%) com borda de 20%, cantos 22px, texto nos tokens `foreground`/`muted-foreground`.
- **Botões** (`Button`): variantes `default` (uva), `tonal`, `secondary`, `outline`, `ghost`, `destructive`, sempre em pílula. Telas novas podem usar as classes diretamente (`h-10 rounded-full ...`).

## Acessibilidade

Foco visível nos botões, `aria-pressed` e `aria-selected` nos seletores, rótulos em botões só com ícone, `tabular-nums` nos contadores.

## Tema claro e escuro

- **Onde vale:** só admin (`/admin`), portal do parceiro (`/parceiro`, `/login`) e gestão dos pais (`/gestao`). Álbum do convidado, convite e telão ficam sempre claros. A lista de rotas está em `TEMA_ROTAS_PREFIXOS` (`src/constants`); fora dela o `TemaProvider` remove a classe `dark` do `<html>`.
- **Escolha da pessoa:** claro, do aparelho (padrão) ou escuro, guardada em `localStorage` (`STORAGE_KEYS.TEMA`). O botão é o `AlternadorTema` (sidebar do admin e do parceiro, header da gestão, telas de login). Um script no `index.html` aplica o tema antes da pintura para não piscar.
- **Como funciona:** os tokens `:root` são o claro; `.dark` em `src/index.css` troca os valores. Use sempre tokens, nunca `bg-white`, `text-ameixa`, `emerald-*` ou hex nas telas internas.
- **Escuro:** fundo ameixa profundo (`--background`), cartões um degrau acima (`--card`), ação primária vira Gema (`--primary`) com texto ameixa. A sidebar é escura nos dois temas.

| Token | Claro | Escuro | Uso |
|-------|-------|--------|-----|
| `background` / `card` | creme rosado / branco | ameixa 6% / ameixa 10% | Página e cartões |
| `primary` | Uva | Gema | Ação principal, abas ativas |
| `secondary`, `muted`, `accent` | lilás claro | ameixa 14 a 18% | Botões suaves, trilhos, hover |
| `foreground` / `muted-foreground` | Ameixa / Ameixa suave | lilás-branco / lilás 70% | Texto |
| `bar` | Papel | ameixa 8% | Headers fixos com blur |
| `success`, `warning`, `info`, `danger` (+ `-soft`, `-border`) | texto escuro sobre fundo pastel | texto claro sobre fundo translúcido | Selos, banners, ícones de KPI |

Exceções que ficam brancas de propósito: o ladrilho do QR Code (precisa de contraste para a câmera) e o selo de situação sobre foto.

## Telas internas

- **Sidebar** (`SidebarNavItem`): item ativo com fundo branco a 10%, ícone Gema e barra Gema à esquerda no desktop; contador em pílula. Nomes em caixa de frase.
- **Título de página** (`TituloPagina`, ou o `AdminHeader` na lista de pedidos): título em Bricolage 800 e uma linha de apoio; a ação principal (Novo pedido) fica à direita.
- **Cartão de pedido:** selos, título, link em mono, total com barra de pagamento (`success`), e a fileira de ações separada por linha. Excluir é ícone `destructive`.
- **KPIs:** ícone em chip `*-soft`, valor em Bricolage 800.
- **Saldo do parceiro:** número grande em Gema na sidebar.

## Sem cor fixa

- Telas internas (admin, parceiro, gestão, diálogos e `components/ui`): só tokens semânticos (`background`, `card`, `primary`, `muted`, `success`..., `sidebar-*`, `scrim-*`, `qr`, `gema`/`gema-foreground`). Nada de `bg-white`, `text-ameixa`, `uva`, `rosa`, `emerald-*` ou hex.
- Todas as telas: sem hex, `rgb()` nem paleta do Tailwind (`black`, `slate`, `sky`...). Camada sobre foto ou câmera é `scrim`; ladrilho do QR é `qr`; papel do convite é `convite-papel`.
- Arquivos gerados em canvas (plaquinha do QR, foto composta) não leem CSS: as cores ficam em `CORES_ARTE` (`src/constants`).
- `npm run verificar:cores` falha se aparecer cor fixa. Exceção pontual: comentário `cor-fixa: motivo` na linha.

## Login

Uma tela só (`/parceiro/login`, `LoginPage`) para parceiros e equipe Festalgia; `/login` e `/admin/login` redirecionam para ela. O perfil (`/api/auth/me`) decide o destino: admin vai para `/admin`, parceiro e operador para `/parceiro`. A tela não menciona o admin. Desktop: painel de marca à esquerda e formulário à direita. Tablet: cartão centralizado. Celular: formulário direto no fundo, campos de 48px com texto de 16px (evita zoom no iOS).
