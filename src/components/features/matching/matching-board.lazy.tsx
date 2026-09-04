import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const LazyMatchingBoard = dynamic(() => import("./matching-board").then((m) => m.MatchingBoard), {
  loading: () => <Skeleton className="mx-auto h-[28rem] w-full max-w-3xl rounded-xl" />,
});
