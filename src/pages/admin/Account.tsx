import { useState } from "react";
import { KeyRound, Mail, ShieldCheck, UserPlus } from "lucide-react";
import type { AdminRole } from "@/lib/adminAuth";
import {
  addAdministrator,
  changeOwnEmail,
  changeOwnPassword,
  getAdminSession,
  listAdmins,
} from "@/lib/adminAuth";
import { AdminPageHeader, AdminField } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";

export function AdminAccount() {
  const session = getAdminSession();
  const [admins, setAdmins] = useState(() => listAdmins());
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const [emailForm, setEmailForm] = useState({ password: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin" as AdminRole,
    actorPassword: "",
  });

  const run = async (task: () => Promise<void>, success: string) => {
    setMessage(null);
    try {
      await task();
      setAdmins(listAdmins());
      setMessage({ tone: "ok", text: success });
      return true;
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "That change could not be saved.",
      });
      return false;
    }
  };

  if (!session) return null;

  return (
    <div>
      <AdminPageHeader
        title="Admin account"
        description="Manage the administrator accounts stored in this browser. Passwords are hashed with PBKDF2 and never shown again."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="border border-line bg-white p-4">
          <p className="text-[9px] uppercase tracking-[0.16em] text-stone">Signed in as</p>
          <p className="mt-1.5 text-[13px] font-medium text-ink">
            {admins.find((a) => a.id === session.accountId)?.name ?? "Administrator"}
          </p>
          <p className="text-[11px] text-charcoal/60">{session.email}</p>
        </div>
        <div className="border border-line bg-white p-4">
          <p className="text-[9px] uppercase tracking-[0.16em] text-stone">Role</p>
          <p className="mt-1.5 flex items-center gap-1.5 text-[13px] capitalize text-ink">
            <ShieldCheck size={14} className="text-gold-dark" /> {session.role}
          </p>
          <p className="text-[11px] text-charcoal/60">
            {session.role === "owner" ? "Can add administrators" : "Catalogue access only"}
          </p>
        </div>
        <div className="border border-line bg-white p-4">
          <p className="text-[9px] uppercase tracking-[0.16em] text-stone">Administrators</p>
          <p className="mt-1.5 text-[13px] text-ink">{admins.length} on this device</p>
          <p className="text-[11px] text-charcoal/60">Local browser accounts</p>
        </div>
      </div>

      {message && (
        <div
          role="status"
          className={
            message.tone === "ok"
              ? "mb-5 border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-[11.5px] text-emerald-800"
              : "mb-5 border border-red-200 bg-red-50 px-3.5 py-3 text-[11.5px] text-red-700"
          }
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await run(
              () => changeOwnEmail(emailForm.password, emailForm.email),
              "Email updated. Use it the next time you sign in."
            );
            if (ok) setEmailForm({ password: "", email: "" });
          }}
          className="border border-line bg-white p-5"
        >
          <h2 className="flex items-center gap-2 font-serif text-lg text-ink">
            <Mail size={16} className="text-gold-dark" /> Change admin email
          </h2>
          <p className="mt-1 text-[11px] leading-relaxed text-stone">
            This is the sign-in email for this browser account. It does not change any
            backend user, because no backend is connected.
          </p>
          <div className="mt-4 space-y-3">
            <AdminField
              id="admin-new-email"
              label="New email"
              type="email"
              value={emailForm.email}
              onChange={(v) => setEmailForm({ ...emailForm, email: v })}
              required
            />
            <AdminField
              id="admin-email-password"
              label="Current password"
              type="password"
              value={emailForm.password}
              onChange={(v) => setEmailForm({ ...emailForm, password: v })}
              required
            />
          </div>
          <Button type="submit" size="sm" className="mt-4">Update email</Button>
        </form>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (passwordForm.next !== passwordForm.confirm) {
              setMessage({ tone: "error", text: "The two new passwords do not match." });
              return;
            }
            const ok = await run(
              () => changeOwnPassword(passwordForm.current, passwordForm.next),
              "Password changed. Use the new password next time you sign in."
            );
            if (ok) setPasswordForm({ current: "", next: "", confirm: "" });
          }}
          className="border border-line bg-white p-5"
        >
          <h2 className="flex items-center gap-2 font-serif text-lg text-ink">
            <KeyRound size={16} className="text-gold-dark" /> Change password
          </h2>
          <p className="mt-1 text-[11px] leading-relaxed text-stone">
            Resetting a forgotten password is not possible from the storefront. See
            ADMIN_SETUP.md for the recovery procedure.
          </p>
          <div className="mt-4 space-y-3">
            <AdminField
              id="admin-current-password"
              label="Current password"
              type="password"
              value={passwordForm.current}
              onChange={(v) => setPasswordForm({ ...passwordForm, current: v })}
              required
            />
            <AdminField
              id="admin-next-password"
              label="New password"
              type="password"
              value={passwordForm.next}
              onChange={(v) => setPasswordForm({ ...passwordForm, next: v })}
              required
            />
            <AdminField
              id="admin-confirm-password"
              label="Confirm new password"
              type="password"
              value={passwordForm.confirm}
              onChange={(v) => setPasswordForm({ ...passwordForm, confirm: v })}
              required
            />
          </div>
          <Button type="submit" size="sm" className="mt-4">Change password</Button>
        </form>
      </div>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-ink">Administrators on this device</h2>
        <div className="mt-3 divide-y divide-line border border-line bg-white">
          {admins.map((admin) => (
            <div key={admin.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div>
                <p className="text-[12.5px] font-medium text-ink">
                  {admin.name}
                  {admin.id === session.accountId && (
                    <span className="ml-2 text-[9px] uppercase tracking-[0.14em] text-gold-dark">You</span>
                  )}
                </p>
                <p className="text-[11px] text-charcoal/60">{admin.email}</p>
              </div>
              <span className="border border-line px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] capitalize text-charcoal/60">
                {admin.role}
              </span>
            </div>
          ))}
        </div>
      </section>

      {session.role === "owner" && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await run(
              () =>
                addAdministrator(inviteForm.actorPassword, {
                  name: inviteForm.name,
                  email: inviteForm.email,
                  password: inviteForm.password,
                  role: inviteForm.role,
                }),
              "Administrator added to this browser."
            );
            if (ok) {
              setInviteForm({
                name: "",
                email: "",
                password: "",
                role: "admin",
                actorPassword: "",
              });
            }
          }}
          className="mt-8 border border-line bg-white p-5"
        >
          <h2 className="flex items-center gap-2 font-serif text-xl text-ink">
            <UserPlus size={17} className="text-gold-dark" /> Add another administrator
          </h2>
          <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-stone">
            Only an owner can add administrators. The new person's password is hashed
            locally; share it with them through a private channel. In production this must
            be an invitation handled by the backend.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <AdminField id="invite-name" label="Name" value={inviteForm.name} onChange={(v) => setInviteForm({ ...inviteForm, name: v })} required />
            <AdminField id="invite-email" label="Email" type="email" value={inviteForm.email} onChange={(v) => setInviteForm({ ...inviteForm, email: v })} required />
            <AdminField id="invite-password" label="Initial password" type="password" value={inviteForm.password} onChange={(v) => setInviteForm({ ...inviteForm, password: v })} required />
            <div>
              <label htmlFor="invite-role" className="field-label">Role</label>
              <select
                id="invite-role"
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as AdminRole })}
                className="field h-11 text-[12.5px]"
              >
                <option value="admin">Admin — catalogue and content</option>
                <option value="owner">Owner — can add administrators</option>
              </select>
            </div>
            <AdminField
              id="invite-actor-password"
              label="Your current password (to confirm)"
              type="password"
              value={inviteForm.actorPassword}
              onChange={(v) => setInviteForm({ ...inviteForm, actorPassword: v })}
              required
              className="sm:col-span-2"
            />
          </div>
          <Button type="submit" size="sm" className="mt-4">Add administrator</Button>
        </form>
      )}
    </div>
  );
}
