declare module "*.css";
declare module "*.css?url" {
  const url: string;
  export default url;
}
declare module "*.jpg" {
  const src: string;
  export default src;
}
declare module "*.jpeg" {
  const src: string;
  export default src;
}
declare module "*.png" {
  const src: string;
  export default src;
}
declare module "*.svg" {
  const src: string;
  export default src;
}
declare module "*.webp" {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_STOMP_URL?: string;
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}