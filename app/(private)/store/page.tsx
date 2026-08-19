import { Suspense } from "react";
import { StoreView } from "@/components/store/store-view";

export default function StorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="size-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <StoreView />
    </Suspense>
  );
}
