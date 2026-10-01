# Vá Trợ lý OKR sau lượt thử Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trợ lý OKR chạy được trên Vercel qua OIDC, có khoá Gateway riêng tuỳ chọn, không đề xuất Căn chỉnh chồng nhánh, và hộp sửa KR không còn hai giọng trái nhau.

**Architecture:** Một hàm `nguonKhoaMoHinh` ở `apps/agent` là nơi duy nhất biết đường tới model (khoá riêng → khoá chung → vé OIDC). Kết quả kiểm sẵn sàng ghi nguồn; nhịp điều phối xếp kiểm lại khi nguồn đổi; API đọc nguồn để thẻ Cài đặt hiện. Căn chỉnh chồng lọc ở gói ngữ cảnh; luật động từ so theo dấu.

**Tech Stack:** Bun, TypeScript, eve 0.29, `ai` 7, `@ai-sdk/gateway` 4.0.69, `@vercel/oidc` 3.2.0, Prisma 7, NestJS + tRPC, Next.js, bun:test + happy-dom.

**Spec:** `docs/superpowers/specs/2026-10-01-va-tro-ly-okr-sau-thu-design.md` · hợp đồng `_acceptance/va-tro-ly-okr-sau-thu/contract.md` · phép đo `_acceptance/va-tro-ly-okr-sau-thu/evals.yaml`.

## Global Constraints

- Không chú thích trong mã, kể cả mã sửa.
- Trí khôn ở `apps/agent`; API không đọc khoá model, không gọi Gateway.
- Hằng tinh chỉnh (tên biến khoá, danh sách động từ) ở tệp cấu hình của khu: `TRO_LY_OKR` (`apps/agent/agent/lib/okr/config.ts`), `OKR_KIEM` (`packages/validation/src/okr-kiem.ts`).
- Thiếu khoá là mất năng lực, không bao giờ ném.
- Biến bí mật mới vào `.env.example`, `turbo.json` `globalPassThroughEnv`, pass-through `dev` của `apps/agent/turbo.json`; không vào `env` của turbo.
- Giao diện chỉ dùng thành phần của `packages/ui`; không `className` đè kiểu thành phần.
- Chữ trên màn dùng «tác tử» cho phần máy chủ (không «tác nhân»).
- `@vercel/oidc` ghim đúng `3.2.0` (bản `@ai-sdk/gateway` 4.0.69 dùng).
- Phép đo mới đi kèm cặp hai chiều trên cùng fixture, thông điệp ghim (khuôn MEASURE-BIRTH).
- Script chạm `@crm/db` chạy qua `bun run test -- "<lệnh>"` từ gốc kho.

## Review Focus

- Vé OIDC hết hạn hoặc sai khuôn trên máy không liên kết Vercel: thư viện thử làm mới và ném — hàm phải trả `null`, không ném, không gọi mạng (Task 1).
- Khoá chỉ có khoảng trắng hoặc chuỗi rỗng trong biến: coi như không có (Task 1).
- Tên KR có dấu nhưng mở bằng động từ tiếng Anh («Launch cổng đối tác mới»), hoặc viết hoa («HỌP GIAO BAN…»): vẫn bị gắn `kr-la-viec` (Task 6).
- Mục tiêu căn chỉnh tới KR của một Mục tiêu không nằm trong danh sách đích (khác chu kỳ, đã bỏ): bộ lọc không làm rơi đích khác (Task 5, Mục tiêu Y).
- Hàng kiểm `okr-kiem-san-sang` đang chạy dở khi nguồn đổi: không xếp thêm hàng thứ hai (Task 2, đối chứng «đang chờ»).

---

### Task 1: Hàm nguồn khoá và mục năng lực «AI model»

`independent: false` (Task 2, 3 dùng) · phục vụ E1, E4

**Files:**
- Create: `apps/agent/agent/lib/mo-hinh-khoa.ts`
- Modify: `apps/agent/agent/lib/okr/config.ts` (thay `khoaMoHinh` bằng `khoa`)
- Modify: `apps/agent/agent/lib/capabilities.ts` (mục `MO_HINH_AI`)
- Modify: `apps/agent/package.json` (thêm `"@vercel/oidc": "3.2.0"`)
- Test: `apps/agent/test/mo-hinh-khoa.spec.ts` (mới), `apps/agent/test/capabilities.spec.ts`, `apps/agent/test/support/ve-oidc.ts` (mới)

**Interfaces:**
- Produces: `type NguonKhoa = "khoa-rieng" | "khoa-chung" | "oidc"`; `nguonKhoaMoHinh(v?: { env?: Env; layVe?: () => Promise<string>; rieng?: boolean }): Promise<NguonKhoa | null>`; `TRO_LY_OKR.khoa = { rieng: "OKR_AI_GATEWAY_API_KEY", chung: "AI_GATEWAY_API_KEY" }`; `capabilitiesFrom(contextDev, coMoHinh = false)`.
- Test support produces: `veOidc({ hetHan?: boolean }): string` (JWT ba phần base64url), `trongRequest<T>(ve: string | null, chay: () => Promise<T>): Promise<T>` đặt `globalThis[Symbol.for("@vercel/request-context")] = { get: () => ({ headers: ve ? { "x-vercel-oidc-token": ve } : {} }) }` trong lúc chạy rồi trả lại giá trị cũ; `mayKhongLienKet<T>(chay)` đặt `HOME` và `process.chdir` sang thư mục tạm rỗng, spy `globalThis.fetch` ném `"goi mang"`.

- [ ] **Step 1: Viết bài đỏ `-t nguon-khoa`** — `apps/agent/test/mo-hinh-khoa.spec.ts`

```ts
import { describe, expect, test } from "bun:test";
import { getVercelOidcToken } from "@vercel/oidc";
import { nguonKhoaMoHinh } from "../agent/lib/mo-hinh-khoa";
import { TRO_LY_OKR } from "../agent/lib/okr/config";
import { mayKhongLienKet, trongRequest, veOidc } from "./support/ve-oidc";

const K = TRO_LY_OKR.khoa;
type O = { ten: string; env: Record<string, string>; header: string | null; layVe?: () => Promise<string>; ky: string | null };
const O_NGUON: O[] = [
	{ ten: "rieng", env: { [K.rieng]: "r" }, header: null, ky: "khoa-rieng" },
	{ ten: "chung", env: { [K.chung]: "c" }, header: null, ky: "khoa-chung" },
	{ ten: "ca-hai", env: { [K.rieng]: "r", [K.chung]: "c" }, header: null, ky: "khoa-rieng" },
	{ ten: "header-oidc", env: {}, header: veOidc(), ky: "oidc" },
	{ ten: "bien-oidc", env: { VERCEL_OIDC_TOKEN: veOidc() }, header: null, ky: "oidc" },
	{ ten: "khong-co", env: {}, header: null, ky: null },
	{ ten: "ve-het-han", env: {}, header: veOidc({ hetHan: true }), ky: null },
	{ ten: "ve-sai-khuon", env: {}, header: "tok", ky: null },
	{ ten: "lay-ve-nem", env: {}, header: null, layVe: () => Promise.reject(new Error("x")), ky: null },
	{ ten: "khoa-trang", env: { [K.rieng]: "  ", [K.chung]: " " }, header: null, ky: null },
];

describe("nguon-khoa", () => {
	test("fixture ve dung khuon", async () => {
		const ve = veOidc();
		await trongRequest(ve, async () => {
			expect(await getVercelOidcToken(), "fixture ve sai khuon").toBe(ve);
		});
	});
	test("ma tran toan phan", async () => {
		let soKhang = 0;
		for (const o of O_NGUON) {
			const ra = await mayKhongLienKet(() =>
				trongRequest(o.header, () => nguonKhoaMoHinh({ env: o.env, layVe: o.layVe })),
			);
			expect(ra, `o lech: ${o.ten}`).toBe(o.ky);
			soKhang += 1;
		}
		expect(soKhang).toBe(O_NGUON.length);
	});
});
```

- [ ] **Step 2: Chạy, thấy đỏ** — `cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/mo-hinh-khoa.spec.ts -t nguon-khoa` → FAIL «Cannot find module mo-hinh-khoa».

- [ ] **Step 3: Viết `ve-oidc.ts` và `mo-hinh-khoa.ts`**

```ts
import { getVercelOidcToken } from "@vercel/oidc";
import { TRO_LY_OKR } from "./okr/config";

export type NguonKhoa = "khoa-rieng" | "khoa-chung" | "oidc";
type Env = Readonly<Record<string, string | undefined>>;

const co = (env: Env, ten: string) => Boolean(env[ten]?.trim());

async function coVe(layVe: () => Promise<string>): Promise<boolean> {
	try {
		return Boolean((await layVe())?.trim());
	} catch {
		return false;
	}
}

export async function nguonKhoaMoHinh(
	v: { env?: Env; layVe?: () => Promise<string>; rieng?: boolean } = {},
): Promise<NguonKhoa | null> {
	const env = v.env ?? process.env;
	if ((v.rieng ?? true) && co(env, TRO_LY_OKR.khoa.rieng)) return "khoa-rieng";
	if (co(env, TRO_LY_OKR.khoa.chung)) return "khoa-chung";
	const layVe = v.layVe ?? (() => getVercelOidcToken());
	return (await coVe(layVe)) ? "oidc" : null;
}
```

`env` truyền vào bài: khi bài truyền `env` riêng, `getVercelOidcToken` vẫn đọc `process.env.VERCEL_OIDC_TOKEN` — trong `trongRequest`/`mayKhongLienKet` bài đặt và gỡ `process.env.VERCEL_OIDC_TOKEN` theo `o.env` (ô `bien-oidc`). `config.ts`: thay dòng `khoaMoHinh` bằng `khoa: { rieng: "OKR_AI_GATEWAY_API_KEY", chung: "AI_GATEWAY_API_KEY" },`.

- [ ] **Step 4: Chạy lại** → PASS. Phá-thử: sửa tạm `nguonKhoaMoHinh` chỉ đọc env → ô `header-oidc` đỏ «o lech: header-oidc»; hoàn lại.

- [ ] **Step 5: Mục năng lực** — `capabilitiesFrom(contextDev, coMoHinh = false)`; mục `MO_HINH_AI` `enabled: coMoHinh`, `from: "AI_GATEWAY_API_KEY or Vercel OIDC"`; `capabilities()` gọi `capabilitiesFrom(await contextDevKey(), (await nguonKhoaMoHinh({ rieng: false })) !== null)`. Bài `-t mo-hinh-ai` trong `capabilities.spec.ts`: bảy ô của E4 qua `capabilities()` trong `trongRequest`/`mayKhongLienKet`, cộng khẳng định tĩnh đọc nguồn `capabilities.ts` không chứa `process.env.VERCEL_OIDC_TOKEN` và `process.env.AI_GATEWAY_API_KEY`.

- [ ] **Step 6: Chạy** `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/capabilities.spec.ts"` → PASS (ca cũ giữ). Phá-thử (b): mục lọc theo `nguonKhoaMoHinh()` ∈ {khoa-chung, oidc} → ô riêng+header đỏ «nang luc bi khoa rieng che»; hoàn lại.

- [ ] **Step 7: Commit** `feat(agent): mot ham nguon khoa mo hinh theo thu tu Gateway, nhan ve OIDC`

### Task 2: Kiểm sẵn sàng ghi nguồn, kiểm lại khi nguồn đổi

`independent: false` (cần Task 1) · phục vụ E2, E3

**Files:**
- Modify: `packages/db/src/okr-tro-ly-danh-muc.ts` (`KET_QUA_KIEM_SAN_SANG`, `NGUON_CUA_KET_QUA`)
- Modify: `packages/db/src/okr-tro-ly.ts` (`canKiemLaiKhoa`)
- Modify: `apps/agent/agent/lib/okr/kiem-san-sang.ts`, `apps/agent/agent/lib/okr/viec.ts`, `apps/agent/agent/lib/dispatch.ts:386`
- Test: `apps/agent/test/tro-ly-okr-san-sang.integration.spec.ts`, `apps/agent/test/support/tro-ly-gieo.ts` (`gieoKiemSanSang` nhận outcome mới)

**Interfaces:**
- Consumes: `nguonKhoaMoHinh`, `NguonKhoa`.
- Produces: `KET_QUA_KIEM_SAN_SANG = ["san-sang", "san-sang-khoa-rieng", "san-sang-khoa-chung", "san-sang-oidc", "chua-co-khoa-mo-hinh"]`; `ketQuaCuaNguon(n: NguonKhoaDb | null): KetQuaKiemSanSang`; `nguonCuaKetQua(k: KetQuaKiemSanSang): NguonKhoaDb | "chua-ro" | null`; `NguonKhoaDb = "khoa-rieng" | "khoa-chung" | "oidc"` (đặt ở `packages/db` để API đọc được — tác tử import cùng kiểu); `canKiemLaiKhoa(db, now, ketQuaHienTai: KetQuaKiemSanSang)`; `xepKiemLaiKhoa(now?, nguon?: NguonKhoa | null)`.

- [ ] **Step 1: Bài đỏ `-t oidc` và `-t kiem-lai`** theo đúng `expected` của E2, E3 trong evals.yaml (bảng bốn lượt đổi viết trước, đối chứng trùng nguồn, chưa quá hạn, đang có hàng chờ). Header OIDC qua `trongRequest(veOidc(), …)` của Task 1.

```ts
const BANG_DOI = [
	{ cu: "chua-co-khoa-mo-hinh", env: {}, header: true, moi: "san-sang-oidc" },
	{ cu: "san-sang", env: { AI_GATEWAY_API_KEY: "c" }, header: false, moi: "san-sang-khoa-chung" },
	{ cu: "san-sang-oidc", env: { OKR_AI_GATEWAY_API_KEY: "r" }, header: true, moi: "san-sang-khoa-rieng" },
	{ cu: "san-sang-khoa-chung", env: {}, header: false, moi: "chua-co-khoa-mo-hinh" },
] as const;
```

- [ ] **Step 2: Chạy** `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tro-ly-okr-san-sang.integration.spec.ts -t 'oidc|kiem-lai'"` → FAIL.

- [ ] **Step 3: Cài**

```ts
export const NGUON_KHOA = ["khoa-rieng", "khoa-chung", "oidc"] as const;
export type NguonKhoaDb = (typeof NGUON_KHOA)[number];
export const KET_QUA_KIEM_SAN_SANG = [
	"san-sang",
	"san-sang-khoa-rieng",
	"san-sang-khoa-chung",
	"san-sang-oidc",
	"chua-co-khoa-mo-hinh",
] as const;
const KET_QUA_CUA_NGUON = {
	"khoa-rieng": "san-sang-khoa-rieng",
	"khoa-chung": "san-sang-khoa-chung",
	oidc: "san-sang-oidc",
} as const satisfies Record<NguonKhoaDb, KetQuaKiemSanSang>;
export const ketQuaCuaNguon = (n: NguonKhoaDb | null): KetQuaKiemSanSang =>
	n === null ? "chua-co-khoa-mo-hinh" : KET_QUA_CUA_NGUON[n];
export function nguonCuaKetQua(k: KetQuaKiemSanSang): NguonKhoaDb | "chua-ro" | null {
	if (k === "san-sang") return "chua-ro";
	return NGUON_KHOA.find((n) => KET_QUA_CUA_NGUON[n] === k) ?? null;
}
```

`canKiemLaiKhoa(db, now, hienTai)`: `aiOn` như cũ; `kq = ketQuaKiemGanNhat`; không có `kq` → false (lượt kiểm đầu do đường bật cấu hình xếp, như cũ); `kq.ketQua === hienTai` → false; chưa quá `hanKiemKhoaMs` → false; có hàng chờ → false; còn lại true. `xepKiemLaiKhoa(now, nguon)` truyền `ketQuaCuaNguon(nguon)`. `dispatch.ts`: `await xepKiemLaiKhoa(new Date(), await nguonKhoaMoHinh())`. `chayKiemSanSang`: `completeTask(task.id, ketQuaCuaNguon(await nguonKhoaMoHinh()))`. `viec.ts`: `coKhoaMoHinh` thành `async` gọi `(await nguonKhoaMoHinh()) !== null`; `lyDoChanTruocKhiGui` `await`. Dò mọi chỗ gọi `coKhoaMoHinh` (grep) và thêm `await`.

- [ ] **Step 4: Chạy lại** → PASS; chạy cả tệp `tro-ly-okr-san-sang.integration.spec.ts` (ca cũ AC-12 của `tro-ly-okr-de-xuat` giữ). Phá-thử: `canKiemLaiKhoa` chỉ xét `chua-co-khoa-mo-hinh` → dòng oidc→riêng đỏ «khong kiem lai khi doi nguon: san-sang-oidc».

- [ ] **Step 5: Kiểm kiểu** `bun run check-types` → xanh. Commit `feat(agent): kiem san sang ghi nguon khoa, kiem lai khi nguon doi`.

### Task 3: Khoá riêng cho model của Trợ lý và bốn nhà của biến

`independent: false` (cần tên biến của Task 1) · phục vụ E5, E6

**Files:**
- Modify: `apps/agent/agent/lib/okr/mo-hinh.ts`, `apps/agent/agent/subagents/tro_ly_okr/agent.ts`
- Modify: `.env.example` (khối AI Gateway, sau `KHO_TAI_LIEU_AI_GATEWAY_API_KEY`), `turbo.json` `globalPassThroughEnv`, `apps/agent/turbo.json` (hai chỗ đang có `KHO_TAI_LIEU_AI_GATEWAY_API_KEY`), `docs/environment.md` (bảng mục «Optional: what the agent can do» và đoạn dưới)
- Create: `_acceptance/va-tro-ly-okr-sau-thu/rang/bien-bon-nha.mjs`
- Test: `apps/agent/test/mo-hinh-khoa.spec.ts` `-t model-rieng`

**Interfaces:**
- Produces: `moHinhTroLyOkr(env?: Env, tao?: typeof createGateway): LanguageModel`; `MO_HINH_TRO_LY_OKR = moHinhTroLyOkr()`.

- [ ] **Step 1: Bài đỏ `-t model-rieng`** — nhà tạo giả ghi lời gọi và trả một provider giả sinh `MockLanguageModelV3` (từ `ai/test`) ghi `params`; hai ca env; khẳng định theo E5.
- [ ] **Step 2: Chạy** `cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/mo-hinh-khoa.spec.ts -t model-rieng` → FAIL.
- [ ] **Step 3: Cài**

```ts
export function moHinhTroLyOkr(
	env: Readonly<Record<string, string | undefined>> = process.env,
	tao: typeof createGateway = createGateway,
): LanguageModel {
	const khoa = env[TRO_LY_OKR.khoa.rieng]?.trim();
	const nha = khoa ? tao({ apiKey: khoa }) : tao();
	return wrapLanguageModel({
		model: nha(TRO_LY_OKR.model),
		middleware: kepTranRaMoiLoiGoi,
		modelId: TRO_LY_OKR.model,
	});
}

export const MO_HINH_TRO_LY_OKR: LanguageModel = moHinhTroLyOkr();
```

(`import { createGateway } from "@ai-sdk/gateway"` thay `gateway` từ `ai`.)

- [ ] **Step 4: Bốn nhà** — `.env.example`:

```
# A third AI Gateway key used only by Trợ lý OKR (suggestions and weekly summaries),
# so its spend is billed apart and a monthly budget can be set on the key.
# Without it Trợ lý OKR runs on AI_GATEWAY_API_KEY, or on Vercel OIDC.
# OKR_AI_GATEWAY_API_KEY=""
```

`turbo.json` và hai chỗ của `apps/agent/turbo.json`: thêm `"OKR_AI_GATEWAY_API_KEY"` cạnh `KHO_TAI_LIEU_AI_GATEWAY_API_KEY`. `docs/environment.md`: dòng bảng `| OKR_AI_GATEWAY_API_KEY | A separate AI Gateway key used only by Trợ lý OKR, so its spend is billed apart and can carry its own monthly budget. Without it Trợ lý OKR runs on the key above, or on Vercel OIDC |` và thêm tên biến vào đoạn «read by apps/agent only».

- [ ] **Step 5: `bien-bon-nha.mjs`** — đọc `config.ts` bằng regex `rieng:\s*"([A-Z_]+)"` trong khối `khoa`, gốc kho `new URL("../../../", import.meta.url)`, soát bốn nhà như E6, in một dòng mỗi nhà, `process.exit(1)` với `thieu nha: <nha>`; cờ `--pha` chép bốn tệp sang `mkdtemp`, xoá dòng khỏi `.env.example` của bản sao, chạy lại hàm soát trên bản sao, đòi mã 1 và thông điệp «thieu nha: .env.example» (không thì exit 3 «pha thu khong do»); chạy thường cũng tự chạy lượt phá trước khi soát thật.
- [ ] **Step 6: Chạy** hai bài + `node _acceptance/va-tro-ly-okr-sau-thu/rang/bien-bon-nha.mjs` → exit 0. Phá-thử: middleware bỏ ở nhánh riêng → «khoa rieng mat zdr». Commit `feat(agent): khoa Gateway rieng cho Tro ly OKR`.

### Task 4: `okr.aiChiTieu` trả nguồn khoá, thẻ Cài đặt hiện nguồn

`independent: false` (cần Task 2) · phục vụ E7, E8

**Files:**
- Modify: `apps/api/src/okr/okr.contracts.ts` (`aiChiTieuOutput.nguonKhoa`), `apps/api/src/okr/tro-ly.service.ts:166-205`
- Modify: `apps/app/app/(app)/[slug]/settings/okr/the-tro-ly-okr.tsx` (`ChiBaoSanSang`), `apps/app/lib/messages/tro-ly-okr.ts` (vi + en)
- Test: `apps/api/test/tro-ly-okr-nguon-khoa.spec.ts` (mới), `apps/app/test/tro-ly-okr-so-do.dom.tsx` `-t nguon-khoa`

**Interfaces:**
- Consumes: `ketQuaKiemGanNhat`, `nguonCuaKetQua`, `NGUON_KHOA`.
- Produces: `nguonKhoa: z.enum([...NGUON_KHOA, "chua-ro"]).nullable()` trong output; prop `nguonKhoa` của `ChiBaoSanSang`; messages `sanSangNguon: Record<"khoa-rieng"|"khoa-chung"|"oidc", string>`, `thieuKhoaMoTa: string`.

- [ ] **Step 1: Bài đỏ API** theo E7 (bảng viết trước năm outcome, gieo qua `gieoKiemSanSang`-tương-đương trong `apps/api/test`, gọi `okr.aiChiTieu` qua caller tRPC như các bài `tro-ly-okr-*.spec.ts` sẵn có).
- [ ] **Step 2: Cài API** — trong `Promise.all` thêm `ketQuaKiemGanNhat(this.db, now)`; trả `nguonKhoa: kq ? nguonCuaKetQua(kq.ketQua) : null`.
- [ ] **Step 3: Messages (vi)**

```ts
sanSangNguon: {
	"khoa-rieng": "Sẵn sàng · khoá riêng của Trợ lý OKR",
	"khoa-chung": "Sẵn sàng · khoá chung của tác tử",
	oidc: "Sẵn sàng · qua Vercel",
},
thieuKhoaMoTa:
	"Cắm OKR_AI_GATEWAY_API_KEY (hoặc AI_GATEWAY_API_KEY) vào dự án tác tử, hoặc bật OIDC của dự án đó trên Vercel. Tác tử tự kiểm lại trong khoảng 10 phút.",
```

(en: `"Ready · Trợ lý OKR's own key"`, `"Ready · the agent's shared key"`, `"Ready · through Vercel"`, và câu tiếng Anh tương ứng.)

- [ ] **Step 4: Cài thẻ** — `ChiBaoSanSang` nhận `nguonKhoa`; nhánh `sanSang.bat`: label `nguonKhoa && nguonKhoa !== "chua-ro" ? s.sanSangNguon[nguonKhoa] : s.sanSang`; nhánh lý do `chua-co-khoa-mo-hinh`: trả `<>` StatusIndicator cũ + `<FieldDescription>{s.thieuKhoaMoTa}</FieldDescription></>`. Truyền `nguonKhoa={so.data.nguonKhoa}` ở chỗ gọi (dòng ~482).
- [ ] **Step 5: Bài DOM `-t nguon-khoa`** theo E8 (id ST-caidat-* rút từ bảng UX-STATE-TABLE của design doc bằng regex `^\| (ST-caidat-[\w-]+) \|`, đường `new URL("../../../docs/superpowers/specs/2026-10-01-va-tro-ly-okr-sau-thu-design.md", import.meta.url)`).
- [ ] **Step 6: Chạy** `bun run test -- "cd apps/api && bun test test/tro-ly-okr-nguon-khoa.spec.ts"` và lệnh DOM → PASS; `bun run trpc:generate` nếu kho có bước sinh kiểu tRPC (xem `apps/api/package.json`); `bun run check-types`. Phá-thử theo E8 (b). Commit `feat(okr): the Tro ly OKR hien nguon khoa mo hinh`.

### Task 5: Bỏ Căn chỉnh chồng cùng nhánh

`independent: true` · phục vụ E9

**Files:**
- Modify: `apps/agent/agent/lib/okr/doc.ts` (`docMucTieu` select thêm `alignments`), `apps/agent/agent/lib/okr/goi-ngu-canh.ts` (`dichCanChinhCua`)
- Test: `apps/agent/test/tro-ly-okr-nhanh-can-chinh.integration.spec.ts` (mới)

**Interfaces:**
- Produces: `nhanDaCanChinh(mt: MucTieuDoc): Set<string>` (id Mục tiêu X đã góp vào trực tiếp hoặc qua KR).

- [ ] **Step 1: Bài đỏ** theo E9 (bộ mẫu `napBoOkrMau`; gieo `okrAlignment` A→KR của X, B→X; C không căn chỉnh; tool `nop_de_xuat` thật như `tro-ly-okr-nop.integration.spec.ts`).
- [ ] **Step 2: Chạy** `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tro-ly-okr-nhanh-can-chinh.integration.spec.ts"` → FAIL.
- [ ] **Step 3: Cài**

```ts
alignments: {
	select: {
		targetObjectiveId: true,
		targetKeyResult: { select: { objectiveId: true } },
	},
},
```

```ts
function nhanDaCanChinh(mt: MucTieuDoc): Set<string> {
	return new Set(
		mt.alignments.flatMap((a) =>
			[a.targetObjectiveId, a.targetKeyResult?.objectiveId].filter(
				(id): id is string => Boolean(id),
			),
		),
	);
}
```

`dichCanChinhCua`: `const bo = nhanDaCanChinh(mt); return ds.filter((d) => !bo.has(d.id)).flatMap(…)`.
- [ ] **Step 4: Chạy lại** → PASS; chạy `tro-ly-okr-nop.integration.spec.ts` (ca cũ giữ). Phá-thử: bỏ `filter` → «nhanh chong: X». Commit `fix(agent): Tro ly OKR khong de xuat Can chinh chong nhanh da can chinh`.

### Task 6: Luật «KR đọc như một việc» so theo dấu

`independent: true` · phục vụ E10

**Files:**
- Modify: `packages/validation/src/okr-kiem.ts`
- Test: `packages/validation/test/okr-kiem.spec.ts` `-t dong-tu`

**Interfaces:**
- Produces: `OKR_KIEM.dongTuViec` có dấu; `laViec(title)` (nội bộ) không đổi chữ ký của `kiemOkr`.

- [ ] **Step 1: Bài đỏ `-t dong-tu`** theo E10, thêm hai ca Review Focus: «Launch cổng đối tác mới» → `kr-la-viec`; «HỌP GIAO BAN ĐỦ 12 BUỔI» → `kr-la-viec`.
- [ ] **Step 2: Chạy** `cd packages/validation && bun test test/okr-kiem.spec.ts -t dong-tu` → FAIL ở «Hợp đồng…».
- [ ] **Step 3: Cài**

```ts
dongTuViec: [
	"gọi", "gửi", "tổ chức", "triển khai", "hoàn thành", "hoàn thiện",
	"xây dựng", "thực hiện", "làm", "viết", "họp", "tham gia", "đào tạo",
	"chạy", "ra mắt", "launch", "build", "call", "send", "hold", "run",
	"write", "complete", "implement", "organize", "create",
],
```

```ts
const chuThuong = (s: string) => s.normalize("NFC").toLocaleLowerCase("vi").trim();
const coDau = (s: string) => boDau(s) !== chuThuong(s).replace(/đ/g, "d");
const batDau = (t: string, v: string) => t === v || t.startsWith(`${v} `);

function laViec(title: string): boolean {
	if (coDau(title)) {
		const t = chuThuong(title);
		return OKR_KIEM.dongTuViec.some((v) => batDau(t, v));
	}
	const t = boDau(title);
	return OKR_KIEM.dongTuViec.some((v) => batDau(t, boDau(v)));
}
```

(`coDau`: câu có dấu thanh hay chữ đ nào thì là có dấu; so `boDau` với bản thường đã đổi đ→d để chỉ phát hiện dấu thật.)
- [ ] **Step 4: Chạy cả tệp** → PASS (ca cũ «viec không dấu», «viec tiếng Anh» giữ). Phá-thử: `laViec` luôn đi nhánh bỏ dấu → «trung mat: hop». Commit `fix(validation): luat KR la viec so theo dau, khong bat nham Hop dong`.

### Task 7: Một giọng trong hộp KR và hai vá chữ

`independent: true` · phục vụ E11, E12, E15

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx` (`CotGopY` prop `coGoiYTinh`, dòng đầu cột), `apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx` (truyền `coGoiYTinh={hoi.length > 0}`; `DongXuHuong` nhận `donVi`), `apps/app/lib/messages/okr-gop-y.ts` (vi + en)
- Test: `apps/app/test/tro-ly-okr-gop-y.dom.tsx` `-t hai-giong`, `-t chu-nho`

**Interfaces:**
- Produces: `CotGopY({ gopY, oDangSua, coGoiYTinh = false })`; messages `cot.rongCoGoiY`, `cot.daQuyetHet`, `xuHuong(moiTuan, uoc, donVi)`.

- [ ] **Step 1: Bài đỏ** theo E11, E12.
- [ ] **Step 2: Chạy** `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tro-ly-okr-gop-y.dom.tsx -t "hai-giong|chu-nho"` → FAIL.
- [ ] **Step 3: Messages (vi)**

```ts
rongCoGoiY: "Trợ lý OKR không có góp ý thêm ngoài gợi ý dưới ô.",
daQuyetHet: "Đã quyết hết đề xuất. Nhận là ghi ngay, kèm vết «theo đề xuất của Trợ lý OKR».",
```

```ts
xuHuong: (moiTuan: string, uoc: string, donVi: string) =>
	`Theo các lần cập nhật gần nhất (${moiTuan}/tuần), cuối kỳ ước khoảng ${[uoc, donVi.trim()].filter(Boolean).join(" ")}`,
```

(en tương ứng: `"Trợ lý OKR has nothing to add beyond the hint under the field."`, `"Every suggestion is decided. …"`.)
- [ ] **Step 4: Cài** — `CotGopY`: `EmptyDescription` = `gopY.laKr ? (coGoiYTinh ? m.cot.rongCoGoiY : m.cot.rongMoTaKr) : m.cot.rongMoTa`; dòng đầu cột `conCho.length === 0 ? m.cot.daQuyetHet : m.cot.soDong(String(conCho.length))`. `hop-thoai-kr.tsx`: `<CotGopY gopY={gopY} oDangSua={oDangSua} coGoiYTinh={hoi.length > 0} />`; `<DongXuHuong keyResultId={n.krId} donVi={donVi} />` và truyền vào `xuHuong`.
- [ ] **Step 5: Chạy lại** → PASS; chạy cả tệp DOM (ca cũ giữ); `bash -c` lệnh `vtl_san_thiet_ke` của config → exit 0. Phá-thử theo E11, E12. Commit `fix(okr): mot giong trong hop KR, xu huong co don vi`.

### Task 8: Lượt nhìn thật và tài liệu tác tử

`independent: false` (cần Task 1–7) · phục vụ E13, E14

**Files:**
- Create: `_acceptance/va-tro-ly-okr-sau-thu/rang/man-that.mjs`
- Modify: `docs/agent.md` (đoạn «Trợ lý OKR thêm năm loại» và mục chỗ rẽ của lượt), `apps/agent/turbo.json` đã sửa ở Task 3

- [ ] **Step 1: Script** — dựng theo `_acceptance/tro-ly-okr-de-xuat/rang/man-gop-y.mjs` và `phien-tro-ly.mjs` (nhập `canhCay`, `phienCookie`, `napBoMau`, `trpc`, `batTacTu` từ đó): bật góp ý toàn công ty qua `okr.setProgram`; chạy tác tử của phiên đo một nhịp để có hàng kiểm `san-sang-khoa-chung` (thiếu khoá chung → exit 2); Lan: mở Mục tiêu bằng bấm nút `data-mo-muc-tieu="mau-okr-mt-q4-kd-bac-1"`, menu KR đầu › Sửa; đọc `[role=dialog]` innerText; kiểm tên KR rồi các khẳng định E13; Hải Đăng: `/onehub/settings/okr`, đọc `[data-san-sang]`; chụp 1440 và 390 vào `.acceptance-runs/va-tro-ly-okr-sau-thu/man/`; đo `scrollWidth ≤ clientWidth`.
- [ ] **Step 2: Chạy** `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/va-tro-ly-okr-sau-thu/rang/man-that.mjs"` → exit 0; xem ảnh.
- [ ] **Step 3: `docs/agent.md`** — một đoạn: «Đường tới model: `lib/mo-hinh-khoa.ts` `nguonKhoaMoHinh` — `OKR_AI_GATEWAY_API_KEY` (chỉ Trợ lý OKR) → `AI_GATEWAY_API_KEY` → vé OIDC của Vercel qua `@vercel/oidc` (header `x-vercel-oidc-token` của lượt gọi). Không gọi model, không ném. Việc kiểm sẵn sàng ghi nguồn (`san-sang-khoa-rieng` · `san-sang-khoa-chung` · `san-sang-oidc`); nhịp điều phối xếp kiểm lại khi nguồn hiện tại khác kết quả đã ghi và quá 10 phút. Mục năng lực «AI model» hỏi hàm ở chế độ bỏ qua khoá riêng.» Và dòng chỗ rẽ liệt kê tệp của hãng lượt này chạm (`apps/agent/agent/lib/capabilities.ts`, `docs/environment.md`, `.env.example`, `turbo.json`).
- [ ] **Step 4: Bộ chứng năm lệnh** từ gốc: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` → xanh. Commit `docs(agent): duong toi mo hinh va khoa rieng cua Tro ly OKR`; set contract `status: implemented`.
