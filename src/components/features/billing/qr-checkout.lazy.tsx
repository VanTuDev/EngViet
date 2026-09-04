import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const LazyQrCheckout = dynamic(() => import("./qr-checkout").then((m) => m.QrCheckout), {
  loading: () => <Skeleton className="h-96 w-full rounded-xl" />,
});
