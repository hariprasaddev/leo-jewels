import type {
  ConsultationAvailability,
  ConsultationBooking,
  ConsultationStatus,
} from "@/types";
import { generateId } from "@/lib/utils";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";
import { apiRequest, isApiConfigured } from "./apiClient";

/**
 * Consultation booking service.
 *
 * With VITE_API_BASE_URL configured this delegates to the Spring Boot API
 * (`/consultations`, `/consultations/:id`, `/consultations/availability`).
 * Without it, bookings are kept in this browser only and every screen labels
 * them as local. Double-booking is prevented locally and must ALSO be enforced
 * by the backend (unique constraint on date + time + active status).
 */

const DEFAULT_AVAILABILITY: ConsultationAvailability = {
  blockedDates: [],
  slots: ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
};

function localBookings(): ConsultationBooking[] {
  return readStorage<ConsultationBooking[]>(STORAGE_KEYS.consultations, []);
}

export function getConsultationAvailability(): ConsultationAvailability {
  const stored = readStorage<Partial<ConsultationAvailability> | null>(
    STORAGE_KEYS.consultationAvailability,
    null
  );
  return {
    blockedDates: stored?.blockedDates ?? DEFAULT_AVAILABILITY.blockedDates,
    slots: stored?.slots?.length ? stored.slots : DEFAULT_AVAILABILITY.slots,
  };
}

export interface ConsultationInput {
  fullName: string;
  email: string;
  mobile: string;
  date: string;
  time: string;
  type: ConsultationBooking["type"];
  category: string;
  productReference?: string;
  notes?: string;
}

export const consultationService = {
  availability(): ConsultationAvailability {
    return getConsultationAvailability();
  },

  saveAvailability(availability: ConsultationAvailability): void {
    writeStorage(STORAGE_KEYS.consultationAvailability, availability);
  },

  bookedSlots(date: string): string[] {
    return localBookings()
      .filter(
        (booking) =>
          booking.date === date &&
          booking.status !== "Cancelled" &&
          booking.status !== "Rejected"
      )
      .map((booking) => booking.time);
  },

  async book(input: ConsultationInput): Promise<ConsultationBooking> {
    if (isApiConfigured()) {
      return apiRequest<ConsultationBooking>("/consultations", {
        method: "POST",
        body: input,
      });
    }

    const taken = this.bookedSlots(input.date);
    if (taken.includes(input.time)) {
      throw new Error(
        "That time has just been reserved. Please choose another available slot."
      );
    }

    const now = new Date().toISOString();
    const booking: ConsultationBooking = {
      ...input,
      id: generateId("CONS"),
      status: "Pending",
      createdAt: now,
      updatedAt: now,
    };
    writeStorage(STORAGE_KEYS.consultations, [booking, ...localBookings()]);
    return booking;
  },

  all(): ConsultationBooking[] {
    return localBookings();
  },

  forEmail(email: string): ConsultationBooking[] {
    const key = email.trim().toLowerCase();
    return localBookings().filter((booking) => booking.email.toLowerCase() === key);
  },

  async update(
    id: string,
    patch: Partial<
      Pick<
        ConsultationBooking,
        "status" | "date" | "time" | "meetingLink" | "adminNote"
      >
    >
  ): Promise<ConsultationBooking | undefined> {
    if (isApiConfigured()) {
      return apiRequest<ConsultationBooking>(`/consultations/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: patch,
      });
    }

    const existing = localBookings().find((booking) => booking.id === id);
    if (!existing) return undefined;

    const nextDate = patch.date ?? existing.date;
    const nextTime = patch.time ?? existing.time;
    const nextStatus = (patch.status ?? existing.status) as ConsultationStatus;
    const holdsSlot = nextStatus !== "Cancelled" && nextStatus !== "Rejected";
    if (holdsSlot) {
      const conflict = localBookings().find(
        (booking) =>
          booking.id !== id &&
          booking.date === nextDate &&
          booking.time === nextTime &&
          booking.status !== "Cancelled" &&
          booking.status !== "Rejected"
      );
      if (conflict) {
        throw new Error("Another appointment already holds that date and time.");
      }
    }

    const updated: ConsultationBooking = {
      ...existing,
      ...patch,
      status: nextStatus,
      date: nextDate,
      time: nextTime,
      updatedAt: new Date().toISOString(),
    };
    writeStorage(
      STORAGE_KEYS.consultations,
      localBookings().map((booking) => (booking.id === id ? updated : booking))
    );
    return updated;
  },
};
