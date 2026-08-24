import { Router } from "express";
import { asyncRoute, badRequest } from "../errors";
import { journalRequest } from "../journal";
import { ScheduleLesson } from "../types";

export const scheduleRouter = Router();

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const readDate = (value: unknown, name: string): string => {
  const date = String(value ?? "");

  if (!ISO_DATE.test(date)) {
    throw badRequest(`${name} должен быть в формате YYYY-MM-DD`);
  }

  return date;
};

scheduleRouter.get(
  "/month",
  asyncRoute(async (req, res) => {
    const date = readDate(req.query.date, "date");

    res.json(
      await journalRequest<ScheduleLesson[]>(req, res, "/schedule/operations/get-month", {
        method: "GET",
        params: { date_filter: date },
      })
    );
  })
);

scheduleRouter.get(
  "/day",
  asyncRoute(async (req, res) => {
    const date = readDate(req.query.date, "date");

    res.json(
      await journalRequest<ScheduleLesson[]>(req, res, "/schedule/operations/get-by-date", {
        method: "GET",
        params: { date_filter: date },
      })
    );
  })
);

scheduleRouter.get(
  "/range",
  asyncRoute(async (req, res) => {
    const start = readDate(req.query.start, "start");
    const end = readDate(req.query.end, "end");

    res.json(
      await journalRequest<ScheduleLesson[]>(
        req,
        res,
        "/schedule/operations/get-by-date-range",
        { method: "GET", params: { date_start: start, date_end: end } }
      )
    );
  })
);

scheduleRouter.get(
  "/events",
  asyncRoute(async (req, res) => {
    const date = readDate(req.query.date, "date");

    res.json(
      await journalRequest<unknown[]>(req, res, "/schedule/operations/month-events", {
        method: "GET",
        params: { date_filter: date },
      })
    );
  })
);
