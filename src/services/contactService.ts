import { generateId } from "@/lib/utils";
import { readStorage, writeStorage } from "@/lib/storage";
import { apiRequest, isApiConfigured } from "./apiClient";

export interface ContactEnquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
}

const KEY = "leojewels.enquiries.v1";

/**
 * Customer contact enquiries.
 *
 * Production: POST /contact-enquiries (server validates, stores, and notifies
 * the support inbox). Demo: stored in this browser only; no email is sent.
 */
export const contactService = {
  async send(input: Omit<ContactEnquiry, "id" | "createdAt">): Promise<{ storedLocally: boolean }> {
    if (isApiConfigured()) {
      await apiRequest("/contact-enquiries", { method: "POST", body: input });
      return { storedLocally: false };
    }
    const enquiries = readStorage<ContactEnquiry[]>(KEY, []);
    writeStorage(KEY, [
      { ...input, id: generateId("ENQ"), createdAt: new Date().toISOString() },
      ...enquiries,
    ]);
    return { storedLocally: true };
  },

  all(): ContactEnquiry[] {
    return readStorage<ContactEnquiry[]>(KEY, []);
  },
};
