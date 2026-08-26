import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { MobileNavProvider } from "@/components/layout/MobileNavContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileNavProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        
        <div className="flex flex-col flex-1 overflow-hidden w-full">
          <Topbar />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
            <div className="mx-auto max-w-7xl pb-20 md:pb-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </MobileNavProvider>
  );
}
