"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    avatar: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => { success: boolean; error?: string };
    signup: (name: string, email: string, password: string) => { success: boolean; error?: string };
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function generateAvatar(name: string): string {
    const colors = ["0D9488", "F97316", "8B5CF6", "EC4899", "3B82F6", "22C55E"];
    const color = colors[name.length % colors.length];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&bold=true&size=128`;
}

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("todochat_current_user");
            if (stored) {
                setUser(JSON.parse(stored));
            }
        } catch {
            // ignore parse errors
        }
        setLoading(false);
    }, []);

    const getUsers = useCallback((): User[] => {
        try {
            const stored = localStorage.getItem("todochat_users");
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }, []);

    const saveUsers = useCallback((users: User[]) => {
        localStorage.setItem("todochat_users", JSON.stringify(users));
    }, []);

    const signup = useCallback(
        (name: string, email: string, password: string) => {
            const users = getUsers();
            if (users.find((u) => u.email === email)) {
                return { success: false, error: "An account with this email already exists" };
            }

            const newUser: User = {
                id: generateId(),
                name,
                email,
                password,
                avatar: generateAvatar(name),
            };

            saveUsers([...users, newUser]);
            return { success: true };
        },
        [getUsers, saveUsers]
    );

    const login = useCallback(
        (email: string, password: string) => {
            const users = getUsers();
            const found = users.find((u) => u.email === email && u.password === password);

            if (!found) {
                return { success: false, error: "Invalid email or password" };
            }

            setUser(found);
            localStorage.setItem("todochat_current_user", JSON.stringify(found));
            return { success: true };
        },
        [getUsers]
    );

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem("todochat_current_user");
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
