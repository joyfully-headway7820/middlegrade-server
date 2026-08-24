import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { HomeworkItem } from "../src/types";
import { toHomeworkPage } from "../src/utils/toHomeworkPage";

const item = (id: number): HomeworkItem => ({
  id,
  id_spec: 0,
  id_teach: 0,
  id_group: 0,
  fio_teach: "",
  theme: "",
  completion_time: "",
  creation_time: "",
  overdue_time: "",
  filename: null,
  file_path: "",
  comment: "",
  name_spec: "",
  status: 1,
  common_status: null,
  cover_image: null,
  homework_stud: null,
  homework_comment: null,
});

describe("toHomeworkPage", () => {
  it("uses journal meta when the envelope has totalPages", () => {
    const result = toHomeworkPage(
      { data: [item(1)], _meta: { currentPage: 2, totalPages: 9 } },
      1,
    );

    assert.equal(result.page, 2);
    assert.equal(result.totalPages, 9);
    assert.equal(result.items.length, 1);
  });

  it("opens a next page when journal returns a full 6-item chunk", () => {
    const result = toHomeworkPage(
      Array.from({ length: 6 }, (_, index) => item(index + 1)),
      1,
    );

    assert.equal(result.page, 1);
    assert.equal(result.totalPages, 2);
    assert.equal(result.items.length, 6);
  });

  it("treats a short chunk as the last page", () => {
    const result = toHomeworkPage([item(1)], 4);

    assert.equal(result.page, 4);
    assert.equal(result.totalPages, 4);
  });
});
