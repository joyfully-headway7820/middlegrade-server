export type MarketProduct = {
  id: number;
  name: string;
  description: string | null;
  photo: string | null;
  stock: number | null;
  coins: number;
  gems: number;
};

export type MarketOrderStatus = "new" | "rejected" | "closed" | "unknown";

export type MarketPurchaseItem = {
  id: number;
  name: string;
  count: number;
  photo: string | null;
  coins: number;
  gems: number;
};

export type MarketPurchase = {
  id: number;
  name: string;
  date: string | null;
  photo: string | null;
  status: MarketOrderStatus;
  cancellable: boolean;
  items: MarketPurchaseItem[];
};

const POINT_DIAMOND = 1;
const POINT_COIN = 2;
const ORDER_NEW = 1;
const ORDER_REJECTED = 2;
const ORDER_CLOSED = 3;

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

const toOrderStatus = (value: number | null): MarketOrderStatus => {
  if (value === ORDER_NEW) {
    return "new";
  }

  if (value === ORDER_REJECTED) {
    return "rejected";
  }

  if (value === ORDER_CLOSED) {
    return "closed";
  }

  return "unknown";
};

const unwrapOrder = (value: unknown): Record<string, unknown> | null => {
  if (!isRecord(value)) {
    return null;
  }

  if (
    isRecord(value.data) &&
    asNumber(value.data.id ?? value.data.order_id) !== null
  ) {
    return value.data;
  }

  return value;
};

const toPurchaseItem = (value: unknown): MarketPurchaseItem | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = asNumber(value.id ?? value.product_id ?? value.good_id);
  const name =
    asString(value.name) ??
    asString(value.title) ??
    asString(value.product_name);

  if (id === null || !name) {
    return null;
  }

  return {
    id,
    name,
    count: asNumber(value.quantity ?? value.count ?? value.amount) ?? 1,
    photo: asString(
      value.url ??
        value.photo ??
        value.image ??
        value.image_path ??
        value.cover_image
    ),
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

const purchaseTitle = (
  id: number,
  items: MarketPurchaseItem[],
  fallback: string | null
): string => {
  if (items.length > 0) {
    return items
      .map((item) => (item.count > 1 ? `${item.name} ×${item.count}` : item.name))
      .join(", ");
  }

  return fallback ?? `Заказ №${id}`;
};

export const toPurchase = (value: unknown): MarketPurchase | null => {
  const order = unwrapOrder(value);

  if (!order) {
    return null;
  }

  const id = asNumber(order.id ?? order.product_id ?? order.order_id);

  if (id === null) {
    return null;
  }

  const items = (
    Array.isArray(order.products_list)
      ? order.products_list
      : Array.isArray(order.items)
        ? order.items
        : Array.isArray(order.cart_items)
          ? order.cart_items
          : []
  )
    .map(toPurchaseItem)
    .filter((item): item is MarketPurchaseItem => item !== null);

  const status = toOrderStatus(asNumber(order.status));
  const fallbackName =
    asString(order.name) ??
    asString(order.title) ??
    asString(order.product_name);

  return {
    id,
    name: purchaseTitle(id, items, fallbackName),
    date: asString(order.date ?? order.created_at ?? order.purchase_date),
    photo:
      asString(order.photo ?? order.image ?? order.image_path ?? order.url) ??
      items[0]?.photo ??
      null,
    status,
    cancellable: status === "new",
    items,
  };
};
