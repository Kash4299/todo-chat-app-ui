import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/context/AuthContext";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth0.getSession();

    if (!session) {
        redirect("/auth/login");
    }

    return (
        <AuthProvider>
            <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </AuthProvider>
    );
}
