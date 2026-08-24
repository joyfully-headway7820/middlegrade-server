export const JOURNAL_API = "https://msapi.top-academy.ru/api/v2";

export const JOURNAL_ORIGIN = "https://journal.top-academy.ru";

export const APPLICATION_KEY =
  process.env.APPLICATION_KEY ??
  "6a56a5df2667e65aab73ce76d1dd737f7d1faef9c52e8b8c55ac75f565d8e8a6";

export const PORT = Number(process.env.PORT ?? 3000);

export const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const SESSION_COOKIE = "mg_session";

export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export const TOKEN_TTL_MS = 1000 * 60 * 50;

export const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const secret = process.env.SESSION_SECRET;

if (!secret && IS_PRODUCTION) {
  throw new Error("SESSION_SECRET must be set in production");
}

export const SESSION_SECRET = secret ?? "insecure-development-secret";
