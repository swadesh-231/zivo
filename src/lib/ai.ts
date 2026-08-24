import { anthropic, gemini, grok, openai } from "@inngest/agent-kit";
import type { AiAdapter } from "@inngest/ai";

export type AgentRole = "code" | "title" | "response";

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
  code: { provider: "AI_CODE_PROVIDER", model: "AI_CODE_MODEL" },
  title: { provider: "AI_TITLE_PROVIDER", model: "AI_TITLE_MODEL" },
  response: { provider: "AI_RESPONSE_PROVIDER", model: "AI_RESPONSE_MODEL" },
};

const ROLE_PREFERRED_PROVIDER: Partial<Record<AgentRole, string>> = {
  code: "openai",
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
    const preferred = ROLE_PREFERRED_PROVIDER[role];
    const match = preferred
      ? configured.find((provider) => provider.name === preferred)
      : undefined;

    if (!match) return configured;

    return [match, ...configured.filter((provider) => provider !== match)];
  }

  const pinned = findProvider(requested);

  if (!readKey(pinned.envKeys)) {
    throw new Error(
      `AI provider "${pinned.name}" is selected but none of ${pinned.envKeys.join(" / ")} is set.`,
    );
  }

  return [pinned, ...configured.filter((p) => p.name !== pinned.name)];
}

function resolveModelName(role: AgentRole, provider: ProviderDefinition) {
  const pinned =
    process.env[ROLE_ENV[role].provider] ?? process.env.AI_PROVIDER;
  const explicit = process.env[ROLE_ENV[role].model] ?? process.env.AI_MODEL;

  if (explicit && (!pinned || pinned.toLowerCase() === provider.name)) {
    return explicit;
  }

  return provider.defaultModel;
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

  return providers.map((provider) => {
    const model = resolveModelName(role, provider);
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

export function isFailoverError(error: unknown) {
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";

  return FAILOVER_PATTERN.test(message);
}
