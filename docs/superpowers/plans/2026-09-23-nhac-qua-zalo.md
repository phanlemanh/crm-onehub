# Nhắc qua Zalo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mỗi người trong đội nối Zalo bằng mã 6 số và nhận nhắc buổi sáng qua Zalo hoặc Slack, theo lựa chọn của mình.

**Architecture:**
- Chỉ `apps/agent` gọi Zalo Bot API, trên nhịp dispatch mỗi phút.
- API NestJS chỉ đọc và ghi hàng dữ liệu.
- Luật dùng chung nằm ở `packages/db`, gồm sinh và băm mã, chọn kênh, và kênh sẽ dùng của một người. Cả agent lẫn API gọi đúng một bản của mỗi luật.
- Tin Zalo được phân tích ở biên bằng Zod trong `packages/validation`.

**Tech Stack:** Bun · Prisma (Postgres) · NestJS + nestjs-trpc · Next 16 App Router · TanStack Query · `@crm/ui` (shadcn) · eve (agent).

**Spec:** `docs/superpowers/specs/2026-09-23-nhac-qua-zalo-design.md` · hợp đồng `_acceptance/nhac-qua-zalo/contract.md` · evals `_acceptance/nhac-qua-zalo/evals.yaml`.

## Global Constraints

- **Không viết chú thích trong code**, cả code mới lẫn code sửa. Luật này có trong `AGENTS.md`.
- **Hằng số tinh chỉnh được** nằm ở `ZALO_LIEN_KET` (`packages/db/src/zalo-lien-ket.ts`) và `ZALO` (`apps/agent/agent/lib/zalo-config.ts`). Đơn vị suy từ `SECOND_MS`/`MINUTE_MS`/`HOUR_MS`, không viết số rời, và đặt `as const`.
- **Giá trị cố định:**
  - mã có 6 chữ số, sống 15 phút;
  - quá 5 lần sai trong 1 giờ thì bị bỏ qua;
  - bot bị coi là im sau 5 phút;
  - mỗi nhịp gọi `getUpdates` tối đa 20 lần, với `timeout` 1 giây;
  - giữ dấu `message_id` 7 ngày;
  - một tin tối đa 2000 ký tự. Số này nay đã có nguồn chính thức: tài liệu `sendMessage` của Zalo ghi «1 đến 2000 ký tự».
- **Zalo Bot API:** `POST https://bot-api.zaloplatforms.com/bot<TOKEN>/<method>`, body JSON.
  - `getMe` trả `{ ok, result: { id, account_name, account_type, can_join_groups } }`.
  - `sendMessage` nhận `{ chat_id, text }` và trả `{ ok, result: { message_id, date } }`.
  - `getUpdates` nhận `{ timeout: "<giây>" }` và trả `{ ok, result: { message: { from: { id, display_name, is_bot }, chat: { id, chat_type }, text?, message_id, date }, event_name } }`.
  - Lỗi có dạng `{ ok: false, error_code, description }`.
- **`[GIẢ ĐỊNH]` khi không có tin mới:** `getUpdates` trả `ok:false` với `error_code` 408, hoặc `ok:true` không có `result`. Cả hai đọc là «hết tin». Mọi hình dạng khác là lỗi thật, ghi log và không nuốt.
- **Nhãn dữ liệu không dịch:** tên bot (`account_name`), tên hiển thị Zalo và tên người mang `translate="no"`.
- **Nhãn trang cá nhân: «Thông báo của bạn»** (en «Your notifications»), đúng hợp đồng đã duyệt. Cổng 1.5 không duyệt đề xuất đổi nhãn. Chữ nằm ở khoá `thanhBen.thongBaoCuaBan`, nên nếu người quyết đổi sau thì chỉ sửa một dòng.
- **Mục mới trên thanh bên Cài đặt** đứng **trước** «Điều phối». `test/cai-dat-dieu-huong.spec.ts:22` đòi «Điều phối» đứng cuối.
- **Mọi test DOM mới** phải được thêm vào chuỗi `test:dom` của `apps/app/package.json`. `bun test` trơn không nhặt đuôi `.dom.tsx`.
- **Test API chạy qua HTTP có phiên thật** thì không được `setSystemTime` xa hơn hạn phiên. `mintPhien` đặt hạn bằng `Date.now()` cộng 7 ngày. Hãy mint lại phiên sau khi đổi giờ, hoặc chỉ đổi giờ ở tầng gọi thẳng service.
- **`apps/api/src/generated/server.ts` là file sinh ra.** Chạy `cd apps/api && bun run trpc:generate`, rồi commit file đó.
- **Năm lệnh chứng ở gốc kho:** `bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build`.

## File Structure

| File | Vai | Task |
|---|---|---|
| `packages/db/prisma/schema.prisma` + migration `*_nhac_qua_zalo` | Năm bảng mới và hai cột mới trên `AppSetting` | 1 |
| `packages/db/src/zalo-lien-ket.ts` (`@crm/db/zalo-lien-ket`) | `ZALO_LIEN_KET`, sinh và băm mã, trạng thái liên kết, gỡ, thay liên kết | 1 |
| `packages/db/src/kenh-thong-bao.ts` (`@crm/db/kenh-thong-bao`) | `chonKenh` (hàm thuần) và `kenhSeDungCua(db, userId, { coToken })` | 1 |
| `packages/validation/src/zalo-update.ts` (`@crm/validation/zalo-update`) | Schema cho tin `getUpdates`, `getMe`, `sendMessage` | 1 |
| `apps/agent/agent/lib/zalo-config.ts` | `ZALO` | 2 |
| `apps/agent/agent/lib/zalo-api.ts` | `zaloToken()`, `zaloGoi(fetcher, token, method, body)`, `guiZalo(...)` | 2 |
| `apps/agent/agent/lib/zalo-poll.ts` | `pollZalo(deps)`: getMe, vòng getUpdates, xử lý mã | 2 |
| `apps/agent/agent/lib/capabilities.ts`, `schedules/dispatch.ts` | Đăng ký năng lực và nhịp | 2 |
| `apps/agent/agent/lib/nhac-ke-hoach.ts`, `tin-nhac.ts` | Rẽ kênh, khuôn chữ trơn | 3 |
| `apps/agent/test/nhac-qua-zalo.integration.spec.ts`, `test/support/zalo-gia.ts` | Test agent: E1–E10, E12 | 1, 2, 3 |
| `apps/api/src/zalo/{zalo.contracts,zalo.service,zalo.router,zalo.module}.ts` | tRPC `zalo.*` | 4 |
| `apps/api/test/nhac-qua-zalo.spec.ts` | Test API: E11, E13, E15, E19, E21 | 4 |
| `apps/app/app/(app)/[slug]/settings/notifications/*` | Trang cá nhân | 5 |
| `apps/app/app/(app)/[slug]/settings/connections/zalo/page.tsx` + index + hộp thêm | Trang kết nối | 5 |
| `apps/app/lib/messages/nhac-qua-zalo.ts`, `settings.ts`, `settings-ket-noi.ts`, `lib/cai-dat-dieu-huong.ts`, `lib/trpc/cache.ts` | Chữ và điều hướng | 5 |
| `apps/app/test/nhac-qua-zalo.dom.tsx` | Test DOM: E14, E16, E20, E22, E23 | 5 |
| `CONTEXT.md`, `.env.example`, `docs/agent.md`, `docs/connections.md` | Từ vựng và tài liệu | 6 |

---

### Task 1: Nền dữ liệu và luật dùng chung

**independent:** false (mọi task khác dựa vào nó) · **phục vụ:** E1 (và là nền cho E2–E23)

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (thêm vào `model User` và `model AppSetting`, thêm năm model mới)
- Create: `packages/db/prisma/migrations/<ts>_nhac_qua_zalo/migration.sql` (do `prisma migrate dev` sinh)
- Create: `packages/db/src/zalo-lien-ket.ts`, `packages/db/src/kenh-thong-bao.ts`
- Create: `packages/validation/src/zalo-update.ts`
- Modify: `packages/db/package.json`, `packages/validation/package.json` (exports theo thứ tự chữ cái)
- Test: `apps/agent/test/nhac-qua-zalo.integration.spec.ts` (khối `chon-kenh`)

**Interfaces:**
- Produces:
  - `ZALO_LIEN_KET`
  - `taoMaLienKet(db, userId, now = new Date()): Promise<{ ma: string; expiresAt: Date }>`
  - `bamMa(ma: string): string`
  - `trangThaiLienKet(db, userId, now): Promise<TrangThaiLienKet>`
  - `goLienKet(db, userId): Promise<void>`
  - `noiBangMa(db, { ma, zaloUserId, tenZalo, now }): Promise<KetQuaNoi>`
  - `ghiSai(db, zaloUserId, now): Promise<void>`
  - `dangBiChan(db, zaloUserId, now): Promise<boolean>`
  - `chonKenh(uuTien, zaloDuoc, slackDuoc): { kenh: Kenh | null; lech: boolean }`
  - `kenhSeDungCua(db, userId, { coToken }): Promise<KenhSeDung>`
  - `parseZaloGetUpdates`, `parseZaloGetMe`, `parseZaloSend`

- [ ] **Step 1: Schema.** Thêm vào `schema.prisma`, đặt sau `model OnboardingWatch`:

```prisma
enum NotificationChannel {
  AUTO
  ZALO
  SLACK
}

model ZaloLink {
  id              String   @id @default(cuid())
  crmUserId       String   @unique
  crmUser         User     @relation(fields: [crmUserId], references: [id], onDelete: Cascade)
  zaloUserId      String   @unique
  zaloDisplayName String
  linkedAt        DateTime @default(now())

  @@map("zaloLink")
}

model ZaloLinkCode {
  id        String    @id @default(cuid())
  crmUserId String    @unique
  crmUser   User      @relation(fields: [crmUserId], references: [id], onDelete: Cascade)
  codeHash  String    @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())

  @@map("zaloLinkCode")
}

model ZaloLinkAttempt {
  zaloUserId      String   @id
  failures        Int      @default(0)
  windowStartedAt DateTime

  @@map("zaloLinkAttempt")
}

model ZaloUpdateSeen {
  messageId String   @id
  seenAt    DateTime @default(now())

  @@index([seenAt])
  @@map("zaloUpdateSeen")
}

model NotificationPreference {
  id        String              @id @default(cuid())
  userId    String              @unique
  user      User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  channel   NotificationChannel @default(AUTO)
  updatedAt DateTime            @updatedAt

  @@map("notificationPreference")
}
```

Trong `model User`, thêm quan hệ ngược:

```prisma
  zaloLink               ZaloLink?
  zaloLinkCode           ZaloLinkCode?
  notificationPreference NotificationPreference?
```

Trong `model AppSetting`, thêm hai cột trước `updatedAt`:

```prisma
  zaloBotName  String?
  zaloPolledAt DateTime?
```

- [ ] **Step 2: Migration.** Chạy `cd packages/db && bun run db:migrate -- --name nhac_qua_zalo`, rồi `bun run db:generate`. Mở file SQL vừa sinh để đọc. Nó phải chứa `CREATE TYPE "NotificationChannel"`, năm `CREATE TABLE` và hai `ALTER TABLE "appSetting" ADD COLUMN`.

- [ ] **Step 3: `packages/db/src/zalo-lien-ket.ts`**

```ts
import { createHash, randomInt } from "node:crypto";
import type { Db } from "./client";

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;

export const ZALO_LIEN_KET = {
	ma: { soChuSo: 6, songMs: 15 * MINUTE_MS },
	doMa: { toiDa: 5, cuaSoMs: HOUR_MS },
	imSauMs: 5 * MINUTE_MS,
} as const;

const MA = new RegExp(`^\\d{${ZALO_LIEN_KET.ma.soChuSo}}$`);

export function chuanHoaMa(chu: string): string | null {
	const gon = chu.replace(/\s+/g, "");
	return MA.test(gon) ? gon : null;
}

export function bamMa(ma: string): string {
	return createHash("sha256").update(ma).digest("hex");
}

function sinhMa(): string {
	const tran = 10 ** ZALO_LIEN_KET.ma.soChuSo;
	return String(randomInt(0, tran)).padStart(ZALO_LIEN_KET.ma.soChuSo, "0");
}

export async function taoMaLienKet(
	db: Db,
	userId: string,
	now: Date = new Date(),
): Promise<{ ma: string; expiresAt: Date }> {
	const ma = sinhMa();
	const expiresAt = new Date(now.getTime() + ZALO_LIEN_KET.ma.songMs);
	await db.zaloLinkCode.upsert({
		where: { crmUserId: userId },
		create: { crmUserId: userId, codeHash: bamMa(ma), expiresAt },
		update: { codeHash: bamMa(ma), expiresAt, usedAt: null, createdAt: now },
	});
	return { ma, expiresAt };
}

export type TrangThaiLienKet =
	| { loai: "chua-noi" }
	| { loai: "ma-cho"; expiresAt: Date }
	| { loai: "ma-het-han" }
	| { loai: "da-noi"; tenZalo: string };

export async function trangThaiLienKet(
	db: Db,
	userId: string,
	now: Date = new Date(),
): Promise<TrangThaiLienKet> {
	const [lienKet, ma] = await Promise.all([
		db.zaloLink.findUnique({ where: { crmUserId: userId } }),
		db.zaloLinkCode.findUnique({ where: { crmUserId: userId } }),
	]);
	if (lienKet) return { loai: "da-noi", tenZalo: lienKet.zaloDisplayName };
	if (!ma || ma.usedAt) return { loai: "chua-noi" };
	if (ma.expiresAt.getTime() <= now.getTime()) return { loai: "ma-het-han" };
	return { loai: "ma-cho", expiresAt: ma.expiresAt };
}

async function veAutoNeuZalo(db: Db, userId: string): Promise<void> {
	await db.notificationPreference.updateMany({
		where: { userId, channel: "ZALO" },
		data: { channel: "AUTO" },
	});
}

export async function goLienKet(db: Db, userId: string): Promise<void> {
	await db.$transaction([
		db.zaloLink.deleteMany({ where: { crmUserId: userId } }),
		db.notificationPreference.updateMany({
			where: { userId, channel: "ZALO" },
			data: { channel: "AUTO" },
		}),
	]);
}

export async function dangBiChan(
	db: Db,
	zaloUserId: string,
	now: Date,
): Promise<boolean> {
	const dem = await db.zaloLinkAttempt.findUnique({ where: { zaloUserId } });
	if (!dem) return false;
	const conCuaSo =
		now.getTime() - dem.windowStartedAt.getTime() < ZALO_LIEN_KET.doMa.cuaSoMs;
	return conCuaSo && dem.failures >= ZALO_LIEN_KET.doMa.toiDa;
}

export async function ghiSai(
	db: Db,
	zaloUserId: string,
	now: Date,
): Promise<void> {
	const dem = await db.zaloLinkAttempt.findUnique({ where: { zaloUserId } });
	const hetCuaSo =
		!dem ||
		now.getTime() - dem.windowStartedAt.getTime() >= ZALO_LIEN_KET.doMa.cuaSoMs;
	await db.zaloLinkAttempt.upsert({
		where: { zaloUserId },
		create: { zaloUserId, failures: 1, windowStartedAt: now },
		update: hetCuaSo
			? { failures: 1, windowStartedAt: now }
			: { failures: { increment: 1 } },
	});
}

export type KetQuaNoi =
	| { loai: "da-noi"; crmUserId: string; tenCrm: string }
	| { loai: "ma-hong" };

export async function noiBangMa(
	db: Db,
	chon: { ma: string; zaloUserId: string; tenZalo: string; now: Date },
): Promise<KetQuaNoi> {
	const hang = await db.zaloLinkCode.findUnique({
		where: { codeHash: bamMa(chon.ma) },
		include: { crmUser: { select: { name: true } } },
	});
	const conSong =
		hang && !hang.usedAt && hang.expiresAt.getTime() > chon.now.getTime();
	if (!hang || !conSong) return { loai: "ma-hong" };
	const cu = await db.zaloLink.findUnique({
		where: { zaloUserId: chon.zaloUserId },
	});
	await db.$transaction([
		db.zaloLink.deleteMany({
			where: {
				OR: [{ zaloUserId: chon.zaloUserId }, { crmUserId: hang.crmUserId }],
			},
		}),
		db.zaloLink.create({
			data: {
				crmUserId: hang.crmUserId,
				zaloUserId: chon.zaloUserId,
				zaloDisplayName: chon.tenZalo,
			},
		}),
		db.zaloLinkCode.update({
			where: { id: hang.id },
			data: { usedAt: chon.now },
		}),
	]);
	if (cu && cu.crmUserId !== hang.crmUserId) {
		await veAutoNeuZalo(db, cu.crmUserId);
	}
	return { loai: "da-noi", crmUserId: hang.crmUserId, tenCrm: hang.crmUser.name };
}
```

- [ ] **Step 4: `packages/db/src/kenh-thong-bao.ts`**

```ts
import type { Db } from "./client";
import { SETTINGS_ID } from "./settings";

export const UU_TIEN = ["AUTO", "ZALO", "SLACK"] as const;
export type UuTien = (typeof UU_TIEN)[number];
export type Kenh = "zalo" | "slack";
export type LuaChonKenh = { kenh: Kenh | null; lech: boolean };

export function chonKenh(
	uuTien: UuTien,
	zaloDuoc: boolean,
	slackDuoc: boolean,
): LuaChonKenh {
	if (uuTien === "SLACK") {
		if (slackDuoc) return { kenh: "slack", lech: false };
		return zaloDuoc ? { kenh: "zalo", lech: true } : { kenh: null, lech: false };
	}
	if (zaloDuoc) return { kenh: "zalo", lech: false };
	if (slackDuoc) return { kenh: "slack", lech: uuTien === "ZALO" };
	return { kenh: null, lech: false };
}

export type KenhSeDung = LuaChonKenh & {
	uuTien: UuTien;
	zaloBat: boolean;
	zaloDuoc: boolean;
	slackDuoc: boolean;
	slackUserId: string | null;
	zaloUserId: string | null;
};

export async function kenhSeDungCua(
	db: Db,
	userId: string,
	chon: { coToken: boolean },
): Promise<KenhSeDung> {
	const [uu, lienKet, caiDat, slack, khop] = await Promise.all([
		db.notificationPreference.findUnique({ where: { userId } }),
		db.zaloLink.findUnique({ where: { crmUserId: userId } }),
		db.appSetting.findUnique({
			where: { id: SETTINGS_ID },
			select: { zaloBotName: true },
		}),
		db.account.findFirst({
			where: { providerId: "slack", accessToken: { not: null } },
			select: { id: true },
		}),
		db.slackMemberMatch.findUnique({
			where: { crmUserId: userId },
			select: { slackUserId: true },
		}),
	]);
	const uuTien: UuTien = uu?.channel ?? "AUTO";
	const zaloBat = Boolean(caiDat?.zaloBotName);
	const zaloDuoc = chon.coToken && zaloBat && lienKet !== null;
	const slackUserId = khop?.slackUserId ?? null;
	const slackDuoc = slack !== null && slackUserId !== null;
	return {
		...chonKenh(uuTien, zaloDuoc, slackDuoc),
		uuTien,
		zaloBat,
		zaloDuoc,
		slackDuoc,
		slackUserId,
		zaloUserId: lienKet?.zaloUserId ?? null,
	};
}
```

Ghi chú cho người làm: `coToken` do phía gọi truyền vào. Agent truyền `Boolean(zaloToken())`. API truyền `true`, vì API không đọc token và dựa vào `zaloBotName` do agent ghi. Đây là quyết định `d-…-8` trong sổ quyết định.

- [ ] **Step 5: `packages/validation/src/zalo-update.ts`**

```ts
import { z } from "zod";

const loiZalo = z.object({
	ok: z.literal(false),
	error_code: z.number().optional(),
	description: z.string().optional(),
});

export const zaloMessage = z.object({
	from: z.object({
		id: z.string().min(1),
		display_name: z.string(),
		is_bot: z.boolean(),
	}),
	chat: z.object({ id: z.string().min(1), chat_type: z.string() }),
	text: z.string().optional(),
	message_id: z.string().min(1),
	date: z.number(),
});

export type ZaloMessage = z.infer<typeof zaloMessage>;

const coTin = z.object({
	ok: z.literal(true),
	result: z.object({ message: zaloMessage, event_name: z.string() }),
});

const khongTin = z.union([
	z.object({ ok: z.literal(true), result: z.undefined() }),
	loiZalo.extend({ error_code: z.literal(408) }),
]);

export type ZaloUpdate =
	| { loai: "tin"; message: ZaloMessage; eventName: string }
	| { loai: "het" };

export function parseZaloGetUpdates(value: unknown): ZaloUpdate {
	const tin = coTin.safeParse(value);
	if (tin.success) {
		return {
			loai: "tin",
			message: tin.data.result.message,
			eventName: tin.data.result.event_name,
		};
	}
	if (khongTin.safeParse(value).success) return { loai: "het" };
	throw new Error(`getUpdates tra hinh dang la: ${tin.error.message}`);
}

export function messageIdCua(value: unknown): string | null {
	const ket = z
		.object({ result: z.object({ message: z.object({ message_id: z.string() }) }) })
		.safeParse(value);
	return ket.success ? ket.data.result.message.message_id : null;
}

const getMe = z.object({
	ok: z.literal(true),
	result: z.object({ id: z.string(), account_name: z.string().min(1) }),
});

export function parseZaloGetMe(value: unknown): { id: string; tenBot: string } {
	const ket = getMe.safeParse(value);
	if (!ket.success) throw new Error(`getMe tra hinh dang la: ${ket.error.message}`);
	return { id: ket.data.result.id, tenBot: ket.data.result.account_name };
}

const sendOk = z.object({
	ok: z.literal(true),
	result: z.object({ message_id: z.string() }),
});

export function parseZaloSend(value: unknown): { messageId: string } {
	const ket = sendOk.safeParse(value);
	if (ket.success) return { messageId: ket.data.result.message_id };
	const loi = loiZalo.safeParse(value);
	const ly = loi.success ? (loi.data.description ?? String(loi.data.error_code)) : "hinh dang la";
	throw new Error(`Zalo tu choi tin (${ly}).`);
}
```

Exports: thêm `"./zalo-lien-ket": "./src/zalo-lien-ket.ts"` và `"./kenh-thong-bao": "./src/kenh-thong-bao.ts"` vào `packages/db/package.json`, và `"./zalo-update": "./src/zalo-update.ts"` vào `packages/validation/package.json`. Mỗi dòng đặt đúng vị trí theo thứ tự chữ cái.

- [ ] **Step 6: Viết test đỏ trước cho E1 (`chon-kenh`).** Tạo `apps/agent/test/nhac-qua-zalo.integration.spec.ts`:

```ts
import { describe, expect, test } from "bun:test";
import { chonKenh, type UuTien } from "@crm/db/kenh-thong-bao";

const BANG: [UuTien, boolean, boolean, "zalo" | "slack" | null, boolean][] = [
	["AUTO", true, true, "zalo", false],
	["AUTO", true, false, "zalo", false],
	["AUTO", false, true, "slack", false],
	["AUTO", false, false, null, false],
	["ZALO", true, true, "zalo", false],
	["ZALO", true, false, "zalo", false],
	["ZALO", false, true, "slack", true],
	["ZALO", false, false, null, false],
	["SLACK", true, true, "slack", false],
	["SLACK", true, false, "zalo", true],
	["SLACK", false, true, "slack", false],
	["SLACK", false, false, null, false],
];

describe("chon-kenh", () => {
	test("chon-kenh: bang du 12 dong", () => {
		expect(BANG.length, "ma tran toan phan 3x2x2").toBe(12);
	});
	for (const [uu, zalo, slack, kenh, lech] of BANG) {
		test(`chon-kenh: ${uu} zalo=${zalo} slack=${slack}`, () => {
			const ghim =
				uu === "AUTO"
					? "AUTO khong bao gio lech"
					: uu === "SLACK" && slack
						? "SLACK chon Slack khi Slack duoc"
						: `dong ${uu} ${zalo} ${slack}`;
			expect(chonKenh(uu, zalo, slack), ghim).toEqual({ kenh, lech });
		});
	}
});
```

- [ ] **Step 7: Chạy test đỏ, rồi xanh.**
  - `cd apps/agent && bun test test/nhac-qua-zalo.integration.spec.ts -t chon-kenh`. Trước Step 4 thì đỏ vì module chưa có; sau Step 4 thì 13 pass.
  - **Phá-thử trên bản sao:** đổi `lech: uuTien === "ZALO"` thành `lech: true`. Dòng `AUTO false true` phải đỏ với thông điệp «AUTO khong bao gio lech». Hoàn tác bằng `git checkout -- packages/db/src/kenh-thong-bao.ts` **chỉ sau khi đã commit** phần sửa của task. Xem mục «Phá-thử tại chỗ mất thay đổi» trong bộ nhớ.

- [ ] **Step 8: Chứng.** Chạy `bun run check-types`, rồi `cd apps/agent && bun test test/nhac-qua-zalo.integration.spec.ts -t chon-kenh`.

- [ ] **Step 9: Commit.** Commit `feat(nhac-qua-zalo): bang lien ket Zalo, uu tien kenh va luat chon kenh`, gồm schema, migration, `packages/db/src/*`, `packages/validation/src/zalo-update.ts`, package.json và test.

---

### Task 2: Agent nói chuyện với Zalo (poll, nối mã, năng lực)

**independent:** true, so với Task 4 và Task 6. Chỉ phụ thuộc Task 1.
**phục vụ:** E6, E7, E8, E9, E10, E12.

**Files:**
- Create: `apps/agent/agent/lib/zalo-config.ts`, `apps/agent/agent/lib/zalo-api.ts`, `apps/agent/agent/lib/zalo-poll.ts`, `apps/agent/test/support/zalo-gia.ts`
- Modify: `apps/agent/agent/lib/capabilities.ts` (thêm mục `ZALO_BOT_TOKEN` sau `BLOB_READ_WRITE_TOKEN`), `apps/agent/agent/schedules/dispatch.ts` (thêm `pollZalo()` cạnh `lenLichNhac()`)
- Test: `apps/agent/test/nhac-qua-zalo.integration.spec.ts`, với các khối `khong-token`, `noi-ma`, `ma-hong`, `chong-do`, `noi-lai`, `trung-tin`

**Interfaces:**
- Consumes (Task 1): `noiBangMa`, `ghiSai`, `dangBiChan`, `chuanHoaMa`, `parseZaloGetUpdates`, `parseZaloGetMe`, `parseZaloSend`, `messageIdCua`.
- Produces:
  - `ZALO`
  - `zaloToken(): string | null`
  - `guiZalo(token, chatId, text, { fetcher }): Promise<{ messageId: string }>`
  - `pollZalo(deps?: { fetcher?: typeof fetch; now?: () => Date }): Promise<{ xuLy: number; loi: number }>`

- [ ] **Step 1: `zalo-config.ts`**

```ts
const SECOND_MS = 1_000;
const DAY_MS = 24 * 60 * 60 * SECOND_MS;

export const ZALO = {
	api: "https://bot-api.zaloplatforms.com",
	poll: { toiDaMoiNhip: 20, timeoutGiay: 1, giuDauMs: 7 * DAY_MS },
	tranKyTu: 2_000,
	loi: {
		huongDan:
			"Chào bạn. Để nhận nhắc việc, mở CRM › Cài đặt › Thông báo của bạn, bấm «Nối Zalo» rồi nhắn mã 6 số ở đây.",
		daNoi: (ten: string) =>
			`Đã nối với ${ten}. Mỗi sáng tôi gửi việc cần để ý ở đây.`,
	},
} as const;
```

- [ ] **Step 2: `zalo-api.ts`**

```ts
import { parseZaloSend } from "@crm/validation/zalo-update";
import { ZALO } from "./zalo-config";

export function zaloToken(): string | null {
	return process.env.ZALO_BOT_TOKEN?.trim() || null;
}

export async function zaloGoi(
	fetcher: typeof fetch,
	token: string,
	method: string,
	body: Record<string, string>,
): Promise<unknown> {
	const res = await fetcher(`${ZALO.api}/bot${token}/${method}`, {
		method: "POST",
		headers: { "Content-Type": "application/json; charset=utf-8" },
		body: JSON.stringify(body),
	});
	if (!res.ok && res.status !== 408) {
		throw new Error(`Zalo ${method} tra HTTP ${res.status}.`);
	}
	return res.json();
}

export async function guiZalo(
	token: string,
	chatId: string,
	text: string,
	chon: { fetcher?: typeof fetch } = {},
): Promise<{ messageId: string }> {
	return parseZaloSend(
		await zaloGoi(chon.fetcher ?? fetch, token, "sendMessage", {
			chat_id: chatId,
			text,
		}),
	);
}
```

- [ ] **Step 3: `zalo-poll.ts`**

```ts
import { db } from "@crm/db";
import { SETTINGS_ID } from "@crm/db/settings";
import {
	chuanHoaMa,
	dangBiChan,
	ghiSai,
	noiBangMa,
} from "@crm/db/zalo-lien-ket";
import {
	messageIdCua,
	parseZaloGetMe,
	parseZaloGetUpdates,
	type ZaloMessage,
} from "@crm/validation/zalo-update";
import { guiZalo, zaloGoi, zaloToken } from "./zalo-api";
import { ZALO } from "./zalo-config";

export type PhuThuocPoll = { fetcher?: typeof fetch; now?: () => Date };

async function ghiBot(tenBot: string | null, now: Date): Promise<void> {
	const data = { zaloBotName: tenBot, ...(tenBot ? { zaloPolledAt: now } : {}) };
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID, ...data },
		update: data,
	});
}

async function xuLyTin(
	token: string,
	tin: ZaloMessage,
	fetcher: typeof fetch,
	now: Date,
): Promise<void> {
	const tu = tin.from.id;
	if (await dangBiChan(db, tu, now)) return;
	const ma = chuanHoaMa(tin.text ?? "");
	if (!ma) {
		await guiZalo(token, tin.chat.id, ZALO.loi.huongDan, { fetcher });
		return;
	}
	const ket = await noiBangMa(db, {
		ma,
		zaloUserId: tu,
		tenZalo: tin.from.display_name,
		now,
	});
	if (ket.loai === "da-noi") {
		await guiZalo(token, tin.chat.id, ZALO.loi.daNoi(ket.tenCrm), { fetcher });
		return;
	}
	await ghiSai(db, tu, now);
	await guiZalo(token, tin.chat.id, ZALO.loi.huongDan, { fetcher });
}

export async function pollZalo(
	deps: PhuThuocPoll = {},
): Promise<{ xuLy: number; loi: number }> {
	const fetcher = deps.fetcher ?? fetch;
	const now = (deps.now ?? (() => new Date()))();
	const token = zaloToken();
	if (!token) {
		await ghiBot(null, now);
		return { xuLy: 0, loi: 0 };
	}
	try {
		const { tenBot } = parseZaloGetMe(await zaloGoi(fetcher, token, "getMe", {}));
		await ghiBot(tenBot, now);
	} catch (loi) {
		console.error(`[zalo] getMe loi, coi Zalo la tat: ${String(loi)}`);
		await ghiBot(null, now);
		return { xuLy: 0, loi: 1 };
	}
	await db.zaloUpdateSeen.deleteMany({
		where: { seenAt: { lt: new Date(now.getTime() - ZALO.poll.giuDauMs) } },
	});
	let xuLy = 0;
	let loi = 0;
	for (let lan = 0; lan < ZALO.poll.toiDaMoiNhip; lan++) {
		const tho = await zaloGoi(fetcher, token, "getUpdates", {
			timeout: String(ZALO.poll.timeoutGiay),
		});
		let cap: ReturnType<typeof parseZaloGetUpdates>;
		try {
			cap = parseZaloGetUpdates(tho);
		} catch (e) {
			loi++;
			console.error(`[zalo] tin hong message_id=${messageIdCua(tho) ?? "?"}: ${String(e)}`);
			continue;
		}
		if (cap.loai === "het") break;
		const daThay = await db.zaloUpdateSeen.findUnique({
			where: { messageId: cap.message.message_id },
		});
		if (daThay || cap.message.from.is_bot) continue;
		await db.zaloUpdateSeen.create({ data: { messageId: cap.message.message_id } });
		await xuLyTin(token, cap.message, fetcher, now);
		xuLy++;
	}
	return { xuLy, loi };
}
```

Kiểm với luật kho: log dùng `console.error` là khuôn đang có của agent (`[agent] ...` trong `capabilities.ts`). Log **không** ghi `text` của tin, chỉ ghi `message_id`, để giữ lời hứa AC-8.

- [ ] **Step 4: Năng lực và nhịp.** Trong `capabilities.ts`, thêm vào cuối mảng:

```ts
		{
			...fromEnv("ZALO_BOT_TOKEN"),
			label: "Zalo reminders",
			gives:
				"the morning reminder on Zalo for anyone who linked their Zalo, and the bot that answers link codes",
		},
```

Trong `schedules/dispatch.ts`, import `pollZalo` từ `../lib/zalo-poll`, rồi thêm `pollZalo(),` ngay sau `lenLichNhac(),` trong `Promise.all`.

- [ ] **Step 5: Zalo giả cho test.** Tạo `apps/agent/test/support/zalo-gia.ts`:

```ts
export type LoiGoiZalo = { method: string; body: Record<string, string> };

export type TinGia = {
	messageId: string;
	fromId: string;
	ten?: string;
	text?: string;
	hong?: boolean;
};

export function zaloGia(chon: {
	tin?: TinGia[];
	getMe?: "ok" | 401;
	send?: "ok" | 500 | "ok-false";
	vatVoTan?: boolean;
} = {}) {
	const goi: LoiGoiZalo[] = [];
	const hang = [...(chon.tin ?? [])];
	const fetcher = (async (input: RequestInfo | URL, init?: RequestInit) => {
		const method = String(input).split("/").at(-1) ?? "";
		goi.push({ method, body: JSON.parse(String(init?.body ?? "{}")) });
		if (method === "getMe") {
			return chon.getMe === 401
				? Response.json({ ok: false, error_code: 401, description: "Unauthorized" }, { status: 401 })
				: Response.json({ ok: true, result: { id: "b1", account_name: "Bot OneHub", account_type: "BASIC", can_join_groups: false } });
		}
		if (method === "sendMessage") {
			if (chon.send === 500) return new Response("loi", { status: 500 });
			if (chon.send === "ok-false") return Response.json({ ok: false, error_code: 400, description: "blocked" });
			return Response.json({ ok: true, result: { message_id: `s${goi.length}`, date: 1 } });
		}
		const t = chon.vatVoTan ? { messageId: `v${goi.length}`, fromId: "zv", text: "chao" } : hang.shift();
		if (!t) return Response.json({ ok: false, error_code: 408, description: "timeout" }, { status: 408 });
		const from = t.hong ? { display_name: "x", is_bot: false } : { id: t.fromId, display_name: t.ten ?? `Ten ${t.fromId}`, is_bot: false };
		return Response.json({
			ok: true,
			result: {
				message: { from, chat: { id: t.fromId, chat_type: "PRIVATE" }, text: t.text, message_id: t.messageId, date: 1 },
				event_name: "message.text.received",
			},
		});
	}) as typeof fetch;
	const guiToi = (id: string) =>
		goi.filter((g) => g.method === "sendMessage" && g.body.chat_id === id);
	return { fetcher, goi, guiToi };
}
```

- [ ] **Step 6: Test đỏ trước.** Thêm vào `nhac-qua-zalo.integration.spec.ts`:
  - Import thêm `afterAll`, `afterEach`, `beforeEach`, `setSystemTime`.
  - Import `db`; `moXuong`, `gieoNguoi`, `TIEN_TO` từ `./support/nhac-gieo`; `zaloGia` từ `./support/zalo-gia`; `pollZalo` từ `../agent/lib/zalo-poll`; `capabilitiesFrom` từ `../agent/lib/capabilities`; `taoMaLienKet`, `bamMa`, `ZALO_LIEN_KET` từ `@crm/db/zalo-lien-ket`; `ZALO` từ `../agent/agent/lib/zalo-config`.

```ts
const GOC = new Date("2026-10-10T02:00:00Z");

async function donZalo() {
	await db.zaloUpdateSeen.deleteMany({});
	await db.zaloLinkAttempt.deleteMany({});
	await db.zaloLink.deleteMany({ where: { crmUserId: { startsWith: TIEN_TO } } });
	await db.zaloLinkCode.deleteMany({ where: { crmUserId: { startsWith: TIEN_TO } } });
	await db.notificationPreference.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
}

function voiToken<T>(giaTri: string | undefined, chay: () => Promise<T>): Promise<T> {
	const cu = process.env.ZALO_BOT_TOKEN;
	if (giaTri === undefined) delete process.env.ZALO_BOT_TOKEN;
	else process.env.ZALO_BOT_TOKEN = giaTri;
	return chay().finally(() => {
		if (cu === undefined) delete process.env.ZALO_BOT_TOKEN;
		else process.env.ZALO_BOT_TOKEN = cu;
	});
}

beforeEach(async () => {
	await moXuong();
	await donZalo();
});
afterEach(() => setSystemTime());
afterAll(donZalo);

describe("khong-token", () => {
	test("khong-token: khong goi Zalo, zaloBotName null, nang luc tat", async () => {
		const z = zaloGia();
		await voiToken(undefined, () => pollZalo({ fetcher: z.fetcher, now: () => GOC }));
		expect(z.goi.length, "khong token thi khong goi Zalo").toBe(0);
		expect((await db.appSetting.findUnique({ where: { id: "app" } }))?.zaloBotName ?? null).toBeNull();
		expect(capabilitiesFrom(null).find((c) => c.id === "ZALO_BOT_TOKEN")?.enabled).toBe(false);
	});
	test("khong-token: co token, getMe ok -> ghi ten bot va gio poll", async () => {
		const z = zaloGia();
		await voiToken("1:abc", () => pollZalo({ fetcher: z.fetcher, now: () => GOC }));
		const s = await db.appSetting.findUnique({ where: { id: "app" } });
		expect({ ten: s?.zaloBotName, luc: s?.zaloPolledAt?.toISOString() }).toEqual({ ten: "Bot OneHub", luc: GOC.toISOString() });
	});
	test("khong-token: token hong, getMe 401 -> zaloBotName null, khong nem", async () => {
		await db.appSetting.upsert({ where: { id: "app" }, create: { id: "app", zaloBotName: "Bot OneHub" }, update: { zaloBotName: "Bot OneHub" } });
		const z = zaloGia({ getMe: 401 });
		const ket = await voiToken("1:hong", () => pollZalo({ fetcher: z.fetcher, now: () => GOC }));
		expect(ket.loi).toBe(1);
		expect((await db.appSetting.findUnique({ where: { id: "app" } }))?.zaloBotName ?? null, "token hong thi Zalo tat").toBeNull();
	});
});

describe("noi-ma", () => {
	test("noi-ma: tao ma hai lan, nhan ma lan 2 -> mot lien ket, ma lan 1 chet", async () => {
		const U = await gieoNguoi("Uyen");
		setSystemTime(GOC);
		const m1 = await taoMaLienKet(db, U.id, GOC);
		const m2 = await taoMaLienKet(db, U.id, GOC);
		for (const m of [m1, m2]) {
			expect(m.ma).toMatch(new RegExp(`^\\d{${ZALO_LIEN_KET.ma.soChuSo}}$`));
			expect(m.expiresAt.getTime()).toBe(GOC.getTime() + ZALO_LIEN_KET.ma.songMs);
		}
		const hang = await db.zaloLinkCode.findMany({ where: { crmUserId: U.id } });
		expect(hang.length, "mot nguoi mot ma song").toBe(1);
		expect(JSON.stringify(hang), "khong luu ma ro").not.toContain(m2.ma);
		expect(hang[0]?.codeHash).toBe(bamMa(m2.ma));
		const z = zaloGia({ tin: [{ messageId: "t1", fromId: "Z", ten: "Zed", text: m2.ma }] });
		await voiToken("1:abc", () => pollZalo({ fetcher: z.fetcher, now: () => GOC }));
		const lk = await db.zaloLink.findMany({ where: { crmUserId: U.id } });
		expect(lk.map((l) => [l.zaloUserId, l.zaloDisplayName])).toEqual([["Z", "Zed"]]);
		expect((await db.zaloLinkCode.findUnique({ where: { crmUserId: U.id } }))?.usedAt).not.toBeNull();
		expect(z.guiToi("Z").map((g) => g.body.text.includes(U.name))).toEqual([true]);
		const z2 = zaloGia({ tin: [{ messageId: "t2", fromId: "Z2", text: m1.ma }] });
		await voiToken("1:abc", () => pollZalo({ fetcher: z2.fetcher, now: () => GOC }));
		expect((await db.zaloLink.findMany({ where: { crmUserId: U.id } })).map((l) => l.zaloUserId), "ma cu het song").toEqual(["Z"]);
	});
});
```

Các khối `ma-hong`, `chong-do`, `noi-lai` và `trung-tin` viết theo đúng ma trận của E8, E9, E10 và E12 trong `evals.yaml`, dùng lại `zaloGia`, `taoMaLienKet` và `voiToken`. Riêng phép quét lính canh của E8 đọc bảng từ `information_schema`:

```ts
async function quetLinhCanh(linhCanh: string): Promise<string[]> {
	const cot = await db.$queryRaw<{ table_name: string; column_name: string }[]>`
		SELECT table_name, column_name FROM information_schema.columns
		WHERE table_schema = 'public' AND data_type IN ('text', 'character varying', 'jsonb', 'json')`;
	const trung: string[] = [];
	for (const { table_name, column_name } of cot) {
		const [{ n }] = await db.$queryRawUnsafe<{ n: bigint }[]>(
			`SELECT count(*) AS n FROM "${table_name}" WHERE "${column_name}"::text LIKE $1`,
			`%${linhCanh}%`,
		);
		if (n > 0n) trung.push(`${table_name}.${column_name}`);
	}
	return trung;
}
```

Đối chứng dương của phép quét:

```ts
test("ma-hong: doi chung, chen tay linh canh vao AgentTask thi phep quet do", async () => {
	await db.agentTask.create({ data: { kind: "nqz-thu", reason: "LINHCANH-NQZ-777", dueAt: GOC } });
	expect(await quetLinhCanh("LINHCANH-NQZ-777")).toContain("agentTask.reason");
	await db.agentTask.deleteMany({ where: { kind: "nqz-thu" } });
});
```

Khối `trung-tin`:
- Dòng 2 dùng `zaloGia({ vatVoTan: true })`, rồi khẳng định `z.goi.filter(g => g.method === "getUpdates").length === ZALO.poll.toiDaMoiNhip`.
- Dòng 3–4 dùng `tin: [tot1, { messageId: "hong1", fromId: "x", hong: true }, tot2]`. Khẳng định `ket.loi === 1`, hai tin tốt được xử lý, và `zaloUpdateSeen` không có `"hong1"`.

- [ ] **Step 7: Đỏ rồi xanh.** Chạy `cd apps/agent && bun test test/nhac-qua-zalo.integration.spec.ts -t "khong-token|noi-ma|ma-hong|chong-do|noi-lai|trung-tin"`.
  - Mỗi đột biến ghim ở E6–E12 chạy một lần trên bản sao sau khi đã commit, và phải đỏ đúng thông điệp ghim.
- [ ] **Step 8: Commit.** `feat(nhac-qua-zalo): agent poll Zalo, noi bang ma, chong do va trung tin`.

---

### Task 3: Nhắc buổi sáng chọn kênh và khuôn chữ trơn

**independent:** false (dùng `guiZalo` của Task 2) · **phục vụ:** E2, E3, E4, E5

**Files:**
- Modify: `apps/agent/agent/lib/tin-nhac.ts`
  - `dungTin(ten, viec, lienKet, khuon: "slack" | "tron" = "slack", tranKyTu?: number)`
- Modify: `apps/agent/agent/lib/nhac-ke-hoach.ts`
  - thân `chayNhac` sau bước `khong-viec`
  - `KetQuaNhac` giữ nguyên bốn giá trị
- Modify: `packages/validation/src/nhac-ke-hoach.ts`
  - `nhacPayload` thêm `kenh: z.enum(["zalo","slack"]).optional()` và `lechKenh: z.boolean().optional()`
- Test: `apps/agent/test/nhac-qua-zalo.integration.spec.ts`
  - khối `gui-zalo`, `tran-zalo`, `lech-kenh`, `zalo-loi`

**Interfaces:**
- Consumes:
  - `kenhSeDungCua` (Task 1)
  - `guiZalo`, `zaloToken`, `ZALO` (Task 2)
- Produces: `chayNhac(task, deps: PhuThuocGui & { zaloFetcher?: typeof fetch })`

- [ ] **Step 1: Khuôn `tron` trong `tin-nhac.ts`.** Viết lại `dong` và `dungTin`:

```ts
export type KhuonTin = "slack" | "tron";

function dong(
	v: ViecNhac,
	lienKet: (planId: string) => string | null,
	khuon: KhuonTin,
): string {
	const han = v.han ? `, hạn ${ngayThang(v.han)}` : "";
	const url = lienKet(v.planId);
	if (khuon === "tron") {
		const mo = url ? ` — ${url}` : "";
		return `• ${v.companyName} · ${phanDau(v)}${v.goiY}${han}${mo}`;
	}
	const mo = url ? ` — <${url}|mở kế hoạch>` : "";
	return `• ${thoat(v.companyName)} · ${phanDau(v)}${thoat(v.goiY)}${han}${mo}`;
}

export function dungTin(
	ten: string,
	viec: ViecNhac[],
	lienKet: (planId: string) => string | null,
	khuon: KhuonTin = "slack",
	tranKyTu: number = Number.POSITIVE_INFINITY,
): TinNhac {
	const theoThuTu = LOAI_NHAC.flatMap((loai) => viec.filter((v) => v.loai === loai));
	const tieuDe = (loai: LoaiNhac) => (khuon === "tron" ? TIEU_DE[loai] : `*${TIEU_DE[loai]}*`);
	const chao = `Chào ${khuon === "tron" ? ten : thoat(ten)}, sáng nay có ${theoThuTu.length} việc 30 ngày đầu cần bạn để ý.`;
	const ve = (daGui: ViecNhac[]) => {
		const nhom = LOAI_NHAC.flatMap((loai) => {
			const ds = daGui.filter((v) => v.loai === loai);
			return ds.length === 0 ? [] : ["", tieuDe(loai), ...ds.map((v) => dong(v, lienKet, khuon))];
		});
		const conLai = theoThuTu.length - daGui.length;
		const cuoi = conLai > 0 ? ["", `và ${conLai} việc nữa — mở tổng quan`] : [];
		return [chao, ...nhom, ...cuoi].join("\n");
	};
	let daGui = theoThuTu.slice(0, NHAC.tran);
	while (daGui.length > 0 && ve(daGui).length > tranKyTu) daGui = daGui.slice(0, -1);
	return { text: ve(daGui), daGui };
}
```

- [ ] **Step 2: `chayNhac` rẽ kênh.** Thay đoạn từ `const token = await slackAccessToken();` tới hết hàm bằng:

```ts
	const coToken = zaloToken() !== null;
	const kenh = await kenhSeDungCua(db, userId, { coToken });
	if (kenh.kenh === null) {
		const slackToken = await slackAccessToken();
		return dong(task.id, slackToken ? "khong-khop" : "khong-slack");
	}
	const nguoi = await db.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true } });
	const lienKet = await duongMo(deps.appUrl === undefined ? appUrlMacDinh() : deps.appUrl);
	let daGui: ViecNhac[];
	if (kenh.kenh === "zalo") {
		const tin = dungTin(nguoi.name, viec, lienKet, "tron", ZALO.tranKyTu);
		await guiZalo(zaloToken() ?? "", kenh.zaloUserId ?? "", tin.text, { fetcher: deps.zaloFetcher });
		daGui = tin.daGui;
	} else {
		const token = await slackAccessToken();
		const tin = dungTin(nguoi.name, viec, lienKet);
		await sendSlackMessage(token ?? "", { kind: "user", id: kenh.slackUserId ?? "", label: nguoi.name }, tin.text, task.id, { fetcher: deps.fetcher });
		daGui = tin.daGui;
	}
	await db.agentTask.update({
		where: { id: task.id },
		data: { payload: { ...payload, daGui: maCua(daGui), kenh: kenh.kenh, lechKenh: kenh.lech } },
	});
	await completeTask(task.id, `da-gui:${daGui.length}`);
	return "da-gui";
```

`PhuThuocGui` thêm trường `zaloFetcher?: typeof fetch`. Hai ô `?? ""` ở trên không bao giờ rơi vào thật: khi `kenh` là `zalo` thì `zaloDuoc` đã đòi có token và liên kết, còn khi là `slack` thì `slackDuoc` đã đòi có tài khoản và `slackUserId`. Hai ô này chỉ để trình kiểm kiểu đi qua.

Giữ đúng outcome `khong-slack` / `khong-khop`. Test E6 của vòng `may-nhac-truoc-nguoi` (`khong-kenh`) phải vẫn xanh khi không có token Zalo.

- [ ] **Step 3: Test đỏ trước.** Thêm các khối `gui-zalo`, `tran-zalo`, `lech-kenh` và `zalo-loi` vào `nhac-qua-zalo.integration.spec.ts`.
  - Dùng lại `gieoGui` từ `./support/nhac-gui-gieo` (có A, có Slack khớp `U-MN3-A`), `lenLichNhac`, `hangCua`, `chayNhac`.
  - Gieo thêm: `db.zaloLink.create({ data: { crmUserId: A.id, zaloUserId: "ZA", zaloDisplayName: "A Zalo" } })` và `appSetting.zaloBotName = "Bot OneHub"`.
  - Đổi tên một công ty trong `gieoGui` thành `"Minh & Co <HN>"` bằng `db.company.update`, để có dữ liệu cần thoát ký tự.

Khung `gui-zalo`:

```ts
describe("gui-zalo", () => {
	test("gui-zalo: mot sendMessage toi ZA, khong Slack, chu tron, doc lai hang", async () => {
		const g = await gieoGuiZalo();
		setSystemTime(g.goc);
		await lenLichNhac(g.goc);
		const z = zaloGia();
		const s = slackGia();
		await voiToken("1:abc", () => chayNhac(g.hang(), { fetcher: s.fetcher, zaloFetcher: z.fetcher, appUrl: "https://crm.test" }));
		expect(z.guiToi("ZA").length, "dung mot sendMessage toi ZA").toBe(1);
		expect(s.goi.length, "khong goi Slack").toBe(0);
		const text = z.guiToi("ZA")[0]?.body.text ?? "";
		expect(text, "doi chung: ky tu dac biet giu nguyen").toContain("Minh & Co <HN>");
		for (const cam of ["*", "<http", "|mở kế hoạch>", "&amp;"]) {
			expect(text.includes(cam), `tin Zalo la chu tron: ${cam}`).toBe(false);
		}
		expect(text.indexOf("Quá hạn")).toBeLessThan(text.indexOf("Sắp hạn"));
		expect(text.indexOf("Sắp hạn")).toBeLessThan(text.indexOf("Kế hoạch im"));
		const hang = await db.agentTask.findUniqueOrThrow({ where: { id: g.hangId } });
		const p = parseNhacPayload(hang.payload);
		expect({ outcome: hang.outcome, kenh: p.kenh, lech: p.lechKenh, n: p.daGui?.length }).toEqual({ outcome: "da-gui:4", kenh: "zalo", lech: false, n: 4 });
	});
});
```

Ghi chú cho `gieoGuiZalo()`: nó bọc `gieoGui()` rồi gieo liên kết, tên bot và công ty «Minh & Co <HN>». Nó trả `{ ...g, hangId, hang: () => hangCua(g.A.id) }`, trong đó `hang` là một hàm async trả hàng DB.

Dòng 5 của E2 (mỗi dòng trỏ đúng kế hoạch của nó) chép cách so từng dòng với `g.keHoach` từ test `gui-slack: moi dong mo dung ke hoach cua no` trong `nhac-ke-hoach.integration.spec.ts`.

Các khối còn lại:
- `tran-zalo` dùng `gieoMuoiHai` (có sẵn trong `nhac-gui-gieo`) và thêm tên công ty dài 200 ký tự.
- `lech-kenh` dựng bốn người P, Q, R, S theo AC-4. Với mỗi người, gọi `kenhSeDungCua(db, id, { coToken })` **trước** `chayNhac`, rồi so với payload đọc lại.
- `zalo-loi` dùng `zaloGia({ send: 500 })` và `zaloGia({ send: "ok-false" })`. Bắt lỗi bằng `.catch((e: Error) => \`nem: ${e.message}\`)`, cùng khuôn với test `khong-kenh`.

- [ ] **Step 4: Đỏ, xanh, và không vỡ vòng trước.**
  - Chạy `cd apps/agent && bun test test/nhac-qua-zalo.integration.spec.ts -t "gui-zalo|tran-zalo|lech-kenh|zalo-loi"`.
  - Chạy lại `bun test test/nhac-ke-hoach.integration.spec.ts`: toàn bộ khối cũ phải vẫn xanh.
  - Chạy các đột biến ghim ở E2–E5.
- [ ] **Step 5: Commit.** `feat(nhac-qua-zalo): nhac buoi sang di dung mot kenh, khuon chu tron cho Zalo`.

---

### Task 4: API `zalo.*` — mã, gỡ, ưu tiên, trạng thái

**independent:** true (so với Task 2, 3, 6; chỉ cần Task 1) · **phục vụ:** E11, E13, E15, E19, E21

**Files:**
- Create: `apps/api/src/zalo/zalo.contracts.ts`, `zalo.service.ts`, `zalo.router.ts`, `zalo.module.ts`
- Modify: `apps/api/src/app.module.ts` (import `ZaloModule` theo thứ tự chữ cái, thêm vào mảng `imports`), `apps/api/src/generated/server.ts` (sinh bằng `bun run trpc:generate`)
- Test: `apps/api/test/nhac-qua-zalo.spec.ts`

**Interfaces:**
- Consumes (Task 1): `taoMaLienKet`, `trangThaiLienKet`, `goLienKet`, `kenhSeDungCua`, `ZALO_LIEN_KET`, `UU_TIEN`.
- Produces (tRPC):
  - `zalo.taoMa` (mutation) → `{ ma, expiresAt }`
  - `zalo.go` (mutation) → `{ ok: true }`
  - `zalo.luuUuTien` (mutation, input `{ channel }`) → `{ channel }`
  - `zalo.cuaToi` (query) → `CuaToiOutput`
  - `zalo.xuong` (query) → `XuongOutput`

- [ ] **Step 1: `zalo.contracts.ts`**

```ts
import { UU_TIEN } from "@crm/db/kenh-thong-bao";
import { z } from "zod";

export const zaloTaoMaOutput = z.object({ ma: z.string().regex(/^\d+$/), expiresAt: z.date() });
export const zaloGoOutput = z.object({ ok: z.literal(true) });
export const zaloLuuUuTienInput = z.object({ channel: z.enum(UU_TIEN) });
export const zaloLuuUuTienOutput = zaloLuuUuTienInput;

export const zaloCuaToiOutput = z.object({
	zaloBat: z.boolean(),
	tenBot: z.string().nullable(),
	lienKet: z.discriminatedUnion("loai", [
		z.object({ loai: z.literal("chua-noi") }),
		z.object({ loai: z.literal("ma-cho"), expiresAt: z.date() }),
		z.object({ loai: z.literal("ma-het-han") }),
		z.object({ loai: z.literal("da-noi"), tenZalo: z.string() }),
	]),
	uuTien: z.enum(UU_TIEN),
	zaloDuoc: z.boolean(),
	slackDuoc: z.boolean(),
	kenhSeDung: z.enum(["zalo", "slack"]).nullable(),
	lech: z.boolean(),
});
export type ZaloCuaToi = z.infer<typeof zaloCuaToiOutput>;

export const zaloXuongOutput = z.object({
	bat: z.boolean(),
	tenBot: z.string().nullable(),
	pollCuoi: z.date().nullable(),
	im: z.boolean(),
	daNoi: z.number().int(),
	tong: z.number().int(),
	nguoi: z.array(z.object({ id: z.string(), ten: z.string(), tenZalo: z.string().nullable() })),
});
export type ZaloXuong = z.infer<typeof zaloXuongOutput>;
```

- [ ] **Step 2: `zalo.service.ts`**. Service ném `BadRequestException` với thông điệp ghim; `DomainErrorMiddleware` đổi nó sang `BAD_REQUEST`. Thành viên được kiểm bằng `AgentAccessService.assertMember`.

```ts
import { type Db } from "@crm/db";
import { kenhSeDungCua, type UuTien } from "@crm/db/kenh-thong-bao";
import { SETTINGS_ID } from "@crm/db/settings";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { goLienKet, taoMaLienKet, trangThaiLienKet, ZALO_LIEN_KET } from "@crm/db/zalo-lien-ket";
import { BadRequestException, Injectable } from "@nestjs/common";
import { AgentAccessService } from "../agent/agent-access.service";
import { InjectDatabase } from "../database/database.decorator";
import type { ZaloCuaToi, ZaloXuong } from "./zalo.contracts";

export const ZALO_THONG_DIEP = {
	zaloChuaDung: "Zalo chưa dùng được cho bạn — hãy nối Zalo trước.",
	slackChuaDung: "Slack chưa dùng được cho bạn — Slack chưa nhận ra bạn.",
} as const;

@Injectable()
export class ZaloService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly access: AgentAccessService,
	) {}

	async taoMa(userId: string) {
		await this.access.assertMember(userId);
		return taoMaLienKet(this.db, userId);
	}

	async go(userId: string) {
		await this.access.assertMember(userId);
		await goLienKet(this.db, userId);
		return { ok: true as const };
	}

	async luuUuTien(userId: string, channel: UuTien) {
		await this.access.assertMember(userId);
		const k = await kenhSeDungCua(this.db, userId, { coToken: true });
		if (channel === "ZALO" && !k.zaloDuoc) throw new BadRequestException(ZALO_THONG_DIEP.zaloChuaDung);
		if (channel === "SLACK" && !k.slackDuoc) throw new BadRequestException(ZALO_THONG_DIEP.slackChuaDung);
		await this.db.notificationPreference.upsert({
			where: { userId },
			create: { userId, channel },
			update: { channel },
		});
		return { channel };
	}

	async cuaToi(userId: string): Promise<ZaloCuaToi> {
		await this.access.assertMember(userId);
		const [k, lienKet, caiDat] = await Promise.all([
			kenhSeDungCua(this.db, userId, { coToken: true }),
			trangThaiLienKet(this.db, userId),
			this.db.appSetting.findUnique({ where: { id: SETTINGS_ID }, select: { zaloBotName: true } }),
		]);
		return {
			zaloBat: k.zaloBat,
			tenBot: caiDat?.zaloBotName ?? null,
			lienKet,
			uuTien: k.uuTien,
			zaloDuoc: k.zaloDuoc,
			slackDuoc: k.slackDuoc,
			kenhSeDung: k.kenh,
			lech: k.lech,
		};
	}

	async xuong(userId: string, now: Date = new Date()): Promise<ZaloXuong> {
		await this.access.assertMember(userId);
		const [caiDat, thanhVien] = await Promise.all([
			this.db.appSetting.findUnique({ where: { id: SETTINGS_ID }, select: { zaloBotName: true, zaloPolledAt: true } }),
			this.db.member.findMany({
				where: { organizationId: WORKSPACE_ID },
				select: { user: { select: { id: true, name: true, zaloLink: { select: { zaloDisplayName: true } } } } },
				orderBy: { user: { name: "asc" } },
			}),
		]);
		const nguoi = thanhVien.map(({ user }) => ({ id: user.id, ten: user.name, tenZalo: user.zaloLink?.zaloDisplayName ?? null }));
		const pollCuoi = caiDat?.zaloPolledAt ?? null;
		return {
			bat: Boolean(caiDat?.zaloBotName),
			tenBot: caiDat?.zaloBotName ?? null,
			pollCuoi,
			im: pollCuoi !== null && now.getTime() - pollCuoi.getTime() > ZALO_LIEN_KET.imSauMs,
			daNoi: nguoi.filter((n) => n.tenZalo !== null).length,
			tong: nguoi.length,
			nguoi,
		};
	}
}
```

Trước khi viết, người làm phải kiểm tên decorator `InjectDatabase` và đường import của nó bằng cách mở `slack-connection.service.ts`, rồi chép đúng dòng import ở đó.

- [ ] **Step 3: `zalo.router.ts` và `zalo.module.ts`.** Chép khuôn của `SlackRouter`:
  - Khai `@Router({ alias: "zalo" })` và `@UseMiddlewares(AuthMiddleware)`.
  - Mỗi procedure dùng `@Ctx() ctx: AuthedTrpcContext`, rồi gọi `this.zalo.<ham>(ctx.user.id, …)`.
  - Mỗi procedure có `meta: restMeta(...)` với đường dẫn `/zalo/...` và nhãn `["Zalo"]`.
  - `ZaloModule` khai `imports: [TrpcModule, AgentModule]` và `providers: [ZaloService, ZaloRouter]`.
  - Đăng ký `ZaloModule` trong `app.module.ts`, sau `SlackModule`.
  - Chạy `cd apps/api && bun run trpc:generate`. Kiểm `grep -n "zalo: t.router" src/generated/server.ts` in ra đúng 1 dòng.

- [ ] **Step 4: Test đỏ trước, `apps/api/test/nhac-qua-zalo.spec.ts`.**
  - Dùng khuôn HTTP của `chi-quan-tri-truong.spec.ts`: `Test.createTestingModule({ imports: [AppModule] })`, `mintPhien`, `request(app.getHttpServer())`.
  - Viết hàm `goi` (mutation POST) và `doc` (query GET) cho namespace `zalo`.
  - Gieo người bằng `gieoThanhVien` / `gieoNguoiNgoai` của `support/ke-hoach-gieo`.
  - Cả hai file trên đều có hàm tên `gieoThanhVien`, nên phải import có alias. Dọn dữ liệu theo `daGieo`.

```ts
describe("tao-ma-api", () => {
	test("tao-ma-api: hai lan qua tRPC, mot hang, bam dung ma lan 2, khong ma ro", async () => {
		const U = await gieoThanhVienKh("Uyen");
		const a = await goi(U.id, "taoMa", undefined);
		const b = await goi(U.id, "taoMa", undefined);
		expect([a.status, b.status]).toEqual([200, 200]);
		expect(String(b.data.ma)).toMatch(/^\d{6}$/);
		const hang = await db.zaloLinkCode.findMany({ where: { crmUserId: U.id } });
		expect(hang.map((h) => h.codeHash), "mot nguoi mot ma song").toEqual([bamMa(String(b.data.ma))]);
		expect(JSON.stringify(hang)).not.toContain(String(b.data.ma));
	});
	test("tao-ma-api: nguoi ngoai xuong bi tu choi, khong hang ma", async () => {
		const N = await gieoNguoiNgoai("Ngoai");
		const r = await goi(N.id, "taoMa", undefined);
		expect(r.status, "nguoi ngoai xuong khong tao duoc ma").toBe(403);
		expect(await db.zaloLinkCode.count({ where: { crmUserId: N.id } })).toBe(0);
	});
	test("tao-ma-api: doi chung, them vao xuong thi tao duoc", async () => {
		const N = await gieoNguoiNgoai("Ngoai2");
		await db.member.create({ data: { id: `m-${N.id}`, organizationId: WORKSPACE_ID, userId: N.id, role: "member", createdAt: new Date() } });
		expect((await goi(N.id, "taoMa", undefined)).status).toBe(200);
	});
});
```

Các khối `go-zalo`, `luu-uu-tien`, `trang-thai` và `trang-thai-lien-ket` viết theo đúng ma trận của E11, E13, E15 và E21:
- Thông điệp lỗi so với `ZALO_THONG_DIEP.*` qua `res.body.error.message`.
- Riêng dòng «mã hết hạn» của `trang-thai-lien-ket` và dòng «im» của `trang-thai`: gọi **thẳng service** (`new ZaloService(db, new AgentAccessService())`) với `now` tiêm vào, không `setSystemTime` qua HTTP. Lý do nằm ở ràng buộc chung về hạn phiên.
- Riêng `trang-thai` khẳng định thêm: sau khi gieo, `kenhSeDungCua(db, U.id, { coToken: true })` bằng đúng `{ kenh: cuaToi.kenhSeDung, lech: cuaToi.lech }`.

- [ ] **Step 5: Đỏ rồi xanh.** Chạy `cd apps/api && bun test --preload ./test/setup.ts test/nhac-qua-zalo.spec.ts`, rồi các đột biến ghim ở E11, E13, E15, E19 và E21.
- [ ] **Step 6: Commit.** `feat(nhac-qua-zalo): api zalo tao ma, go, luu uu tien, trang thai`, gồm cả `generated/server.ts`.

---

### Task 5: Hai trang, thanh bên, thẻ kết nối

**independent:** false (dùng kiểu tRPC của Task 4) · **phục vụ:** E14, E16, E17, E18, E20, E22, E23

**Files:**
- Create:
  - `apps/app/lib/messages/nhac-qua-zalo.ts` (en + vi, `satisfies`)
  - `apps/app/app/(app)/[slug]/settings/notifications/page.tsx` (server)
  - `.../notifications/khoi-zalo.tsx` (client)
  - `.../notifications/khoi-kenh.tsx` (client)
  - `apps/app/app/(app)/[slug]/settings/connections/zalo/page.tsx` (server)
  - `.../connections/zalo/danh-sach-noi.tsx`
  - `apps/app/test/nhac-qua-zalo.dom.tsx`
- Modify:
  - `apps/app/lib/cai-dat-dieu-huong.ts`: thêm `{ khoa: "thongBaoCuaBan", href: \`${GOC_CAI_DAT}/notifications\` }` **trước** `dieuPhoi`
  - `apps/app/lib/messages/settings.ts`: `thanhBen.thongBaoCuaBan` en `"Your notifications"`, vi `"Thông báo của bạn"`
  - `apps/app/lib/messages/settings-ket-noi.ts`:
    - `ten.zalo`
    - `danhSach.zaloMangVe`, `danhSach.zaloGui`, `danhSach.zaloKhoiDau`
    - `them.zaloMoTa`
  - `apps/app/test/messages-guard.spec.ts`: thêm `"ten.zalo"` vào `KHONG_DAU`, và ghim mọi giá trị dạng hàm mới vào `GHIM`
  - `connections/page.tsx`: fetch `zalo.xuong`, thêm dòng khi `bat`, thêm `StarterRow`
  - `add-connection-dialog.tsx`: thêm `CatalogRow` Zalo
  - `lib/trpc/cache.ts`: thêm `zalo(options?)` invalidate `zalo.cuaToi`, `zalo.xuong`
  - `apps/app/package.json`: thêm `./test/nhac-qua-zalo.dom.tsx` vào cuối `test:dom`

**Interfaces:**
- Consumes (Task 4): `RouterOutputs["zalo"]["cuaToi"]`, `RouterOutputs["zalo"]["xuong"]` qua `trpc.zalo.*`.
- Produces: `KhoiZalo({ du })`, `KhoiKenh({ du })`, `DanhSachNoi({ du })`.
  - Đây là các client component nhận dữ liệu đã tính xong.
  - Kiểu props do chính các file này khai, theo luật «client component owns its own prop types».

- [ ] **Step 1: Test DOM đỏ trước.**
  - Chép khung `thuTuc` / `trpcGia` / `mo` / `cho` / `bam` / `nut` từ `mk-nut-phat-chia.dom.tsx`, không import chéo.
  - Fixture parse qua `zaloCuaToiOutput` / `zaloXuongOutput` của `../../api/src/zalo/zalo.contracts` (cách (b) trong kho), rồi qua `quaJson`.
  - Viết các test `chon-kenh-man`, `trang-thai-man`, `nut-noi`, `go-xac-nhan`, `lam-moi` theo đúng ma trận E14, E16, E20, E22, E23.
  - Test `lam-moi` dùng `setSystemTime` cùng `refetchInterval` của react-query. Nếu đồng hồ giả không lái được `setInterval` của react-query, thì truyền `khoangLamMoiMs` qua prop (mặc định `ZALO_MAN.lamMoiMs = 5 * SECOND_MS` trong `nhac-qua-zalo.ts` message/config) và đặt 10ms trong test.

```tsx
test("chon-kenh-man: truoc khi noi, Zalo va Slack khoa co ly do", async () => {
	dat("zalo.cuaToi", () => quaJson(zaloCuaToiOutput.parse({ ...CHUA_NOI })));
	await mo(<KhoiKenhTrang />);
	for (const ten of ["Zalo", "Slack"]) {
		const n = nut(ten);
		expect(n.getAttribute("aria-disabled") === "true" || n.hasAttribute("disabled"), `${ten} khoa`).toBe(true);
		expect(document.getElementById(n.getAttribute("aria-describedby") ?? "")?.textContent ?? "", `${ten} co ly do`).not.toBe("");
	}
});
```

- [ ] **Step 2: Trang cá nhân.**
  - `page.tsx` theo khuôn `settings/page.tsx`: `requireSession`, `prefetchQuery(trpc.zalo.cuaToi.queryOptions())`, `HydrateClient`, `PageShell` có tiêu đề `t.tieuDe`.
  - `khoi-zalo.tsx` và `khoi-kenh.tsx` chép giao diện từ bản mẫu đã duyệt `apps/app/app/proto/_modules/nhac-qua-zalo/thong-bao.tsx`, nhưng:
    - dữ liệu lấy từ `useQuery(trpc.zalo.cuaToi.queryOptions())`, và query này có `refetchInterval` khi `lienKet.loai === "ma-cho"`;
    - `taoMa`, `go`, `luuUuTien` là `useMutation`, và `onSuccess` gọi `cache.zalo()`;
    - khi `luuUuTien` lỗi, lựa chọn quay về giá trị cũ bằng state lạc quan có hoàn tác, và hiện `t.luuLoi` ngay tại chỗ;
    - mã chỉ hiện từ kết quả mutation `taoMa`, giữ trong state của component, không bao giờ lấy từ query.
- [ ] **Step 3: Trang kết nối và thẻ.**
  - `connections/zalo/page.tsx` dùng khuôn `fetchQuery` của `slack/page.tsx`, rồi render theo `ket-noi-zalo.tsx` của bản mẫu.
  - Logo dùng `EntityLogo name="Zalo"`. Kho chưa có logo Zalo; đây là finding nhóm 2 của design-pass.
  - Index và hộp thêm kết nối: thêm theo khuôn Slack đã liệt kê trong bản đồ mã.
- [ ] **Step 4: Chứng.**
  - `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/nhac-qua-zalo.dom.tsx`
  - `bun test test/cai-dat-dieu-huong.spec.ts test/messages-guard.spec.ts test/proto-catalog.spec.ts`
  - Lệnh `nqz_san_thiet_ke` (E18)
  - `bun run check-types`
  - `bun run build`
  - Các đột biến ghim ở E14, E16, E20, E22, E23
- [ ] **Step 5: Commit.** `feat(nhac-qua-zalo): trang thong bao cua ban va trang ket noi Zalo`.

---

### Task 6: Từ vựng và tài liệu

**independent:** true · **phục vụ:** cảnh báo từ vựng W6 ở Cổng 1; không có eval máy.

**Files:** `CONTEXT.md`, `.env.example`, `docs/agent.md`, `docs/connections.md`, `docs/environment.md`

- [ ] **Step 1: `CONTEXT.md`.** Thêm hai mục, theo khuôn `**Thuật ngữ**: … Chốt 2026-09-23.` + `_Avoid_:` + `Vì sao:`.
  - **Bot Zalo**
    - Định nghĩa: tài khoản bot của xưởng trên Zalo Bot Platform, chỉ gửi nhắc buổi sáng và trả lời mã nối.
    - Khác **Tác nhân**: bot Zalo không tự làm việc gì.
    - `_Avoid_`: tác nhân, trợ lý.
  - **Nối Zalo**
    - Định nghĩa: một người trong đội nhắn mã 6 số cho bot Zalo để CRM biết Zalo đó là của họ.
    - `_Avoid_`: đăng nhập Zalo, liên kết tài khoản.
  - Sửa mục **Nhắc buổi sáng**: «một tin Slack riêng» thành «một tin riêng qua Zalo hoặc Slack, theo lựa chọn của người đó».
- [ ] **Step 2: `.env.example`.** Thêm sau đoạn Slack:

```
# Optional. Enables the morning reminder on Zalo and the bot that answers link codes.
# Create a bot at https://bot.zaloplatforms.com and paste its token here. Only apps/agent reads it.
# ZALO_BOT_TOKEN=""
```

- [ ] **Step 3: `docs/agent.md`.** Trong mục «Nhắc buổi sáng»:
  - thêm luật chọn kênh bằng `kenhSeDungCua`, và nói rõ Zalo lỗi thì ném, không đổi sang Slack;
  - thêm hai trường payload `kenh` và `lechKenh`;
  - thêm mục con «Poll Zalo» mô tả `pollZalo`, cách chống trùng và chống dò mã.
- [ ] **Step 4: `docs/connections.md`.** Thêm mục «Zalo cần một bước nối của từng người», nói ba điều:
  - vì sao không ghép được bằng email hay số điện thoại;
  - API không gọi Zalo;
  - trang kết nối chỉ cho xem, còn nối và gỡ nằm ở trang cá nhân.
- [ ] **Step 5: Commit.** `docs(nhac-qua-zalo): tu vung bot Zalo, noi Zalo va tai lieu kenh nhac`.

---

## Kết S3 — chứng toàn kho

- [ ] `bun run test && bun run check-types && bun run lint && bun run lint:slop && bun run build` từ gốc worktree. Cả năm lệnh phải xanh.
- [ ] Đặt contract `status: implemented` rồi chuyển sang S4.

## Self-review (đã chạy)

- **Phủ spec:**
  - mục 3 (kiến trúc) → Task 2, 4
  - mục 4 (dữ liệu) → Task 1
  - mục 5 (liên kết) → Task 1, 2, 4
  - mục 6 (chọn kênh + gửi) → Task 1, 3
  - mục 7 và Đặc tả UX → Task 5
  - token `.env` và năng lực → Task 2, 6
- **Phủ eval:**
  - E1 → T1
  - E2–E5 → T3
  - E6–E10, E12 → T2
  - E11, E13, E15, E19, E21 → T4
  - E14, E16, E17, E18, E20, E22, E23 → T5
  - Không eval nào không có task.
- **Nhất quán kiểu:**
  - `kenhSeDungCua` trả `{ kenh, lech, uuTien, zaloBat, zaloDuoc, slackDuoc, slackUserId, zaloUserId }`, và cả T3 lẫn T4 dùng đúng các tên này.
  - `trangThaiLienKet` trả union `loai`, khớp `zaloCuaToiOutput.lienKet`.
- **Hai chỗ người làm phải tự đối chiếu lúc code:**
  - decorator `InjectDatabase` (T4 Step 2);
  - đồng hồ giả với `refetchInterval` (T5 Step 1).
  - Cả hai được ghi rõ kèm phương án. Đây không phải chỗ để trống.
