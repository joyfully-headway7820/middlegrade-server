import { badRequest } from "../errors";

const FORBIDDEN_EXTENSIONS = /\.(txt|csv)$/i;
const MIN_ANSWER_LENGTH = 5;
const MAX_ANSWER_LENGTH = 500;

export type HomeworkCreateFile = {
  originalname: string;
  buffer: Buffer;
  mimetype?: string;
};

export type ParsedHomeworkCreateInput = {
  homeworkId: number;
  answerText?: string;
  file?: HomeworkCreateFile;
  spentTimeHour: 13;
  spentTimeMin: 37;
};

const parseHomeworkId = (raw: unknown): number => {
  if (typeof raw === "number" && Number.isInteger(raw) && raw > 0)
    return raw;

  if (typeof raw === "string" && /^\d+$/.test(raw)) {
    const id = Number(raw);

    if (id > 0)
      return id;
  }

  throw badRequest("id задания обязателен");
};

const assertAllowedFile = (file: HomeworkCreateFile) => {
  if (FORBIDDEN_EXTENSIONS.test(file.originalname)) {
    throw badRequest("Файлы .txt и .csv не поддерживаются");
  }
};

export const parseHomeworkCreateInput = (
  fields: Record<string, unknown>,
  file?: HomeworkCreateFile
): ParsedHomeworkCreateInput => {
  const homeworkId = parseHomeworkId(fields.id);
  const rawText = Array.isArray(fields.answerText)
    ? fields.answerText[0]
    : fields.answerText;
  const trimmedText = typeof rawText === "string" ? rawText.trim() : "";

  if (file) {
    assertAllowedFile(file);
  }

  if (trimmedText.length > 0) {
    if (trimmedText.length < MIN_ANSWER_LENGTH) {
      throw badRequest("answerText должен быть от 5 до 500 символов");
    }

    if (trimmedText.length > MAX_ANSWER_LENGTH) {
      throw badRequest("answerText должен быть от 5 до 500 символов");
    }
  }

  if (!file && trimmedText.length === 0) {
    throw badRequest("Нужен файл или текст ответа от 5 символов");
  }

  return {
    homeworkId,
    ...(trimmedText.length > 0 ? { answerText: trimmedText } : {}),
    ...(file ? { file } : {}),
    spentTimeHour: 13,
    spentTimeMin: 37,
  };
};
