import { Router } from "express";
import { asyncRoute, badRequest } from "../errors";
import { journalRequest } from "../journal";
import {
  EvaluateLessonQueueItem,
  EvaluateLessonSubmitBody,
} from "../types";
import { unwrapList } from "../utils/normalizeMarket";

const isMark = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;

export const parseEvaluateLessonSubmitBody = (
  body: unknown
): EvaluateLessonSubmitBody => {
  const raw = body as Record<string, unknown> | null | undefined;
  const key = raw?.key;

  if (typeof key !== "string" || !key.trim()) {
    throw badRequest("key обязателен");
  }

  const mark_teach = raw?.mark_teach;
  const mark_lesson = raw?.mark_lesson;

  if (!isMark(mark_teach)) {
    throw badRequest("mark_teach должен быть целым числом от 1 до 5");
  }

  if (!isMark(mark_lesson)) {
    throw badRequest("mark_lesson должен быть целым числом от 1 до 5");
  }

  const comment_teach =
    typeof raw?.comment_teach === "string" ? raw.comment_teach : "";
  const comment_lesson =
    typeof raw?.comment_lesson === "string" ? raw.comment_lesson : "";

  if (mark_teach <= 3 && !comment_teach.trim()) {
    throw badRequest("comment_teach обязателен при оценке преподавателя 3 и ниже");
  }

  if (mark_lesson <= 3 && !comment_lesson.trim()) {
    throw badRequest("comment_lesson обязателен при оценке занятия 3 и ниже");
  }

  return {
    key,
    mark_teach,
    mark_lesson,
    comment_teach,
    comment_lesson,
    tags_teach: [],
    tags_lesson: [],
  };
};

export const evaluateLessonRouter = Router();

evaluateLessonRouter.get(
  "/list",
  asyncRoute(async (req, res) => {
    const raw = await journalRequest<unknown>(
      req,
      res,
      "/feedback/students/evaluate-lesson-list"
    );
    const list = (
      Array.isArray(raw) ? raw : unwrapList(raw)
    ) as EvaluateLessonQueueItem[];
    res.json(list);
  })
);

evaluateLessonRouter.post(
  "/",
  asyncRoute(async (req, res) => {
    const payload = parseEvaluateLessonSubmitBody(req.body);

    await journalRequest<unknown>(req, res, "/feedback/students/evaluate-lesson", {
      method: "POST",
      data: payload,
    });

    res.json({ ok: true });
  })
);
