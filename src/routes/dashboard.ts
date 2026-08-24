import { Router } from "express";
import { asyncRoute } from "../errors";
import { getPublicTranslations, journalRequest } from "../journal";
import {
  AcademicPerformance,
  ActivityEntry,
  AttendanceStatistic,
  ChartPoint,
  LeaderboardEntry,
  LeaderboardSummary,
} from "../types";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/performance",
  asyncRoute(async (req, res) => {
    res.json(
      await journalRequest<AcademicPerformance>(
        req,
        res,
        "/dashboard/progress/academic-performance"
      )
    );
  })
);

dashboardRouter.get(
  "/attendance",
  asyncRoute(async (req, res) => {
    res.json(
      await journalRequest<AttendanceStatistic>(
        req,
        res,
        "/dashboard/progress/attendance-statistic"
      )
    );
  })
);

dashboardRouter.get(
  "/activity",
  asyncRoute(async (req, res) => {
    const [activity, translations] = await Promise.all([
      journalRequest<ActivityEntry[]>(
        req,
        res,
        "/dashboard/progress/activity"
      ),
      getPublicTranslations(),
    ]);

    const limit = Number(req.query.limit ?? 0);
    const sliced = limit > 0 ? activity.slice(0, limit) : activity;

    res.json(
      sliced.map((entry) => ({
        ...entry,
        achievements_name:
          translations[entry.achievements_name] || entry.achievements_name,
        point_types_name:
          translations[entry.point_types_name] || entry.point_types_name,
      }))
    );
  })
);

dashboardRouter.get(
  "/charts/:kind",
  asyncRoute(async (req, res) => {
    const map: Record<string, string> = {
      "average-progress": "/dashboard/chart/average-progress",
      attendance: "/dashboard/chart/attendance",
      progress: "/dashboard/chart/progress",
    };

    const path = map[req.params.kind ?? ""];

    if (!path) {
      res.status(404).json({ error: "Unknown chart", details: null });
      return;
    }

    res.json(await journalRequest<ChartPoint[]>(req, res, path));
  })
);

dashboardRouter.get(
  "/leaders/:scope",
  asyncRoute(async (req, res) => {
    const scope = req.params.scope === "stream" ? "stream" : "group";

    const [rawEntries, summary] = await Promise.all([
      journalRequest<Array<LeaderboardEntry | null>>(
        req,
        res,
        `/dashboard/progress/leader-${scope}`
      ),
      journalRequest<LeaderboardSummary>(
        req,
        res,
        `/dashboard/progress/leader-${scope}-points`
      ),
    ]);

    const entries = rawEntries.filter(
      (entry): entry is LeaderboardEntry =>
        entry != null &&
        typeof entry.id === "number" &&
        typeof entry.full_name === "string" &&
        entry.full_name.trim().length > 0
    );

    res.json({ entries, summary });
  })
);
