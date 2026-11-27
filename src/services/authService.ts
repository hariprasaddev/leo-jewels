import type { Customer } from "@/types";
import { apiRequest, ApiError, isApiConfigured, setAuthToken } from "./apiClient";
import { generateId, sleep } from "@/lib/utils";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";

export interface AuthSession {
  user: Customer;
  token: string | null;
  mode: "api" | "demo";
}

interface DemoAccount extends Customer {
  passwordHash: string;
}

/**
 * Demo authentication. This exists so the UI can be explored without a backend.
 * It is NOT secure, NOT server-validated, and stores a reversible demo credential
 * in localStorage. Every screen that uses it displays a "demo mode" notice.
 */

function weakHash(value: string): string {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

function demoAccounts(): DemoAccount[] {
  return readStorage<DemoAccount[]>("leojewels.demoAccounts.v1", []);
}

function saveDemoAccounts(accounts: DemoAccount[]) {
  writeStorage("leojewels.demoAccounts.v1", accounts);
}

/**
 * Persist the session. "Remember me" writes to localStorage (survives reloads);
 * otherwise sessionStorage is used so the session ends with the browser tab.
 */
function persistSession(session: AuthSession, remember = true): AuthSession {
  try {
    if (remember) {
      writeStorage(STORAGE_KEYS.session, session);
      window.sessionStorage.removeItem(STORAGE_KEYS.session);
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.session);
      window.sessionStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
    }
  } catch {
    /* no-op */
  }
  return session;
}

function readSession(): AuthSession | null {
  const stored = readStorage<AuthSession | null>(STORAGE_KEYS.session, null);
  if (stored) return stored;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEYS.session);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export const authService = {
  mode: isApiConfigured() ? ("api" as const) : ("demo" as const),

  async register(input: {
    fullName: string;
    email: string;
    mobile: string;
    password: string;
  }): Promise<AuthSession> {
    if (isApiConfigured()) {
      const res = await apiRequest<{ user: Customer; token: string }>("/auth/register", {
        method: "POST",
        body: input,
      });
      setAuthToken(res.token);
      return persistSession({ user: res.user, token: res.token, mode: "api" });
    }

    await sleep(600);
    const accounts = demoAccounts();
    const email = input.email.trim().toLowerCase();
    if (accounts.some((a) => a.email.toLowerCase() === email)) {
      throw new ApiError("An account with this email already exists in this browser.", 409);
    }
    if (accounts.some((a) => a.mobile === input.mobile)) {
      throw new ApiError("An account with this mobile number already exists in this browser.", 409);
    }

    const account: DemoAccount = {
      id: generateId("cust"),
      fullName: input.fullName.trim(),
      email,
      mobile: input.mobile.trim(),
      createdAt: new Date().toISOString(),
      passwordHash: weakHash(input.password),
    };
    saveDemoAccounts([...accounts, account]);

    const { passwordHash: _ph, ...user } = account;
    void _ph;
    return persistSession({ user, token: null, mode: "demo" });
  },

  async login(identifier: string, password: string, remember = true): Promise<AuthSession> {
    if (isApiConfigured()) {
      const res = await apiRequest<{ user: Customer; token: string }>("/auth/login", {
        method: "POST",
        body: { identifier, password },
      });
      setAuthToken(res.token);
      return persistSession({ user: res.user, token: res.token, mode: "api" }, remember);
    }

    await sleep(650);
    const key = identifier.trim().toLowerCase();
    const account = demoAccounts().find(
      (a) => a.email.toLowerCase() === key || a.mobile === key
    );
    if (!account || account.passwordHash !== weakHash(password)) {
      throw new ApiError("The email/mobile or password does not match our records.", 401);
    }
    const { passwordHash: _ph, ...user } = account;
    void _ph;
    return persistSession({ user, token: null, mode: "demo" }, remember);
  },

  async requestPasswordReset(identifier: string): Promise<{ message: string }> {
    if (isApiConfigured()) {
      return apiRequest<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: { identifier },
      });
    }
    await sleep(800);
    return {
      message: isApiConfigured()
        ? "If an account exists, a reset link has been sent."
        : "Demo mode: a real reset email cannot be sent. Configure the backend API to enable password resets.",
    };
  },

  restore(): AuthSession | null {
    const session = readSession();
    if (!session) return null;
    if (session.mode === "api" && isApiConfigured()) setAuthToken(session.token);
    return session;
  },

  logout(): void {
    setAuthToken(null);
    writeStorage(STORAGE_KEYS.session, null);
    try {
      window.sessionStorage.removeItem(STORAGE_KEYS.session);
    } catch {
      /* no-op */
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (isApiConfigured()) {
      await apiRequest("/auth/change-password", {
        method: "POST",
        body: { currentPassword, newPassword },
      });
      return;
    }

    const session = this.restore();
    if (!session) throw new ApiError("You are not signed in.", 401);
    const accounts = demoAccounts();
    const account = accounts.find((entry) => entry.id === session.user.id);
    if (!account || account.passwordHash !== weakHash(currentPassword)) {
      throw new ApiError("Your current password is incorrect.", 401);
    }
    if (newPassword.length < 8) {
      throw new ApiError("Use at least 8 characters for the new password.", 400);
    }
    saveDemoAccounts(
      accounts.map((entry) =>
        entry.id === account.id
          ? { ...entry, passwordHash: weakHash(newPassword) }
          : entry
      )
    );
  },

  updateProfile(updates: Partial<Pick<Customer, "fullName" | "mobile">>): Customer {
    const session = this.restore();
    if (!session) throw new ApiError("You are not signed in.", 401);
    const user = { ...session.user, ...updates };
    writeStorage(STORAGE_KEYS.session, { ...session, user });
    if (session.mode === "demo") {
      const accounts = demoAccounts().map((a) =>
        a.id === user.id ? { ...a, ...updates } : a
      );
      saveDemoAccounts(accounts);
    }
    return user;
  },
};
