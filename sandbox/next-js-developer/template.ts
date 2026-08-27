import { fileURLToPath } from "node:url";

import { Template, waitForURL } from "e2b";

/**
 * Every version here is pinned on purpose.
 *
 * With `latest`, two builds a week apart produce different sandboxes, and
 * CODE_AGENT_PROMPT in `src/prompt/code-agent.ts` tells the model exactly what
 * is installed and where. The prompt and these pins have to move together —
 * when you bump one, re-read the other.
 */
const BUN_IMAGE = "1.3";
const NEXT_VERSION = "16.3.2";
const SHADCN_VERSION = "4.19.0";

const HOME = "/home/user";

/**
 * create-next-app refuses to scaffold into a directory that already has files,
 * and $HOME has shell dotfiles, so the app is built in a subdirectory and moved
 * up afterwards.
 */
const SCAFFOLD_DIR = `${HOME}/nextjs-app`;

/** The port `Sandbox.getHost()` is asked for in the build function. */
const PORT = 3000;

/**
 * Every layout-affecting option is passed explicitly rather than left to
 * `--yes`, which falls back to whatever preferences the machine running the
 * build has saved. `--no-src-dir` is the one that matters most: with a `src/`
 * directory, every path the agent is told to use ("app/page.tsx",
 * "/home/user/components/ui/button.tsx") points at nothing, and its files land
 * outside the app it is supposed to be editing.
 */
const scaffold = [
  `bunx --bun create-next-app@${NEXT_VERSION} .`,
  "--app",
  "--ts",
  "--tailwind",
  "--eslint",
  "--no-src-dir",
  "--import-alias '@/*'",
  "--use-bun",
  "--disable-git",
  "--yes",
].join(" ");

/**
 * `mv dir/*` leaves dotfiles behind — .gitignore among them — and the `rm -rf`
 * that follows would delete them. `find -mindepth 1` moves everything.
 */
const promoteScaffold = [
  `find ${SCAFFOLD_DIR} -mindepth 1 -maxdepth 1 -exec mv {} ${HOME}/ ';'`,
  `rmdir ${SCAFFOLD_DIR}`,
].join(" && ");

/**
 * The design shell: phone frame, status bar, tab bar, overview canvas, focus
 * mode, and the hue-derived palette.
 *
 * It ships in the image rather than being written per build on purpose. Chrome
 * regenerated from a prompt is chrome that drifts — the clock lands two pixels
 * off, the tab labels change weight, the safe area is right on four screens and
 * wrong on the fifth. Baking it in costs the agent nothing and removes the
 * largest single source of "looks generated" from the output. It also means the
 * agent's whole iteration budget goes into screen design instead of bezels.
 *
 * Kept in sync with `src/prompt/code-agent.ts`, which describes this exact
 * surface to the model.
 */
const SHELL_MODULES = [
  "app-meta.ts",
  "canvas.tsx",
  "chrome.tsx",
  "frame.tsx",
  "index.ts",
  "navigation.tsx",
  "palette.ts",
  "screens.ts",
  "types.ts",
];

/**
 * Tailwind v4 reads its palette from `@theme`, so the shell's colour tokens
 * have to live in the stylesheet shadcn already generated rather than beside
 * the components that use them. Appended, then removed, so the sandbox has one
 * source of truth for them instead of two that can disagree.
 */
const installTokens = [
  "cat /tmp/tokens.css >> app/globals.css",
  "rm /tmp/tokens.css",
].join(" && ");

/**
 * Fail the build here rather than publish a template whose sandboxes come up
 * without an app in them. Each path is one the agent is told it can rely on.
 */
const verifyLayout = [
  "app/page.tsx",
  "app/layout.tsx",
  "app/globals.css",
  "lib/utils.ts",
  "components.json",
  "package.json",
  "design/canvas.tsx",
  "design/chrome.tsx",
  "design/screens.ts",
]
  .map((file) => `test -f ${file}`)
  .concat("test -d components/ui", "test -d app/screens")
  .concat("grep -q -- '--color-app-accent' app/globals.css")
  .join(" && ");

/**
 * Boot the dev server once during the build. It does two jobs: it fails the
 * build if the scaffold cannot actually serve a page, and it bakes the
 * Turbopack cache into the snapshot so the first request in a fresh sandbox
 * is not a cold compile.
 *
 * The readiness poll runs through `bun` rather than curl, which the Bun image
 * does not ship.
 */
const poll = [
  "for (let i = 0; i < 120; i++) {",
  `try { const r = await fetch("http://localhost:${PORT}"); if (r.ok) process.exit(0) } catch {}`,
  "await Bun.sleep(1000)",
  "}",
  "process.exit(1)",
].join(" ");

const prewarm = [
  `bun --bun run dev --port ${PORT} > /tmp/prewarm.log 2>&1 &`,
  "DEV_PID=$!;",
  `bun -e '${poll}';`,
  "STATUS=$?;",
  "kill $DEV_PID 2>/dev/null;",
  "if [ $STATUS -ne 0 ]; then cat /tmp/prewarm.log; exit 1; fi",
].join(" ");

export const template = Template({
  // Resolved from this file rather than the shell's cwd, so `bun run
  // sandbox:build` works from anywhere in the repo.
  fileContextPath: fileURLToPath(new URL(".", import.meta.url)),
})
  .fromBunImage(BUN_IMAGE)
  .setEnvs({
    // Keeps the build and every sandbox from phoning home, and keeps the
    // telemetry notice out of the terminal output the agent reads back.
    NEXT_TELEMETRY_DISABLED: "1",
    DO_NOT_TRACK: "1",
  })
  .setWorkdir(SCAFFOLD_DIR)
  .runCmd(scaffold)
  // `init -d` resolves to the base-nova preset, which installs @base-ui/react —
  // not radix-ui. CODE_AGENT_PROMPT has to name the same library.
  .runCmd(`bunx --bun shadcn@${SHADCN_VERSION} init -d -y`)
  .runCmd(`bunx --bun shadcn@${SHADCN_VERSION} add -a -y -o`)
  .runCmd(promoteScaffold)
  .setWorkdir(HOME)
  .runCmd(`mkdir -p ${HOME}/design ${HOME}/app/screens`)
  .copyItems([
    ...SHELL_MODULES.map((file) => ({
      src: `shell/design/${file}`,
      dest: `${HOME}/design/`,
    })),
    { src: "shell/design/tokens.css", dest: "/tmp/" },
    // Replaces what create-next-app scaffolded: the whole app is the design
    // workspace, and the marketing splash it ships with is not part of it.
    { src: "shell/app/page.tsx", dest: `${HOME}/app/` },
    { src: "shell/app/layout.tsx", dest: `${HOME}/app/` },
  ])
  .runCmd(installTokens)
  .runCmd(verifyLayout)
  .runCmd(prewarm)
  .setStartCmd(
    `bun --bun run dev --port ${PORT}`,
    waitForURL(`http://localhost:${PORT}`),
  );
