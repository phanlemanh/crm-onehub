# Chiến dịch tuyển đối tác — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đội tiếp thị chạy trọn một chiến dịch tuyển đối tác trong CRM — người từ sàn nhatot vào kèm sản lượng, lọc thành phân khúc, gọi theo danh sách, một cú bấm ghi kết quả, số đo đặt cạnh đối chứng.

**Architecture:** Một bộ cào Python đứng ngoài CRM đẩy lô JSON qua cổng HTTP nội bộ có khoá; cổng chỉ ghi điều sàn nói vào bản ghi cá nhân cộng chín trường tuỳ chỉnh, không chấm điểm và không xếp việc nghiên cứu. Phân khúc dùng lại `SavedView` thực thể `CONTACT` đã có. Chiến dịch và lượt gọi là hai bảng mới; mỗi lượt gọi ghi kèm một `Activity` loại `CALL` trong cùng giao dịch.

**Tech Stack:** Prisma + PostgreSQL · NestJS + nestjs-trpc · Zod (`@crm/validation`) · Next.js App Router + TanStack Query + nuqs · `@crm/ui` (shadcn) · Bun test · Python 3.12 + crawl4ai 0.9.2 (venv riêng, ngoài turborepo)

**Spec:** `docs/superpowers/specs/2026-09-04-tiep-thi-tuyen-doi-tac-design.md`
**Contract:** `_acceptance/tiep-thi-tuyen-doi-tac/contract.md` (đã duyệt 2026-09-04, Manh Phan)
**Evals:** `_acceptance/tiep-thi-tuyen-doi-tac/evals.yaml` (E1–E25)

## Global Constraints

- **Không viết chú thích trong code.** Không thêm vào code mới, không thêm khi sửa code cũ (`AGENTS.md`).
- **Không trailer đồng tác giả trong commit.**
- **Trí khôn không ở API.** Cổng tiếp nhận không chấm điểm, không khớp mờ, không gọi nhà cung cấp, không xếp `AgentTask`. Mức sản lượng do bộ cào tính.
- **Một `.env` ở gốc kho.** Biến mới khai ở `.env.example` kèm ghi chú, và ở `apps/api/src/config/env.validation.ts`.
- **Thiếu khoá là mất năng lực, không bao giờ ném lỗi lúc khởi động.** `LISTING_INGEST_SECRET` vắng → cổng trả 503.
- **`/packages/ui` là nguồn duy nhất của giao diện.** Không override style bằng `className`, không bán kính bo hay màu tự chế. Góc: `rounded-md` cho nút và ô nhập, `rounded-lg` cho bề mặt chứa control.
- **Client component không được nhập gói máy chủ** (`@crm/db`, `@crm/auth`). Trang máy chủ tính, client nhận dữ liệu phẳng.
- **Phân tích ở biên.** Dữ liệu chưa tin được đi qua Zod trong một module sở hữu hình dạng đó, đặt tại `packages/validation/src`, nhập theo đường con.
- **Hằng số theo vùng, không rải cạnh chỗ dùng đầu tiên.** `apps/api/src/campaigns/campaigns-config.ts` và `apps/api/src/listings/listings-config.ts`, `as const`.
- **Chữ trên màn hình là tiếng Việt, mọi giá trị có dấu.** Kho chuỗi theo khuôn `apps/app/lib/messages/*.ts` (`const en` → `export type` → `const vi satisfies` → `BANG`).
- **Dữ liệu người nhập và dữ liệu từ sàn KHÔNG dịch**, phần tử chứa chúng mang `translate="no"`.
- **Từ điển sản phẩm:** dùng «cá nhân», «công ty», «nhân viên quan hệ đối tác», «thoả thuận hợp tác». Tránh «liên hệ», «khách hàng», «deal», «cơ hội», «giao dịch» (nghĩa thoả thuận).
- **Bốn từ mới phải thêm mục vào `CONTEXT.md` trước khi lên màn:** chiến dịch · phân khúc · sản lượng · số chứng chỉ (Task 12).
- **Ghi log theo `docs/api.md`:** `new Logger(Thing.name)`, một object, không bao giờ log thân yêu cầu hay dữ liệu cá nhân.
- **Mỗi phép đo mới phải có cặp hai chiều trên cùng một mẫu**: vật lành → xanh, phá vật thật trong bản sao → đỏ với thông điệp ghim. Task chưa có cặp đó là task CHƯA XONG.
- **Lệnh chứng minh, chạy từ gốc kho:** `bun run db:test && bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop`.

---

## Cấu trúc tệp

| Tệp | Trách nhiệm |
|---|---|
| `packages/db/prisma/schema.prisma` | Hai model, ba enum, một giá trị `RecordSource` |
| `packages/db/prisma/migrations/<ts>_campaigns/migration.sql` | Migration do Prisma sinh |
| `packages/validation/src/listing-ingest.ts` | Lược đồ lô từ sàn — nguồn duy nhất của hình dạng |
| `packages/validation/scripts/listing-ingest-schema.ts` | Sinh JSON Schema từ Zod cho bộ cào |
| `apps/api/src/listings/listings-config.ts` | Trần lô, chín khoá trường, nhãn, ngưỡng hiển thị |
| `apps/api/src/listings/listing-fields.service.ts` | Dựng chín trường tuỳ chỉnh, một lần, idempotent |
| `apps/api/src/listings/listing-ingest.service.ts` | Upsert cá nhân theo trang nhatot + ghi chín giá trị |
| `apps/api/src/listings/listings.controller.ts` | `POST /internal/listings/ingest`, khoá Bearer |
| `apps/api/src/listings/listings.module.ts` | Nối module |
| `apps/api/src/campaigns/campaigns-config.ts` | Hằng số vùng chiến dịch |
| `apps/api/src/campaigns/campaigns.contracts.ts` | Zod vào/ra của tRPC |
| `apps/api/src/campaigns/campaigns.service.ts` | Vòng đời, thành viên, lượt gọi, số đo |
| `apps/api/src/campaigns/campaigns.router.ts` | Bảy thủ tục tRPC |
| `apps/api/src/campaigns/campaigns.module.ts` | Nối module |
| `apps/api/src/saved-views/saved-views.service.ts` | Thêm chặn xoá góc nhìn đang dùng |
| `apps/app/lib/messages/campaigns.ts` | Kho chuỗi hai thứ tiếng |
| `apps/app/app/(app)/[slug]/campaigns/page.tsx` | Trang danh sách (máy chủ) |
| `apps/app/app/(app)/[slug]/campaigns/campaigns-table.tsx` | Bảng danh sách (client) |
| `apps/app/app/(app)/[slug]/campaigns/create-campaign-sheet.tsx` | Hộp tạo (client) |
| `apps/app/app/(app)/[slug]/campaigns/campaign-state.ts` | Hàm chọn trạng thái thuần |
| `apps/app/app/(app)/[slug]/campaigns/[campaignId]/page.tsx` | Trang chiến dịch (máy chủ) |
| `apps/app/app/(app)/[slug]/campaigns/[campaignId]/campaign-detail.tsx` | Dải số + bảng thành viên (client) |
| `apps/app/app/(app)/[slug]/campaigns/[campaignId]/members-search-params.ts` | Tham số địa chỉ |
| `apps/app/components/app-icon-rail.tsx` | Thêm mục Chiến dịch |
| `tools/listing-crawl/` | Bộ cào Python: gieo, hồ sơ, lộ số, phát lô |
| `_acceptance/tiep-thi-tuyen-doi-tac/rang/chien-dich.mjs` | Năm chặn lái trình duyệt |

**Thứ tự và tính độc lập.** Task 1 (lược đồ dữ liệu) và Task 2 (lược đồ lô) không phụ thuộc nhau — chạy song song được. Task 3–5 cần Task 1 và 2. Task 6–8 cần Task 1. Task 9 (bộ cào) cần Task 2. Task 10–13 (giao diện) cần Task 5 và 8. Task 14 (chặn lái) cần Task 13.

`independent: true` cho cặp (Task 1, Task 2) và cho cặp (Task 9, Task 11) — Task 11 là kho chuỗi, không đụng gì của bộ cào. Task 10 nhận tệp lô của Task 9 nên phụ thuộc nó. Mọi task khác `independent: false`.

---

### Task 1: Lược đồ dữ liệu — hai bảng, ba enum, một nguồn bản ghi

**Files:**
- Modify: `packages/db/prisma/schema.prisma`
- Create: `packages/db/prisma/migrations/<timestamp>_campaigns/migration.sql` (Prisma sinh)

**Interfaces:**
- Consumes: không
- Produces: model `Campaign` (`id, name, channel, status, script, savedViewId, ownerId, createdById, startedAt, finishedAt, createdAt, updatedAt`), model `CampaignTouch` (`id, campaignId, contactId, activityId, outcome, note, createdById, createdAt`), enum `CampaignChannel { PHONE }`, `CampaignStatus { DRAFT RUNNING FINISHED }`, `TouchOutcome { NO_ANSWER ANSWERED MEETING DECLINED WRONG_NUMBER }`, giá trị `RecordSource.LISTING`

**`independent: true`** với Task 2.

- [ ] **Step 1: Thêm ba enum vào schema**

Đặt ngay sau `enum RecordSource` trong `packages/db/prisma/schema.prisma`:

```prisma
enum CampaignChannel {
  PHONE
}

enum CampaignStatus {
  DRAFT
  RUNNING
  FINISHED
}

enum TouchOutcome {
  NO_ANSWER
  ANSWERED
  MEETING
  DECLINED
  WRONG_NUMBER
}
```

- [ ] **Step 2: Thêm `LISTING` vào `RecordSource`**

Sửa enum đang có, thêm dòng cuối:

```prisma
enum RecordSource {
  MANUAL
  IMPORT
  EMAIL
  CALENDAR
  TRACKING
  LISTING
}
```

- [ ] **Step 3: Thêm hai model**

Đặt sau `model SavedView`:

```prisma
model Campaign {
  id      String          @id @default(cuid())
  name    String
  channel CampaignChannel @default(PHONE)
  status  CampaignStatus  @default(DRAFT)
  script  String?

  savedViewId String
  savedView   SavedView @relation(fields: [savedViewId], references: [id], onDelete: Restrict)

  ownerId     String?
  owner       User?   @relation("CampaignOwner", fields: [ownerId], references: [id], onDelete: SetNull)
  createdById String
  createdBy   User    @relation("CampaignAuthor", fields: [createdById], references: [id])

  startedAt  DateTime?
  finishedAt DateTime?

  touches CampaignTouch[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status, createdAt])
  @@index([savedViewId])
  @@index([ownerId])
  @@map("campaign")
}

model CampaignTouch {
  id String @id @default(cuid())

  campaignId String
  campaign   Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  contactId  String
  contact    Contact  @relation(fields: [contactId], references: [id], onDelete: Cascade)
  activityId String   @unique
  activity   Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)

  outcome TouchOutcome
  note    String?

  createdById String
  createdBy   User   @relation("CampaignTouchAuthor", fields: [createdById], references: [id])

  createdAt DateTime @default(now())

  @@index([campaignId, contactId])
  @@index([contactId])
  @@map("campaignTouch")
}
```

- [ ] **Step 4: Thêm quan hệ ngược trên bốn model đang có**

Trong `model User`, thêm ba dòng vào khối quan hệ:

```prisma
  campaignsOwned   Campaign[]      @relation("CampaignOwner")
  campaignsCreated Campaign[]      @relation("CampaignAuthor")
  campaignTouches  CampaignTouch[] @relation("CampaignTouchAuthor")
```

Trong `model SavedView`, trước `createdAt`:

```prisma
  campaigns Campaign[]
```

Trong `model Contact`, cạnh `activities`:

```prisma
  campaignTouches CampaignTouch[]
```

Trong `model Activity`, cạnh `calendarEvent`:

```prisma
  campaignTouch CampaignTouch?
```

- [ ] **Step 5: Sinh migration và client**

```bash
bun run db:migrate
```

Đặt tên migration khi Prisma hỏi: `campaigns`.
Expected: một thư mục mới dưới `packages/db/prisma/migrations/`, và `prisma generate` chạy xong không lỗi.

- [ ] **Step 6: Chứng minh migration thật sự áp được lên cơ sở dữ liệu thử**

```bash
bun run db:test && bun run check-types
```

Expected: exit 0. `db:test` dựng lại cơ sở dữ liệu thử từ migration, nên nó là phép thử migration.

- [ ] **Step 7: Chiều đỏ — chứng minh `Restrict` thật sự chặn**

Tạo `apps/api/test/campaign-schema.spec.ts`:

```ts
import { afterAll, expect, it } from "bun:test";
import { db } from "@crm/db";

const suffix = process.env.TEST_RUN_ID ?? "campaign-schema";

afterAll(async () => {
	await db.campaign.deleteMany({ where: { name: { startsWith: suffix } } });
	await db.savedView.deleteMany({ where: { name: { startsWith: suffix } } });
	await db.user.deleteMany({ where: { id: `${suffix}-user` } });
});

it("từ chối xoá góc nhìn đang có chiến dịch dùng", async () => {
	const user = await db.user.create({
		data: {
			id: `${suffix}-user`,
			name: "Thu",
			email: `${suffix}@example.com`,
			emailVerified: true,
		},
	});
	const view = await db.savedView.create({
		data: {
			entity: "CONTACT",
			name: `${suffix} góc nhìn`,
			shared: true,
			filters: { q: "", sort: "", dir: "asc", archived: false, filters: {} },
			ownerId: user.id,
		},
	});
	await db.campaign.create({
		data: {
			name: `${suffix} chiến dịch`,
			savedViewId: view.id,
			createdById: user.id,
		},
	});

	expect(db.savedView.delete({ where: { id: view.id } })).rejects.toThrow();
});
```

- [ ] **Step 8: Chạy phép đo — chiều xanh và chiều đỏ**

```bash
cd apps/api && bun test test/campaign-schema.spec.ts
```

Expected: PASS. Rồi phá vật thật để chứng minh thước biết đỏ: đổi `onDelete: Restrict` thành `onDelete: Cascade` trong schema, chạy `bun run db:migrate` trong một bản sao cây, chạy lại bài — phải ĐỎ. Trả nguyên trạng sau khi thấy đỏ.

- [ ] **Step 9: Commit**

```bash
git add packages/db/prisma apps/api/test/campaign-schema.spec.ts
git commit -m "feat(db): chiến dịch và lượt gọi có bảng riêng, góc nhìn đang dùng không xoá được"
```

---

### Task 2: Lược đồ lô từ sàn — một nguồn cho cả hai ngôn ngữ

**Files:**
- Create: `packages/validation/src/listing-ingest.ts`
- Create: `packages/validation/scripts/listing-ingest-schema.ts`
- Modify: `packages/validation/src/index.ts`
- Modify: `packages/validation/package.json:exports`
- Test: `packages/validation/test/listing-ingest.spec.ts`

**Interfaces:**
- Consumes: `parse` từ `packages/validation/src/index.ts`
- Produces: `listingBatch` (Zod), `ListingBatch`, `ListingItem`, `LISTING_TIERS`, `parseListingBatch(value: unknown): ListingBatch`, và script sinh JSON Schema ghi ra đường dẫn nhận từ tham số

**`independent: true`** với Task 1.

- [ ] **Step 1: Viết bài kiểm trước**

`packages/validation/test/listing-ingest.spec.ts`:

```ts
import { describe, expect, it } from "bun:test";
import { parseListingBatch } from "../src/listing-ingest";

const item = {
	url: "https://nhatot.com/moi-gioi-abc",
	shopName: "BĐS Quận 7",
	personName: "Trịnh Minh Hiếu",
	isCompany: false,
	hasLicense: true,
	districts: ["Quận 7", "Nhà Bè"],
	city: "Tp Hồ Chí Minh",
	listingsTotal: 163,
	listingsNew30d: 164,
	tier: "cao",
	phone: "0901234567",
};

const batch = { source: "nhatot", crawledAt: "2026-09-04T10:00:00Z", items: [item] };

describe("lô từ sàn", () => {
	it("nhận lô hợp lệ và giữ nguyên giá trị", () => {
		const parsed = parseListingBatch(batch);
		expect(parsed.items[0]?.listingsNew30d).toBe(164);
		expect(parsed.items[0]?.tier).toBe("cao");
	});

	it("mục vắng số điện thoại vẫn hợp lệ", () => {
		const { phone, ...rest } = item;
		const parsed = parseListingBatch({ ...batch, items: [rest] });
		expect(parsed.items[0]?.phone).toBeUndefined();
	});

	it("từ chối mục thiếu số tin và gọi tên trường", () => {
		const { listingsTotal, ...rest } = item;
		expect(() => parseListingBatch({ ...batch, items: [rest] })).toThrow(
			/items\.0\.listingsTotal/,
		);
	});

	it("từ chối mức sản lượng viết hoa", () => {
		expect(() =>
			parseListingBatch({ ...batch, items: [{ ...item, tier: "CAO" }] }),
		).toThrow(/items\.0\.tier/);
	});

	it("từ chối lô rỗng và lô quá 500 mục", () => {
		expect(() => parseListingBatch({ ...batch, items: [] })).toThrow();
		expect(() =>
			parseListingBatch({ ...batch, items: Array(501).fill(item) }),
		).toThrow();
	});
});
```

- [ ] **Step 2: Chạy để thấy nó đỏ**

```bash
cd packages/validation && bun test test/listing-ingest.spec.ts
```

Expected: FAIL — `Cannot find module '../src/listing-ingest'`.

- [ ] **Step 3: Viết lược đồ**

`packages/validation/src/listing-ingest.ts`:

```ts
import { z } from "zod";
import { parse } from "./index";

export const LISTING_TIERS = ["cao", "vua", "thap", "ngu"] as const;

export const LISTING_BATCH_MAX_ITEMS = 500;

export const listingItem = z.object({
	url: z.url().max(500),
	shopName: z.string().trim().min(1).max(200),
	personName: z.string().trim().min(1).max(200).optional(),
	isCompany: z.boolean(),
	hasLicense: z.boolean(),
	districts: z.array(z.string().trim().min(1).max(100)).max(30),
	city: z.string().trim().min(1).max(100).nullable(),
	listingsTotal: z.int().min(0).max(1_000_000),
	listingsNew30d: z.int().min(0).max(1_000_000),
	tier: z.enum(LISTING_TIERS),
	phone: z.string().trim().min(6).max(30).optional(),
});

export const listingBatch = z.object({
	source: z.literal("nhatot"),
	crawledAt: z.iso.datetime(),
	items: z.array(listingItem).min(1).max(LISTING_BATCH_MAX_ITEMS),
});

export type ListingItem = z.infer<typeof listingItem>;
export type ListingBatch = z.infer<typeof listingBatch>;
export type ListingTier = (typeof LISTING_TIERS)[number];

export function parseListingBatch(value: unknown): ListingBatch {
	return parse(listingBatch, value, "lô từ sàn");
}
```

- [ ] **Step 4: Khai đường con và mục lục**

Thêm vào `packages/validation/package.json`, khối `exports`, cùng khuôn với các đường con đang có:

```json
    "./listing-ingest": "./src/listing-ingest.ts",
```

Thêm vào `packages/validation/src/index.ts`:

```ts
import * as listingIngest from "./listing-ingest";
```

và đưa `listingIngest` vào object `schemas`, rồi thêm dòng tái xuất kiểu:

```ts
export type { ListingBatch, ListingItem, ListingTier } from "./listing-ingest";
```

- [ ] **Step 5: Chạy lại để thấy nó xanh**

```bash
cd packages/validation && bun test test/listing-ingest.spec.ts
```

Expected: PASS, 5 bài.

- [ ] **Step 6: Viết script sinh JSON Schema**

`packages/validation/scripts/listing-ingest-schema.ts`:

```ts
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { listingBatch } from "../src/listing-ingest";

const target = process.argv[2];

if (!target) {
	console.error("listing-ingest-schema: cần một đường dẫn tệp đích");
	process.exit(2);
}

const schema = z.toJSONSchema(listingBatch, { target: "draft-2020-12" });
writeFileSync(resolve(target), `${JSON.stringify(schema, null, 2)}\n`, "utf8");
console.log(`listing-ingest-schema: đã ghi ${resolve(target)}`);
```

Thêm vào `packages/validation/package.json`, khối `scripts`:

```json
    "schema:listing-ingest": "bun scripts/listing-ingest-schema.ts",
```

- [ ] **Step 7: Chạy script và xem nó ra tệp**

```bash
cd packages/validation && bun run schema:listing-ingest /tmp/probe-schema.json && head -5 /tmp/probe-schema.json
```

Expected: in đường dẫn, và tệp bắt đầu bằng `{` với khoá `$schema`.

- [ ] **Step 8: Commit**

```bash
git add packages/validation
git commit -m "feat(validation): lô từ sàn có một lược đồ, và một đường sinh lược đồ cho bộ cào"
```

---

### Task 3: Chín trường tuỳ chỉnh — dựng một lần, không đè

**Files:**
- Create: `apps/api/src/listings/listings-config.ts`
- Create: `apps/api/src/listings/listing-fields.service.ts`
- Test: `apps/api/test/listing-fields.spec.ts`

**Interfaces:**
- Consumes: `FieldsService.definitionsFor` (`apps/api/src/fields/fields.service.ts`), `FieldEntity` từ `@crm/db`
- Produces: `LISTING` (object hằng: `maxItems`, `fields`), `ListingFieldKey`, `ListingFieldsService.ensure(): Promise<Map<ListingFieldKey, FieldDefinitionWithOptions>>`

- [ ] **Step 1: Viết hằng số vùng**

`apps/api/src/listings/listings-config.ts`:

```ts
import { LISTING_TIERS } from "@crm/validation/listing-ingest";

export const TIER_LABELS = {
	cao: "Cao",
	vua: "Vừa",
	thap: "Thấp",
	ngu: "Ngủ",
} as const;

export const LISTING = {
	maxItems: 500,
	fields: [
		{
			key: "san_luong",
			label: "Sản lượng",
			type: "SELECT",
			options: LISTING_TIERS.map((tier) => TIER_LABELS[tier]),
			showOnTable: true,
			showOnFilter: true,
		},
		{ key: "tin_dang", label: "Tin đang đăng", type: "NUMBER", showOnTable: true },
		{
			key: "tin_moi_30_ngay",
			label: "Tin mới 30 ngày",
			type: "NUMBER",
			showOnTable: true,
		},
		{ key: "dia_ban", label: "Địa bàn", type: "TEXT", showOnTable: true },
		{
			key: "hinh_thai",
			label: "Hình thái",
			type: "SELECT",
			options: ["Công ty", "Cá nhân"],
			showOnFilter: true,
		},
		{
			key: "chung_chi",
			label: "Chứng chỉ",
			type: "SELECT",
			options: ["Có", "Không"],
			showOnFilter: true,
		},
		{
			key: "ten_chuyen_trang",
			label: "Tên chuyên trang",
			type: "TEXT",
			showOnTable: true,
		},
		{ key: "trang_nhatot", label: "Trang nhatot", type: "URL" },
		{ key: "san_cap_nhat_luc", label: "Sàn cập nhật lúc", type: "DATE" },
	],
} as const;

export type ListingFieldKey = (typeof LISTING.fields)[number]["key"];

export const MATCH_KEY: ListingFieldKey = "trang_nhatot";
```

- [ ] **Step 2: Viết bài kiểm trước**

`apps/api/test/listing-fields.spec.ts`:

```ts
import { afterAll, beforeAll, expect, it } from "bun:test";
import { db } from "@crm/db";
import { AgentQueueService } from "../src/agent/agent-queue.service";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { FieldsService } from "../src/fields/fields.service";
import { LISTING } from "../src/listings/listings-config";
import { ListingFieldsService } from "../src/listings/listing-fields.service";

const keys = LISTING.fields.map((field) => field.key);

const agent = {
	fieldBackfillRecords: async () => ({ queued: 0, merged: 0 }),
} as unknown as AgentTriggerService;

const fields = new FieldsService(db, agent, new AgentQueueService(db));
const service = new ListingFieldsService(fields);

beforeAll(async () => {
	await db.fieldDefinition.deleteMany({
		where: { entity: "CONTACT", key: { in: keys } },
	});
});

afterAll(async () => {
	await db.fieldDefinition.deleteMany({
		where: { entity: "CONTACT", key: { in: keys } },
	});
});

it("dựng đủ chín trường, tác nhân không điền được", async () => {
	const built = await service.ensure();

	expect(built.size).toBe(9);
	for (const field of LISTING.fields) {
		const definition = built.get(field.key);
		expect(definition?.label).toBe(field.label);
		expect(definition?.agentFilled).toBe(false);
	}
	const filterable = built.get("san_luong");
	expect(filterable?.showOnFilter).toBe(true);
	expect(filterable?.options.map((option) => option.label)).toEqual([
		"Cao",
		"Vừa",
		"Thấp",
		"Ngủ",
	]);
});

it("gọi lần hai không tạo thêm định nghĩa nào", async () => {
	await service.ensure();
	await service.ensure();

	const count = await db.fieldDefinition.count({
		where: { entity: "CONTACT", key: { in: keys } },
	});
	expect(count).toBe(9);
});
```

- [ ] **Step 3: Chạy để thấy nó đỏ**

```bash
bun run db:test && cd apps/api && bun test test/listing-fields.spec.ts
```

Expected: FAIL — không tìm thấy `listing-fields.service`.

- [ ] **Step 4: Viết dịch vụ**

`apps/api/src/listings/listing-fields.service.ts`:

```ts
import type { FieldDefinitionWithOptions } from "@crm/db/fields";
import { Injectable } from "@nestjs/common";
import { FieldsService } from "../fields/fields.service";
import { LISTING, type ListingFieldKey } from "./listings-config";

@Injectable()
export class ListingFieldsService {
	constructor(private readonly fields: FieldsService) {}

	async ensure(): Promise<Map<ListingFieldKey, FieldDefinitionWithOptions>> {
		const existing = await this.fields.definitionsFor("CONTACT");
		const byKey = new Map(existing.map((row) => [row.key, row]));

		for (const field of LISTING.fields) {
			if (byKey.has(field.key)) continue;

			await this.fields.create({
				entity: "CONTACT",
				label: field.label,
				type: field.type,
				options: ("options" in field ? field.options : []).map((label) => ({
					label,
				})),
				agentFilled: false,
				agentBrief: null,
				required: false,
				showOnSheet: true,
				showOnTable: "showOnTable" in field ? field.showOnTable : false,
				showOnFilter: "showOnFilter" in field ? field.showOnFilter : false,
			});
		}

		const after = await this.fields.definitionsFor("CONTACT");
		const wanted = new Set<string>(LISTING.fields.map((field) => field.key));

		return new Map(
			after
				.filter((row) => wanted.has(row.key))
				.map((row) => [row.key as ListingFieldKey, row]),
		);
	}
}
```

Lưu ý: `FieldsService.create` suy khoá từ nhãn bằng `fieldKeyFromLabel`, và nhãn tiếng Việt có dấu sẽ ra khoá không dùng được. Kiểm ở bước sau; nếu khoá suy ra khác `field.key`, sửa `create` gọi thẳng Prisma trong dịch vụ này thay vì đi qua `FieldsService`, giữ nguyên mọi cột.

- [ ] **Step 5: Chạy và đọc khoá thật sự được ghi**

```bash
cd apps/api && bun test test/listing-fields.spec.ts
```

Expected: nếu PASS thì đi tiếp. Nếu FAIL vì khoá lệch (ví dụ `s_n_l_ng`), thay thân vòng lặp bằng ghi thẳng, giữ mọi cột của `FieldDefinition`:

```ts
			const last = await this.db.fieldDefinition.findFirst({
				where: { entity: "CONTACT" },
				orderBy: { position: "desc" },
				select: { position: true },
			});

			await this.db.fieldDefinition.create({
				data: {
					entity: "CONTACT",
					key: field.key,
					label: field.label,
					type: field.type,
					agentFilled: false,
					required: false,
					showOnSheet: true,
					showOnTable: "showOnTable" in field ? field.showOnTable : false,
					showOnFilter: "showOnFilter" in field ? field.showOnFilter : false,
					position: (last?.position ?? -1) + 1,
					options:
						"options" in field
							? {
									create: field.options.map((label, index) => ({
										label,
										position: index,
									})),
								}
							: undefined,
				},
			});
```

Khi đó thêm `@InjectDatabase() private readonly db: Db` vào hàm dựng.

- [ ] **Step 6: Chạy lại tới xanh**

```bash
cd apps/api && bun test test/listing-fields.spec.ts
```

Expected: PASS, 2 bài.

- [ ] **Step 7: Chiều đỏ**

Trong bản sao, đổi `agentFilled: false` thành `true`; chạy lại — bài đầu phải ĐỎ và gọi tên `agentFilled`. Trả nguyên trạng.

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/listings apps/api/test/listing-fields.spec.ts
git commit -m "feat(api): chín trường từ sàn dựng một lần, tác nhân không điền được"
```

---

### Task 4: Cổng tiếp nhận — nhận lô, upsert theo trang nhatot

**Files:**
- Create: `apps/api/src/listings/listing-ingest.service.ts`
- Create: `apps/api/src/listings/listings.controller.ts`
- Create: `apps/api/src/listings/listings.module.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/src/config/env.validation.ts`
- Modify: `.env.example`

**Interfaces:**
- Consumes: `parseListingBatch`, `ListingBatch`, `ListingItem` (Task 2); `ListingFieldsService.ensure` (Task 3); `RecordSource.LISTING` (Task 1)
- Produces: `ListingIngestService.ingest(batch: ListingBatch): Promise<{ created: number; updated: number }>`; endpoint `POST /internal/listings/ingest`

- [ ] **Step 1: Khai biến môi trường**

Thêm vào `apps/api/src/config/env.validation.ts`, trong lớp `EnvironmentVariables`, cạnh `CRON_SECRET`:

```ts
	@IsOptional()
	@IsString()
	@MinLength(16, {
		message: "LISTING_INGEST_SECRET must be at least 16 characters.",
	})
	LISTING_INGEST_SECRET?: string;
```

Thêm vào `.env.example`, sau khối `CRON_SECRET`:

```
# ── Listing ingest ───────────────────────────────────────────────────────────
# Bearer token guarding POST /internal/listings/ingest, the endpoint the
# listing crawler in tools/listing-crawl posts batches to. Without it the
# endpoint refuses with 503 and no listing data can enter the CRM. At least 16
# characters.
# LISTING_INGEST_SECRET=""
```

Thêm `"LISTING_INGEST_SECRET"` vào `globalPassThroughEnv` trong `turbo.json`.

- [ ] **Step 2: Viết dịch vụ tiếp nhận**

`apps/api/src/listings/listing-ingest.service.ts`:

```ts
import { EnrichmentStatus, type Db, RecordSource } from "@crm/db";
import type { FieldDefinitionWithOptions } from "@crm/db/fields";
import type { ListingBatch, ListingItem } from "@crm/validation/listing-ingest";
import { Injectable, Logger } from "@nestjs/common";
import { blankToNull } from "../crm/values";
import { InjectDatabase } from "../database/database.constants";
import { ListingFieldsService } from "./listing-fields.service";
import { LISTING, MATCH_KEY, TIER_LABELS, type ListingFieldKey } from "./listings-config";

type Definitions = Map<ListingFieldKey, FieldDefinitionWithOptions>;

function splitName(full: string): { firstName: string; lastName: string | null } {
	const parts = full.trim().split(/\s+/);
	if (parts.length === 1) return { firstName: parts[0] ?? full, lastName: null };

	return {
		firstName: parts.slice(0, -1).join(" "),
		lastName: parts[parts.length - 1] ?? null,
	};
}

function optionId(definition: FieldDefinitionWithOptions, label: string): string | null {
	return definition.options.find((option) => option.label === label)?.id ?? null;
}

@Injectable()
export class ListingIngestService {
	private readonly logger = new Logger(ListingIngestService.name);

	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly fields: ListingFieldsService,
	) {}

	async ingest(batch: ListingBatch): Promise<{ created: number; updated: number }> {
		const definitions = await this.fields.ensure();
		const crawledAt = new Date(batch.crawledAt);

		let created = 0;
		let updated = 0;

		for (const item of batch.items) {
			const outcome = await this.one(item, definitions, crawledAt);
			if (outcome === "created") created += 1;
			else updated += 1;
		}

		this.logger.log({
			message: "Listing batch ingested",
			source: batch.source,
			items: batch.items.length,
			created,
			updated,
		});

		return { created, updated };
	}

	private async one(
		item: ListingItem,
		definitions: Definitions,
		crawledAt: Date,
	): Promise<"created" | "updated"> {
		const match = definitions.get(MATCH_KEY);
		if (!match) throw new Error(`Missing field definition for ${MATCH_KEY}.`);

		return this.db.$transaction(async (tx) => {
			const existing = await tx.fieldValue.findFirst({
				where: { fieldId: match.id, text: item.url, contactId: { not: null } },
				select: { contactId: true },
			});

			const name = splitName(item.personName ?? item.shopName);
			const phone = item.phone ? blankToNull(item.phone) : null;

			const contactId = existing?.contactId
				? (
						await tx.contact.update({
							where: { id: existing.contactId },
							data: phone ? { phone } : {},
							select: { id: true },
						})
					).id
				: (
						await tx.contact.create({
							data: {
								firstName: name.firstName,
								lastName: name.lastName,
								phone,
								source: RecordSource.LISTING,
								enrichmentStatus: EnrichmentStatus.SKIPPED,
							},
							select: { id: true },
						})
					).id;

			await this.writeValues(tx, contactId, definitions, item, crawledAt);

			return existing?.contactId ? "updated" : "created";
		});
	}

	private async writeValues(
		tx: Parameters<Parameters<Db["$transaction"]>[0]>[0],
		contactId: string,
		definitions: Definitions,
		item: ListingItem,
		crawledAt: Date,
	): Promise<void> {
		const values: Record<ListingFieldKey, Record<string, unknown>> = {
			san_luong: { optionId: optionId(definitions.get("san_luong")!, TIER_LABELS[item.tier]) },
			tin_dang: { number: item.listingsTotal },
			tin_moi_30_ngay: { number: item.listingsNew30d },
			dia_ban: { text: item.districts.join(", ") },
			hinh_thai: {
				optionId: optionId(definitions.get("hinh_thai")!, item.isCompany ? "Công ty" : "Cá nhân"),
			},
			chung_chi: {
				optionId: optionId(definitions.get("chung_chi")!, item.hasLicense ? "Có" : "Không"),
			},
			ten_chuyen_trang: { text: item.shopName },
			trang_nhatot: { text: item.url },
			san_cap_nhat_luc: { date: crawledAt },
		};

		for (const field of LISTING.fields) {
			const definition = definitions.get(field.key);
			if (!definition) continue;

			await tx.fieldValue.upsert({
				where: { fieldId_contactId: { fieldId: definition.id, contactId } },
				create: { fieldId: definition.id, contactId, ...values[field.key] },
				update: values[field.key],
			});
		}
	}
}
```

- [ ] **Step 3: Viết cổng HTTP**

`apps/api/src/listings/listings.controller.ts`:

```ts
import { parseListingBatch } from "@crm/validation/listing-ingest";
import { InvalidInput } from "@crm/validation";
import {
	BadRequestException,
	Body,
	Controller,
	ForbiddenException,
	Headers,
	Logger,
	Post,
	ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
	ApiBadRequestResponse,
	ApiForbiddenResponse,
	ApiHeader,
	ApiOkResponse,
	ApiOperation,
	ApiServiceUnavailableResponse,
	ApiTags,
} from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import type { EnvironmentVariables } from "../config/env.validation";
import { ListingIngestService } from "./listing-ingest.service";

@ApiTags("Internal — Listings")
@ApiHeader({
	name: "authorization",
	description: "`Bearer <LISTING_INGEST_SECRET>`",
	required: true,
})
@ApiForbiddenResponse({ description: "LISTING_INGEST_SECRET did not match." })
@ApiServiceUnavailableResponse({ description: "LISTING_INGEST_SECRET is not set." })
@ApiBadRequestResponse({ description: "The batch did not match the schema." })
@Controller("internal/listings")
export class ListingsController {
	private readonly logger = new Logger(ListingsController.name);
	private readonly secret: string | undefined;

	constructor(
		private readonly ingest: ListingIngestService,
		config: ConfigService<EnvironmentVariables, true>,
	) {
		this.secret = config.get("LISTING_INGEST_SECRET", { infer: true });
	}

	@Post("ingest")
	@AllowAnonymous()
	@ApiOperation({ summary: "Accept one batch of broker pages from a listing site" })
	@ApiOkResponse({ description: "The batch was accepted; created and updated counts." })
	async run(
		@Body() body: unknown,
		@Headers("authorization") authorization?: string,
	) {
		if (!this.secret) {
			this.logger.error({
				message: "LISTING_INGEST_SECRET is not set — refusing the batch.",
			});
			throw new ServiceUnavailableException("Listing ingest is not configured.");
		}

		if (!timingSafeEquals(authorization ?? "", `Bearer ${this.secret}`)) {
			throw new ForbiddenException();
		}

		try {
			return await this.ingest.ingest(parseListingBatch(body));
		} catch (error) {
			if (error instanceof InvalidInput) {
				throw new BadRequestException(error.message);
			}
			throw error;
		}
	}
}

function timingSafeEquals(a: string, b: string): boolean {
	if (a.length !== b.length) return false;

	let mismatch = 0;
	for (let index = 0; index < a.length; index += 1) {
		mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
	}

	return mismatch === 0;
}
```

- [ ] **Step 4: Nối module**

`apps/api/src/listings/listings.module.ts`:

```ts
import { Module } from "@nestjs/common";
import { FieldsModule } from "../fields/fields.module";
import { ListingFieldsService } from "./listing-fields.service";
import { ListingIngestService } from "./listing-ingest.service";
import { ListingsController } from "./listings.controller";

@Module({
	imports: [FieldsModule],
	controllers: [ListingsController],
	providers: [ListingFieldsService, ListingIngestService],
	exports: [ListingIngestService],
})
export class ListingsModule {}
```

Thêm `ListingsModule` vào `imports` của `apps/api/src/app.module.ts` (giữ thứ tự chữ cái, sau `LoggingModule`). Nếu `FieldsModule` chưa `exports: [FieldsService]`, thêm.

- [ ] **Step 5: Chạy typecheck**

```bash
bun run check-types
```

Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/listings apps/api/src/app.module.ts apps/api/src/config/env.validation.ts .env.example turbo.json
git commit -m "feat(api): cổng nội bộ nhận lô môi giới từ sàn, có khoá và lược đồ ở biên"
```

---

### Task 5: Phép đo cổng tiếp nhận — AC-1 tới AC-5

**Files:**
- Create: `apps/api/test/listing-ingest.integration.spec.ts`

**Interfaces:**
- Consumes: `ListingIngestService`, `ListingFieldsService`, `LISTING`, `MATCH_KEY` (Task 3, 4)
- Produces: không

- [ ] **Step 1: Viết bài kiểm**

`apps/api/test/listing-ingest.integration.spec.ts`:

```ts
import { afterAll, beforeEach, describe, expect, it } from "bun:test";
import { db, RecordSource } from "@crm/db";
import { parseListingBatch } from "@crm/validation/listing-ingest";
import { InvalidInput } from "@crm/validation";
import { AgentQueueService } from "../src/agent/agent-queue.service";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { FieldsService } from "../src/fields/fields.service";
import { ListingFieldsService } from "../src/listings/listing-fields.service";
import { ListingIngestService } from "../src/listings/listing-ingest.service";
import { LISTING, MATCH_KEY } from "../src/listings/listings-config";

const suffix = process.env.TEST_RUN_ID ?? "listing-ingest";
const keys = LISTING.fields.map((field) => field.key);

const agent = {
	fieldBackfillRecords: async () => ({ queued: 0, merged: 0 }),
} as unknown as AgentTriggerService;

const fields = new FieldsService(db, agent, new AgentQueueService(db));
const listingFields = new ListingFieldsService(fields);
const ingest = new ListingIngestService(db, listingFields);

function item(n: number, overrides: Record<string, unknown> = {}) {
	return {
		url: `https://nhatot.com/moi-gioi-${suffix}-${n}`,
		shopName: `Chuyên trang ${suffix} ${n}`,
		personName: `Người ${n}`,
		isCompany: false,
		hasLicense: n % 2 === 0,
		districts: ["Quận 7"],
		city: "Tp Hồ Chí Minh",
		listingsTotal: 100 + n,
		listingsNew30d: 60 + n,
		tier: "cao",
		phone: `090000${String(n).padStart(4, "0")}`,
		...overrides,
	};
}

function batch(items: ReturnType<typeof item>[], at = "2026-09-04T10:00:00Z") {
	return { source: "nhatot" as const, crawledAt: at, items };
}

async function urls(): Promise<string[]> {
	const definition = await db.fieldDefinition.findUnique({
		where: { entity_key: { entity: "CONTACT", key: MATCH_KEY } },
		select: { id: true },
	});
	if (!definition) return [];

	const rows = await db.fieldValue.findMany({
		where: { fieldId: definition.id, text: { contains: suffix } },
		select: { text: true },
	});

	return rows.map((row) => row.text ?? "");
}

async function cleanup() {
	const ids = await db.contact.findMany({
		where: { source: RecordSource.LISTING, firstName: { contains: "Người" } },
		select: { id: true },
	});
	await db.contact.deleteMany({ where: { id: { in: ids.map((row) => row.id) } } });
	await db.agentTask.deleteMany({ where: { contactId: { in: ids.map((row) => row.id) } } });
}

beforeEach(cleanup);
afterAll(async () => {
	await cleanup();
	await db.fieldDefinition.deleteMany({
		where: { entity: "CONTACT", key: { in: keys } },
	});
});

describe("cổng tiếp nhận lô từ sàn", () => {
	it("AC-1 · mỗi mục thành một cá nhân nguồn sàn với chín trường đúng", async () => {
		const result = await ingest.ingest(parseListingBatch(batch([item(1), item(2), item(3)])));

		expect(result).toEqual({ created: 3, updated: 0 });
		expect((await urls()).length).toBe(3);

		const contact = await db.contact.findFirst({
			where: { source: RecordSource.LISTING, firstName: "Người" },
			select: { id: true, phone: true, fieldValues: { select: { text: true, number: true } } },
		});
		expect(contact?.fieldValues.length).toBe(9);
	});

	it("AC-2 · gửi lại cùng lô thì cập nhật, không tạo trùng", async () => {
		await ingest.ingest(parseListingBatch(batch([item(1)])));
		const before = await db.contact.count({ where: { source: RecordSource.LISTING } });

		const result = await ingest.ingest(
			parseListingBatch(
				batch([item(1, { listingsTotal: 999 })], "2026-09-05T10:00:00Z"),
			),
		);

		expect(result).toEqual({ created: 0, updated: 1 });
		expect(await db.contact.count({ where: { source: RecordSource.LISTING } })).toBe(before);

		const definition = await db.fieldDefinition.findUnique({
			where: { entity_key: { entity: "CONTACT", key: "tin_dang" } },
			select: { id: true },
		});
		const value = await db.fieldValue.findFirst({
			where: { fieldId: definition?.id },
			select: { number: true },
		});
		expect(Number(value?.number)).toBe(999);
	});

	it("AC-2 · lô vắng số điện thoại thì giữ số cũ, lô có số thì đè", async () => {
		await ingest.ingest(parseListingBatch(batch([item(1, { phone: "0900000001" })])));

		const { phone: _drop, ...withoutPhone } = item(1);
		await ingest.ingest(parseListingBatch(batch([withoutPhone], "2026-09-05T10:00:00Z")));
		let contact = await db.contact.findFirst({
			where: { source: RecordSource.LISTING },
			select: { phone: true },
		});
		expect(contact?.phone).toBe("0900000001");

		await ingest.ingest(
			parseListingBatch(batch([item(1, { phone: "0911111111" })], "2026-09-06T10:00:00Z")),
		);
		contact = await db.contact.findFirst({
			where: { source: RecordSource.LISTING },
			select: { phone: true },
		});
		expect(contact?.phone).toBe("0911111111");
	});

	it("AC-3 · một mục sai lược đồ thì cả lô bị từ chối và không ghi gì", () => {
		const { listingsTotal: _drop, ...broken } = item(2);

		expect(() => parseListingBatch(batch([item(1), broken as never]))).toThrow(InvalidInput);
	});

	it("AC-4 · không xếp việc nghiên cứu cho người đến từ sàn", async () => {
		await ingest.ingest(parseListingBatch(batch([item(1)])));

		const contacts = await db.contact.findMany({
			where: { source: RecordSource.LISTING },
			select: { id: true, enrichmentStatus: true },
		});
		const tasks = await db.agentTask.count({
			where: { kind: "identify", contactId: { in: contacts.map((row) => row.id) } },
		});

		expect(tasks).toBe(0);
		expect(contacts[0]?.enrichmentStatus).toBe("SKIPPED");
	});

	it("AC-5 · chín trường tồn tại với khoá cố định và tác nhân không điền được", async () => {
		await ingest.ingest(parseListingBatch(batch([item(1)])));

		const definitions = await db.fieldDefinition.findMany({
			where: { entity: "CONTACT", key: { in: keys } },
			select: { key: true, label: true, agentFilled: true, showOnFilter: true },
		});

		expect(definitions.length).toBe(9);
		expect(definitions.every((row) => row.agentFilled === false)).toBe(true);
		expect(
			definitions.filter((row) => row.showOnFilter).map((row) => row.key).sort(),
		).toEqual(["chung_chi", "hinh_thai", "san_luong"]);
	});
});
```

- [ ] **Step 2: Chạy tới xanh**

```bash
bun run db:test && cd apps/api && bun test test/listing-ingest.integration.spec.ts
```

Expected: PASS, 6 bài. Sửa dịch vụ cho tới khi xanh.

- [ ] **Step 3: Chiều đỏ — bốn lượt phá, mỗi lượt một bài**

Trong bản sao cây, lần lượt:
1. Bỏ bước tìm theo `MATCH_KEY` (luôn `create`) → bài AC-2 đầu ĐỎ với «created: 1».
2. Ghi `phone: item.phone ?? null` thay vì `phone ? { phone } : {}` → bài giữ số ĐỎ với «expected 0900000001».
3. Gọi `agent.contactCreated` trong `one()` → bài AC-4 ĐỎ với đếm khác 0.
4. Đổi `agentFilled` mặc định thành `true` → bài AC-5 ĐỎ.

Mỗi lượt chạy lại bài, xác nhận nó đỏ với đúng thông điệp, rồi trả nguyên trạng.

- [ ] **Step 4: Commit**

```bash
git add apps/api/test/listing-ingest.integration.spec.ts
git commit -m "test(api): sáu chân cho cổng tiếp nhận, mỗi chân có chiều đỏ"
```

---

### Task 6: Chiến dịch — hằng số, lược đồ, dịch vụ

**Files:**
- Create: `apps/api/src/campaigns/campaigns-config.ts`
- Create: `apps/api/src/campaigns/campaigns.contracts.ts`
- Create: `apps/api/src/campaigns/campaigns.service.ts`

**Interfaces:**
- Consumes: model `Campaign`, `CampaignTouch` (Task 1); `SavedViewFilters` (`@crm/validation/saved-view`); `ContactsService.list`
- Produces: `CampaignsService` với `list`, `byId`, `create`, `start`, `finish`, `members`, `touch`, `usedViewIds(viewId): Promise<string[]>`; `CAMPAIGNS` (hằng); các lược đồ `campaignCreateInput`, `campaignIdInput`, `campaignMembersInput`, `campaignTouchInput`, `campaignDetailOutput`, `campaignListOutput`, `campaignMembersOutput`, `campaignTouchOutput`

- [ ] **Step 1: Hằng số vùng**

`apps/api/src/campaigns/campaigns-config.ts`:

```ts
export const CAMPAIGNS = {
	name: { min: 1, max: 120 },
	script: { max: 2000 },
	members: { pageSize: 50, maxPageSize: 200 },
	note: { max: 500 },
} as const;

export const ANSWERED_OUTCOMES = ["ANSWERED", "MEETING"] as const;
```

- [ ] **Step 2: Lược đồ vào ra**

`apps/api/src/campaigns/campaigns.contracts.ts`:

```ts
import { z } from "zod";
import { CAMPAIGNS } from "./campaigns-config";

export const campaignStatus = z.enum(["DRAFT", "RUNNING", "FINISHED"]);
export const touchOutcome = z.enum([
	"NO_ANSWER",
	"ANSWERED",
	"MEETING",
	"DECLINED",
	"WRONG_NUMBER",
]);

export const campaignIdInput = z.object({ id: z.string() });

export const campaignCreateInput = z.object({
	name: z.string().trim().min(CAMPAIGNS.name.min).max(CAMPAIGNS.name.max),
	savedViewId: z.string(),
	script: z.string().trim().max(CAMPAIGNS.script.max).optional(),
	ownerId: z.string().nullable().optional(),
});

export const campaignMembersInput = z.object({
	id: z.string(),
	page: z.number().int().min(1).default(1),
	pageSize: z
		.number()
		.int()
		.min(1)
		.max(CAMPAIGNS.members.maxPageSize)
		.default(CAMPAIGNS.members.pageSize),
	uncalledOnly: z.boolean().default(false),
	q: z.string().trim().default(""),
});

export const campaignTouchInput = z.object({
	id: z.string(),
	contactId: z.string(),
	outcome: touchOutcome,
	note: z.string().trim().max(CAMPAIGNS.note.max).optional(),
});

const stats = z.object({
	members: z.number().nullable(),
	called: z.number(),
	answered: z.number(),
	meetings: z.number(),
	answerRate: z.number().nullable(),
	meetingRate: z.number().nullable(),
});

export const campaignSummaryOutput = z.object({
	id: z.string(),
	name: z.string(),
	status: campaignStatus,
	segmentName: z.string(),
	savedViewId: z.string(),
	called: z.number(),
	answered: z.number(),
	owner: z.object({ id: z.string(), name: z.string() }).nullable(),
	createdAt: z.string(),
});

export const campaignListOutput = z.array(campaignSummaryOutput);

export const campaignDetailOutput = campaignSummaryOutput.extend({
	script: z.string().nullable(),
	startedAt: z.string().nullable(),
	finishedAt: z.string().nullable(),
	stats,
	control: stats.nullable(),
});

export const campaignMemberOutput = z.object({
	id: z.string(),
	name: z.string(),
	phone: z.string().nullable(),
	tier: z.string().nullable(),
	listingsNew30d: z.number().nullable(),
	districts: z.string().nullable(),
	lastOutcome: touchOutcome.nullable(),
});

export const campaignMembersOutput = z.object({
	rows: z.array(campaignMemberOutput),
	total: z.number(),
});

export const campaignTouchOutput = z.object({
	id: z.string(),
	contactId: z.string(),
	outcome: touchOutcome,
	activityId: z.string(),
});

export type CampaignCreateInput = z.infer<typeof campaignCreateInput>;
export type CampaignMembersInput = z.infer<typeof campaignMembersInput>;
export type CampaignTouchInput = z.infer<typeof campaignTouchInput>;
```

- [ ] **Step 3: Dịch vụ**

`apps/api/src/campaigns/campaigns.service.ts` — điểm mấu chốt là số đo đếm cá nhân riêng biệt và đối chứng loại chính nó:

```ts
import { ActivityType, type Db, type Prisma } from "@crm/db";
import { parseSavedViewFilters } from "@crm/validation/saved-view";
import {
	BadRequestException,
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { ContactsService } from "../contacts/contacts.service";
import { InjectDatabase } from "../database/database.constants";
import { ANSWERED_OUTCOMES } from "./campaigns-config";
import type {
	CampaignCreateInput,
	CampaignMembersInput,
	CampaignTouchInput,
} from "./campaigns.contracts";

type Stats = {
	members: number | null;
	called: number;
	answered: number;
	meetings: number;
	answerRate: number | null;
	meetingRate: number | null;
};

function rate(part: number, whole: number): number | null {
	return whole === 0 ? null : part / whole;
}

@Injectable()
export class CampaignsService {
	private readonly logger = new Logger(CampaignsService.name);

	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly contacts: ContactsService,
	) {}

	async statsFor(where: Prisma.CampaignTouchWhereInput): Promise<Stats> {
		const [called, answered, meetings] = await Promise.all([
			this.db.campaignTouch.findMany({ where, select: { contactId: true }, distinct: ["contactId"] }),
			this.db.campaignTouch.findMany({
				where: { ...where, outcome: { in: [...ANSWERED_OUTCOMES] } },
				select: { contactId: true },
				distinct: ["contactId"],
			}),
			this.db.campaignTouch.findMany({
				where: { ...where, outcome: "MEETING" },
				select: { contactId: true },
				distinct: ["contactId"],
			}),
		]);

		return {
			members: null,
			called: called.length,
			answered: answered.length,
			meetings: meetings.length,
			answerRate: rate(answered.length, called.length),
			meetingRate: rate(meetings.length, called.length),
		};
	}

	async controlFor(campaignId: string): Promise<Stats | null> {
		const others = await this.db.campaign.count({ where: { id: { not: campaignId } } });
		if (others === 0) return null;

		return this.statsFor({ campaignId: { not: campaignId } });
	}

	async touch(input: CampaignTouchInput, userId: string) {
		const campaign = await this.db.campaign.findUnique({
			where: { id: input.id },
			select: { id: true, name: true, status: true },
		});
		if (!campaign) throw new NotFoundException(`No campaign with id ${input.id}.`);
		if (campaign.status !== "RUNNING") {
			throw new ConflictException(
				`This campaign is ${campaign.status}; only a RUNNING campaign accepts call outcomes.`,
			);
		}

		return this.db.$transaction(async (tx) => {
			const activity = await tx.activity.create({
				data: {
					type: ActivityType.CALL,
					subject: `${input.outcome} · ${campaign.name}`,
					body: input.note ?? null,
					occurredAt: new Date(),
					contactId: input.contactId,
					createdById: userId,
				},
				select: { id: true },
			});

			const created = await tx.campaignTouch.create({
				data: {
					campaignId: campaign.id,
					contactId: input.contactId,
					activityId: activity.id,
					outcome: input.outcome,
					note: input.note ?? null,
					createdById: userId,
				},
				select: { id: true, contactId: true, outcome: true, activityId: true },
			});

			return created;
		});
	}

	async usedViewIds(savedViewId: string): Promise<string[]> {
		const rows = await this.db.campaign.findMany({
			where: { savedViewId },
			select: { name: true },
		});

		return rows.map((row) => row.name);
	}
}
```

Thêm `list`, `byId`, `create`, `start`, `finish`, `members` theo cùng khuôn. `members` đọc `filters` của góc nhìn bằng `parseSavedViewFilters`, gọi `this.contacts.list` với đúng bộ lọc đó, rồi ghép «kết quả gần nhất» từ `campaignTouch` theo `contactId`. `start` và `finish` là `update` có điều kiện trạng thái; sai trạng thái ném `ConflictException` nêu trạng thái hiện tại.

- [ ] **Step 4: Typecheck**

```bash
bun run check-types
```

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/campaigns
git commit -m "feat(api): chiến dịch có vòng đời, thành viên theo góc nhìn, số đo đếm cá nhân riêng biệt"
```

---

### Task 7: Bảy thủ tục tRPC và chặn xoá góc nhìn

**Files:**
- Create: `apps/api/src/campaigns/campaigns.router.ts`
- Create: `apps/api/src/campaigns/campaigns.module.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/src/saved-views/saved-views.service.ts`
- Modify: `apps/api/src/saved-views/saved-views.module.ts`

**Interfaces:**
- Consumes: `CampaignsService` (Task 6)
- Produces: router `campaigns` với `list`, `byId`, `create`, `start`, `finish`, `members`, `touch`; `SavedViewsService.delete` từ chối khi góc nhìn đang dùng

- [ ] **Step 1: Router**

`apps/api/src/campaigns/campaigns.router.ts` theo đúng khuôn `companies.router.ts`: `@Router({ alias: "campaigns" })`, `@UseMiddlewares(AuthMiddleware)`, mỗi thủ tục khai `input`, `output`, `meta: restMeta(...)`. `create`, `start`, `finish`, `touch` là `@Mutation`; `list`, `byId`, `members` là `@Query`. `touch` và `create` lấy `ctx.auth.user.id` từ `@Ctx() ctx: AuthedTrpcContext`.

- [ ] **Step 2: Chặn xoá góc nhìn đang dùng**

Trong `apps/api/src/saved-views/saved-views.service.ts`, trước `this.db.savedView.delete`:

```ts
		const used = await this.campaigns.usedViewIds(id);
		if (used.length > 0) {
			throw new ConflictException(
				`This view is the segment of ${used.join(", ")}. Finish or repoint those campaigns first.`,
			);
		}
```

Thêm `CampaignsService` vào hàm dựng và `CampaignsModule` vào `imports` của `SavedViewsModule`. Nếu sinh vòng phụ thuộc, dùng `forwardRef` ở cả hai module.

- [ ] **Step 3: Nối module và sinh lại kiểu tRPC**

Thêm `CampaignsModule` vào `apps/api/src/app.module.ts`. Rồi:

```bash
cd apps/api && bun run dev:trpc --once 2>/dev/null || bun run check-types
```

Expected: `src/generated/server.ts` có `campaigns`. Nếu không, chạy `bun run check-types` từ gốc — nó chạy bộ sinh.

- [ ] **Step 4: Typecheck và lint**

```bash
bun run check-types && bun run lint
```

Expected: exit 0 cả hai.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/campaigns apps/api/src/saved-views apps/api/src/app.module.ts apps/api/src/generated
git commit -m "feat(api): bảy thủ tục chiến dịch, và góc nhìn đang có chiến dịch thì không xoá"
```

---

### Task 8: Phép đo chiến dịch — AC-6 tới AC-11, AC-16

**Files:**
- Create: `apps/api/test/campaigns.spec.ts`

**Interfaces:**
- Consumes: `CampaignsService` (Task 6), `SavedViewsService` (Task 7)
- Produces: không

- [ ] **Step 1: Viết bài kiểm, một bài một tiêu chí**

`apps/api/test/campaigns.spec.ts` phải có đủ bảy bài, mỗi bài đặt tên theo tiêu chí:

```ts
it("AC-6 · thành viên bằng đúng kết quả bộ lọc của góc nhìn", async () => { … });
it("AC-7 · vòng đời ba trạng thái, đã kết thúc không bắt đầu lại", async () => { … });
it("AC-8 · một cú ghi tạo đúng một lượt gọi và đúng một hoạt động Gọi", async () => { … });
it("AC-8 · hoạt động hỏng thì không còn lượt gọi nào", async () => { … });
it("AC-9 · nháp và đã kết thúc từ chối ghi, không để lại vết", async () => { … });
it("AC-10 · số đo đếm cá nhân riêng biệt, đối chứng không tính chính nó", async () => { … });
it("AC-10 · chưa có chiến dịch khác thì đối chứng là null, không phải tỷ số 1", async () => { … });
it("AC-11 · góc nhìn đang có chiến dịch thì không xoá được, thông điệp nêu tên", async () => { … });
it("AC-16 · kết thúc ghi mốc, và sau đó bắt đầu bị từ chối", async () => { … });
```

Bài AC-10 đầu tiên viết đầy đủ như sau, các bài khác theo cùng khuôn:

```ts
it("AC-10 · số đo đếm cá nhân riêng biệt, đối chứng không tính chính nó", async () => {
	const { campaign, other, contacts } = await fixture();

	await service.touch({ id: campaign.id, contactId: contacts[0].id, outcome: "NO_ANSWER" }, userId);
	await service.touch({ id: campaign.id, contactId: contacts[0].id, outcome: "ANSWERED" }, userId);
	await service.touch({ id: campaign.id, contactId: contacts[1].id, outcome: "MEETING" }, userId);
	await service.touch({ id: other.id, contactId: contacts[2].id, outcome: "NO_ANSWER" }, userId);

	const stats = await service.statsFor({ campaignId: campaign.id });
	expect(stats.called).toBe(2);
	expect(stats.answered).toBe(2);
	expect(stats.meetings).toBe(1);
	expect(stats.answerRate).toBe(1);

	const control = await service.controlFor(campaign.id);
	expect(control?.called).toBe(1);
	expect(control?.answered).toBe(0);
});
```

- [ ] **Step 2: Chạy tới xanh**

```bash
bun run db:test && cd apps/api && bun test test/campaigns.spec.ts
```

Expected: PASS, 9 bài.

- [ ] **Step 3: Chiều đỏ — bốn lượt phá**

1. Bỏ `distinct: ["contactId"]` → bài AC-10 đầu ĐỎ với `called` bằng 3.
2. Bỏ điều kiện `campaignId: { not: campaignId }` trong `controlFor` → bài AC-10 thứ hai ĐỎ.
3. Bỏ kiểm `status !== "RUNNING"` → bài AC-9 ĐỎ với đếm khác 0.
4. Bỏ `$transaction` trong `touch` → bài «hoạt động hỏng» ĐỎ vì còn một lượt gọi mồ côi.

Mỗi lượt chạy lại, xác nhận đỏ đúng bài, trả nguyên trạng.

- [ ] **Step 4: Commit**

```bash
git add apps/api/test/campaigns.spec.ts
git commit -m "test(api): chín chân cho chiến dịch, mỗi chân có chiều đỏ"
```

---

### Task 9: Bộ cào — gieo, hồ sơ, lộ số, phát lô

**Files:**
- Create: `tools/listing-crawl/pyproject.toml`
- Create: `tools/listing-crawl/README.md`
- Create: `tools/listing-crawl/config.toml`
- Create: `tools/listing-crawl/listing_crawl/__init__.py`
- Create: `tools/listing-crawl/listing_crawl/__main__.py`
- Create: `tools/listing-crawl/listing_crawl/tiers.py`
- Create: `tools/listing-crawl/listing_crawl/parse.py`
- Create: `tools/listing-crawl/listing_crawl/emit.py`
- Create: `tools/listing-crawl/schemas/listing-ingest.schema.json`
- Create: `tools/listing-crawl/tests/fixtures/directory.html`, `tests/fixtures/profile.html`, `tests/fixtures/profile-next-data.json`
- Create: `tools/listing-crawl/tests/test_parse.py`, `tests/test_tiers.py`, `tests/test_schema_ratchet.py`

**Interfaces:**
- Consumes: lược đồ JSON sinh từ Task 2
- Produces: lệnh `python -m listing_crawl [--limit N] [--fixtures] [--dry-run] [--out PATH] [--log PATH]`; hàm `tier_of(new30d: int) -> str`; `parse_profile(html: str, next_data: dict) -> dict`; `parse_directory(html: str) -> list[dict]`

**`independent: true`** với Task 11 (kho chuỗi) — không dùng chung tệp nào. Task 10 phụ thuộc task này vì nó đọc tệp lô do đây phát ra.

- [ ] **Step 1: Dựng venv và ghim phiên bản**

```bash
cd tools/listing-crawl
python3.12 -m venv .venv
./.venv/bin/pip install "crawl4ai==0.9.2" "lxml" "jsonschema" "transformers<5" "sentence-transformers<6" "huggingface-hub<1"
./.venv/bin/python -c "import crawl4ai; print(crawl4ai.__version__)"
```

Expected: in `0.9.2`. Không có python3.12 thì `brew install python@3.12` trước; đừng dùng 3.9 mặc định của macOS.

Ghi vào `tools/listing-crawl/README.md` bốn cái bẫy đã biết từ xưởng `~/dev/crawl`: ghim `transformers<5` (nâng mù là hỏng), chạy script từ trong `tools/listing-crawl` chứ không từ gốc kho, mô hình ngôn ngữ không được gọi ở vòng chạy, và `.venv` không vào turborepo.

- [ ] **Step 2: Viết bài kiểm ngưỡng trước**

`tools/listing-crawl/tests/test_tiers.py`:

```python
import unittest

from listing_crawl.tiers import tier_of


class TierBoundaries(unittest.TestCase):
    def test_bac_dung_tai_nguong(self):
        self.assertEqual(tier_of(60), "cao")
        self.assertEqual(tier_of(20), "vua")
        self.assertEqual(tier_of(1), "thap")
        self.assertEqual(tier_of(0), "ngu")

    def test_sat_duoi_nguong_khong_len_bac(self):
        self.assertEqual(tier_of(59), "vua")
        self.assertEqual(tier_of(19), "thap")
```

- [ ] **Step 3: Chạy để thấy nó đỏ**

```bash
cd tools/listing-crawl && ./.venv/bin/python -m unittest tests.test_tiers -v
```

Expected: FAIL — `No module named 'listing_crawl.tiers'`.

- [ ] **Step 4: Viết ngưỡng**

`tools/listing-crawl/listing_crawl/tiers.py`:

```python
import tomllib
from pathlib import Path

CONFIG = Path(__file__).resolve().parent.parent / "config.toml"


def thresholds() -> dict[str, int]:
    with CONFIG.open("rb") as handle:
        return tomllib.load(handle)["tiers"]


def tier_of(new_30d: int) -> str:
    limits = thresholds()
    if new_30d >= limits["cao"]:
        return "cao"
    if new_30d >= limits["vua"]:
        return "vua"
    if new_30d >= limits["thap"]:
        return "thap"
    return "ngu"
```

`tools/listing-crawl/config.toml`:

```toml
[tiers]
cao = 60
vua = 20
thap = 1

[crawl]
sitemap = "https://www.nhatot.com/sitemap-index.xml"
profile_prefix = "/moi-gioi-"
respect_robots = true
phone_reveal_cap = 200
request_delay_seconds = 1.5

[ingest]
url = "http://localhost:3001/internal/listings/ingest"
batch_size = 200
```

- [ ] **Step 5: Chạy tới xanh**

```bash
cd tools/listing-crawl && ./.venv/bin/python -m unittest tests.test_tiers -v
```

Expected: PASS, 2 bài.

- [ ] **Step 6: Lưu mẫu, rút gọn và bỏ dữ liệu cá nhân thật**

Lấy mẫu bằng bộ cào ở chế độ ghi mẫu, rồi CẮT: giữ đúng khối thẻ và khối hồ sơ cần cho phép đo, thay tên người thật bằng `Nguyễn Văn Mẫu`, số điện thoại bằng `0900000000`, địa chỉ trang bằng `https://nhatot.com/moi-gioi-mau-1`. Mẫu phải giữ nguyên **hình dạng** thẻ (lớp CSS, thứ tự nút) vì đó là thứ khuôn bóc đọc.

- [ ] **Step 7: Viết bài kiểm bóc trước**

`tools/listing-crawl/tests/test_parse.py`:

```python
import json
import unittest
from pathlib import Path

from listing_crawl.parse import parse_directory, parse_profile

FIXTURES = Path(__file__).parent / "fixtures"


class ParseProfile(unittest.TestCase):
    def setUp(self):
        self.html = (FIXTURES / "profile.html").read_text(encoding="utf-8")
        self.next_data = json.loads(
            (FIXTURES / "profile-next-data.json").read_text(encoding="utf-8")
        )

    def test_boc_dung_tam_gia_tri(self):
        item = parse_profile(self.html, self.next_data)

        self.assertEqual(item["shopName"], "Chuyên trang mẫu")
        self.assertEqual(item["personName"], "Nguyễn Văn Mẫu")
        self.assertEqual(item["listingsNew30d"], 164)
        self.assertEqual(item["districts"], ["Quận 7", "Huyện Nhà Bè"])
        self.assertTrue(item["hasLicense"])
        self.assertFalse(item["isCompany"])
        self.assertEqual(item["tier"], "cao")

    def test_mau_bi_pha_thi_bao_loi_goi_ten_truong(self):
        broken = self.html.replace("164", "").replace("tin mới", "")

        with self.assertRaises(ValueError) as raised:
            parse_profile(broken, self.next_data)

        self.assertIn("listingsNew30d", str(raised.exception))


class ParseDirectory(unittest.TestCase):
    def test_boc_tong_tin_tu_the(self):
        html = (FIXTURES / "directory.html").read_text(encoding="utf-8")
        rows = parse_directory(html)

        self.assertGreaterEqual(len(rows), 1)
        self.assertEqual(rows[0]["listingsTotal"], 436)
```

- [ ] **Step 8: Viết bộ bóc cho tới khi xanh**

`tools/listing-crawl/listing_crawl/parse.py` — bóc bằng lxml theo khuôn CSS cố định, không gọi mô hình ngôn ngữ. Mỗi trường thiếu thì `raise ValueError` nêu tên trường; đó là cái làm chiều đỏ ghim đúng thông điệp.

```bash
cd tools/listing-crawl && ./.venv/bin/python -m unittest tests.test_parse -v
```

Expected: PASS, 3 bài.

- [ ] **Step 9: Bánh cóc lược đồ**

`tools/listing-crawl/tests/test_schema_ratchet.py`:

```python
import json
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
COMMITTED = Path(__file__).resolve().parents[1] / "schemas" / "listing-ingest.schema.json"


class SchemaRatchet(unittest.TestCase):
    def test_ban_commit_khop_ban_sinh_lai_tu_nguon(self):
        with tempfile.NamedTemporaryFile(suffix=".json") as handle:
            subprocess.run(
                ["bun", "run", "schema:listing-ingest", handle.name],
                cwd=ROOT / "packages" / "validation",
                check=True,
                capture_output=True,
            )
            fresh = json.loads(Path(handle.name).read_text(encoding="utf-8"))

        self.assertEqual(
            json.loads(COMMITTED.read_text(encoding="utf-8")),
            fresh,
            "Lược đồ đã đổi ở nguồn — chạy lại bun run schema:listing-ingest và commit tệp mới.",
        )
```

Sinh bản đầu:

```bash
cd packages/validation && bun run schema:listing-ingest ../../tools/listing-crawl/schemas/listing-ingest.schema.json
cd ../../tools/listing-crawl && ./.venv/bin/python -m unittest tests.test_schema_ratchet -v
```

Expected: PASS.

- [ ] **Step 10: Chiều đỏ của bánh cóc**

Trong bản sao, thêm một trường vào `listingBatch` mà không sinh lại tệp; chạy lại bài — phải ĐỎ với thông điệp «Lược đồ đã đổi ở nguồn». Trả nguyên trạng.

- [ ] **Step 11: Viết đường chạy chính**

`tools/listing-crawl/listing_crawl/__main__.py` — ba lượt (gieo từ sơ đồ site, tải hồ sơ, lộ số cho mức cao có trần), cờ `--limit`, `--fixtures`, `--dry-run`, `--out`, `--log`. Ghi vào nhật ký: số gieo, số lấy được, số bị chặn, số có số điện thoại, tứ phân vị tin mới. `--limit 0` thoát mã 2 với «không có địa chỉ nào». Bật `check_robots_txt=True`.

- [ ] **Step 12: Chạy chế độ mẫu**

```bash
cd tools/listing-crawl && ./.venv/bin/python -m listing_crawl --fixtures --dry-run --out /tmp/probe-batch.json && head -3 /tmp/probe-batch.json
```

Expected: exit 0, tệp là JSON có `source`, `crawledAt`, `items`.

- [ ] **Step 13: Commit**

```bash
git add tools/listing-crawl
git commit -m "feat(tools): bộ cào môi giới từ sàn, bóc bằng khuôn cố định, không gọi mô hình ở vòng chạy"
```

---

### Task 10: Vòng khép kín — lô Python đi qua cổng thật

**Files:**
- Create: `apps/api/test/listing-fixture-batch.spec.ts`

**Interfaces:**
- Consumes: tệp lô do Task 9 phát; `ListingIngestService` (Task 4)
- Produces: không

- [ ] **Step 1: Viết bài kiểm**

`apps/api/test/listing-fixture-batch.spec.ts`:

```ts
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, expect, it } from "bun:test";
import { db, RecordSource } from "@crm/db";
import { parseListingBatch } from "@crm/validation/listing-ingest";
import { AgentQueueService } from "../src/agent/agent-queue.service";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { FieldsService } from "../src/fields/fields.service";
import { ListingFieldsService } from "../src/listings/listing-fields.service";
import { ListingIngestService } from "../src/listings/listing-ingest.service";

const BATCH = resolve(
	import.meta.dir,
	"../../../_acceptance/tiep-thi-tuyen-doi-tac/evidence/fixture-batch.json",
);

const agent = {
	fieldBackfillRecords: async () => ({ queued: 0, merged: 0 }),
} as unknown as AgentTriggerService;

const ingest = new ListingIngestService(
	db,
	new ListingFieldsService(new FieldsService(db, agent, new AgentQueueService(db))),
);

afterAll(async () => {
	await db.contact.deleteMany({ where: { source: RecordSource.LISTING } });
});

it("lô do bộ cào phát đi qua lược đồ thật và dịch vụ thật", async () => {
	expect(existsSync(BATCH)).toBe(true);

	const raw = JSON.parse(readFileSync(BATCH, "utf8"));
	const parsed = parseListingBatch(raw);
	const result = await ingest.ingest(parsed);

	expect(result.created).toBe(parsed.items.length);
	expect(result.updated).toBe(0);
});
```

- [ ] **Step 2: Chạy trọn chuỗi**

```bash
cd tools/listing-crawl && ./.venv/bin/python -m listing_crawl --fixtures --dry-run --out ../../_acceptance/tiep-thi-tuyen-doi-tac/evidence/fixture-batch.json
cd ../.. && bun run db:test && cd apps/api && bun test test/listing-fixture-batch
```

Expected: PASS.

- [ ] **Step 3: Chiều đỏ**

Sửa tệp lô trong bản sao cho `tier` thành `"CAO"` viết hoa; chạy lại — phải ĐỎ và thông điệp chứa `items.0.tier`. Trả nguyên trạng.

- [ ] **Step 4: Commit**

```bash
git add apps/api/test/listing-fixture-batch.spec.ts _acceptance/tiep-thi-tuyen-doi-tac/evidence/fixture-batch.json
git commit -m "test(api): lô của bộ cào đi qua lược đồ thật và dịch vụ thật, không dừng ở bản chép"
```

---

### Task 11: Kho chuỗi và hàm trạng thái

**Files:**
- Create: `apps/app/lib/messages/campaigns.ts`
- Create: `apps/app/app/(app)/[slug]/campaigns/campaign-state.ts`
- Create: `apps/app/test/campaign-states.spec.ts`
- Modify: `apps/app/test/messages-guard.spec.ts`

**Interfaces:**
- Consumes: `Locale` từ `@crm/ui/lib/locale`
- Produces: `campaignMessages(locale): CampaignMessages`; `listState(rows, isLoading)` trả `"loading" | "empty" | "rows"`; `createState(views)` trả `"no-views" | "ready"`

- [ ] **Step 1: Viết bài kiểm trước**

`apps/app/test/campaign-states.spec.ts`:

```ts
import { describe, expect, it } from "bun:test";
import { campaignMessages } from "@/lib/messages/campaigns";
import { createState, listState } from "@/app/(app)/[slug]/campaigns/campaign-state";

const DAU = /[ăâđêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;

describe("trạng thái hai màn chiến dịch", () => {
	it("không có dòng nào thì là rỗng, có dòng thì là danh sách", () => {
		expect(listState([], false)).toBe("empty");
		expect(listState([{ id: "a" }], false)).toBe("rows");
		expect(listState([], true)).toBe("loading");
	});

	it("chưa có góc nhìn cá nhân dùng chung thì hộp tạo nói thẳng", () => {
		expect(createState([])).toBe("no-views");
		expect(createState([{ id: "v1" }])).toBe("ready");
	});

	it("hai câu rỗng toàn cục có trong kho chuỗi và mang dấu", () => {
		const m = campaignMessages("vi");
		expect(m.empty.list).toMatch(DAU);
		expect(m.empty.noViews).toMatch(DAU);
	});
});
```

- [ ] **Step 2: Chạy để thấy nó đỏ**

```bash
cd apps/app && bun test test/campaign-states.spec.ts
```

Expected: FAIL — không tìm thấy module.

- [ ] **Step 3: Viết kho chuỗi và hàm trạng thái**

`apps/app/lib/messages/campaigns.ts` theo đúng khuôn `companies.ts`: `const en = { … }`, `export type CampaignMessages = typeof en`, `const vi = { … } satisfies CampaignMessages`, `const BANG = { en, vi }`, `export function campaignMessages(locale)`. Nội dung phủ đủ mười hai trạng thái của bảng đặc tả UX: tiêu đề trang, mô tả, nút, tiêu đề cột, năm nhãn kết quả, ba nhãn trạng thái, hai câu rỗng, câu đang tải, câu lỗi, nhãn dải số hai hàng, câu «chưa có đối chứng», câu «Chưa có số».

`campaign-state.ts` là hai hàm thuần, không nhập React.

- [ ] **Step 4: Chạy tới xanh**

```bash
cd apps/app && bun test test/campaign-states.spec.ts
```

Expected: PASS, 3 bài.

- [ ] **Step 5: Đưa kho chuỗi mới vào lưới đang có**

Thêm `["campaigns", campaignMessages]` vào mảng `MODULE` trong `apps/app/test/messages-guard.spec.ts`, và `"campaignMessages"` vào `HAM_KHO` trong `apps/app/test/duong-goi.ts`.

```bash
cd apps/app && bun test test/messages-guard.spec.ts
```

Expected: PASS — mọi giá trị tiếng Việt có dấu.

- [ ] **Step 6: Chiều đỏ**

Bỏ dấu một giá trị tiếng Việt trong bản sao; chạy lại lưới — phải ĐỎ và gọi tên khoá. Trả nguyên trạng.

- [ ] **Step 7: Commit**

```bash
git add apps/app/lib/messages/campaigns.ts "apps/app/app/(app)/[slug]/campaigns/campaign-state.ts" apps/app/test
git commit -m "feat(app): kho chuỗi chiến dịch nói tiếng Việt, và hai trạng thái rỗng đo được ở mức đơn vị"
```

---

### Task 12: Màn danh sách và hộp tạo

**Files:**
- Create: `apps/app/app/(app)/[slug]/campaigns/page.tsx`
- Create: `apps/app/app/(app)/[slug]/campaigns/campaigns-table.tsx`
- Create: `apps/app/app/(app)/[slug]/campaigns/create-campaign-sheet.tsx`
- Modify: `apps/app/components/app-icon-rail.tsx`
- Modify: `apps/app/lib/trpc/cache.ts`
- Modify: `CONTEXT.md`

**Interfaces:**
- Consumes: `trpc.campaigns.list`, `trpc.campaigns.create`, `trpc.savedViews.list` (Task 7); `campaignMessages`, `listState`, `createState` (Task 11)
- Produces: đường `/campaigns`; `cache.campaign(id)` và `cache.campaignList()`

- [ ] **Step 1: Thêm bốn mục vào từ điển sản phẩm**

`CONTEXT.md`, sau mục «Thỏa thuận hợp tác», thêm bốn mục theo đúng khuôn đang có (từ · nghĩa · `_Avoid_` · vì sao): **chiến dịch**, **phân khúc**, **sản lượng**, **số chứng chỉ**. Đây là điều kiện của luật N6; làm trước khi viết nhãn.

- [ ] **Step 2: Trang máy chủ**

`page.tsx` theo đúng khuôn `deals/page.tsx`: `generateMetadata` đọc `campaignMessages(await getLocale()).title`; `PageShell` + `PageShellHeader` + `PageShellActions` chứa `<CreateCampaignSheet />`; `Suspense` bọc phần tải trước `trpc.campaigns.list` và `trpc.users.list`; `HydrateClient` bọc `<CampaignsTable />`.

- [ ] **Step 3: Bảng danh sách**

`campaigns-table.tsx` theo khuôn `companies-table.tsx`: `DataTable` từ `@crm/ui`, cột Tên · Phân khúc · Trạng thái (`Badge`) · Đã gọi · Trả lời · Người phụ trách · Tạo lúc. Dùng `listState` cho ba trạng thái; trạng thái rỗng dùng `Empty` từ `@crm/ui`. Tên chiến dịch và tên phân khúc là dữ liệu người nhập → phần tử mang `translate="no"`.

- [ ] **Step 4: Hộp tạo**

`create-campaign-sheet.tsx` theo khuôn `create-contact-sheet.tsx`: `Sheet` mở bằng `useQueryState(SEARCH_PARAM.dialog.create)`; ba ô (Tên, Phân khúc, Lời chào); ô Phân khúc là `Select` liệt góc nhìn `CONTACT` mà người này thấy được, mỗi mục kèm số kết quả; `createState` quyết định hiện danh sách hay câu «chưa có góc nhìn» kèm liên kết sang màn Cá nhân. `onSuccess` gọi `cache.campaignList()` rồi điều hướng sang trang chiến dịch vừa tạo.

- [ ] **Step 5: Thanh bên và bộ nhớ đệm**

Thêm vào `ITEMS` trong `app-icon-rail.tsx`, sau `Deals`:

```ts
	{ title: "Chiến dịch", href: "/campaigns", icon: Bullhorn, match: "prefix" },
```

Nhập `Bullhorn from "@carbon/icons-react/es/Bullhorn"`. Thêm `campaign` và `campaignList` vào `lib/trpc/cache.ts` theo đúng khuôn `company`.

- [ ] **Step 6: Chạy thử bằng mắt**

```bash
bun run check-types && bun run lint
```

Rồi khởi động và mở màn:

```bash
cd apps/api && bun run dev:session manh.phan@onemount.com
```

Mở `http://localhost:3000/<slug>/campaigns`, xác nhận: trang rỗng nói tiếng Việt; bấm «Chiến dịch mới» ra hộp; chọn một góc nhìn cá nhân; tạo được.

- [ ] **Step 7: Commit**

```bash
git add "apps/app/app/(app)/[slug]/campaigns" apps/app/components/app-icon-rail.tsx apps/app/lib/trpc/cache.ts CONTEXT.md
git commit -m "feat(app): màn Chiến dịch và hộp tạo, bốn từ mới vào từ điển sản phẩm"
```

---

### Task 13: Trang chiến dịch — dải số và bảng gọi

**Files:**
- Create: `apps/app/app/(app)/[slug]/campaigns/[campaignId]/page.tsx`
- Create: `apps/app/app/(app)/[slug]/campaigns/[campaignId]/campaign-detail.tsx`
- Create: `apps/app/app/(app)/[slug]/campaigns/[campaignId]/members-search-params.ts`

**Interfaces:**
- Consumes: `trpc.campaigns.byId`, `trpc.campaigns.members`, `trpc.campaigns.touch`, `trpc.campaigns.start`, `trpc.campaigns.finish` (Task 7)
- Produces: đường `/campaigns/<id>`

- [ ] **Step 1: Tham số địa chỉ**

`members-search-params.ts` dùng `nuqs/server` cho `page` (số) và `uncalled` (bool) và `q` (chuỗi); kiểm khoá không đụng `RESERVED_SEARCH_PARAM_KEYS` bằng `assertUnreservedSearchParamKeys`.

- [ ] **Step 2: Trang máy chủ**

`page.tsx` tải trước `campaigns.byId` và `campaigns.members`, rồi giao cho `<CampaignDetail />`.

- [ ] **Step 3: Dải số hai hàng**

Trong `campaign-detail.tsx`, dùng `StatCard` từ `@crm/ui` xếp hai hàng: hàng «Chiến dịch này» và hàng «Đối chứng · chiến dịch khác». Khi `control` là `null`, hàng hai hiện câu «chưa có đối chứng» thay vì số. Khi `called` là 0, tỷ lệ hiện `—`. Số dùng `Intl.NumberFormat` theo vùng và lớp `tabular-nums`.

- [ ] **Step 4: Bảng thành viên và năm nút**

`DataTable` với cột Tên · Số điện thoại (`<a href={`tel:${phone}`}>`, hoặc câu «Chưa có số» khi rỗng) · Sản lượng · Tin mới 30 ngày · Địa bàn · Kết quả gần nhất · Ghi kết quả. Cột cuối là `ButtonGroup` năm nút; chỉ hiện khi `status === "RUNNING"`. Mỗi nút gọi `campaigns.touch`, `onSuccess` gọi `cache.campaign(id)` và `cache.activity()`.

Mọi ô dữ liệu từ sàn (tên chuyên trang, địa bàn, số điện thoại) mang `translate="no"`.

- [ ] **Step 5: Nút Bắt đầu và Kết thúc**

`Bắt đầu` hiện khi nháp, `Kết thúc` khi đang chạy, không nút nào khi đã kết thúc. Trạng thái là `Badge`.

- [ ] **Step 6: Chạy thử bằng mắt, ba trạng thái**

Khởi động, tạo một chiến dịch, xác nhận: nháp không có nút kết quả; bấm Bắt đầu thì năm nút hiện; bấm một kết quả thì dòng đổi và dải số đổi; mở hồ sơ cá nhân đó thấy hoạt động Gọi; bấm Kết thúc thì bảng thành chỉ đọc.

- [ ] **Step 7: Typecheck, lint, lint:slop**

```bash
bun run check-types && bun run lint && bun run lint:slop
```

Expected: exit 0 cả ba.

- [ ] **Step 8: Commit**

```bash
git add "apps/app/app/(app)/[slug]/campaigns/[campaignId]"
git commit -m "feat(app): trang chiến dịch — dải số hai hàng và bảng gọi một cú bấm"
```

---

### Task 14: Năm chặn lái trình duyệt

**Files:**
- Create: `_acceptance/tiep-thi-tuyen-doi-tac/rang/chien-dich.mjs`
- Create: `_acceptance/tiep-thi-tuyen-doi-tac/rang/be-mat.mjs`

**Interfaces:**
- Consumes: máy chủ đang chạy, `dev:session` để lấy phiên
- Produces: năm chặn `luong` · `chu` · `trang-thai` · `be-rong` · `thiet-ke`

- [ ] **Step 1: Khung chặn**

`chien-dich.mjs` theo khuôn `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs`: lấy phiên bằng `dev:session`, mở trình duyệt bằng `puppeteer-core`, đọc `APP_URL`/`API_URL` từ môi trường. Chặn chưa dựng thì in «CHUA DUNG» và thoát mã 2 — không bao giờ thoát 0.

- [ ] **Step 2: Chặn `luong` — E6, E9, E12**

Tạo góc nhìn qua tRPC, tạo chiến dịch có tên chứa mã lượt chạy, so số thành viên với `contacts.list` cùng bộ lọc, in `E6 THANH VIEN KHOP n=<so>`. Rồi đếm hoạt động Gọi của cá nhân đầu **trước** khi bấm (`n0`), bấm Bắt đầu, bấm «Trả lời», **tải lại trang**, đếm lại (`n1`), in `E9 CALL n0=<n0> n1=<n1> nonce=<ten chien dich>`; khẳng định `n1 - n0 === 1` và mục mới mang tên chiến dịch. Ghi thêm hai kết quả cho hai cá nhân, in `E12 SO DO da_goi=2 ...` và so với số tính lại từ API.

- [ ] **Step 3: Chặn `chu` — E15**

Khai TRƯỚC danh sách đóng mười hai mã `ST-*` và in từng mã kèm cách dựng. Mười mã dựng trên trình duyệt; hai mã rỗng toàn cục in «do o muc don vi — E25». Thu mọi chuỗi giao diện ở `lang=vi`, đối chiếu `lang=en`, còn lại phải bằng 0; mọi phần tử chứa dữ liệu sàn phải có `translate="no"`. Thiếu một mã thì thoát mã 2 gọi tên mã.

- [ ] **Step 4: Chặn `trang-thai` — E23**

Trang nháp đếm 0 nút kết quả; bấm Bắt đầu đếm 5; bấm Kết thúc, **tải lại**, đếm 0 nút kết quả và không nút Bắt đầu. In `E23 TRANG THAI nhap=0nut chay=5nut ketthuc=0nut batdau=an`.

- [ ] **Step 5: Chặn `be-rong` — E21 và `thiet-ke` — E20**

`be-rong`: ở 1024px không tiêu đề cột nào bị cắt; ở 768px mọi tiêu đề bị cắt mang dấu ba chấm và chữ đầy đủ tới cây trợ năng; in bảng tên cột × bề rộng × trạng thái. `thiet-ke`: chụp HTML đã render của hai màn vào `evidence/`, gọi `design-gate.mjs --mode dom --fail-on P0` trên từng tệp, in verdict.

- [ ] **Step 6: Chạy cả năm chặn**

```bash
cd apps/api && bun run dev:session manh.phan@onemount.com
# ở cửa sổ khác, từ gốc kho, với dev server đang chạy:
node _acceptance/tiep-thi-tuyen-doi-tac/rang/chien-dich.mjs luong
node _acceptance/tiep-thi-tuyen-doi-tac/rang/chien-dich.mjs chu
node _acceptance/tiep-thi-tuyen-doi-tac/rang/chien-dich.mjs trang-thai
node _acceptance/tiep-thi-tuyen-doi-tac/rang/chien-dich.mjs be-rong
node _acceptance/tiep-thi-tuyen-doi-tac/rang/chien-dich.mjs thiet-ke
```

Expected: cả năm exit 0 và in đúng dòng đã khai ở `evals.yaml`.

- [ ] **Step 7: Chiều đỏ của từng chặn**

`luong`: đếm lại mà không bấm → `n1 = n0` → đỏ. `chu`: trả một khoá về tiếng Anh → đỏ gọi tên khoá; bỏ một mã khỏi danh sách in → thoát mã 2. `trang-thai`: đếm nút trên trang nháp mà thấy 5 → đỏ. `be-rong`: rút khung cột xuống 300px → ở 1024px có cột bị cắt → đỏ. `thiet-ke`: tiêm một nút biểu tượng không nhãn trợ năng vào bản sao HTML → REJECT.

- [ ] **Step 8: Commit**

```bash
git add _acceptance/tiep-thi-tuyen-doi-tac/rang
git commit -m "test(acceptance): năm chặn lái cho chiến dịch, mỗi chặn có chiều đỏ"
```

---

### Task 15: Đóng vòng — chạy trọn bộ và hạ trạng thái hợp đồng

**Files:**
- Modify: `_acceptance/tiep-thi-tuyen-doi-tac/contract.md`

**Interfaces:**
- Consumes: mọi task trước
- Produces: `status: implemented`

- [ ] **Step 1: Chạy trọn bốn lệnh chứng minh**

```bash
bun run db:test && bun run test
bun run check-types
bun run lint
bun run lint:slop
```

Expected: exit 0 cả bốn. Bất kỳ lệnh nào đỏ thì sửa trước, không đi tiếp.

- [ ] **Step 2: Chạy bộ cào thật một lượt giới hạn**

```bash
cd tools/listing-crawl && ./.venv/bin/python -m listing_crawl --limit 50 --dry-run \
  --out ../../_acceptance/tiep-thi-tuyen-doi-tac/evidence/live-batch.json \
  --log ../../_acceptance/tiep-thi-tuyen-doi-tac/evidence/live-run.log
```

Expected: exit 0; nhật ký có số gieo, số lấy được, số bị chặn, tỷ lệ có số, tứ phân vị tin mới. Bị chặn hoàn toàn thì đó là BLOCKED, không phải PASS — báo người, đừng che.

- [ ] **Step 3: Hạ trạng thái hợp đồng**

Sửa frontmatter `_acceptance/tiep-thi-tuyen-doi-tac/contract.md`: `status: approved` → `status: implemented`. Đây là hành vi cuối của người viết code; bước chấm là việc của phiên tươi ở S4.

- [ ] **Step 4: Commit**

```bash
git add _acceptance/tiep-thi-tuyen-doi-tac
git commit -m "chore(acceptance): tiep-thi-tuyen-doi-tac đã viết xong, chờ nghiệm thu máy"
```

---

## Tự soát kế hoạch

**1. Phủ bản thiết kế.** Mục 3 kiến trúc → Task 4, 6, 9. Mục 4.1 bảng → Task 1. Mục 4.2 chín trường → Task 3. Mục 5 cổng → Task 4. Mục 6 bộ cào → Task 9. Mục 7 API và số đo → Task 6, 7. Mục 8 đặc tả UX → Task 11, 12, 13. Mục 9 đường đo → Task 6 (`statsFor`, `controlFor`) và Task 8. Mục 10 kiểm thử → Task 5, 8, 10, 11, 14. Mục 11 ngoài phạm vi → không task nào chạm. Mục 12 giả định còn mở → Task 9 và Task 15 trả lời bằng lượt chạy thật.

**2. Phủ hợp đồng.** AC-1…5 → Task 5. AC-6 → Task 8 (E7) và Task 14 (E6). AC-7 → Task 8. AC-8 → Task 8 (E10) và Task 14 (E9). AC-9 → Task 8. AC-10 → Task 8 (E13) và Task 14 (E12). AC-11 → Task 1 (`Restrict`) và Task 8 (thông điệp). AC-12 → Task 11 (E16, E25) và Task 14 (E15). AC-13 → Task 9 (E17) và Task 10 (E22). AC-14 → Task 15 (E18) rồi phán xét ở S4 (E19). AC-15 → Task 14 (E20, E21). AC-16 → Task 8 (E24) và Task 14 (E23). Không AC nào thiếu task.

**3. Nhất quán kiểu.** `tier_of` trả đúng bốn chuỗi của `LISTING_TIERS`; `TIER_LABELS` ánh xạ bốn chuỗi đó sang bốn nhãn của trường chọn; `MATCH_KEY` là `"trang_nhatot"` ở cả `listings-config.ts` lẫn bài kiểm; `statsFor` nhận `Prisma.CampaignTouchWhereInput` và cả `controlFor` lẫn `byId` gọi nó cùng một cách; `campaignDetailOutput.control` là `nullable` khớp `controlFor` trả `null`.

**4. Chỗ kế hoạch biết trước là sẽ vướng.** Khoá trường suy từ nhãn tiếng Việt có thể ra khoá xấu — Task 3 Step 5 có sẵn đường vòng. `SavedViewsModule` và `CampaignsModule` có thể sinh vòng phụ thuộc — Task 7 Step 2 nói cách gỡ. Python mặc định của máy là 3.9, không chạy được `tomllib` — Task 9 Step 1 bắt dựng 3.12.
