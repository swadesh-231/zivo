import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectView } from "@/components/projects/project-view";
import { getProject } from "@/features/projects/actions";
import { formatProjectName } from "@/lib/format";

const loadProject = cache(async (id: string) => getProject(id));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await loadProject(id);

  return {
    title: result.ok ? formatProjectName(result.data.name) : "Project",
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await loadProject(id);

  if (!result.ok) {
    notFound();
  }

  return <ProjectView projectId={id} projectName={result.data.name} />;
}
