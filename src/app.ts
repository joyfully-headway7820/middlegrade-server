import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import express, { Express } from "express";
import { ALLOWED_ORIGINS } from "./config";
import { errorHandler, requestLogger } from "./errors";
import { authRouter } from "./routes/auth";
import { dashboardRouter } from "./routes/dashboard";
import { homeworkRouter } from "./routes/homework";
import { marketRouter } from "./routes/market";
import { paymentRouter } from "./routes/misc";
import { progressRouter } from "./routes/progress";
import { reviewsRouter } from "./routes/reviews";
import { scheduleRouter } from "./routes/schedule";

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.length === 0) {
      callback(null, true);
      return;
    }

    callback(null, ALLOWED_ORIGINS.includes(origin));
  },
  credentials: true,
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};

export const createApp = (): Express => {
  const app = express();

  app.set("trust proxy", 1);
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(cookieParser());
  app.use(requestLogger);

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/auth", authRouter);
  app.use("/dashboard", dashboardRouter);
  app.use("/progress", progressRouter);
  app.use("/schedule", scheduleRouter);
  app.use("/homework", homeworkRouter);
  app.use("/payment", paymentRouter);
  app.use("/reviews", reviewsRouter);
  app.use("/market", marketRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found", details: null });
  });

  app.use(errorHandler);

  return app;
};
