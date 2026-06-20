import CommandPalette from "@/components/CommandPalette";
import Sidebar from "@/components/Sidebar";

// AuthProvider/WorkspaceProvider are mounted in the root layout so every route
// (including /invite and /workspace/accept-invitation) has the context.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex h-screen overflow-hidden bg-bg">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <CommandPalette />
    </>
  );
}
