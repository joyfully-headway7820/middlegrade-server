import { Router } from "express";
import { asyncRoute, badRequest, unauthorized } from "../errors";
import { createSession, journalRequest, journalWithSession } from "../journal";
import { clearSession, readSession, writeSession } from "../session";
import { UserInfo } from "../types";

export const authRouter = Router();

authRouter.post(
  "/login",
  asyncRoute(async (req, res) => {
    const username = String(req.body?.username ?? "").trim();
    const password = String(req.body?.password ?? "").trim();

    if (!username || !password) {
      throw badRequest("username и password обязательны");
    }

    const session = await createSession(username, password);
    writeSession(res, session);

    const user = await journalWithSession<UserInfo>(
      session,
      res,
      "/settings/user-info"
    );

    res.json({ user });
  })
);

authRouter.post("/logout", (_req, res) => {
  clearSession(res);
  res.status(204).end();
});

authRouter.get(
  "/me",
  asyncRoute(async (req, res) => {
    if (!readSession(req)) {
      throw unauthorized();
    }

    const user = await journalRequest<UserInfo>(req, res, "/settings/user-info");

    res.json({ user });
  })
);
