import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const LazyAssignmentBuilderForm = dynamic(() => import("./assignment-builder-form").then((m) => m.AssignmentBuilderForm), {
  loading: () => (
    <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
      <Skeleton className="h-96 lg:col-span-7" />
      <Skeleton className="h-96 lg:col-span-5" />
    </div>
  ),
});
