import { env } from "../config/env.js";

export const BUG_TYPE = ["BUG", "FEATURE"];
export const BUG_STATUS = ["NEW", "STARTED", "RESOLVED", "COMPLETED"];
export const INVITE_EXPIRES_IN = "24h";
export const INVITE_EXPIRES_MS = 24 * 60 * 60 * 1000;
export const INVITE_SECRET = env.INVITE_TOKEN_SECRET;
export const ACCESS_TOKEN_EXPIRES_IN = "1m";
export const REFRESH_TOKEN_EXPIRES_IN = "2m";