import { Router } from "express";
import multer from "multer";
import { asyncRoute, badRequest } from "../errors";
import { journalRequest } from "../journal";
import { HomeworkGroup, HomeworkListResponse } from "../types";
import { buildHomeworkCreateFormData } from "../utils/buildHomeworkCreateFormData";
import { parseHomeworkCreateInput } from "../utils/parseHomeworkCreateInput";
import { parseHomeworkDeleteId } from "../utils/parseHomeworkDeleteId";
import { parseHomeworkListStatus } from "../utils/parseHomeworkListStatus";
import { parseHomeworkListSubject } from "../utils/parseHomeworkListSubject";
import { toHomeworkPage } from "../utils/toHomeworkPage";

export const homeworkRouter = Router();

const upload = multer({ storage: multer.memoryStorage() });

/**
 * status: 0 — просрочено, 1 — проверено, 2 — на проверке, 3 — текущие, 5 — удалено
 * type:   0 — домашние задания, 1 — лабораторные работы
 */
const TYPES = new Set([0, 1]);

homeworkRouter.get(
  "/counts",
  asyncRoute(async (req, res) => {
    const groupId = Number(req.query.groupId);
    const type = Number(req.query.type ?? 0);

    if (!Number.isInteger(groupId) || groupId <= 0)
      throw badRequest("groupId обязателен");

    if (!TYPES.has(type))
      throw badRequest("type должен быть 0 (ДЗ) или 1 (лабораторные)");

    const raw = await journalRequest<unknown>(req, res, "/count/homework", {
      method: "GET",
      params: { type, group_id: groupId },
    });
    res.json(Array.isArray(raw) ? raw : []);
  })
);

homeworkRouter.get(
  "/groups",
  asyncRoute(async (req, res) => {
    res.json(
      await journalRequest<HomeworkGroup[]>(req, res, "/homework/settings/group-history")
    );
  })
);

homeworkRouter.get(
  "/",
  asyncRoute(async (req, res) => {
    const groupId = Number(req.query.groupId);
    const type = Number(req.query.type ?? 0);
    const page = Number(req.query.page ?? 1);

    if (!Number.isInteger(groupId) || groupId <= 0) {
      throw badRequest("groupId обязателен");
    }

    const status = parseHomeworkListStatus(req.query.status);
    const subject = parseHomeworkListSubject(
      req.query.subjectSource,
      req.query.subjectId,
    );

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
          ...subject,
        },
      }
    );

    res.json(toHomeworkPage(response, page));
  })
);

homeworkRouter.post(
  "/operations/create",
  upload.single("file"),
  asyncRoute(async (req, res) => {
    const fields =
      req.body !== null && typeof req.body === "object" && !Array.isArray(req.body)
        ? (req.body as Record<string, unknown>)
        : {};
    const parsed = parseHomeworkCreateInput(
      fields,
      req.file
        ? {
            originalname: req.file.originalname,
            buffer: req.file.buffer,
            mimetype: req.file.mimetype,
          }
        : undefined
    );

    const data = await journalRequest<unknown>(
      req,
      res,
      "/homework/operations/create",
      {
        method: "POST",
        data: buildHomeworkCreateFormData(parsed),
      }
    );

    res.json(data);
  })
);

homeworkRouter.post(
  "/operations/delete",
  asyncRoute(async (req, res) => {
    const id = parseHomeworkDeleteId(req.body?.id);

    await journalRequest(req, res, "/homework/operations/delete", {
      method: "POST",
      data: { id },
    });

    res.status(204).send();
  })
);
