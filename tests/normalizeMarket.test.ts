import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toPurchase } from "../src/utils/normalizeMarket";

describe("toPurchase", () => {
  it("reads a Journal order list row without products", () => {
    const order = toPurchase({
      id: 513,
      student_name: "Уразаев Тимур Альбертович",
      group_name: "9/1-РПО-23/2-72",
      created_at: "2026-08-25 13:51:58",
      status: 1,
    });

    assert.deepEqual(order, {
      id: 513,
      name: "Заказ №513",
      date: "2026-08-25 13:51:58",
      photo: null,
      status: "new",
      items: [],
    });
  });

  it("reads Journal order info with the purchased products", () => {
    const photo =
      "https://fs.top-academy.ru/api/v1/files/V-6f5FsAo-meC1IkA142JpNRyCLCNCXh";

    const order = toPurchase({
      updated_at: "2026-08-25 13:51:58",
      notes: "",
      products_list: [
        {
          id: 22,
          title: "Обложка для студенческого",
          quantity: 1,
          file_name: photo,
          url: photo,
          prices: [
            { point_type_id: 1, points_sum: 473, log: null },
            { point_type_id: 2, points_sum: 490, log: null },
          ],
        },
      ],
      id: 513,
      student_name: "Уразаев Тимур Альбертович",
      group_name: "9/1-РПО-23/2-72",
      created_at: "2026-08-25 13:51:58",
      status: 1,
    });

    assert.deepEqual(order, {
      id: 513,
      name: "Обложка для студенческого",
      date: "2026-08-25 13:51:58",
      photo,
      status: "new",
      items: [
        {
          id: 22,
          name: "Обложка для студенческого",
          count: 1,
          photo,
          coins: 473,
          gems: 490,
        },
      ],
    });
  });
});
