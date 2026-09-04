import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Code-split entry point for `BarChart`. Dashboards render several
 * heavier, interactive widgets (charts, the QR checkout, the Excel
 * uploader) that aren't needed for first paint — loading them through
 * `next/dynamic` keeps those bundles out of the initial page chunk.
 */
export const LazyBarChart = dynamic(() => import("./bar-chart").then((m) => m.BarChart), {
  loading: () => <Skeleton className="h-full w-full rounded-lg" />,
});
