# `zivo-nextjs-developer` — E2B sandbox template

The image every Zivo design runs inside: Next.js on Bun, Tailwind v4, the full
shadcn/ui set, and the **design shell** — a phone frame, an overview canvas, and
a focus mode — with a dev server already serving on port 3000.

## Build it

```bash
bun run sandbox:build       # publishes the "zivo-nextjs-developer" alias
bun run sandbox:build:dev   # publishes "zivo-nextjs-developer-dev" instead
```

Both need `E2B_API_KEY` in `.env`. The app resolves the alias from
`E2B_TEMPLATE_ID`, defaulting to the `name` in `package.json` — so to try a
template change without disturbing anyone, build the `-dev` alias and set
`E2B_TEMPLATE_ID=zivo-nextjs-developer-dev`.

## What the build does

| Step | Why |
| --- | --- |
| `create-next-app@16.3.2` | Every layout flag is explicit. `--yes` alone falls back to preferences saved on the machine running the build, and `--src-dir` leaking in moves every path the agent is told to use. |
| `shadcn init -d` + `add -a` | Installs all 61 components under `components/ui`, plus `lib/utils.ts`. |
| Promote to `$HOME` | `create-next-app` will not scaffold into a non-empty directory, so the app is built in `nextjs-app/` and moved up. `find -mindepth 1` rather than `mv dir/*`, which silently leaves dotfiles behind. |
| Copy the design shell | `shell/design/*` and the two `app/` files. See below. |
| Append colour tokens | Tailwind v4 reads `@theme` from the stylesheet, so the shell's tokens go into the `app/globals.css` shadcn generated rather than sitting beside the components that use them. |
| Verify layout | Fails the build instead of publishing a template whose sandboxes come up with no app in them. Also asserts the shell landed and its tokens reached `globals.css`. |
| Prewarm | Boots the dev server once and requires a 200. Proves the scaffold runs, and bakes the Turbopack cache into the snapshot so the first request in a fresh sandbox is not a cold compile. |

## The design shell (`shell/`)

The agent designs screens. It does not draw phones.

Chrome regenerated per build is chrome that drifts — the clock lands two pixels
off, the tab labels change weight, the safe area is right on four screens and
wrong on the fifth. That drift is most of what makes a generated design read as
generated, so it ships in the image instead:

| File | What it is |
| --- | --- |
| `design/frame.tsx` | The 393x852 device: bezel, Dynamic Island, and the scale transform the canvas uses. |
| `design/chrome.tsx` | `Screen`, `ScreenBody`, `NavBar`, `TabBar`, `IconButton`, and the status bar / home indicator. |
| `design/canvas.tsx` | The workspace: every screen at once, and the focus mode one opens into. |
| `design/palette.ts` | The whole palette derived from a single hue. |
| `design/navigation.tsx` | `useNavigate()`, and the canvas/focus routing behind it. |
| `design/app-meta.ts` | **The agent edits this** — name, tagline, hue, scheme. |
| `design/screens.ts` | **The agent edits this** — the screen manifest. |
| `app/page.tsx`, `app/layout.tsx` | Replace what create-next-app scaffolds. The whole app is the workspace. |

Two rules hold this together, and both are in `src/prompt/code-agent.ts`:

- The agent writes `app/screens/*`, `design/app-meta.ts`, and `design/screens.ts`.
  Everything else in `design/` is off limits.
- Colour comes only from the `app-*` Tailwind names. They resolve to custom
  properties `paletteVars()` sets per frame, so a single hue in `app-meta.ts`
  drives every surface, and there is no way to write an incoherent palette.

### Two things that are easy to break

- **Nothing may wrap a frame in a `<button>`.** Every screen contains buttons of
  its own, and nested buttons are invalid HTML that fails hydration — React then
  rebuilds the tree on the client. The canvas uses an absolutely positioned
  overlay button beside an `inert` frame instead. It also fixes a quieter bug:
  browsers default a button to `text-align: center`, so a wrapped frame silently
  centred every screen and the overview showed a layout focus mode did not.
- **`.zv-canvas` sets its own `color`.** The workspace deliberately does not use
  the app palette, and nothing else sets a text colour there — without it the
  canvas goes dark and the titles stay black on it.

### Changing the shell

It is excluded from the repo's `tsconfig.json` and ESLint config: it compiles
against the *generated* project's module graph (`@/design`, `@/lib/utils`), not
this app's. To check it, scaffold a throwaway Next app, drop `shell/` in beside
a `lib/utils.ts`, and run it — the template build is otherwise the first place a
mistake shows up.

## Changing it

Versions are pinned at the top of `template.ts`. Two things move with them:

- **`src/prompt/code-agent.ts`** describes this image to the model — the paths,
  the port, which packages are preinstalled, and the exact shell API above.
  `shadcn init -d` resolves to the base-nova preset, so the components are built
  on **`@base-ui/react`, not Radix**; the prompt has to say so or the agent
  installs a package that will not help.
- **`src/features/inngest/functions.ts`** creates sandboxes from the `name` in
  `package.json` and reads the preview from port 3000.

A template build takes several minutes and is billed, so build the `-dev` alias
while iterating.
