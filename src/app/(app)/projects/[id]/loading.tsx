import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectLoading() {
  return (
    <div className="grid h-[calc(100svh-3.5rem)] grid-cols-1 lg:grid-cols-[minmax(0,34%)_minmax(0,1fr)]">
      <div className="flex flex-col gap-4 border-r border-border/60 p-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-14 w-3/5 self-end rounded-2xl" />
        <Skeleton className="h-24 w-4/5 rounded-2xl" />
        <Skeleton className="mt-auto h-20 w-full rounded-xl" />
      </div>
      <div className="hidden p-4 lg:block">
        <Skeleton className="size-full rounded-xl" />
      </div>
    </div>
  );
}
