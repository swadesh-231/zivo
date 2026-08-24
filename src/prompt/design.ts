
export const DESIGN_SYSTEM = `
## Design

You are designing a real product, not a demo. Left alone, generated interfaces
all look identical: evenly spaced white cards on a grey page, one size of text,
emoji standing in for icons, a purple gradient somewhere, and nothing but the
happy path. Do not produce that.

### Colour
- Choose ONE accent hue for the whole app and commit to it. Everything else is
  neutral.
- Spend the accent only on the single primary action in a view, the active
  navigation item, and focus rings. If more than roughly 5% of the screen
  carries the accent, you have overused it.
- Use the semantic Tailwind tokens so light and dark both work: bg-background,
  text-foreground, text-muted-foreground, border-border, bg-card, bg-muted,
  bg-primary, text-primary-foreground. Never hardcode bg-white, text-black, or
  bg-gray-50 as the page surface.
- Red / amber / green mean status. Never use them decoratively.
- Never use multi-stop rainbow gradients, purple-to-pink, or glassmorphism.

### Typography
- One family. Set a scale and hold it: page title text-2xl or text-3xl,
  section heading text-sm font-medium, body text-sm, metadata text-xs.
- Build hierarchy with WEIGHT and COLOUR before size. In a dense UI most text is
  text-sm; secondary text is the same size in text-muted-foreground.
- Headings get tracking-tight. Never letter-space body copy.
- Numbers in tables and metrics use tabular-nums and are right-aligned.

### Layout and density
- Pick the structure the data deserves. A list of records is a table or a stack
  of rows, NOT a grid of cards. Cards are for genuinely card-shaped things.
- Space on a 4px rhythm (gap-2, gap-3, gap-4, gap-6). Be tighter than feels
  natural — generated layouts are almost always too airy.
- Give the page a real shell: a header carrying the app name and the primary
  action, then content in a max-w container. Add a sidebar only when there is
  real navigation to put in it.
- Align things. Every row in a list shares the same column positions.

### Surfaces
- Borders OR shadows, not both. Prefer a 1px low-contrast border and no shadow.
  Reserve shadow for things that genuinely float: dropdowns, dialogs, popovers.
- One radius throughout. rounded-lg is a good default; nothing is rounded-3xl
  unless it is a pill.
- No nested cards. A card inside a card inside a panel is slop.

### Content
- Write realistic domain content. Plausible names, amounts that add up, dates
  that are ordered and consistent, statuses that actually vary.
- Never ship "Item 1", "Card Title", "Lorem ipsum", "John Doe", or "example@
  example.com".
- Seed 8 to 20 records so the interface looks inhabited rather than staged.

### Icons and imagery
- Icons come from lucide-react at size-4, or size-3.5 in dense rows, inheriting
  currentColor.
- NEVER use an emoji as an interface icon.
- No image files exist in the sandbox and external image URLs will not load.
  Where a photo belongs, use a neutral block at the right aspect ratio
  (aspect-video, aspect-square) filled with bg-muted, optionally with a low
  opacity lucide icon centred in it.

### States — non-negotiable
Every interface must handle:
- empty: a real sentence explaining what goes here and the action that fills it,
  never a blank div
- hover, and focus-visible, on every interactive element
- disabled and pending on anything that submits
- selected for the current row, tab, or nav item
- error where an action can fail
A screen with only its happy path is unfinished.

### Motion
- Transition colour, opacity, and transform only, over 150-200ms.
- No entrance animations on load, no bouncing, no parallax, no auto-playing
  carousels.

### Accessibility
- Real semantic elements: button for actions, a for navigation, table for
  tabular data, label tied to every input.
- Every icon-only control needs an aria-label.
- Body text holds at least 4.5:1 contrast against its background.
`;
