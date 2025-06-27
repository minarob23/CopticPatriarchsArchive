import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "../lib/queryClient";
import { useState, useEffect } from "react";

export function useAuth() {
  const [demoUser, setDemoUser] = useState(null);

  // Check for demo authentication and watch for changes
  useEffect(() => {
    const checkDemoAuth = () => {
      const demoAuth = localStorage.getItem('demo-auth');
      if (demoAuth) {
        try {
          setDemoUser(JSON.parse(demoAuth));
        } catch (e) {
          localStorage.removeItem('demo-auth');
          setDemoUser(null);
        }
      } else {
        setDemoUser(null);
      }
    };

    // Initial check
    checkDemoAuth();

    // Listen for storage changes (when localStorage is updated in another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'demo-auth') {
        checkDemoAuth();
      }
    };

    // Listen for custom events (when localStorage is updated in the same tab)
    const handleCustomAuth = () => {
      checkDemoAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('demo-auth-changed', handleCustomAuth);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('demo-auth-changed', handleCustomAuth);
    };
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Return demo user if available, otherwise return API user
  const finalUser = demoUser || user;

  return {
    user: finalUser,
    isLoading: !demoUser && isLoading,
    isAuthenticated: !!finalUser,
  };
}
