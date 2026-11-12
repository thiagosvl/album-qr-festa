# Festalgia: guia visual

Uma só identidade para landing, convidado, telão e gestão dos pais: **ingresso de festa com foto e legenda**. O admin e o portal do parceiro usam os mesmos tokens e ganham o tratamento completo numa segunda fase.

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
