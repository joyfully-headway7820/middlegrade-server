import type { ParsedHomeworkCreateInput } from "./parseHomeworkCreateInput";

export const buildHomeworkCreateFormData = (
  parsed: ParsedHomeworkCreateInput
): FormData => {
  const form = new FormData();

  form.append("id", String(parsed.homeworkId));
  form.append("spentTimeHour", String(parsed.spentTimeHour));
  form.append("spentTimeMin", String(parsed.spentTimeMin));

  if (parsed.answerText)
    form.append("answerText", parsed.answerText);

  if (parsed.file) {
    form.append(
      "file",
      new Blob(
        [new Uint8Array(parsed.file.buffer)],
        parsed.file.mimetype ? { type: parsed.file.mimetype } : undefined
      ),
      parsed.file.originalname
    );
  }

  return form;
};
