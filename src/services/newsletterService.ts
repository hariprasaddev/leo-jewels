import type { NewsletterSubscription } from "@/types";
import { generateId } from "@/lib/utils";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";
import { apiRequest, isApiConfigured } from "./apiClient";

/**
 * Newsletter subscriptions.
 *
 * Production: POST /newsletter with server-side validation, a confirmation
 * email (double opt-in) and a database record. Demo mode: stored in this
 * browser only; it is not a mailing list and is labelled as such.
 */
export const newsletterService = {
  async subscribe(email: string): Promise<{ storedLocally: boolean }> {
    const clean = email.trim().toLowerCase();
    if (isApiConfigured()) {
      await apiRequest("/newsletter", { method: "POST", body: { email: clean } });
      return { storedLocally: false };
    }

    const subscriptions = readStorage<NewsletterSubscription[]>(
      STORAGE_KEYS.newsletter,
      []
    );
    if (!subscriptions.some((entry) => entry.email === clean)) {
      writeStorage(STORAGE_KEYS.newsletter, [
        {
          id: generateId("NL"),
          email: clean,
          createdAt: new Date().toISOString(),
        },
        ...subscriptions,
      ]);
    }
    return { storedLocally: true };
  },

  all(): NewsletterSubscription[] {
    return readStorage<NewsletterSubscription[]>(STORAGE_KEYS.newsletter, []);
  },
};
