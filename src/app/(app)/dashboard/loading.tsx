import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-16 pb-20">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="mt-4 h-32 w-full rounded-2xl" />
      </div>

      <div className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-56 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
