import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-16 sm:pt-14">
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="mt-3 h-4 w-88" />
        <Skeleton className="mt-6 h-28 w-full rounded-2xl" />

        <div className="mt-3 grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="mt-12 sm:mt-14">
        <Skeleton className="h-5 w-28" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-52 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
