import { badRequest } from "../errors";

export const parseHomeworkDeleteId = (raw: unknown): number => {
  if (typeof raw === "number" && Number.isInteger(raw) && raw > 0)
    return raw;

  if (typeof raw === "string" && /^\d+$/.test(raw)) {
    const id = Number(raw);

    if (id > 0)
      return id;
  }

  throw badRequest("id сдачи обязателен");
};
