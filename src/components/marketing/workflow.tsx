const STEPS = [
  {
    title: "Describe it",
    body: "A name is enough. A line about what it does is better. A line about how it should feel — dark and calm, dense and precise, editorial — is best, and is taken as an instruction rather than a hint.",
  },
  {
    title: "A direction is chosen",
    body: "An agent decides what the product actually is, then commits to one of eight design directions and a single accent hue. That decision fixes the type, the radius, the density, and the signature move before a screen exists.",
  },
  {
    title: "Then built in it",
    body: "Six screens, each against a real phone frame, all holding the same direction. Open the preview, tap any screen to walk through it, and download the source.",
  },
];

export function Workflow() {
  return (
    <section
      id="workflow"
      className="mx-auto w-full max-w-5xl scroll-mt-20 border-t border-border/60 px-5 py-20"
    >
      <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
        A description, then a design
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
