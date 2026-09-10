import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildHomeworkCreateFormData } from "../src/utils/buildHomeworkCreateFormData";
import type { ParsedHomeworkCreateInput } from "../src/utils/parseHomeworkCreateInput";

describe("buildHomeworkCreateFormData", () => {
  it("always sends assignment id and spentTime 13:37", () => {
    const parsed: ParsedHomeworkCreateInput = {
      homeworkId: 10,
      answerText: "hello world",
      spentTimeHour: 13,
      spentTimeMin: 37,
    };
    const form = buildHomeworkCreateFormData(parsed);

    assert.equal(form.get("id"), "10");
    assert.equal(form.get("answerText"), "hello world");
    assert.equal(form.get("spentTimeHour"), "13");
    assert.equal(form.get("spentTimeMin"), "37");
    assert.equal(form.get("file"), null);
  });

  it("appends the file when present", () => {
    const parsed: ParsedHomeworkCreateInput = {
      homeworkId: 7,
      spentTimeHour: 13,
      spentTimeMin: 37,
      file: {
        originalname: "work.zip",
        buffer: Buffer.from("payload"),
        mimetype: "application/zip",
      },
    };
    const form = buildHomeworkCreateFormData(parsed);
    const uploaded = form.get("file");

    assert.ok(uploaded instanceof File);
    assert.equal((uploaded as File).name, "work.zip");
    assert.equal(form.get("answerText"), null);
  });
});
