# zalo-qua-webhook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bot Zalo nhận tin qua webhook trên tác tử. Tin mã tới là nối ngay; cron chỉ kiểm bot sống; có hai lệnh tay `zalo:webhook` và `zalo:poll`.

**Architecture:** Một custom eve channel `agent/channels/zalo.ts` bọc hàm `nhanWebhook(request, deps)`. Hàm này kiểm khoá rồi chuyển tin vào lõi `xuLyTinDen`, lõi tách từ `zalo-poll.ts` và dùng chung với vòng tay. Cron gọi `kiemBot()` (chỉ `getMe`) thay `pollZalo()`. Zalo giả trong test có thêm chế độ «chỉ giao khi đang mở» trên một đồng hồ ảo, và fixture chép từ tin thật.

**Tech Stack:** Bun, eve 0.29 (`eve/channels`, `eve/schedules`), Prisma (`@crm/db`), Zod (`@crm/validation`), `bun:test`.

**Spec:** `docs/superpowers/specs/2026-09-24-zalo-qua-webhook-design.md` · hợp đồng `_acceptance/zalo-qua-webhook/contract.md` · evals `_acceptance/zalo-qua-webhook/evals.yaml`

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Hằng số chỉnh được nằm trong `ZALO` ở `apps/agent/agent/lib/zalo-config.ts`, `as const`, không số lạ trong hàm.
- Phân tích ở biên bằng Zod trong `packages/validation/src/zalo-update.ts`; không truyền `Record<string, unknown>`.
- Thiếu `ZALO_BOT_TOKEN` hoặc `ZALO_WEBHOOK_SECRET` thì mất năng lực, không ném — kể cả lúc nạp module.
- Biến đọc lúc gọi, không lúc nạp module. Test tiến trình con đặt biến thiếu bằng `""`, không xoá: `@crm/env` chỉ điền biến `undefined` từ `.env` gốc, và `.env` gốc có token thật.
- `apps/agent/test/nhac-qua-zalo.integration.spec.ts` không được sửa (AC-12). Chế độ mặc định của `zaloGia` giữ nguyên hành vi.
- Mọi test mới nằm ở `apps/agent/test/zalo-qua-webhook.integration.spec.ts`, mỗi eval một `describe` mang đúng tên khối: `webhook-noi`, `webhook-khoa`, `webhook-tat`, `webhook-trung`, `webhook-bo-qua`, `webhook-luat-ma`, `kiem-bot`, `giao-khi-mo`, `lenh-webhook`, `khai-bien`, `kenh-route`.
- Verify mỗi task bằng đúng lệnh executor của eval: `bun run test -- "cd apps/agent && bun test test/zalo-qua-webhook.integration.spec.ts -t <khối>"` từ gốc kho.
- Mỗi phép đo mới đi kèm cặp hai chiều trên cùng fixture: vật lành xanh, và một lần phá thử trong bản sao làm nó đỏ với đúng thông điệp ghim ở `expected` của eval. Phá thử chạy trên bản sao, không trên cây làm việc.

---

## Bản đồ tệp

| Tệp | Việc |
| --- | --- |
| `packages/validation/src/zalo-update.ts` | thêm `khoaCapDauCua`, `parseZaloSetWebhook`, `parseZaloDeleteWebhook` |
| `apps/agent/agent/lib/zalo-config.ts` | thêm `pollTay`, `webhook`, `chatRieng` |
| `apps/agent/agent/lib/zalo-api.ts` | thêm `zaloKhoaWebhook()` |
| `apps/agent/agent/lib/zalo-bot.ts` (mới) | `ghiBot`, `docBot`, `kiemBot` — chuyển từ `zalo-poll.ts` |
| `apps/agent/agent/lib/zalo-nhan.ts` (mới) | `xuLyTinDen` — lõi chung, lọc bot và nhóm, chống trùng, luật mã |
| `apps/agent/agent/lib/zalo-poll.ts` | dùng `kiemBot` + `xuLyTinDen`; thêm `deps.timeoutGiay`; thêm `vongTay` |
| `apps/agent/agent/lib/zalo-webhook.ts` (mới) | `nhanWebhook` |
| `apps/agent/agent/channels/zalo.ts` (mới) | kênh eve, route `POST /zalo/webhook` |
| `apps/agent/agent/schedules/dispatch.ts` | `pollZalo()` → `kiemBot()` |
| `apps/agent/agent/lib/zalo-dang-ky.ts` (mới) | `docThamSo`, `dangKyWebhook` |
| `apps/agent/scripts/zalo-webhook.ts`, `apps/agent/scripts/zalo-poll.ts` (mới) | vỏ lệnh |
| `apps/agent/package.json` | `zalo:webhook`, `zalo:poll` |
| `apps/agent/test/fixtures/zalo-tin-that.json` (mới) | khuôn tin thật 23/09 |
| `apps/agent/test/support/zalo-gia.ts` | `chiGiaoKhiMo`, `setWebhook`, `deleteWebhook` |
| `apps/agent/test/support/zalo-tin.ts` (mới) | `tinThat`, `thanWebhook`, `yeuCauWebhook` |
| `.env.example`, `docs/environment.md`, `turbo.json`, `apps/agent/turbo.json` | khai biến |
| `docs/agent.md`, `docs/connections.md`, `docs/plan/lo-trinh-zalo.md` | tài liệu, dòng theo dõi |

---

### Task 1: Nền — khuôn biên, cấu hình, Zalo giả, fixture thật

**Files:**
- Modify: `packages/validation/src/zalo-update.ts`, `apps/agent/agent/lib/zalo-config.ts`, `apps/agent/agent/lib/zalo-api.ts`, `apps/agent/test/support/zalo-gia.ts`
- Create: `apps/agent/test/fixtures/zalo-tin-that.json`, `apps/agent/test/support/zalo-tin.ts`

**Evals phục vụ:** nền cho E1–E9, E11 (chưa có eval riêng; verify bằng check-types và E12).
**independent:** false

**Interfaces — Produces:**
- `khoaCapDauCua(value: unknown): string` — khoá cấp đầu nối bằng `,`, `""` nếu không phải object.
- `parseZaloSetWebhook(value: unknown): { url: string; outcome: string | null; hint: string | null }`
- `parseZaloDeleteWebhook(value: unknown): { url: string }`
- `ZALO.pollTay.timeoutGiay = 30`, `ZALO.webhook = { duong: "/zalo/webhook", header: "x-bot-api-secret-token", khoa: { min: 8, max: 256 } }`, `ZALO.chatRieng = "PRIVATE"`.
- `zaloKhoaWebhook(): string | null` trong `zalo-api.ts`.
- `zaloGia({ chiGiaoKhiMo?: TinDen[]; setWebhook?: "ok" })` trả thêm `datDongHo(giay: number)`, `dongHo(): number`. `TinDen = { giay: number; than: unknown }`.
- `tinThat(o: { messageId: string; fromId: string; ten?: string; text?: string | null; chatType?: string; isBot?: boolean; photo?: string }): unknown` — phần `result.message` dựng bằng cách deep-clone fixture rồi thay giá trị.
- `thanGetUpdates(o)` = fixture nguyên vỏ getUpdates với `message` thay; `thanWebhook(o)` = `{ ok: true, result: { event_name, message } }`; `yeuCauWebhook(than: string, header: string | null): { request: Request; soLanKeo(): number }`.

- [ ] **Step 1: Ghi fixture từ tin thật.** Chép nguyên khuôn phản hồi `getUpdates` thật 23/09, chỉ thay giá trị định danh:

```json
{"ok":true,"result":{"message":{"chat":{"id":"a1b2c3d4e5f6a7b8c9d0","chat_type":"PRIVATE"},"text":"000000","message_id":"0f1e2d3c4b5a69788796","date":1790162274626,"from":{"id":"a1b2c3d4e5f6a7b8c9d0","is_bot":false,"display_name":"Nguoi Thu"}},"event_name":"message.text.received"},"error_code":0}
```

- [ ] **Step 2: Khuôn biên.** Thêm vào `zalo-update.ts`:

```ts
const thanBatKy = z.record(z.string(), z.unknown());

export function khoaCapDauCua(value: unknown): string {
	const ket = thanBatKy.safeParse(value);
	return ket.success ? Object.keys(ket.data).join(",") : "";
}

const datWebhook = z.object({
	ok: z.literal(true),
	result: z.object({
		url: z.string(),
		verification: z
			.object({ outcome: z.string(), hint: z.string().optional() })
			.optional(),
	}),
});

export type ZaloDatWebhook = { url: string; outcome: string | null; hint: string | null };

export function parseZaloSetWebhook(value: unknown): ZaloDatWebhook {
	const ket = datWebhook.safeParse(value);
	if (!ket.success) throw new Error(`setWebhook tra hinh dang la: ${ket.error.message}`);
	const v = ket.data.result.verification;
	return { url: ket.data.result.url, outcome: v?.outcome ?? null, hint: v?.hint ?? null };
}

const xoaWebhook = z.object({ ok: z.literal(true), result: z.object({ url: z.string() }) });

export function parseZaloDeleteWebhook(value: unknown): { url: string } {
	const ket = xoaWebhook.safeParse(value);
	if (!ket.success) throw new Error(`deleteWebhook tra hinh dang la: ${ket.error.message}`);
	return { url: ket.data.result.url };
}
```

- [ ] **Step 3: Cấu hình.** Trong `ZALO` thêm `pollTay: { timeoutGiay: 30 }`, `webhook: { duong: "/zalo/webhook", header: "x-bot-api-secret-token", khoa: { min: 8, max: 256 } }`, `chatRieng: "PRIVATE"`. Trong `zalo-api.ts`:

```ts
export function zaloKhoaWebhook(): string | null {
	return process.env.ZALO_WEBHOOK_SECRET?.trim() || null;
}
```

- [ ] **Step 4: Zalo giả.** Trong `zalo-gia.ts` giữ nhánh cũ nguyên vẹn, thêm:
  - `setWebhook` → `{ ok: true, result: { url: body.url, updated_at: 1, verification: { ok: true, url: body.url, outcome: "webhook.ok", hint: "Your endpoint responded successfully." } } }`.
  - `deleteWebhook` → `{ ok: true, result: { url: "", updated_at: 1 } }`.
  - Chế độ `chiGiaoKhiMo`: đồng hồ `giay` bắt đầu 0. Mỗi `getUpdates` đọc `t = Number(body.timeout)`, và `T = giay`. Bỏ hẳn mọi tin có `giay < T`. Tin sớm nhất trong `[T, T+t]` thì: gỡ khỏi hàng, đặt đồng hồ về giờ đến của nó, trả `than` của nó với HTTP 200. Không có tin thì đồng hồ `= T + t`, trả HTTP 200 `{ ok: false, error_code: 408, description: "Request timeout" }` — đúng như Zalo thật.
  - Nhánh chọn phương thức: `getMe`, `sendMessage`, `setWebhook`, `deleteWebhook`, còn lại là `getUpdates`, như cũ.

- [ ] **Step 5: `zalo-tin.ts`.** `tinThat` đọc fixture bằng `import` JSON, dùng `structuredClone`, thay các trường. `text: null` thì xoá khoá `text`; `photo` thì thêm khoá `photo`. `yeuCauWebhook` dựng `new Request("http://tac-tu/zalo/webhook", { method: "POST", headers, body: new ReadableStream({ pull(c) { keo++; c.enqueue(new TextEncoder().encode(than)); c.close(); } }), duplex: "half" })`. `header === null` thì không đặt header.

- [ ] **Step 6: Verify.** `cd apps/agent && bun run check-types` → 0 lỗi. `bun run test -- "cd apps/agent && bun test test/nhac-qua-zalo.integration.spec.ts"` → xanh trọn, chứng minh chế độ mặc định không đổi.

- [ ] **Step 7: Commit** `feat(zalo-qua-webhook): khuon bien, cau hinh, Zalo gia giao khi mo, fixture tin that`.

### Task 2: Tách lõi, `kiemBot`, cron thôi đọc tin, vòng tay

**Files:**
- Create: `apps/agent/agent/lib/zalo-bot.ts`, `apps/agent/agent/lib/zalo-nhan.ts`
- Modify: `apps/agent/agent/lib/zalo-poll.ts`, `apps/agent/agent/schedules/dispatch.ts`
- Test: `apps/agent/test/zalo-qua-webhook.integration.spec.ts` (khối `kiem-bot`, `giao-khi-mo`)

**Evals phục vụ:** E7, E8 (a, b), E12.
**independent:** false

**Interfaces — Produces:**
- `kiemBot(deps?: { fetcher?: typeof fetch; now?: () => Date }): Promise<"tat" | "song" | "loi">` — trả `"tat"` khi không token, `"loi"` khi `getMe` lỗi.
- `xuLyTinDen(token: string, tin: ZaloMessage, deps: { fetcher: typeof fetch; now: Date }): Promise<"bo-qua" | "xong" | "loi">` — thứ tự: `is_bot` hoặc `chat.chat_type !== ZALO.chatRieng` → `"bo-qua"` (không ghi gì); `laTinMoi` false → `"bo-qua"`; `xuLyTin` (luật mã cũ nguyên văn) trong try → `"xong"`, lỗi → log + `"loi"`.
- `pollZalo(deps: { fetcher?; now?; timeoutGiay?: number })` — hành vi cũ, `timeoutGiay` mặc định `ZALO.poll.timeoutGiay`.
- `vongTay(deps: { fetcher?; conTiep: () => boolean; baoLuot?: (k: KetQuaPoll) => void })` — lặp `pollZalo({ ..., timeoutGiay: ZALO.pollTay.timeoutGiay })` khi `conTiep()`.

- [ ] **Step 1: Test đỏ trước.** Viết khối `kiem-bot` đúng ma trận E7:
  - Thay `globalThis.fetch` bằng hàm định tuyến: URL bắt đầu `ZALO.api` → `zaloGia().fetcher`; URL khác → `new Response("", { status: 503 })`.
  - Import `dispatch` từ `../agent/schedules/dispatch` và gọi `await dispatch.run({ receive: async () => ({}), waitUntil: (p) => viec.push(p), appAuth: null })`, rồi `await Promise.allSettled(viec)`.
  - Đọc `appSetting`. Ba ca đặt token bằng `voiToken`, khuôn như spec cũ.

  Viết khối `giao-khi-mo` đúng ma trận E8 (a) và (b) với `zaloGia({ chiGiaoKhiMo: [{ giay: 30, than: thanGetUpdates(...) }] })`, cùng ca đối chứng tin ở giây 0.5. Chạy: `kiem-bot` đỏ (dispatch vẫn gọi `getUpdates`), `giao-khi-mo` (b) đỏ (`vongTay` chưa có).
- [ ] **Step 2: Chuyển `ghiBot`, `docBot` sang `zalo-bot.ts`, viết `kiemBot`.** Chuyển `laTinMoi`, `xuLyTin`, `xuLyMotTin` sang `zalo-nhan.ts` thành `xuLyTinDen`, thêm lọc `chat_type`. `pollZalo` gọi `kiemBot` rồi lặp `nhanTin` → `xuLyTinDen`, kết quả `{xuLy, loi}` giữ nghĩa cũ (`"bo-qua"` không đếm). Thêm `vongTay`.
- [ ] **Step 3: `dispatch.ts`** thay `pollZalo(),` bằng `kiemBot(),` và sửa import.
- [ ] **Step 4: Verify:** `-t kiem-bot`, `-t giao-khi-mo` xanh; E12 (`spec đã ký chạy trọn`) xanh; `bun run check-types` sạch.
- [ ] **Step 5: Phá thử trong bản sao** (khung `references/measure-birth.md`): tạm để dispatch gọi `pollZalo` → `kiem-bot` đỏ «nhip khong goi getUpdates»; đặt `ZALO.pollTay.timeoutGiay = 1` → `giao-khi-mo` đỏ «vong tay bat duoc tin». Trả lại.
- [ ] **Step 6: Commit** `feat(zalo-qua-webhook): tach loi xu ly tin, cron chi kiem bot, vong tay`.

### Task 3: Webhook và kênh

**Files:**
- Create: `apps/agent/agent/lib/zalo-webhook.ts`, `apps/agent/agent/channels/zalo.ts`
- Test: khối `webhook-noi`, `webhook-khoa`, `webhook-tat`, `webhook-trung`, `webhook-bo-qua`, `webhook-luat-ma`, `kenh-route`, và (c) của `giao-khi-mo`

**Evals phục vụ:** E1, E2, E3, E4, E5, E6, E8 (c), E11.
**independent:** false

**Interfaces — Produces:**
- `nhanWebhook(request: Request, deps?: { fetcher?: typeof fetch; now?: () => Date; env?: { token: string | null; khoa: string | null } }): Promise<Response>`

```ts
import { createHash, timingSafeEqual } from "node:crypto";
import { khoaCapDauCua, messageIdCua, parseZaloGetUpdates } from "@crm/validation/zalo-update";
import { zaloKhoaWebhook, zaloToken } from "./zalo-api";
import { ZALO } from "./zalo-config";
import { xuLyTinDen } from "./zalo-nhan";

function bam(giaTri: string): Buffer {
	return createHash("sha256").update(giaTri).digest();
}

function khopKhoa(header: string | null, khoa: string): boolean {
	if (!header) return false;
	return timingSafeEqual(bam(header), bam(khoa));
}

export async function nhanWebhook(request: Request, deps: PhuThuocWebhook = {}): Promise<Response> {
	const token = deps.env ? deps.env.token : zaloToken();
	const khoa = deps.env ? deps.env.khoa : zaloKhoaWebhook();
	if (!token || !khoa) return new Response(null, { status: 404 });
	if (!khopKhoa(request.headers.get(ZALO.webhook.header), khoa)) {
		return new Response(null, { status: 403 });
	}
	const tho = await request.text();
	let than: unknown;
	try {
		than = JSON.parse(tho);
	} catch {
		console.error("[zalo] webhook than khong phai JSON");
		return new Response(null, { status: 200 });
	}
	let cap: ReturnType<typeof parseZaloGetUpdates>;
	try {
		cap = parseZaloGetUpdates(than);
	} catch (loi) {
		console.error(`[zalo] webhook sai khuon khoa=${khoaCapDauCua(than)} message_id=${messageIdCua(than) ?? "?"}: ${String(loi)}`);
		return new Response(null, { status: 200 });
	}
	if (cap.loai === "tin") {
		await xuLyTinDen(token, cap.message, {
			fetcher: deps.fetcher ?? fetch,
			now: (deps.now ?? (() => new Date()))(),
		});
	}
	return new Response(null, { status: 200 });
}
```

`PhuThuocWebhook` khai là type có tên cạnh hàm. Kênh:

```ts
import { defineChannel, POST } from "eve/channels";
import { ZALO } from "../lib/zalo-config";
import { nhanWebhook } from "../lib/zalo-webhook";

export default defineChannel({
	routes: [POST(ZALO.webhook.duong, (request) => nhanWebhook(request))],
});
```

- [ ] **Step 1: Test đỏ trước** — viết bảy khối theo đúng ma trận ở `expected` của E1–E6 và E11, cùng (c) của E8. Thân tin luôn dựng bằng `thanWebhook(...)`/`tinThat(...)`, không gõ tay khuôn. E3 chạy `Bun.spawn(["bun", "-e", <mã con>], { cwd: apps/agent, env: { ...process.env, ZALO_WEBHOOK_SECRET: "" } })` (rồi `ZALO_BOT_TOKEN: ""`); mã con import kênh, thay `globalThis.fetch` bằng hàm đếm, gọi handler, in JSON một dòng. Lỗi bắt `console.error` bằng `spyOn`.
- [ ] **Step 2: Viết `zalo-webhook.ts` và `channels/zalo.ts`** như trên.
- [ ] **Step 3: Verify:** bảy khối và `giao-khi-mo` xanh; `check-types`, `lint`, `lint:slop` sạch.
- [ ] **Step 4: Phá thử trong bản sao:**
  - so khoá bằng `timingSafeEqual(Buffer.from(header), Buffer.from(khoa))` → `webhook-khoa` đỏ «khoa khac do dai tra 403»;
  - bỏ lọc `chat_type` → `webhook-bo-qua` đỏ «tin tu nhom bi bo qua»;
  - đổi path → `kenh-route` đỏ;
  - bỏ `noiBangMa` trong `xuLyTin` → `webhook-noi` đỏ «webhook noi duoc U voi Z».
- [ ] **Step 5: Commit** `feat(zalo-qua-webhook): nhan tin Zalo qua webhook bang kenh eve`.

### Task 4: Hai lệnh tay

**Files:**
- Create: `apps/agent/agent/lib/zalo-dang-ky.ts`, `apps/agent/scripts/zalo-webhook.ts`, `apps/agent/scripts/zalo-poll.ts`
- Modify: `apps/agent/package.json`
- Test: khối `lenh-webhook`

**Evals phục vụ:** E9.
**independent:** false

**Interfaces — Produces:**
- `docThamSo(argv: string[]): { url: string | null; xoa: boolean }`
- `dangKyWebhook(thamSo: { url: string | null; xoa: boolean }, deps?: { fetcher?: typeof fetch; env?: { token: string | null; khoa: string | null } }): Promise<string>`
  - Kiểm theo thứ tự, ném `Error` gọi đích danh:
    - thiếu token → `"Thiếu ZALO_BOT_TOKEN"`;
    - `xoa` → gọi `deleteWebhook`, trả `"Đã gỡ webhook"`;
    - thiếu khoá → `"Thiếu ZALO_WEBHOOK_SECRET"`;
    - khoá ngoài `[ZALO.webhook.khoa.min, max]` → `"ZALO_WEBHOOK_SECRET phải dài 8–256 ký tự"`;
    - thiếu url hoặc không bắt đầu `https://` → `"URL webhook phải là https://…"`.
  - Rồi `setWebhook({url, secret_token})`, trả `"outcome=<outcome> hint=<hint> url=<url>"`.
- Script `zalo-webhook.ts`:
  - `import "@crm/env/load"`;
  - `try { console.log(await dangKyWebhook(docThamSo(process.argv.slice(2)))) } catch (loi) { console.error(loi instanceof Error ? loi.message : String(loi)); process.exitCode = 1 }`.
- Script `zalo-poll.ts`:
  - `import "@crm/env/load"`;
  - `zaloToken()` null → `console.error("Thiếu ZALO_BOT_TOKEN")`, `process.exitCode = 1`;
  - không thì `vongTay({ conTiep: () => true, baoLuot: (k) => console.log(JSON.stringify(k)) })`.
- `package.json`: `"zalo:webhook": "bun scripts/zalo-webhook.ts"`, `"zalo:poll": "bun scripts/zalo-poll.ts"`.

- [ ] **Step 1: Test đỏ** — khối `lenh-webhook` đúng ma trận E9: lớp hàm với `zaloGia` (a, b), `docThamSo` hai ca, lớp lệnh thật (c–f) bằng `Bun.spawn(["bun", "run", "zalo:webhook", ...], { cwd: apps/agent, env: { ...process.env, ZALO_BOT_TOKEN: "1:gia", ZALO_WEBHOOK_SECRET: "khoa-gia-du-dai", <biến bị thiếu>: "" } })`.
- [ ] **Step 2: Viết mã** như trên.
- [ ] **Step 3: Verify:** `-t lenh-webhook` xanh; `check-types`, `lint`, `lint:slop` sạch.
- [ ] **Step 4: Phá thử trong bản sao:** bỏ kiểm https → ca c đỏ «chi nhan https»; bỏ `process.exitCode = 1` → ca d đỏ «lenh thoat ma khac 0».
- [ ] **Step 5: Commit** `feat(zalo-qua-webhook): lenh zalo:webhook va zalo:poll`.

### Task 5: Khai biến và tài liệu

**Files:**
- Modify: `.env.example`, `docs/environment.md`, `turbo.json`, `apps/agent/turbo.json`, `docs/agent.md`, `docs/connections.md`, `docs/plan/lo-trinh-zalo.md`
- Test: khối `khai-bien`

**Evals phục vụ:** E10.
**independent:** true (chỉ chạm tệp cấu hình, tài liệu và khối test của nó; không chung dòng mã với task khác). Chạy tuần tự vì cùng một tệp spec.

- [ ] **Step 1: Test đỏ** — khối `khai-bien`:
  - Đọc tệp bằng `join(import.meta.dir, "..", "..", "..")` làm gốc kho.
  - Parse `turbo.json` và `apps/agent/turbo.json` bằng bộ đọc JSONC tối giản (bỏ `/* */` và `//` ngoài chuỗi) rồi so mảng.
  - Thông điệp ghim gọi tên task thiếu biến.
- [ ] **Step 2: Sửa:**
  - `globalEnv` thêm `"ZALO_BOT_TOKEN", "ZALO_WEBHOOK_SECRET"`.
  - `passThroughEnv` của `dev` và `dev:headless` thêm cả hai.
  - `.env.example` khối Zalo:

    ```
    # Optional. Enables the morning reminder on Zalo and the bot that answers link codes.
    # Create the bot in the Zalo app: open the official account «Zalo Bot Manager» and tap Create bot.
    # Paste the Bot Token (looks like 123456:abc…, not the webhook Secret Token). Only apps/agent reads it.
    # ZALO_BOT_TOKEN=""
    # Optional. Secret Zalo sends in X-Bot-Api-Secret-Token with every webhook call; 8–256 characters.
    # Register it with `bun run --filter=agent zalo:webhook https://<agent>/zalo/webhook`. Only apps/agent reads it.
    # ZALO_WEBHOOK_SECRET=""
    ```

  - `docs/environment.md` thêm hàng `| \`ZALO_WEBHOOK_SECRET\` | … |`.
  - `docs/agent.md`: đổi mục «Poll Zalo» thành «Webhook Zalo», nói route, cổng khoá, cron chỉ kiểm bot, `zalo:poll` cho bot thử, và luật tin nhóm.
  - `docs/connections.md`: dòng «on the dispatch tick (`pollZalo`…)» thành webhook.
  - `docs/plan/lo-trinh-zalo.md` mục 7: nối Ghi chú dòng 1 (không sửa ô cũ), cập nhật Trạng thái và Ngày.
- [ ] **Step 3: Verify:** `-t khai-bien` xanh; phá thử: bỏ biến khỏi `dev:headless` → đỏ gọi tên `dev:headless`.
- [ ] **Step 4: Commit** `docs(zalo-qua-webhook): khai ZALO_WEBHOOK_SECRET, sua huong dan tao bot, tai lieu webhook`.

---

## Self-review

- Spec coverage:
  - §3 → Task 3.
  - §4 → Task 2 (cron, vòng tay) và Task 4 (lệnh).
  - §5 → Task 5.
  - §6 → Task 1.
  - §7 là hoãn, không có task.
  - AC-12 là verify của Task 1–3.
- Tên hàm khớp giữa các task: `xuLyTinDen`, `kiemBot`, `vongTay`, `nhanWebhook`, `dangKyWebhook`, `docThamSo`, `tinThat`, `thanWebhook`, `thanGetUpdates`, `yeuCauWebhook`.
- Không còn chỗ trống. Hình dạng `routes` của kênh và `run` của lịch đã đo bằng probe ngày 2026-09-24.
