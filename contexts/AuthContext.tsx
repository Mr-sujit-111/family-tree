"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  family: { id: string; family_name: string; created_at: string } | null;
  login: (
    family_name: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    family_name: string;
    password: string;
    root_member_name: string;
    root_member_gender: "male" | "female";
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshFamily: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [family, setFamily] = useState<{
    id: string;
    family_name: string;
    created_at: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = apiClient.getToken();
      if (token) {
        // Validate token by checking if it's still valid
        await refreshFamily();
      } else {
        // Clear any stale auth state
        setIsAuthenticated(false);
        setFamily(null);
        setIsLoading(false);
      }
    } catch (error) {
      // On error, clear auth state but don't block rendering
      setIsAuthenticated(false);
      setFamily(null);
      setIsLoading(false);
    }
  };

  const refreshFamily = async () => {
    try {
      const response = await apiClient.getMe();
      if (response.data) {
        setFamily(response.data);
        setIsAuthenticated(true);
        // Ensure token is persisted
        const token = apiClient.getToken();
        if (token) {
          localStorage.setItem('auth_token', token);
        }
      } else {
        setIsAuthenticated(false);
        setFamily(null);
        apiClient.setToken(null);
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      setIsAuthenticated(false);
      setFamily(null);
      apiClient.setToken(null);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (family_name: string, password: string) => {
    try {
      const response = await apiClient.login(family_name, password);
      if (response.data) {
        apiClient.setToken(response.data.access_token);
        setIsAuthenticated(true);
        await refreshFamily();
        return { success: true };
      } else {
        return { success: false, error: response.error || "Login failed" };
      }
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  };

  const register = async (data: {
    family_name: string;
    password: string;
    root_member_name: string;
    root_member_gender: "male" | "female";
  }) => {
    try {
      const response = await apiClient.register(data);
      if (response.data) {
        apiClient.setToken(response.data.access_token);
        setIsAuthenticated(true);
        await refreshFamily();
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || "Registration failed",
        };
      }
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  };

  const logout = () => {
    apiClient.setToken(null);
    setIsAuthenticated(false);
    setFamily(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        family,
        login,
        register,
        logout,
        refreshFamily,
      }}
    >
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
