import { Router } from "express";
import { asyncRoute, badRequest } from "../errors";
import { journalRequest } from "../journal";
import { HomeworkListResponse, UserGroup } from "../types";
import { toHomeworkPage } from "../utils/toHomeworkPage";

export const homeworkRouter = Router();

/**
 * status: 1 — проверено, 2 — на проверке, 3 — текущие, 5 — удалено, 6 — просрочено
 * type:   0 — домашние задания, 1 — лабораторные работы
 */
const STATUSES = new Set([1, 2, 3, 5, 6]);
const ACTIVE_STATUS = 3;
const TYPES = new Set([0, 1]);

homeworkRouter.get(
  "/counts",
  asyncRoute(async (req, res) => {
    const raw = await journalRequest<unknown>(req, res, "/count/homework");
    res.json(Array.isArray(raw) ? raw : []);
  })
);

homeworkRouter.get(
  "/groups",
  asyncRoute(async (req, res) => {
    res.json(
      await journalRequest<UserGroup[]>(req, res, "/homework/settings/group-history")
    );
  })
);

homeworkRouter.get(
  "/",
  asyncRoute(async (req, res) => {
    const groupId = Number(req.query.groupId);
    const status = Number(req.query.status ?? ACTIVE_STATUS);
    const type = Number(req.query.type ?? 0);
    const page = Number(req.query.page ?? 1);

    if (!Number.isInteger(groupId) || groupId <= 0) {
      throw badRequest("groupId обязателен");
    }

    if (!STATUSES.has(status)) {
      throw badRequest("status должен быть одним из 1, 2, 3, 5, 6");
    }

    if (!TYPES.has(type)) {
      throw badRequest("type должен быть 0 (ДЗ) или 1 (лабораторные)");
    }

    if (!Number.isInteger(page) || page <= 0) {
      throw badRequest("page должен быть положительным числом");
    }

    const response = await journalRequest<HomeworkListResponse>(
      req,
      res,
      "/homework/operations/list",
      {
        method: "GET",
        params: {
          page,
          status,
          type,
          group_id: groupId,
        },
      }
    );

    res.json(toHomeworkPage(response, page));
  })
);
