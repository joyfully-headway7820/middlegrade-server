import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HttpError } from "../src/errors";
import { parseEvaluateLessonSubmitBody } from "../src/routes/evaluateLesson";

const expectBadRequest = (body: unknown, messagePart: string) => {
  assert.throws(
    () => parseEvaluateLessonSubmitBody(body),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 400);
      assert.match(error.message, new RegExp(messagePart, "i"));
      return true;
    }
  );
};

describe("parseEvaluateLessonSubmitBody", () => {
  it("rejects mark outside 1–5", () => {
    expectBadRequest(
      {
        key: "abc",
        mark_teach: 6,
        mark_lesson: 5,
        comment_teach: "",
        comment_lesson: "",
      },
      "mark_teach"
    );

    expectBadRequest(
      {
        key: "abc",
        mark_teach: 5,
        mark_lesson: 0,
        comment_teach: "",
        comment_lesson: "",
      },
      "mark_lesson"
    );
  });

  it("rejects mark ≤3 with empty comment", () => {
    expectBadRequest(
      {
        key: "abc",
        mark_teach: 2,
        mark_lesson: 5,
        comment_teach: "   ",
        comment_lesson: "",
      },
      "comment_teach"
    );

    expectBadRequest(
      {
        key: "abc",
        mark_teach: 5,
        mark_lesson: 3,
        comment_teach: "",
        comment_lesson: "",
      },
      "comment_lesson"
    );
  });

  it("accepts mark 4–5 with empty comments", () => {
    const payload = parseEvaluateLessonSubmitBody({
      key: "abc",
      mark_teach: 4,
      mark_lesson: 5,
      comment_teach: "",
      comment_lesson: "",
    });

    assert.deepEqual(payload, {
      key: "abc",
      mark_teach: 4,
      mark_lesson: 5,
      comment_teach: "",
      comment_lesson: "",
      tags_teach: [],
      tags_lesson: [],
    });
  });
});
