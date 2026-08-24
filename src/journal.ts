import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { Request, Response } from "express";
import { APPLICATION_KEY, JOURNAL_API, JOURNAL_ORIGIN, TOKEN_TTL_MS } from "./config";
import { HttpError, unauthorized } from "./errors";
import { Session, readSession, writeSession } from "./session";

const client = axios.create({
  baseURL: JOURNAL_API,
  timeout: 20_000,
  headers: {
    "Content-Type": "application/json",
    Referer: JOURNAL_ORIGIN,
    Origin: JOURNAL_ORIGIN,
  },
});

const toHttpError = (error: unknown): HttpError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const status = axiosError.response?.status ?? 502;
    const message =
      axiosError.response?.data?.message ??
      axiosError.message ??
      "Journal API request failed";

    return new HttpError(status, message, axiosError.response?.data ?? null);
  }

  return new HttpError(502, "Journal API request failed");
};

export const login = async (
  username: string,
  password: string
): Promise<string> => {
  try {
    const { data } = await client.post<{ access_token?: string }>(
      "/auth/login",
      { username, password, application_key: APPLICATION_KEY }
    );

    if (!data?.access_token) {
      throw unauthorized("Journal did not return an access token");
    }

    return data.access_token;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    const httpError = toHttpError(error);

    if (httpError.status === 401 || httpError.status === 422) {
      throw unauthorized("Неправильный логин или пароль");
    }

    throw httpError;
  }
};

export const createSession = async (
  username: string,
  password: string
): Promise<Session> => {
  const token = await login(username, password);

  return {
    username,
    password,
    token,
    tokenExpiresAt: Date.now() + TOKEN_TTL_MS,
  };
};

const ensureToken = async (
  session: Session,
  res: Response
): Promise<Session> => {
  if (session.token && session.tokenExpiresAt > Date.now()) {
    return session;
  }

  const refreshed = await createSession(session.username, session.password);
  writeSession(res, refreshed);

  return refreshed;
};

const call = async <T>(
  session: Session,
  path: string,
  config: AxiosRequestConfig
): Promise<T> => {
  try {
    const { data } = await client.request<T>({
      ...config,
      url: path,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${session.token}`,
      },
    });

    return data;
  } catch (error) {
    const httpError = toHttpError(error);
    console.error(
      `journal ${config.method ?? "GET"} ${path} -> ${httpError.status}: ${httpError.message}`
    );
    throw httpError;
  }
};

export const journalWithSession = async <T>(
  session: Session,
  res: Response,
  path: string,
  config: AxiosRequestConfig = { method: "GET" }
): Promise<T> => {
  let current = await ensureToken(session, res);

  try {
    return await call<T>(current, path, config);
  } catch (error) {
    const httpError =
      error instanceof HttpError ? error : toHttpError(error);

    if (httpError.status !== 401 && httpError.status !== 403) {
      throw httpError;
    }

    try {
      current = await createSession(current.username, current.password);
    } catch {
      throw httpError;
    }

    writeSession(res, current);

    return await call<T>(current, path, config);
  }
};

export const journalRequest = async <T>(
  req: Request,
  res: Response,
  path: string,
  config: AxiosRequestConfig = { method: "GET" }
): Promise<T> => {
  const stored = readSession(req);

  if (!stored) {
    throw unauthorized();
  }

  return journalWithSession(stored, res, path, config);
};

type TranslationDict = Record<string, string>;

let translationsCache: { at: number; dict: TranslationDict } | null = null;
const TRANSLATIONS_TTL_MS = 6 * 60 * 60 * 1000;

export const getPublicTranslations = async (
  language = "ru_RU"
): Promise<TranslationDict> => {
  if (
    translationsCache &&
    Date.now() - translationsCache.at < TRANSLATIONS_TTL_MS
  ) {
    return translationsCache.dict;
  }

  try {
    const { data } = await client.get<TranslationDict>("/public/translations", {
      params: { language },
    });
    const dict =
      data && typeof data === "object" && !Array.isArray(data) ? data : {};
    translationsCache = { at: Date.now(), dict };
    return dict;
  } catch {
    return translationsCache?.dict ?? {};
  }
};
