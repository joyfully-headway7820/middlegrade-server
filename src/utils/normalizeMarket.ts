export type MarketProduct = {
  id: number;
  name: string;
  description: string | null;
  photo: string | null;
  stock: number | null;
  coins: number;
  gems: number;
};

export type MarketPurchase = {
  id: number;
  name: string;
  date: string | null;
  photo: string | null;
};

const POINT_DIAMOND = 1;
const POINT_COIN = 2;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const asString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value : null;

const priceByType = (prices: unknown, typeId: number): number | null => {
  if (!Array.isArray(prices)) {
    return null;
  }

  for (const entry of prices) {
    if (!isRecord(entry)) {
      continue;
    }

    if (asNumber(entry.point_type_id) === typeId) {
      return asNumber(entry.points_sum ?? entry.points) ?? 0;
    }
  }

  return null;
};

export const unwrapList = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  const nested =
    payload.products_list ??
    payload.orders_list ??
    payload.data ??
    payload.items ??
    payload.products ??
    payload.goods ??
    payload.list;

  if (Array.isArray(nested)) {
    return nested;
  }

  if (isRecord(nested) && nested !== payload) {
    return unwrapList(nested);
  }

  return [];
};

export const totalCountOf = (payload: unknown): number | null => {
  if (!isRecord(payload)) {
    return null;
  }

  return (
    asNumber(payload.total_count) ??
    (isRecord(payload.data) ? asNumber(payload.data.total_count) : null)
  );
};

export const pageCountOf = (
  totalCount: number | null,
  received: number
): number => {
  if (totalCount === null || totalCount <= 0 || received <= 0) {
    return 1;
  }

  if (totalCount > received) {
    return Math.ceil(totalCount / received);
  }

  return totalCount;
};

export const toProduct = (value: unknown): MarketProduct | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = asNumber(value.id ?? value.product_id ?? value.good_id);

  if (id === null) {
    return null;
  }

  const name =
    asString(value.name) ??
    asString(value.title) ??
    asString(value.product_name);

  if (!name) {
    return null;
  }

  return {
    id,
    name,
    description: asString(value.description ?? value.comment ?? value.text),
    photo: asString(
      value.url ??
        value.photo ??
        value.image ??
        value.image_path ??
        value.cover_image
    ),
    stock: asNumber(value.quantity ?? value.stock ?? value.available ?? value.count),
    coins:
      priceByType(value.prices, POINT_DIAMOND) ??
      asNumber(value.price_coin ?? value.coins ?? value.price_coins) ??
      0,
    gems:
      priceByType(value.prices, POINT_COIN) ??
      asNumber(value.price_diamond ?? value.gems ?? value.price_gems) ??
      0,
  };
};

export const toPurchase = (value: unknown): MarketPurchase | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = asNumber(value.id ?? value.product_id ?? value.order_id);

  if (id === null) {
    return null;
  }

  const name =
    asString(value.name) ??
    asString(value.title) ??
    asString(value.product_name) ??
    `Заказ №${id}`;

  return {
    id,
    name,
    date: asString(value.date ?? value.created_at ?? value.purchase_date),
    photo: asString(value.photo ?? value.image ?? value.image_path ?? value.url),
  };
};
