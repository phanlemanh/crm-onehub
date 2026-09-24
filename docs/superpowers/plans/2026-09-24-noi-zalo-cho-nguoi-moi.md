# Nối Zalo cho người mới — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quản trị viên dán Bot Token trên màn Kết nối › Zalo (tác tử tự kiểm và đăng ký webhook); người mới nối theo ba bước có tên bot thật và gửi thử được nhắc; bot nhận ra người đã nối; tin lỗi giữa chừng không mất; người rời xưởng bị gỡ liên kết.

**Architecture:** API chỉ kiểm quyền và chuyển câu hỏi sang tác tử qua cầu `AGENT_BRIDGE_SECRET` (khuôn `ResearchKeyService`). Tác tử gọi Zalo, sinh khoá webhook và tự ghi token + khoá vào `AppSetting`; mọi chỗ dùng token đọc `AppSetting` trước, biến môi trường sau. Thân yêu cầu/phản hồi cầu nối là một schema Zod dùng chung trong `packages/validation`.

**Tech Stack:** Bun 1.x test runner · Prisma (Postgres) · NestJS + nestjs-trpc · eve 0.29 custom channel · Next.js (App Router) + `@crm/ui` (shadcn) · Zod 4.

**Spec:** `docs/superpowers/specs/2026-09-24-noi-zalo-cho-nguoi-moi-design.md` · Hợp đồng `_acceptance/noi-zalo-cho-nguoi-moi/contract.md` (approved, T3) · Phép đo `_acceptance/noi-zalo-cho-nguoi-moi/evals.yaml` (24 eval, lệnh ở `_acceptance/config.yaml` khoá `nzm_*`).

## Global Constraints

- Không viết chú thích trong code, kể cả code sửa (`AGENTS.md`).
- Trí khôn ở `apps/agent`: API không gọi Zalo, không sinh khoá webhook.
- Một `.env` ở gốc; biến mới khai ở `.env.example` + `docs/environment.md`; API đọc biến nào thì khai ở `apps/api/src/config/env.validation.ts`.
- Thiếu khoá/biến thì tính năng tắt, không ném (`capabilities.ts`).
- Hằng số chỉnh được sống trong `ZALO` (`apps/agent/agent/lib/zalo-config.ts`) hoặc `ZALO_LIEN_KET`; không số ma thuật.
- Parse ở biên bằng Zod; shape đi qua hai gói sống ở `packages/validation/src/<module>.ts`, nhập theo subpath.
- Giao diện chỉ từ `@crm/ui` theo subpath; không `className` ghi đè style component; chỉ `primary`/`destructive` tô đầy, mỗi màn đúng một nút tô đầy.
- Client component không nhập `@crm/db`, `@crm/auth`.
- Chữ trên màn có đủ `en` và `vi` trong `apps/app/lib/messages/nhac-qua-zalo.ts`; dữ liệu người nhập (tên bot, tên người, tên Zalo) mang `translate="no"`.
- Token không bao giờ về trình duyệt: API chỉ trả 4 ký tự cuối.
- Hai tệp test đã ký KHÔNG được sửa một dòng: `apps/agent/test/nhac-qua-zalo.integration.spec.ts`, `apps/agent/test/zalo-qua-webhook.integration.spec.ts` (E21). Tệp support dùng chung (`test/support/zalo-gia.ts`) được sửa, miễn hai tệp đó vẫn xanh.
- Mỗi phép đo mới đi kèm cặp hai chiều trên cùng fixture: vật lành xanh, phá vật trong bản sao thì đỏ với thông điệp ghim (MEASURE-BIRTH-CLAUSE). Bản sao đột biến đặt ở `.acceptance-runs/`, không trong gói.
- Test ngày giờ chạy với `TZ=Asia/Ho_Chi_Minh` khi so giờ địa phương.
- Commit theo khuôn `feat|fix|test|docs: …`, trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Token dán kèm khoảng trắng hoặc xuống dòng** (dán từ Zalo trên điện thoại): API phải `trim()` trước khi kiểm dạng và gửi; người dùng kỳ vọng lưu được. → thêm ca `"  12345:abc\n"` vào Task 6 (E3 đối chứng dương).
2. **Hai quản trị viên bấm Lưu gần như cùng lúc**: lần sau thắng trọn (token và khoá đi cùng nhau), không có trạng thái token của lần A với khoá của lần B. → tác tử ghi token + khoá + url trong MỘT `update`; Task 4 thêm ca ghi hai lần liên tiếp, đọc lại khoá khớp đúng lần `setWebhook` cuối.
3. **Bot đã bị xoá bên Zalo sau khi lưu**: `getMe` nhịp sau trả 401 → trang phải chuyển «Chưa bật» chứ không kẹt «Nhận tin qua webhook». → `kiemBot` đã ghi `zaloBotName` null khi `getMe` lỗi; Task 3 thêm ca 401 khẳng định `zaloWebhookUrl` cũng về null.
4. **Tác tử không với tới được (cầu nối đứt, timeout)**: nút Lưu không treo mãi; màn báo «tác tử chưa nối được» và ô giữ chữ. → Task 6 ca `AGENT_URL` trỏ cổng chết, `AbortSignal.timeout` từ `ZALO_CAU_NOI.timeoutMs`.
5. **Người đã nối nhắn đúng 6 số (một mã cũ đã dùng)**: không được bị coi là «đã nối rồi» mà cũng không tăng bộ đếm sai vô lý — giữ luật mã hiện tại (mã hỏng → ghi sai + hướng dẫn). → Task 5 thêm ca Z đã nối nhắn mã đã dùng: bộ đếm sai tăng 1, không có tin «Bạn đã nối với…».

---

## Bản đồ tệp

| Tệp | Trách nhiệm | Task |
|---|---|---|
| `packages/db/prisma/schema.prisma` + `migrations/<ts>_noi_zalo_cho_nguoi_moi/` | 4 cột mới trên `AppSetting` | 1 |
| `packages/validation/src/zalo-cau-noi.ts` (mới) | Schema thân/phản hồi hai route cầu nối | 1 |
| `packages/validation/src/zalo-update.ts` | `parseZaloGetMe` theo `display_name`; `parseZaloWebhookInfo`; `ZALO_LY_DO` | 1 |
| `apps/agent/agent/lib/zalo-config.ts` | hằng mới (khoá sinh máy, cầu nối, câu trả lời) | 2 |
| `apps/agent/agent/lib/zalo-api.ts` | `zaloToken()`/`zaloKhoaWebhook()` async đọc `AppSetting` trước; gốc API ghi đè được | 2 |
| `apps/agent/agent/lib/zalo-{webhook,poll,dang-ky,bot}.ts`, `nhac-ke-hoach.ts`, `scripts/zalo-*.ts` | đổi sang gọi async | 2 |
| `apps/agent/agent/lib/zalo-bot.ts` | `kiemBot` gọi thêm `getWebhookInfo` | 3 |
| `apps/agent/agent/lib/cau-noi-auth.ts` (mới) | `authorised()` tách khỏi `crm.ts` | 4 |
| `apps/agent/agent/lib/zalo-bot-xuong.ts` (mới) | `datBot`, `guiThu` — thân hai route cầu nối | 4 |
| `apps/agent/agent/channels/zalo.ts` | mount hai route cầu nối | 4 |
| `packages/db/src/zalo-lien-ket.ts` | `noiBangMa`/`ghiSai` chạy được trong `transaction` | 5 |
| `apps/agent/agent/lib/zalo-nhan.ts`, `zalo-webhook.ts` | Ngoài-3 (một giao dịch, 500), câu «đã nối rồi» | 5 |
| `apps/api/src/zalo/*` | `luuBot`, `guiThu`, `xuong` mở rộng, `ZaloCauNoiService` | 6 |
| `apps/api/src/workspace/workspace.service.ts` | gỡ liên kết khi gỡ thành viên | 7 |
| `apps/api/test/noi-zalo-cau-noi.spec.ts` (mới) | chỗ nối thật API ↔ tác tử | 8 |
| `packages/ui/src/components/reui/stepper.tsx` (mới) | `@reui/stepper` | 9 |
| `apps/app/app/(app)/[slug]/settings/connections/zalo/*`, messages | ô token, trạng thái webhook, danh sách | 10 |
| `apps/app/app/(app)/[slug]/settings/notifications/*`, messages | ba bước, gửi thử, chữ khoá kênh | 11 |
| docs, `.env.example`, `CONTEXT.md`, `rang/tai-lieu.mjs` | tài liệu + phép đo tài liệu | 12 |

Tệp test mới: `apps/agent/test/noi-zalo-cho-nguoi-moi.integration.spec.ts`, `apps/api/test/noi-zalo-cho-nguoi-moi.spec.ts`, `apps/api/test/noi-zalo-cau-noi.spec.ts`, `apps/app/test/noi-zalo-cho-nguoi-moi.dom.tsx`. Tên `describe`/`test` bắt đầu đúng chuỗi `-t` của khoá `nzm_*` trong `_acceptance/config.yaml` (vd `test("luu-bot: …")`).

---

### Task 1: Dữ liệu và schema dùng chung

`independent: false` (mọi task sau dựa vào) · phục vụ E1 (dòng 4), E17, E23 · hạng T3 (chạm `packages/db/prisma`).

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (model `AppSetting`, sau `zaloPolledAt`)
- Create: `packages/db/prisma/migrations/<ts>_noi_zalo_cho_nguoi_moi/migration.sql` (sinh bằng `prisma migrate dev`)
- Create: `packages/validation/src/zalo-cau-noi.ts`
- Modify: `packages/validation/src/zalo-update.ts:62-75` và cuối tệp
- Modify: `packages/validation/package.json` (khai subpath `./zalo-cau-noi` nếu gói dùng `exports` tường minh — kiểm cách `./zalo-update` đang khai và làm y hệt)
- Test: `packages/validation/test/zalo-cau-noi.spec.ts`

**Interfaces — Produces:**
```ts
// @crm/validation/zalo-update
export const ZALO_LY_DO = ["can-https", "zalo-tu-choi"] as const;
export type ZaloLyDo = (typeof ZALO_LY_DO)[number];
export function docLyDo(value: string | null): ZaloLyDo | null;
export type ZaloBot = { id: string; tenBot: string };           // tenBot = display_name
export function parseZaloGetMe(value: unknown): ZaloBot;
export type ZaloWebhookInfo = { loai: "co-url"; url: string } | { loai: "la"; khoa: string };
export function parseZaloWebhookInfo(value: unknown): ZaloWebhookInfo;

// @crm/validation/zalo-cau-noi
export const datBotYeuCau: z.ZodObject<{ token: z.ZodOptional<z.ZodString> }>;
export type DatBotYeuCau = { token?: string };
export const datBotPhanHoi: z.ZodDiscriminatedUnion<...>;
export type DatBotPhanHoi =
  | { outcome: "valid"; tenBot: string; webhook: "da-dang-ky" | "can-https" | "zalo-tu-choi" }
  | { outcome: "invalid"; reason: string }
  | { outcome: "khong-co-token"; reason: string };
export const guiThuYeuCau: z.ZodObject<{ userId: z.ZodString }>;
export const guiThuPhanHoi: z.ZodObject<{ kenh: z.ZodNullable<z.ZodEnum<["zalo","slack"]>>; lech: z.ZodBoolean }>;
export type GuiThuPhanHoi = { kenh: "zalo" | "slack" | null; lech: boolean };
export const ZALO_CAU_NOI = { bot: "/internal/zalo/bot", guiThu: "/internal/zalo/gui-thu" } as const;
```

- [ ] **Step 1: Thêm cột vào `AppSetting`**

```prisma
  zaloBotName  String?
  zaloPolledAt DateTime?
  zaloBotToken      String?
  zaloWebhookSecret String?
  zaloWebhookUrl    String?
  zaloWebhookLyDo   String?
```

- [ ] **Step 2: Sinh migration và client**

Run: `cd packages/db && bun run db:migrate --name noi_zalo_cho_nguoi_moi && bun run db:generate`
Expected: thư mục `migrations/<ts>_noi_zalo_cho_nguoi_moi/migration.sql` chỉ có bốn `ALTER TABLE "appSetting" ADD COLUMN … TEXT`. Mở tệp đọc lại; có câu lệnh nào khác (DROP, đổi kiểu) thì DỪNG và báo — đó là trôi schema, không phải việc của vòng này.

- [ ] **Step 3: Viết test đỏ cho schema**

```ts
import { describe, expect, test } from "bun:test";
import {
	datBotPhanHoi,
	datBotYeuCau,
	guiThuPhanHoi,
} from "../src/zalo-cau-noi";
import { parseZaloGetMe, parseZaloWebhookInfo } from "../src/zalo-update";

const GETME_THAT = {
	ok: true,
	result: {
		id: "7412",
		account_name: "bot.uipSwwnr",
		account_type: "BASIC",
		can_join_groups: true,
		display_name: "Bot OneHub",
	},
};

describe("zalo-cau-noi", () => {
	test("getMe lay display_name, khong lay account_name", () => {
		expect(parseZaloGetMe(GETME_THAT).tenBot).toBe("Bot OneHub");
	});
	test("getMe thieu display_name thi nem, goi ten truong", () => {
		const { display_name: _bo, ...thieu } = GETME_THAT.result;
		expect(() => parseZaloGetMe({ ok: true, result: thieu })).toThrow(/display_name/);
	});
	test("getWebhookInfo co url", () => {
		expect(
			parseZaloWebhookInfo({ ok: true, result: { url: "https://a.test/zalo/webhook", updated_at: 1 } }),
		).toEqual({ loai: "co-url", url: "https://a.test/zalo/webhook" });
	});
	test("getWebhookInfo than la thi tra khoa cap dau", () => {
		expect(parseZaloWebhookInfo({ ok: true, result: { khac: 1 } })).toEqual({ loai: "la", khoa: "ok,result" });
	});
	test("yeu cau dat bot: token tuy chon, khong nhan truong la", () => {
		expect(datBotYeuCau.parse({})).toEqual({});
		expect(datBotYeuCau.parse({ token: "1:a" })).toEqual({ token: "1:a" });
		expect(() => datBotYeuCau.parse({ botToken: "1:a" })).toThrow();
	});
	test("phan hoi dat bot va gui thu dung khuon", () => {
		expect(datBotPhanHoi.parse({ outcome: "valid", tenBot: "B", webhook: "can-https" }).outcome).toBe("valid");
		expect(guiThuPhanHoi.parse({ kenh: null, lech: false }).kenh).toBeNull();
	});
});
```

- [ ] **Step 4: Chạy thấy đỏ**

Run: `cd packages/validation && bun test test/zalo-cau-noi.spec.ts`
Expected: FAIL — `Cannot find module '../src/zalo-cau-noi'`.

- [ ] **Step 5: Viết `zalo-cau-noi.ts`**

```ts
import { z } from "zod";

export const ZALO_CAU_NOI = {
	bot: "/internal/zalo/bot",
	guiThu: "/internal/zalo/gui-thu",
} as const;

export const datBotYeuCau = z.strictObject({
	token: z.string().trim().min(1).optional(),
});
export type DatBotYeuCau = z.infer<typeof datBotYeuCau>;

export const WEBHOOK_KET = ["da-dang-ky", "can-https", "zalo-tu-choi"] as const;

export const datBotPhanHoi = z.discriminatedUnion("outcome", [
	z.object({
		outcome: z.literal("valid"),
		tenBot: z.string().min(1),
		webhook: z.enum(WEBHOOK_KET),
	}),
	z.object({ outcome: z.literal("invalid"), reason: z.string().min(1) }),
	z.object({ outcome: z.literal("khong-co-token"), reason: z.string().min(1) }),
]);
export type DatBotPhanHoi = z.infer<typeof datBotPhanHoi>;

export const guiThuYeuCau = z.strictObject({ userId: z.string().min(1) });
export type GuiThuYeuCau = z.infer<typeof guiThuYeuCau>;

export const guiThuPhanHoi = z.object({
	kenh: z.enum(["zalo", "slack"]).nullable(),
	lech: z.boolean(),
});
export type GuiThuPhanHoi = z.infer<typeof guiThuPhanHoi>;
```

- [ ] **Step 6: Sửa `zalo-update.ts`**

Thay khối `getMe`:
```ts
const getMe = z.object({
	ok: z.literal(true),
	result: z.object({ id: z.string(), display_name: z.string().min(1) }),
});

export type ZaloBot = { id: string; tenBot: string };

export function parseZaloGetMe(value: unknown): ZaloBot {
	const ket = getMe.safeParse(value);
	if (!ket.success) {
		throw new Error(`getMe tra hinh dang la: ${ket.error.message}`);
	}
	return { id: ket.data.result.id, tenBot: ket.data.result.display_name };
}
```
Thêm cuối tệp:
```ts
export const ZALO_LY_DO = ["can-https", "zalo-tu-choi"] as const;
export type ZaloLyDo = (typeof ZALO_LY_DO)[number];

export function docLyDo(value: string | null): ZaloLyDo | null {
	const ket = z.enum(ZALO_LY_DO).safeParse(value);
	return ket.success ? ket.data : null;
}

const webhookInfo = z.object({
	ok: z.literal(true),
	result: z.object({ url: z.string().min(1) }),
});

export type ZaloWebhookInfo =
	| { loai: "co-url"; url: string }
	| { loai: "la"; khoa: string };

export function parseZaloWebhookInfo(value: unknown): ZaloWebhookInfo {
	const ket = webhookInfo.safeParse(value);
	if (ket.success) return { loai: "co-url", url: ket.data.result.url };
	return { loai: "la", khoa: khoaCapDauCua(value) };
}
```

- [ ] **Step 7: Chạy thấy xanh; phá-thử**

Run: `cd packages/validation && bun test test/zalo-cau-noi.spec.ts` → PASS 6/6.
Phá-thử (bản sao ở `.acceptance-runs/nzm-t1/`, không sửa tại chỗ): đổi `display_name` → `account_name` trong `parseZaloGetMe` → ca «getMe lay display_name» đỏ với chữ `bot.uipSwwnr`. Xoá bản sao.

- [ ] **Step 8: Typecheck + commit**

Run: `bun run check-types` → xanh (chỗ gọi `parseZaloGetMe` không đổi chữ ký).
```bash
git add packages/db/prisma packages/validation
git commit -m "feat(zalo): cot AppSetting cho bot tren man, schema cau noi, ten bot theo display_name"
```

---

### Task 2: Nguồn token — `AppSetting` trước, biến môi trường sau

`independent: false` (sau Task 1) · phục vụ E8, E17 · hạng T2.

**Files:**
- Modify: `apps/agent/agent/lib/zalo-config.ts`
- Modify: `apps/agent/agent/lib/zalo-api.ts`
- Modify: `apps/agent/agent/lib/zalo-webhook.ts:57`, `zalo-poll.ts:44`, `zalo-dang-ky.ts:27`, `zalo-bot.ts:43`, `nhac-ke-hoach.ts:110`, `apps/agent/scripts/zalo-poll.ts`, `apps/agent/scripts/zalo-webhook.ts`
- Modify: `apps/agent/test/support/zalo-gia.ts` (getMe thật có `display_name`; `getWebhookInfo` mặc định 404; tuỳ chọn mới)
- Modify: `.env.example`, `docs/environment.md`, `turbo.json` (`globalPassThroughEnv`), `apps/agent/turbo.json` (`passThroughEnv` dev) — biến `ZALO_API_URL`
- Test: `apps/agent/test/noi-zalo-cho-nguoi-moi.integration.spec.ts` (tạo tệp, `describe("nguon-token")`, `describe("ten-bot")`)
- Test support mới: `apps/agent/test/support/zalo-may-chu.ts` (Zalo giả dạng `Bun.serve` cho tiến trình con)

**Interfaces:**
- Consumes: `parseZaloGetMe` (Task 1), cột `zaloBotToken`, `zaloWebhookSecret`.
- Produces:
```ts
// zalo-api.ts
export async function zaloToken(): Promise<string | null>;
export async function zaloKhoaWebhook(): Promise<string | null>;
export function zaloApiGoc(): string;   // ZALO_API_URL ?? ZALO.api
// zalo-gia.ts (support)
export type ChonZaloGia = { …cũ; webhookInfo?: 404 | 500 | { url: string } | "la" };
// zalo-may-chu.ts (support)
export function zaloMayChu(chon?: ChonZaloGia): { url: string; goi: LoiGoiZalo[]; dung: () => void };
```

Quyết định S2 (ghi sổ ở cuối S2): E8 đòi chạy `zalo:poll` và `zalo:webhook` thành tiến trình con nói chuyện với Zalo giả, nên gốc API Zalo phải ghi đè được. Thêm biến tuỳ chọn `ZALO_API_URL` (mặc định `https://bot-api.zaloplatforms.com`), khai đủ ba nhà biến.

- [ ] **Step 1: Hằng mới trong `ZALO`**

```ts
	webhook: {
		duong: "/zalo/webhook",
		header: "x-bot-api-secret-token",
		khoa: { min: 8, max: 256, sinhByte: 32 },
		giaoThucAnToan: "https:",
	},
	cauNoi: { timeoutMs: 20 * SECOND_MS },
	token: { dang: /^\d+:[A-Za-z0-9_-]+$/ },
```
và trong `loi`:
```ts
		daNoiRoi: (ten: string, gio: string) =>
			`Bạn đã nối với ${ten}. Nhắc đến lúc ${gio}.`,
		guiThu: (gio: string) =>
			`Tin thử từ CRM. Nhắc việc buổi sáng của bạn sẽ đến ở đây lúc ${gio}.`,
		tokenSai: "Zalo không nhận token này.",
```

- [ ] **Step 2: Viết test đỏ `nguon-token` (ma trận 21 ô, E8)**

Khung (đủ ma trận, in bảng lúc chạy):
```ts
const O = [
	"webhook-KA", "webhook-KB", "kiemBot", "nhac", "pollZalo", "zalo:poll", "zalo:webhook",
] as const;
type CauHinh = "man+env" | "env" | "rong";
const KY_VONG: Record<CauHinh, Record<(typeof O)[number], string>> = {
	"man+env": { "webhook-KA": "200", "webhook-KB": "403", kiemBot: "/botA/", nhac: "/botA/", pollZalo: "/botA/", "zalo:poll": "/botA/", "zalo:webhook": "/botA/ secret=KA" },
	env: { "webhook-KA": "403", "webhook-KB": "200", kiemBot: "/botB/", nhac: "/botB/", pollZalo: "/botB/", "zalo:poll": "/botB/", "zalo:webhook": "/botB/ secret=KB" },
	rong: { "webhook-KA": "404", "webhook-KB": "404", kiemBot: "0 goi", nhac: "khong zalo", pollZalo: "0 goi", "zalo:poll": "exit!=0 ZALO_BOT_TOKEN", "zalo:webhook": "exit!=0 ZALO_BOT_TOKEN" },
};
```
Mỗi ô một hàm đo trả chuỗi quan sát được (status webhook; tiền tố đường mà `zaloGia`/`zaloMayChu` nhận, cắt tới `/bot<tok>/`; mã thoát + stderr). Test cuối: `console.table(thucTe)` rồi `expect(thucTe, "AppSetting thang env").toEqual(KY_VONG)` — 21 ô so một lượt, số ô cố định bằng `O.length * 3`.
- Token A = `"111:aaa"`, B = `"222:bbb"`; khoá KA = `"khoa-A-du-dai"`, KB = `"khoa-B-du-dai"`.
- Gieo `AppSetting` bằng `db.appSetting.upsert({ where: { id: SETTINGS_ID }, … })`, đặt env bằng `voiBien` chép từ spec vòng 1 (chép hàm vào tệp mới, không import từ tệp đã ký).
- Webhook đo bằng `nhanWebhook(yeuCauWebhook(than, khoa).request, { fetcher: z.fetcher, now: () => GOC })` — KHÔNG truyền `env`, để đo đường đọc thật.
- `nhac`: gieo người đã nối + một việc cần nhắc như `nhac-qua-zalo.integration.spec.ts` làm (dùng `support/nhac-gieo.ts`), gọi `chayNhac(task, { zaloFetcher: z.fetcher })`.
- Hai lệnh: `Bun.spawn(["bun", "run", "zalo:poll"], { cwd: apps/agent, env: { ...process.env, ZALO_API_URL: mayChu.url, ZALO_BOT_TOKEN, ZALO_WEBHOOK_SECRET, DATABASE_URL: process.env.DATABASE_URL } })`; `zalo:poll` chạy vô hạn nên giết sau khi máy chủ giả nhận lời gọi đầu (`await` tối đa `ZALO.pollTay.timeoutGiay` giây qua cờ trên máy chủ giả, không `sleep` cố định), `zalo:webhook https://tac-tu.test/zalo/webhook` tự thoát.
- `afterEach`: trả `zaloBotToken`, `zaloWebhookSecret`, `zaloWebhookUrl`, `zaloWebhookLyDo`, `zaloBotName` về null — tệp đã ký của vòng 1 đọc env, sót token trong `AppSetting` là làm chúng đỏ.

Và `describe("ten-bot")` (E17): `dispatch.run()` với Zalo giả mặc định (getMe thật) → `zaloBotName` đọc lại `"Bot OneHub"` và khác `"bot.uipSwwnr"`.

- [ ] **Step 3: Chạy thấy đỏ**

Run: `bun run test -- "cd apps/agent && bun test test/noi-zalo-cho-nguoi-moi.integration.spec.ts -t nguon-token"`
Expected: FAIL ở ô `man+env/kiemBot` (đang thấy `/botB/`).

- [ ] **Step 4: Viết `zalo-api.ts`**

```ts
import { db } from "@crm/db";
import { SETTINGS_ID } from "@crm/db/settings";
import { parseZaloSend } from "@crm/validation/zalo-update";
import { ZALO } from "./zalo-config";

async function docCaiDat() {
	return db.appSetting.findUnique({
		where: { id: SETTINGS_ID },
		select: { zaloBotToken: true, zaloWebhookSecret: true },
	});
}

export async function zaloToken(): Promise<string | null> {
	const caiDat = await docCaiDat();
	return caiDat?.zaloBotToken?.trim() || process.env.ZALO_BOT_TOKEN?.trim() || null;
}

export async function zaloKhoaWebhook(): Promise<string | null> {
	const caiDat = await docCaiDat();
	return (
		caiDat?.zaloWebhookSecret?.trim() ||
		process.env.ZALO_WEBHOOK_SECRET?.trim() ||
		null
	);
}

export function zaloApiGoc(): string {
	return process.env.ZALO_API_URL?.trim().replace(/\/+$/, "") || ZALO.api;
}
```
Trong `zaloGoi`: `${zaloApiGoc()}/bot${token}/${method}`.

Lưu ý: khoá webhook đọc theo cặp — khoá màn chỉ có nghĩa khi token màn có. Nếu `zaloBotToken` có mà `zaloWebhookSecret` rỗng (bot lưu ở tác tử http), khoá rơi về env là đúng: màn chưa đăng ký webhook nào.

- [ ] **Step 5: Đổi bảy chỗ gọi sang `await`**

- `zalo-webhook.ts:57`: `const bien = deps.env ?? { token: await zaloToken(), khoa: await zaloKhoaWebhook() };`
- `zalo-dang-ky.ts:27`: như trên.
- `zalo-bot.ts:43`: `const token = await zaloToken();`
- `zalo-poll.ts:44`: `const token = await zaloToken();`
- `nhac-ke-hoach.ts:110`: `const token = await zaloToken();`
- `scripts/zalo-poll.ts`: `if (!(await zaloToken())) { … }`
- `scripts/zalo-webhook.ts`: không đổi (đi qua `dangKyWebhook`).

- [ ] **Step 6: Sửa Zalo giả cho khớp `getMe` thật và `getWebhookInfo`**

Trong `traGetMe`:
```ts
		result: {
			id: "b1",
			account_name: "bot.uipSwwnr",
			account_type: "BASIC",
			can_join_groups: false,
			display_name: "Bot OneHub",
		},
```
Thêm trước nhánh `chiGiaoKhiMo`:
```ts
		if (method === "getWebhookInfo") return traWebhookInfo(chon);
```
```ts
function traWebhookInfo(chon: ChonZaloGia): Response {
	const w = chon.webhookInfo ?? 404;
	if (w === 404) return Response.json({ ok: false, error_code: 404, description: "Not Found" }, { status: 404 });
	if (w === 500) return new Response("loi", { status: 500 });
	if (w === "la") return Response.json({ ok: true, result: { khac: 1 } });
	return Response.json({ ok: true, result: { url: w.url, updated_at: 1 } });
}
```
Viết `zalo-may-chu.ts` — MỘT `zaloGia` cho cả đời máy chủ (để đếm lời gọi và hàng tin giữ trạng thái), dùng lại đúng hàm trả lời của nó, không dựng khuôn thứ hai:
```ts
export function zaloMayChu(chon: ChonZaloGia = {}) {
	const gia = zaloGia(chon);
	const mayChu = Bun.serve({
		port: 0,
		fetch: async (req) => gia.fetcher(req.url, { method: "POST", body: await req.text() }),
	});
	return { url: `http://127.0.0.1:${mayChu.port}`, goi: gia.goi, soGoi: gia.soGoi, dung: () => mayChu.stop(true) };
}
```

- [ ] **Step 7: Chạy xanh + hai tệp đã ký**

Run: `bun run test -- "cd apps/agent && bun test test/noi-zalo-cho-nguoi-moi.integration.spec.ts -t 'nguon-token|ten-bot'"` → PASS.
Run: `bun run test -- "cd apps/agent && bun test test/nhac-qua-zalo.integration.spec.ts test/zalo-qua-webhook.integration.spec.ts"` → PASS toàn bộ (E21 vế 2).
Phá-thử (bản sao `.acceptance-runs/nzm-t2/`): đảo thứ tự trong `zaloToken` (env trước) → ô `man+env/kiemBot` đỏ, thông điệp «AppSetting thang env».

- [ ] **Step 8: Biến `ZALO_API_URL` ba nhà + commit**

`.env.example` (dưới khối Zalo):
```
# Tuỳ chọn. Gốc Zalo Bot API; để trống là https://bot-api.zaloplatforms.com.
# Chỉ đặt khi chạy thử với một Zalo giả.
ZALO_API_URL=
```
Thêm `ZALO_API_URL` vào `globalPassThroughEnv` (`turbo.json`) và `passThroughEnv` của `dev`, `dev:headless` (`apps/agent/turbo.json`); một dòng trong `docs/environment.md`.
```bash
git add apps/agent .env.example docs/environment.md turbo.json
git commit -m "feat(zalo): tac tu doc token tren man truoc bien moi truong"
```

---

### Task 3: `kiemBot` báo trạng thái webhook (Ngoài-4)

`independent: false` (sau Task 2) · phục vụ E9 (a–d), Review Focus 3 · hạng T2.

**Files:**
- Modify: `apps/agent/agent/lib/zalo-api.ts` (thêm `zaloGoiTho`)
- Modify: `apps/agent/agent/lib/zalo-bot.ts`
- Test: `apps/agent/test/noi-zalo-cho-nguoi-moi.integration.spec.ts` (`describe("trang-thai-webhook")`, phần nhịp)

**Interfaces — Produces:**
```ts
export async function zaloGoiTho(fetcher: typeof fetch, token: string, method: string, body: Record<string, string>): Promise<{ status: number; than: unknown }>;
```

- [ ] **Step 1: Test đỏ (bốn ca + ca 401)**

Mỗi ca chạy `dispatch.run()` (lấy từ `import dispatch from "../agent/schedules/dispatch"`, như vòng 1) với `thayFetch` trỏ Zalo giả:
```ts
const CA = [
	{ ten: "a", webhookInfo: { url: "https://u.test/zalo/webhook" }, ky: "https://u.test/zalo/webhook" },
	{ ten: "b", webhookInfo: 404, ky: null },
	{ ten: "c", webhookInfo: 500, ky: "https://cu.test/zalo/webhook" },
	{ ten: "d", webhookInfo: "la", ky: null },
] as const;
```
Gieo trước mỗi ca `zaloBotToken: "1:abc"`, `zaloWebhookUrl: "https://cu.test/zalo/webhook"`. Khẳng định `zaloWebhookUrl` đọc lại bằng `ky`; ca d: `spyOn(console, "error")` bắt đúng một dòng chứa `"khac"`. Ca 401 (Review Focus 3): `getMe: 401` → `zaloBotName` null VÀ `zaloWebhookUrl` null.

- [ ] **Step 2: Chạy thấy đỏ** — `-t trang-thai-webhook` → FAIL ca a (url giữ `cu.test`).

- [ ] **Step 3: Cài**

`zalo-api.ts`:
```ts
export async function zaloGoiTho(
	fetcher: typeof fetch,
	token: string,
	method: string,
	body: Record<string, string>,
): Promise<{ status: number; than: unknown }> {
	const res = await fetcher(`${zaloApiGoc()}/bot${token}/${method}`, {
		method: "POST",
		headers: { "Content-Type": "application/json; charset=utf-8" },
		body: JSON.stringify(body),
	});
	const than: unknown = await res.json().catch(() => null);
	return { status: res.status, than };
}
```
`zalo-bot.ts` — `ghiBot` nhận thêm `zaloWebhookUrl?: string | null`; trong `docBot` lỗi thì `ghiBot({ zaloBotName: null, zaloWebhookUrl: null })`; thêm:
```ts
async function docWebhook(token: string, fetcher: typeof fetch): Promise<void> {
	try {
		const { status, than } = await zaloGoiTho(fetcher, token, "getWebhookInfo", {});
		if (status === ZALO.http.khongCo) {
			await ghiBot({ zaloWebhookUrl: null });
			return;
		}
		if (status !== ZALO.http.ok) return;
		const info = parseZaloWebhookInfo(than);
		if (info.loai === "la") {
			console.error(`[zalo] getWebhookInfo sai khuon khoa=${info.khoa}`);
			await ghiBot({ zaloWebhookUrl: null });
			return;
		}
		await ghiBot({ zaloWebhookUrl: info.url });
	} catch (loi) {
		console.error(`[zalo] getWebhookInfo loi, giu trang thai cu: ${String(loi)}`);
	}
}
```
Thêm `http: { hetTin: 408, ok: 200, khongCo: 404 }` vào `ZALO`. Gọi `await docWebhook(token, fetcher)` trong `kiemBot` sau `docBot` thành công, trước dọn `ZaloUpdateSeen`. `ghiBot` đổi kiểu tham số thành `Partial<{ zaloBotName: string | null; zaloPolledAt: Date; zaloWebhookUrl: string | null }>`.

- [ ] **Step 4: Xanh + hai tệp đã ký xanh; phá-thử** bỏ nhánh 404 → ca b đỏ «404 thi ghi null».

- [ ] **Step 5: Commit** `feat(zalo): nhip kiem bot doc getWebhookInfo`

---

### Task 4: Hai route cầu nối trên tác tử

`independent: false` (sau Task 3) · phục vụ E1, E4, E5, E7, E9 (đăng ký lại), E14, Review Focus 2 · hạng T2.

**Files:**
- Create: `apps/agent/agent/lib/cau-noi-auth.ts` (chuyển `authorised` từ `crm.ts:64-74`, `crm.ts` nhập lại)
- Create: `apps/agent/agent/lib/zalo-bot-xuong.ts`
- Modify: `apps/agent/agent/channels/zalo.ts`
- Modify: `apps/agent/agent/lib/nhac-ke-hoach.ts` (xuất `guiQuaSlackThu` dùng lại đường Slack của nhắc — chỉ gửi, không `AgentTask`)
- Test: `apps/agent/test/noi-zalo-cho-nguoi-moi.integration.spec.ts` (`luu-bot`, `token-sai`, `can-https`, `quyen-cau`, phần đăng ký lại của `trang-thai-webhook`, `gui-thu`)

**Interfaces:**
- Consumes: `datBotYeuCau`, `datBotPhanHoi`, `guiThuYeuCau`, `guiThuPhanHoi`, `ZALO_CAU_NOI` (Task 1); `zaloToken`, `zaloGoi`, `zaloGoiTho` (Task 2–3); `kenhSeDungCua` (`@crm/db/kenh-thong-bao`); `NHAC.gio` (`@crm/db/onboarding-nhac`).
- Produces:
```ts
export function authorised(request: Request): boolean;                      // cau-noi-auth.ts
export async function datBot(yeuCau: DatBotYeuCau, goc: URL, deps?: { fetcher?: typeof fetch }): Promise<DatBotPhanHoi>;
export async function guiThu(userId: string, deps?: { fetcher?: typeof fetch; slackFetcher?: typeof fetch }): Promise<GuiThuPhanHoi>;
export function gioNhac(): string;   // "08:30" từ NHAC.gio
```

- [ ] **Step 1: Test đỏ**

Các ca gọi handler THẬT lấy từ `kenhZalo.routes.find((r) => r.method === "POST" && r.path === "/internal/zalo/bot")` (chuỗi đường ghim bằng chữ, không lấy hằng của mã), Request `new Request("https://tac-tu.test/internal/zalo/bot", { method: "POST", headers: { authorization: \`Bearer ${BI_MAT}\`, "content-type": "application/json" }, body: JSON.stringify({ token: T }) })`, `AGENT_BRIDGE_SECRET` đặt qua `voiBien` mở rộng.
- `luu-bot` (E1): năm dòng ma trận của E1; `setWebhook.url === "https://tac-tu.test/zalo/webhook"`; `secret_token` khớp `/^[0-9a-f]{64}$/`; đọc lại DB; `JSON.stringify(phanHoi)` không chứa T; đối chứng âm không header → 401, `z.goi.length === 0`. Review Focus 2: gọi hai lần liên tiếp với T1 rồi T2 → `zaloBotToken === T2` và `zaloWebhookSecret` bằng `secret_token` của lần `setWebhook` thứ hai.
- `token-sai` (E4): getMe 401 → `{ outcome: "invalid", reason }` chứa «Zalo không nhận token này», 0 `setWebhook`, bốn cột + `zaloBotName` so bằng bản chụp trước; đối chứng dương getMe 200 → 1 `setWebhook`.
- `can-https` (E5): gốc `http://127.0.0.1:2000` → 1 getMe, 0 setWebhook, `zaloWebhookLyDo === "can-https"`, `zaloWebhookUrl === null`, phản hồi `webhook: "can-https"`.
- `quyen-cau` (E7): hai route × ba header (không có, `"Bearer "`, `"Bearer sai"`) = 6 ô → 401, 0 lời gọi Zalo, `AppSetting` không đổi; đối chứng dương Bearer đúng → khác 401.
- `trang-thai-webhook` phần đăng ký lại: gieo token + khoá cũ, gọi route với `{}` → đúng 1 `setWebhook`, `body` của lời gọi đó đi đường `/bot<token đang lưu>/`, `secret_token` khác khoá cũ; rồi `nhanWebhook` với khoá cũ → 403, khoá mới → 200.
- `gui-thu` (E14): ba người U (đã nối), V (chỉ khớp Slack — gieo như `nhac-qua-zalo.integration.spec.ts` gieo khớp Slack), W (không kênh); đếm `db.agentTask.count()` trước/sau bằng nhau; U: 1 `sendMessage` tới `zaloUserId` chứa `"Tin thử từ CRM"`; V: 1 lời gọi Slack giả `chat.postMessage` tới `slackUserId`, 0 `sendMessage`; W: `{ kenh: null }`, 0 cả hai.

- [ ] **Step 2: Chạy thấy đỏ** — `-t 'luu-bot|token-sai|can-https|quyen-cau|gui-thu'` → FAIL (route không tồn tại).

- [ ] **Step 3: `cau-noi-auth.ts`** — chép nguyên thân `authorised` (dòng 64–74 của `crm.ts`) thành `export function authorised`; trong `crm.ts` xoá hàm cũ, `import { authorised } from "../lib/cau-noi-auth";`.

- [ ] **Step 4: `zalo-bot-xuong.ts`**

```ts
import { randomBytes } from "node:crypto";
import { db } from "@crm/db";
import { kenhSeDungCua } from "@crm/db/kenh-thong-bao";
import { NHAC } from "@crm/db/onboarding-nhac";
import { SETTINGS_ID } from "@crm/db/settings";
import {
	type DatBotPhanHoi,
	type DatBotYeuCau,
	type GuiThuPhanHoi,
	WEBHOOK_KET,
} from "@crm/validation/zalo-cau-noi";

type KetWebhook = (typeof WEBHOOK_KET)[number];
import { parseZaloGetMe, parseZaloSetWebhook } from "@crm/validation/zalo-update";
import { guiQuaSlackThu } from "./nhac-ke-hoach";
import { guiZalo, zaloGoi, zaloGoiTho, zaloToken } from "./zalo-api";
import { ZALO } from "./zalo-config";

export function gioNhac(): string {
	const hai = (n: number) => String(n).padStart(2, "0");
	return `${hai(NHAC.gio.gio)}:${hai(NHAC.gio.phut)}`;
}

async function tokenDung(yeuCau: DatBotYeuCau): Promise<string | null> {
	return yeuCau.token ?? (await zaloToken());
}

export async function datBot(
	yeuCau: DatBotYeuCau,
	goc: URL,
	deps: { fetcher?: typeof fetch } = {},
): Promise<DatBotPhanHoi> {
	const fetcher = deps.fetcher ?? fetch;
	const token = await tokenDung(yeuCau);
	if (!token) return { outcome: "khong-co-token", reason: "Chưa có Bot Token nào để đăng ký." };
	const me = await zaloGoiTho(fetcher, token, "getMe", {});
	if (me.status !== ZALO.http.ok) return { outcome: "invalid", reason: ZALO.loi.tokenSai };
	const { tenBot } = parseZaloGetMe(me.than);
	const khoa = randomBytes(ZALO.webhook.khoa.sinhByte).toString("hex");
	const url = new URL(ZALO.webhook.duong, goc).toString();
	const anToan = goc.protocol === ZALO.webhook.giaoThucAnToan;
	const webhook = anToan ? await dangKy(fetcher, token, url, khoa) : "can-https";
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID, ...ghi(token, khoa, tenBot, url, webhook) },
		update: ghi(token, khoa, tenBot, url, webhook),
	});
	return { outcome: "valid", tenBot, webhook };
}

async function dangKy(fetcher: typeof fetch, token: string, url: string, khoa: string): Promise<KetWebhook> {
	try {
		parseZaloSetWebhook(await zaloGoi(fetcher, token, "setWebhook", { url, secret_token: khoa }));
		return "da-dang-ky" as const;
	} catch (loi) {
		console.error(`[zalo] setWebhook loi: ${String(loi)}`);
		return "zalo-tu-choi" as const;
	}
}

function ghi(token: string, khoa: string, tenBot: string, url: string, webhook: KetWebhook) {
	const daDangKy = webhook === "da-dang-ky";
	return {
		zaloBotToken: token,
		zaloWebhookSecret: daDangKy ? khoa : null,
		zaloBotName: tenBot,
		zaloWebhookUrl: daDangKy ? url : null,
		zaloWebhookLyDo: daDangKy ? null : webhook,
	};
}

export async function guiThu(
	userId: string,
	deps: { fetcher?: typeof fetch; slackFetcher?: typeof fetch } = {},
): Promise<GuiThuPhanHoi> {
	const token = await zaloToken();
	const kenh = await kenhSeDungCua(db, userId, { coToken: token !== null });
	const cau = ZALO.loi.guiThu(gioNhac());
	if (kenh.kenh === "zalo" && token && kenh.zaloUserId) {
		await guiZalo(token, kenh.zaloUserId, cau, { fetcher: deps.fetcher });
	}
	if (kenh.kenh === "slack" && kenh.slackUserId) {
		await guiQuaSlackThu(kenh.slackUserId, cau, { fetcher: deps.slackFetcher });
	}
	return { kenh: kenh.kenh, lech: kenh.lech };
}
```
Nếu `NHAC` chưa được xuất từ `onboarding-nhac.ts`, thêm `export` cho hằng đó (không đổi giá trị).

`guiQuaSlackThu` trong `nhac-ke-hoach.ts`: tách phần gọi `sendSlackMessage` của `guiQuaSlack` (dòng 159+) thành hàm nhận `(slackUserId, text, { fetcher })`, mã tin client `nhac-thu-<userId>-<Date.now()>`; `guiQuaSlack` gọi lại hàm đó — hành vi nhắc không đổi.

- [ ] **Step 5: Mount route**

```ts
import { datBotYeuCau, guiThuYeuCau, ZALO_CAU_NOI } from "@crm/validation/zalo-cau-noi";
import { defineChannel, POST } from "eve/channels";
import { authorised } from "../lib/cau-noi-auth";
import { datBot, guiThu } from "../lib/zalo-bot-xuong";
import { ZALO } from "../lib/zalo-config";
import { nhanWebhook } from "../lib/zalo-webhook";

const CHUA_QUYEN = 401;
const SAI_THAN = 400;

async function docThan<T>(request: Request, schema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false } }) {
	return schema.safeParse(await request.json().catch(() => null));
}

export default defineChannel({
	routes: [
		POST(ZALO.webhook.duong, (request) => nhanWebhook(request)),
		POST(ZALO_CAU_NOI.bot, async (request) => {
			if (!authorised(request)) return new Response(null, { status: CHUA_QUYEN });
			const than = await docThan(request, datBotYeuCau);
			if (!than.success) return new Response(null, { status: SAI_THAN });
			return Response.json(await datBot(than.data, new URL(request.url)));
		}),
		POST(ZALO_CAU_NOI.guiThu, async (request) => {
			if (!authorised(request)) return new Response(null, { status: CHUA_QUYEN });
			const than = await docThan(request, guiThuYeuCau);
			if (!than.success) return new Response(null, { status: SAI_THAN });
			return Response.json(await guiThu(than.data.userId));
		}),
	],
});
```
Hai mã HTTP chuyển vào `ZALO.http` (`chuaQuyen: 401`, `saiThan: 400`) khi gõ thật — không để hằng tại chỗ (đây là Ngoài-2 của vòng 1, đừng lặp lại).

- [ ] **Step 6: Xanh; phá-thử** — (i) bỏ nhánh kiểm giao thức → `can-https` đỏ «http thi khong setWebhook»; (ii) trả `zaloBotToken` trong phản hồi → `luu-bot` dòng 5 đỏ; (iii) tạo `AgentTask` trong `guiThu` → `gui-thu` đỏ ở đếm `AgentTask`.

- [ ] **Step 7: Hai tệp đã ký xanh + commit** `feat(zalo): route cau noi dat bot va gui thu tren tac tu`

---

### Task 5: Tin đến — một giao dịch (Ngoài-3) và bot nhận ra người đã nối

`independent: false` (sau Task 2) · phục vụ E11, E12, E13, Review Focus 5 · hạng T2.

**Files:**
- Modify: `packages/db/src/zalo-lien-ket.ts` (kiểu `DbGhi`, `noiBangMa`/`ghiSai`/`dangBiChan` nhận giao dịch)
- Modify: `apps/agent/agent/lib/zalo-nhan.ts`
- Modify: `apps/agent/agent/lib/zalo-webhook.ts` (`"loi"` → 500)
- Test: agent spec `db-loi`, `gui-hong`, `da-noi-roi`

**Interfaces — Produces:**
```ts
export type DbGhi = Db | Prisma.TransactionClient;
export async function noiBangMa(db: DbGhi, chon: …): Promise<KetQuaNoi>;   // chữ ký cũ vẫn gọi được với db
export async function ghiSai(db: DbGhi, zaloUserId: string, now: Date): Promise<void>;
// zalo-nhan.ts
export type KetQuaTin = "bo-qua" | "xong" | "loi";   // không đổi; "loi" nay = DB lỗi, webhook trả 500
```

- [ ] **Step 1: Test đỏ**
- `db-loi` (E11): làm hỏng giao dịch bằng trigger tạm:
```ts
await db.$executeRawUnsafe(`CREATE OR REPLACE FUNCTION nzm_chan() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'nzm-chan'; END $$ LANGUAGE plpgsql`);
await db.$executeRawUnsafe(`CREATE TRIGGER nzm_chan BEFORE INSERT ON "zaloLink" FOR EACH ROW EXECUTE FUNCTION nzm_chan()`);
```
Lần 1 `nhanWebhook` → status 500; `zaloUpdateSeen.count({ where: { messageId } }) === 0`, `zaloLink.count({ where: { crmUserId: U } }) === 0`, `z.soGoi("sendMessage") === 0`. `DROP TRIGGER nzm_chan ON "zaloLink"; DROP FUNCTION nzm_chan();` (trong `finally`). Lần 2 cùng thân → 200, 1/1/1.
- `gui-hong` (E12): `zaloGia({ send: 500 })`; lần 1 → 200, `ZaloLink` + seen có; `spyOn(console, "error")` → lọc dòng chứa `message_id=<id>` đúng 1; lần 2 → 200, `soGoi("sendMessage")` không tăng, vẫn 1 `ZaloLink`. Đối chứng dương `send: "ok"` → 0 dòng lỗi.
- `da-noi-roi` (E13): gieo `ZaloLink` (U tên «Phan Lê Mạnh», Z); Z nhắn «xin chào» → 1 `sendMessage` tới Z, chữ chứa «Bạn đã nối với Phan Lê Mạnh» và «08:30», không chứa `ZALO.loi.huongDan`, `zaloLinkAttempt` của Z vắng; Y chưa nối nhắn cùng chữ → đúng `ZALO.loi.huongDan`. Review Focus 5: Z nhắn một mã 6 số đã dùng → bộ đếm sai tăng 1, tin là hướng dẫn, không phải «đã nối với».

- [ ] **Step 2: Chạy thấy đỏ** (`db-loi` lần 1 đang trả 200 và đã có seen).

- [ ] **Step 3: `zalo-lien-ket.ts` chạy được trong giao dịch**

```ts
import type { Prisma } from "@prisma/client";
export type DbGhi = Db | Prisma.TransactionClient;
```
(Nhập `Prisma` theo cách `client.ts` của gói đang nhập; `crm.ts` của tác tử dùng `import { Prisma } from "@crm/db"`.)
`noiBangMa` thay `db.$transaction([...])` bằng các lệnh tuần tự trên `db` truyền vào, rồi thêm lớp bọc:
```ts
export async function noiBangMa(db: DbGhi, chon: ChonNoi): Promise<KetQuaNoi> {
	if ("$transaction" in db) return db.$transaction((tx) => noiTrong(tx, chon));
	return noiTrong(db, chon);
}
```
`noiTrong` = thân cũ với bốn lệnh ghi chạy `await` tuần tự (`deleteMany`, `create`, `update` mã, `veAutoNeuZalo`). `ghiSai`, `dangBiChan` chỉ đổi kiểu tham số sang `DbGhi`. `goLienKet` giữ nguyên.

- [ ] **Step 4: `zalo-nhan.ts`**

```ts
type TraLoi = { chatId: string; text: string };

async function xuLyDb(tx: DbGhi, tin: ZaloMessage, now: Date): Promise<TraLoi | null> {
	const { count } = await tx.zaloUpdateSeen.createMany({
		data: [{ messageId: tin.message_id, seenAt: now }],
		skipDuplicates: true,
	});
	if (count === 0) return null;
	const tu = tin.from.id;
	if (await dangBiChan(tx, tu, now)) return null;
	const ma = chuanHoaMa(tin.text ?? "");
	if (!ma) return { chatId: tin.chat.id, text: await cauKhongMa(tx, tu) };
	const ket = await noiBangMa(tx, { ma, zaloUserId: tu, tenZalo: tin.from.display_name, now });
	if (ket.loai === "da-noi") return { chatId: tin.chat.id, text: ZALO.loi.daNoi(ket.tenCrm) };
	await ghiSai(tx, tu, now);
	return { chatId: tin.chat.id, text: ZALO.loi.huongDan };
}

async function cauKhongMa(tx: DbGhi, zaloUserId: string): Promise<string> {
	const lienKet = await tx.zaloLink.findUnique({
		where: { zaloUserId },
		include: { crmUser: { select: { name: true } } },
	});
	return lienKet ? ZALO.loi.daNoiRoi(lienKet.crmUser.name, gioNhac()) : ZALO.loi.huongDan;
}

export async function xuLyTinDen(token: string, tin: ZaloMessage, deps: PhuThuocNhan): Promise<KetQuaTin> {
	if (!laTinRieng(tin)) return "bo-qua";
	let traLoi: TraLoi | null;
	try {
		traLoi = await db.$transaction((tx) => xuLyDb(tx, tin, deps.now));
	} catch (loi) {
		console.error(`[zalo] khong ghi duoc message_id=${tin.message_id}: ${String(loi)}`);
		return "loi";
	}
	if (!traLoi) return "bo-qua";
	try {
		await guiZalo(token, traLoi.chatId, traLoi.text, { fetcher: deps.fetcher });
	} catch (loi) {
		console.error(`[zalo] gui tra loi hong message_id=${tin.message_id}: ${String(loi)}`);
	}
	return "xong";
}
```
(Kiểm tên quan hệ `crmUser` trên model `ZaloLink` trong `schema.prisma` trước khi gõ; `gioNhac` nhập từ `zalo-bot-xuong.ts` — nếu Task 4 chưa xong thì chuyển `gioNhac` sang `zalo-config.ts` và để Task 4 nhập từ đó.)

Chú ý luật vòng 1 «mã sống lúc đang bị chặn: không liên kết và không trả lời» — nhánh `dangBiChan` trả `null`, vẫn đã ghi seen: giữ đúng AC-6 vòng 1.

- [ ] **Step 5: `zalo-webhook.ts`** — `HTTP` thêm `loi: 500` (chuyển cả khối `HTTP` sang `ZALO.http` luôn, đóng Ngoài-2); sau `xuLyTinDen`: `if (ket === "loi") return traVe(ZALO.http.loiMayChu);`.

- [ ] **Step 6: Xanh, hai tệp đã ký xanh (E6, E4 vòng 1 phải còn xanh); phá-thử** ghi seen ngoài giao dịch (trước `$transaction`) → `db-loi` lần 2 đỏ «tin gap DB loi phai xu ly lai duoc».

- [ ] **Step 7: Commit** `fix(zalo): tin loi giua chung xu ly lai duoc; bot nhan ra nguoi da noi`

---

### Task 6: API — `luuBot`, `guiThu`, `xuong` mở rộng

`independent: false` (sau Task 1; test dùng máy chủ giả nên không cần Task 4) · phục vụ E2, E3, E6, E10, E15, Review Focus 1, 4 · hạng T2.

**Files:**
- Create: `apps/api/src/zalo/zalo-cau-noi.service.ts`
- Modify: `apps/api/src/zalo/zalo.contracts.ts`, `zalo.service.ts`, `zalo.router.ts`
- Test: `apps/api/test/noi-zalo-cho-nguoi-moi.spec.ts`

**Interfaces:**
- Consumes: `bridge()` (`apps/api/src/agent/bridge.ts`), schema Task 1, `workspaceRoleOf` + `canManageConnections` (`@crm/auth`, như `slack-connection.service.ts:2,274`).
- Produces (tRPC, dùng ở Task 10, 11):
```ts
zalo.luuBot   input { token?: string }  output { tenBot: string; webhook: "da-dang-ky"|"can-https"|"zalo-tu-choi" }
zalo.guiThu   input {}                 output { kenh: "zalo"|"slack" }
zalo.xuong    output cũ + { canManage: boolean; nguonToken: "man-hinh"|"env"|null; goiToken: string|null;
                            webhook: { trangThai: "da-dang-ky"|"can-https"|"chua-dang-ky"; url: string|null } }
export const ZALO_THONG_DIEP: { …cũ; saiDang; khongCauNoi; chuaCoKenh; tokenSai }
```

- [ ] **Step 1: Test đỏ** (bootstrap y hệt `test/nhac-qua-zalo.spec.ts`: `AppModule`, `mintPhien`, `supertest`, `gieoThanhVien(ten, "admin" | "member")` của `support/ke-hoach-gieo.ts`). Máy chủ giả tác tử:
```ts
function tacTuGia(traLoi: (duong: string, than: unknown) => Response) {
	const nhan: { duong: string; than: unknown }[] = [];
	const mayChu = Bun.serve({
		port: 0,
		fetch: async (req) => {
			const than = await req.json().catch(() => null);
			const duong = new URL(req.url).pathname;
			nhan.push({ duong, than });
			return traLoi(duong, than);
		},
	});
	return { url: `http://127.0.0.1:${mayChu.port}`, nhan, dung: () => mayChu.stop(true) };
}
```
Đặt `process.env.AGENT_URL = tacTu.url; process.env.AGENT_BRIDGE_SECRET = "bi-mat-thu"` quanh mỗi ca, trả lại sau.
- `luu-bot-api` (E2): máy chủ giả parse thân bằng `datBotYeuCau` và GHI `AppSetting` như tác tử thật (token, url, tên), trả `{ outcome: "valid", tenBot: "Bot OneHub", webhook: "da-dang-ky" }`; khẳng định năm dòng E2; dòng 1 so `datBotYeuCau.parse(nhan[0].than).token === T`.
- `token-sai-api` (E3): ca a 18 ký tự không `:` → lỗi chứa «<số>:<chuỗi>» và «Secret Token», `nhan.length === 0`, bốn cột + `zaloBotName` bằng bản chụp; đối chứng dương `"12345:abc"` → `nhan.length === 1`; Review Focus 1 `"  12345:abc\n"` → `nhan.length === 1` và `token === "12345:abc"`; ca đăng ký lại `luuBot({})` → `nhan.length === 1`, `"token" in nhan[0].than === false`.
- `quyen-api` (E6): thành viên thường → mã `FORBIDDEN`, `nhan.length === 0`, `AppSetting` không đổi, `xuong.canManage === false`, `xuong.goiToken === null`; đối chứng quản trị → `nhan.length === 1`.
- `xuong-webhook` (E10): ba cấu hình gieo tay → ba trạng thái, ba assert.
- `gui-thu-api` (E15): giả trả `{ kenh: null, lech: false }` → lỗi chứa «chưa có kênh nào»; `AGENT_BRIDGE_SECRET` rỗng → lỗi yêu cầu, status 400 (không 500); giả trả `{ kenh: "zalo", lech: false }` → `{ kenh: "zalo" }` và `nhan[0].than.userId` là id của phiên. Review Focus 4: `AGENT_URL` trỏ cổng không ai nghe → lỗi chứa «tác tử chưa nối được», không treo quá `ZALO_CAU_NOI_API.timeoutMs`.

- [ ] **Step 2: Chạy thấy đỏ** — `bun run test -- "cd apps/api && bun test test/noi-zalo-cho-nguoi-moi.spec.ts"` → FAIL (`zalo.luuBot` không tồn tại, 404).

- [ ] **Step 3: `zalo-cau-noi.service.ts`**

```ts
import {
	type DatBotPhanHoi,
	datBotPhanHoi,
	type DatBotYeuCau,
	type GuiThuPhanHoi,
	guiThuPhanHoi,
	ZALO_CAU_NOI,
} from "@crm/validation/zalo-cau-noi";
import { Injectable, Logger } from "@nestjs/common";
import { bridge } from "../agent/bridge";

export const ZALO_CAU_NOI_API = { timeoutMs: 20_000 } as const;

export type KetCauNoi<T> = { ok: true; data: T } | { ok: false; lyDo: string };

@Injectable()
export class ZaloCauNoiService {
	private readonly logger = new Logger(ZaloCauNoiService.name);

	datBot(yeuCau: DatBotYeuCau): Promise<KetCauNoi<DatBotPhanHoi>> {
		return this.goi(ZALO_CAU_NOI.bot, yeuCau, datBotPhanHoi);
	}

	guiThu(userId: string): Promise<KetCauNoi<GuiThuPhanHoi>> {
		return this.goi(ZALO_CAU_NOI.guiThu, { userId }, guiThuPhanHoi);
	}

	private async goi<T>(duong: string, than: unknown, schema: { parse: (v: unknown) => T }): Promise<KetCauNoi<T>> {
		const cau = bridge();
		if (!cau) return { ok: false, lyDo: "khong-cau-noi" };
		try {
			const res = await fetch(cau.url(duong), {
				method: "POST",
				headers: { authorization: `Bearer ${cau.secret}`, "content-type": "application/json" },
				body: JSON.stringify(than),
				signal: AbortSignal.timeout(ZALO_CAU_NOI_API.timeoutMs),
			});
			if (!res.ok) return { ok: false, lyDo: `http-${res.status}` };
			return { ok: true, data: schema.parse(await res.json()) };
		} catch (loi) {
			this.logger.warn({ message: "Zalo bridge call failed", duong, loi: loi instanceof Error ? loi.message : String(loi) });
			return { ok: false, lyDo: "khong-noi-duoc" };
		}
	}
}
```
(`ZALO_CAU_NOI_API` là hằng của khu API Zalo; nếu `apps/api/src/zalo/` đã có tệp config thì đặt vào đó.)

- [ ] **Step 4: Contracts + service + router**

Contracts:
```ts
export const zaloLuuBotInput = z.object({ token: z.string().trim().min(1).optional() });
export const zaloLuuBotOutput = z.object({ tenBot: z.string(), webhook: z.enum(WEBHOOK_KET) });
export const zaloGuiThuOutput = z.object({ kenh: z.enum(["zalo", "slack"]) });
export const zaloXuongOutput = z.object({
	…cũ,
	canManage: z.boolean(),
	nguonToken: z.enum(["man-hinh", "env"]).nullable(),
	goiToken: z.string().nullable(),
	webhook: z.object({ trangThai: z.enum(["da-dang-ky", "can-https", "chua-dang-ky"]), url: z.string().nullable() }),
});
```
Service (`zalo.service.ts`), thêm vào `ZALO_THONG_DIEP`:
```ts
	saiDang: "Đây không phải Bot Token. Bot Token có dạng <số>:<chuỗi> (vd 1234567890:AbC…), khác Secret Token.",
	khongCauNoi: "Tác tử chưa nối được, nên chưa kiểm được token. Thử lại sau.",
	chuaCoKenh: "Bạn chưa có kênh nào để nhận tin thử — hãy nối Zalo hoặc nhờ quản trị viên ghép Slack.",
	tokenSai: "Zalo không nhận token này.",
```
```ts
	async luuBot(userId: string, token: string | undefined) {
		await this.access.assertMember(userId);
		if (!canManageConnections(await workspaceRoleOf(userId))) {
			throw new ForbiddenException("Chỉ quản trị viên thay được bot.");
		}
		if (token !== undefined && !BOT_TOKEN.test(token)) {
			throw new BadRequestException(ZALO_THONG_DIEP.saiDang);
		}
		const ket = await this.cauNoi.datBot(token === undefined ? {} : { token });
		if (!ket.ok) throw new BadRequestException(ZALO_THONG_DIEP.khongCauNoi);
		if (ket.data.outcome !== "valid") throw new BadRequestException(ket.data.reason);
		return { tenBot: ket.data.tenBot, webhook: ket.data.webhook };
	}

	async guiThu(userId: string) {
		await this.access.assertMember(userId);
		const ket = await this.cauNoi.guiThu(userId);
		if (!ket.ok) throw new BadRequestException(ZALO_THONG_DIEP.khongCauNoi);
		if (ket.data.kenh === null) throw new BadRequestException(ZALO_THONG_DIEP.chuaCoKenh);
		return { kenh: ket.data.kenh };
	}
```
`BOT_TOKEN = /^\d+:[A-Za-z0-9_-]+$/` đặt trong một hằng khu `ZALO_API` (cùng chỗ `ZALO_CAU_NOI_API`), KHÔNG nhập từ `apps/agent`. `token` đã `trim()` bởi input schema. `ket.data.reason` của tác tử là «Zalo không nhận token này.».

`xuong`: `select` thêm `zaloBotToken`, `zaloWebhookUrl`, `zaloWebhookLyDo`; `canManage = canManageConnections(await workspaceRoleOf(userId))`;
```ts
const token = caiDat?.zaloBotToken ?? null;
const nguonToken = token ? "man-hinh" : caiDat?.zaloBotName ? "env" : null;
const goiToken = canManage && token ? token.slice(-GOI_TOKEN_KY_TU) : null;
const lyDo = docLyDo(caiDat?.zaloWebhookLyDo ?? null);
const trangThai = caiDat?.zaloWebhookUrl ? "da-dang-ky" : lyDo === "can-https" ? "can-https" : "chua-dang-ky";
```
`GOI_TOKEN_KY_TU = 4` trong hằng khu. Router thêm hai `@Mutation` (`restMeta("PUT", "/zalo/bot")`, `restMeta("POST", "/zalo/test-message")`). Module: thêm `ZaloCauNoiService` vào `providers`.

- [ ] **Step 5: Xanh; phá-thử** bỏ kiểm dạng → `token-sai-api` ca a đỏ «sai dang thi khong goi tac tu»; trả nguyên token trong `xuong` → `luu-bot-api` dòng 5 đỏ «token khong ve trinh duyet».

- [ ] **Step 6: Sinh lại kiểu tRPC + typecheck** — `cd apps/api && bun run trpc:generate` rồi `bun run check-types` ở gốc.

- [ ] **Step 7: Commit** `feat(zalo): API luu bot, gui thu, trang thai webhook cho trang ket noi`

---

### Task 7: Gỡ liên kết Zalo khi gỡ thành viên

`independent: false` (sau Task 6 — dùng chung tệp test `apps/api/test/noi-zalo-cho-nguoi-moi.spec.ts` vì eval `nzm_go_thanh_vien` trỏ vào đó) · phục vụ E16 · hạng **T3** (module `workspace`).

**Files:**
- Modify: `apps/api/src/workspace/workspace.service.ts:490` (trong `$transaction` của `removeMember`, sau `session.deleteMany`)
- Test: `apps/api/test/noi-zalo-cho-nguoi-moi.spec.ts` (`describe("go-thanh-vien")`)

- [ ] **Step 1: Test đỏ** — gieo U, V (`gieoThanhVien`), mỗi người `taoMaLienKet` + `noiBangMa` (tạo `ZaloLink`) + `taoMaLienKet` lần nữa (có `ZaloLinkCode`) + `notificationPreference.create({ userId, channel: "ZALO" })`; quản trị gọi `POST /api/trpc/workspace.removeMember` với `{ memberId: "m-<U.id>" }`; đọc lại ba bảng: U 0/0/0, V 1/1/1 (sáu assert).
- [ ] **Step 2: Đỏ** (U còn 1/1/1).
- [ ] **Step 3: Cài**
```ts
			await tx.zaloLink.deleteMany({ where: { crmUserId: target.userId } });
			await tx.zaloLinkCode.deleteMany({ where: { crmUserId: target.userId } });
			await tx.notificationPreference.deleteMany({ where: { userId: target.userId } });
```
- [ ] **Step 4: Xanh; phá-thử** bỏ dòng `zaloLink` → đỏ «nguoi roi xuong bi go lien ket Zalo». Chạy cả `test/workspace*.spec.ts` hiện có → xanh.
- [ ] **Step 5: Commit** `fix(workspace): go lien ket Zalo khi go thanh vien`

---

### Task 8: Phép đo chỗ nối thật API ↔ tác tử

`independent: false` (sau Task 4 và 6) · phục vụ E23 · hạng T2.

**Files:**
- Create: `apps/api/test/noi-zalo-cau-noi.spec.ts`

- [ ] **Step 1: Viết test** (nhập handler tác tử bằng đường tương đối, như `apps/agent/test/support/nhac-gieo.ts` đang nhập mã API):
```ts
import kenhZalo from "../../agent/agent/channels/zalo";

const route = kenhZalo.routes.find((r) => r.method === "POST" && r.path === "/internal/zalo/bot");
import { zaloMayChu } from "../../agent/test/support/zalo-may-chu";

const route = kenhZalo.routes.find((r) => r.method === "POST" && r.path === "/internal/zalo/bot");
const zalo = zaloMayChu(chon);
const tacTu = Bun.serve({
	port: 0,
	fetch: (req) =>
		route!.handler(new Request(`https://tac-tu.test${new URL(req.url).pathname}`, req), {} as never),
});
process.env.AGENT_URL = `http://127.0.0.1:${tacTu.port}`;
process.env.AGENT_BRIDGE_SECRET = "bi-mat-thu";
process.env.ZALO_API_URL = zalo.url;
```
Máy chủ `tacTu` bọc lại request dưới gốc `https://tac-tu.test`, vì route cầu nối lấy gốc webhook từ `new URL(request.url)`; không bọc thì gốc là `http://127.0.0.1` và tác tử đúng luật sẽ không gọi `setWebhook`, trái lời hứa của E23. (Dựng TLS tự ký chỉ để đo là quá tay.)
Ca a: quản trị `luuBot({ token: T })` qua `supertest` → Zalo giả nhận đúng 1 `getMe` trên đường `/bot<T>/getMe` và đúng 1 `setWebhook`; `AppSetting.zaloBotToken === T` đọc lại. Ca b: `getMe: 401` → lỗi tRPC `BAD_REQUEST`, chữ «Zalo không nhận token này», 0 `setWebhook`, `zaloBotToken` bằng trước.

- [ ] **Step 2: Chạy xanh** (Task 4, 6 đã xong). Phá-thử (bản sao): đổi tên trường `token` → `botToken` ở `ZaloCauNoiService.datBot` → schema `strictObject` bên tác tử trả 400 → ca a đỏ, thông điệp ghim «API gui dung token tac tu doc».
- [ ] **Step 3: Commit** `test(zalo): do cho noi that API voi tac tu`

---

### Task 9: Cài `@reui/stepper` vào `packages/ui`

`independent: true` · phục vụ E19, E24 (nền cho Task 10, 11) · hạng T2.

**Files:**
- Create: `packages/ui/src/components/reui/stepper.tsx`
- Đọc trước: `docs/reui.md` (bốn chỗ phải sửa sau khi cài).

- [ ] **Step 1:** `cd packages/ui && bun run ui:add @reui/stepper --dry-run` → đúng 1 tệp mới, không ghi đè. Khác thì DỪNG.
- [ ] **Step 2:** `bun run ui:add @reui/stepper` (không `--overwrite`).
- [ ] **Step 3:** Sửa theo `docs/reui.md`: `cn` nhập từ `@crm/ui/lib/utils`; bỏ mọi chú thích trong tệp; bán kính chỉ `rounded-sm|md|lg`; màu chỉ token (`bg-primary`, `text-muted-foreground`…). Khai subpath `@crm/ui/components/reui/stepper` nếu `package.json` của gói liệt kê tường minh.
- [ ] **Step 4:** `bun run check-types && bun run lint && bun run lint:slop` → xanh.
- [ ] **Step 5: Commit** `feat(ui): them stepper tu ReUI`

---

### Task 10: Màn Kết nối › Zalo

`independent: false` (sau Task 6, 9) · phục vụ E18, E19, E20 (danh sách, hướng dẫn), E24, AC-12 phần màn · hạng T2.

**Files:**
- Modify: `apps/app/app/(app)/[slug]/settings/connections/zalo/page.tsx` (truyền dữ liệu mới)
- Modify: `apps/app/app/(app)/[slug]/settings/connections/zalo/ket-noi-zalo-than.tsx` (bỏ hẳn `className="w-20 shrink-0"` trên `StatusIndicator` — vừa sửa nhãn bị cắt vừa theo luật không ghi đè; dựng khối «Bot của xưởng»)
- Create: `apps/app/app/(app)/[slug]/settings/connections/zalo/o-token.tsx` (client, khuôn `settings/research-key.tsx`)
- Create: `apps/app/app/(app)/[slug]/settings/connections/zalo/trang-thai-webhook.tsx`
- Modify: `apps/app/lib/messages/nhac-qua-zalo.ts` (khối `ketNoi`: bỏ `cachBat1–3` cũ, thêm chữ mới cả `en`/`vi`)
- Test: `apps/app/test/noi-zalo-cho-nguoi-moi.dom.tsx` (`o-token`, `chu-man` phần kết nối)

Bố cục theo proto đã duyệt (`apps/app/app/proto/_modules/noi-zalo-cho-nguoi-moi/ket-noi.tsx`, ảnh `_acceptance/noi-zalo-cho-nguoi-moi/evidence/design-pass/ST-ket-noi-*.png`) — chép cấu trúc, thay `CacBuoc` tạm bằng `Stepper` của Task 9, chữ lấy từ messages.

- [ ] **Step 1: Test đỏ `o-token` (E18)** — dựng theo khung `test/nhac-qua-zalo.dom.tsx` (proxy tRPC giả đếm `daGoi`). Bốn dòng của E18 + đối chứng. Mutation giả `zalo.luuBot`: ca 2 trả `Promise.reject(new TRPCClientError("Zalo không nhận token này."))`, ca 3 trả promise chưa giải (giữ `resolve` để đóng sau).
- [ ] **Step 2: Test đỏ `chu-man` phần kết nối (E20)** — render `KetNoiZaloThan` với danh sách có người chưa nối: không phần tử nào mang lớp `w-20`; cả `en` và `vi`: chữ hướng dẫn không chứa `.env` và `bot.zaloplatforms.com`.
- [ ] **Step 3: Đỏ.**
- [ ] **Step 4: Messages** — thêm (vi, en tương ứng):
```ts
		botXuong: "Bot của xưởng",
		buoc1TieuDe: "Tạo bot trong Zalo",
		buoc1MoTa: "Mở app Zalo, tìm OA «Zalo Bot Manager», chọn Tạo bot và đặt tên — tên này là tên mọi người tìm để nối.",
		buoc2TieuDe: "Chép Bot Token",
		buoc2MoTa: "Trong Zalo Bot Manager, mở bot vừa tạo và chép Bot Token. Token có dạng 1234567890:AbC… — không phải Secret Token.",
		buoc3TieuDe: "Dán vào đây",
		buoc3MoTa: "CRM kiểm token với Zalo rồi tự đăng ký nhận tin.",
		nhanToken: "Bot Token",
		luu: "Lưu",
		thayToken: "Thay token",
		dangKiem: "Đang kiểm…",
		saiDang: "Đây không phải Bot Token. Bot Token có dạng 1234567890:AbC…, khác Secret Token.",
		daLuu: (ten: string) => `Đã bật ${ten}.`,
		tokenEnv: "Token đang đặt trong tệp .env của máy chủ. Dán token ở đây để thay.",
		chiQuanTri: "Chỉ quản trị viên thay được bot.",
		nhanQuaWebhook: "Nhận tin qua webhook",
		canHttpsTieuDe: "Tin nhắn tới bot chưa về CRM",
		canHttpsMoTa: "Tác tử chưa có địa chỉ https nên Zalo không giao tin về được. Khi thử tại máy, chạy",
		chuaWebhookTieuDe: "Zalo chưa giao tin nhắn về CRM",
		chuaWebhookMoTa: "Người nhắn mã sẽ không được nối cho tới khi đăng ký lại.",
		dangKyLai: "Đăng ký lại",
```
Chữ `.env` chỉ xuất hiện ở `tokenEnv` (trạng thái env), không ở ba bước — E19/E20 soi ảnh «chưa bật».
- [ ] **Step 5: `o-token.tsx`** — `"use client"`; `Field`, `FieldLabel`, `FieldError`, `Input type="password" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}`, `Button` (`variant` mặc định khi chưa bật, `outline` khi đã bật), `Spinner`; kiểm `BOT_TOKEN_MAN = /^\d+:[A-Za-z0-9_-]+$/` (hằng trong `apps/app/lib/nhac-qua-zalo-man.ts` khối `ZALO_MAN`) trên `draft.trim()` trước `mutate`; sai → đặt lỗi, `inputRef.current?.focus()`, không gọi; `onError` → lỗi = `error.message`, focus; lỗi đặt trong `<div aria-live="polite">`; `onSuccess` → `toast.success(t.daLuu(kq.tenBot))`, `cache.zalo()`, xoá draft.
- [ ] **Step 6: `trang-thai-webhook.tsx`** — ba nhánh `da-dang-ky` / `can-https` / `chua-dang-ky` y như proto, nút «Đăng ký lại» (`outline`) gọi `luuBot.mutate({})`, chỉ hiện khi `canManage`.
- [ ] **Step 7: `ket-noi-zalo-than.tsx` + `page.tsx`** — `KetNoiZaloDu` thêm `canManage`, `nguonToken`, `goiToken`, `webhook`; khối «Bot của xưởng»: không quản trị → `chiQuanTri`; chưa bật → `Stepper` ba bước, bước 3 chứa `OToken`; đã bật → `TrangThaiWebhook` + (env ? `tokenEnv`) + `OToken`. Header: tên bot `translate="no"`. Danh sách: bỏ `className` trên `StatusIndicator`; tên Zalo `hidden sm:inline` giữ như proto; hàng tiêu đề `flex-wrap`.
- [ ] **Step 8: Xanh; phá-thử** thêm lại `w-20` → `chu-man` đỏ «nhan trang thai khong bi cat»; bỏ `aria-live` → `o-token` đỏ.
- [ ] **Step 9:** `bun run check-types && bun run lint && bun run lint:slop` rồi chạy E24: `node … design-gate.mjs --target "apps/app/app/(app)/[slug]/settings/connections/zalo/page.tsx" --mode static` (lệnh đủ trong `_acceptance/config.yaml` khoá `nzm_san_thiet_ke`) → xanh.
- [ ] **Step 10: Commit** `feat(zalo): trang ket noi dan Bot Token, trang thai webhook`

---

### Task 11: Màn Thông báo của bạn

`independent: false` (sau Task 6, 9; song song được với Task 10 nếu hai người khác nhau sửa hai phần `messages` không đè — mặc định làm tuần tự sau Task 10) · phục vụ E19, E20 (chữ khoá kênh), AC-12, AC-14 · hạng T2.

**Files:**
- Modify: `apps/app/app/(app)/[slug]/settings/notifications/khoi-zalo.tsx`
- Modify: `apps/app/app/(app)/[slug]/settings/notifications/khoi-kenh.tsx` (không đổi mã; chỉ chữ)
- Modify: `apps/app/lib/messages/nhac-qua-zalo.ts` (khối `khoiZalo`, `kenh`)
- Test: `apps/app/test/noi-zalo-cho-nguoi-moi.dom.tsx` (`chu-man` phần kênh)

- [ ] **Step 1: Test đỏ `chu-man` (E20)** — ma trận 2 ngôn ngữ × 3 lý do khoá (Zalo tắt · Zalo chưa nối · Slack chưa khớp) = 6 ô, mỗi ô render `KhoiKenh` với `cuaToi` giả tương ứng, lấy `li` lý do, khẳng định `textContent` không khớp `/^(Zalo|Slack): \1/`. In bảng, số assert = 6.
- [ ] **Step 2: Đỏ** (ô «Zalo tắt» vi đang là «Zalo: Zalo chưa bật cho xưởng.»).
- [ ] **Step 3: Chữ khoá kênh** (vi / en):
```ts
		khoaZaloTat: "chưa bật cho xưởng này.",          // en: "not switched on for this workspace."
		khoaZaloChuaNoi: "bạn chưa nối.",                 // en: "you have not connected it yet."
		khoaSlack: "chưa nhận ra bạn — nhờ quản trị viên ghép người ở Kết nối › Slack.",
		// en: "does not recognise you yet — ask an admin to match people under Connections › Slack."
```
- [ ] **Step 4: `khoi-zalo.tsx`** — theo proto `apps/app/app/proto/_modules/noi-zalo-cho-nguoi-moi/thong-bao.tsx`:
  - chưa nối / mã hết hạn / mã chờ → `Stepper` dọc ba bước: (1) «Mở Zalo, tìm <tên bot>» (`translate="no"`, tên từ `du.tenBot` — nay là `display_name`); (2) «Lấy mã nối» + nút `Nối Zalo` / `Tạo mã mới` (nút tô đầy duy nhất của màn); (3) «Nhắn mã cho bot» — khi mã chờ thì chứa khối mã hiện có.
  - Khối mã: tách giờ hết hạn khỏi `StatusIndicator` (Nhóm 2 của design-pass): `StatusIndicator busy label={t.dangChoNgan}` + dòng `<p className="text-muted-foreground text-xs">{t.hetHanLuc(gio)}</p>` — chữ `dangChoNgan: "Đang chờ bạn nhắn"`, `hetHanLuc: (g) => \`Hết hạn lúc ${g}\``.
  - đã nối → giữ trạng thái + «Gỡ» (`outline`); thêm «Gửi thử nhắc ngay» (`outline`, icon `SendAlt`) gọi `trpc.zalo.guiThu`; `isPending` → `Spinner` + «Đang gửi…»; `onSuccess` → `toast.success(kq.kenh === "zalo" ? t.daGuiThuZalo : t.daGuiThuSlack)`; `onError` → dòng `role="alert"` `t.guiThuLoi` dưới nút.
  - Chữ mới cả hai ngôn ngữ: `buocTimBot`, `buocTimBotMoTa`, `buocLayMa`, `buocLayMaMoTa`, `buocNhanMa`, `buocNhanMaMoTa`, `guiThu`, `dangGui`, `daGuiThuZalo`, `daGuiThuSlack`, `guiThuLoi`, `dangChoNgan`, `hetHanLuc`.
- [ ] **Step 5: Xanh; hai tệp DOM cũ** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/nhac-qua-zalo.dom.tsx` → xanh. Nếu một ca cũ ghim đúng chữ vừa đổi (vd «Zalo chưa bật cho xưởng.») thì đó là tệp của vòng `nhac-qua-zalo` không nằm trong E21 — sửa ca đó cho khớp chữ mới và ghi một dòng `fix` S3 vào sổ quyết định. Chạy cả `bun run test:dom` hai thứ tự (bộ nhớ «mock.module sống qua các tệp kiểm»).
- [ ] **Step 6: Phá-thử** trả lại «Zalo chưa bật cho xưởng.» → ô tương ứng đỏ «khong lap ten kenh».
- [ ] **Step 7: Kiểm tay trên màn thật** — chạy `apps/api` 3301 + `apps/app` 3300 của cây này (theo `docs/setup.md`, đăng nhập bằng `bun run dev:session`), mở hai trang ở 1440 và 375, so với ảnh proto; ghi chênh lệch vào mô tả commit nếu có.
- [ ] **Step 8: Commit** `feat(zalo): ba buoc noi Zalo, gui thu nhac, sua chu khoa kenh`

---

### Task 12: Tài liệu và phép đo tài liệu

`independent: true` (chỉ chữ + một script đọc chữ) · phục vụ E22 · hạng T1-trong-T3.

**Files:**
- Modify: `docs/connections.md` (mục Zalo), `docs/environment.md`, `.env.example`, `docs/proto.md`, `docs/agent.md` (mục Zalo: hai route cầu nối), `CONTEXT.md` (mục **Bot Zalo**: nay còn nhận ra người đã nối và gửi tin thử)
- Create: `_acceptance/noi-zalo-cho-nguoi-moi/rang/tai-lieu.mjs`

- [ ] **Step 1: Viết script đỏ trước** (đường suy từ vị trí script):
```js
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const docTep = (tep) => readFileSync(join(GOC, tep), "utf8");
const docOnehub = (tep) => execFileSync("git", ["-C", GOC, "show", `origin/onehub:${tep}`], { encoding: "utf8" });

function mucZalo(chu) {
	const dau = chu.search(/^##+ .*Zalo/m);
	if (dau < 0) return "";
	const sau = chu.slice(dau + 1).search(/^## /m);
	return sau < 0 ? chu.slice(dau) : chu.slice(dau, dau + 1 + sau);
}
const coDongBien = (chu) =>
	["ZALO_BOT_TOKEN", "ZALO_WEBHOOK_SECRET"].every((bien) =>
		chu.split("\n").filter((d) => d.includes(bien)).some((d) => d.includes("AppSetting")) ||
		chu.split(/\n\s*\n/).some((doan) => doan.includes(bien) && doan.includes("AppSetting")),
	);

const DIEU = [
	["connections-dan-token", "docs/connections.md", (c) => {
		const m = mucZalo(c);
		const doanToken = m.split(/\n\s*\n/).find((d) => d.includes("Bot Token")) ?? "";
		return doanToken.includes("Kết nối › Zalo") && /dán/i.test(doanToken) && !/sửa\s+`?\.env`?.*khởi động lại/is.test(m);
	}],
	["environment-appsetting", "docs/environment.md", coDongBien],
	["env-example-appsetting", ".env.example", coDongBien],
	["proto-reui", "docs/proto.md", (c) => /^##+ .*ReUI/m.test(c) && c.includes("tham chiếu")],
];

let thieu = 0;
for (const [ten, tep, dat] of DIEU) {
	if (dat(docOnehub(tep))) {
		console.error(`doi chung hong: ${ten}`);
		process.exit(2);
	}
	if (!dat(docTep(tep))) {
		console.error(`thieu: ${ten}`);
		thieu++;
	}
}
process.exit(thieu ? 1 : 0);
```
Run: `node _acceptance/noi-zalo-cho-nguoi-moi/rang/tai-lieu.mjs` → exit 1, bốn dòng `thieu:`.

- [ ] **Step 2: Sửa tài liệu**
  - `docs/connections.md` mục Zalo: đường chính «quản trị viên mở Kết nối › Zalo, dán Bot Token (chép trong OA Zalo Bot Manager), CRM kiểm với Zalo và tự đăng ký webhook»; trạng thái webhook ba nhánh; `.env` chỉ còn là đường dự phòng một câu.
  - `docs/environment.md` + `.env.example`: dòng `ZALO_BOT_TOKEN`, `ZALO_WEBHOOK_SECRET` ghi «dự phòng — giá trị dán trên màn (lưu trong `AppSetting`) thắng»; `ZALO_API_URL` (Task 2).
  - `docs/proto.md`: mục mới «Block ReUI chỉ là tham chiếu bố cục» — block Pro ghi đè `button`/`card`/`badge` đã tuỳ biến và thêm biến màu, nên chỉ xem ảnh/bố cục rồi dựng bằng component của kho; component miễn phí (vd stepper) cài vào `packages/ui` theo `docs/reui.md`.
  - `docs/agent.md` mục Zalo: hai route `POST /internal/zalo/bot`, `POST /internal/zalo/gui-thu`, cùng luật Bearer `AGENT_BRIDGE_SECRET`.
  - `CONTEXT.md` mục **Bot Zalo**: thêm «nhận ra người đã nối và gửi tin thử khi được bấm».
- [ ] **Step 3: Xanh** — script exit 0. Phá-thử: xoá câu «dán» trong `connections.md` (bản sao) → exit 1 «thieu: connections-dan-token».
- [ ] **Step 4: Commit** `docs(zalo): bat bot tren man, bien du phong, block ReUI chi tham chieu`

---

### Task 13: Chốt trước S4

`independent: false` (cuối cùng) · phục vụ E21, E24 và năm suite của kho.

- [ ] **Step 1:** E21 — chạy đúng lệnh `nzm_giu_da_ky` trong `_acceptance/config.yaml` → exit 0.
- [ ] **Step 2:** E24 — lệnh `nzm_san_thiet_ke` → exit 0.
- [ ] **Step 3:** Năm lệnh ở gốc: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` → xanh.
- [ ] **Step 4:** Cập nhật dòng 2 mục 7 của `docs/plan/lo-trinh-zalo.md` (trạng thái «S3 xong, chờ S4») và commit `chore(zalo): chot S3 vong 2`.
- [ ] **Step 5:** Đặt `status: implemented` trong contract (qua công cụ sửa tệp để hook kiểm), commit, rồi vào S4 theo feature-loop.

---

## Thứ tự và độc lập

```
T1 ─┬─ T2 ─┬─ T3 ── T4 ─┐
    │      └─ T5        ├─ T8
    └─ T6 ── T7 ────────┘
T9 (độc lập) ── T10 ── T11
T12 (độc lập)
                         tất cả ── T13
```
Hai task `independent: true` (T9, T12) chạy song song qua `execute-parallel.js`; phần còn lại tuần tự trong vòng chính theo thứ tự T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T10 → T11 → T13.
