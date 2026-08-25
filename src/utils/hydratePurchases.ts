import { Request, Response } from "express";
import { journalRequest } from "../journal";
import { MarketPurchase, toPurchase } from "./normalizeMarket";

const CHUNK = 8;

const enrich = async (
  req: Request,
  res: Response,
  order: MarketPurchase
): Promise<MarketPurchase> => {
  if (order.items.length > 0) {
    return order;
  }

  try {
    const raw = await journalRequest<unknown>(
      req,
      res,
      "/market/customer/order/info",
      {
        method: "GET",
        params: { id: order.id },
      }
    );

    return toPurchase(raw) ?? order;
  } catch {
    return order;
  }
};

export const hydratePurchases = async (
  req: Request,
  res: Response,
  orders: MarketPurchase[]
): Promise<MarketPurchase[]> => {
  const result: MarketPurchase[] = [];

  for (let index = 0; index < orders.length; index += CHUNK) {
    const chunk = orders.slice(index, index + CHUNK);
    const next = await Promise.all(
      chunk.map((order) => enrich(req, res, order))
    );
    result.push(...next);
  }

  return result;
};
