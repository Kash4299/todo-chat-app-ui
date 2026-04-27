import AccountLinkDialog from "@/components/AccountLinkDialog";
import CommandPalette from "@/components/CommandPalette";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/context/AuthContext";
import { WorkspaceProvider } from "@/context/WorkspaceContext";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <div className="flex h-screen overflow-hidden bg-bg">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
        <CommandPalette />
        <AccountLinkDialog />
      </WorkspaceProvider>
    </AuthProvider>
  );
}
