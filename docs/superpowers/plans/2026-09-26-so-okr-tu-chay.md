# Số OKR tự chảy — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** KR lấy số từ danh mục bảy chỉ số CRM, khoá API hoặc một ô Google Sheets; tác tử chụp số mỗi ngày thành lịch sử chỉ thêm; bấm vào số ra bản ghi đằng sau.

**Architecture:** Danh mục là dữ kiện Zod trong `@crm/validation/okr-chi-so`; một hàm dựng điều kiện Prisma trong `@crm/db/okr-chi-so` phục vụ cả đếm lẫn liệt kê. Hai bảng mới cuối `schema.prisma` (`OkrNguonKr` cấu hình, `OkrSoChup` lịch sử). Tác tử chụp trên nhịp dispatch có sẵn và đọc Google Sheets; API chỉ đọc, ghi cấu hình, ghi số qua khoá API, và ghi `AgentTask` cho việc đọc thử Sheets.

**Tech Stack:** Bun, NestJS + nestjs-trpc, Prisma 7 (Postgres), Zod, eve (tác tử), Next.js + `@crm/ui` (shadcn/ReUI), nuqs.

**Duyệt kế hoạch (Cổng 1.5):** Manh Phan — uỷ quyền phiên điều phối 2026-09-24 — mười bốn việc, mỗi việc một tác nhân con kèm người soát riêng.

**Spec:** `docs/superpowers/specs/2026-09-26-so-okr-tu-chay-design.md` · hợp đồng `_acceptance/so-okr-tu-chay/contract.md` · phép đo `_acceptance/so-okr-tu-chay/evals.yaml`.

## Global Constraints

- Không chú thích mã, ở tệp mới lẫn tệp sửa (`AGENTS.md`).
- Trí khôn ở `apps/agent`: `apps/api` không gọi `googleapis.com`, không ghi `okrSoChup` ngoài `ghiSoKr`, không chụp theo lịch.
- Một `.env` ở gốc; biến mới `GOOGLE_SHEETS_EMAIL`, `GOOGLE_SHEETS_KHOA` khai ở `.env.example` và `apps/api/src/config/env.validation.ts`; vắng biến thì mất nguồn Sheets, không ném.
- Parse ở biên bằng Zod trong `packages/validation/src/okr-*.ts`; không `Record<string, unknown>`.
- Hằng số chỉnh được ở `OKR_SO` (`packages/db/src/okr-so-config.ts`), đơn vị suy từ `MINUTE_MS`/`DAY_MS` một gốc, `as const`.
- Bảng mới là khối liền cuối `schema.prisma`; `migration` chỉ `CREATE TABLE`, `CREATE (UNIQUE) INDEX`, `ADD CONSTRAINT … FOREIGN KEY`; khoá ngoại `okrSoChup.keyResultId` là `ON DELETE RESTRICT`.
- Mỗi thủ tục ghi để một dòng `OkrTrail` qua `OkrService.vet`, không `Activity`; hai hành động mới `doi-nguon`, `ghi-so-api`.
- Chuỗi giao diện ở `apps/app/lib/messages/okr-so.ts` (vi, en khác nhau); chữ người nhập mang `translate="no"`.
- `/packages/ui` là nguồn giao diện duy nhất; `CopyValue` chuyển vào `packages/ui` trước khi dùng lần hai; không vẽ tay (bảng «Dấu hiệu vẽ tay» của `docs/design.md`).
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture: vật lành xanh, bản phá đỏ với thông điệp ghim (khuôn MEASURE-BIRTH của feature-loop).
- Lệnh chứng mỗi việc chạy với tiền tố PATH Node 24 (nền hạ tầng của lượt).
- S3 chỉ bắt đầu sau tin «vòng nợ đã gộp»: `git merge origin/onehub`, `bun install`, `cd packages/db && bun run db:generate`.

## Review Focus

1. KR của mục tiêu cá nhân: phạm vi mặc định là người đó, và người đó không có phòng ban chính vẫn đếm được ở phạm vi `nguoi` — Task 3 thêm ca «người e không phòng ban, phạm vi nguoi:e đếm đúng, phạm vi phong-ban không có e».
2. Địa chỉ gửi viết hoa (`An@OneHub.vn`) vẫn là email gửi ra của thành viên `an@onehub.vn` — Task 3 thêm một thư `fromEmail` viết hoa vào ô `email-gui-ra × nguoi`.
3. Nhịp chạy lúc 00:00–00:04 giờ VN: «hôm qua» là ngày VN, không phải ngày UTC — Task 7 thêm ca `now = 2026-10-19T17:02:00Z` (00:02 VN ngày 20) ghi `ngay = 2026-10-19`.
4. Ô Google Sheets trả lỗi công thức (`#REF!`, `#N/A`) hay số dạng chữ có dấu chấm nghìn (`"1.240"`) — Task 8 thêm ca `#REF!` → `khong-phai-so`, `"1.240"` → 1240 qua `docSoOkr`.
5. Phòng ban trong phạm vi bị lưu trữ sau khi đặt nguồn: chụp vẫn đếm theo người đang ở phòng ban đó, không ném — Task 7 thêm ca lưu trữ phòng ban P1 sau khi đặt nguồn, lượt chụp kế vẫn ghi dòng.

---

## File map

| Tệp | Việc |
|---|---|
| `packages/validation/src/okr-chi-so.ts` (mới) | Danh mục `CHI_SO_OKR`, `MA_CHI_SO`, khuôn `phamViChiSo`, `bacGhiDanh`, `dinhNghiaChiSoInput` |
| `packages/validation/src/okr-nguon.ts` (mới) | Khuôn `datNguonKrInput`, `okrNguonDong` (parse dòng `OkrNguonKr`), `oSheet`, `sheetIdTuUrl`, `lyDoDocSheet`, payload `okr-doc-sheet` |
| `packages/validation/src/okr-kr.ts` | `NGUON_KR` thêm `bang-tinh` |
| `packages/validation/src/okr-vet.ts` | `HANH_DONG_VET` thêm `doi-nguon`, `ghi-so-api` |
| `packages/db/prisma/schema.prisma` + `migrations/20260929010000_okr_so_tu_chay` | `OkrNguonKr`, `OkrSoChup`, quan hệ ngược trên `OkrKeyResult` |
| `packages/db/src/okr-so-config.ts` (mới) | `OKR_SO` |
| `packages/db/src/okr-chi-so.ts` (mới) | `khoangKy`, `dieuKienChiSo`, `demChiSo`, `banGhiChiSo` |
| `packages/db/src/agent-tasks.ts` | loại `okr-doc-sheet` vào `TASK_KINDS`, `DIRECT_KINDS`, `PRIORITY.okrSheet` |
| `apps/api/src/okr/okr-so.service.ts` (mới) | `chiSo`, `xemTruocChiSo`, `datNguonKr`, `lichSuSo`, `banGhiChiSo`, `ghiSoKr` |
| `apps/api/src/okr/okr-so.contracts.ts` (mới) | vào/ra của sáu thủ tục |
| `apps/api/src/okr/okr.router.ts`, `okr.module.ts` | nối sáu thủ tục |
| `apps/api/src/okr/okr.service.ts` | `updateKeyResult` và `removeKeyResult` từ chối thêm; `docMucTieu` thêm `nguon`, `soMay`, `doCanh` |
| `apps/api/src/okr/okr-cap-nhat.service.ts` | KR nguồn máy giữ số máy; trả `nguon`, `soMay` |
| `apps/api/src/okr/okr-config.ts` | câu ghim mới dưới `thongDiep.so` |
| `apps/api/src/agent/agent-trigger.service.ts` | `okrDocSheet(keyResultId)` |
| `apps/api/src/config/env.validation.ts`, `.env.example`, `docs/environment.md` | hai biến Sheets |
| `apps/agent/agent/lib/okr-chup.ts` (mới) | `chupSoOkr(now, phuThuoc)` |
| `apps/agent/agent/lib/okr-sheets.ts` (mới) | `kySheetsJwt`, `layTokenSheets`, `docOSheet`, `chayDocSheet` |
| `apps/agent/agent/schedules/dispatch.ts`, `lib/dispatch.ts`, `lib/capabilities.ts` | nối lượt chụp, làn trực tiếp, năng lực Sheets |
| `packages/ui/src/components/copy-value.tsx` (chuyển tới) | `CopyValue` dùng chữ của `packages/ui` |
| `apps/app/lib/messages/okr-so.ts` (mới) | chữ vi/en |
| `apps/app/app/(app)/[slug]/okr/nguon-so.tsx` (mới) | ô «Nguồn số» của hộp thoại KR |
| `apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx` | gắn `NguonSo` |
| `apps/app/app/(app)/[slug]/okr/bang-kr.tsx` | dấu nguồn, số bấm được, «tay · máy» |
| `apps/app/components/crm/record-sheet/so-kr-sheet.tsx` (mới), `record-stack.ts`, `record-sheet-host.tsx` | ngăn «Số của KR» |
| `apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/*` | ô số khoá / điền sẵn |
| `apps/app/lib/trpc/cache.ts` | sáu query mới vào `cache.okr` (trừ `chiSo`) |
| `_acceptance/so-okr-tu-chay/rang/*` | thước đo màn, soi mã, tin số, tỷ lệ, migration |
| `docs/api.md`, `docs/agent.md` | luật mới của OKR và lượt chụp |

---

### Task 1: Khuôn dữ liệu — danh mục chỉ số và nguồn

`independent: true` · phục vụ E1, E4 (khuôn), E16 (payload) · verify: `cd packages/validation && bun test test/okr-chi-so.spec.ts && bun run check-types`

**Files:**
- Create: `packages/validation/src/okr-chi-so.ts`, `packages/validation/src/okr-nguon.ts`, `packages/validation/test/okr-chi-so.spec.ts`
- Modify: `packages/validation/src/okr-kr.ts:14`, `packages/validation/src/okr-vet.ts:3-23`, `packages/validation/package.json` (exports `./okr-chi-so`, `./okr-nguon`)

**Interfaces:**
- Produces: `CHI_SO_OKR`, `MA_CHI_SO`, `type MaChiSo`, `maChiSo` (z.enum), `BAC_GHI_DANH`, `type BacGhiDanh`, `phamViChiSo`, `type PhamViChiSo`, `dinhNghiaChiSo` (`{chiSo, phamVi, bac?}` strict + refine bậc), `type DinhNghiaChiSo`; `datNguonKrInput` (hợp theo `loai`), `type DatNguonKrInput`, `okrNguonDong`, `parseOkrNguon(row)`, `oSheet` (regex A1), `sheetIdTuUrl(url): string | null`, `LY_DO_DOC_SHEET`, `docSheetPayload`, `parseDocSheetPayload`.

- [ ] **Step 1: Viết bài đỏ** — `packages/validation/test/okr-chi-so.spec.ts`

```ts
import { describe, expect, test } from "bun:test";
import { CHI_SO_OKR, dinhNghiaChiSo, MA_CHI_SO } from "../src/okr-chi-so";
import { datNguonKrInput, sheetIdTuUrl } from "../src/okr-nguon";

const BANG = {
	"thoa-thuan-chot-duoc": { donVi: "thoa-thuan", ngayKy: "closedAt", quyCong: "nguoi-phu-trach-thoa-thuan", banGhi: "deal" },
	"thoa-thuan-moi": { donVi: "thoa-thuan", ngayKy: "createdAt", quyCong: "nguoi-phu-trach-thoa-thuan", banGhi: "deal" },
	"goi-hen-duoc": { donVi: "cuoc-goi", ngayKy: "createdAt", quyCong: "nguoi-goi", banGhi: "contact" },
	"buoc-xong-dung-han": { donVi: "buoc", ngayKy: "completedAt", quyCong: "phong-ban-cua-buoc", banGhi: "plan" },
	"ghi-danh-dat-bac": { donVi: "ca-nhan", ngayKy: "ngay-dat-bac", quyCong: "nguoi-cam-trich", banGhi: "contact" },
	"form-thanh-ca-nhan": { donVi: "ca-nhan", ngayKy: "filedAt", quyCong: "nguoi-phu-trach-ca-nhan", banGhi: "contact" },
	"email-gui-ra": { donVi: "thu", ngayKy: "sentAt", quyCong: "nguoi-gui", banGhi: "email" },
} as const;
const PHAM_VI = ["toan-cong-ty", "bo-phan", "phong-ban", "nguoi"];

describe("danh-muc", () => {
	test("bảy mã, đúng bảng mục 2", () => {
		expect([...MA_CHI_SO]).toEqual(Object.keys(BANG));
		for (const ma of MA_CHI_SO) {
			const { phamVi, ...con } = CHI_SO_OKR[ma];
			expect({ ma, ...con }).toEqual({ ma, ...BANG[ma] });
			expect([...phamVi]).toEqual(PHAM_VI);
		}
	});
	test("đối chứng dương: bảy đầu vào hợp lệ", () => {
		for (const ma of MA_CHI_SO) {
			const vao = { chiSo: ma, phamVi: { kieu: "toan-cong-ty" }, ...(ma === "ghi-danh-dat-bac" ? { bac: "tai-khoan" } : {}) };
			expect(dinhNghiaChiSo.parse(vao)).toEqual(vao);
		}
	});
	const TU_CHOI: [string, unknown, string][] = [
		["mã lạ", { chiSo: "doanh-thu", phamVi: { kieu: "toan-cong-ty" } }, "Chỉ số không có trong danh mục"],
		["phạm vi lạ", { chiSo: "thoa-thuan-moi", phamVi: { kieu: "nhom" } }, "Phạm vi không hợp lệ"],
		["bộ phận thiếu id", { chiSo: "thoa-thuan-moi", phamVi: { kieu: "bo-phan" } }, "Phạm vi không hợp lệ"],
		["ghi danh thiếu bậc", { chiSo: "ghi-danh-dat-bac", phamVi: { kieu: "toan-cong-ty" } }, "Chọn bậc cho chỉ số ghi danh"],
		["bậc lạ", { chiSo: "ghi-danh-dat-bac", phamVi: { kieu: "toan-cong-ty" }, bac: "vip" }, "Bậc không hợp lệ"],
		["trường bieuThuc", { chiSo: "thoa-thuan-moi", phamVi: { kieu: "toan-cong-ty" }, bieuThuc: "1=1" }, "Trường không được phép"],
		["trường cot", { chiSo: "thoa-thuan-moi", phamVi: { kieu: "toan-cong-ty" }, cot: "amount" }, "Trường không được phép"],
	];
	for (const [ten, vao, cau] of TU_CHOI) {
		test(`từ chối: ${ten}`, () => {
			const r = dinhNghiaChiSo.safeParse(vao);
			expect(r.success).toBe(false);
			expect(r.error?.issues.map((i) => i.message).join(" | ")).toContain(cau);
		});
	}
	test("url Sheets", () => {
		expect(sheetIdTuUrl("https://docs.google.com/spreadsheets/d/1AbC_d-9/edit#gid=0")).toBe("1AbC_d-9");
		expect(sheetIdTuUrl("https://drive.google.com/file/d/1AbC")).toBeNull();
		expect(datNguonKrInput.safeParse({ keyResultId: "k", loai: "bang-tinh", url: "https://x.test/a", o: "Tổng!B2" }).success).toBe(false);
		expect(datNguonKrInput.safeParse({ keyResultId: "k", loai: "bang-tinh", url: "https://docs.google.com/spreadsheets/d/1Ab/edit", o: "B" }).success).toBe(false);
	});
});
```

- [ ] **Step 2: Chạy, thấy đỏ** — `cd packages/validation && bun test test/okr-chi-so.spec.ts` → FAIL «Cannot find module '../src/okr-chi-so'».

- [ ] **Step 3: Viết khuôn** — `packages/validation/src/okr-chi-so.ts`

```ts
import { z } from "zod";

export const PHAM_VI_CHI_SO = ["toan-cong-ty", "bo-phan", "phong-ban", "nguoi"] as const;
export type KieuPhamVi = (typeof PHAM_VI_CHI_SO)[number];

export const BAC_GHI_DANH = ["tai-khoan", "khoa-hoc", "hoat-dong", "giao-dich-dau"] as const;
export type BacGhiDanh = (typeof BAC_GHI_DANH)[number];

type DinhNghia = {
	donVi: "thoa-thuan" | "cuoc-goi" | "buoc" | "ca-nhan" | "thu";
	ngayKy: string;
	quyCong: string;
	banGhi: "deal" | "contact" | "plan" | "email";
	phamVi: readonly KieuPhamVi[];
};

export const CHI_SO_OKR = {
	"thoa-thuan-chot-duoc": { donVi: "thoa-thuan", ngayKy: "closedAt", quyCong: "nguoi-phu-trach-thoa-thuan", banGhi: "deal", phamVi: PHAM_VI_CHI_SO },
	"thoa-thuan-moi": { donVi: "thoa-thuan", ngayKy: "createdAt", quyCong: "nguoi-phu-trach-thoa-thuan", banGhi: "deal", phamVi: PHAM_VI_CHI_SO },
	"goi-hen-duoc": { donVi: "cuoc-goi", ngayKy: "createdAt", quyCong: "nguoi-goi", banGhi: "contact", phamVi: PHAM_VI_CHI_SO },
	"buoc-xong-dung-han": { donVi: "buoc", ngayKy: "completedAt", quyCong: "phong-ban-cua-buoc", banGhi: "plan", phamVi: PHAM_VI_CHI_SO },
	"ghi-danh-dat-bac": { donVi: "ca-nhan", ngayKy: "ngay-dat-bac", quyCong: "nguoi-cam-trich", banGhi: "contact", phamVi: PHAM_VI_CHI_SO },
	"form-thanh-ca-nhan": { donVi: "ca-nhan", ngayKy: "filedAt", quyCong: "nguoi-phu-trach-ca-nhan", banGhi: "contact", phamVi: PHAM_VI_CHI_SO },
	"email-gui-ra": { donVi: "thu", ngayKy: "sentAt", quyCong: "nguoi-gui", banGhi: "email", phamVi: PHAM_VI_CHI_SO },
} as const satisfies Record<string, DinhNghia>;

export type MaChiSo = keyof typeof CHI_SO_OKR;
export const MA_CHI_SO = Object.keys(CHI_SO_OKR) as [MaChiSo, ...MaChiSo[]];

export const maChiSo = z.enum(MA_CHI_SO, { error: "Chỉ số không có trong danh mục" });
export const bacGhiDanh = z.enum(BAC_GHI_DANH, { error: "Bậc không hợp lệ" });

const maDonVi = z.string().trim().min(1).max(120);
export const phamViChiSo = z.discriminatedUnion(
	"kieu",
	[
		z.object({ kieu: z.literal("toan-cong-ty") }).strict(),
		z.object({ kieu: z.literal("bo-phan"), id: maDonVi }).strict(),
		z.object({ kieu: z.literal("phong-ban"), id: maDonVi }).strict(),
		z.object({ kieu: z.literal("nguoi"), id: maDonVi }).strict(),
	],
	{ error: "Phạm vi không hợp lệ" },
);
export type PhamViChiSo = z.infer<typeof phamViChiSo>;

export const dinhNghiaChiSo = z
	.object({ chiSo: maChiSo, phamVi: phamViChiSo, bac: bacGhiDanh.optional() })
	.strict({ error: "Trường không được phép" })
	.refine((v) => (v.chiSo === "ghi-danh-dat-bac") === (v.bac !== undefined), {
		message: "Chọn bậc cho chỉ số ghi danh",
		path: ["bac"],
	});
export type DinhNghiaChiSo = z.infer<typeof dinhNghiaChiSo>;
```

Chạy trước khi dựa vào nó: xác nhận `z.enum(..., { error })` và `.strict({ error })` đúng cú pháp Zod đang cài (`bun pm ls zod`); Zod 3 dùng `errorMap`/`message` thay cho `error`. Theo bản đang cài mà viết.

`packages/validation/src/okr-nguon.ts`

```ts
import { z } from "zod";
import { bacGhiDanh, maChiSo, phamViChiSo } from "./okr-chi-so";

export const LOAI_NGUON_MAY = ["crm", "api", "bang-tinh"] as const;
export type LoaiNguonMay = (typeof LOAI_NGUON_MAY)[number];

const URL_SHEET = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/([A-Za-z0-9_-]{1,200})(?:[/?#].*)?$/;
export function sheetIdTuUrl(url: string): string | null {
	return URL_SHEET.exec(url.trim())?.[1] ?? null;
}
export const oSheet = z.string().trim().regex(/^(?:[^!]{1,100}!)?[A-Z]{1,3}[1-9]\d{0,6}$/u, "Ô phải có dạng A1 hoặc Trang!A1");

const ma = z.string().trim().min(1).max(120);
export const datNguonKrInput = z.discriminatedUnion("loai", [
	z.object({ keyResultId: ma, loai: z.literal("tay") }).strict(),
	z.object({ keyResultId: ma, loai: z.literal("crm"), chiSo: maChiSo, phamVi: phamViChiSo, bac: bacGhiDanh.optional() }).strict()
		.refine((v) => (v.chiSo === "ghi-danh-dat-bac") === (v.bac !== undefined), { message: "Chọn bậc cho chỉ số ghi danh", path: ["bac"] }),
	z.object({ keyResultId: ma, loai: z.literal("api") }).strict(),
	z.object({ keyResultId: ma, loai: z.literal("bang-tinh"), url: z.string().trim().max(500).refine((u) => sheetIdTuUrl(u) !== null, "Đường dẫn phải là một bảng tính Google (docs.google.com/spreadsheets)"), o: oSheet }).strict(),
]);
export type DatNguonKrInput = z.infer<typeof datNguonKrInput>;

export const LY_DO_DOC_SHEET = ["chua-chia-se", "khong-thay", "khong-phai-so", "o-trong", "google-loi", "tat"] as const;
export const lyDoDocSheet = z.enum(LY_DO_DOC_SHEET);
export type LyDoDocSheet = z.infer<typeof lyDoDocSheet>;

export const okrNguonDong = z.object({
	loai: z.enum(LOAI_NGUON_MAY),
	chiSo: maChiSo.nullable(),
	phamVi: phamViChiSo.nullable(),
	bac: bacGhiDanh.nullable(),
	sheetId: z.string().nullable(),
	sheetO: z.string().nullable(),
	docLoi: lyDoDocSheet.nullable(),
});
export type OkrNguonDong = z.infer<typeof okrNguonDong>;
export function parseOkrNguon(row: unknown): OkrNguonDong {
	const r = okrNguonDong.safeParse(row);
	if (!r.success) throw new Error(`Nguồn KR không đọc được: ${r.error.message}`);
	return r.data;
}

export const docSheetPayload = z.object({ keyResultId: ma }).strict();
export function parseDocSheetPayload(v: unknown) {
	const r = docSheetPayload.safeParse(v);
	if (!r.success) throw new Error(`Việc okr-doc-sheet không đọc được: ${r.error.message}`);
	return r.data;
}
```

`okr-kr.ts`: `export const NGUON_KR = ["tay", "crm", "api", "bang-tinh"] as const;` · `okr-vet.ts`: nối `"doi-nguon", "ghi-so-api"` cuối `HANH_DONG_VET`.

- [ ] **Step 4: Chạy lại, thấy xanh; phá thử** — bài xanh; chép `okr-chi-so.ts` vào tmpdir, bỏ `.strict(...)`, trỏ bài vào bản sao → ca «trường bieuThuc» đỏ in đầu vào lọt. Trả bản gốc.
- [ ] **Step 5: Commit** — `git add packages/validation && git commit -m "so-okr-tu-chay: khuôn danh mục chỉ số và nguồn KR"`

---

### Task 2: Hai bảng mới và migration chỉ thêm

`independent: true` · phục vụ E25 · verify: `cd packages/db && bun run db:generate && bun run check-types && node ../../_acceptance/so-okr-tu-chay/rang/migration-chi-them.mjs`

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (cuối tệp; thêm hai quan hệ ngược trong `OkrKeyResult`)
- Create: `packages/db/prisma/migrations/20260929010000_okr_so_tu_chay/migration.sql`, `_acceptance/so-okr-tu-chay/rang/migration-chi-them.mjs` (chép khuôn `_acceptance/dat-okr-trong-crm/rang/migration-chi-them.mjs`, đổi `VONG` và tên model)

**Interfaces:**
- Produces: `db.okrNguonKr`, `db.okrSoChup`; `OkrKeyResult.nguon?`, `OkrKeyResult.soChup[]`.

- [ ] **Step 1: Thêm model** (cuối `schema.prisma`, sau `OkrFollow`):

```prisma
model OkrNguonKr {
  id           String         @id @default(cuid())
  keyResultId  String         @unique
  keyResult    OkrKeyResult   @relation(fields: [keyResultId], references: [id], onDelete: Cascade)
  loai         String
  chiSo        String?
  phamVi       Json?
  bac          String?
  sheetId      String?
  sheetO       String?
  docLuc       DateTime?
  docGiaTri    Decimal?       @db.Decimal(18, 4)
  docLoi       String?
  thuLuc       DateTime?
  taoBoiUserId String
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  @@index([loai])
  @@map("okrNguonKr")
}

model OkrSoChup {
  id           String       @id @default(cuid())
  keyResultId  String
  keyResult    OkrKeyResult @relation(fields: [keyResultId], references: [id], onDelete: Restrict)
  ngay         DateTime     @db.Date
  giaTri       Decimal      @db.Decimal(18, 4)
  nguon        String
  chiSo        String?
  phamVi       Json?
  bac          String?
  tacGiaUserId String?
  chupLuc      DateTime     @default(now())

  @@index([keyResultId, ngay])
  @@map("okrSoChup")
}
```

Trong `model OkrKeyResult` thêm `nguonMay OkrNguonKr?` và `soChup OkrSoChup[]` (quan hệ ngược không sinh cột).

- [ ] **Step 2: Sinh migration** — `cd packages/db && bunx prisma migrate dev --create-only --name okr_so_tu_chay` rồi đổi tên thư mục thành `20260929010000_okr_so_tu_chay` và thêm cuối tệp SQL:

```sql
CREATE UNIQUE INDEX "okrSoChup_may_mot_ngay" ON "okrSoChup"("keyResultId", "ngay") WHERE ("nguon" IN ('crm', 'bang-tinh'));
```

Soát tệp: khoá ngoại `okrSoChup_keyResultId_fkey` phải là `ON DELETE RESTRICT`; không câu nào đụng bảng cũ.

- [ ] **Step 3: Thước** — `rang/migration-chi-them.mjs` suy gốc kho từ `import.meta.url`; đọc thư mục migration mới so với `git ls-tree origin/onehub`; tập câu cho phép; soát model `Okr*` liền nhau và cuối tệp; soát `ON DELETE RESTRICT` cho `okrSoChup`; dựng kho tạm (khuôn lượt 3), gieo KR/cập nhật tuần/cây/thoả thuận bằng lược đồ trước, chạy migration mới, đọc lại số dòng và `source = 'tay'`. `--chieu-do` dựng bốn tệp giả (ADD COLUMN okrKeyResult · DROP INDEX · model giữa tệp · CASCADE) → exit 1 với bốn thông điệp ghim.
- [ ] **Step 4: Chạy xanh, chạy `--chieu-do` đỏ đủ bốn thông điệp.**
- [ ] **Step 5: Commit.**

---

### Task 3: Đếm chỉ số — một điều kiện cho đếm và liệt kê

`independent: false` (cần Task 1, 2) · phục vụ E3, nền của E6, E9, E10, E20 · verify: `bun run test -- "cd apps/api && bun test test/okr-chi-so.spec.ts -t dem"`

**Files:**
- Create: `packages/db/src/okr-so-config.ts`, `packages/db/src/okr-chi-so.ts`, `apps/api/test/okr-so-san.ts`, `apps/api/test/okr-chi-so.spec.ts`
- Modify: `packages/db/package.json` (exports `./okr-chi-so`, `./okr-so-config`)

**Interfaces:**
- Consumes: `CHI_SO_OKR`, `DinhNghiaChiSo`, `PhamViChiSo` (Task 1); `ngayVN`, `dauNgayVN` (`@crm/db/onboarding-nhac`).
- Produces:
  - `OKR_SO` = `{ banGhi: { coTrang: 50, toiDaTrang: 200 }, chup: { toiDaMoiNhip: 500 }, sheets: { toiDaMoiNhip: 10, soLanThu: 2, tranMs: 5 * GIAY_MS, thuLaiMs: 30 * PHUT_MS, tokenGiayHieuLuc: 3600 } } as const`
  - `khoangKy(startsOn: Date, endsOn: Date, ngay: string): { tu: Date; den: Date }` — `tu` = đầu ngày VN của `startsOn`, `den` = đầu ngày VN của ngày sau `min(ngay, endsOn)`; nửa mở `[tu, den)`.
  - `demChiSo(db: Db | Tx, dn: DinhNghiaChiSo, k: { tu: Date; den: Date }): Promise<number>`
  - `chupKrCrm(db: Db, keyResultId: string, ngay: string): Promise<{ ghi: number; giaTri: number | null }>` — đọc KR + `okrNguonKr` + chu kỳ, `demChiSo` cho `khoangKy(…, ngay)`, rồi trong một giao dịch `okrSoChup.createMany({ skipDuplicates: true })` (chép `chiSo/phamVi/bac` vào dòng) và cập nhật `currentValue` khi `source === "crm"`. Tác tử (Task 7) và bài kiểm API (Task 4) gọi đúng hàm này — không bài nào chèn bảng chụp bằng tay.
  - `banGhiChiSo(db, dn, k, trang: { bo: number; lay: number }): Promise<{ tong: number; dong: BanGhiDong[] }>` với `BanGhiDong = { loai: "deal" | "contact" | "plan" | "email"; id: string; ten: string; ngay: string; moRef: { kind: "deal" | "contact" | "plan"; id: string } | null }`.

- [ ] **Step 1: Sàn gieo** `apps/api/test/okr-so-san.ts` — hàm `gieoSanChiSo()` tạo hai bộ phận B1 (P1, P2), B2 (P3); năm người `a,b` (P1), `c` (P2), `d` (P3), `e` (không phòng ban) qua `gieoThanhVien` + `db.orgPlacement.create`; cho mỗi chỉ số các bản ghi trong/ngoài kỳ theo bảng dưới; trả `{ id: {...}, dieuKien: {...} }` và `don()` xoá theo id (thứ tự: `okrSoChup` trước KR). Kỳ `2026-10-01` → `2026-12-31`. Mốc ngoài `2026-09-30T16:59:00Z` (23:59 VN ngày 30/09), mốc trong `2026-09-30T17:00:00Z` (00:00 VN ngày 01/10).
- [ ] **Step 2: Bài đỏ** `apps/api/test/okr-chi-so.spec.ts` (`describe("dem")`) — MA TRẬN 32 ô viết tay trong bài (ví dụ dòng đầu, các dòng kia cùng hình):

```ts
const MA_TRAN: [MaChiSo, PhamViKhoa, number, BacGhiDanh?][] = [
	["thoa-thuan-chot-duoc", "toan-cong-ty", 4],
	["thoa-thuan-chot-duoc", "bo-phan:B1", 3],
	["thoa-thuan-chot-duoc", "phong-ban:P1", 2],
	["thoa-thuan-chot-duoc", "nguoi:a", 1],
	["ghi-danh-dat-bac", "toan-cong-ty", 3, "tai-khoan"],
];
for (const [chiSo, pv, mong, bac] of MA_TRAN) {
	test(`${chiSo} × ${pv}${bac ? ` × ${bac}` : ""}`, async () => {
		const dn = { chiSo, phamVi: phamVi(pv), ...(bac ? { bac } : {}) };
		const k = khoangKy(KY.startsOn, KY.endsOn, "2026-12-31");
		const dem = await demChiSo(db, dn, k);
		const ds = await banGhiChiSo(db, dn, k, { bo: 0, lay: 500 });
		expect({ o: `${chiSo}×${pv}`, dem, dong: ds.dong.length, tong: ds.tong }).toEqual({ o: `${chiSo}×${pv}`, dem: mong, dong: mong, tong: mong });
	});
}
```

Thêm: tập id ở bảy ô `toan-cong-ty` so bằng tập gieo; `form-thanh-ca-nhan` của cá nhân không phụ trách có ở toàn công ty, vắng ở phạm vi khác; `bo-phan:B1 = P1 + P2` cho các chỉ số quy người; Review Focus 1 (người `e`) và 2 (thư `fromEmail` viết hoa).

- [ ] **Step 3: Chạy đỏ** — «Cannot find module '@crm/db/okr-chi-so'».
- [ ] **Step 4: Viết** `packages/db/src/okr-chi-so.ts` — khung:

```ts
import { CHI_SO_OKR, type DinhNghiaChiSo, type PhamViChiSo } from "@crm/validation/okr-chi-so";
import type { Db, Prisma } from "./index";
import { dauNgayVN, ngayVN } from "./onboarding-nhac";
import { OKR_SO } from "./okr-so-config";
import { WORKSPACE_ID } from "./workspace";

type Tx = Prisma.TransactionClient;
type Doc = Db | Tx;

const ngayCua = (d: Date) => d.toISOString().slice(0, 10);
const dauNgay = (ngay: string) => dauNgayVN(new Date(`${ngay}T05:00:00Z`));
const ngaySau = (ngay: string) => new Date(Date.parse(`${ngay}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);

export function khoangKy(startsOn: Date, endsOn: Date, ngay: string) {
	const cuoi = ngay < ngayCua(endsOn) ? ngay : ngayCua(endsOn);
	return { tu: dauNgay(ngayCua(startsOn)), den: dauNgay(ngaySau(cuoi)) };
}

async function nguoiTrong(db: Doc, pv: PhamViChiSo): Promise<string[] | null> {
	if (pv.kieu === "toan-cong-ty") return null;
	if (pv.kieu === "nguoi") return [pv.id];
	const phongBan = pv.kieu === "phong-ban" ? { primaryDepartmentId: pv.id } : { primaryDepartment: { divisionId: pv.id } };
	const rows = await db.orgPlacement.findMany({ where: phongBan, select: { userId: true } });
	return rows.map((r) => r.userId);
}
```

Rồi một hàm `dieuKienChiSo(db, dn, k)` trả hợp có nhãn theo bảng (không `Record<string, unknown>`):

```ts
type DieuKien =
	| { bang: "deal"; where: Prisma.DealWhereInput }
	| { bang: "campaignTouch"; where: Prisma.CampaignTouchWhereInput }
	| { bang: "onboardingStep"; where: Prisma.OnboardingStepWhereInput }
	| { bang: "onboardingEnrollment"; where: Prisma.OnboardingEnrollmentWhereInput }
	| { bang: "formSubmission"; where: Prisma.FormSubmissionWhereInput }
	| { bang: "emailMessage"; where: Prisma.EmailMessageWhereInput };
```

Nhánh theo `dn.chiSo` đúng bảng mục 2 của thiết kế:
- `thoa-thuan-chot-duoc`: `{ archivedAt: null, stage: "CLOSED_WON", closedAt: { gte: tu, lt: den }, ...(ng ? { ownerId: { in: ng } } : {}) }`
- `thoa-thuan-moi`: `{ archivedAt: null, createdAt: {…}, owner… }`
- `goi-hen-duoc`: `{ outcome: "MEETING", createdAt: {…}, ...(ng ? { createdById: { in: ng } } : {}) }`
- `buoc-xong-dung-han`: `completedAt: {…}` và `completedAt ≤ dueAt` — Prisma không so hai cột; lấy `{ completedAt: {…}, …phạm vi }` rồi lọc `completedAt <= dueAt` bằng câu SQL thô `SELECT id FROM "onboardingStep" WHERE "completedAt" <= "dueAt" AND "completedAt" >= $1 AND "completedAt" < $2` và đưa vào `id: { in }`. Phạm vi: `phong-ban` → `departmentId`, `bo-phan` → `department: { divisionId }`, `nguoi` → `assigneeId`.
- `ghi-danh-dat-bac`: cột theo bậc (`tai-khoan`→`accountAt`, `khoa-hoc`→`courseAt`, `hoat-dong`→`activeAt`, `giao-dich-dau`→`dealAt`), `contact: { archivedAt: null }`, phạm vi `plan: { ownerId: { in: ng } }`.
- `form-thanh-ca-nhan`: `{ contactId: { not: null }, filedAt: {…}, contact: { archivedAt: null, ...(ng ? { ownerId: { in: ng } } : {}) } }`.
- `email-gui-ra`: email thành viên (`db.member.findMany({ where: { organizationId: WORKSPACE_ID, ...(ng ? { userId: { in: ng } } : {}) }, select: { user: { select: { email: true } } } })`), rồi `{ sentAt: {…}, OR: emails.map((e) => ({ fromEmail: { equals: e, mode: "insensitive" } })) }`; danh sách rỗng → `{ id: { in: [] } }`.

`demChiSo` gọi `count` trên đúng bảng; `banGhiChiSo` gọi `count` + `findMany({ where, orderBy: [{ <ngày>: "desc" }, { id: "asc" }], skip: bo, take: min(lay, OKR_SO.banGhi.toiDaTrang) })` và map sang `BanGhiDong` (thoả thuận: `name`; cá nhân: tên cá nhân + tên chiến dịch cho `goi-hen-duoc`; kế hoạch: tên công ty + nhãn bước; thư: `subject ?? ""`, `moRef` = cá nhân của luồng thư nếu có).

- [ ] **Step 5: Chạy xanh; phá thử hai chiều** — bản sao bỏ `archivedAt: null` ở `thoa-thuan-moi` → ô `thoa-thuan-moi×toan-cong-ty` đỏ in `dem`; bản sao `khoangKy` dùng `new Date(\`${ngay}T00:00:00Z\`)` → ô mốc 00:00 VN đỏ. Trả bản gốc.
- [ ] **Step 6: Commit.**

---

### Task 4: API — danh mục, xem trước, đặt nguồn, lịch sử, bấm vào số

`independent: false` (cần Task 3) · phục vụ E4, E5, E9 (phần API), E10, E17 · verify: `bun run test -- "cd apps/api && bun test test/okr-nguon.spec.ts"` và `cd apps/api && bun run trpc:generate && bun run check-types`

**Files:**
- Create: `apps/api/src/okr/okr-so.service.ts`, `apps/api/src/okr/okr-so.contracts.ts`, `apps/api/test/okr-nguon.spec.ts`
- Modify: `apps/api/src/okr/okr.router.ts`, `okr.module.ts`, `okr.service.ts` (`updateKeyResult` 668–767, `removeKeyResult` 770–801, `docMucTieu` 1010–1102, `chonMucTieu`), `okr.contracts.ts` (`krOutput` thêm `doCanh`, `soMay`), `okr-config.ts` (`thongDiep.so`), `apps/api/src/agent/agent-trigger.service.ts`, `apps/api/src/config/env.validation.ts`, `.env.example`, `docs/environment.md`, `apps/api/src/generated/server.ts` (sinh lại)

**Interfaces:**
- Consumes: Task 1 khuôn, Task 3 `khoangKy/demChiSo/banGhiChiSo`, `OkrService.vet`, `OkrService.assertKyGhiDuoc`, `OkrAccessService.assertSuaKr/quyen/suaDuocDonVi`, `AgentTriggerService`.
- Produces (tRPC, tất cả dưới `PhamViOkrMiddleware`):
  - `okr.chiSo` Query → `{ chiSo: MaChiSo[]; bac: BacGhiDanh[]; sheetsBat: boolean; emailSheets: string | null }` — `GET /okr/metrics`
  - `okr.xemTruocChiSo` Query `{ chiSo, phamVi, bac?, cycleId }` → `{ giaTri: number; tu: string; den: string }` — `GET /okr/metrics/preview`
  - `okr.datNguonKr` Mutation `DatNguonKrInput` → `{ id: string; doCanh: boolean }` — `POST /okr/key-results/{keyResultId}/source`
  - `okr.lichSuSo` Query `{ keyResultId }` → `{ dong: { ngay: string; giaTri: number; nguon: NguonKr; tacGia: string | null }[] }` — `GET /okr/key-results/{keyResultId}/history`
  - `okr.banGhiChiSo` Query `{ keyResultId, ngay?: string, trang: number }` → `{ loai: "crm" | "api" | "bang-tinh" | "tay"; dinhNghia: DinhNghiaChiSo | null; tu: string | null; den: string | null; ngay: string | null; soDaChup: number | null; soTinhLai: number | null; lech: boolean; tong: number; dong: BanGhiDong[]; lanGhi: { ngay: string; giaTri: number; nguoi: string | null }[] }` — `GET /okr/key-results/{keyResultId}/records`
  - `AgentTriggerService.okrDocSheet(keyResultId: string): Promise<void>` — ghi `AgentTask { kind: "okr-doc-sheet", payload: { keyResultId }, priority: PRIORITY.okrSheet, budget: 0 }` rồi `poke()`.
  - `KrOutput` thêm `doCanh: boolean` và `soMay: { giaTri: number; ngay: string; nguon: LoaiNguonMay } | null`.

- [ ] **Step 1: Bài đỏ `dat-nguon`, `khoa-cong-bo`, `ban-ghi`, `sheets`** — trong `apps/api/test/okr-nguon.spec.ts`, dùng `okr-san.ts` (`goi`, `goiQuery`, `phien`) và `okr-so-san.ts`. Ca đúng như E4, E5, E10, E17: sau mỗi lời gọi đọc DB bằng `db.okrKeyResult.findUnique` + `db.okrNguonKr.findUnique` + đếm `db.okrTrail` theo `action: "doi-nguon"`; ma trận từ chối chín ca có câu ghim; ca `khoa-cong-bo`; ca `ban-ghi` tạo bản chụp bằng `chupKrCrm` của `@crm/db/okr-chi-so` (Task 3) với `ngay` lùi từng ngày; ca đổi phạm vi sau chụp; ma trận vai; ca `sheets` với bẫy `globalThis.fetch` ném khi URL chứa `googleapis.com`, spy `AgentTriggerService.poke`.
- [ ] **Step 2: Chạy đỏ** — thủ tục chưa có (404 tRPC).
- [ ] **Step 3: Câu ghim** — `okr-config.ts` thêm `thongDiep.so`:

```ts
so: {
	nguonDaKhoa: "Nguồn đã khoá khi công bố — thêm số đo cạnh cho KR nhập tay, hoặc đặt KR mới ở kỳ sau.",
	hienTaiCuaMay: "Số hiện tại của KR này do máy ghi — đổi nguồn khi mục tiêu còn nháp.",
	krDaCoSoChup: "KR đã có lịch sử số — sửa được, không xoá được.",
	donViKhongCo: "Đơn vị không có hoặc đã lưu trữ.",
	khongPhaiThanhVien: "Người này không phải thành viên của không gian làm việc.",
	sheetsTat: "Quản trị chưa cắm khoá Google Sheets.",
	khongNhanApi: "KR này không nhận số qua khoá API.",
	kyDaQua: "Chu kỳ đã qua ngày cuối — không ghi số nữa.",
	danhSachDoiTac: "Danh sách bản ghi thuộc dữ liệu đối tác — vai «chỉ OKR» chỉ xem được con số.",
},
```

- [ ] **Step 4: `OkrSoService.datNguonKr`** — khung:

```ts
async datNguonKr(userId: string, input: DatNguonKrInput) {
	const quyen = await this.quyenOkr.assertSuaKr(userId, input.keyResultId);
	if (input.loai === "bang-tinh" && !sheetsBat()) throw new BadRequestException(T.so.sheetsTat);
	return this.db.$transaction(async (tx) => {
		await this.okr.assertKyGhiDuoc(tx, quyen.objective.cycleId);
		await tx.$queryRaw`SELECT id FROM "okrKeyResult" WHERE id = ${input.keyResultId} FOR UPDATE`;
		const kr = await tx.okrKeyResult.findUniqueOrThrow({ where: { id: input.keyResultId }, include: { nguonMay: true, objective: { select: { status: true } } } });
		const congBo = kr.objective.status !== "nhap";
		const cu = kr.nguonMay ? parseOkrNguon(kr.nguonMay) : null;
		if (congBo && kr.source !== "tay") throw new BadRequestException(T.so.nguonDaKhoa);
		if (congBo && input.loai === "tay" && cu === null) return { id: kr.id, doCanh: false };
		if (input.loai === "crm") await this.kiemPhamVi(tx, input.phamVi);
		const cauHinh = input.loai === "tay" ? null : cauHinhTu(input);
		if (cauHinh && cu && khongDoi(cu, cauHinh)) {
			if (input.loai === "bang-tinh") await this.trigger.okrDocSheet(kr.id);
			return { id: kr.id, doCanh: congBo };
		}
		if (cauHinh === null) await tx.okrNguonKr.deleteMany({ where: { keyResultId: kr.id } });
		else await tx.okrNguonKr.upsert({ where: { keyResultId: kr.id }, create: { keyResultId: kr.id, taoBoiUserId: userId, ...cauHinh }, update: { ...cauHinh, docLuc: null, docGiaTri: null, docLoi: null, thuLuc: null } });
		if (!congBo) await tx.okrKeyResult.update({ where: { id: kr.id }, data: { source: input.loai } });
		await this.okr.vet(tx, userId, "doi-nguon", { objectiveId: kr.objectiveId, keyResultId: kr.id }, vetNguon(kr.source, cu), vetNguon(congBo ? "tay" : input.loai, cauHinh), congBo ? "đo cạnh" : null);
		if (input.loai === "bang-tinh") await this.trigger.okrDocSheet(kr.id);
		return { id: kr.id, doCanh: congBo };
	});
}
```

`kiemPhamVi`: `bo-phan` → `db.division.findFirst({ id, archivedAt: null })`; `phong-ban` → `db.department.findFirst({ id, archivedAt: null })`; `nguoi` → `assertThanhVien`. `sheetsBat()` đọc `process.env.GOOGLE_SHEETS_EMAIL?.trim()` và `GOOGLE_SHEETS_KHOA?.trim()`. `okrDocSheet` gọi ngoài giao dịch (sau commit) — chuyển hai lời gọi ra sau `$transaction` bằng cờ trả về.

- [ ] **Step 5: `updateKeyResult`, `removeKeyResult`** — trong `updateKeyResult` sau khi đọc `kr`: `if (input.currentValue !== undefined && input.currentValue !== soKr(kr.currentValue) && kr.source !== "tay") throw new BadRequestException(T.so.hienTaiCuaMay);`. Trong `removeKeyResult` trước `delete`: `if ((await tx.okrSoChup.count({ where: { keyResultId: kr.id } })) > 0) throw new BadRequestException(T.so.krDaCoSoChup);` và xoá `okrNguonKr` trước KR.
- [ ] **Step 6: `docMucTieu`** — `chonMucTieu.keyResults.include` thêm `nguonMay: { select: { loai: true } }` và `soChup: { orderBy: [{ ngay: "desc" }, { chupLuc: "desc" }], take: 1 }`; `KrOutput` thêm `doCanh: k.source === "tay" && k.nguonMay !== null` và `soMay` từ `soChup[0]`. Chạy lại `okr-toan-canh-hieu-nang.spec.ts` — số câu truy vấn ở 5 và 50 đơn vị vẫn bằng nhau.
- [ ] **Step 7: `lichSuSo`, `banGhiChiSo`, `xemTruocChiSo`, `chiSo`** — `banGhiChiSo`: vai `okr` (đọc `ctx.user.role` qua `this.quyenOkr.vai(userId)`) → `ForbiddenException(T.so.danhSachDoiTac)`; chọn dòng chụp của `ngay` (hoặc mới nhất); định nghĩa lấy từ dòng chụp (`chiSo`, `phamVi`, `bac`), không có dòng thì từ `okrNguonKr`; `khoangKy(cycle.startsOn, cycle.endsOn, ngay)`; `soTinhLai = demChiSo`, `lech = soDaChup !== null && soDaChup !== soTinhLai`; trang = `banGhiChiSo(..., { bo: (trang - 1) * coTrang, lay: coTrang })`; nguồn `api` → `lanGhi` từ `okrSoChup` mới trước, `dong: []`.
- [ ] **Step 8: Router + sinh mã** — sáu phương thức (năm ở task này, `ghiSoKr` ở Task 5) theo khuôn `@Query/@Mutation({ input, output, meta: restMeta(...) })`; `cd apps/api && bun run trpc:generate`.
- [ ] **Step 9: Biến môi trường** — `env.validation.ts` thêm hai trường tuỳ chọn cạnh `GOOGLE_CLIENT_*`; `.env.example` thêm:

```
# Google Sheets — tài khoản dịch vụ chỉ đọc cho KR nguồn Google Sheets (lượt 6 OKR).
# Email của tài khoản dịch vụ; người dùng chia sẻ bảng tính cho địa chỉ này. Vắng thì nguồn Sheets ẩn.
GOOGLE_SHEETS_EMAIL=""
# Khoá riêng PEM của tài khoản đó (\n viết thành \\n). API chỉ đọc email; tác tử đọc cả hai.
GOOGLE_SHEETS_KHOA=""
```

- [ ] **Step 10: Chạy xanh; phá thử** — bản sao bỏ kiểm tra đơn vị lưu trữ → ca phòng ban lưu trữ đỏ; bản sao `datNguonKr` không kiểm `congBo` → ca C→api đỏ; bản sao `banGhiChiSo` đọc `okrNguonKr` hiện tại → ca đổi phạm vi đỏ.
- [ ] **Step 11: Commit.**

---

### Task 5: Ghi số qua khoá API

`independent: false` (cần Task 4) · phục vụ E15 · verify: `bun run test -- "cd apps/api && bun test test/okr-khoa-api.spec.ts"`

**Files:**
- Create: `apps/api/test/okr-khoa-api.spec.ts`
- Modify: `apps/api/src/okr/okr-so.service.ts` (`ghiSoKr`), `okr-so.contracts.ts`, `okr.router.ts`

**Interfaces:**
- Produces: `okr.ghiSoKr` Mutation `{ id: string; giaTri: number; ghiChu?: string }` → `{ id: string; ngay: string }` — `POST /okr/key-results/{id}/value`.

- [ ] **Step 1: Bài đỏ** — dựng app Nest thật (khuôn `vai-chi-okr.spec.ts` ca `ma-tran-khoa-rest`), tạo khoá qua `auth.api.createApiKey` cho từng người, gọi `request(app.getHttpServer()).post(\`/rest/okr/key-results/${id}/value\`).set("x-api-key", khoa).send({ giaTri })`; ma trận chín ca của E15 viết trước, mỗi ca khẳng định `(status, câu ghim, Δ okrSoChup, Δ okrTrail ghi-so-api, currentValue)`.
- [ ] **Step 2: Chạy đỏ** — 404.
- [ ] **Step 3: Viết `ghiSoKr`**:

```ts
async ghiSoKr(userId: string, input: GhiSoKrInput, now = new Date()) {
	const quyen = await this.quyenOkr.assertSuaKr(userId, input.id);
	return this.db.$transaction(async (tx) => {
		await this.okr.assertKyGhiDuoc(tx, quyen.objective.cycleId);
		const kr = await tx.okrKeyResult.findUniqueOrThrow({ where: { id: input.id }, include: { nguonMay: true, objective: { select: { cycle: { select: { endsOn: true } } } } } });
		if (kr.nguonMay?.loai !== "api") throw new BadRequestException(T.so.khongNhanApi);
		const hom = ngayVN(now);
		if (hom > kr.objective.cycle.endsOn.toISOString().slice(0, 10)) throw new BadRequestException(T.so.kyDaQua);
		const loi = kiemGiaTriTheoKieu(kieuKr.parse(kr.kind), input.giaTri);
		if (loi) throw new BadRequestException(T.capNhat.giaTri[loi]);
		await tx.okrSoChup.create({ data: { keyResultId: kr.id, ngay: new Date(`${hom}T00:00:00Z`), giaTri: input.giaTri, nguon: "api", tacGiaUserId: userId } });
		if (kr.source === "api") await tx.okrKeyResult.update({ where: { id: kr.id }, data: { currentValue: input.giaTri } });
		await this.okr.vet(tx, userId, "ghi-so-api", { objectiveId: kr.objectiveId, keyResultId: kr.id }, { currentValue: Number(kr.currentValue) }, { currentValue: input.giaTri }, input.ghiChu ?? null);
		return { id: kr.id, ngay: hom };
	});
}
```

- [ ] **Step 4: Chạy xanh; phá thử** — bản sao bỏ `assertSuaKr` → ca 403 đỏ in mã 200.
- [ ] **Step 5: Commit.**

---

### Task 6: Cập nhật tuần với KR nguồn máy và KR đo cạnh

`independent: false` (cần Task 4) · phục vụ E18 · verify: `bun run test -- "cd apps/api && bun test test/okr-cap-nhat.spec.ts -t kr-may"` và toàn tệp `okr-cap-nhat.spec.ts` vẫn xanh

**Files:**
- Modify: `apps/api/src/okr/okr-cap-nhat.service.ts:38-176`, `apps/api/src/okr/okr.contracts.ts` (`capNhatTuanOutput.items` thêm `nguon`, `doCanh`, `soMay`), `apps/api/test/okr-cap-nhat.spec.ts` (thêm `describe("kr-may")`)

- [ ] **Step 1: Bài đỏ `kr-may`** — MA TRẬN viết trước của E18 (M crm, A api, C đo cạnh, T tay).
- [ ] **Step 2: Chạy đỏ.**
- [ ] **Step 3: Sửa** — `capNhatTuan` include `nguonMay: { select: { loai: true } }`, `soChup: { orderBy: [{ ngay: "desc" }, { chupLuc: "desc" }], take: 1 }`; item thêm `nguon`, `doCanh`, `soMay`. `guiCapNhat`: trong vòng ghi, `const may = kr.source !== "tay"; const giaTri = may ? soDb(kr.currentValue) : m.value;` — `okrCheckIn.value = giaTri`; `okrKeyResult.update` chỉ khi `!may`; vết `cap-nhat-tuan` ghi `giaTri`. Bỏ qua `kiemGiaTriTheoKieu` cho KR máy (số máy đã hợp lệ). Include `source` trong truy vấn `krs`.
- [ ] **Step 4: Chạy xanh cả tệp; phá thử** — bản sao chỉ rẽ khi `source === "crm"` → A đỏ in 99.
- [ ] **Step 5: Commit.**

---

### Task 7: Tác tử — chụp mỗi ngày trên nhịp dispatch

`independent: false` (cần Task 3) · phục vụ E6, E7, E9 · verify: `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/okr-chup.integration.spec.ts test/okr-chup-hieu-nang.integration.spec.ts"`

**Files:**
- Create: `apps/agent/agent/lib/okr-chup.ts`, `apps/agent/test/okr-chup.integration.spec.ts`, `apps/agent/test/okr-chup-hieu-nang.integration.spec.ts`
- Modify: `apps/agent/agent/schedules/dispatch.ts` (thêm `chupSoOkr()` vào `Promise.all` cạnh `lenLichNhac()`), `apps/agent/test/support/okr-gieo.ts` (hàm `gieoNguonKr`)

**Interfaces:**
- Consumes: `khoangKy`, `demChiSo`, `OKR_SO` (Task 3); `parseOkrNguon` (Task 1); `ngayVN` (`@crm/db/onboarding-nhac`).
- Produces: `chupSoOkr(now?: Date, phuThuoc?: { docO?: DocO }): Promise<{ ghi: number; boQua: number; conLai: number }>`; `type DocO = (sheetId: string, o: string) => Promise<{ giaTri: number } | { loi: LyDoDocSheet }>` (Task 8 cung cấp bản thật).

- [ ] **Step 1: Bài đỏ `chup-moi-ngay`** (E6), `lich-su-khong-doi` (E9) và Review Focus 3, 5 — `setSystemTime(new Date("2026-10-19T17:05:00Z"))`; gieo sáu KR bằng `gieoChuKy/gieoMucTieu/gieoKr` của `support/okr-gieo.ts` + `gieoNguonKr`; `docO` giả trả `{ giaTri: 1240 }`.
- [ ] **Step 2: Chạy đỏ.**
- [ ] **Step 3: Viết `okr-chup.ts`**:

```ts
export async function chupSoOkr(now = new Date(), phuThuoc: { docO?: DocO } = {}) {
	const ngay = ngayVN(new Date(now.getTime() - DAY_MS));
	const ngayDb = new Date(`${ngay}T00:00:00Z`);
	const can = await db.okrKeyResult.findMany({
		where: {
			nguonMay: { loai: { in: ["crm", "bang-tinh"] } },
			objective: { status: { not: "da-bo" }, cycle: { phase: { in: [...PHA_GHI_DUOC] }, startsOn: { lte: ngayDb }, endsOn: { gte: ngayDb } } },
			soChup: { none: { ngay: ngayDb, nguon: { in: ["crm", "bang-tinh"] } } },
		},
		include: { nguonMay: true, objective: { select: { cycle: { select: { startsOn: true, endsOn: true } } } } },
		take: OKR_SO.chup.toiDaMoiNhip,
		orderBy: { id: "asc" },
	});
	if (can.length === 0) return { ghi: 0, boQua: 0, conLai: 0 };
	const docO = phuThuoc.docO ?? docOSheetThat();
	let ghi = 0; let boQua = 0; let lanDoc = 0;
	for (const kr of can) {
		const nguon = parseOkrNguon(kr.nguonMay);
		if (nguon.loai === "crm") { ghi += (await chupKrCrm(db, kr.id, ngay)).ghi; continue; }
		const giaTri = await docBangTinh(kr, nguon, now, docO, () => lanDoc++ < OKR_SO.sheets.toiDaMoiNhip);
		if (giaTri === null) { boQua++; continue; }
		const r = await db.$transaction(async (tx) => {
			const { count } = await tx.okrSoChup.createMany({ data: [{ keyResultId: kr.id, ngay: ngayDb, giaTri, nguon: nguon.loai, chiSo: nguon.chiSo, phamVi: nguon.phamVi ?? undefined, bac: nguon.bac }], skipDuplicates: true });
			if (count > 0 && kr.source === nguon.loai) await tx.okrKeyResult.update({ where: { id: kr.id }, data: { currentValue: giaTri } });
			return count;
		});
		ghi += r;
	}
	return { ghi, boQua, conLai: can.length === OKR_SO.chup.toiDaMoiNhip ? 1 : 0 };
}
```

`docBangTinh`: nếu `thuLuc` còn trong `OKR_SO.sheets.thuLaiMs` hoặc hết lượt đọc của nhịp → `null`; gọi `docO`; lỗi → ghi `docLoi`, `thuLuc = now` → `null`; thành công → ghi `docLuc/docGiaTri`, xoá `docLoi` → số. `docOSheetThat()` trả hàm đọc thật khi `sheetsBat()`, không thì hàm luôn trả `{ loi: "tat" }` mà không gọi mạng. Mọi `console.log` chỉ ghi số đếm, không giá trị ô hay sheetId.

- [ ] **Step 4: Bài hiệu năng** `okr-chup-hieu-nang.integration.spec.ts` — phần (a) và (b) của E7 với con số viết sẵn 20 000 ms và 60 000 ms; đếm câu qua `db.$on("query")` hoặc bộ đếm có sẵn của `okr-toan-canh-hieu-nang.spec.ts` (chép cách đếm của tệp đó).
- [ ] **Step 5: Nối nhịp** — `schedules/dispatch.ts` import `chupSoOkr` và thêm vào `Promise.all`; bài `chup-moi-ngay` có ca đọc nguồn `schedules/dispatch.ts` bằng `Bun.file` và khẳng định có `chupSoOkr()` trong mảng `Promise.all`.
- [ ] **Step 6: Chạy xanh; phá thử** — bỏ `skipDuplicates` và bộ lọc `soChup: { none }` → lượt 2 đỏ in 6 dòng; cập nhật `currentValue` cho mọi KR có nguồn → K2 đỏ.
- [ ] **Step 7: Commit.**

---

### Task 8: Tác tử — đọc Google Sheets bằng tài khoản dịch vụ

`independent: false` (cần Task 7) · phục vụ E16 · verify: `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/okr-sheets.spec.ts && bun test test/okr-chup.integration.spec.ts -t sheets"`

**Files:**
- Create: `apps/agent/agent/lib/okr-sheets.ts`, `apps/agent/test/okr-sheets.spec.ts`
- Modify: `.env.example` (hai biến ghi đè host `OKR_SHEETS_TOKEN_URL`, `OKR_SHEETS_API_URL` — chỉ đọc khi `NODE_ENV !== "production"`, cho phiên đo trỏ Google giả; ghi chú đúng điều đó), `packages/db/src/agent-tasks.ts` (`TASK_KINDS`, `DIRECT_KINDS` thêm `"okr-doc-sheet"`, `PRIORITY.okrSheet: 400`), `apps/agent/agent/lib/dispatch.ts` (`handleDirect` gọi `chayDocSheet(task)`), `apps/agent/agent/lib/capabilities.ts` (năng lực `GOOGLE_SHEETS_KHOA`), `apps/agent/agent/lib/okr-chup.ts` (`docOSheetThat`)

**Interfaces:**
- Produces: `kySheetsJwt(email: string, khoaPem: string, nowS: number): Promise<string>`; `layTokenSheets(f: typeof fetch, now: Date): Promise<string>`; `docOSheet(f: typeof fetch): DocO`; `chayDocSheet(task: LeasedTask, f?: typeof fetch): Promise<void>`.

- [ ] **Step 1: Bài đỏ** — (a) sinh cặp khoá `crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1,0,1]), hash: "SHA-256" }, true, ["sign","verify"])`, xuất PKCS8 thành PEM, ký, tách JWT, `crypto.subtle.verify` bằng khoá công khai, đọc claim; (b)–(e) và Review Focus 4 như E16, với `fetch` giả trả token rồi `values`.
- [ ] **Step 2: Chạy đỏ.**
- [ ] **Step 3: Viết `okr-sheets.ts`**:

```ts
const b64u = (b: ArrayBuffer | Uint8Array | string) => Buffer.from(typeof b === "string" ? b : new Uint8Array(b)).toString("base64url");

export async function kySheetsJwt(email: string, khoaPem: string, nowS: number) {
	const der = Buffer.from(khoaPem.replace(/\\n/g, "\n").replace(/-----[^-]+-----/g, "").replace(/\s/g, ""), "base64");
	const khoa = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
	const dau = b64u(JSON.stringify({ alg: "RS256", typ: "JWT" }));
	const than = b64u(JSON.stringify({ iss: email, scope: "https://www.googleapis.com/auth/spreadsheets.readonly", aud: "https://oauth2.googleapis.com/token", iat: nowS, exp: nowS + OKR_SO.sheets.tokenGiayHieuLuc }));
	const ky = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", khoa, Buffer.from(`${dau}.${than}`));
	return `${dau}.${than}.${b64u(ky)}`;
}
```

`layTokenSheets` POST `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=<jwt>` tới `https://oauth2.googleapis.com/token`, parse `{ access_token }` bằng Zod. `docOSheet` GET `https://sheets.googleapis.com/v4/spreadsheets/<id>/values/<encodeURIComponent(o)>?valueRenderOption=UNFORMATTED_VALUE` với `AbortSignal.timeout(OKR_SO.sheets.tranMs)`, thử `OKR_SO.sheets.soLanThu` lần; 403 → `chua-chia-se`, 404 → `khong-thay`, khác 2xx → `google-loi`; thân parse `{ values?: unknown[][] }`; ô vắng/rỗng → `o-trong`; số → số; chuỗi → `docSoOkr`, `null` → `khong-phai-so`. Gọi qua `fetch` được tiêm (mặc định `globalThis.fetch`; hai host cố định là Google nên không qua `safe-fetch`, ghi lý do này vào `docs/agent.md`, không vào mã). `chayDocSheet` đọc payload bằng `parseDocSheetPayload`, đọc ô, ghi `docLuc/docGiaTri/docLoi`, `completeTask(task.id, "đọc ô: được" | "đọc ô: <lý do>")` — outcome không chứa giá trị ô.

- [ ] **Step 4: Chạy xanh; phá thử** — HS256 → (a) đỏ in `alg`; ghi lịch sử khi đọc thử → (b) đỏ in số dòng.
- [ ] **Step 5: Commit.**

---

### Task 9: Phạm vi dữ liệu của bốn vai

`independent: false` (cần Task 4, 5) · phục vụ E22 · verify: `bun run test -- "cd apps/api && bun test test/vai-chi-okr.spec.ts"`

**Files:**
- Modify: `apps/api/test/vai-chi-okr.spec.ts` (đầu vào hợp lệ cho sáu thủ tục mới trong bảng đầu vào của ma trận OKR; thêm `describe("pham-vi-so")`)

- [ ] **Step 1: Bài đỏ `pham-vi-so`** — vai `okr` gọi `chiSo`, `xemTruocChiSo`, `datNguonKr` (KR của mình), `lichSuSo`, `ghiSoKr` được; `banGhiChiSo` → 403 câu `T.so.danhSachDoiTac`; ba vai kia gọi được sáu thủ tục.
- [ ] **Step 2: Chạy; sửa danh sách ghim của ma trận cho khớp sáu thủ tục mới; chạy lại cả tệp xanh.**
- [ ] **Step 3: Phá thử** — bỏ kiểm vai trong `banGhiChiSo` → ca vai okr đỏ in số dòng.
- [ ] **Step 4: Commit.**

---

### Task 10: Nền giao diện — `CopyValue` vào `packages/ui`, chữ vi/en

`independent: true` · phục vụ E2, một phần E23 · verify: `cd apps/app && bun test test/okr-so-chu.spec.ts test/messages-guard.spec.ts && cd ../../packages/ui && bun test --preload ./test/setup-dom.ts ./test/render-diff.spec.tsx && cd ../.. && bun run check-types`

**Files:**
- Create: `packages/ui/src/components/copy-value.tsx`, `apps/app/lib/messages/okr-so.ts`, `apps/app/test/okr-so-chu.spec.ts`
- Modify: `packages/ui/src/lib/messages.ts` (khối `chep: { xong, hong }` vi/en), ba chỗ gọi ở `settings/api-keys/created-api-key-dialog.tsx`, `settings/sso/add-sso-provider-sheet.tsx`, `settings/sso/sso-table.tsx`
- Delete: `apps/app/app/(app)/[slug]/settings/copy-value.tsx`

- [ ] **Step 1: Bài đỏ `okr-so-chu.spec.ts`** — rút `MA_CHI_SO` và `BAC_GHI_DANH`; mỗi mã có `nhan` và `dinhNghia` ở `vi` và `en`, `vi !== en`, `vi` có ký tự có dấu (`/[à-ỹ]/i`); đủ khoá `nguon.{tay,crm,api,bangTinh}`, `trangThai.*` của bảng trạng thái thiết kế.
- [ ] **Step 2: Viết `okr-so.ts`** theo khuôn `okr-toan-canh.ts` (`okrSoMessages(locale)`), mọi chữ của 24 trạng thái trong đặc tả UX.
- [ ] **Step 3: Chuyển `CopyValue`** — bản `packages/ui` nhận `value`, `label`, đọc chữ bằng `useMessages()` của `packages/ui`; ba chỗ gọi đổi import sang `@crm/ui/components/copy-value`; xoá tệp cũ; thêm ca `CopyValue` vào `CA` của `render-diff.spec.tsx`.
- [ ] **Step 4: Chạy xanh; phá thử** — bỏ nhãn `en` của `email-gui-ra` → bài đỏ in mã thiếu.
- [ ] **Step 5: Commit.**

---

### Task 11: Hộp thoại KR — ô «Nguồn số»

`independent: false` (cần Task 4, 10) · phục vụ E13, E14 · verify: `cd apps/app && bun run check-types && bun test test/okr-lam-moi.spec.ts` rồi thước màn E13 (Task 14)

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/nguon-so.tsx`
- Modify: `apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx`, `apps/app/lib/trpc/cache.ts`

**Interfaces:**
- Consumes: `okr.chiSo`, `okr.xemTruocChiSo`, `okr.datNguonKr`, `okr.objective` (`krOutput.source/doCanh/soMay`), `CopyValue`.
- Produces: `NguonSo({ kr, objective, khoa }: NguonSoProps)` — client component nhận dữ liệu đã có, không tự suy quyền.

- [ ] **Step 1:** `nguon-so.tsx` — `Field` + `ToggleGroup type="single"` bốn nút (Sheets chỉ khi `chiSo.sheetsBat`, không thì `FieldDescription` «Quản trị chưa cắm khoá Google Sheets»); nhánh CRM: `Select` chỉ số (nhãn từ `okrSoMessages`), `Select` kiểu phạm vi + `Combobox` đơn vị/người (danh sách từ `org.tree` và `okr.thanhVien` do hộp thoại truyền xuống), `Select` bậc khi `ghi-danh-dat-bac`, dòng xem trước từ `useQuery(trpc.okr.xemTruocChiSo.queryOptions(...))` với ba trạng thái; nhánh API: mã KR + `CopyValue` + `<code>` lệnh mẫu `curl -X POST <API_URL>/rest/okr/key-results/<id>/value -H "x-api-key: …" -d '{"giaTri": 12}'` + `Link` tới Cài đặt › Khoá API; nhánh Sheets: `Input` đường dẫn, `Input` ô, dòng «Chia sẻ bảng tính cho <email>» + `CopyValue`, trạng thái đọc từ `okr.objective` (`nguonMay.docLuc/docGiaTri/docLoi`) với `refetchInterval` khi đang chờ; khoá: mục tiêu không nháp → `ToggleGroup disabled` + chú thích, KR tay → `Button` «Thêm số đo cạnh».
- [ ] **Step 2:** `hop-thoai-kr.tsx` gắn `NguonSo` dưới nhóm ô số; lưu KR xong mới gọi `datNguonKr` khi người đổi nguồn; lỗi máy chủ vào `FieldError`.
- [ ] **Step 3:** `cache.ts` — `cache.okr` thêm `okr.lichSuSo`, `okr.banGhiChiSo`, `okr.xemTruocChiSo`; `bun test test/okr-lam-moi.spec.ts` xanh.
- [ ] **Step 4:** chạy thước màn E13 (sau Task 14) và soi ảnh 1440/390.
- [ ] **Step 5: Commit.**

---

### Task 12: Bảng KR và ngăn «Số của KR»

`independent: false` (cần Task 4, 10) · phục vụ E11, E12 · verify: `cd apps/app && bun run check-types` rồi thước màn E11/E12

**Files:**
- Create: `apps/app/components/crm/record-sheet/so-kr-sheet.tsx`
- Modify: `apps/app/app/(app)/[slug]/okr/bang-kr.tsx`, `apps/app/components/crm/record-sheet/record-stack.ts:17` (`RECORD_KINDS` thêm `"so-kr"`), `record-sheet-host.tsx` (nhánh `shown?.kind === "so-kr"`), `apps/app/lib/search-param-keys.ts` (`ngaySo`)

- [ ] **Step 1:** `bang-kr.tsx` — cột số: `Badge variant="outline"` nguồn (`data-nguon`) khi `source !== "tay"` hoặc `doCanh`; số của KR máy/đo cạnh là `Button variant="link"` gọi `push({ kind: "so-kr", id: kr.id })` — trừ vai `okr` (đọc `okr.access`), khi đó là chữ trần kèm `Tooltip`; đo cạnh hiện «<tay> tay · <máy> máy»; chưa có bản chụp hiện «Số máy: sáng mai».
- [ ] **Step 2:** `so-kr-sheet.tsx` — `DetailSheetHeader` tên KR, dòng định nghĩa (tên chỉ số, phạm vi, khoảng ngày, `translate="no"`), `StatTile` số đã chụp; câu lệch khi `lech`; `SimpleTable` bản ghi (tên là `Button variant="link"` push `moRef`), «Xem thêm» tăng `trang`; `SimpleTable` lịch sử (chọn ngày đặt `ngaySo` bằng nuqs); nguồn API: bảng `lanGhi`; ba trạng thái (`Skeleton`, `Empty` rỗng theo chỉ số, `Empty` lỗi + «Thử lại» gọi `refetch`).
- [ ] **Step 3:** chạy thước màn E11/E12 và soi ảnh.
- [ ] **Step 4: Commit.**

---

### Task 13: Màn cập nhật tuần — ô số khoá và điền sẵn

`independent: false` (cần Task 6) · phục vụ E19 · verify: `cd apps/app && bun run check-types` rồi thước màn E19

**Files:**
- Modify: các tệp dưới `apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/` dựng dòng KR (đọc `items[].nguon/doCanh/soMay`)

- [ ] **Step 1:** KR `nguon !== "tay"`: ô giá trị `disabled`, `value = soMay.giaTri`, `FieldDescription` «Số từ CRM · <ngày>» (API/Sheets theo nguồn); KR `doCanh`: ô bật, giá trị mặc định = `soMay.giaTri`, `FieldDescription` «Số máy: <số> · <ngày>».
- [ ] **Step 2:** thước màn E19; soi ảnh 1440/390.
- [ ] **Step 3: Commit.**

---

### Task 14: Thước đo của hồ sơ và tài liệu

`independent: false` (cần Task 3–13) · phục vụ E8, E11–E14, E19, E20, E21, E23 · verify: mỗi thước chạy xanh và `--chieu-do` đỏ đúng thông điệp

**Files:**
- Create: `_acceptance/so-okr-tu-chay/rang/soi-ma.mjs`, `man-so-tu-chay.mjs`, `tin-so.mjs`, `dem-doc-lap.sql`, `lech-khai-truoc.md`, `ty-le-kr-co-nguon.sql`, `ty-le.mjs`
- Modify: `docs/api.md` (mục OKR: nguồn số, `ghiSoKr`, bấm vào số, luật «currentValue chỉ qua cập nhật tuần» thêm ngoại lệ KR máy), `docs/agent.md` (mục «Chụp số OKR mỗi ngày», «Đọc Google Sheets»), `docs/environment.md`

- [ ] **Step 1: `soi-ma.mjs`** — suy gốc từ `import.meta.url`; `--ca chi-them` (E8) và `--ca thiet-ke` (E23) bằng `typescript` AST; `--chieu-do` như phép đo.
- [ ] **Step 2: `man-so-tu-chay.mjs`** — khuôn `_acceptance/toan-canh-okr/rang/man-toan-canh.mjs` (cảnh cây, `dev:session`, gieo qua API thật + gọi `chupSoOkr` thật trong kho đo, dọn theo id, lọc `EVAL=`); các bước của E11, E12, E13, E14, E19; ảnh vào `.acceptance-runs/so-okr-tu-chay/evidence/`; phiên Sheets dùng Google giả chạy cổng riêng và biến `GOOGLE_SHEETS_*` trỏ tới nó qua biến ghi đè host (`OKR_SHEETS_TOKEN_URL`, `OKR_SHEETS_API_URL` — chỉ đọc khi `NODE_ENV !== "production"`, khai trong `OKR_SO`).
- [ ] **Step 3: `dem-doc-lap.sql` + `tin-so.mjs` + `lech-khai-truoc.md`** — SQL đếm năm chỉ số viết tay theo từ điển (không nhập mã danh mục), `tin-so.mjs --san` gieo bộ E3 vào kho đo, so với `demChiSo`, in bảng; `lech-khai-truoc.md` bảng năm dòng: lệch 0 trên dữ liệu gieo, và mức khai trước trên production (email: thư chỉ có trong hộp thư chưa đồng bộ không đếm; thoả thuận: bản ghi lưu trữ không đếm).
- [ ] **Step 4: `ty-le-kr-co-nguon.sql` + `ty-le.mjs`** — ba cột; gieo qua `okr.datNguonKr`, `chupSoOkr`, `okr.guiCapNhat` thật.
- [ ] **Step 5: tài liệu** — ba mục trên; không nhắc tên hàm làm chủ ngữ ngoài phần luật máy.
- [ ] **Step 6: Năm lệnh chứng** — `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` (PATH Node 24) xanh.
- [ ] **Step 7: Commit; hợp đồng `status: implemented`.**

---

## Thứ tự và song song

```
T1 ─┬─ T3 ─┬─ T4 ─┬─ T5 ─┐
T2 ─┘      │      ├─ T6 ─┼─ T9
           │      ├─ T11 │
           │      └─ T12 │
           └─ T7 ── T8   ├─ T13 (sau T6)
T10 ──────────────────────┘
                        └─ T14
```

T1, T2, T10 độc lập (`independent: true`); còn lại tuần tự theo mũi tên. Mỗi việc một tác nhân con kèm người soát (khuôn lượt 4–5); T1 và T2 có thể chạy song song, T10 song song với T3–T9.

## Hồ sơ đã ký phải ghim lại sau lượt

`vai-chi-okr` (danh sách thủ tục ma trận) · `cap-nhat-tuan-okr` (`guiCapNhat`) · `dat-okr-trong-crm` (hộp thoại KR, `updateKeyResult`, `removeKeyResult`) · hồ sơ giữ `settings/copy-value.tsx` · `toan-canh-okr` nếu phép đo hiệu năng chạm `docMucTieu`.
