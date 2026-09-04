import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const LazyQuizRunner = dynamic(() => import("./quiz-runner").then((m) => m.QuizRunner), {
  loading: () => <Skeleton className="h-[32rem] w-full rounded-xl" />,
});
