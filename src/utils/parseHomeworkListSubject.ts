import { badRequest } from "../errors";

export type HomeworkListSubject = {
  subject_source: number;
  subject_id: number;
};

const isMissing = (value: unknown) => value === undefined || value === "";

const parsePositiveInt = (value: unknown) => {
  if (typeof value === "number" && Number.isInteger(value) && value > 0)
    return value;

  if (typeof value === "string" && /^\d+$/.test(value)) {
    const parsed = Number(value);
    if (parsed > 0) return parsed;
  }

  return null;
};

export const parseHomeworkListSubject = (
  source: unknown,
  id: unknown,
): HomeworkListSubject | undefined => {
  if (isMissing(source) && isMissing(id)) return undefined;

  if (isMissing(source) || isMissing(id))
    throw badRequest("subjectSource и subjectId нужно передавать вместе");

  const subject_source = parsePositiveInt(source);
  const subject_id = parsePositiveInt(id);

  if (subject_source === null || subject_id === null)
    throw badRequest("subjectSource и subjectId должны быть положительными целыми");

  return { subject_source, subject_id };
};
