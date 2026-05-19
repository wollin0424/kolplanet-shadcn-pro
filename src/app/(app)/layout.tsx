import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />

        <main className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
