import { Boxes, FileCode2, MessagesSquare, Palette } from "lucide-react";

const ITEMS = [
  {
    icon: Palette,
    title: "It commits to a direction",
    body: "Editorial, precision, utility, nocturne — eight design languages with real parameters: type family, radius, density, and the one signature move. The brief picks one and every screen holds it. That commitment is the difference between a design and a template.",
  },
  {
    icon: Boxes,
    title: "One hue, one coherent palette",
    body: "Every surface, border, and state derives from a single hue chosen for the product. An incoherent palette is not something the design can express — it is ruled out by the token system, not by asking nicely.",
  },
  {
    icon: FileCode2,
    title: "Real screens, real code",
    body: "The design runs in a micro-VM as an actual Next.js app. Tap through it, then read or download every file behind it. Nothing is a flat image and nothing is hidden.",
  },
  {
    icon: MessagesSquare,
    title: "Refine in conversation",
    body: "Ask for a warmer palette, a denser list, a different home screen. Follow-ups patch the same design with the full history and the files already written, so changes stay surgical.",
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
          Why it does not look generated
        </h2>
        <p className="text-balance-pretty mt-3 text-muted-foreground">
          Anything can produce six rounded cards on a grey page. Producing six
          screens that look like one designer made them, on purpose, is the
          hard part — so most of Zivo is structure that makes the generic
          answer impossible to reach for.
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
