import { badRequest } from "../errors";

const HOMEWORK_LIST_STATUSES = new Set([0, 1, 2, 3, 5]);
const HOMEWORK_LIST_STATUS_STRINGS = new Set(
  [...HOMEWORK_LIST_STATUSES].map(String)
);
const DEFAULT_HOMEWORK_LIST_STATUS = 3;
const ALLOWLIST_TEXT = [...HOMEWORK_LIST_STATUSES].join(", ");

export const parseHomeworkListStatus = (status: unknown): number => {
  if (status === undefined || status === "") {
    return DEFAULT_HOMEWORK_LIST_STATUS;
  }

  if (
    typeof status === "number" &&
    Number.isInteger(status) &&
    HOMEWORK_LIST_STATUSES.has(status)
  ) {
    return status;
  }

  if (typeof status === "string" && HOMEWORK_LIST_STATUS_STRINGS.has(status)) {
    return Number(status);
  }

  throw badRequest(`status должен быть одним из ${ALLOWLIST_TEXT}`);
};
