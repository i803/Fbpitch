// components/auth-guard.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  // If you want to allow a "soft" redirect (e.g. don't redirect, just hide)
  // you could add options here later.
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Always run on client
    if (typeof window === "undefined") return;

    const checkAuth = async () => {
      try {
        // Accept either token from localStorage (client-side) or admin_token cookie fallback.
        const token =
          localStorage.getItem("token") || localStorage.getItem("admin_token");

        if (!token) {
          // Not authenticated at all
          router.replace("/login");
          return;
        }

        // If page requires admin, verify with server endpoint that checks JWT and admin role.
        if (requireAdmin) {
          const res = await fetch("/api/verify-admin", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!res.ok) {
            // token invalid or not admin
            localStorage.removeItem("token");
            localStorage.removeItem("admin_token");
            router.replace("/login");
            return;
          }

          // In case verify-admin returns user info, you can optionally read it:
          // const data = await res.json();
          setIsAuthorized(true);
        } else {
          // Non-admin route: we simply trust presence of a token stored client-side
          // because you don't have a generic verify-user endpoint. If you add one,
          // call it here instead to validate token server-side.
          setIsAuthorized(true);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        // Be conservative: clear token and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("admin_token");
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requireAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return <>{children}</>;
}
