import { anthropic, gemini, grok, openai } from "@inngest/agent-kit";
import type { AiAdapter } from "@inngest/ai";

export type AgentRole = "brief" | "code" | "title" | "response";

type ProviderKind = "openai" | "anthropic" | "gemini" | "grok";

type ProviderDefinition = {
  name: string;
  label: string;
  kind: ProviderKind;
  envKeys: readonly string[];
  defaultModel: string;
  baseUrl?: string;
};

const MAX_TOKENS = 8192;

const PROVIDERS: readonly ProviderDefinition[] = [
  {
    name: "anthropic",
    label: "Anthropic",
    kind: "anthropic",
    envKeys: ["ANTHROPIC_API_KEY"],
    defaultModel: "claude-sonnet-4-5",
  },
  {
    name: "openai",
    label: "OpenAI",
    kind: "openai",
    envKeys: ["OPENAI_API_KEY"],
    defaultModel: "gpt-4.1",
  },
  {
    name: "openrouter",
    label: "OpenRouter",
    kind: "openai",
    envKeys: ["OPENROUTER_API_KEY", "OPEN_ROUTER_API_KEY"],
    defaultModel: "anthropic/claude-sonnet-4.5",
    baseUrl: "https://openrouter.ai/api/v1",
  },
  {
    name: "groq",
    label: "Groq",
    kind: "openai",
    envKeys: ["GROQ_API_KEY"],
    defaultModel: "openai/gpt-oss-120b",
    baseUrl: "https://api.groq.com/openai/v1",
  },
  {
    name: "cerebras",
    label: "Cerebras",
    kind: "openai",
    envKeys: ["CEREBRAS_API_KEY"],
    defaultModel: "qwen-3-coder-480b",
    baseUrl: "https://api.cerebras.ai/v1",
  },
  {
    name: "deepseek",
    label: "DeepSeek",
    kind: "openai",
    envKeys: ["DEEPSEEK_API_KEY"],
    defaultModel: "deepseek-chat",
    baseUrl: "https://api.deepseek.com/v1",
  },
  {
    name: "mistral",
    label: "Mistral",
    kind: "openai",
    envKeys: ["MISTRAL_API_KEY"],
    defaultModel: "mistral-large-latest",
    baseUrl: "https://api.mistral.ai/v1",
  },
  {
    name: "grok",
    label: "xAI Grok",
    kind: "grok",
    envKeys: ["GROK_API_KEY", "XAI_API_KEY"],
    defaultModel: "grok-4",
  },
  {
    name: "gemini",
    label: "Google Gemini",
    kind: "gemini",
    envKeys: ["GEMINI_API_KEY", "GOOGLE_GENERATIVE_AI_API_KEY"],
    defaultModel: "gemini-2.5-flash",
  },
];

const ROLE_ENV: Record<AgentRole, { provider: string; model: string }> = {
  brief: { provider: "AI_BRIEF_PROVIDER", model: "AI_BRIEF_MODEL" },
  code: { provider: "AI_CODE_PROVIDER", model: "AI_CODE_MODEL" },
  title: { provider: "AI_TITLE_PROVIDER", model: "AI_TITLE_MODEL" },
  response: { provider: "AI_RESPONSE_PROVIDER", model: "AI_RESPONSE_MODEL" },
};

/**
 * Which providers each role should reach for, best first.
 *
 * Two jobs. The obvious one is quality: the design the code agent produces *is*
 * the product, so it gets the strongest reasoning model available and the cheap
 * fast ones queue up behind it as fallbacks.
 *
 * The less obvious one is isolation. A coding agent replays its system prompt,
 * its tool definitions, and the whole history on every iteration, so it eats a
 * per-minute token budget fast. Pointing the three short agents at a different
 * provider keeps them off that budget — otherwise the brief and the response
 * queue behind the same 429 that is already throttling the design, and one
 * rate-limited key takes down a run that had three healthy keys sitting idle.
 */
const ROLE_PREFERENCE: Partial<Record<AgentRole, readonly string[]>> = {
  code: ["anthropic", "openrouter", "openai", "gemini", "groq"],
  brief: ["groq", "gemini", "openrouter", "openai"],
  title: ["groq", "gemini", "openrouter", "openai"],
  response: ["groq", "gemini", "openrouter", "openai"],
};

function readKey(envKeys: readonly string[]) {
  for (const key of envKeys) {
    const value = process.env[key];
    if (value) return value;
  }

  return undefined;
}

function findProvider(name: string) {
  const provider = PROVIDERS.find(
    (entry) => entry.name === name.trim().toLowerCase(),
  );

  if (!provider) {
    throw new Error(
      `Unknown AI provider "${name}". Supported providers: ${PROVIDERS.map((entry) => entry.name).join(", ")}.`,
    );
  }

  return provider;
}

function orderedProviders(role: AgentRole) {
  const requested =
    process.env[ROLE_ENV[role].provider] ?? process.env.AI_PROVIDER;

  const configured = PROVIDERS.filter((provider) =>
    Boolean(readKey(provider.envKeys)),
  );

  if (!requested) {
    const preference = ROLE_PREFERENCE[role];

    if (!preference) return configured;

    // Stable sort: anything named in the preference list comes first in that
    // order, and providers it does not mention keep their PROVIDERS order
    // behind them rather than being dropped. Every configured key stays in the
    // chain — the list only decides who is asked first.
    const rank = (provider: ProviderDefinition) => {
      const index = preference.indexOf(provider.name);

      return index === -1 ? preference.length : index;
    };

    return [...configured].sort((a, b) => rank(a) - rank(b));
  }

  const pinned = findProvider(requested);

  if (!readKey(pinned.envKeys)) {
    throw new Error(
      `AI provider "${pinned.name}" is selected but none of ${pinned.envKeys.join(" / ")} is set.`,
    );
  }

  return [pinned, ...configured.filter((p) => p.name !== pinned.name)];
}

/**
 * A model name belongs to exactly one provider, so it can only ever apply to
 * one link in the failover chain.
 *
 * Applying it to all of them is worse than doing nothing: with AI_MODEL set and
 * no provider pinned, failing over from OpenAI asks Gemini for "gpt-4.1", which
 * 404s the way an unreachable provider does. Every fallback then "fails" in
 * turn and the build reports that no provider accepted the request, when in
 * fact none was ever asked for a model it has.
 *
 * Pinned provider: the model is that provider's, and it is always index 0.
 * No pin: the model describes whatever is tried first. Everything behind the
 * head falls back to its own default, which is the point of having one.
 */
function resolveModelName(
  role: AgentRole,
  provider: ProviderDefinition,
  index: number,
) {
  const pinned = (
    process.env[ROLE_ENV[role].provider] ?? process.env.AI_PROVIDER
  )
    ?.trim()
    .toLowerCase();
  const explicit = process.env[ROLE_ENV[role].model] ?? process.env.AI_MODEL;

  if (!explicit) return provider.defaultModel;

  if (pinned) {
    return pinned === provider.name ? explicit : provider.defaultModel;
  }

  return index === 0 ? explicit : provider.defaultModel;
}

function buildAdapter(provider: ProviderDefinition, model: string, apiKey: string) {
  switch (provider.kind) {
    case "openai":
      return openai({
        model,
        apiKey,
        ...(provider.baseUrl ? { baseUrl: provider.baseUrl } : {}),
        defaultParameters: { temperature: 0 },
      });

    case "anthropic":
      return anthropic({
        model,
        apiKey,
        defaultParameters: { max_tokens: MAX_TOKENS, temperature: 0 },
      });

    case "gemini":
      return gemini({
        model,
        apiKey,
        defaultParameters: {
          generationConfig: { temperature: 0, maxOutputTokens: MAX_TOKENS },
        },
      });

    case "grok":
      return grok({ model, apiKey, defaultParameters: { temperature: 0 } });
  }
}

export type ModelCandidate = {
  provider: string;
  label: string;
  model: string;
  create: () => AiAdapter.Any;
};

export function listModelCandidates(role: AgentRole = "code"): ModelCandidate[] {
  const providers = orderedProviders(role);

  if (providers.length === 0) {
    throw new Error(
      `No AI provider key found. Set one of: ${PROVIDERS.flatMap((p) => p.envKeys).join(", ")}.`,
    );
  }

  return providers.map((provider, index) => {
    const model = resolveModelName(role, provider, index);
    const apiKey = readKey(provider.envKeys) as string;

    return {
      provider: provider.name,
      label: provider.label,
      model,
      create: () => buildAdapter(provider, model, apiKey),
    };
  });
}

const FAILOVER_PATTERN =
  /\b(4\d\d|5\d\d)\b|rate.?limit|quota|insufficient|credit|unauthorized|invalid.?api.?key|not.?found|overloaded|unavailable|timeout|ECONNRESET|ETIMEDOUT|MALFORMED_FUNCTION_CALL/i;

/**
 * Flatten an error into everything worth matching against, following `cause`.
 *
 * `step.ai.infer` does not make the request in this process — Inngest does, and
 * hands back its own error with the provider's message underneath. Reading only
 * `error.message` sees the wrapper ("error handling generator response") and
 * misses the "unsuccessful status code: 429" that decides whether this is worth
 * failing over. That failure mode is silent and expensive: the run gives up on
 * a rate limit with three healthy keys still untried.
 */
function errorText(error: unknown, depth = 0): string {
  if (error == null || depth > 4) return "";
  if (typeof error === "string") return error;
  if (typeof error === "number") return String(error);

  if (error instanceof Error) {
    return `${error.name} ${error.message} ${errorText(error.cause, depth + 1)}`;
  }

  if (typeof error === "object") {
    const record = error as Record<string, unknown>;

    return [
      record.message,
      record.error,
      record.name,
      record.code,
      record.status,
      record.statusCode,
      errorText(record.cause, depth + 1),
    ]
      .map((value) =>
        typeof value === "string" || typeof value === "number"
          ? String(value)
          : "",
      )
      .join(" ");
  }

  return "";
}

export function isFailoverError(error: unknown) {
  return FAILOVER_PATTERN.test(errorText(error));
}
