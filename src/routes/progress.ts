import { Router } from "express";
import { asyncRoute } from "../errors";
import { journalRequest } from "../journal";
import { QuarterlyGrades, StudentExam, StudentVisit } from "../types";

export const progressRouter = Router();

progressRouter.get(
  "/marks",
  asyncRoute(async (req, res) => {
    res.json(
      await journalRequest<StudentVisit[]>(
        req,
        res,
        "/progress/operations/student-visits"
      )
    );
  })
);

progressRouter.get(
  "/exams",
  asyncRoute(async (req, res) => {
    res.json(
      await journalRequest<StudentExam[]>(
        req,
        res,
        "/progress/operations/student-exams"
      )
    );
  })
);

progressRouter.get(
  "/quarterly",
  asyncRoute(async (req, res) => {
    res.json(
      await journalRequest<QuarterlyGrades>(
        req,
        res,
        "/progress/operations/school-quarterly-grades"
      )
    );
  })
);
