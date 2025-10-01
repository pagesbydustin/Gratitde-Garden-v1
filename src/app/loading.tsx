import { Skeleton } from "@/components/ui/skeleton";
import { GratitudeIcon } from "@/components/icons";

export default function Loading() {
  return (
    <div className="flex justify-center min-h-screen">
      <main className="w-full max-w-2xl px-4 py-8 md:py-12 space-y-12">
        <header className="text-center space-y-2">
            <GratitudeIcon className="mx-auto h-12 w-12 text-muted animate-pulse" />
            <Skeleton className="h-10 w-3/4 mx-auto" />
            <Skeleton className="h-5 w-1/2 mx-auto" />
        </header>

        <div className="space-y-6 animate-pulse">
            <Skeleton className="h-6 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-32 w-full" />
            <div className="flex justify-end gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
        </div>

        <section className="space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </section>
      </main>
    </div>
  );
}
