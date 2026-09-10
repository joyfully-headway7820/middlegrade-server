import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HttpError } from "../src/errors";
import {
  parseHomeworkCreateInput,
  type HomeworkCreateFile,
} from "../src/utils/parseHomeworkCreateInput";

const file = (name: string): HomeworkCreateFile => ({
  originalname: name,
  buffer: Buffer.from("payload"),
});

const expectBadRequest = (run: () => void) => {
  assert.throws(run, (error: unknown) => {
    assert.ok(error instanceof HttpError);
    assert.equal(error.status, 400);
    return true;
  });
};

describe("parseHomeworkCreateInput", () => {
  it("rejects empty submission without file or text", () => {
    expectBadRequest(() => parseHomeworkCreateInput({ id: "10" }));
    expectBadRequest(() => parseHomeworkCreateInput({ id: "10", answerText: "" }));
    expectBadRequest(() => parseHomeworkCreateInput({ id: "10", answerText: "    " }));
    expectBadRequest(() => parseHomeworkCreateInput({ id: "10", answerText: "1234" }));
  });

  it("rejects txt and csv files case-insensitively", () => {
    expectBadRequest(() =>
      parseHomeworkCreateInput({ id: "10" }, file("notes.txt"))
    );
    expectBadRequest(() =>
      parseHomeworkCreateInput({ id: "10" }, file("data.TXT"))
    );
    expectBadRequest(() =>
      parseHomeworkCreateInput({ id: "10" }, file("sheet.csv"))
    );
  });

  it("accepts valid text between 5 and 500 characters", () => {
    const parsed = parseHomeworkCreateInput({
      id: "10",
      answerText: "  hello world  ",
    });

    assert.equal(parsed.homeworkId, 10);
    assert.equal(parsed.answerText, "hello world");
    assert.equal(parsed.spentTimeHour, 13);
    assert.equal(parsed.spentTimeMin, 37);
    assert.equal(parsed.file, undefined);

    const atLimit = parseHomeworkCreateInput({
      id: "10",
      answerText: "a".repeat(500),
    });

    assert.equal(atLimit.answerText?.length, 500);
    expectBadRequest(() =>
      parseHomeworkCreateInput({ id: "10", answerText: "a".repeat(501) })
    );
  });

  it("accepts file with optional valid text", () => {
    const parsed = parseHomeworkCreateInput(
      { id: 7, answerText: "answer text" },
      file("work.zip")
    );

    assert.equal(parsed.homeworkId, 7);
    assert.equal(parsed.answerText, "answer text");
    assert.equal(parsed.file?.originalname, "work.zip");
  });

  it("accepts a file without text", () => {
    const parsed = parseHomeworkCreateInput({ id: "10" }, file("work.zip"));

    assert.equal(parsed.homeworkId, 10);
    assert.equal(parsed.answerText, undefined);
    assert.equal(parsed.file?.originalname, "work.zip");
  });

  it("reads the first answerText when multer yields an array", () => {
    const parsed = parseHomeworkCreateInput({
      id: "10",
      answerText: ["hello world", "ignored"],
    });

    assert.equal(parsed.answerText, "hello world");
  });

  it("forces spentTime 13:37 even if the client sent other values", () => {
    const parsed = parseHomeworkCreateInput({
      id: "10",
      answerText: "hello world",
      spentTimeHour: 1,
      spentTimeMin: 99,
    });

    assert.equal(parsed.spentTimeHour, 13);
    assert.equal(parsed.spentTimeMin, 37);
  });

  it("rejects invalid homework id", () => {
    expectBadRequest(() => parseHomeworkCreateInput({ id: "0" }));
    expectBadRequest(() => parseHomeworkCreateInput({ id: "foo" }));
    expectBadRequest(() => parseHomeworkCreateInput({ id: "" }));
    expectBadRequest(() => parseHomeworkCreateInput({ id: true }));
    expectBadRequest(() => parseHomeworkCreateInput({ id: [10] }));
  });
});
