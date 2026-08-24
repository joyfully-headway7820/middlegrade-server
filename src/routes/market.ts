import { Request, Response, Router } from "express";
import { asyncRoute, badRequest, HttpError } from "../errors";
import { journalRequest } from "../journal";
import {
  pageCountOf,
  toProduct,
  toPurchase,
  totalCountOf,
  unwrapList,
  MarketProduct,
  MarketPurchase,
} from "../utils/normalizeMarket";

export const marketRouter = Router();

const PRODUCT = 0;
const PROMO = 1;
const MAX_PAGES = 20;

const BUY_ERRORS: Record<number, string> = {
  5000: "Недостаточно товара",
  5001: "Недостаточно средств",
  5002: "Не удалось оформить заказ",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const mapItems = <T>(
  payload: unknown,
  map: (value: unknown) => T | null
): T[] =>
  unwrapList(payload)
    .map(map)
    .filter((item): item is T => item !== null);

const uniqueById = (items: MarketProduct[]): MarketProduct[] => {
  const byId = new Map<number, MarketProduct>();

  for (const item of items) {
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  }

  return [...byId.values()];
};

const collectPages = async <T>(
  req: Request,
  res: Response,
  path: string,
  map: (value: unknown) => T | null,
  params: Record<string, number>
): Promise<T[]> => {
  const collected: T[] = [];
  let totalPages = 1;

  for (let page = 1; page <= totalPages && page <= MAX_PAGES; page += 1) {
    const raw = await journalRequest<unknown>(req, res, path, {
      method: "GET",
      params: { ...params, page },
    });
    const batch = mapItems(raw, map);
    collected.push(...batch);

    if (page === 1) {
      totalPages = pageCountOf(totalCountOf(raw), batch.length);
    }

    if (batch.length === 0) {
      break;
    }
  }

  return collected;
};

const buyErrorCode = (details: unknown): number | null => {
  if (!isRecord(details)) {
    return null;
  }

  if (typeof details.code === "number") {
    return details.code;
  }

  if (isRecord(details.error) && typeof details.error.code === "number") {
    return details.error.code;
  }

  return null;
};

const buyMessage = (error: HttpError): string => {
  const code = buyErrorCode(error.details);
  return (code !== null ? BUY_ERRORS[code] : undefined) ?? error.message;
};

marketRouter.get(
  "/",
  asyncRoute(async (req, res) => {
    const [products, promos, purchases] = await Promise.all([
      collectPages(
        req,
        res,
        "/market/customer/product/list",
        toProduct,
        { type: PRODUCT }
      ),
      collectPages(
        req,
        res,
        "/market/customer/product/list",
        toProduct,
        { type: PROMO }
      ).catch((error: unknown) => {
        if (error instanceof HttpError && (error.status === 404 || error.status === 422)) {
          return [] as MarketProduct[];
        }

        throw error;
      }),
      collectPages(
        req,
        res,
        "/market/customer/order/list",
        toPurchase,
        {}
      ).catch((error: unknown) => {
        if (error instanceof HttpError && (error.status === 404 || error.status === 422)) {
          return [] as MarketPurchase[];
        }

        throw error;
      }),
    ]);

    const items = uniqueById([...products, ...promos]);
    const orders = [...purchases].sort((left, right) =>
      (right.date ?? "").localeCompare(left.date ?? "")
    );

    res.json({ items, purchases: orders });
  })
);

marketRouter.post(
  "/buy",
  asyncRoute(async (req, res) => {
    const productId = Number(req.body?.productId ?? req.body?.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      throw badRequest("productId обязателен");
    }

    try {
      await journalRequest<unknown>(req, res, "/market/customer/order/create", {
        method: "POST",
        data: {
          cart: {
            notes: "",
            cart_items: [{ id: productId, count: 1 }],
          },
        },
      });
    } catch (error) {
      const httpError =
        error instanceof HttpError
          ? error
          : new HttpError(502, "Journal API request failed");

      throw new HttpError(httpError.status, buyMessage(httpError), httpError.details);
    }

    res.json({ ok: true });
  })
);
