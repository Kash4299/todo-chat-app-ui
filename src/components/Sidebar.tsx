"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
    CheckSquare,
    MessageCircle,
    LogOut,
    Zap,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navItems = [
    { href: "/todos", label: "Todos", icon: CheckSquare },
    { href: "/chat", label: "Chat", icon: MessageCircle },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={`${collapsed ? "w-20" : "w-64"
                } h-screen bg-surface border-r border-border flex flex-col transition-all duration-300 ease-in-out shrink-0`}
        >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
                <div className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""}`}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    {!collapsed && (
                        <span className="text-lg font-bold text-text tracking-tight">TodoChat</span>
                    )}
                </div>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`p-1.5 rounded-lg hover:bg-bg-lighter text-text-muted hover:text-text transition-colors duration-200 cursor-pointer ${collapsed ? "hidden" : ""
                        }`}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer group ${collapsed ? "justify-center" : ""
                                } ${isActive
                                    ? "bg-primary/15 text-primary shadow-sm"
                                    : "text-text-muted hover:text-text hover:bg-bg-lighter"
                                }`}
                        >
                            <item.icon
                                className={`w-5 h-5 shrink-0 transition-colors duration-200 ${isActive ? "text-primary" : "text-text-dim group-hover:text-text"
                                    }`}
                            />
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="p-3 border-t border-border">
                {user && (
                    <div
                        className={`flex items-center gap-3 mb-3 px-3 py-2 ${collapsed ? "justify-center" : ""}`}
                    >
                        <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                            alt={user.name || "User"}
                            className="w-9 h-9 rounded-full shrink-0 ring-2 ring-border"
                        />
                        {!collapsed && (
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-text truncate">{user.name}</p>
                                <p className="text-xs text-text-dim truncate">{user.email}</p>
                            </div>
                        )}
                    </div>
                )}
                <button
                    onClick={logout}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:text-danger hover:bg-danger/10 transition-all duration-200 cursor-pointer w-full ${collapsed ? "justify-center" : ""
                        }`}
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
