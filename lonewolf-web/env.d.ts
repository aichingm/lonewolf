/// <reference types="vite/client" />

interface ImportMetaEnv {
  // When set to "1" the web version will not display any warning when opening projects with an incompatible attachment store type
  readonly VITE_IGNORE_PLATFORM_CAN_SUPPORT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
