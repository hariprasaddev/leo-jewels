/**
 * Local administrator accounts.
 *
 * IMPORTANT: this is a browser-only demonstration. Accounts and hashes are
 * stored in localStorage on this device. It prevents a casual visitor from
 * using a published default password, but it is NOT server-enforced security.
 * In production, authentication and every admin write must be protected by the
 * backend (Spring Security + roles). See ADMIN_SETUP.md.
 *
 * No credentials are hardcoded in this file or anywhere in the frontend.
 */

export const ADMIN_ACCOUNTS_KEY = "leojewels.admin.accounts.v1";
export const ADMIN_SESSION_KEY = "leojewels.admin.session.v2";

const PBKDF2_ITERATIONS = 210_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;

export type AdminRole = "owner" | "admin";

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  salt: string;
  hash: string;
  iterations: number;
  createdAt: string;
}

export interface AdminSession {
  accountId: string;
  email: string;
  role: AdminRole;
  issuedAt: string;
}

export interface PublicAdmin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt: string;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function subtle(): SubtleCrypto {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error(
      "Secure password hashing is unavailable. Open the site over http://localhost or https://."
    );
  }
  return crypto.subtle;
}

async function hashPassword(password: string, salt: Uint8Array, iterations: number) {
  const key = await subtle().importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await subtle().deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    key,
    KEY_BITS
  );
  return bytesToBase64(new Uint8Array(bits));
}

function readAccounts(): AdminAccount[] {
  try {
    const raw = window.localStorage.getItem(ADMIN_ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AdminAccount[]) : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: AdminAccount[]): void {
  window.localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateAdminPassword(password: string): string | null {
  if (password.length < 8) return "Use at least 8 characters.";
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Include at least one letter and one number.";
  }
  return null;
}

export function hasAdminAccounts(): boolean {
  return readAccounts().length > 0;
}

export function listAdmins(): PublicAdmin[] {
  return readAccounts().map(({ salt: _salt, hash: _hash, iterations: _iterations, ...rest }) => {
    void _salt;
    void _hash;
    void _iterations;
    return rest;
  });
}

export function getAdminSession(): AdminSession | null {
  try {
    const raw = window.sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AdminSession;
    if (!session?.accountId || !readAccounts().some((a) => a.id === session.accountId)) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearAdminSession(): void {
  try {
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    /* no-op */
  }
}

function grantSession(account: AdminAccount): AdminSession {
  const session: AdminSession = {
    accountId: account.id,
    email: account.email,
    role: account.role,
    issuedAt: new Date().toISOString(),
  };
  try {
    window.sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  } catch {
    /* no-op */
  }
  return session;
}

async function verify(account: AdminAccount, password: string): Promise<boolean> {
  const candidate = await hashPassword(
    password,
    base64ToBytes(account.salt),
    account.iterations
  );
  return candidate === account.hash;
}

export async function createFirstAdmin(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AdminSession> {
  if (hasAdminAccounts()) {
    throw new Error("An administrator already exists on this device. Sign in instead.");
  }
  const email = normaliseEmail(input.email);
  if (!input.name.trim()) throw new Error("Enter the administrator's name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }
  const passwordError = validateAdminPassword(input.password);
  if (passwordError) throw new Error(passwordError);

  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await hashPassword(input.password, salt, PBKDF2_ITERATIONS);
  const account: AdminAccount = {
    id: `adm-${Date.now().toString(36)}`,
    name: input.name.trim(),
    email,
    role: "owner",
    salt: bytesToBase64(salt),
    hash,
    iterations: PBKDF2_ITERATIONS,
    createdAt: new Date().toISOString(),
  };
  writeAccounts([account]);
  return grantSession(account);
}

export async function signInAdmin(email: string, password: string): Promise<AdminSession> {
  const account = readAccounts().find((a) => a.email === normaliseEmail(email));
  const genericError = "The email or password does not match an administrator account.";
  if (!account) throw new Error(genericError);
  if (!(await verify(account, password))) throw new Error(genericError);
  return grantSession(account);
}

export async function changeOwnEmail(
  currentPassword: string,
  newEmail: string
): Promise<void> {
  const session = getAdminSession();
  if (!session) throw new Error("Please sign in again.");
  const accounts = readAccounts();
  const index = accounts.findIndex((a) => a.id === session.accountId);
  if (index === -1) throw new Error("Administrator account not found.");
  const account = accounts[index];
  if (!(await verify(account, currentPassword))) {
    throw new Error("The current password is incorrect.");
  }
  const email = normaliseEmail(newEmail);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }
  if (accounts.some((a) => a.id !== account.id && a.email === email)) {
    throw new Error("Another administrator already uses that email.");
  }
  const updated: AdminAccount = { ...account, email };
  accounts[index] = updated;
  writeAccounts(accounts);
  grantSession(updated);
}

export async function changeOwnPassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const session = getAdminSession();
  if (!session) throw new Error("Please sign in again.");
  const accounts = readAccounts();
  const index = accounts.findIndex((a) => a.id === session.accountId);
  if (index === -1) throw new Error("Administrator account not found.");
  const account = accounts[index];
  if (!(await verify(account, currentPassword))) {
    throw new Error("The current password is incorrect.");
  }
  const passwordError = validateAdminPassword(newPassword);
  if (passwordError) throw new Error(passwordError);
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  accounts[index] = {
    ...account,
    salt: bytesToBase64(salt),
    hash: await hashPassword(newPassword, salt, PBKDF2_ITERATIONS),
    iterations: PBKDF2_ITERATIONS,
  };
  writeAccounts(accounts);
}

export async function addAdministrator(
  actorPassword: string,
  input: { name: string; email: string; password: string; role: AdminRole }
): Promise<void> {
  const session = getAdminSession();
  if (!session) throw new Error("Please sign in again.");
  if (session.role !== "owner") {
    throw new Error("Only the owner administrator can add another administrator.");
  }
  const accounts = readAccounts();
  const actor = accounts.find((a) => a.id === session.accountId);
  if (!actor || !(await verify(actor, actorPassword))) {
    throw new Error("Your current password is incorrect.");
  }
  const email = normaliseEmail(input.email);
  if (!input.name.trim()) throw new Error("Enter the administrator's name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }
  if (accounts.some((a) => a.email === email)) {
    throw new Error("An administrator with that email already exists.");
  }
  const passwordError = validateAdminPassword(input.password);
  if (passwordError) throw new Error(passwordError);
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const account: AdminAccount = {
    id: `adm-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
    name: input.name.trim(),
    email,
    role: input.role,
    salt: bytesToBase64(salt),
    hash: await hashPassword(input.password, salt, PBKDF2_ITERATIONS),
    iterations: PBKDF2_ITERATIONS,
    createdAt: new Date().toISOString(),
  };
  writeAccounts([...accounts, account]);
}
