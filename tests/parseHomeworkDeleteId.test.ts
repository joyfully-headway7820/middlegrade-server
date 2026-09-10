import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HttpError } from "../src/errors";
import { parseHomeworkDeleteId } from "../src/utils/parseHomeworkDeleteId";

const expectBadRequest = (raw: unknown) => {
  assert.throws(
    () => parseHomeworkDeleteId(raw),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 400);
      return true;
    }
  );
};

describe("parseHomeworkDeleteId", () => {
  it("accepts positive integers", () => {
    assert.equal(parseHomeworkDeleteId(77), 77);
    assert.equal(parseHomeworkDeleteId("42"), 42);
  });

  it("rejects empty, zero and non-numeric values", () => {
    expectBadRequest(undefined);
    expectBadRequest("");
    expectBadRequest(0);
    expectBadRequest("0");
    expectBadRequest("foo");
    expectBadRequest(true);
    expectBadRequest([77]);
  });
});
