import { Boxes, FileCode2, MessagesSquare, Terminal } from "lucide-react";

const ITEMS = [
  {
    icon: Terminal,
    title: "A real machine, not a snippet",
    body: "Every build gets its own micro-VM. The agents run bun install, write files, and boot next dev. If the preview renders, the code actually runs.",
  },
  {
    icon: FileCode2,
    title: "The source ships with the preview",
    body: "Browse every file the agents touched next to the running app. Nothing is hidden behind a black box you cannot inspect.",
  },
  {
    icon: MessagesSquare,
    title: "Iterate in conversation",
    body: "Follow-up messages patch the same project. The agents get the full history and the files they already wrote, so changes stay surgical.",
  },
  {
    icon: Boxes,
    title: "Whichever model you trust",
    body: "Anthropic, OpenAI, Gemini, Groq, DeepSeek, Mistral, OpenRouter, Cerebras, xAI. Add a key to the environment and Zivo routes to it.",
  },
];

export function Capabilities() {
  return (
    <section
      id="capabilities"
      className="mx-auto w-full max-w-5xl scroll-mt-20 border-t border-border/60 px-5 py-20"
    >
      <div className="max-w-xl">
        <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
          Built for the part after the first prompt
        </h2>
        <p className="text-balance-pretty mt-3 text-muted-foreground">
          Generating a screen is easy. Keeping it running, editable, and honest
          about what it produced is the hard part.
        </p>
      </div>

      <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border/70 bg-border/70 sm:grid-cols-2">
        {ITEMS.map((item) => (
          <div key={item.title} className="bg-background p-6">
            <item.icon className="size-4 text-muted-foreground" />
            <h3 className="mt-4 text-sm font-medium">{item.title}</h3>
            <p className="text-balance-pretty mt-2 text-sm leading-relaxed text-muted-foreground">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
