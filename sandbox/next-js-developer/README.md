# `zivo-nextjs-developer` — E2B sandbox template

The image every Zivo build runs inside: Next.js on Bun, Tailwind v4, and the
full shadcn/ui set, with a dev server already serving on port 3000.

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
| Verify layout | Fails the build instead of publishing a template whose sandboxes come up with no app in them. |
| Prewarm | Boots the dev server once and requires a 200. Proves the scaffold runs, and bakes the Turbopack cache into the snapshot so the first request in a fresh sandbox is not a cold compile. |

## Changing it

Versions are pinned at the top of `template.ts`. Two things move with them:

- **`src/prompt/code-agent.ts`** describes this image to the model — the paths,
  the port, and which packages are preinstalled. `shadcn init -d` resolves to
  the base-nova preset, so the components are built on **`@base-ui/react`, not
  Radix**; the prompt has to say so or the agent installs a package that will
  not help.
- **`src/features/inngest/functions.ts`** creates sandboxes from the `name` in
  `package.json` and reads the preview from port 3000.

A template build takes several minutes and is billed, so build the `-dev` alias
while iterating.
