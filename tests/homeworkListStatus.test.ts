import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HttpError } from "../src/errors";
import { parseHomeworkListStatus } from "../src/utils/parseHomeworkListStatus";

const expectBadRequest = (status: unknown) => {
  assert.throws(
    () => parseHomeworkListStatus(status),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 400);
      assert.match(error.message, /0, 1, 2, 3, 5/);
      assert.doesNotMatch(error.message, /,\s*6|6,/);
      return true;
    }
  );
};

describe("parseHomeworkListStatus", () => {
  it("accepts overdue 0 and deleted 5", () => {
    assert.equal(parseHomeworkListStatus(0), 0);
    assert.equal(parseHomeworkListStatus("0"), 0);
    assert.equal(parseHomeworkListStatus(5), 5);
    assert.equal(parseHomeworkListStatus("5"), 5);
  });

  it("accepts the rest of the allowlist", () => {
    assert.equal(parseHomeworkListStatus(1), 1);
    assert.equal(parseHomeworkListStatus(2), 2);
    assert.equal(parseHomeworkListStatus(3), 3);
  });

  it("defaults to current (3) when status is omitted", () => {
    assert.equal(parseHomeworkListStatus(undefined), 3);
    assert.equal(parseHomeworkListStatus(""), 3);
  });

  it("rejects 6 and any other value before journal", () => {
    expectBadRequest(6);
    expectBadRequest("6");
    expectBadRequest(4);
    expectBadRequest("foo");
  });
});
