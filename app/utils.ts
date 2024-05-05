import axios from "axios";
import * as fs from "fs";
import { join } from "path";
import {
  APP_URL_DEV,
  APP_URL_PRODUCTION,
  CONNECTIONS,
  NEYNAR_API_KEY,
  NEYNAR_API_URL,
} from "./config/constants";
import { NeynarUser, User } from "./types";

export const isSSR = typeof window === "undefined";
export const isProd = () => process.env.VERCEL_ENV === "production";
export const isDevelopment = () => process.env.FRAME_ENV === "development";

// Redirect browser-based requests
export const browserLocation = "";

export function getProtocol() {
  if (isProd()) return "https://";
  return "http://";
}

export function getAbsoluteUrl() {
  // get absolute url in client/browser
  if (!isSSR) return location.origin;
  // get absolute url in server.
  const protocol = getProtocol();

  if (isProd()) return APP_URL_PRODUCTION;
  return `${protocol}${APP_URL_DEV}`;
}

export function getMetalWebUrl() {
  if (isDevelopment()) return CONNECTIONS.dev.metalWeb;
  if (isProd()) return CONNECTIONS.prod.metalWeb;
  return CONNECTIONS.staging.metalWeb;
}

export function getMetalServiceUrl() {
  if (isDevelopment()) return CONNECTIONS.dev.metalService;
  if (isProd()) return CONNECTIONS.prod.metalService;
  return CONNECTIONS.staging.metalService;
}

export function getMetalDeploymentUrl(deploymentId: string) {
  if (!deploymentId) return CONNECTIONS.prod.metalWeb;

  const url = `${getMetalWebUrl()}/deployment/${deploymentId}/overview`;
  return url;
}

export const interRegPath = join(
  process.cwd(),
  "public/fonts/Inter-Regular.ttf"
);
export const interBoldPath = join(process.cwd(), "public/fonts/Inter-Bold.ttf");
const interReg = fs.readFileSync(interRegPath);
const interBold = fs.readFileSync(interBoldPath);

export const defaultImageOptions = {
  width: 560,
  height: 280,
  quality: 100,
  unoptimized: true,
  fonts: [
    {
      name: "Inter",
      data: interReg,
      weight: 400,
      style: "normal",
    },
    {
      name: "Inter",
      data: interBold,
      weight: 800,
      style: "normal",
    },
  ],
};

export async function getNeynarUserData(fid: number): Promise<User | null> {
  try {
    const { data } = await axios<{
      users: [NeynarUser];
    }>(`${NEYNAR_API_URL}/user/bulk?fids=${fid}}`, {
      headers: { accept: "application/json", api_key: NEYNAR_API_KEY },
    });
    const [user] = data.users;

    // active badge is probably going away soon ?
    // john and kevin are super user
    const superUser = fid === 18517 || fid === 19637;

    return {
      ...user,
      address:
        user?.verified_addresses?.eth_addresses?.[0] || user.custody_address,
      isActive: user?.active_status === "active" || superUser,
    };
  } catch (e) {
    console.error(e);
  }

  return null;
}

export const isUint256 = (value: string) => {
  const num = Number(value);
  return Number.isInteger(num) && num >= 0 && num < 2 ** 256;
};
