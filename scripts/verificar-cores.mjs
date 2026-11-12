// Garante que nenhuma tela use cor fixa. Rode com `npm run verificar:cores`.
// Exceção pontual: comentário `cor-fixa: motivo` na mesma linha.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const RAIZ = new URL("../src", import.meta.url).pathname;

const IGNORAR = [/^constants\/index\.ts$/, /^index\.css$/, /^types\//, /^integrations\//, /^harness\.tsx$/];

const INTERNAS = [
  /^components\/features\/(admin|parceiro|gestao)\//,
  /^components\/dialogs\//,
  /^components\/ui\//,
  /^pages\/(Admin|Parceiro|GestaoPai|Impersonate)/,
];

const PALETA = "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black";
const UTIL = "bg|text|border|ring|from|to|via|fill|stroke|divide|outline|accent|shadow|decoration|caret";

const REGRAS_GERAIS = [
  [/#[0-9a-fA-F]{3,8}\b/, "hex fixo (use token ou CORES_ARTE em constants)"],
  [/\b(rgba?|hsla?)\(\s*\d/, "cor literal em rgb/hsl (use hsl(var(--token)))"],
  [new RegExp(`\\b(${UTIL})-(${PALETA})(-\\d+)?(/[\\d.\\[\\]]+)?\\b`), "cor da paleta Tailwind (use token semântico)"],
];

const REGRAS_INTERNAS = [
  [new RegExp(`\\b(${UTIL})-(white|ameixa|uva|algodao|papel|rosa)(-[a-z]+)?\\b`), "cor de marca ou branco fixo (use background, card, primary, muted, sidebar-*, scrim-* ou qr)"],
];

function listar(dir) {
  return readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome);
    return statSync(caminho).isDirectory() ? listar(caminho) : [caminho];
  });
}

let erros = 0;
for (const arquivo of listar(RAIZ)) {
  const rel = relative(RAIZ, arquivo);
  if (!/\.(tsx?|css)$/.test(rel) || IGNORAR.some((r) => r.test(rel))) continue;
  const interna = INTERNAS.some((r) => r.test(rel));
  const regras = interna ? [...REGRAS_GERAIS, ...REGRAS_INTERNAS] : REGRAS_GERAIS;
  readFileSync(arquivo, "utf8").split("\n").forEach((linha, i) => {
    if (linha.includes("cor-fixa:")) return;
    for (const [regex, motivo] of regras) {
      const m = linha.match(regex);
      if (m) {
        erros++;
        console.error(`${rel}:${i + 1}  ${m[0]}  ->  ${motivo}`);
      }
    }
  });
}

if (erros) {
  console.error(`\n${erros} cor(es) fixa(s) encontrada(s).`);
  process.exit(1);
}
console.log("Nenhuma cor fixa encontrada.");
