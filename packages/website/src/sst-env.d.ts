/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly REACT_APP_SERVERLESS_API_URL: string
  readonly REACT_APP_CONTAINER_API_URL: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}