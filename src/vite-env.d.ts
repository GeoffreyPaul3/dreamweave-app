/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PAYCHANGU_SECRET_KEY: string
  // Add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
