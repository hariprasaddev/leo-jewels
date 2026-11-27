import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Clock, Eye, Video, X } from "lucide-react";
import type {
  ConsultationAvailability,
  ConsultationBooking,
  ConsultationStatus,
} from "@/types";
import { AdminPageHeader, AdminTable } from "@/components/admin/AdminUI";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import { consultationService } from "@/services/consultationService";
import { formatDate } from "@/lib/utils";

const STATUSES: ConsultationStatus[] = [
  "Pending",
  "Approved",
  "Rescheduled",
  "Completed",
  "Cancelled",
  "Rejected",
];

export function AdminConsultations() {
  const [bookings, setBookings] = useState<ConsultationBooking[]>([]);
  const [filter, setFilter] = useState<"all" | ConsultationStatus>("all");
  const [active, setActive] = useState<ConsultationBooking | null>(null);
  const [draft, setDraft] = useState({ date: "", time: "", meetingLink: "", adminNote: "" });
  const [error, setError] = useState("");
  const [availability, setAvailability] = useState<ConsultationAvailability>(
    consultationService.availability()
  );
  const [availabilitySaved, setAvailabilitySaved] = useState(false);

  const reload = () => setBookings(consultationService.all());

  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? bookings : bookings.filter((booking) => booking.status === filter)),
    [bookings, filter]
  );

  const openBooking = (booking: ConsultationBooking) => {
    setActive(booking);
    setDraft({
      date: booking.date,
      time: booking.time,
      meetingLink: booking.meetingLink ?? "",
      adminNote: booking.adminNote ?? "",
    });
    setError("");
  };

  const update = async (patch: Parameters<typeof consultationService.update>[1]) => {
    if (!active) return;
    setError("");
    try {
      const updated = await consultationService.update(active.id, patch);
      reload();
      if (updated) {
        setActive(updated);
        setDraft({
          date: updated.date,
          time: updated.time,
          meetingLink: updated.meetingLink ?? "",
          adminNote: updated.adminNote ?? "",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update this appointment.");
    }
  };

  const reschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.date || !draft.time) {
      setError("Choose both a date and a time for the rescheduled appointment.");
      return;
    }
    await update({
      date: draft.date,
      time: draft.time,
      status: "Rescheduled",
      meetingLink: draft.meetingLink.trim() || undefined,
      adminNote: draft.adminNote.trim() || undefined,
    });
  };

  const saveAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    consultationService.saveAvailability(availability);
    setAvailabilitySaved(true);
    window.setTimeout(() => setAvailabilitySaved(false), 2200);
  };

  const slotSummary = availability.slots.join(", ");

  return (
    <div>
      <AdminPageHeader
        title="Consultation bookings"
        description="Approve, reschedule or cancel video appointments, and add the meeting link customers will use."
      />

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "All requests", value: bookings.length },
          { label: "Pending", value: bookings.filter((b) => b.status === "Pending").length },
          { label: "Approved", value: bookings.filter((b) => b.status === "Approved").length },
          { label: "Completed", value: bookings.filter((b) => b.status === "Completed").length },
        ].map((stat) => (
          <div key={stat.label} className="border border-line bg-white px-3.5 py-3">
            <p className="text-[8.5px] uppercase tracking-[0.14em] text-stone">{stat.label}</p>
            <p className="mt-1.5 font-serif text-xl text-ink">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | ConsultationStatus)}
          aria-label="Filter consultations by status"
          className="h-10 border border-line bg-white px-3 text-[11.5px] text-charcoal outline-none focus:border-gold"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <span className="ml-auto text-[10.5px] text-stone">{filtered.length} appointments</span>
      </div>

      <AdminTable head={["Customer", "Consultation", "Date & time", "Meeting", "Status", ""]}>
        {filtered.map((booking) => (
          <tr key={booking.id} className="text-[11.5px]">
            <td className="px-4 py-3">
              <p className="font-medium text-ink">{booking.fullName}</p>
              <p className="text-[9.5px] text-stone">{booking.email}</p>
              <p className="text-[9.5px] text-stone">{booking.mobile}</p>
            </td>
            <td className="px-4 py-3">
              <p className="text-charcoal">{booking.type}</p>
              <p className="text-[9.5px] text-stone">{booking.category}</p>
            </td>
            <td className="px-4 py-3 text-charcoal/70">
              <p>{formatDate(booking.date)}</p>
              <p className="text-[9.5px] text-stone">{booking.time} IST</p>
            </td>
            <td className="px-4 py-3">
              {booking.meetingLink ? (
                <a
                  href={booking.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-gold-dark hover:text-ink"
                >
                  <Video size={12} /> Link added
                </a>
              ) : (
                <span className="text-[10px] text-stone">Not added</span>
              )}
            </td>
            <td className="px-4 py-3">
              <span className="inline-block whitespace-nowrap border border-line bg-cream px-2 py-0.5 text-[8.5px] uppercase tracking-[0.1em] text-charcoal">
                {booking.status}
              </span>
            </td>
            <td className="px-4 py-3">
              <button
                onClick={() => openBooking(booking)}
                className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.1em] text-gold-dark hover:text-ink"
              >
                <Eye size={13} /> Manage
              </button>
            </td>
          </tr>
        ))}
        {filtered.length === 0 && (
          <tr>
            <td colSpan={6} className="px-4 py-10 text-center text-[12px] text-stone">
              No consultation requests yet.
            </td>
          </tr>
        )}
      </AdminTable>

      <DemoNote className="mt-4">
        Consultation requests are stored locally in this browser until the Spring Boot API
        is connected. Customers see updates only from the same browser in demo mode.
      </DemoNote>

      <form onSubmit={saveAvailability} className="mt-10 border border-line bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-ink">Availability settings</h2>
            <p className="mt-1 text-[11px] text-stone">
              These slots are offered on the public booking form. Blocked dates are closed.
            </p>
          </div>
          <Button type="submit" size="sm" variant="outline">
            {availabilitySaved ? "Saved" : "Save availability"}
          </Button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="consult-slots" className="field-label">Daily time slots</label>
            <input
              id="consult-slots"
              value={slotSummary}
              onChange={(e) =>
                setAvailability((current) => ({
                  ...current,
                  slots: e.target.value
                    .split(",")
                    .map((slot) => slot.trim())
                    .filter((slot) => /^\d{2}:\d{2}$/.test(slot)),
                }))
              }
              placeholder="10:00, 11:00, 14:00"
              className="field h-11 text-[12.5px]"
            />
            <p className="mt-1.5 text-[10px] text-stone">
              Comma-separated 24-hour times, e.g. 10:00, 14:30.
            </p>
          </div>
          <div>
            <label htmlFor="consult-blocked" className="field-label">Blocked dates</label>
            <input
              id="consult-blocked"
              value={availability.blockedDates.join(", ")}
              onChange={(e) =>
                setAvailability((current) => ({
                  ...current,
                  blockedDates: e.target.value
                    .split(",")
                    .map((date) => date.trim())
                    .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)),
                }))
              }
              placeholder="2026-12-25, 2026-01-01"
              className="field h-11 text-[12.5px]"
            />
            <p className="mt-1.5 text-[10px] text-stone">
              Comma-separated dates in YYYY-MM-DD form.
            </p>
          </div>
        </div>
      </form>

      <Modal
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title="Manage appointment"
        panelClassName="sm:max-w-2xl"
      >
        {active && (
          <div className="space-y-5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-stone">Reference {active.id}</p>
                <p className="mt-1 font-serif text-xl text-ink">{active.type}</p>
                <p className="mt-1 text-[11px] text-charcoal/60">
                  {active.fullName} · {active.email} · {active.mobile}
                </p>
              </div>
              <span className="border border-gold/40 bg-gold/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] text-gold-deep">
                {active.status}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-line bg-cream/40 p-3.5">
                <p className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-stone">
                  <CalendarDays size={12} /> Requested
                </p>
                <p className="mt-1.5 text-[12.5px] text-ink">
                  {formatDate(active.date)} · {active.time} IST
                </p>
              </div>
              <div className="border border-line bg-cream/40 p-3.5">
                <p className="text-[9px] uppercase tracking-[0.14em] text-stone">Category</p>
                <p className="mt-1.5 text-[12.5px] text-ink">{active.category}</p>
                {active.productReference && (
                  <p className="mt-1 text-[10.5px] text-stone">{active.productReference}</p>
                )}
              </div>
            </div>

            {active.notes && (
              <div>
                <p className="text-[9px] uppercase tracking-[0.14em] text-stone">Customer questions</p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-charcoal/70">{active.notes}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => update({ status: "Approved" })}>
                <Check size={13} /> Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => update({ status: "Completed" })}>
                Mark completed
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => update({ status: "Rejected" })}
              >
                <X size={13} /> Reject
              </Button>
            </div>

            <form onSubmit={reschedule} className="space-y-3 border-t border-line pt-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-ink">Reschedule</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="resched-date" className="field-label">New date</label>
                  <input
                    id="resched-date"
                    type="date"
                    value={draft.date}
                    onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                    className="field h-11 text-[12.5px]"
                  />
                </div>
                <div>
                  <label htmlFor="resched-time" className="field-label">New time (IST)</label>
                  <input
                    id="resched-time"
                    type="time"
                    value={draft.time}
                    onChange={(e) => setDraft({ ...draft, time: e.target.value })}
                    className="field h-11 text-[12.5px]"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="meeting-link" className="field-label">Meeting link</label>
                <input
                  id="meeting-link"
                  value={draft.meetingLink}
                  onChange={(e) => setDraft({ ...draft, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/… or https://zoom.us/j/…"
                  className="field h-11 text-[12.5px]"
                />
                <p className="mt-1.5 text-[10px] leading-relaxed text-stone">
                  Add a link from an approved provider (Google Meet, Zoom). The store never
                  creates a meeting automatically.
                </p>
              </div>
              <div>
                <label htmlFor="admin-note" className="field-label">Note to customer</label>
                <textarea
                  id="admin-note"
                  rows={3}
                  value={draft.adminNote}
                  onChange={(e) => setDraft({ ...draft, adminNote: e.target.value })}
                  className="field min-h-[80px] py-3 text-[12.5px]"
                />
              </div>
              {error && <p className="text-[11px] text-red-500">{error}</p>}
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" size="sm">
                  <Clock size={13} /> Save & reschedule
                </Button>
                <button
                  type="button"
                  onClick={() => update({ meetingLink: draft.meetingLink.trim() || undefined, adminNote: draft.adminNote.trim() || undefined })}
                  className="text-[10px] uppercase tracking-[0.14em] text-gold-dark hover:text-ink"
                >
                  Save link & note only
                </button>
              </div>
            </form>

            <div className="border-t border-line pt-4">
              <label htmlFor="status-select" className="field-label">Update appointment status</label>
              <select
                id="status-select"
                value={active.status}
                onChange={(e) => update({ status: e.target.value as ConsultationStatus })}
                className="field h-11 text-[12.5px]"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
