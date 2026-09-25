# Bộ đọc webhook Zalo nhận khuôn thân thật — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `POST /zalo/webhook` nối được mã khi Zalo gửi thân thật `{event_name, message}` (và vẫn nhận khuôn có vỏ `{ok, result}`), Zalo giả của test gửi khuôn thật.

**Architecture:** Một module khuôn mới `@crm/validation/zalo-webhook` (parse hai khuôn → `ZaloTinWebhook`, mô tả thân cho log). `docCapNhat` của tác tử gọi nó thay cho `parseZaloGetUpdates`. Zalo giả (`zalo-tin.ts`) rút thân từ fixture `getUpdates` thật và dòng log production.

**Tech Stack:** Bun test, zod 4, Prisma (DB test thật qua `bun run test`), eve channel.

**Spec:** `docs/superpowers/specs/2026-09-25-zalo-webhook-doc-khuon-that-design.md` · hợp đồng `_acceptance/zalo-webhook-doc-khuon-that/contract.md` · evals `…/evals.yaml`

## Global Constraints

- Không viết chú thích trong code (AGENTS.md).
- Không log, không lưu nội dung tin nhắn — chỉ tên khoá và `message_id`.
- Thân hỏng vẫn trả 200; khoá sai vẫn 403 trước khi đọc thân (không đổi).
- `parseZaloGetUpdates` / `zalo:poll` không đổi.
- Spec đã ký `zalo-qua-webhook.integration.spec.ts`: chỉ gỡ ca «c khong vo» (khối ca, `if (ten.startsWith("c"))`, số ca 5 → 4 với thông điệp «ma tran bon ca bo qua», tên ca bỏ «, khong vo»). `noi-zalo-cho-nguoi-moi.integration.spec.ts` không đổi.
- Lệnh chứng minh (CLAUDE.md): `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.
- Không gọi bot Zalo thật; không in `ZALO_BOT_TOKEN`.

## Review Focus

1. Thân thật mà `message` có trường lạ thêm (Zalo thêm khoá mới) → vẫn nối (zod `object` bỏ khoá thừa) — ghim ở Task 1 unit (`khoa-thua`).
2. Thân có cả `message` cấp đầu LẪN `result` (lai) → khuôn thật thắng nếu hợp lệ, không ném — Task 1 unit (`lai`).
3. Thân là mảng / `null` / số → 200 + log `khoa=` rỗng, không ném khi mô tả — Task 1 unit (`khong-doi-tuong`).
4. Tin không chữ (ảnh/sticker) ở khuôn thật → vẫn qua bộ đọc, luật cũ trả hướng dẫn — phủ bởi `webhook-luat-ma` đã ký chạy trên khuôn thật (Task 1 bước chạy spec đã ký).
5. `message_id` rỗng → không in `message_id=` rỗng làm vỡ regex log — `moTaThanWebhook` trả `null` khi rỗng (`min(1)`), Task 1 unit (`ma-rong`).

---

### Task 1: Bộ đọc hai khuôn, Zalo giả khuôn thật, spec mới

`independent: false` (Task 2 kiểm lại phần sửa spec đã ký của task này). Phục vụ E1, E2, E3, E4.

**Files:**
- Create: `packages/validation/src/zalo-webhook.ts`
- Modify: `packages/validation/package.json` (exports `./zalo-webhook`)
- Test: `packages/validation/test/zalo-webhook.spec.ts`
- Modify: `apps/agent/agent/lib/zalo-webhook.ts` (`docCapNhat`, `nhanWebhook`)
- Modify: `apps/agent/test/support/zalo-tin.ts` (`thanWebhook`, `thanWebhookCoVo`)
- Create: `apps/agent/test/fixtures/zalo-webhook-log-that.txt` (một dòng log production 2026-09-25 05:22:52, nguyên văn từ `vercel logs`)
- Create: `apps/agent/test/zalo-webhook-doc-khuon-that.integration.spec.ts`
- Modify: `apps/agent/test/zalo-qua-webhook.integration.spec.ts` (gỡ ca «c khong vo» — đúng bốn chỗ ở Global Constraints)

**Interfaces:**
- Produces: `parseZaloWebhook(value: unknown): ZaloTinWebhook` với `ZaloTinWebhook = { message: ZaloMessage; eventName: string }`; `moTaThanWebhook(value: unknown): { khoa: string[]; khoaMessage: string[]; messageId: string | null }`.
- Produces (test): `thanWebhook(chon: ChonTin): { event_name: string; message: TinZaloThat }`, `thanWebhookCoVo(chon: ChonTin): { ok: true; result: { event_name: string; message: TinZaloThat } }`.
- Dòng log: `[zalo] webhook sai khuon khoa=<a,b> khoa_message=<c,d> message_id=<id|?>: <lý do>`.

- [ ] **Step 1: Unit test module khuôn (đỏ)** — `packages/validation/test/zalo-webhook.spec.ts`

```ts
import { describe, expect, test } from "bun:test";
import { moTaThanWebhook, parseZaloWebhook } from "../src/zalo-webhook";

const MESSAGE = {
	from: { id: "u1", display_name: "A", is_bot: false },
	chat: { id: "u1", chat_type: "PRIVATE" },
	text: "123456",
	message_id: "m1",
	date: 1,
};

describe("zalo-webhook", () => {
	test("hai khuon cho cung ket qua", () => {
		const that = parseZaloWebhook({ event_name: "e", message: MESSAGE });
		const vo = parseZaloWebhook({ ok: true, result: { event_name: "e", message: MESSAGE } });
		expect(that).toEqual({ message: MESSAGE, eventName: "e" });
		expect(vo).toEqual(that);
	});
	test("khoa-thua: message co khoa la van doc", () => {
		expect(parseZaloWebhook({ event_name: "e", message: { ...MESSAGE, moi: 1 } }).message.message_id).toBe("m1");
	});
	test("lai: khuon that hop le thang khi co ca result", () => {
		expect(parseZaloWebhook({ event_name: "e", message: MESSAGE, result: 1 }).eventName).toBe("e");
	});
	test("sai khuon nem thong diep webhook, khong mang gia tri", () => {
		const bi = { ...MESSAGE, from: { display_name: "A", is_bot: false }, text: "BI-MAT" };
		expect(() => parseZaloWebhook({ event_name: "e", message: bi })).toThrow("webhook tra hinh dang la");
		try { parseZaloWebhook({ event_name: "e", message: bi }); } catch (loi) { expect(String(loi)).not.toContain("BI-MAT"); }
	});
	test("khong-doi-tuong va ma-rong: mo ta khong nem", () => {
		expect(moTaThanWebhook(null)).toEqual({ khoa: [], khoaMessage: [], messageId: null });
		expect(moTaThanWebhook([1])).toEqual({ khoa: [], khoaMessage: [], messageId: null });
		expect(moTaThanWebhook({ message: { message_id: "" } }).messageId).toBeNull();
		expect(moTaThanWebhook({ ok: true, result: { message: { message_id: "m9", x: 1 } } }))
			.toEqual({ khoa: ["ok", "result"], khoaMessage: ["message_id", "x"], messageId: "m9" });
	});
});
```

Run: `cd packages/validation && bun test test/zalo-webhook.spec.ts` → FAIL (module chưa có).

- [ ] **Step 2: Viết module** — `packages/validation/src/zalo-webhook.ts`

```ts
import { z } from "zod";
import { type ZaloMessage, zaloMessage } from "./zalo-update";

const tinWebhook = z.object({ event_name: z.string(), message: zaloMessage });

const coVo = z.object({ ok: z.literal(true), result: tinWebhook });

export type ZaloTinWebhook = { message: ZaloMessage; eventName: string };

const doiTuong = z.record(z.string(), z.unknown());

function khoaCua(value: unknown): string[] {
	const ket = doiTuong.safeParse(value);
	return ket.success ? Object.keys(ket.data) : [];
}

export function parseZaloWebhook(value: unknown): ZaloTinWebhook {
	const that = tinWebhook.safeParse(value);
	if (that.success) {
		return { message: that.data.message, eventName: that.data.event_name };
	}
	const vo = coVo.safeParse(value);
	if (vo.success) {
		return {
			message: vo.data.result.message,
			eventName: vo.data.result.event_name,
		};
	}
	const loi = khoaCua(value).includes("result") ? vo.error : that.error;
	throw new Error(`webhook tra hinh dang la: ${loi.message}`);
}

const trongVo = z.object({ result: z.object({ message: z.unknown() }) });

const trongThat = z.object({ message: z.unknown() });

function messageCua(value: unknown): unknown {
	const vo = trongVo.safeParse(value);
	if (vo.success) return vo.data.result.message;
	const that = trongThat.safeParse(value);
	return that.success ? that.data.message : undefined;
}

const maTin = z.object({ message_id: z.string().min(1) });

export type MoTaThanWebhook = {
	khoa: string[];
	khoaMessage: string[];
	messageId: string | null;
};

export function moTaThanWebhook(value: unknown): MoTaThanWebhook {
	const message = messageCua(value);
	const ma = maTin.safeParse(message);
	return {
		khoa: khoaCua(value),
		khoaMessage: khoaCua(message),
		messageId: ma.success ? ma.data.message_id : null,
	};
}
```

`package.json` exports: thêm `"./zalo-webhook": "./src/zalo-webhook.ts"` ngay sau `"./zalo-update"`.
Run lại Step 1 → PASS. (`z.record` với mảng: zod 4 từ chối mảng → `[]`.)

- [ ] **Step 3: Zalo giả khuôn thật** — `apps/agent/test/support/zalo-tin.ts`, thay khối `ThanWebhook`/`thanWebhook`:

```ts
export type ThanWebhookCoVo = {
	ok: true;
	result: { event_name: string; message: TinZaloThat };
};

export type ThanWebhook = ThanWebhookCoVo["result"];

export function thanWebhookCoVo(chon: ChonTin): ThanWebhookCoVo {
	const than = thanGetUpdates(chon);
	return {
		ok: true,
		result: {
			event_name: than.result.event_name,
			message: than.result.message,
		},
	};
}

export function thanWebhook(chon: ChonTin): ThanWebhook {
	return thanWebhookCoVo(chon).result;
}
```

Fixture `apps/agent/test/fixtures/zalo-webhook-log-that.txt`: đúng một dòng log `[zalo] webhook sai khuon khoa=event_name,message message_id=?: Error: getUpdates tra hinh dang la: [ … ]` chép nguyên văn từ `vercel logs … --query "sai khuon"` (05:22:52).

- [ ] **Step 4: Spec mới (đỏ trên bộ đọc cũ)** — `apps/agent/test/zalo-webhook-doc-khuon-that.integration.spec.ts`, bốn `describe` tên ghim: `hai-khuon-noi`, `trung-hai-khuon`, `sai-khuon-log`, `gia-khuon-that` — đúng các ô và thông điệp của E1–E4 trong `evals.yaml`:
  - `hai-khuon-noi`: bảng hai ô `{ten, dung, messageId, fromId, tenZalo, khoa}`; mỗi ô gieo người + `taoMaLienKet`, khẳng định `Object.keys(than)`, 200, `ZaloLink` = `[[fromId, tenZalo]]` với thông điệp `` `khuon ${ten} phai noi duoc` ``, `usedAt` khác null, `zaloUpdateSeen.count({messageId})` = 1, `guiToi(fromId)` dài 1 và `text` chứa `nguoi.name`; đếm ô = 2.
  - `trung-hai-khuon`: `THU_TU = [["that","vo"],["vo","that"]]`, mỗi thứ tự một người, cùng `messageId`; link = 1 với thông điệp «chong trung khong phu thuoc vo», seen = 1, gửi = 1. Đối chứng: hai `messageId` khác nhau, cùng khuôn, hai người → 2 liên kết, 2 tin.
  - `sai-khuon-log`: bốn ô a–d dựng tường minh (b: `from` thiếu `id`; c: `result.message` không có `from`), `text` = `NOI-DUNG-BI-MAT-<o>`; `spyOn(console, "error")` gom bằng `Bun.inspect`; mỗi ô: 200, `demBang` bằng trước, `soGoi("sendMessage")` = 0, đúng 1 dòng bắt đầu `[zalo] webhook sai khuon`, regex `/khoa=(\S*) khoa_message=(\S*) message_id=(\S+):/` → `toEqual([khoa, khoaMessage, messageId])` (mong đợi của b, c tính bằng `Object.keys` của chính thân đã gửi) với thông điệp `` `${ten}: log in khoa cua message` ``; `not.toContain("NOI-DUNG-BI-MAT")` với thông điệp `` `${ten}: log khong mang noi dung tin` ``; số ô = 4. Đối chứng dương: thân hợp lệ → 0 dòng, nối.
  - `gia-khuon-that`: `thanWebhookCoVo(x).result` toEqual `structuredClone(tinGoc.result)` đã thay `message_id`, `from.id`, `chat.id`, `display_name`, `text` (thông điệp «gia khong rut tu fixture»); `thanWebhook(x)` toEqual `thanWebhookCoVo(x).result`; `Object.keys(thanWebhook(x)).join(",")` toBe khoá tách bằng `/khoa=(\S*)/` từ fixture log; `Object.keys(thanWebhookCoVo(x))` toEqual `["ok","result"]`.

Run: `bun run test -- "cd apps/agent && bun test test/zalo-webhook-doc-khuon-that.integration.spec.ts"` → `hai-khuon-noi` ô that, `trung-hai-khuon`, `sai-khuon-log` FAIL (bộ đọc cũ); `gia-khuon-that` PASS.

- [ ] **Step 5: Bộ đọc** — `apps/agent/agent/lib/zalo-webhook.ts`:

```ts
import {
	moTaThanWebhook,
	parseZaloWebhook,
	type ZaloTinWebhook,
} from "@crm/validation/zalo-webhook";

function ghiSaiKhuon(than: unknown, lyDo: string): void {
	const moTa = moTaThanWebhook(than);
	console.error(
		`[zalo] webhook sai khuon khoa=${moTa.khoa.join(",")} khoa_message=${moTa.khoaMessage.join(",")} message_id=${moTa.messageId ?? "?"}: ${lyDo}`,
	);
}

function docCapNhat(tho: string): ZaloTinWebhook | null {
	let than: unknown;
	try {
		than = JSON.parse(tho);
	} catch {
		ghiSaiKhuon(undefined, "than khong phai JSON");
		return null;
	}
	try {
		return parseZaloWebhook(than);
	} catch (loi) {
		ghiSaiKhuon(than, String(loi));
		return null;
	}
}
```

và trong `nhanWebhook`: `const tin = docCapNhat(await request.text()); if (tin) { const ket = await xuLyTinDen(bien.token, tin.message, …) … }`. Bỏ import `khoaCapDauCua`, `messageIdCua`, `parseZaloGetUpdates`, `ZaloUpdate`.

- [ ] **Step 6: Gỡ ca «c khong vo»** ở `zalo-qua-webhook.integration.spec.ts` — đúng bốn chỗ ở Global Constraints, không chạm gì khác.

- [ ] **Step 7: Chạy xanh**

```bash
bun run test -- "cd apps/agent && bun test test/zalo-webhook-doc-khuon-that.integration.spec.ts test/zalo-qua-webhook.integration.spec.ts test/noi-zalo-cho-nguoi-moi.integration.spec.ts test/nhac-qua-zalo.integration.spec.ts"
cd packages/validation && bun test
bun run check-types && bun run lint
```
Expected: tất cả PASS.

- [ ] **Step 8: Commit** — `feat(zalo-webhook-doc-khuon-that): webhook đọc thân thật {event_name, message}`.

### Task 2: Tài liệu, dòng 2d, hai răng đo

`independent: false` (răng `giu-da-ky` kiểm phần sửa spec của Task 1). Phục vụ E5, E6.

**Files:**
- Modify: `docs/agent.md` mục «Zalo: webhook, and a bot check on the tick» — gạch «A body that is not JSON…»
- Modify: `docs/plan/lo-trinh-zalo.md` mục 7 — thêm dòng `| 2d | \`zalo-webhook-doc-khuon-that\` | đang dựng | 2026-09-25 | — | … |` sau dòng 2c
- Create: `_acceptance/zalo-webhook-doc-khuon-that/rang/tai-lieu.mjs`
- Create: `_acceptance/zalo-webhook-doc-khuon-that/rang/giu-da-ky.mjs`

- [ ] **Step 1: Viết `tai-lieu.mjs`** (khung đọc mục Zalo và bảng mục 7 như `loi-tac-tu-zalo-noi-dung-nguyen-nhan/rang/tai-lieu.mjs`, đổi `SLUG`), cắt mục «Zalo: webhook» theo tiêu đề tới tiêu đề cùng cấp, tách câu bằng `/(?<=[.;])\s+|\n\s*[-*]\s+|\n{2,}/`; ba đòi hỏi và hai thông điệp ghim đúng E5. Gốc `GOC_KHO ?? <thư mục script>/../../..`.
- [ ] **Step 2: Chạy → đỏ** trên docs hiện tại (`docs/agent.md chua noi than that {event_name, message}`, `bang muc 7 khong co dong cho zalo-webhook-doc-khuon-that`).
- [ ] **Step 3: Sửa tài liệu** — gạch webhook thành:
  `- A body that is not JSON, or matches neither shape, still answers 200, so Zalo does not resend.` + hai câu tiếng Việt: «Thân webhook thật của Zalo là \`{event_name, message}\`, không có vỏ — đo trên production 2026-09-25, tài liệu Zalo tả khác.» · «Khuôn có vỏ \`ok\`/\`result\` theo tài liệu vẫn được nhận, qua cùng bộ đọc \`parseZaloWebhook\` (\`@crm/validation/zalo-webhook\`).» + `The log line names the body's top-level keys (\`khoa\`), the keys of \`message\` (\`khoa_message\`) and its \`message_id\` — never the text.`; thêm dòng 2d. Chạy lại → exit 0.
- [ ] **Step 4: Viết `giu-da-ky.mjs`** — `B = git -C GOC merge-base HEAD origin/onehub`; so `git show B:<noi-zalo spec>` với tệp đĩa (khác → «spec da ky bi sua: noi-zalo-cho-nguoi-moi»); spec webhook: bằng bản ở B → kiểm cấu trúc (không chuỗi `"c khong vo"`, có `"ma tran bon ca bo qua").toBe(4)`); khác → tệp đĩa phải bằng `bienDoi(bản B)` — bốn phép thay đúng một lần mỗi phép (thiếu khớp → «khong tim thay khoi ca c o merge-base»), không bằng → «spec da ky bi sua ngoai ca c». In mỗi vật hỏng một dòng, exit 1.
- [ ] **Step 5: Chạy → exit 0** trên cây nhánh.
- [ ] **Step 6: Commit** — `docs(zalo-webhook-doc-khuon-that): tài liệu thân thật, dòng 2d, răng tài liệu và giữ spec đã ký`.

### Task 3: Phá-thử — chiều đỏ của sáu eval

`independent: false`. Phục vụ E1–E6 (MEASURE-BIRTH-CLAUSE). Mọi phá-thử chạy SAU commit, khôi phục bằng `git checkout -- <tệp>` và kiểm `git status` sạch trước lượt kế (bộ nhớ «phá-thử tại chỗ mất thay đổi»).

- [ ] **Step 1: Danh sách dự đoán TRƯỚC** — viết `_acceptance/zalo-webhook-doc-khuon-that/rang/ca-qua-webhook.json` `{ "so_ca": N, "ca": ["<tên test đầy đủ>", …] }` gồm mọi ca của hai spec đã ký mà kết quả phụ thuộc việc đọc thân webhook hợp lệ (đọc từng test, không đoán theo tên); commit.
- [ ] **Step 2: E1/E4(2)** — `docCapNhat` quay về `parseZaloGetUpdates` (giữ import): chạy spec mới `-t hai-khuon-noi` → đỏ «khuon that phai noi duoc», ô vo xanh; chạy hai spec đã ký, rút tập ca đỏ, so bằng danh sách Step 1 (lệch → ghi `fix` vào `decisions.jsonl` kèm lý do).
- [ ] **Step 3: E2** — trong `docCapNhat` đổi `message_id` của tin khuôn có vỏ thành `vo:<id>` → `trung-hai-khuon` đỏ «chong trung khong phu thuoc vo».
- [ ] **Step 4: E3** — (1) bỏ `khoa_message=…` khỏi dòng log → đỏ «b: log in khoa cua message»; (2) nối `JSON.stringify(than)` vào dòng log → đỏ «b: log khong mang noi dung tin».
- [ ] **Step 5: E4(1)** — đổi `event_name` trong `thanWebhookCoVo` → `gia-khuon-that` đỏ «gia khong rut tu fixture».
- [ ] **Step 6: E5** — `GOC_KHO` trỏ thư mục tạm chứa `docs/agent.md` và `docs/plan/lo-trinh-zalo.md` lấy từ `merge-base` → exit 1 hai thông điệp; bản sao xoá dòng 2d → exit 1.
- [ ] **Step 7: E6** — sửa một `expect` ở `webhook-noi` → exit 1 «spec da ky bi sua ngoai ca c»; sửa một dòng spec người mới → exit 1 «spec da ky bi sua: noi-zalo-cho-nguoi-moi».
- [ ] **Step 8: Chạy năm lệnh chứng minh** ở gốc kho (`bun run test`, `check-types`, `lint`, `lint:slop`, `build`), ghi kết quả phá-thử vào `_acceptance/zalo-webhook-doc-khuon-that/pha-thu.md` (lệnh · kết quả · thông điệp), commit.
