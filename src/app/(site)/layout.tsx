import { MaintenanceState } from "@/components/layout/MaintenanceState";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { isMaintenanceMode } from "@/lib/maintenance";

export const dynamic = "force-dynamic";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const maintenance = isMaintenanceMode();

  if (maintenance) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-[#faf9f7]">
        <main className="flex flex-1 items-center">
          <MaintenanceState />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
