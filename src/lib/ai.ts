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

export function listConfiguredProviders() {
  return PROVIDERS.filter((provider) => Boolean(readKey(provider.envKeys))).map(
    (provider) => ({ name: provider.name, label: provider.label }),
  );
}

function resolveProvider(role: AgentRole) {
  const requested =
    process.env[ROLE_ENV[role].provider] ?? process.env.AI_PROVIDER;

  if (requested) {
    const provider = findProvider(requested);
    const apiKey = readKey(provider.envKeys);

    if (!apiKey) {
      throw new Error(
        `AI provider "${provider.name}" is selected but none of ${provider.envKeys.join(" / ")} is set.`,
      );
    }

    return { provider, apiKey };
  }

  for (const provider of PROVIDERS) {
    const apiKey = readKey(provider.envKeys);
    if (apiKey) return { provider, apiKey };
  }

  throw new Error(
    `No AI provider key found. Set one of: ${PROVIDERS.flatMap((provider) => provider.envKeys).join(", ")}.`,
  );
}

function resolveModelName(role: AgentRole, provider: ProviderDefinition) {
  return (
    process.env[ROLE_ENV[role].model] ??
    process.env.AI_MODEL ??
    provider.defaultModel
  );
}

export function describeModel(role: AgentRole = "code") {
  const { provider } = resolveProvider(role);

  return {
    provider: provider.name,
    label: provider.label,
    model: resolveModelName(role, provider),
  };
}

export function resolveModel(role: AgentRole = "code"): AiAdapter.Any {
  const { provider, apiKey } = resolveProvider(role);
  const model = resolveModelName(role, provider);

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
