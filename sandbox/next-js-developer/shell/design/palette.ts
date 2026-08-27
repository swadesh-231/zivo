/**
 * The whole palette derives from one hue.
 *
 * This is a structural rule, not a stylistic one. Asking a model to "pick one
 * accent and keep everything else neutral" produces a different answer every
 * run — three accents, a stray purple gradient, greys from four different
 * families. Deriving every token from a single number makes that impossible to
 * get wrong: the design picks a hue, and the ramp is already coherent.
 *
 * The neutrals carry a trace of the accent hue (chroma 0.004-0.016). It is
 * below the threshold of "coloured", but it is the difference between a design
 * that looks considered and one that looks like text on default grey.
 */
export type Scheme = "light" | "dark";

export type Palette = {
  bg: string;
  surface: string;
  elevated: string;
  border: string;
  text: string;
  muted: string;
  faint: string;
  accent: string;
  accentFg: string;
  accentWeak: string;
  success: string;
  warning: string;
  danger: string;
};

const STATUS = { success: 152, warning: 75, danger: 25 };

export function palette(hue: number, scheme: Scheme): Palette {
  const h = ((hue % 360) + 360) % 360;

  if (scheme === "dark") {
    return {
      bg: `oklch(0.163 0.012 ${h})`,
      surface: `oklch(0.208 0.014 ${h})`,
      elevated: `oklch(0.246 0.016 ${h})`,
      border: `oklch(0.302 0.016 ${h})`,
      text: `oklch(0.971 0.005 ${h})`,
      muted: `oklch(0.681 0.014 ${h})`,
      faint: `oklch(0.228 0.014 ${h})`,
      accent: `oklch(0.706 0.148 ${h})`,
      accentFg: `oklch(0.178 0.032 ${h})`,
      accentWeak: `oklch(0.302 0.061 ${h})`,
      success: `oklch(0.706 0.138 ${STATUS.success})`,
      warning: `oklch(0.769 0.140 ${STATUS.warning})`,
      danger: `oklch(0.681 0.176 ${STATUS.danger})`,
    };
  }

  return {
    bg: `oklch(0.985 0.004 ${h})`,
    surface: `oklch(1 0 0)`,
    elevated: `oklch(1 0 0)`,
    border: `oklch(0.918 0.006 ${h})`,
    text: `oklch(0.208 0.012 ${h})`,
    muted: `oklch(0.548 0.012 ${h})`,
    faint: `oklch(0.968 0.005 ${h})`,
    accent: `oklch(0.575 0.168 ${h})`,
    accentFg: `oklch(0.991 0.010 ${h})`,
    accentWeak: `oklch(0.948 0.040 ${h})`,
    success: `oklch(0.548 0.132 ${STATUS.success})`,
    warning: `oklch(0.638 0.148 ${STATUS.warning})`,
    danger: `oklch(0.552 0.192 ${STATUS.danger})`,
  };
}

/** The custom properties `design/tokens.css` maps onto Tailwind colour names. */
export function paletteVars(hue: number, scheme: Scheme) {
  const p = palette(hue, scheme);

  return {
    "--app-bg": p.bg,
    "--app-surface": p.surface,
    "--app-elevated": p.elevated,
    "--app-border": p.border,
    "--app-text": p.text,
    "--app-muted": p.muted,
    "--app-faint": p.faint,
    "--app-accent": p.accent,
    "--app-accent-fg": p.accentFg,
    "--app-accent-weak": p.accentWeak,
    "--app-success": p.success,
    "--app-warning": p.warning,
    "--app-danger": p.danger,
    colorScheme: scheme,
  } as React.CSSProperties;
}
