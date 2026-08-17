import { SiteHeader } from "@/components/layout/sidebar/site-header";

export default function Page() {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-2"></div>
      </div>
    </>
  );
}
