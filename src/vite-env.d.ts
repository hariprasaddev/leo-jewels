/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_RAZORPAY_KEY_ID?: string;
  readonly VITE_CURRENCY?: string;
  readonly VITE_STORE_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
