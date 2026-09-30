import assert from "node:assert/strict";
import { orderUpdate } from "./signed_download.js";

const parsed = orderUpdate.parse({ orderId: "ord-7", buyerId: "student-2", assetKey: "courses/math/week-1.pdf", status: "paid" });
assert.equal(parsed.status, "paid");
assert.throws(() => orderUpdate.parse({ orderId: "ord-7", buyerId: "student-2", assetKey: "courses/math/week-1.pdf", status: "pending" }));
console.log("paid order input is accepted; pending order input is rejected");
