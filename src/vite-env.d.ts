/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PAYCHANGU_SECRET_KEY: string
  readonly VITE_EMAIL_FUNCTION_URL: string;
  // Add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
