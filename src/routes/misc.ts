import { Router } from "express";
import { asyncRoute } from "../errors";
import { journalRequest } from "../journal";
import {
  PaymentHistoryEntry,
  PaymentInfo,
  PaymentScheduleEntry,
} from "../types";

export const paymentRouter = Router();

paymentRouter.get(
  "/",
  asyncRoute(async (req, res) => {
    res.json(
      await journalRequest<PaymentInfo>(req, res, "/payment/operations/index")
    );
  })
);

paymentRouter.get(
  "/history",
  asyncRoute(async (req, res) => {
    res.json(
      await journalRequest<PaymentHistoryEntry[]>(
        req,
        res,
        "/payment/operations/history"
      )
    );
  })
);

paymentRouter.get(
  "/schedule",
  asyncRoute(async (req, res) => {
    res.json(
      await journalRequest<PaymentScheduleEntry[]>(
        req,
        res,
        "/payment/operations/schedule"
      )
    );
  })
);
