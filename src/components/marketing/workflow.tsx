const STEPS = [
  {
    title: "Describe it",
    body: "One paragraph is enough. Mention the screens, the data, and how it should feel. Vague prompts get sensible defaults instead of questions.",
  },
  {
    title: "Agents build it",
    body: "A coding agent plans the files, installs what it needs, and writes the app. A second pass names the result and summarises what changed.",
  },
  {
    title: "Keep going",
    body: "Open the preview, read the code, then ask for the next change. Every turn lands in the same project with the same file tree.",
  },
];

export function Workflow() {
  return (
    <section
      id="workflow"
      className="mx-auto w-full max-w-5xl scroll-mt-20 border-t border-border/60 px-5 py-20"
    >
      <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
        Three steps, then a URL
      </h2>

      <ol className="mt-10 grid gap-8 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.title} className="relative">
            <div className="flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-full border border-border/70 font-mono text-xs text-muted-foreground">
                {index + 1}
              </span>
              <span className="h-px flex-1 bg-border/70" />
            </div>
            <h3 className="mt-4 text-sm font-medium">{step.title}</h3>
            <p className="text-balance-pretty mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
