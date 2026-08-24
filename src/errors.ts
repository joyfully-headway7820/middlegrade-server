import { NextFunction, Request, RequestHandler, Response } from "express";

export class HttpError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (message: string) => new HttpError(400, message);

export const unauthorized = (message = "Not authenticated") =>
  new HttpError(401, message);

export const asyncRoute =
  (handler: RequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };

export const requestLogger: RequestHandler = (req, res, next) => {
  const started = Date.now();

  res.on("finish", () => {
    const status = res.statusCode;
    const line = `${req.method} ${req.originalUrl} ${status} ${Date.now() - started}ms`;

    if (status >= 500 || status === 401) {
      console.error(line);
      return;
    }

    console.log(line);
  });

  next();
};

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof HttpError) {
    if (error.status >= 500 || error.status === 401) {
      console.error(
        `${req.method} ${req.originalUrl} -> ${error.status}: ${error.message}`
      );
    }

    res.status(error.status).json({
      error: error.message,
      details: error.details ?? null,
    });
    return;
  }

  console.error(`${req.method} ${req.originalUrl} -> 500`, error);
  res.status(500).json({ error: "Internal server error", details: null });
};
