# Gọi thử hỏng hiện đúng bot — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Khi Zalo nhận `setWebhook` nhưng gọi thử hỏng, tác tử trả `valid` + `webhook: "zalo-tu-choi"`, màn tải lại hiện bot mới với cảnh báo «Đăng ký lại», và nhịp `kiemBot` không gỡ cảnh báo cho tới lần đăng ký thành công.

**Architecture:** Ba chỗ sửa nhỏ: nhánh `xac-minh-hong` của `datBot` đổi giá trị trả về; `docWebhook` ghi url bằng một `updateMany` có điều kiện trên `zaloWebhookLyDo`; `OToken` và `TrangThaiWebhookZalo` rẽ theo `kq.webhook`. API không đổi mã. Phép đo: spec tác tử mới, spec API mới theo khuôn cầu nối thật, tệp DOM mới, ba script `rang/`.

**Tech Stack:** bun test, Prisma, Nest (tRPC), React 19 + TanStack Query, sonner.

**Spec:** `docs/superpowers/specs/2026-09-24-zalo-goi-thu-hong-hien-dung-bot-design.md` · hợp đồng `_acceptance/zalo-goi-thu-hong-hien-dung-bot/contract.md` · evals cùng thư mục.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Không `migration`, không đổi `packages/db/prisma/**` (giữ T2).
- Giá trị lý do so qua kiểu `ZaloLyDo` của `@crm/validation/zalo-update`, không chuỗi trần không kiểu.
- Không gọi bot Zalo thật; mọi lời gọi đi `zaloGia` / `zaloMayChu`.
- Hai spec đã ký `nhac-qua-zalo.integration.spec.ts`, `zalo-qua-webhook.integration.spec.ts` không đổi; trong `noi-zalo-cho-nguoi-moi.integration.spec.ts` chỉ đổi vế `outcome`/`webhook` của `goi-nguoc: b`, `goi-nguoc: c`.
- Câu mới có cả `vi` và `en` trong `apps/app/lib/messages/nhac-qua-zalo.ts`; câu cảnh báo gọi đúng tên nút `dangKyLai`.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture + một lượt phá thử có thông điệp ghim (MEASURE-BIRTH-CLAUSE).

## Review Focus

1. Nhịp chen giữa lúc lưu bot — `docWebhook` đọc-rồi-ghi sẽ gỡ cờ; phải là một lệnh ghi có điều kiện (Task 2, ô 13).
2. Hàng `AppSetting` có `zaloWebhookLyDo` null — Prisma `{ not: x }` loại luôn null; điều kiện phải có vế `null` tường minh (Task 2, hàng i).
3. Token lần đầu × gọi thử hỏng — tên bot phải về đúng `getMe`, không rỗng (Task 1, ô `lan-dau/goi-thu-hong`).
4. Nút «Đăng ký lại» khi vẫn hỏng — không được toast «Đã đăng ký nhận tin lại.» (Task 4).
5. Câu tiếng Anh thiếu tên nút — đo bằng quan hệ với nhãn nút render thật (Task 4).

---

### Task 1: Tác tử trả «đã lưu, chưa nhận tin» khi gọi thử hỏng

`independent: false` · phục vụ E1, E2, E5 (vế đăng ký lại), E9

**Files:**
- Modify: `apps/agent/test/support/zalo-gia.ts` (thêm `tenBot?: string` vào `ChonZaloGia`, `traGetMe` dùng `chon.tenBot ?? "Bot OneHub"`)
- Create: `apps/agent/test/zalo-goi-thu-hong.integration.spec.ts`
- Modify: `apps/agent/agent/lib/zalo-bot-xuong.ts:124-127`
- Modify: `apps/agent/test/noi-zalo-cho-nguoi-moi.integration.spec.ts` (hai ca `goi-nguoc: b`, `goi-nguoc: c` — chỉ vế `outcome`/`webhook`)

**Interfaces:**
- Produces: `ChonZaloGia.tenBot`; `datBot` trả `{ outcome: "valid", tenBot, webhook: "zalo-tu-choi" }` ở nhánh gọi thử hỏng.

- [ ] **Step 1: Viết spec mới, describe `luu-bot-moi` và `ma-tran-goi`.** Helper riêng trong tệp (không import từ spec đã ký): `goiRoute(than)` dựng `Request` tới `https://tac-tu.test/internal/zalo/bot` với `Bearer` bí mật, chạy handler lấy từ `kenhZalo.routes` theo method + path, trong `voiBien({ AGENT_BRIDGE_SECRET, ZALO_BOT_TOKEN: "", ZALO_WEBHOOK_SECRET: "" })`; `thayFetch(z)` thay `globalThis.fetch` cho url bắt đầu bằng `ZALO.api`; `cot()` đọc năm cột + `zaloBotName`. Ma trận:

```ts
const CACH_GOI = ["token-moi", "lan-dau", "dang-ky-lai"] as const;
const KET_QUA = ["goi-thu-duoc", "goi-thu-hong", "ok-false", "loi-mang"] as const;
const CHON = {
	"goi-thu-duoc": { setWebhook: { outcome: "webhook.ok" } },
	"goi-thu-hong": { setWebhook: { outcome: "webhook.failed" } },
	"ok-false": { setWebhook: "ok-false" },
	"loi-mang": { setWebhook: "loi-mang" },
} satisfies Record<(typeof KET_QUA)[number], ChonZaloGia>;
```

Mỗi ô: gieo (`token-moi`, `dang-ky-lai`: T, K, «Bot Cũ», U; `lan-dau`: rỗng), gọi route (`{token: T2}` hoặc `{}`), đọc `{token, khoa, url, lyDo, ten, outcome, webhook, tenBot}`; khoá kỳ vọng ô được/hỏng = `secret_token` Zalo giả ghi lại; một `toEqual` trên bảng 12 khoá với thông điệp `"ma tran goi x ket qua Zalo"`. `luu-bot-moi`: bảy dòng của E1 + đối chứng `webhook.ok` → `da-dang-ky`, thông điệp `"goi thu hong van da luu bot moi"`.

- [ ] **Step 2: Chạy, thấy đỏ.** `bun run test -- "cd apps/agent && bun test test/zalo-goi-thu-hong.integration.spec.ts -t 'luu-bot-moi|ma-tran-goi'"` → đỏ ở `outcome` của ba ô `goi-thu-hong` và dòng 1–3 E1.

- [ ] **Step 3: Sửa `datBot`.**

```ts
	if (ket === "xac-minh-hong") {
		await ghiCot({ zaloWebhookUrl: null, zaloWebhookLyDo: "zalo-tu-choi" });
		return { outcome: "valid", tenBot, webhook: "zalo-tu-choi" };
	}
```

Bỏ `ZALO.loi.xacMinhHong` khỏi `zalo-config.ts` nếu không còn ai dùng (grep trước).

- [ ] **Step 4: Sửa hai ca đã ký.** `goi-nguoc: b`: `outcome: "valid"`, `webhook: "zalo-tu-choi"`; `goi-nguoc: c`: `outcome: "valid"`. Không đổi dòng nào khác.

- [ ] **Step 5: Xanh + phá thử.** Chạy lại Step 2 và `-t goi-nguoc` của spec đã ký → xanh. Phá thử trên bản sao (không trên cây, bài học «phá-thử tại chỗ mất thay đổi»): trả lại `invalid` → đỏ với thông điệp ghim; rollback như `tu-choi` → ba ô `goi-thu-hong` đỏ.

- [ ] **Step 6: Commit** `fix(agent): gọi thử hỏng vẫn báo đã lưu bot mới`.

### Task 2: Nhịp kiểm giữ cờ «zalo-tu-choi»

`independent: false` (cùng spec với Task 1) · phục vụ E4, E5

**Files:**
- Modify: `apps/agent/agent/lib/zalo-bot.ts` (`docWebhook`)
- Test: `apps/agent/test/zalo-goi-thu-hong.integration.spec.ts` (describe `nhip-giu-co`, `go-co`)

- [ ] **Step 1: Test `nhip-giu-co`.** 3 trạng thái × 4 `webhookInfo` (`{url: U2}`, 404, 500, `"la"`) gọi `kiemBot({ fetcher: zaloGia({ webhookInfo }).fetcher })`, bảng url kỳ vọng `i: U2,null,null,null · ii: null×4 · iii: U,null,U,null`, lý do giữ nguyên, `kiemBot` trả `"song"`. Ô 13 «nhịp chen»: fetcher bọc `zaloGia` — khi `method === "getWebhookInfo"`, trước khi trả, gọi route lưu bot với token mới và `setWebhook` `webhook.failed` (dùng `zaloGia` thứ hai cho route qua `thayFetch`), rồi trả `{url: U2}`; khẳng định url null, lý do «zalo-tu-choi», thông điệp `"nhip chen khong go co"`.
- [ ] **Step 2: Test `go-co`.** Dựng trạng thái bằng route (token mới, gọi thử hỏng) → route `{}` với `webhook.ok` → `kiemBot` `{url: U2}`; mốc 1 url = `https://tac-tu.test/zalo/webhook`, lý do null, `da-dang-ky`; mốc 2 url U2. Đối chứng: đăng ký lại vẫn hỏng → sau nhịp url null. Thông điệp `"dang ky lai thanh cong go co"`.
- [ ] **Step 3: Chạy, thấy đỏ** ở ô ii/U2, iii/U2, ô 13.
- [ ] **Step 4: Sửa `docWebhook`** — nhánh có url:

```ts
const CO_HONG: ZaloLyDo = "zalo-tu-choi";

async function ghiUrlNeuKhongCo(url: string): Promise<void> {
	await db.appSetting.updateMany({
		where: {
			id: SETTINGS_ID,
			OR: [{ zaloWebhookLyDo: null }, { zaloWebhookLyDo: { not: CO_HONG } }],
		},
		data: { zaloWebhookUrl: url },
	});
}
```

`await ghiBot({ zaloWebhookUrl: info.url })` → `await ghiUrlNeuKhongCo(info.url)`. Nhánh 404 / sai khuôn giữ `ghiBot({ zaloWebhookUrl: null })`.
- [ ] **Step 5: Xanh + phá thử** (bản sao): bỏ điều kiện → ii/U2, iii/U2 đỏ; đọc-rồi-ghi → ô 13 đỏ. Chạy lại `-t 'trang-thai-webhook|nhip-tron'` của spec đã ký → xanh.
- [ ] **Step 6: Commit** `fix(agent): nhịp kiểm không gỡ cảnh báo gọi thử hỏng`.

### Task 3: Cầu nối thật — API trả «đã lưu» và trang tổng quan vẫn cảnh báo sau nhịp

`independent: false` · phục vụ E3, E12

**Files:**
- Create: `apps/api/test/zalo-goi-thu-hong.spec.ts` (khuôn `apps/api/test/noi-zalo-cau-noi.spec.ts`: Nest `Test.createTestingModule`, `mintPhien`, `Bun.serve` bọc handler route thật ở gốc `https://tac-tu.test`, `ZALO_API_URL` → `zaloMayChu({ tenBot: "Bot Mới", setWebhook: { outcome: "webhook.failed" }, webhookInfo: { url: U2 } })`)

- [ ] **Step 1:** Gieo T, K, «Bot Cũ», U; `POST /api/trpc/zalo.luuBot` `{token: T2}` → 200 `{tenBot:"Bot Mới", webhook:"zalo-tu-choi"}`; `kiemBot()` (import từ `../../agent/agent/lib/zalo-bot`, `ZALO_API_URL` đã đặt); `GET zalo.xuong` → `tenBot` «Bot Mới», `goiToken` = `T2.slice(-4)`, `trangThai` «chua-dang-ky»; không JSON nào chứa T2. Đối chứng `setWebhook: "ok-false"` → 4xx, xuong «Bot Cũ» / «da-dang-ky». Thông điệp `"canh bao con sau nhip"`.
- [ ] **Step 2:** `bun run test -- "cd apps/api && bun test test/zalo-goi-thu-hong.spec.ts"` → xanh (Task 1, 2 đã xong); phá thử bỏ điều kiện Task 2 trên bản sao → dòng 4 đỏ.
- [ ] **Step 3: Commit** `test(api): cầu nối thật khi gọi thử webhook hỏng`.

### Task 4: Màn — cảnh báo, xoá ô, tải lại

`independent: true` · phục vụ E6, E7, E11

**Files:**
- Modify: `apps/app/lib/messages/nhac-qua-zalo.ts` (`ketNoi.daLuuChuaNhanTin(ten)`, `ketNoi.dangKyLaiChuaXong` ở `en` và `vi`, chèn `dangKyLai` vào câu)
- Modify: `apps/app/app/(app)/[slug]/settings/connections/zalo/o-token.tsx`, `trang-thai-webhook.tsx`
- Create: `apps/app/test/zalo-goi-thu-hong.dom.tsx`

- [ ] **Step 1: DOM test** (khuôn mock của `noi-zalo-cho-nguoi-moi.dom.tsx`: `mock.module` cho `@/lib/trpc/client`, `@/lib/trpc/cache`, `next/navigation`, thêm `sonner` ghi lại `success`/`warning`/`error`). `o-token-canh-bao` × `vi`,`en`: 6 dòng E6 + 3b + đối chứng `da-dang-ky`; nhãn nút lấy bằng cách render `TrangThaiWebhookZalo` (`chua-dang-ky`, `canManage`) cùng ngôn ngữ và đọc `button.textContent`. `dang-ky-lai-canh-bao`: E7.
- [ ] **Step 2:** Chạy `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/zalo-goi-thu-hong.dom.tsx` → đỏ.
- [ ] **Step 3: Câu.**

```ts
		daLuuChuaNhanTin: (ten: string) =>
			`Đã lưu ${ten}, nhưng Zalo chưa gọi thử được địa chỉ nhận tin. Bấm “Đăng ký lại” sau ít phút.`,
		dangKyLaiChuaXong:
			"Zalo nhận đăng ký nhưng chưa gọi thử được địa chỉ nhận tin. Thử “Đăng ký lại” sau ít phút.",
```

```ts
		daLuuChuaNhanTin: (ten: string) =>
			`${ten} is saved, but Zalo could not reach the CRM yet. Press “Sign up again” in a few minutes.`,
		dangKyLaiChuaXong:
			"Zalo took the sign-up but could not reach the CRM yet. Try “Sign up again” in a few minutes.",
```

- [ ] **Step 4: `onSuccess`.** `o-token.tsx`: `if (kq.webhook === "zalo-tu-choi") toast.warning(t.daLuuChuaNhanTin(kq.tenBot)); else toast.success(t.daLuu(kq.tenBot));` — `setNhap("")`, `setLoi(null)`, `cache.zalo()`, `router.refresh()` giữ nguyên cho cả hai. `trang-thai-webhook.tsx`: `onSuccess: async (kq) => { if (kq.webhook === "zalo-tu-choi") toast.warning(t.dangKyLaiChuaXong); else toast.success(t.daDangKyLai); … }`.
- [ ] **Step 5: Xanh + phá thử** (bản sao): bỏ nhánh → đỏ «goi thu hong la canh bao, khong phai thanh cong»; bỏ tên nút khỏi câu en → đỏ «cau canh bao phai goi ten nut Dang ky lai». Chạy thêm `noi-zalo-cho-nguoi-moi.dom.tsx` → xanh; `design-gate --mode static` trên `zalo/page.tsx` → exit 0.
- [ ] **Step 6: Commit** `fix(app): màn Zalo báo đã lưu bot mới khi gọi thử hỏng`.

### Task 5: Bàn đo, khoá phạm vi đã ký, tài liệu

`independent: false` (dùng `tenBot` của Task 1) · phục vụ E8, E9, E10

**Files:**
- Create: `_acceptance/zalo-goi-thu-hong-hien-dung-bot/rang/giu-da-ky.mjs`, `rang/tai-lieu.mjs`, `rang/tac-tu-gia.ts`
- Modify: `docs/connections.md` (mục Zalo), `docs/agent.md` (mục «The tick only checks the bot»), `docs/plan/lo-trinh-zalo.md` (mục 7)

- [ ] **Step 1: `giu-da-ky.mjs`** — ROOT từ `import.meta.url`; `B = git merge-base HEAD origin/onehub`; hai spec đầu `git diff --quiet B -- f`; với spec `noi-zalo…`: `git diff -U0 B -- f`, lấy dải dòng của hai test `goi-nguoc: b|c` ở bản B (`git show B:f`, tìm dòng `test("goi-nguoc: b` tới `test(` kế), mọi hunk phải nằm trong dải và mọi dòng `+`/`-` chứa `outcome` hoặc `webhook`; rồi `bun run test -- "cd apps/agent && bun test test/nhac-qua-zalo.integration.spec.ts test/zalo-qua-webhook.integration.spec.ts test/noi-zalo-cho-nguoi-moi.integration.spec.ts"` và `bun run test -- "cd apps/api && bun test test/noi-zalo-cho-nguoi-moi.spec.ts test/noi-zalo-cau-noi.spec.ts"`. `--tu-kiem`: lấy diff thật, chèn một dòng đổi ở ca khác → hàm kiểm trả vi phạm «sua ngoai goi-nguoc b/c»; diff thật → rỗng.
- [ ] **Step 2: Sửa tài liệu.** `docs/connections.md`: một đoạn nói gọi thử hỏng vẫn lưu bot mới, màn cảnh báo «Zalo chưa giao tin nhắn về CRM», cảnh báo giữ tới lần «Đăng ký lại» gọi thử được. `docs/agent.md`: `getWebhookInfo` không ghi url khi `zaloWebhookLyDo` là `zalo-tu-choi`. `docs/plan/lo-trinh-zalo.md` mục 7: dòng 2 → «đã lên `onehub`» với #118; thêm dòng `2b` cho `zalo-goi-thu-hong-hien-dung-bot`.
- [ ] **Step 3: `tai-lieu.mjs`** ba mốc của E10; `--goc` đọc bản `merge-base` bằng `git show` → phải exit 1 ba mốc; `--tu-kiem` phá từng mốc trên bản sao tạm → exit 1 ghim tên mốc.
- [ ] **Step 4: `tac-tu-gia.ts`** — `phuc-vu`: `zaloMayChu({ tenBot: "Bot Mới", setWebhook: { outcome: "webhook.failed" }, webhookInfo: { url: "https://tac-tu.test/zalo/webhook" } })` + `Bun.serve` bọc handler route `/internal/zalo/bot` của `kenhZalo` ở gốc `https://tac-tu.test`, đặt `process.env.ZALO_API_URL`, in `AGENT_URL=…` và `ZALO_API_URL=…`, chạy tới khi bị tắt. `nhip`: đọc `ZALO_API_URL` từ env, dựng `zaloMayChu` riêng khi thiếu, gọi `kiemBot()`, in `getWebhookInfo=<n> url=<zaloWebhookUrl>`.
- [ ] **Step 5:** `node …/giu-da-ky.mjs --tu-kiem`, `node …/tai-lieu.mjs`, `--goc`, `--tu-kiem` đúng chiều; `bun …/tac-tu-gia.ts nhip` trên DB test in `getWebhookInfo=1`.
- [ ] **Step 6: Commit** `docs+test: khoá phạm vi đã ký, bàn đo E8, tài liệu gọi thử hỏng`.

### Kết S3

`bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run test`, `bun run build` xanh → contract `status: implemented` → S4.
