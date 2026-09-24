# Lỗi cầu nối Zalo nói đúng nguyên nhân — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mọi hỏng hóc trên đường API → tác tử → Zalo/Slack trả về câu đúng nguyên nhân và để lại đúng một dòng log gọi tên nguyên nhân, không lộ Bot Token.

**Architecture:** Tác tử bắt lỗi Zalo/Slack và trả kết quả có kiểu thay vì ném: `datBot` có thêm outcome `zalo-loi`, `guiThu` có thêm trường `guiDuoc`. API phân năm nguyên nhân cầu nối thành một tập đóng, ghi một dòng `warn` cho mỗi lần hỏng, và ánh xạ mỗi nguyên nhân sang một câu trong `ZALO_THONG_DIEP`. App hiện `e.message` của lỗi guiThu.

**Tech Stack:** Bun test, NestJS + nestjs-trpc, eve channels, zod, React 19 (DOM test qua `setup-dom.ts`).

**Spec:** `docs/superpowers/specs/2026-09-24-loi-tac-tu-zalo-noi-dung-nguyen-nhan-design.md` · hợp đồng `_acceptance/loi-tac-tu-zalo-noi-dung-nguyen-nhan/contract.md` · evals `…/evals.yaml`

## Global Constraints

- Không viết chú thích trong code (AGENTS.md).
- Trí khôn ở `apps/agent`: API không gọi Zalo và không đoán nguyên nhân Zalo.
- Parse ở biên bằng zod trong `packages/validation/src/zalo-cau-noi.ts`; không truyền `Record<string, unknown>`.
- Hằng số tinh chỉnh được thì đặt vào config theo vùng: `apps/api/src/zalo/zalo.config.ts` và `apps/agent/agent/lib/zalo-config.ts`.
- Log API: `logger.warn({ message, … })` một đối tượng; không ghi header, thân hay bí mật (`docs/api.md` › Logging).
- Log tác tử: `console.error` có tiền tố `[zalo]`; chỉ ghi `loi.name`, không bao giờ ghi đối tượng lỗi. Đo ngày 24/09: lỗi mạng của Bun là `TypeError` có `code: "ConnectionRefused"`, và `path` chứa nguyên URL `/bot<token>/`; `Bun.inspect(err)` in cả `path` ra.
- Luật điều phối hai phiên Zalo (`.acceptance-runs/dieu-phoi-zalo/LUAT.md`, cùng ba ngoại lệ chủ kho duyệt ở Cổng Phạm vi). Trong `zalo-bot-xuong.ts` chỉ sửa khối `getMe` ở đầu `datBot` và thân `guiThu`. Trong `zalo.service.ts` chỉ sửa hai dòng `if (!ket.ok)`, `ZALO_THONG_DIEP`, và thêm một dòng `guiDuoc`. Test chung chỉ được thêm ca, trừ hai khẳng định cũ của E15. Hai spec `nhac-qua-zalo.integration.spec.ts` và `zalo-qua-webhook.integration.spec.ts` không được chạm. Zalo giả chỉ thêm biến thể.
- Không gọi bot Zalo thật. Không in `ZALO_BOT_TOKEN`.
- Câu hiển thị lấy nguyên văn từ bảng «Chữ trên màn» của design.
- Luật đo (MEASURE-BIRTH): mỗi phép đo mới phải có cặp hai chiều trên cùng fixture. Phá-thử chỉ làm **sau khi commit**, sửa tại chỗ, chạy thấy đỏ với thông điệp ghim, rồi `git checkout -- <tệp>` để trả lại.

## Review Focus

1. Thân trả lời không phải JSON (HTML) phải là `sai-khuon`, không được là lỗi mạng. Ca này nằm ở ô (f) của Task 3.
2. Zalo trả `ok:false` với `error_code` 401 trong một HTTP 200 thì vẫn là token sai. Ca này nằm ở ô (f) getMe của Task 3.
3. Đối tượng lỗi lọt vào log làm lộ token qua `path`. Task 3 có ca đo E7 và phá-thử (2).
4. Tác tử đời trước không gửi `guiDuoc` thì vẫn tính là đã gửi. Task 3, ca `lech-phien-ban`.
5. Cổng mượn rồi đóng có thể bị cấp lại cho tiến trình khác. Dùng `http://127.0.0.1:1` và thăm dò trước mỗi ô (Task 3, hàm `chacBiTuChoi`).

---

## Tệp

| Tệp | Vai | Task |
|---|---|---|
| `packages/validation/src/zalo-cau-noi.ts` | nhánh `zalo-loi`, trường `guiDuoc` | 1 |
| `packages/validation/src/zalo-update.ts` | `maLoiZalo()` đọc `error_code` của thân `ok:false` | 1 |
| `apps/agent/agent/lib/zalo-config.ts` | `ZALO.http.tuChoi`, `ZALO.loi.zaloKhongTraLoi` | 2 |
| `apps/agent/agent/lib/zalo-api.ts` | lớp `LoiHttpZalo` (message giữ nguyên) | 2 |
| `apps/agent/agent/lib/zalo-bot-xuong.ts` | phân loại `getMe`; `guiThu` trả `guiDuoc` | 2 |
| `apps/agent/test/support/zalo-gia.ts` | thêm biến thể `getMe` 500/la/ok-false; `send` la | 2 |
| `apps/agent/test/loi-tac-tu-zalo.integration.spec.ts` | E5 | 2 |
| `apps/api/src/zalo/zalo.config.ts` | `ZALO_API.cauNoi.chuaQuyen` | 3 |
| `apps/api/src/zalo/zalo-cau-noi.service.ts` | năm nguyên nhân + một dòng warn | 3 |
| `apps/api/src/zalo/zalo.service.ts` | `ZALO_THONG_DIEP.cauNoi`, `guiHong`; hai dòng `!ket.ok`; dòng `guiDuoc` | 3 |
| `apps/api/test/noi-zalo-cho-nguoi-moi.spec.ts` | đổi hai khẳng định cũ | 3 |
| `apps/api/test/loi-tac-tu-zalo.spec.ts` | E1 E2 E3 E4 E6 E7 E9 | 3 |
| `apps/app/app/(app)/[slug]/settings/notifications/khoi-zalo.tsx` | hiện `e.message` | 4 |
| `apps/app/test/loi-tac-tu-zalo.dom.tsx` | E8 | 4 |
| `docs/agent.md`, `docs/plan/lo-trinh-zalo.md` | tài liệu, bảng mục 7 | 5 |
| `_acceptance/loi-tac-tu-zalo-noi-dung-nguyen-nhan/rang/tai-lieu.mjs` | E10 | 5 |

---

### Task 1: Khuôn cầu nối và bộ đọc mã lỗi Zalo

`independent: false` (mọi task sau dùng khuôn này) · phục vụ E1, E3, E4, E5, E9

**Files:**
- Modify: `packages/validation/src/zalo-cau-noi.ts`
- Modify: `packages/validation/src/zalo-update.ts`

**Interfaces:**
- Produces: `datBotPhanHoi` thêm nhánh `{ outcome: "zalo-loi"; reason: string }`; `guiThuPhanHoi` output thêm `guiDuoc: boolean`, và thiếu trường này thì mặc định `true`; `maLoiZalo(value: unknown): number | null`.

- [ ] **Step 1: Sửa `zalo-cau-noi.ts`**

```ts
export const datBotPhanHoi = z.discriminatedUnion("outcome", [
	z.object({
		outcome: z.literal("valid"),
		tenBot: z.string().min(1),
		webhook: z.enum(WEBHOOK_KET),
	}),
	z.object({ outcome: z.literal("invalid"), reason: z.string().min(1) }),
	z.object({
		outcome: z.literal("khong-co-token"),
		reason: z.string().min(1),
	}),
	z.object({ outcome: z.literal("zalo-loi"), reason: z.string().min(1) }),
]);

export const guiThuPhanHoi = z.object({
	kenh: z.enum(["zalo", "slack"]).nullable(),
	lech: z.boolean(),
	guiDuoc: z.boolean().default(true),
});
```

- [ ] **Step 2: Thêm `maLoiZalo` vào `zalo-update.ts`** (ngay sau `loiZalo`)

```ts
export function maLoiZalo(value: unknown): number | null {
	const ket = loiZalo.safeParse(value);
	return ket.success ? (ket.data.error_code ?? null) : null;
}
```

- [ ] **Step 3: Verify** — `bun run check-types` (lỗi kiểu ở tác tử: `guiThu` chưa trả `guiDuoc`, sẽ sửa ở Task 2; ghi nhận và đi tiếp). Commit: `feat(validation): khuôn cầu nối Zalo có zalo-loi và guiDuoc`.

---

### Task 2: Tác tử phân loại lỗi Zalo/Slack thay vì ném

`independent: false` (cần Task 1; Task 3 đo qua chuỗi thật tới đây) · phục vụ E3, E4, E5, E7

**Files:**
- Modify: `apps/agent/agent/lib/zalo-config.ts`
- Modify: `apps/agent/agent/lib/zalo-api.ts`
- Modify: `apps/agent/agent/lib/zalo-bot-xuong.ts` (chỉ khối `getMe` đầu `datBot` + `guiThu`)
- Modify: `apps/agent/test/support/zalo-gia.ts` (chỉ thêm biến thể)
- Create: `apps/agent/test/loi-tac-tu-zalo.integration.spec.ts`

**Interfaces:**
- Consumes: `maLoiZalo`, `guiThuPhanHoi`, `datBotPhanHoi` (Task 1).
- Produces: `ZALO.loi.zaloKhongTraLoi: string` (Task 3 so bằng nó); `LoiHttpZalo extends Error { status: number }`; `ChonZaloGia.getMe` nhận thêm `500 | "la" | "ok-false-401" | "ok-false-500"`; `ChonZaloGia.send` nhận thêm `"la"`.

- [ ] **Step 1: Config tác tử** — trong `ZALO.http` thêm `tuChoi: { tu: 400, den: 500 }`; trong `ZALO.loi` thêm:

```ts
		zaloKhongTraLoi:
			"Zalo đang không trả lời nên chưa kiểm được token. Bot đang dùng giữ nguyên; thử lại sau ít phút.",
```

- [ ] **Step 2: `LoiHttpZalo` trong `zalo-api.ts`** — message giữ nguyên, `name` giữ mặc định `Error` để các dòng log cũ in y như trước:

```ts
export class LoiHttpZalo extends Error {
	constructor(
		method: string,
		readonly status: number,
	) {
		super(`Zalo ${method} tra HTTP ${status}.`);
	}
}
```

Trong `zaloGoi`, thay `throw new Error(\`Zalo ${method} tra HTTP ${res.status}.\`)` bằng `throw new LoiHttpZalo(method, res.status)`.

- [ ] **Step 3: Phân loại `getMe` trong `datBot`** — thêm vào `zalo-bot-xuong.ts` (import `maLoiZalo`, `LoiHttpZalo`):

```ts
type KetGetMe =
	| { loai: "duoc"; tenBot: string }
	| { loai: "token-sai" }
	| { loai: "zalo-loi" };

function baoLoiZalo(method: string, lop: string): void {
	console.error(`[zalo] ${method} hong: ${lop}`);
}

function lopLoi(loi: unknown): string {
	if (loi instanceof LoiHttpZalo) return `http-${loi.status}`;
	if (loi instanceof TypeError) return `mang (${loi.name})`;
	return `tra-loi-la (${loi instanceof Error ? loi.name : typeof loi})`;
}

function laTuChoi(ma: number | null): boolean {
	return ma !== null && ma >= ZALO.http.tuChoi.tu && ma < ZALO.http.tuChoi.den;
}

async function docBot(fetcher: typeof fetch, token: string): Promise<KetGetMe> {
	let me: { status: number; than: unknown };
	try {
		me = await zaloGoiTho(fetcher, token, "getMe", {});
	} catch (loi) {
		baoLoiZalo("getMe", lopLoi(loi));
		return { loai: "zalo-loi" };
	}
	const maThan = maLoiZalo(me.than);
	if (laTuChoi(me.status) || laTuChoi(maThan)) return { loai: "token-sai" };
	if (me.status !== ZALO.http.ok) {
		baoLoiZalo("getMe", `http-${me.status}`);
		return { loai: "zalo-loi" };
	}
	if (maThan !== null) {
		baoLoiZalo("getMe", `ok-false-${maThan}`);
		return { loai: "zalo-loi" };
	}
	try {
		return { loai: "duoc", tenBot: parseZaloGetMe(me.than).tenBot };
	} catch {
		baoLoiZalo("getMe", "sai-khuon");
		return { loai: "zalo-loi" };
	}
}
```

Trong `datBot`, thay ba dòng `const me = … parseZaloGetMe(me.than);` bằng:

```ts
	const bot = await docBot(fetcher, token);
	if (bot.loai === "token-sai") {
		return { outcome: "invalid", reason: ZALO.loi.tokenSai };
	}
	if (bot.loai === "zalo-loi") {
		return { outcome: "zalo-loi", reason: ZALO.loi.zaloKhongTraLoi };
	}
	const { tenBot } = bot;
```

(phần còn lại của `datBot` không đổi).

- [ ] **Step 4: `guiThu` trả `guiDuoc`**

```ts
async function guiDuocKhong(
	method: string,
	gui: () => Promise<unknown>,
): Promise<boolean> {
	try {
		await gui();
		return true;
	} catch (loi) {
		baoLoiZalo(method, lopLoi(loi));
		return false;
	}
}

export async function guiThu(
	userId: string,
	deps: { fetcher?: typeof fetch; slackFetcher?: typeof fetch } = {},
): Promise<GuiThuPhanHoi> {
	const token = await zaloToken();
	const kenh = await kenhSeDungCua(db, userId, { coToken: token !== null });
	const cau = ZALO.loi.guiThu(gioNhac());
	let guiDuoc = true;
	if (kenh.kenh === "zalo" && token && kenh.zaloUserId) {
		const zaloUserId = kenh.zaloUserId;
		guiDuoc = await guiDuocKhong("sendMessage", () =>
			guiZalo(token, zaloUserId, cau, { fetcher: deps.fetcher }),
		);
	}
	if (kenh.kenh === "slack" && kenh.slackUserId) {
		const slackUserId = kenh.slackUserId;
		guiDuoc = await guiDuocKhong("slack", () =>
			guiQuaSlackThu(slackUserId, cau, {
				fetcher: deps.slackFetcher,
				maTin: `nhac-thu-${userId}-${Date.now()}`,
			}),
		);
	}
	return { kenh: kenh.kenh, lech: kenh.lech, guiDuoc };
}
```

- [ ] **Step 5: Biến thể Zalo giả** — trong `ChonZaloGia`: `getMe?: "ok" | 401 | 500 | "la" | "ok-false-401" | "ok-false-500";` và `send?: "ok" | 500 | "ok-false" | "la";`. Trong `traGetMe`, sau nhánh 401:

```ts
	if (chon.getMe === 500) return new Response("loi", { status: 500 });
	if (chon.getMe === "la") return Response.json({ ok: true, result: { khac: 1 } });
	if (chon.getMe === "ok-false-401") {
		return Response.json({ ok: false, error_code: 401, description: "Unauthorized" });
	}
	if (chon.getMe === "ok-false-500") {
		return Response.json({ ok: false, error_code: 500, description: "Internal error" });
	}
```

Trong `traSend`, trước nhánh ok: `if (chon.send === "la") return Response.json({ ok: true, result: { khac: 1 } });`

- [ ] **Step 6: Test E5** — `apps/agent/test/loi-tac-tu-zalo.integration.spec.ts`. Gieo V bằng `moXuong`, `gieoNguoi`, `noiSlack`, `khopSlack`, rồi đặt `notificationPreference` là SLACK. Gọi thẳng `guiThu(V.id, { slackFetcher })` với ba biến thể viết trước: (a) `{ok:false,error:"channel_not_found"}`, (b) ném `TypeError("fetch failed")`, (c) ok. Mỗi ô parse kết quả qua `guiThuPhanHoi`. (a) và (b): `toEqual({ kenh: "slack", lech: <giá trị kenhSeDungCua>, guiDuoc: false })` và không ném. (c): `guiDuoc: true`. Bắt `console.error`: (a) và (b) mỗi ô có một dòng bắt đầu `[zalo] slack hong:`. Tên test: `gui-thu-slack-hong: …`. Dọn: `donDep()`, xoá `slackMemberMatch`, `account`, `notificationPreference` của V.

- [ ] **Step 7: Chạy** `bun run test -- "cd apps/agent && bun test test/loi-tac-tu-zalo.integration.spec.ts"` → PASS; `bun run test -- "cd apps/agent && bun test test/noi-zalo-cho-nguoi-moi.integration.spec.ts test/nhac-qua-zalo.integration.spec.ts test/zalo-qua-webhook.integration.spec.ts"` → PASS (không hồi quy).

- [ ] **Step 8: Commit** `feat(agent): tác tử trả zalo-loi và guiDuoc thay vì ném khi Zalo/Slack hỏng`, rồi **phá-thử E5**: bỏ `try/catch` trong `guiDuocKhong` (cho `await gui(); return true;`) → ô (a) đỏ với thông điệp ghim `slack hong -> guiDuoc false, khong nem`; `git checkout -- apps/agent/agent/lib/zalo-bot-xuong.ts`.

---

### Task 3: API gọi tên nguyên nhân, ghi log và ánh xạ câu

`independent: false` (cần Task 1 và 2) · phục vụ E1, E2, E3, E4, E6, E7, E9

**Files:**
- Modify: `apps/api/src/zalo/zalo.config.ts`
- Modify: `apps/api/src/zalo/zalo-cau-noi.service.ts`
- Modify: `apps/api/src/zalo/zalo.service.ts`
- Modify: `apps/api/test/noi-zalo-cho-nguoi-moi.spec.ts` (hai khẳng định)
- Create: `apps/api/test/loi-tac-tu-zalo.spec.ts`

**Interfaces:**
- Consumes: `ZALO.loi.zaloKhongTraLoi`, `ZALO.loi.tokenSai`, `ChonZaloGia` mới (Task 2).
- Produces: `NGUYEN_NHAN_CAU_NOI`, `type NguyenNhanCauNoi`, `KetCauNoi<T> = { ok: true; data: T } | { ok: false; nguyenNhan: NguyenNhanCauNoi; status?: number }`; `ZALO_THONG_DIEP.cauNoi: Record<NguyenNhanCauNoi, (status?: number) => string>`, `ZALO_THONG_DIEP.guiHong: { zalo: string; slack: string }`.

- [ ] **Step 1: Config** — `ZALO_API.cauNoi = { timeoutMs: 20 * SECOND_MS, chuaQuyen: 401 }`.

- [ ] **Step 2: `zalo-cau-noi.service.ts`**

```ts
export const NGUYEN_NHAN_CAU_NOI = [
	"thieu-cau-noi",
	"khong-toi-duoc",
	"sai-khoa",
	"tac-tu-loi",
	"sai-khuon",
] as const;
export type NguyenNhanCauNoi = (typeof NGUYEN_NHAN_CAU_NOI)[number];

type Hong = { nguyenNhan: NguyenNhanCauNoi; status?: number };

export type KetCauNoi<T> = { ok: true; data: T } | ({ ok: false } & Hong);

	private hong<T>(duong: string, ket: Hong, loi?: string): KetCauNoi<T> {
		this.logger.warn({
			message: "Zalo bridge call failed",
			duong,
			...ket,
			...(loi === undefined ? {} : { loi }),
		});
		return { ok: false, ...ket };
	}

	private async goi<T>(
		duong: string,
		than: DatBotYeuCau | { userId: string },
		schema: z.ZodType<T>,
	): Promise<KetCauNoi<T>> {
		const cau = bridge();
		if (!cau) return this.hong(duong, { nguyenNhan: "thieu-cau-noi" });
		let res: Response;
		try {
			res = await fetch(cau.url(duong), {
				method: "POST",
				headers: {
					authorization: `Bearer ${cau.secret}`,
					"content-type": "application/json",
				},
				body: JSON.stringify(than),
				signal: AbortSignal.timeout(ZALO_API.cauNoi.timeoutMs),
			});
		} catch (loi) {
			return this.hong(duong, { nguyenNhan: "khong-toi-duoc" }, tenLoi(loi));
		}
		if (res.status === ZALO_API.cauNoi.chuaQuyen) {
			return this.hong(duong, { nguyenNhan: "sai-khoa", status: res.status });
		}
		if (!res.ok) {
			return this.hong(duong, { nguyenNhan: "tac-tu-loi", status: res.status });
		}
		let thanPhanHoi: unknown;
		try {
			thanPhanHoi = await res.json();
		} catch (loi) {
			return loi instanceof SyntaxError
				? this.hong(duong, { nguyenNhan: "sai-khuon" }, "khong-phai-json")
				: this.hong(duong, { nguyenNhan: "khong-toi-duoc" }, tenLoi(loi));
		}
		const ket = schema.safeParse(thanPhanHoi);
		if (!ket.success) {
			return this.hong(
				duong,
				{ nguyenNhan: "sai-khuon" },
				ket.error.issues.map((i) => i.path.join(".")).join(","),
			);
		}
		return { ok: true, data: ket.data };
	}
```

`tenLoi` đặt ở cấp tệp: `const tenLoi = (loi: unknown) => (loi instanceof Error ? loi.name : typeof loi);`.

- [ ] **Step 3: `zalo.service.ts`** — trong `ZALO_THONG_DIEP` bỏ `khongCauNoi`, thêm:

```ts
	cauNoi: {
		"thieu-cau-noi": () =>
			"CRM chưa được nối với dịch vụ nhắc việc. Báo người cài đặt CRM.",
		"khong-toi-duoc": () =>
			"Không gọi được dịch vụ nhắc việc — có thể nó đang tắt hoặc đang khởi động. Thử lại sau ít phút.",
		"sai-khoa": () =>
			"Dịch vụ nhắc việc không nhận khoá của CRM. Báo người cài đặt CRM.",
		"tac-tu-loi": (status?: number) =>
			`Dịch vụ nhắc việc gặp lỗi (mã ${status}). Thử lại; nếu vẫn lỗi, báo người cài đặt CRM.`,
		"sai-khuon": () =>
			"Dịch vụ nhắc việc trả lời theo khuôn CRM không đọc được — có thể hai bên đang chạy hai phiên bản khác nhau. Báo người cài đặt CRM.",
	} satisfies Record<NguyenNhanCauNoi, (status?: number) => string>,
	guiHong: {
		zalo: "Zalo chưa nhận tin thử. Thử lại sau ít phút.",
		slack: "Slack chưa nhận tin thử. Thử lại sau ít phút.",
	},
```

Hai dòng `if (!ket.ok) throw new BadRequestException(ZALO_THONG_DIEP.khongCauNoi);` → `if (!ket.ok) throw new BadRequestException(ZALO_THONG_DIEP.cauNoi[ket.nguyenNhan](ket.status));`. Trong `guiThu`, ngay sau khối `kenh === null`, thêm: `if (!ket.data.guiDuoc) throw new BadRequestException(ZALO_THONG_DIEP.guiHong[ket.data.kenh]);`.

- [ ] **Step 4: Hai khẳng định cũ** trong `apps/api/test/noi-zalo-cho-nguoi-moi.spec.ts`: `expect(r.loi).toContain("Tác tử chưa nối được")`. Ca «không cầu nối» đổi thành `toBe(ZALO_THONG_DIEP.cauNoi["thieu-cau-noi"]())`. Ca «tác tử không ai nghe» đổi thành `toBe(ZALO_THONG_DIEP.cauNoi["khong-toi-duoc"]())`. Không đổi gì khác.

- [ ] **Step 5: `apps/api/test/loi-tac-tu-zalo.spec.ts`** — dựng `AppModule` như `noi-zalo-cau-noi.spec.ts` (`moXuong`, `mintPhien`, `gieoThanhVien`). Hai bàn đo:
  - **tác tử giả** (`Bun.serve` với `traLoi: (duong) => Response`), dùng cho E1 E2 E6 E9;
  - **chuỗi thật** (route eve của `channels/zalo.ts` sau `Bun.serve` gốc `https://tac-tu.test` + `zaloMayChu(chon)`, `ZALO_API_URL` trỏ vào nó hoặc vào `http://127.0.0.1:1`), dùng cho E3 E4 E7.

  Helper bắt buộc:

```ts
const DIA_CHI_CHET = "http://127.0.0.1:1";

async function chacBiTuChoi(): Promise<void> {
	const bi = await fetch(DIA_CHI_CHET).then(
		() => false,
		(loi: unknown) => loi instanceof TypeError,
	);
	if (!bi) throw new Error("cong da bi cap lai — loi moi truong");
}

function inRa(doiSo: unknown[]): string {
	return doiSo.map((d) => Bun.inspect(d, { depth: 10 })).join(" ");
}
```

  Các `describe`, tên test bắt đầu đúng tiền tố `-t` của config:
  - `cau-noi-ma-tran` — bảng 6 tình trạng × 2 thao tác viết trước. Mỗi ô: `status === 400` và `message === ZALO_THONG_DIEP.cauNoi[n](s)`. Sau vòng lặp: `soO === 12`; tập câu của năm nguyên nhân có kích thước 5; câu `tac-tu-loi` chứa `"500"`; không câu nào chứa «Tác tử chưa nối được». Có đối chứng dương.
  - `cau-noi-log` — cùng bảng. `spyOn(Logger.prototype, "warn")`. Mỗi ô đúng một lời gọi có `message`, `duong`, `nguyenNhan`, `status` như bảng. `inRa` của mọi đối số không chứa token đánh dấu, `BI_MAT` hay `THAN-BI-MAT-<o>`. Ô lành thì 0 dòng warn.
  - `getme-zalo-hong` — 6 ô (a–f) như E3. Mỗi ô so câu, `setWebhook === 0`, năm cột `AppSetting` giống bản chụp. Có đối chứng dương.
  - `gui-thu-zalo-hong` — 5 ô như E4 (U nối bằng `taoMaLienKet` + `noiBangMa`, ưu tiên ZALO, token trong `AppSetting`).
  - `gui-thu-slack-api` — tác tử giả trả `guiDuoc:false` cho `slack` rồi cho `zalo`, và `guiDuoc:true` cho `slack`.
  - `log-khong-lo-token` — 4 ô như E7. `spyOn(console, "error")` + `spyOn(Logger.prototype, "warn")`. `inRa` không chứa T. Có dòng `[zalo] getMe`/`[zalo] sendMessage` chứa `mang` hoặc `http-500`. Đối chứng dương: 0 dòng `[zalo]`.
  - `lech-phien-ban` — `{kenh:"zalo",lech:false}` → data `{kenh:"zalo"}`, 0 warn `sai-khuon`. `{…, guiDuoc:"co"}` → 400 `sai-khuon`.

- [ ] **Step 6: Chạy** từng khoá `ltz_*` của config (ví dụ `bun run test -- "cd apps/api && bun test test/loi-tac-tu-zalo.spec.ts -t cau-noi-ma-tran"`) → PASS. Chạy thêm `bun run test -- "cd apps/api && bun test test/noi-zalo-cho-nguoi-moi.spec.ts test/noi-zalo-cau-noi.spec.ts"` → PASS.

- [ ] **Step 7: Commit** `feat(api): lỗi cầu nối Zalo gọi đúng nguyên nhân và ghi một dòng log`, rồi **phá-thử**. Mỗi lần phá xong đều `git checkout -- <tệp>`:
  1. E1: đổi nhánh 401 thành `tac-tu-loi` → ô (c) đỏ, thông điệp ghim «401 -> sai-khoa».
  2. E1: gộp `await res.json()` vào try của `fetch` → ô (f) đỏ, thông điệp ghim «than khong phai JSON la sai-khuon, khong phai mang».
  3. E2: bỏ `logger.warn` ở nhánh `!res.ok` (trả thẳng `{ ok: false, … }`) → ô (d) đỏ, thông điệp ghim «moi loi goi hong dung mot dong warn».
  4. E2: thêm `than` vào đối tượng warn → ô (d) của luuBot đỏ, thông điệp ghim «warn cau noi khong chua Bot Token».
  5. E3: `docBot` trả `token-sai` khi `me.status !== 200` → ô (b) đỏ, thông điệp ghim «getMe 5xx khong phai token sai».
  6. E3: bỏ điều kiện `laTuChoi(maThan)` → ô (f) đỏ, thông điệp ghim «ok:false 401 la token sai».
  7. E4: bỏ try/catch ở `guiDuocKhong` → ô (b) đỏ, thông điệp ghim «gui hong -> guiHong.zalo».
  8. E6: bỏ dòng `guiDuoc` trong `zalo.service.ts` → ô đầu đỏ, thông điệp ghim «guiDuoc false -> guiHong.slack».
  9. E7 (1): `baoLoiZalo("getMe", String((loi as Error & { path?: string }).path))` → ô (a) đỏ, thông điệp ghim «khong dong log nao chua Bot Token».
  10. E7 (2): `console.error("[zalo] getMe hong: mang", loi)` → ô (a) đỏ, cùng thông điệp ghim.
  11. E9: bỏ `.default(true)` → ô đầu đỏ, thông điệp ghim «tac tu doi truoc khong co guiDuoc van la da gui».

---

### Task 4: Màn Thông báo hiện câu nguyên nhân

`independent: false` (dùng câu của Task 3 làm dữ liệu test) · phục vụ E8

**Files:**
- Modify: `apps/app/app/(app)/[slug]/settings/notifications/khoi-zalo.tsx`
- Create: `apps/app/test/loi-tac-tu-zalo.dom.tsx`

- [ ] **Step 1: Đổi state lỗi** trong `khoi-zalo.tsx`:

```tsx
	const [guiThuLoi, setGuiThuLoi] = useState<string | null>(null);
	const guiThu = useMutation(
		trpc.zalo.guiThu.mutationOptions({
			onMutate: () => setGuiThuLoi(null),
			onSuccess: (kq) =>
				toast.success(kq.kenh === "zalo" ? t.daGuiThuZalo : t.daGuiThuSlack),
			onError: (e) => setGuiThuLoi(e.message || t.guiThuLoi),
		}),
	);
```

và phần hiển thị: `{guiThuLoi ? (<p role="alert" className="text-destructive text-xs">{guiThuLoi}</p>) : null}`.

- [ ] **Step 2: Test DOM** — chép khung mock tRPC của `apps/app/test/noi-zalo-cho-nguoi-moi.dom.tsx` (Proxy `trpcGia`, `mock.module` các module của app, `LocaleProvider`). Render `KhoiZalo` với `zalo.cuaToi` trả trạng thái đã nối, đúng khuôn `zaloCuaToiOutput`. Bốn ô viết trước (`man-gui-thu-loi: 1…4`) như E8: câu API; rỗng + vi; rỗng + en; bấm lại khi gửi được thì 0 alert.

- [ ] **Step 3: Chạy** `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/loi-tac-tu-zalo.dom.tsx` → PASS. Chạy thêm `./test/noi-zalo-cho-nguoi-moi.dom.tsx ./test/nhac-qua-zalo.dom.tsx` → PASS.

- [ ] **Step 4: Commit** `feat(app): màn Thông báo hiện câu nguyên nhân khi gửi thử hỏng`, rồi phá-thử: `onError: () => setGuiThuLoi(t.guiThuLoi)` → ô 1 đỏ, thông điệp ghim «man hien cau nguyen nhan cua API»; `git checkout --`.

---

### Task 5: Tài liệu, bảng lộ trình và thước E10

`independent: false` (mô tả hành vi của Task 2–3) · phục vụ E10

**Files:**
- Modify: `docs/agent.md` (mục Zalo, sau đoạn `kiemBot`)
- Modify: `docs/plan/lo-trinh-zalo.md` (mục 7)
- Create: `_acceptance/loi-tac-tu-zalo-noi-dung-nguyen-nhan/rang/tai-lieu.mjs`

- [ ] **Step 1: `docs/agent.md`** — thêm một gạch đầu dòng: cầu nối `/internal/zalo/*` không ném khi Zalo hay Slack hỏng. `datBot` trả `zalo-loi` khi `getMe` gặp lỗi mạng, 5xx, `ok:false` khác 4xx hay sai khuôn; 4xx (HTTP hoặc `error_code`) là token sai. `guiThu` trả `guiDuoc: false`. Mỗi lần hỏng in `[zalo] <method> hong: <lớp>`, chỉ có tên lỗi, không có đối tượng lỗi, vì `path` của lỗi `fetch` mang token. API ghi `warn` «Zalo bridge call failed» với `nguyenNhan`.

- [ ] **Step 2: `docs/plan/lo-trinh-zalo.md` mục 7** — ghi thêm vào Ghi chú dòng 2: «đã lên `onehub` 24/09 (#118, `5bc9b6b0`)». Thêm dòng mới ngay dưới dòng 2: `| 2b | \`loi-tac-tu-zalo-noi-dung-nguyen-nhan\` | đang dựng | 2026-09-24 | \`feat/loi-tac-tu-zalo-noi-dung-nguyen-nhan\` | tách từ Ngoài-6 vòng 1 / Ngoài-8 vòng 3 của vòng 2 · gộp Known limit Ngoài-1 · Cổng Phạm vi chủ kho duyệt 24/09 · theo luật điều phối: A \`zalo-goi-thu-hong-hien-dung-bot\` lên trước |`

- [ ] **Step 3: `rang/tai-lieu.mjs`**

```js
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = process.env.GOC_KHO ?? join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SLUG = "loi-tac-tu-zalo-noi-dung-nguyen-nhan";
const hong = [];

const agent = readFileSync(join(GOC, "docs/agent.md"), "utf8");
const dauZalo = agent.search(/^#+ .*Zalo/m);
const sauZalo = dauZalo < 0 ? "" : agent.slice(dauZalo);
const capDau = sauZalo.match(/^(#+) /)?.[1] ?? "#";
const hetTieuDe = sauZalo.indexOf("\n");
const thanMuc = hetTieuDe < 0 ? "" : sauZalo.slice(hetTieuDe + 1);
const ketZalo = thanMuc.search(new RegExp(`^#{1,${capDau.length}} `, "m"));
const mucZalo = ketZalo < 0 ? sauZalo : sauZalo.slice(0, hetTieuDe + 1 + ketZalo);
for (const can of ["zalo-loi", "guiDuoc", "does not throw"]) {
	if (!mucZalo.includes(can)) hong.push(`docs/agent.md muc Zalo thieu "${can}"`);
}

const keHoach = readFileSync(join(GOC, "docs/plan/lo-trinh-zalo.md"), "utf8");
const muc7 = keHoach.slice(keHoach.indexOf("## 7."), keHoach.indexOf("## 8."));
const tapTrangThai = (muc7.match(/giá trị:([\s\S]*?)\. Cột Ngày/)?.[1] ?? "")
	.split("·")
	.map((s) => s.replace(/[`\s]+/g, " ").trim())
	.filter(Boolean);
const dong = muc7.split("\n").filter((d) => d.startsWith("|") && d.includes(SLUG));
if (dong.length !== 1) hong.push(`bang muc 7 thieu dong ${SLUG} (dem ${dong.length})`);
const trangThai = (dong[0] ?? "").split("|")[3]?.replace(/[`\s]+/g, " ").trim() ?? "";
if (dong.length === 1 && !tapTrangThai.includes(trangThai)) {
	hong.push(`trang thai "${trangThai}" khong thuoc tap muc 7`);
}

if (hong.length > 0) {
	for (const h of hong) console.error(h);
	process.exit(1);
}
console.log(`tai-lieu: dat (${tapTrangThai.length} trang thai hop le)`);
```

- [ ] **Step 4: Chạy** `node _acceptance/loi-tac-tu-zalo-noi-dung-nguyen-nhan/rang/tai-lieu.mjs` → exit 0. Đối chứng đỏ: chép hai tệp docs sang một thư mục tạm, xoá dòng 2b, chạy với `GOC_KHO=<tạm>` → exit 1, thông điệp ghim «bang muc 7 thieu dong loi-tac-tu-zalo-noi-dung-nguyen-nhan».

- [ ] **Step 5: Commit** `docs(zalo): cầu nối không ném khi Zalo hỏng; bảng lộ trình dòng 2b`.

---

## Kết S3

Chạy năm lệnh chứng của kho: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`. Sau đó đặt `status: implemented` cho contract và chuyển sang S4 (xin lượt làn đo từ phiên điều phối trước khi dispatch).
