import crypto from "crypto";
import { Request, Response } from "express";
import {
  IS_PRODUCTION,
  SESSION_COOKIE,
  SESSION_SECRET,
  SESSION_TTL_MS,
} from "./config";

export type Session = {
  username: string;
  password: string;
  token: string | null;
  tokenExpiresAt: number;
};

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const KEY = crypto.scryptSync(SESSION_SECRET, "middlegrade.session", 32);

const encrypt = (payload: Session): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
};

const decrypt = (raw: string): Session | null => {
  try {
    const buffer = Buffer.from(raw, "base64url");

    if (buffer.length <= IV_LENGTH + 16) {
      return null;
    }

    const iv = buffer.subarray(0, IV_LENGTH);
    const tag = buffer.subarray(IV_LENGTH, IV_LENGTH + 16);
    const data = buffer.subarray(IV_LENGTH + 16);

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(data),
      decipher.final(),
    ]).toString("utf8");

    const parsed = JSON.parse(decrypted) as Session;

    if (typeof parsed.username !== "string" || typeof parsed.password !== "string") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const readSession = (req: Request): Session | null => {
  const raw = req.cookies?.[SESSION_COOKIE];
  return typeof raw === "string" ? decrypt(raw) : null;
};

export const writeSession = (res: Response, session: Session): void => {
  res.cookie(SESSION_COOKIE, encrypt(session), {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    maxAge: SESSION_TTL_MS,
    path: "/",
  });
};

export const clearSession = (res: Response): void => {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
  });
};
