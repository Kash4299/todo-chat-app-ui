"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/auth/profile")
      .then(res => {
         if(res.ok) return res.json();
         throw new Error("unauthorized");
      })
      .then(data => {
         setUser({
            id: data.sub,
            name: data.name,
            email: data.email,
            avatar: data.picture
         });
         setLoading(false);
      })
      .catch(() => {
         setUser(null);
         setLoading(false);
      });
  }, []);

  const logout = () => {
     window.location.href = "/auth/logout";
  }

  return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
      throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
