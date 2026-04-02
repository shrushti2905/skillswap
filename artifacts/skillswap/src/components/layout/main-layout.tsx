import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Navbar } from "./navbar";
import { Loader2 } from "lucide-react";

const USER_ONLY_PATHS = ["/discover", "/profile", "/requests", "/notifications"];

interface MainLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export function MainLayout({ children, requireAuth = true, requireAdmin = false }: MainLayoutProps) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !user) {
      setLocation("/");
      return;
    }

    if (requireAdmin && user?.role !== "admin") {
      setLocation("/discover");
      return;
    }

    // Admins must not access regular user pages
    if (user?.role === "admin" && USER_ONLY_PATHS.some((p) => location === p)) {
      setLocation("/admin");
    }
  }, [user, isLoading, requireAuth, requireAdmin, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requireAuth && !user) return null;
  if (requireAdmin && user?.role !== "admin") return null;

  // Block admin from rendering user-only pages
  if (user?.role === "admin" && USER_ONLY_PATHS.some((p) => location === p)) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
