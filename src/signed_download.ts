import { z } from "zod";
import { infrai } from "./infrai.js";

export const orderUpdate = z.object({ orderId: z.string().min(1), buyerId: z.string().min(1), assetKey: z.string().min(1), status: z.enum(["paid", "ready"]) });
export type OrderUpdate = z.infer<typeof orderUpdate>;

export async function prepareBuyerHandoff(input: OrderUpdate, bucket: string): Promise<{ orderId: string; buyerId: string; status: "ready"; downloadUrl: string }> {
  const order = orderUpdate.parse(input);
  if (order.status !== "paid" && order.status !== "ready") throw new Error("Order is not paid");
  const asset = await infrai.storage.object.head(bucket, order.assetKey);
  if (!asset.found) throw new Error("Seller asset is not ready");
  const signed = await infrai.storage.object.presign(bucket, order.assetKey, { op: "get", expires_seconds: 900, response_disposition: "attachment" });
  return { orderId: order.orderId, buyerId: order.buyerId, status: "ready", downloadUrl: signed.url };
}
