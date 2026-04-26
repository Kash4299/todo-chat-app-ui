import AccountLinkDialog from "@/components/AccountLinkDialog";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/context/AuthContext";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
            <AccountLinkDialog />
        </AuthProvider>
    );
}
