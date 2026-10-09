import { badRequest } from "../errors";

const MIN_COMMENT_LENGTH = 20;
const MAX_COMMENT_LENGTH = 500;

export const normalizeEvaluateComment = (
  comment: string,
  required: boolean,
  field: "comment_teach" | "comment_lesson",
) => {
  const trimmed = comment.trim();

  if (!trimmed) {
    if (required) {
      throw badRequest(
        field === "comment_teach"
          ? "comment_teach обязателен при оценке преподавателя 3 и ниже"
          : "comment_lesson обязателен при оценке занятия 3 и ниже",
      );
    }

    return "";
  }

  if (trimmed.length < MIN_COMMENT_LENGTH || trimmed.length > MAX_COMMENT_LENGTH) {
    throw badRequest(
      field === "comment_teach"
        ? "Комментарий к преподавателю должен быть от 20 до 500 символов"
        : "Комментарий к занятию должен быть от 20 до 500 символов",
    );
  }

  return trimmed;
};
