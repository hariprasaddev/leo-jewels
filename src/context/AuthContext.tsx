import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Customer } from "@/types";
import { authService, type AuthSession } from "@/services/authService";
import { isApiConfigured } from "@/services/apiClient";

interface AuthContextValue {
  user: Customer | null;
  isLoading: boolean;
  isDemo: boolean;
  login: (identifier: string, password: string, remember?: boolean) => Promise<void>;
  register: (input: {
    fullName: string;
    email: string;
    mobile: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<Customer, "fullName" | "mobile">>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSession(authService.restore());
    setIsLoading(false);
  }, []);

  const login = useCallback(async (identifier: string, password: string, remember = true) => {
    const next = await authService.login(identifier, password, remember);
    setSession(next);
  }, []);

  const register = useCallback(
    async (input: { fullName: string; email: string; mobile: string; password: string }) => {
      const next = await authService.register(input);
      setSession(next);
    },
    []
  );

  const logout = useCallback(() => {
    authService.logout();
    setSession(null);
  }, []);

  const updateProfile = useCallback(
    (updates: Partial<Pick<Customer, "fullName" | "mobile">>) => {
      const user = authService.updateProfile(updates);
      setSession((current) => (current ? { ...current, user } : current));
    },
    []
  );

  const changePassword = useCallback(
    (currentPassword: string, newPassword: string) =>
      authService.changePassword(currentPassword, newPassword),
    []
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isLoading,
      isDemo: !isApiConfigured(),
      login,
      register,
      logout,
      updateProfile,
      changePassword,
    }),
    [session, isLoading, login, register, logout, updateProfile, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
