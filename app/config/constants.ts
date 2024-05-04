export const APP_URL_PRODUCTION = "https://fountain-of-plenty.vercel.app/";
export const APP_URL_DEV = "localhost:3000";
export const CONNECTIONS = {
  prod: {
    metalWeb: "https://metal.build",
    metalService: "https://api.metal.build",
  },
  staging: {
    metalWeb: "https://staging.metal.build",
    metalService: "https://staging.api.metal.build",
  },
  dev: {
    metalWeb: "http://localhost:3000",
    metalService: "http://localhost:1234",
  },
};
export const NEYNAR_API_URL = "https://api.neynar.com/v2/farcaster";
export const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "";
export const FROG_SIGNER_SECRET = process.env.FROG_SIGNER_SECRET || "";
export const KV_REST_API_URL = process.env.KV_REST_API_URL || "";
export const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN || "";
export const NO_CACHE_HEADER = {
  "Cache-Control": "public, max-age=0, must-revalidate",
};
