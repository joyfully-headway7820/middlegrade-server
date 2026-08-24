import { Router } from "express";
import { asyncRoute } from "../errors";
import { journalRequest } from "../journal";
import { StudentReview } from "../types";
import { unwrapList } from "../utils/normalizeMarket";

export const reviewsRouter = Router();

reviewsRouter.get(
  "/",
  asyncRoute(async (req, res) => {
    const raw = await journalRequest<unknown>(req, res, "/reviews/index/list");
    const list = (Array.isArray(raw) ? raw : unwrapList(raw)) as StudentReview[];
    res.json(list);
  })
);
