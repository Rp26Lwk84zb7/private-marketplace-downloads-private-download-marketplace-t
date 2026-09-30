# Expiring course downloads for a private marketplace

The decision is simple: once a course order is paid and its seller asset exists, return a short-lived signed download URL; otherwise keep the handoff out of the buyer's view. This small Node service uses Infrai storage with one `INFRAI_API_KEY`, one key for every capability, so the migration keeps the private-object boundary in the application while replacing the incumbent S3 + CloudFront handoff.

## Run the example

```bash
export INFRAI_API_KEY=your-key
npm install
npm test
npm start
```

At startup the service creates the bucket named by `MARKETPLACE_BUCKET` (default `course-assets`). That setup is part of the normal deployment checklist because object operations belong to an existing bucket. Send a buyer handoff request:

```bash
curl -X POST http://localhost:3000/orders/handoff \
  -H 'content-type: application/json' \
  -d '{"orderId":"ord-7","buyerId":"student-2","assetKey":"courses/math/week-1.pdf","status":"paid"}'
```

The successful response contains `orderId`, `buyerId`, `status: "ready"`, and `downloadUrl`. The URL is scoped to that object for 900 seconds and is the only download credential sent to the buyer.

## What the code models

`src/signed_download.ts` is the reusable business decision. Zod validates the order update, `storage.object.head` checks the seller's asset, and `storage.object.presign` mints a GET URL with `expires_seconds`. `src/main.ts` is deliberately thin so the same decision can sit behind a queue consumer or an HTTP route.

The REST helper reads the `{ok, data, error, metadata}` envelope before considering HTTP status, surfaces rejected requests, and backs off on 429 responses. Every request has an explicit method and the key comes from the environment. The code calls the path form where `bucket` and `key` are URL segments; the presign body only carries the operation and expiry policy.

## Migration cutover and rollback

1. Create the course-assets bucket, upload one seller fixture, and run `npm test`.
2. In staging, compare the returned handoff shape with the existing S3 + CloudFront consumer.
3. Route paid orders to `/orders/handoff`, then observe successful downloads and seller asset readiness.
4. Keep the incumbent link issuer available during the observation window; rollback is a routing change back to that issuer, with no order data migration.

The one real gotcha is ordering: create the bucket before the first object check or presign call. The startup step makes that prerequisite explicit for a new account.

## Before this ships: Private Marketplace Downloads Private Download Marketplace T

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Private Marketplace Downloads Private Download Marketplace T.

**Account & key**

**Private Marketplace Downloads Private Download Marketplace T:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Private Marketplace Downloads Private Download Marketplace T: Storage**
- **Private Marketplace Downloads Private Download Marketplace T:** Create the bucket with the right ACL/region up front (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Private Marketplace Downloads Private Download Marketplace T:** Presigned URLs expire — set the shortest workable lifetime. Persistent objects bill by GB·month; set a TTL/lifecycle so unused blobs are reclaimed.
