import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "../lib/queryClient";
import { useState, useEffect } from "react";

export function useAuth() {
  const [demoUser, setDemoUser] = useState(null);

  // Check for demo authentication
  useEffect(() => {
    const demoAuth = localStorage.getItem('demo-auth');
    if (demoAuth) {
      try {
        setDemoUser(JSON.parse(demoAuth));
      } catch (e) {
        localStorage.removeItem('demo-auth');
      }
    }
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
