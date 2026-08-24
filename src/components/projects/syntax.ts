export type TokenKind =
  | "plain"
  | "comment"
  | "string"
  | "keyword"
  | "tag"
  | "number";

export type Token = { text: string; kind: TokenKind };

const KEYWORDS = [
  "import", "from", "export", "default", "function", "const", "let", "var",
  "return", "if", "else", "for", "while", "do", "switch", "case", "break",
  "continue", "new", "class", "extends", "implements", "async", "await",
  "try", "catch", "finally", "throw", "typeof", "instanceof", "interface",
  "type", "enum", "public", "private", "protected", "readonly", "static",
  "as", "of", "in", "void", "delete", "yield", "satisfies",
  "null", "undefined", "true", "false", "this", "super",
];

/**
 * One pass over the whole file so multi-line comments and template literals
 * are tokenised correctly, rather than per line.
 */
const TOKEN = new RegExp(
  [
    String.raw`(?<comment>\/\/[^\n]*|\/\*[\s\S]*?\*\/)`,
    String.raw`(?<string>\`(?:\\.|[^\`\\])*\`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')`,
    String.raw`(?<tag><\/?[A-Za-z][\w.]*)`,
    String.raw`(?<keyword>\b(?:${KEYWORDS.join("|")})\b)`,
    String.raw`(?<number>\b\d[\w.]*\b)`,
  ].join("|"),
  "g",
);

/** Splits source into per-line token runs, ready to render with line numbers. */
export function tokenizeLines(code: string): Token[][] {
  const lines: Token[][] = [[]];

  const push = (text: string, kind: TokenKind) => {
    const parts = text.split("\n");

    parts.forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, kind });
    });
  };

  let cursor = 0;

  for (const match of code.matchAll(TOKEN)) {
    const start = match.index ?? 0;

    if (start > cursor) push(code.slice(cursor, start), "plain");

    const kind =
      (Object.entries(match.groups ?? {}).find(
        ([, value]) => value !== undefined,
      )?.[0] as TokenKind | undefined) ?? "plain";

    push(match[0], kind);
    cursor = start + match[0].length;
  }

  if (cursor < code.length) push(code.slice(cursor), "plain");

  return lines;
}

export const TOKEN_CLASS: Record<TokenKind, string> = {
  plain: "text-foreground/80",
  comment: "text-muted-foreground/45 italic",
  string: "text-emerald-600 dark:text-emerald-400",
  keyword: "text-violet-600 dark:text-violet-400",
  tag: "text-sky-600 dark:text-sky-400",
  number: "text-amber-600 dark:text-amber-400",
};
