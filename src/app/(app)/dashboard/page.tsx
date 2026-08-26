import type { Metadata } from "next";

import { PromptComposer } from "@/components/dashboard/prompt-composer";
import { ProjectList } from "@/components/dashboard/project-list";
import { GridBackdrop } from "@/components/marketing/grid-backdrop";
import { requireUser } from "@/features/auth/session";
import { PROMPT_PARAM, readPrompt } from "@/prompt/handoff";

export const metadata: Metadata = {
  title: "Projects",
  description: "Your Zivo projects and previews.",
};

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [user, params] = await Promise.all([requireUser(), searchParams]);
  const initialPrompt = readPrompt(params[PROMPT_PARAM]);

  return (
    <div className="relative flex-1">
      <GridBackdrop />

      {/* Tight on purpose: this is a workspace someone returns to, so the first
          row of their projects has to be reachable without scrolling. */}
      <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-16 sm:pt-14">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-medium tracking-tight text-balance sm:text-3xl">
            What are we building, {firstName(user.name)}?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Describe a screen or a whole app. The agents scaffold it, run it,
            and hand back the source.
          </p>

          <div className="mt-6">
            <PromptComposer initialPrompt={initialPrompt} />
          </div>
        </div>

        <div className="mt-12 sm:mt-14">
          <ProjectList />
        </div>
      </div>
    </div>
  );
}
