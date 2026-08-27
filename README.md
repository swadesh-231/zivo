# Zivo

Zivo turns a description into a mobile app design.

Type `Lumen`, or `a sleep tracker, dark and calm`, or a paragraph. An agent
decides what the product actually is, **commits to one of eight design
directions**, and picks the single hue everything derives from. A second agent
designs six screens in that direction against a real phone frame inside an
isolated E2B sandbox. You get an overview canvas of the whole app, a focus mode
you can tap through, every file it wrote, and a chat thread to keep iterating.

Anything you say about the look is taken as an instruction, not a hint.

## Why it does not look generated

"Make it premium" has no failure condition, so a model asked for it returns the
safest thing it knows — the grey card stack — and every app comes out looking
like every other one. Three pieces of structure make that answer unreachable:

- **Directions** (`src/prompt/directions.ts`). Eight named design languages —
  EDITORIAL, PRECISION, SOFT, UTILITY, DISPLAY, CRAFT, CLINICAL, NOCTURNE — each
  with parameters rather than adjectives: the type family, the radius, the row
  density, the one signature move, and a list of things it forbids. The brief
  commits to one before a screen exists, and it overrides the general rules
  wherever they disagree.
- **One hue** (`design/palette.ts` in the sandbox). Every surface, border, and
  state derives from a single number. An incoherent palette is not something the
  design can express.
- **A fixed shell.** The phone frame, status bar, tab bar, canvas, and focus mode
  ship inside the template. Chrome regenerated per design is chrome that drifts,
  and that drift is most of what reads as "generated".

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | Tailwind CSS v4, shadcn on Base UI |
| Data | Neon Postgres via Drizzle ORM |
| Auth | Better Auth with Google and GitHub OAuth |
| Agents | Inngest + `@inngest/agent-kit` |
| Sandboxes | E2B |
| Uploads | ImageKit |
| Request protection | Arcjet |

## Getting started

```bash
bun install
bun run db:migrate
```

Create a `.env` with the variables below before the first run.

Run everything with:

```bash
bun run dev
```

That starts the Next.js dev server and the Inngest dev server together. Builds
are dispatched as Inngest events, so without the Inngest dev server every
project creation fails with `Could not reach the Inngest server`. Use
`bun run dev:next` if you want Next.js on its own.

The agents run inside an E2B template that has to be built once before the
first project — and **rebuilt** after any change to the design shell, which ships
inside it. Without it every design fails with `template
'zivo-nextjs-developer' not found`:

```bash
bun run sandbox:build
```

See [`sandbox/next-js-developer`](sandbox/next-js-developer) for what the
template contains and how to change it.

## Routes

| Path | Access | Purpose |
| --- | --- | --- |
| `/` | Signed out only | Landing page |
| `/sign-in` | Signed out only | Google and GitHub sign-in |
| `/dashboard` | Signed in | Prompt composer and project grid |
| `/projects/[id]` | Signed in | Chat, live preview, generated source |
| `/settings` | Signed in | Profile photo, display name, appearance |

`src/proxy.ts` sends signed-out visitors to `/sign-in` and signed-in visitors
away from the landing page, so the marketing site disappears once you have an
account.

The project screen is two panels: conversation and live design activity on the
left, and the workspace on the right — the running design, or the source behind
it. The preview toolbar downloads the fragment you are looking at as a ZIP.

The design itself renders an overview canvas of every screen at once; tapping one
opens it full size and fully interactive, with the tab bar and back chevrons
working like a prototype. That chrome — phone frame, status bar, tab bar, canvas,
focus mode — ships inside the E2B template rather than being written per design,
so it cannot drift. See
[`sandbox/next-js-developer`](sandbox/next-js-developer) for the shell and the
two files the agent is allowed to touch.

Sign-in is OAuth-only, so the provider owns the email address — there is no
email change or verification flow in Zivo. Signing in with GitHub on an address
that already has a Google account lands on that same account rather than a
second one: `account.accountLinking` in `src/lib/auth.ts` links them, and both
providers report whether the address is verified on their side.

Providers are opt-in per environment. `src/lib/auth-providers.ts` reads the
credential pairs that are actually set, Better Auth is configured with those,
and `/sign-in` renders one button per provider — so a deployment with only
Google keys still boots, and adding GitHub keys is the whole change.

## Model providers

Zivo builds an ordered list of every provider it has a key for, checked in this
order: Anthropic, OpenAI, OpenRouter, Groq, Cerebras, DeepSeek, Mistral, xAI,
Gemini. Adding a key to `.env` is enough — no code change.

**Failover is automatic.** If the first provider returns a rate limit, a billing
error, a bad model id, or a malformed tool call, Zivo logs the switch into the
activity feed and retries the same work on the next configured key. Only when
every key has failed does the design report an error.

The check walks the error's `cause` chain, which matters: `step.ai.infer` does
not make the request in this process — Inngest does, and returns its own wrapper
with the provider's status underneath. Reading only the top-level message sees
"error handling generator response" and misses the 429 that decides whether to
fail over.

Pin a provider or model globally with `AI_PROVIDER` and `AI_MODEL`, or per
agent role:

```bash
AI_CODE_PROVIDER=anthropic
AI_CODE_MODEL=claude-sonnet-4-5
AI_BRIEF_PROVIDER=groq
AI_TITLE_PROVIDER=groq
AI_RESPONSE_PROVIDER=groq
```

A model name only ever applies to the provider it belongs to — the pinned one, or
the first in the chain if nothing is pinned. Everything behind it falls back to
its own default, so a failover does not ask Gemini for `gpt-4.1`.

Four agents run per design: a **brief** agent turns the description into a
product, a direction, and a screen list; the **code** agent designs the screens;
a **title** agent names the result; a **response** agent writes the chat reply.
Each has its own `AI_<ROLE>_PROVIDER` / `AI_<ROLE>_MODEL` pair — `AI_BRIEF_*`
included.

**Roles are routed by job, not by order.** The code agent gets the strongest
model you have a key for, because the design is the product. The three short
agents go to the fastest one — which also keeps them off the code agent's
per-minute token budget, so a 429 there does not take down a run that had three
healthy keys sitting idle.

The brief agent exists because "Lumen" is not a design brief, and because asking
one model to design *and* to decide how it should look gets the safest possible
answer to both.

### Rate limits

A coding agent replays the system prompt, the tool definitions, and the recent
history on every iteration, so it burns tokens quickly. Free tiers with a low
tokens-per-minute cap (Groq's free tier is 8,000 TPM) hit HTTP 429 partway
through a build; the run reports the rate limit back into the chat rather than
hanging. Give the code agent a provider with more headroom and keep the cheap
one for the short agents:

```bash
AI_CODE_PROVIDER=anthropic
AI_TITLE_PROVIDER=groq
AI_RESPONSE_PROVIDER=groq
```

Pinning a provider makes it first in the chain; the remaining keys are still used
as fallbacks. `AI_MAX_HISTORY_MESSAGES` (default 10) caps how much conversation is
replayed to the agent, and `AI_MAX_ITERATIONS` (default 40) caps the tool loop —
six screens designed properly, plus the manifest and a review pass.

## Request protection

Arcjet guards the surfaces that cost money or are exposed to the open internet.
`src/lib/arcjet.ts` holds one shared client and the per-surface rules:

| Surface | Rules |
| --- | --- |
| `createProject` / `createMessage` | Shield, token bucket per user, prompt-injection detection |
| `/api/auth/[...all]` | Shield, 60 requests/min per IP, bot detection |
| `/api/imagekit/auth` | Shield, 10 requests/min per user |
| `/api/projects/[id]/download` | Shield, 20 requests/min per user |
| `/api/inngest` | none — see below |

Builds are the expensive path: each one boots an E2B sandbox and runs a paid
coding agent for several iterations. The token bucket allows a burst of 10 and
refills 5 per hour, per user.

`/api/inngest` is deliberately unguarded. Inngest calls it server-to-server, so
bot detection would classify it as an automated client and break every build.

Two rules ship in `DRY_RUN`, which logs to the Arcjet dashboard without
blocking:

- **Prompt injection** on build actions. In Zivo the prompt *is* the instruction
  to the coding agent, so the user is the principal rather than untrusted
  third-party content — a legitimate prompt like "build a page about prompt
  injection" would trip a `LIVE` rule.
- **Bot detection** on the auth route, which also serves the OAuth callbacks.
  A false positive there locks people out of the only way in, and sign-in is
  OAuth-only so there are no passwords to stuff.

Every guard fails open: if Arcjet errors or is unreachable, the request is
allowed rather than taking the product down with it.

## Environment

The required variables are `DATABASE_URL`, `BETTER_AUTH_SECRET`, `E2B_API_KEY`,
at least one model provider key, and at least one OAuth provider pair:

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`

Register the callback URL with each provider as
`{BETTER_AUTH_URL}/api/auth/callback/{provider}` — for local development that is
`http://localhost:3000/api/auth/callback/google` and
`http://localhost:3000/api/auth/callback/github`. A GitHub OAuth App takes only
one callback URL, so development and production need separate apps.

Optional:

- `ARCJET_KEY` — request protection. Without it every guard allows the request.
- `IMAGEKIT_PUBLIC_KEY` / `IMAGEKIT_PRIVATE_KEY` — profile photo uploads. Without
  them the upload button reports that uploads are not configured.
- `E2B_TEMPLATE_ID` — build sandboxes from a different template than the
  `zivo-nextjs-developer` alias, e.g. a `-dev` build.
- `E2B_SANDBOX_TIMEOUT_MS` — how long a sandbox lives. Moves the server only;
  the client still estimates expiry from `SANDBOX_TTL_MS`, so change both
  together or previews will look alive after they are gone.

### Deploying

Two variables are local-development-only and must **not** reach production:

- `INNGEST_DEV` — set to `1` locally so the SDK talks to the dev server on
  `localhost:8288`. Left set in production, every build is dispatched into
  nothing. Production instead needs `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`
  from the Inngest dashboard.
- `BETTER_AUTH_URL` — must be the deployed origin, and each OAuth app needs that
  origin's callback URL registered.

The E2B template is account-scoped, so build it once against the same
`E2B_API_KEY` production uses:

```bash
bun run sandbox:build
```

## Scripts

```bash
bun run dev        # Next.js + Inngest dev servers together
bun run dev:next   # Next.js dev server on its own
bun run inngest    # Inngest dev server on its own
bun run build      # production build
bun run lint       # eslint
bun run db:generate
bun run db:migrate
bun run db:studio
bun run sandbox:build   # build the E2B template (required once)
bun run sandbox:build:dev  # build it under a -dev alias instead
```
