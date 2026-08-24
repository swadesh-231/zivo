const PROVIDERS = [
  "Anthropic",
  "OpenAI",
  "Google Gemini",
  "Groq",
  "DeepSeek",
  "Mistral",
  "OpenRouter",
  "Cerebras",
  "xAI",
];

export function Models() {
  return (
    <section
      id="models"
      className="mx-auto w-full max-w-5xl scroll-mt-20 border-t border-border/60 px-5 py-20"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
        <div>
          <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
            One key away from a different model
          </h2>
          <p className="text-balance-pretty mt-3 text-sm leading-relaxed text-muted-foreground">
            Zivo picks the first provider it finds a key for, and you can pin a
            specific one per agent. Use a fast model to name fragments and a
            strong one to write the code.
          </p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/50 p-5 font-mono text-xs">
          <p className="text-muted-foreground"># .env</p>
          <p className="mt-2">
            <span className="text-muted-foreground">ANTHROPIC_API_KEY</span>
            =sk-ant-…
          </p>
          <p>
            <span className="text-muted-foreground">GROQ_API_KEY</span>=gsk_…
          </p>
          <p className="mt-2 text-muted-foreground"># optional per-agent pins</p>
          <p>
            <span className="text-muted-foreground">AI_CODE_PROVIDER</span>
            =anthropic
          </p>
          <p>
            <span className="text-muted-foreground">AI_TITLE_PROVIDER</span>
            =groq
          </p>
        </div>
      </div>

      <ul className="mt-10 flex flex-wrap gap-2">
        {PROVIDERS.map((provider) => (
          <li
            key={provider}
            className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground"
          >
            {provider}
          </li>
        ))}
      </ul>
    </section>
  );
}
