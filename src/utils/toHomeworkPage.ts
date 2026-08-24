import type { HomeworkItem, HomeworkListResponse, HomeworkPage } from "../types";

const JOURNAL_CHUNK = 6;

export const toHomeworkPage = (
  response: HomeworkListResponse,
  page: number,
): HomeworkPage => {
  const items: HomeworkItem[] = Array.isArray(response)
    ? response
    : (response.data ?? []);
  const meta = Array.isArray(response) ? undefined : response._meta;

  if (meta?.totalPages) {
    return {
      items,
      page: meta.currentPage ?? page,
      totalPages: meta.totalPages,
    };
  }

  return {
    items,
    page,
    totalPages: items.length >= JOURNAL_CHUNK ? page + 1 : page,
  };
};
