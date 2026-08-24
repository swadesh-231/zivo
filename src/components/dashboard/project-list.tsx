"use client";

import { useMemo, useState } from "react";
import { FolderOpen, Search, TriangleAlert } from "lucide-react";

import { ProjectCard } from "@/components/dashboard/project-card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/features/projects/hooks/projects";

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70">
      <Skeleton className="aspect-16/10 w-full rounded-none" />
      <div className="space-y-2 p-3.5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function ProjectList() {
  const { data: projects, isPending, isError, error } = useProjects();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!projects) return [];

    const needle = query.trim().toLowerCase();

    if (!needle) return projects;

    return projects.filter((project) =>
      project.name.toLowerCase().includes(needle),
    );
  }, [projects, query]);

  if (isError) {
    return (
      <Empty className="rounded-xl border border-border/70">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert />
          </EmptyMedia>
          <EmptyTitle>Could not load your projects</EmptyTitle>
          <EmptyDescription>{error.message}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium">
          Projects
          {projects?.length ? (
            <span className="ml-2 text-muted-foreground">
              {projects.length}
            </span>
          ) : null}
        </h2>

        {projects && projects.length > 4 ? (
          <div className="relative w-full max-w-56">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects"
              aria-label="Search projects"
              className="h-8 pl-8 text-sm"
            />
          </div>
        ) : null}
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Empty className="rounded-xl border border-dashed border-border/70">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderOpen />
            </EmptyMedia>
            <EmptyTitle>
              {query ? "No projects match that search" : "No projects yet"}
            </EmptyTitle>
            <EmptyDescription>
              {query
                ? "Try a different name."
                : "Describe an app above and the agents will build the first version."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}
