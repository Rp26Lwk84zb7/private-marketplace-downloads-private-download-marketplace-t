import { createServer } from "node:http";
import { infrai } from "./infrai.js";
import { orderUpdate, prepareBuyerHandoff } from "./signed_download.js";

const bucket = process.env.MARKETPLACE_BUCKET ?? "course-assets";
await infrai.storage.bucket.create({ name: bucket });

const server = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/orders/handoff") { response.writeHead(404).end(); return; }
  try {
    const raw = await new Promise<string>((resolve, reject) => { let data = ""; request.on("data", (chunk) => data += chunk); request.on("end", () => resolve(data)); request.on("error", reject); });
    const result = await prepareBuyerHandoff(orderUpdate.parse(JSON.parse(raw)), bucket);
    response.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(result));
  } catch (error) {
    response.writeHead(400, { "content-type": "application/json" }).end(JSON.stringify({ error: (error as Error).message }));
  }
});
server.listen(Number(process.env.PORT ?? 3000), () => console.log("Order handoff listening on port 3000"));
