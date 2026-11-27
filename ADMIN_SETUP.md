# LEO JEWELS — Admin Setup & Security Guide

This document describes the admin system **as it exists in this repository today**, and what
still has to be built for production-grade protection.

> **Read this first:** this project is a Vite + React frontend with **no backend checked in**.
> Admin authentication in this build is browser-local. It creates real PBKDF2 password hashes
> and exposes no default credentials, but it cannot stop someone who controls the browser or
> the JavaScript bundle. Do not represent it as server security. Section 7 lists the backend
> work required before you take payments or expose customer data.

---

## 1. Where admin authentication is implemented

| Concern | File |
| --- | --- |
| Account records, password hashing, sign-in, roles, sessions | `src/lib/adminAuth.ts` |
| Route protection | `src/components/admin/AdminGuard.tsx` |
| Sign-in / first-run setup screen | `src/pages/admin/AdminLogin.tsx` |
| Account management screen | `src/pages/admin/Account.tsx` |
| Admin routes | `src/App.tsx` (`/admin/*`) |
| Admin shell / sign-out | `src/components/layout/AdminLayout.tsx` |
| Session / account storage keys | `src/lib/adminAuth.ts`, `src/lib/storage.ts` |

There is **no** hardcoded email/password anywhere in the frontend. The previous demo credential
pair has been removed from `src/data/admin.ts`.

## 2. Where admin users are stored

In this demonstration build, administrator accounts live in the browser's `localStorage`:

- Key: `leojewels.admin.accounts.v1`
- Shape: `{ id, name, email, role, salt, hash, iterations, createdAt }[]`
- Passwords are never stored. Each account stores a random 16-byte salt and a
  PBKDF2-SHA-256 hash (210,000 iterations, 256-bit derived key).
- The active session lives in `sessionStorage` under `leojewels.admin.session.v2`.
  Closing the tab/browser ends the admin session.

There is no admin table in a database in this repository, because there is no database layer.
The Spring Boot API described in `README.md` is a contract, not code included here.

## 3. How admin roles are assigned

- The first account created on a device is the **owner**.
- An owner can add further administrators from Admin → Admin Account, assigning either
  `owner` or `admin`.
- The role is stored on the account and in the session.
- Adding administrators is restricted to owners; catalogue screens are available to both
  roles in this frontend. The role check is client-side only.

## 4. Creating the first administrator

No default account exists.

1. Run the site (`npm run dev`) and open `http://localhost:5173/admin/login`.
2. When no account exists, the page shows **Create the owner account** instead of a login form.
3. Enter your name, an email you control, and a password of at least 8 characters containing a
   letter and a number. Confirm the password.
4. Submit. You are signed in and taken to `/admin`.

The setup form is only available while this browser has no admin account. It does not create a
public default login.

## 5. Changing the admin email

1. Sign in and open **Admin → Admin Account** (`/admin/account`).
2. Use **Change admin email**.
3. Enter the new email and your current password.

The change applies to this browser account only. If a backend is later connected, the email
must also be changed there (see Section 7).

## 6. Resetting the admin password

**While signed in:** Admin → Admin Account → **Change password**. Enter the current password,
then the new one twice. The hash and salt are regenerated.

**If you are locked out (local demo only):** there is no email reset and no recovery secret in
the frontend. A reset email must be implemented by a backend; it cannot be done safely in
browser code. For this local build:

1. Open the browser devtools → Application → Local Storage for the site.
2. Delete `leojewels.admin.accounts.v1` and, under Session Storage,
   `leojewels.admin.session.v2`.
3. Reload `/admin/login` and create the owner account again.

This deletes the local administrator accounts; it does **not** delete products, images, orders
or settings. Anyone with access to the browser can do the same, which is exactly why this is a
demonstration mechanism and not production security.

## 7. Adding another administrator

1. Sign in as an **owner**.
2. Open Admin → Admin Account → **Add another administrator**.
3. Enter their name, email, an initial password and a role.
4. Confirm with your own current password.

Share the initial password privately. In production, replace this with a backend invitation
flow so the new administrator sets their own password.

## 8. How customers are kept out of admin pages

`src/components/admin/AdminGuard.tsx` checks for a valid local admin session before rendering
any `/admin` route. Without a session, the router redirects to `/admin/login`. Signing out
clears the session.

This stops ordinary navigation, not a determined attacker: the whole app is shipped to the
browser, and catalogue data is in `localStorage`. A visitor can still alter their own local
copy of prices or products using devtools. They cannot alter a server because no server is
connected. **This does not satisfy a real "customers cannot modify products/prices"
requirement.**

## 9. Security status of this build

| Requirement | Status |
| --- | --- |
| No hardcoded administrator password in frontend | **Done** — credentials removed; first-run setup only |
| No default, publicly accessible admin account | **Done** — no account exists until the owner creates one |
| Password hashing | **Done locally** — PBKDF2-SHA-256, per-account salt |
| Admin routes guarded | **Done client-side** (`AdminGuard`) |
| Admin permissions verified by a backend | **Not implemented** — there is no backend in this repository |
| Customers unable to modify products/prices | **Not enforceable in this frontend-only build** |
| Admin image/database writes protected server-side | **Not implemented** — uploads are IndexedDB blobs on this device |

Do not claim the admin area is production-secure. It is a working local management demo.

## 10. What production requires

1. **Backend service.** Add the Spring Boot API (or another server) and set
   `VITE_API_BASE_URL` in `.env.local` (template: `.env.example`).
2. **Admin identity.** Create an `admin_users` table with a unique email, BCrypt/Argon2 password
   hash, enabled flag, and a role (`ROLE_OWNER`, `ROLE_ADMIN`). Never seed a default password;
   bootstrap the first owner through a server-side CLI command or a one-time, expiring
   invitation token.
3. **Authentication endpoint.** `POST /admin/auth/login` issuing a short-lived access token;
   put admin claims in a separate audience from customer JWTs.
4. **Spring Security rules.** Require `ROLE_OWNER`/`ROLE_ADMIN` on every
   `/api/admin/**` endpoint, including product create/update/delete, price and stock changes,
   image upload/delete, settings and policy writes. Return 401/403; never rely on hidden UI.
5. **Server-side uploads.** Replace IndexedDB with object storage (e.g. S3-compatible) and store
   only the returned URL/reference in the product row. Validate MIME type and size on the server.
6. **Password reset.** Send a single-use, expiring reset token by email. Do not expose whether
   an email exists.
7. **Audit log.** Record who changed a price, product or order status, and when.
8. **HTTPS + secure cookies/tokens.** Do not store long-lived admin tokens in `localStorage` in
   production.

Until those exist, treat `/admin` as a local content-management demo for this browser only.
