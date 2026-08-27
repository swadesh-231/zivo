
export const DESIGN_DIRECTIONS = `
## Design directions

The brief names ONE direction. Build every screen in it. A direction decides the
things the colour tokens cannot: type, shape, density, and the one move that
makes the app recognisable.

Available fonts, and only these: \`font-sans\` (Geist), \`font-display\`
(Instrument Serif), \`font-mono\` (Geist Mono).

### EDITORIAL
Reading, journaling, recipes, travel, culture, long-form anything.
- Type: \`font-display\` for every screen title and any number worth showing off,
  at text-[32px]/text-[40px], tracking-tight. Body stays \`font-sans\`.
- Shape: rounded-none to rounded-lg. Rules, not cards — a border-t between rows
  instead of a container around each one.
- Density: airy. gap-6 between sections, py-4 rows, wide leading on body copy.
- Colour: near-monochrome. The accent appears once per screen, usually as a
  single word or a rule.
- Signature: a full-bleed opening image block with the title overlapping its
  lower edge.
- Never: shadows, filled buttons on more than one element, chips.

### PRECISION
Finance, analytics, trading, logistics, anything where numbers are the content.
- Type: \`font-sans\` throughout, \`font-mono\` for every figure. tabular-nums is
  mandatory. Labels are text-[11px] uppercase tracking-wide text-app-muted.
- Shape: rounded-lg, hairline borders, no shadow anywhere.
- Density: tight. py-2.5 rows, gap-3 sections. More data per screen than feels
  comfortable — that is the aesthetic.
- Colour: near-black on white (or the dark equivalent). Accent only on the
  primary figure and the active state. Status colours carry real meaning.
- Signature: a dense figure row at the top of the screen — three or four numbers
  with tiny labels, divided by hairlines.
- Never: illustration, rounded-2xl, gradients, decorative icons.

### SOFT
Health, habits, wellbeing, family, sleep, anything gentle and daily.
- Type: \`font-sans\`, headings at font-semibold rather than bold. Generous
  leading. Nothing uppercase.
- Shape: rounded-3xl on cards, rounded-full on controls and pills.
- Density: roomy. p-5 cards, gap-4 stacks.
- Colour: warm off-white ground, low contrast between surface and background,
  accent used as a soft fill (bg-app-accent-weak) far more than as a solid.
- Signature: one large rounded progress or state element — a ring, an arc, a
  stacked bar — as the first thing on the home screen.
- Never: hairline-dense lists, uppercase labels, monospace, hard shadows.

### UTILITY
Developer tools, ops, monitoring, file and device management, self-hosted things.
- Type: \`font-sans\` for prose, \`font-mono\` for identifiers, paths, times, and
  every status string.
- Shape: rounded-md. Hairline borders. Flat.
- Density: very tight. py-2 rows, text-[13px] body, dividers between everything.
- Colour: dark scheme by default. Accent reserved strictly for active state and
  one primary action. Status colours do real work.
- Signature: a persistent status strip — a row of small mono key/value pairs —
  under the nav bar.
- Never: rounded-2xl, illustration, large type, empty decorative space.

### DISPLAY
Fitness, music, events, sport, anything with energy.
- Type: enormous. text-[44px]+ font-bold tracking-[-0.04em] headings in
  \`font-sans\`. Numbers dominate.
- Shape: flat colour blocks, rounded-2xl, no borders — surfaces separate by
  colour, not by line.
- Density: bold and simple. One idea per section, large touch targets.
- Colour: highest contrast of any direction. Accent used as a full-bleed block
  behind a whole section, not as a small mark.
- Signature: one screen where a single number fills most of the frame.
- Never: hairlines, small text as the main content, muted palettes.

### CRAFT
Food, growing, making, artisanal commerce, anything with provenance.
- Type: \`font-display\` for names and titles, \`font-sans\` for everything else.
  Small caps-feeling labels: text-[11px] tracking-[0.08em] uppercase.
- Shape: rounded-xl, thin borders, occasional double rule.
- Density: measured. Real whitespace around each item.
- Colour: warm, slightly desaturated ground. Accent is earthy and used on labels
  and marks rather than fills.
- Signature: item cards with a tall 3:4 tonal image block and the name set in
  the display serif beneath.
- Never: neon accents, dense tables, mono type, glossy surfaces.

### CLINICAL
Medical, admin, legal, education, government, forms and records.
- Type: \`font-sans\`, generous leading, clear labels above every value. Nothing
  smaller than text-[13px] for content.
- Shape: rounded-xl grouped lists, strict left alignment, hairline dividers
  inset to the text origin.
- Density: calm and legible. py-3.5 rows, clear section captions.
- Colour: cool neutral ground. Accent is quiet. Status colours are unambiguous
  and always paired with a word, never colour alone.
- Signature: grouped record cards with a clear label/value column that lines up
  perfectly down the screen.
- Never: playful shapes, decorative icons, low-contrast text, dense rows.

### NOCTURNE
Sleep, astronomy, meditation, photography, music at night.
- Type: \`font-sans\` light-to-regular weights, wide leading, generous tracking on
  small labels.
- Shape: rounded-2xl, no borders — surfaces separate by luminance alone.
- Density: sparse. Large empty regions are the point.
- Colour: deep tinted dark scheme, always. One luminous accent that appears to
  emit light. Neutrals stay very close together in lightness.
- Signature: a single glowing element — an arc, a dot field, a soft radial —
  rendered with the accent at low opacity behind the content.
- Never: light scheme, hairline borders, dense lists, hard white.

## Working in a direction

- The direction is a commitment, not a mood board. If it says rounded-none,
  nothing on any screen is rounded-2xl.
- It overrides the general shape and density guidance in the design rules. Where
  they disagree, the direction wins.
- One direction per app. Never blend two.
`;
