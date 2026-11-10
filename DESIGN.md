# Festalgia: guia visual

Uma só identidade para landing, convidado, telão e gestão dos pais: **ingresso de festa com foto e legenda**. O admin e o portal do parceiro usam os mesmos tokens e ganham o tratamento completo numa segunda fase.

## Cores

| Nome | Valor | Uso |
|------|-------|-----|
| Ameixa | `#1c0f2e` | Texto principal, fundos escuros (telão, câmera, sidebar) |
| Ameixa suave | `#4b3a63` | Texto secundário |
| Algodão | `#ffe4f0` | Fundo rosado da landing; no app o fundo é `--background` (creme rosado) |
| Papel | `#fdfbff` | Barras fixas (header) com blur |
| Uva | `#7c3aed` | Ação primária (`--primary`), hover `#5b21b6` |
| Uva claro | `#ede4ff` | Botões suaves, fundos de ícone |
| Rosa | `#e6007e` / `#ff4f9a` | Destaques, curtidas, ações destrutivas leves |
| Gema | `#ffd23f` | Selos (data, "Demonstração", status), sempre com texto ameixa |

Nas telas `/e/:slug` e `/telao/:slug`, `--cor1` e `--cor2` (cores do evento) mandam nos botões principais, seleção de moldura e brilho do telão. As cores da marca ficam em tudo o mais.

Os tokens shadcn (`--background`, `--primary`, `--muted`, `--border` etc.) em `src/index.css` seguem essa paleta; use-os em vez de hex.

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
