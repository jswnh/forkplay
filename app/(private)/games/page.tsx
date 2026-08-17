import { SiteContent } from "@/components/layout/sidebar/site-content";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <SiteContent
      breadcrumbs={[
        {
          label: "Dashboard",
          href: "/dashboard",
        },
        {
          label: "Games",
          href: "/games",
        },
      ]}
      showThemeToggle={false}
      actions={
        <>
          <Button size={"sm"}>Add New</Button>
        </>
      }
    ></SiteContent>
  );
}
