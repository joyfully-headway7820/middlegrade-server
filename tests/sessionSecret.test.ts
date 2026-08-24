import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import {
  FALLBACK_SESSION_SECRET,
  resolveSessionSecret,
} from "../src/sessionSecret";

describe("resolveSessionSecret", () => {
  it("returns the provided secret", () => {
    assert.equal(resolveSessionSecret("abc", true), "abc");
  });

  it("falls back when the secret is missing in production", () => {
    const error = mock.method(console, "error");

    try {
      assert.equal(
        resolveSessionSecret(undefined, true),
        FALLBACK_SESSION_SECRET
      );
      assert.equal(error.mock.callCount(), 1);
    } finally {
      error.mock.restore();
    }
  });

  it("treats an empty string as missing", () => {
    const error = mock.method(console, "error");

    try {
      assert.equal(resolveSessionSecret("", true), FALLBACK_SESSION_SECRET);
      assert.equal(error.mock.callCount(), 1);
    } finally {
      error.mock.restore();
    }
  });

  it("falls back silently in development", () => {
    const error = mock.method(console, "error");

    try {
      assert.equal(
        resolveSessionSecret(undefined, false),
        FALLBACK_SESSION_SECRET
      );
      assert.equal(error.mock.callCount(), 0);
    } finally {
      error.mock.restore();
    }
  });
});
