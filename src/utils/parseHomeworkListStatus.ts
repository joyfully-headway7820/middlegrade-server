import { badRequest } from "../errors";

const HOMEWORK_LIST_STATUSES = new Set([0, 1, 2, 3, 5]);
const DEFAULT_HOMEWORK_LIST_STATUS = 3;
const ALLOWLIST_TEXT = "0, 1, 2, 3, 5";

export const parseHomeworkListStatus = (status: unknown): number => {
  if (status === undefined || status === "") {
    return DEFAULT_HOMEWORK_LIST_STATUS;
  }

  const value = Number(status);

  if (!HOMEWORK_LIST_STATUSES.has(value)) {
    throw badRequest(`status должен быть одним из ${ALLOWLIST_TEXT}`);
  }

  return value;
};
