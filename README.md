# Zivo

Zivo turns a prompt into a running Next.js app. A coding agent plans the files,
installs packages, and boots a dev server inside an isolated E2B sandbox. You
get a live preview URL, every file the agent wrote, and a chat thread to keep
iterating.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | Tailwind CSS v4, shadcn on Base UI |
| Data | Neon Postgres via Drizzle ORM |
| Auth | Better Auth with Google OAuth |
| Agents | Inngest + `@inngest/agent-kit` |
| Sandboxes | E2B |
| Uploads | ImageKit |
| Email | Resend (optional) |

## Getting started

```bash
bun install
cp .env.example .env
bun run db:migrate
```

Run the app and the Inngest dev server side by side:

```bash
bun run dev
bun run inngest
```

The agents run inside an E2B template that has to be built once before the
first project. Without it every build fails with `template 'c0-build' not
found`:

```bash
bun run sandbox:build
```

## Routes

| Path | Access | Purpose |
| --- | --- | --- |
| `/` | Signed out only | Landing page |
| `/sign-in` | Signed out only | Google sign-in |
| `/dashboard` | Signed in | Prompt composer and project grid |
| `/projects/[id]` | Signed in | Chat, live preview, generated source |
| `/settings` | Signed in | Profile, email, appearance |

`src/proxy.ts` sends signed-out visitors to `/sign-in` and signed-in visitors
away from the landing page, so the marketing site disappears once you have an
account.

## Model providers

Zivo uses whichever provider it finds a key for, checked in this order:
Anthropic, OpenAI, Gemini, Groq, DeepSeek, Mistral, OpenRouter, Cerebras, xAI.
Adding a key to `.env` is enough — no code change.

Pin a provider or model globally with `AI_PROVIDER` and `AI_MODEL`, or per
agent role:

```bash
AI_CODE_PROVIDER=anthropic
AI_CODE_MODEL=claude-sonnet-4-5
AI_TITLE_PROVIDER=groq
AI_RESPONSE_PROVIDER=groq
```

Three agents run per build: the code agent writes the app, a title agent names
the resulting fragment, and a response agent writes the chat reply.

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

`AI_MAX_HISTORY_MESSAGES` (default 10) caps how much conversation is replayed to
the agent, and `AI_MAX_ITERATIONS` (default 15) caps the tool loop.

## Environment

Every variable lives in `.env.example`. The required ones are `DATABASE_URL`,
`BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `E2B_API_KEY`,
and at least one model provider key.

Optional:

- `IMAGEKIT_PUBLIC_KEY` / `IMAGEKIT_PRIVATE_KEY` — profile photo uploads. Without
  them the upload button reports that uploads are not configured.
- `RESEND_API_KEY` / `EMAIL_FROM` — email-change confirmations. Without them the
  confirmation link is logged to the server console instead of sent.

## Scripts

```bash
bun run dev        # Next.js dev server
bun run inngest    # Inngest dev server
bun run build      # production build
bun run lint       # eslint
bun run db:generate
bun run db:migrate
bun run db:studio
bun run sandbox:build   # build the E2B template (required once)
```
