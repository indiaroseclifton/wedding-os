# DIY Studio: integration and operating notes

Studio is a focused app experience inside the existing Vowfolk deployment. It keeps the shared wedding date, identity, planner and guest records. No additional service or database schema is required beyond the existing JsonStore table.

## What works without provider keys

- Flowers, tables, signs, decor, lighting, favors and paper projects have an editable, dimension-based 3D preview, measured top view, guest-eye view and repeated room view. Venue photographs can be aligned manually behind the design. PNG export includes the actual rendered layout.
- A catalog of 33 material types drives recipes, spare allowances, supplier pack quantities, costs and variable build hours. Grouped solid objects are spaced automatically; duplicate individual objects for precise placement. Flower models are procedural representations, not scans of a particular supplier’s product.
- Purchases and received stock survive recipe changes. Removed purchased ingredients remain as zero-required rows. Costs are planning estimates; purchasing and printing occur with the supplier.
- Exact or wedding-relative build dates, dependencies, helper capacity, trial time, CSV and calendar exports, box allocation and placed quantities work locally. Calendar downloads are snapshots, not calendar account synchronization.
- Design approval, project comments, option duplication and twelve saved design checkpoints. Approval and comment attribution use the signed-in server identity. Stale saves are rejected rather than silently overwriting another window.
- Revocable, unguessable setup links reveal the design, material quantities, task instructions, names and boxes. They omit costs, supplier links, private notes, conversation and provider editor links. Anyone holding a live link can view that guide; it is read-only. Revocation cannot erase earlier screenshots or printed copies.
- Canva, Minted, Joy and Bliss & Bone links, manually uploaded PNG/PDF proofs, provider editor and website URLs, print dimensions and quantity records. PNG previews can appear on signs and paper in the measured scene. Cutting checks estimate rectangular mat capacity; they do not create machine cut paths. Use the original design tool and Cricut Design Space for production files.

Website building, website publishing, printing, checkout, RSVP synchronization and provider guest-list synchronization are not implemented in Vowfolk. The provider owns those workflows. Guest-name CSV is a deliberate manual export.

## Canva Connect

Official documentation: https://www.canva.dev/docs/connect/ and https://www.canva.dev/docs/connect/authentication/

1. Register a Canva Connect integration. Public integrations require Canva review; private integration eligibility depends on Canva’s current plans and terms. A development integration is not evidence of public approval.
2. Set `CANVA_CLIENT_ID`, `CANVA_CLIENT_SECRET`, `APP_URL` and a separate, random `STUDIO_INTEGRATION_SECRET` of at least 32 characters. Never commit credentials.
3. Register the exact callback `APP_URL/api/studio/connections/canva/callback`. Use a stable preview URL for testing, with its own allowed callback.
4. Enable the scopes `design:meta:read design:content:read`. Studio uses authorization code flow with S256 PKCE. State binds the initiating user and workspace and expires after ten minutes.
5. Connect through Studio → Connections. Browse/search paginated designs, import the first page as PNG or the design as PDF. Export jobs are polled; Studio copies the resulting file to its own upload store instead of treating an expiring Canva thumbnail as permanent artwork. A PDF and preview from the same design update the same artwork record.
6. Check a real free design and a design containing licensed content before launch. Users must have rights to the chosen assets and exports. Unsupported export download hosts and files above 8 MB use the manual export/upload path.

Import is explicit, not bidirectional sync. Disconnect removes the locally held token; users can revoke provider app authorization in Canva settings. Tokens are AES-256-GCM encrypted, and access tokens are refreshed server-side.

## Pinterest

Official API description: https://github.com/pinterest/api-description

1. Register a Pinterest developer app and obtain the access tier/approval needed for your audience.
2. Set `PINTEREST_CLIENT_ID`, `PINTEREST_CLIENT_SECRET`, `APP_URL` and `STUDIO_INTEGRATION_SECRET`.
3. Register `APP_URL/api/studio/connections/pinterest/callback` and enable `boards:read,pins:read`.
4. Connect through Studio → Connections. Browse paginated public boards and Pins the connected account may read. Explicitly choose Pins to add to a project; source attribution is retained.

Studio does not scrape private boards, interpret arbitrary Pinterest URLs as uploaded images, or copy Pins into a commercial asset library. Manual links work before API approval. Remote Pin thumbnails may change or disappear. Upload a reference you have permission to use when a stable image or AI analysis is needed.

## Optional AI

Official references: https://platform.openai.com/docs/guides/images-vision and https://platform.openai.com/docs/guides/image-generation

Set `OPENAI_API_KEY` on the server. `OPENAI_STUDIO_MODEL` defaults to `gpt-4.1-mini`; choose a currently supported model available to the account. Reference interpretation, substitutions and feasibility advice use structured output constrained to the Studio catalog. Only an owned uploaded image may be analyzed; arbitrary remote URLs are not fetched. Users consent before sending a photo/design to OpenAI and select suggestions before applying them.

Set `OPENAI_STUDIO_IMAGE_MODEL` explicitly to enable image edits with a supported model. A capture of the actual 3D scene is sent to the Images Edits API. The result is labeled an approximate AI concept, kept separately from the measured plan and bill of materials. It may change counts, flowers or lettering; it is not an approved production specification.

Defaults: 30 advice attempts and 3 image attempts per workspace per UTC day, adjustable with `STUDIO_AI_DAILY_REQUESTS` and `STUDIO_AI_DAILY_RENDERS`. Attempts count before the provider call, including failed calls. Requests use timeouts. OpenAI credentials, live model availability, paid generations and photo interpretation must be tested with an authorized account before presenting AI as active. Studio reports an unavailable state when the required key/model is absent.

## Storage and deployment

For production set `DATA_BACKEND=prisma`, provide PostgreSQL `DATABASE_URL`, apply the existing Prisma migrations, and set `BLOB_READ_WRITE_TOKEN` for uploads. Studio writes use a database transaction plus an advisory lock. The development file backend uses a per-process queue and atomic file replacement; it is not suitable for distributed/serverless durability. Vercel `/tmp` data can disappear and may differ between functions. Do not evaluate persistence or multi-person collaboration using that ephemeral store.

The app currently uses its existing single wedding workspace and membership model. This work does not implement multi-tenant organizations or a new permission engine. Set `DEMO_AUTH=0` and configure the existing real sign-in before enabling paid AI or provider credentials for public users. The existing demo login is a development convenience, not a secure production identity boundary.

## Verification

`npm run test:studio` checks quantity propagation, preserved purchases, consolidated packs, packing readiness, true dates, validation, public-guide privacy and grouped object counts. `npm run test:studio:http` starts a disposable local Next server and tests authentication, saves/conflicts, server attribution, approvals, dependencies, packing validation, guide revocation, origin checks, configuration errors, duplication and the paper route. It does not touch an external deployment.

`npm run build` validates the full Next app. Live OAuth round trips, provider licensing/export behavior, real paid AI, PostgreSQL concurrency and mobile GPU performance need configured-environment verification. The 3D view has a measured-plan fallback when WebGL is unavailable. Room layout is a repeated planning preview, not a venue collision, structural, lighting photometry or seating-engine certification.
