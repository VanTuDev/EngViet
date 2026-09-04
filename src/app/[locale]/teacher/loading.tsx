import { Skeleton } from "@/components/ui/skeleton";

export default function TeacherLoading() {
  return (
    <div className="flex flex-col gap-gutter">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
