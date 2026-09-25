# Đặt OKR trong CRM — lượt 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Khu «Mục tiêu» trong CRM: quản trị mở chu kỳ và cấu hình chương trình; trưởng đơn vị đặt mục tiêu bốn cấp với KR sáu kiểu, căn chỉnh vào cấp trên, công bố; nhập bộ OKR từ bảng tính có xem trước; mọi lần ghi để vết.

**Architecture:** Sáu bảng mới ở cuối `schema.prisma` bằng một `migration` chỉ thêm; khuôn Zod ở `packages/validation/src/okr-*.ts` là nguồn duy nhất của danh mục (kiểu KR, pha, cấp, trạng thái, hành động vết). Module Nest mới `apps/api/src/okr` (router `okr`, nhóm dữ liệu `okr`) với ba hàm thuần kiểm riêng — tiến độ/kỳ vọng (`tien-do.ts`), cây căn chỉnh (`can-chinh.ts`), phân tích lô (`nhap.ts`) — một service Prisma và một service quyền theo bản ghi đọc cây từ `ToChucService`. Khu Next `[slug]/okr/` bốn tab, sheet mục tiêu trong record sheet, trang Cài đặt › Chương trình OKR theo `docs/settings.md`.

**Tech Stack:** Bun, Turbo, NestJS + nestjs-trpc, Prisma (Postgres), zod, Next.js App Router, React Query, nuqs, `@crm/ui` (shadcn), bun:test + JSDOM, puppeteer-core.

**Spec:** `docs/superpowers/specs/2026-09-25-dat-okr-trong-crm-design.md` · hợp đồng `_acceptance/dat-okr-trong-crm/contract.md` (15 tiêu chí, duyệt 2026-09-25) · phép đo `_acceptance/dat-okr-trong-crm/evals.yaml` (22 ô, khoá `dok_*` trong `_acceptance/config.yaml`).

## Global Constraints

- Không viết chú thích trong code (AGENTS.md). Hằng chỉnh được gom ở `apps/api/src/okr/okr-config.ts` (một object `OKR`, `as const`).
- Không sửa tệp nào trong `packages/ui`; nhập theo subpath `@crm/ui/components/<tên>`. Client component không nhập `@crm/db`, `@crm/auth`.
- Không sửa nội dung `apps/api/src/to-chuc/**`, `apps/api/src/onboarding/**`, `settings/organization/**` (vòng khác đang sửa) — chỉ nhập từ đó.
- `migration` chỉ thêm: chỉ `CREATE TABLE`, `CREATE INDEX`, `ADD CONSTRAINT … FOREIGN KEY` trên bảng mới; không cột mới trên bảng có sẵn. Model `Okr*` là dãy liền cuối `schema.prisma`.
- Cột danh mục là `String`; giá trị hợp lệ chỉ ở khuôn Zod trong `packages/validation/src/okr-*.ts`; service parse ở biên.
- Sáu kiểu KR: `tang-toi` · `giam-xuong` · `giu-tren` · `giu-duoi` · `moc` · `phan-tram`. Đơn vị đo là chữ tự do ≤ 24 ký tự.
- Ngày chu kỳ là ngày lịch Việt Nam (`@db.Date`, chuỗi `yyyy-mm-dd`); «hôm nay» qua `ngayVN` / `dauNgayVN` của `@crm/db/onboarding-nhac`.
- Quyền ghi: quản trị workspace (`isWorkspaceAdmin`) mở chu kỳ, cấu hình, sửa cấp OneHub, nhập cho mọi đơn vị; trưởng bộ phận sửa bộ phận và phòng ban con; trưởng phòng ban sửa phòng ban; cá nhân: chính họ, trưởng phòng ban chính, trưởng bộ phận đó; người phụ trách KR sửa KR của mình. Trưởng suy từ `ToChucService.tree()` (trưởng còn hiệu lực).
- Mười một thủ tục ghi nội dung bị khoá ở pha `cham-diem`/`da-dong`; mọi thủ tục ghi để đúng một dòng `OkrTrail` trong cùng `transaction` (nhập lô: chỉ khi `written > 0`).
- Chữ trên màn theo `CONTEXT.md`; nhãn rail «Mục tiêu» / «Objectives»; tên người, tên đơn vị, tên mục tiêu, tên KR, đơn vị đo mang `translate="no"`.
- «Vẽ tay là bậc cuối» (`docs/design.md`) và `docs/settings.md`: không `<table>`, `<h1>/<h2>`, chấm tự vẽ, `divide-y`, hộp `rounded-lg border` tự dựng, `AlertDialog` ráp tay, `navigator.clipboard`; dùng `SimpleTable`, `Card*`, `StatusIndicator`, `PageShell*`, `Field orientation="horizontal"`, `ConfirmDialog`.
- Tên `describe`/`test` phải khớp chuỗi `-t` của khoá `dok_*` trong `_acceptance/config.yaml`.
- `apps/api/src/generated/server.ts` được sinh bằng `cd apps/api && bun run trpc:generate` và commit; `build` không sinh lại.
- Năm lệnh chứng xanh trước khi đẩy (Node 24 qua `PATH="/Users/manhphan/.local/share/fnm/node-versions/v24.15.0/installation/bin:$PATH"`): `bun run test`, `check-types`, `lint`, `lint:slop`, `build`.

## Review Focus

- Bảng tính dán từ Google Sheets có số kiểu Việt («1.250,5»), dòng trống giữa, email viết hoa: số đọc đúng, dòng trống bỏ, email so không phân biệt hoa thường (Task 6 test `nhap-so-viet`).
- Trưởng phòng ban đồng thời là trưởng bộ phận khác: quyền hợp của cả hai vai trò, không loại trừ nhau (Task 4 test `quyen-ban-ghi` hàng `b1-kiem-p3`).
- Chu kỳ quý có ngày kết thúc đúng ngày cuối năm cha và người dùng ở múi giờ khác: so ngày theo chuỗi `yyyy-mm-dd`, không lệch một ngày (Task 2 test `chu-ky` ca `TZ`).
- Mục tiêu bị bỏ vẫn là đích căn chỉnh của mục tiêu khác: cây căn chỉnh vẫn hiện nhánh, nhãn «đã bỏ», không ném (Task 5 test `can-chinh` ca `dich-da-bo`).
- Người phụ trách KR rời workspace: KR vẫn đọc được, `ownerUserId` giữ nguyên, màn hiện tên từ bảng `user` (Task 3 test `sau-kieu-kr` ca `owner-roi`).

## Rủi ro chính — hai hồ sơ đã ký phải ghim lại

| Hồ sơ | Vì sao đổi | Bài kiểm chạm |
|---|---|---|
| `vai-chi-okr` | `ALIAS_CHO_PHEP` thêm `okr`; rail của vai này thêm mục | `apps/api/test/vai-chi-okr.spec.ts`, `apps/app/test/pham-vi-man.spec.ts` |
| hồ sơ giữ `khung-dieu-huong.spec.ts` (tra `grep -l khung-dieu-huong _acceptance/*/evals.yaml`) | số mục rail 8 → 9, vị trí «30 ngày đầu» vẫn ngay trước «Mục tiêu» rồi «Cài đặt» | `apps/app/test/khung-dieu-huong.spec.ts` |

Task 12 ghim lại bằng làn máy (`repin-lane.mjs`) với lý do «thêm mục Mục tiêu và nhóm dữ liệu okr (dat-okr-trong-crm AC-10, AC-12)». Bài kiểm chỉ đổi con số và thêm dòng, giữ lời hứa cũ.

## File Structure

| Tệp | Trách nhiệm |
|---|---|
| `packages/db/prisma/schema.prisma` | Sáu model `OkrCycle`, `OkrProgramConfig`, `OkrObjective`, `OkrParticipant`, `OkrAlignment`, `OkrKeyResult`, `OkrTrail` (bảy model, sáu bảng chính + vết) ở cuối; quan hệ ngược trên `User`, `Division`, `Department` |
| `packages/db/prisma/migrations/20260926010000_okr/migration.sql` | SQL chỉ thêm |
| `packages/validation/src/okr-chu-ky.ts`, `okr-muc-tieu.ts`, `okr-kr.ts`, `okr-vet.ts`, `okr-chuong-trinh.ts` | Danh mục, khuôn, `tienDoKr`, `parseOkrVet`, mặc định chương trình |
| `apps/api/src/okr/okr-config.ts` | `OKR` — giới hạn và câu lỗi ghim |
| `apps/api/src/okr/okr.contracts.ts` | zod vào/ra của `okr.*` |
| `apps/api/src/okr/tien-do.ts` | `kyVongTheoNgay`, `tinhTrang`, `chonChuKyHienTai` (thuần) |
| `apps/api/src/okr/can-chinh.ts` | `dungCayCanChinh` (thuần) |
| `apps/api/src/okr/nhap.ts` | `phanTichLoOkr` (thuần) |
| `apps/api/src/okr/okr-access.service.ts` | Quyền theo bản ghi |
| `apps/api/src/okr/okr.service.ts` | Đọc/ghi Prisma, vết, khoá pha |
| `apps/api/src/okr/okr.router.ts`, `okr.module.ts` | Router `okr`, đăng ký Nest |
| `apps/app/lib/messages/okr.ts` | Chữ vi/en khu OKR |
| `apps/app/lib/khung-dieu-huong.ts`, `pham-vi-man.ts`, `messages/khung-ung-dung.ts`, `proxy.ts`, `components/app-icon-rail.tsx`, `packages/db/src/workspace.ts`, `search-param-keys.ts`, `cai-dat-dieu-huong.ts`, `messages/settings.ts` | Điều hướng và khoá URL |
| `apps/app/app/(app)/[slug]/okr/*` | Layout bốn tab, Của tôi, Theo đơn vị, Toàn cảnh, hộp thoại |
| `apps/app/components/crm/record-sheet/objective-sheet.tsx`, `record-stack.ts`, `record-sheet-host.tsx`, `record-prefetch.ts`, `lib/trpc/cache.ts` | Sheet mục tiêu |
| `apps/app/app/(app)/[slug]/settings/okr/*` | Cài đặt › Chương trình OKR |
| `apps/api/test/okr-san.ts`, `okr.spec.ts`, `okr-nhap.spec.ts`, `okr-can-chinh.spec.ts`, `packages/validation/test/okr-kr.spec.ts` | Bài kiểm |
| `_acceptance/dat-okr-trong-crm/rang/*.mjs` | `cau-hinh`, `migration-chi-them`, `san-thiet-ke`, `man-okr` |

Thứ tự: Task 1 → 2 → 3 → 4 → 5 → 6 phụ thuộc nhau (cùng service). Task 7 (điều hướng) `independent: true`. Task 8, 9, 10, 11 cần Task 2–6 và `trpc:generate`. Task 12 cần tất cả.

---

### Task 1: Dữ liệu, `migration` chỉ thêm, khuôn Zod

Phục vụ E4 (a), E19. `independent: false`.

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (model `User` dòng 60–66 thêm quan hệ; `Department` ~1708, `Division` ~1731 thêm quan hệ; cuối tệp thêm khối)
- Create: `packages/db/prisma/migrations/20260926010000_okr/migration.sql`
- Create: `packages/validation/src/okr-chu-ky.ts`, `okr-muc-tieu.ts`, `okr-kr.ts`, `okr-vet.ts`, `okr-chuong-trinh.ts`; Modify `packages/validation/package.json` (exports)
- Create: `packages/validation/test/okr-kr.spec.ts`
- Create: `_acceptance/dat-okr-trong-crm/rang/cau-hinh.mjs`, `migration-chi-them.mjs`

**Interfaces:**
- Produces: Prisma models `okrCycle`, `okrProgramConfig`, `okrObjective`, `okrParticipant`, `okrAlignment`, `okrKeyResult`, `okrTrail`; từ `@crm/validation/okr-kr`: `KIEU_KR`, `KieuKr`, `tienDoKr(kieu, khoi, dich, hien): number`, `kiemSoTheoKieu(kieu, khoi, dich): string | null`; từ `okr-chu-ky`: `LOAI_CHU_KY`, `PHA_CHU_KY`, `PhaChuKy`, `phaSau(pha)`; từ `okr-muc-tieu`: `CAP_MUC_TIEU`, `LOAI_MUC_TIEU`, `TRANG_THAI_MUC_TIEU`, `HANG_CAP`; từ `okr-vet`: `HANH_DONG_VET`, `okrVetSnapshot`, `parseOkrVet`; từ `okr-chuong-trinh`: `okrProgram`, `OKR_PROGRAM_MAC_DINH`.

- [ ] **Step 1: Viết bài kiểm hàm thuần `tienDoKr` (đỏ trước)**

`packages/validation/test/okr-kr.spec.ts`:

```ts
import { describe, expect, test } from "bun:test";
import { KIEU_KR, kiemSoTheoKieu, tienDoKr } from "../src/okr-kr";

const BANG: [string, number, number, number, number][] = [
	["tang-toi", 0, 40, 0, 0],
	["tang-toi", 0, 40, 17, 43],
	["tang-toi", 0, 40, 50, 100],
	["giam-xuong", 8, 2, 8, 0],
	["giam-xuong", 8, 2, 3.5, 75],
	["giam-xuong", 8, 2, 1, 100],
	["giu-tren", 0, 50, 49, 0],
	["giu-tren", 0, 50, 50, 100],
	["giu-tren", 0, 50, 90, 100],
	["giu-duoi", 0, 5, 6, 0],
	["giu-duoi", 0, 5, 5, 100],
	["giu-duoi", 0, 5, 1, 100],
	["moc", 0, 1, 0, 0],
	["moc", 0, 1, 1, 100],
	["moc", 0, 1, 3, 100],
	["phan-tram", 0, 100, 0, 0],
	["phan-tram", 0, 100, 37, 37],
	["phan-tram", 0, 100, 100, 100],
];

describe("okr-kr", () => {
	test("sau kieu, ba gia tri moi kieu = 18 khang dinh", () => {
		expect(KIEU_KR).toHaveLength(6);
		for (const [kieu, khoi, dich, hien, mong] of BANG) {
			expect(`${kieu} ${hien} -> ${tienDoKr(kieu as never, khoi, dich, hien)}`).toBe(
				`${kieu} ${hien} -> ${mong}`,
			);
		}
	});

	test("rang buoc theo kieu", () => {
		expect(kiemSoTheoKieu("tang-toi", 10, 10)).toBe("dich-phai-lon-hon-khoi-diem");
		expect(kiemSoTheoKieu("giam-xuong", 2, 8)).toBe("dich-phai-nho-hon-khoi-diem");
		expect(kiemSoTheoKieu("phan-tram", 0, 101)).toBe("phan-tram-ngoai-0-100");
		expect(kiemSoTheoKieu("giu-tren", 0, 50)).toBeNull();
		expect(kiemSoTheoKieu("moc", 0, 1)).toBeNull();
	});
});
```

- [ ] **Step 2: Chạy để thấy đỏ**

Run: `cd packages/validation && bun test test/okr-kr.spec.ts`
Expected: FAIL — `Cannot find module "../src/okr-kr"`.

- [ ] **Step 3: Viết năm khuôn Zod**

`packages/validation/src/okr-kr.ts`:

```ts
import { z } from "zod";

export const KIEU_KR = [
	"tang-toi",
	"giam-xuong",
	"giu-tren",
	"giu-duoi",
	"moc",
	"phan-tram",
] as const;

export type KieuKr = (typeof KIEU_KR)[number];

export const NGUON_KR = ["tay", "crm", "api"] as const;

export type NguonKr = (typeof NGUON_KR)[number];

export const kieuKr = z.enum(KIEU_KR);

export const soKr = z.number().finite().min(-1e12).max(1e12);

export const krInput = z.object({
	title: z.string().trim().min(3).max(200),
	kind: kieuKr,
	ownerUserId: z.string().trim().min(1).max(120),
	startValue: soKr,
	targetValue: soKr,
	currentValue: soKr,
	unit: z.string().trim().max(24),
	dueOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
	weight: z.number().min(0).max(10),
});

export type KrInput = z.infer<typeof krInput>;

export type LoiSoTheoKieu =
	| "dich-phai-lon-hon-khoi-diem"
	| "dich-phai-nho-hon-khoi-diem"
	| "phan-tram-ngoai-0-100";

export function kiemSoTheoKieu(
	kieu: KieuKr,
	khoi: number,
	dich: number,
): LoiSoTheoKieu | null {
	if (kieu === "tang-toi" && dich <= khoi) return "dich-phai-lon-hon-khoi-diem";
	if (kieu === "giam-xuong" && dich >= khoi)
		return "dich-phai-nho-hon-khoi-diem";
	if (kieu === "phan-tram" && (dich < 0 || dich > 100))
		return "phan-tram-ngoai-0-100";
	return null;
}

const kep = (p: number) => Math.max(0, Math.min(100, Math.round(p)));

export function tienDoKr(
	kieu: KieuKr,
	khoi: number,
	dich: number,
	hien: number,
): number {
	switch (kieu) {
		case "tang-toi":
			return dich === khoi ? 0 : kep(((hien - khoi) / (dich - khoi)) * 100);
		case "giam-xuong":
			return dich === khoi ? 0 : kep(((khoi - hien) / (khoi - dich)) * 100);
		case "giu-tren":
			return hien >= dich ? 100 : 0;
		case "giu-duoi":
			return hien <= dich ? 100 : 0;
		case "moc":
			return hien >= 1 ? 100 : 0;
		case "phan-tram":
			return kep(hien);
	}
}
```

`packages/validation/src/okr-chu-ky.ts`:

```ts
import { z } from "zod";

export const LOAI_CHU_KY = ["nam", "quy"] as const;
export const PHA_CHU_KY = [
	"lap-ke-hoach",
	"dang-chay",
	"cham-diem",
	"da-dong",
] as const;

export type LoaiChuKy = (typeof LOAI_CHU_KY)[number];
export type PhaChuKy = (typeof PHA_CHU_KY)[number];

export const PHA_GHI_DUOC: readonly PhaChuKy[] = ["lap-ke-hoach", "dang-chay"];

export const ngayLich = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const chuKyInput = z
	.object({
		kind: z.enum(LOAI_CHU_KY),
		name: z.string().trim().min(2).max(80),
		parentId: z.string().trim().min(1).max(120).nullable(),
		startsOn: ngayLich,
		endsOn: ngayLich,
		breakStartsOn: ngayLich.nullable(),
		breakEndsOn: ngayLich.nullable(),
		updateWeekday: z.int().min(1).max(7),
	})
	.refine((c) => c.startsOn < c.endsOn, { message: "startsOn < endsOn" })
	.refine(
		(c) =>
			(c.breakStartsOn === null) === (c.breakEndsOn === null) &&
			(c.breakStartsOn === null ||
				(c.breakStartsOn <= (c.breakEndsOn as string) &&
					c.breakStartsOn >= c.startsOn &&
					(c.breakEndsOn as string) <= c.endsOn)),
		{ message: "khoang nghi trong chu ky" },
	);

export type ChuKyInput = z.infer<typeof chuKyInput>;

export function phaSau(pha: PhaChuKy): PhaChuKy | null {
	const i = PHA_CHU_KY.indexOf(pha);
	return PHA_CHU_KY[i + 1] ?? null;
}

export function ghiDuocOPha(pha: PhaChuKy): boolean {
	return PHA_GHI_DUOC.includes(pha);
}
```

`packages/validation/src/okr-muc-tieu.ts`:

```ts
import { z } from "zod";

export const CAP_MUC_TIEU = ["onehub", "bo-phan", "phong-ban", "ca-nhan"] as const;
export const LOAI_MUC_TIEU = ["cam-ket", "tham-vong"] as const;
export const TRANG_THAI_MUC_TIEU = ["nhap", "cong-bo", "da-bo"] as const;

export type CapMucTieu = (typeof CAP_MUC_TIEU)[number];
export type LoaiMucTieu = (typeof LOAI_MUC_TIEU)[number];
export type TrangThaiMucTieu = (typeof TRANG_THAI_MUC_TIEU)[number];

export const HANG_CAP = {
	onehub: 0,
	"bo-phan": 1,
	"phong-ban": 2,
	"ca-nhan": 3,
} as const satisfies Record<CapMucTieu, number>;

const ma = z.string().trim().min(1).max(120);

export const donViMucTieu = z.discriminatedUnion("level", [
	z.object({ level: z.literal("onehub") }),
	z.object({ level: z.literal("bo-phan"), divisionId: ma }),
	z.object({ level: z.literal("phong-ban"), departmentId: ma }),
	z.object({ level: z.literal("ca-nhan"), personUserId: ma }),
]);

export type DonViMucTieu = z.infer<typeof donViMucTieu>;

export const mucTieuInput = z.object({
	cycleId: ma,
	unit: donViMucTieu,
	title: z.string().trim().min(3).max(200),
	kind: z.enum(LOAI_MUC_TIEU),
	ownerUserId: ma,
	participantIds: z.array(ma).max(50),
	whyNow: z.string().trim().max(500),
});

export type MucTieuInput = z.infer<typeof mucTieuInput>;

export const mucTieuUpdate = z.object({
	id: ma,
	title: z.string().trim().min(3).max(200).optional(),
	kind: z.enum(LOAI_MUC_TIEU).optional(),
	ownerUserId: ma.optional(),
	participantIds: z.array(ma).max(50).optional(),
	whyNow: z.string().trim().max(500).optional(),
});

export type MucTieuUpdate = z.infer<typeof mucTieuUpdate>;
```

`packages/validation/src/okr-vet.ts`:

```ts
import { z } from "zod";

export const HANH_DONG_VET = [
	"tao-chu-ky",
	"doi-pha",
	"cau-hinh",
	"tao",
	"sua",
	"cong-bo",
	"bo",
	"tao-kr",
	"sua-kr",
	"xoa-kr",
	"gan-can-chinh",
	"go-can-chinh",
	"nhap-bang-tinh",
] as const;

export type HanhDongVet = (typeof HANH_DONG_VET)[number];

export const okrVetSnapshot = z.record(
	z.string(),
	z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.string())]),
);

export type OkrVetSnapshot = z.infer<typeof okrVetSnapshot>;

export function parseOkrVet(value: unknown): OkrVetSnapshot | null {
	if (value === null || value === undefined) return null;
	const r = okrVetSnapshot.safeParse(value);
	if (!r.success) throw new Error(`Vết OKR không đọc được: ${r.error.message}`);
	return r.data;
}
```

`packages/validation/src/okr-chuong-trinh.ts`:

```ts
import { z } from "zod";

export const CHE_DO_TRAN = ["canh-bao", "chan"] as const;
export const THANG_CHAM = ["0-1", "0-100"] as const;

export const okrProgram = z.object({
	objectiveCap: z.int().min(1).max(50),
	krCap: z.int().min(1).max(50),
	capMode: z.enum(CHE_DO_TRAN),
	scoreScale: z.enum(THANG_CHAM),
	weightsOn: z.boolean(),
	personalOn: z.boolean(),
});

export type OkrProgram = z.infer<typeof okrProgram>;

export const OKR_PROGRAM_MAC_DINH: OkrProgram = {
	objectiveCap: 5,
	krCap: 5,
	capMode: "canh-bao",
	scoreScale: "0-1",
	weightsOn: false,
	personalOn: false,
};
```

Thêm vào `packages/validation/package.json` `exports` (giữ thứ tự chữ cái):

```json
"./okr-chu-ky": "./src/okr-chu-ky.ts",
"./okr-chuong-trinh": "./src/okr-chuong-trinh.ts",
"./okr-kr": "./src/okr-kr.ts",
"./okr-muc-tieu": "./src/okr-muc-tieu.ts",
"./okr-vet": "./src/okr-vet.ts",
```

- [ ] **Step 4: Chạy bài kiểm hàm thuần — xanh**

Run: `cd packages/validation && bun test test/okr-kr.spec.ts`
Expected: PASS, 2 tests.

- [ ] **Step 5: Thêm khối model vào cuối `schema.prisma` và quan hệ ngược**

Trong `model User` thêm sau dòng `orgSecondaryDepartments`:

```prisma
  okrObjectivesOwned   OkrObjective[]   @relation("OkrObjectiveOwner")
  okrObjectivesPerson  OkrObjective[]   @relation("OkrObjectivePerson")
  okrKeyResultsOwned   OkrKeyResult[]   @relation("OkrKeyResultOwner")
  okrParticipations    OkrParticipant[]
```

Trong `model Department` thêm `okrObjectives OkrObjective[]`; trong `model Division` thêm `okrObjectives OkrObjective[]`.

Cuối tệp (sau `OnboardingEnrollment`):

```prisma
model OkrCycle {
  id             String     @id @default(cuid())
  kind           String
  name           String
  parentId       String?
  parent         OkrCycle?  @relation("OkrCycleParent", fields: [parentId], references: [id], onDelete: Restrict)
  children       OkrCycle[] @relation("OkrCycleParent")
  startsOn       DateTime   @db.Date
  endsOn         DateTime   @db.Date
  phase          String     @default("lap-ke-hoach")
  breakStartsOn  DateTime?  @db.Date
  breakEndsOn    DateTime?  @db.Date
  updateWeekday  Int        @default(1)
  objectives     OkrObjective[]
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  @@index([parentId])
  @@index([startsOn])
  @@map("okrCycle")
}

model OkrProgramConfig {
  id           String   @id @default(cuid())
  version      Int      @unique
  objectiveCap Int
  krCap        Int
  capMode      String
  scoreScale   String
  weightsOn    Boolean
  personalOn   Boolean
  createdById  String
  createdAt    DateTime @default(now())

  @@map("okrProgramConfig")
}

model OkrObjective {
  id           String      @id @default(cuid())
  cycleId      String
  cycle        OkrCycle    @relation(fields: [cycleId], references: [id], onDelete: Restrict)
  level        String
  divisionId   String?
  division     Division?   @relation(fields: [divisionId], references: [id], onDelete: Restrict)
  departmentId String?
  department   Department? @relation(fields: [departmentId], references: [id], onDelete: Restrict)
  personUserId String?
  person       User?       @relation("OkrObjectivePerson", fields: [personUserId], references: [id], onDelete: Restrict)
  ownerUserId  String
  owner        User        @relation("OkrObjectiveOwner", fields: [ownerUserId], references: [id], onDelete: Restrict)
  kind         String
  status       String      @default("nhap")
  title        String
  whyNow       String      @default("")
  publishedAt  DateTime?
  droppedAt    DateTime?
  position     Int         @default(0)
  participants OkrParticipant[]
  keyResults   OkrKeyResult[]
  alignments   OkrAlignment[] @relation("OkrAlignmentSource")
  alignedBy    OkrAlignment[] @relation("OkrAlignmentTargetObjective")
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  @@index([cycleId, level])
  @@index([divisionId])
  @@index([departmentId])
  @@index([personUserId])
  @@index([ownerUserId])
  @@map("okrObjective")
}

model OkrParticipant {
  objectiveId String
  objective   OkrObjective @relation(fields: [objectiveId], references: [id], onDelete: Cascade)
  userId      String
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime     @default(now())

  @@id([objectiveId, userId])
  @@index([userId])
  @@map("okrParticipant")
}

model OkrKeyResult {
  id            String       @id @default(cuid())
  objectiveId   String
  objective     OkrObjective @relation(fields: [objectiveId], references: [id], onDelete: Cascade)
  title         String
  kind          String
  ownerUserId   String
  owner         User         @relation("OkrKeyResultOwner", fields: [ownerUserId], references: [id], onDelete: Restrict)
  startValue    Decimal      @db.Decimal(18, 4)
  targetValue   Decimal      @db.Decimal(18, 4)
  currentValue  Decimal      @db.Decimal(18, 4)
  unit          String       @default("")
  dueOn         DateTime?    @db.Date
  weight        Decimal      @default(1) @db.Decimal(6, 2)
  source        String       @default("tay")
  startLockedAt DateTime?
  position      Int          @default(0)
  alignedBy     OkrAlignment[] @relation("OkrAlignmentTargetKeyResult")
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([objectiveId, position])
  @@index([ownerUserId])
  @@map("okrKeyResult")
}

model OkrAlignment {
  id                String        @id @default(cuid())
  objectiveId       String
  objective         OkrObjective  @relation("OkrAlignmentSource", fields: [objectiveId], references: [id], onDelete: Cascade)
  targetObjectiveId String?
  targetObjective   OkrObjective? @relation("OkrAlignmentTargetObjective", fields: [targetObjectiveId], references: [id], onDelete: Cascade)
  targetKeyResultId String?
  targetKeyResult   OkrKeyResult? @relation("OkrAlignmentTargetKeyResult", fields: [targetKeyResultId], references: [id], onDelete: Cascade)
  createdAt         DateTime      @default(now())

  @@unique([objectiveId, targetObjectiveId, targetKeyResultId])
  @@index([targetObjectiveId])
  @@index([targetKeyResultId])
  @@map("okrAlignment")
}

model OkrTrail {
  id          String   @id @default(cuid())
  at          DateTime @default(now())
  actorUserId String
  cycleId     String?
  objectiveId String?
  keyResultId String?
  action      String
  before      Json?
  after       Json?
  note        String?

  @@index([objectiveId, at])
  @@index([cycleId, at])
  @@index([at])
  @@map("okrTrail")
}
```

- [ ] **Step 6: Sinh `migration` bằng Prisma, kiểm tên và nội dung**

Run: `cd packages/db && bunx --bun prisma migrate dev --create-only --name okr` rồi đổi tên thư mục sinh ra thành `20260926010000_okr` (giữ thứ tự sau `20260925010000_cay_to_chuc`). Mở `migration.sql`, khẳng định mọi câu là `CREATE TABLE`, `CREATE INDEX`, `CREATE UNIQUE INDEX` trên bảng `okr*`, `ALTER TABLE "okr…" ADD CONSTRAINT … FOREIGN KEY`. Không có `ALTER TABLE "user"`/`"division"`/`"department"` (quan hệ ngược không sinh cột).

Run: `cd packages/db && bun run db:generate && bun run db:migrate`
Expected: `Your database is now in sync`.

- [ ] **Step 7: Viết răng `cau-hinh.mjs` và `migration-chi-them.mjs`**

`_acceptance/dat-okr-trong-crm/rang/cau-hinh.mjs` (điền `sau` bằng HEAD lúc chấm, `truoc` là merge-base với `origin/onehub` = `9a7f024ca172317f4c893597e75b60e95c3965c5`):

```js
export const VONG = Object.freeze({
	truoc: "9a7f024ca172317f4c893597e75b60e95c3965c5",
	sau: "HEAD",
});
```

`_acceptance/dat-okr-trong-crm/rang/migration-chi-them.mjs`: chép nguyên `_acceptance/cau-truc-to-chuc/rang/migration-chi-them.mjs`, đổi `import { VONG } from "./cau-hinh.mjs"` (giữ), và thêm sau phần kiểm SQL một khối kiểm dãy liền:

```js
const schema = git("show", `${VONG.sau}:packages/db/prisma/schema.prisma`);
const models = [...schema.matchAll(/^model (\w+) \{/gm)].map((m) => m[1]);
const dau = models.findIndex((m) => m.startsWith("Okr"));
const sauOkr = models.slice(dau).filter((m) => !m.startsWith("Okr"));
if (dau === -1) hong.push("khong co model Okr nao");
if (sauOkr.length > 0)
	hong.push(`model Okr khong lien cuoi schema: sau chung con ${sauOkr.join(", ")}`);
```

và ca chiều đỏ thứ tư trong `--chieu-do`: chuỗi schema giả `model OkrA {}\nmodel Khac {}\nmodel OkrB {}` → phải bắt «không liền cuối» (đếm `bat === 4`).

- [ ] **Step 8: Chạy răng — xanh, rồi chiều đỏ**

Run: `node _acceptance/dat-okr-trong-crm/rang/migration-chi-them.mjs`
Expected: `migration moi: 20260926010000_okr · so cau lenh: N`, exit 0.
Run: `node _acceptance/dat-okr-trong-crm/rang/migration-chi-them.mjs --chieu-do`
Expected: bốn dòng «migration khong chi them: …», exit 1.

- [ ] **Step 9: Commit**

```bash
git add packages/db/prisma packages/validation _acceptance/dat-okr-trong-crm/rang
git commit -m "okr: sáu bảng OKR, migration chỉ thêm, khuôn Zod kiểu KR/chu kỳ/mục tiêu/vết/chương trình"
```

---

### Task 2: Module `okr` — hằng, hợp đồng, quyền, chu kỳ, cấu hình

Phục vụ E1, E2. `independent: false`.

**Files:**
- Create: `apps/api/src/okr/okr-config.ts`, `okr.contracts.ts`, `tien-do.ts`, `okr-access.service.ts`, `okr.service.ts`, `okr.router.ts`, `okr.module.ts`
- Modify: `apps/api/src/app.module.ts` (thêm `OkrModule` sau `ToChucModule`)
- Create: `apps/api/test/okr-san.ts`, `apps/api/test/okr.spec.ts`

**Interfaces:**
- Produces: `OkrService.{cycles, createCycle, setCyclePhase, program, setProgram, access}`; `OkrAccessService.{assertQuanTri, assertSuaDonVi, assertSuaMucTieu, assertSuaKr, headOf}`; `OKR` config; `chonChuKyHienTai(cycles, homNay: string)`.

- [ ] **Step 1: Viết `okr-config.ts`**

```ts
export const OKR = {
	ten: { mucTieuToiDa: 200, krToiDa: 200, donViDo: 24, viSao: 500 },
	lo: { toiDaDong: 1000, toiDaKyTu: 200_000 },
	nhap: {
		tenCotDau: ["muc tieu", "objective"],
		kieu: {
			"tang toi": "tang-toi",
			"giam xuong": "giam-xuong",
			"giu tren": "giu-tren",
			"giu duoi": "giu-duoi",
			moc: "moc",
			"phan tram": "phan-tram",
		},
	},
	thongDiep: {
		canQuyenQuanTri: "Cần quyền quản trị để mở chu kỳ hay đổi cấu hình chương trình.",
		khongSuaDuocDonVi: "Bạn không sửa được OKR của đơn vị này — chỉ trưởng đơn vị (hoặc trưởng bộ phận chứa nó) sửa được.",
		khongSuaDuocKr: "Chỉ người phụ trách KR hoặc người sửa được mục tiêu mới sửa KR này.",
		khongCoChuKy: (id: string) => `Không có chu kỳ nào mang mã ${id}.`,
		khongCoMucTieu: (id: string) => `Không có mục tiêu nào mang mã ${id}.`,
		khongCoKr: (id: string) => `Không có KR nào mang mã ${id}.`,
		quyNgoaiNam: "Quý phải nằm trọn trong năm cha.",
		quyChong: (ten: string) => `Chồng ngày với chu kỳ «${ten}».`,
		namKhongCoCha: "Chu kỳ năm không có cha; chu kỳ quý phải có năm cha.",
		phaChiDiToi: "Pha chu kỳ chỉ đi tới, không lùi.",
		phaCuoi: "Chu kỳ đã đóng.",
		kyDaKhoa: "Chu kỳ này ở pha chấm điểm hoặc đã đóng — không ghi được nữa.",
		vuotTranMucTieu: (n: number) => `Đơn vị này đã có ${n} mục tiêu — vượt trần chương trình.`,
		vuotTranKr: (n: number) => `Mục tiêu này đã có ${n} KR — vượt trần chương trình.`,
		caNhanTat: "Chương trình chưa bật OKR cá nhân.",
		khongPhaiThanhVien: (id: string) => `Người ${id} không phải thành viên đang hoạt động.`,
		khoiDiemDaKhoa: "Khởi điểm đã khoá khi công bố — chỉ sửa được đích và giá trị hiện tại.",
		congBoCanKr: "Cần ít nhất một KR trước khi công bố.",
		daCongBo: "Mục tiêu này đã công bố.",
		daBo: "Mục tiêu này đã bỏ.",
		soTheoKieu: {
			"dich-phai-lon-hon-khoi-diem": "Kiểu «tăng tới» cần đích lớn hơn khởi điểm.",
			"dich-phai-nho-hon-khoi-diem": "Kiểu «giảm xuống» cần đích nhỏ hơn khởi điểm.",
			"phan-tram-ngoai-0-100": "Kiểu «phần trăm» cần đích trong 0–100.",
		},
		canChinh: {
			cungCap: "Chỉ căn chỉnh được vào mục tiêu hoặc KR ở cấp cao hơn.",
			chinhNo: "Không căn chỉnh vào chính mình.",
			chuaCongBo: "Đích căn chỉnh phải đã công bố.",
			khacChuKy: "Đích phải cùng chu kỳ hoặc thuộc chu kỳ năm cha.",
			daGan: "Đã gắn vào chỗ này rồi.",
			khongCoDich: "Cần đúng một đích: mục tiêu hoặc KR.",
		},
		nhap: {
			thieuMucTieu: "Thiếu mục tiêu",
			thieuKr: "Thiếu KR",
			kieuLa: "Cột kiểu chỉ nhận: tăng tới, giảm xuống, giữ trên, giữ dưới, mốc, phần trăm",
			emailLa: "Email này chưa là thành viên CRM",
			thieuDich: "Thiếu đích",
			soLa: "Khởi điểm hoặc đích không phải số",
			daCo: "Mục tiêu này đã có trong CRM cho đơn vị và chu kỳ này",
			loQuaDai: (n: number) => `Lô có quá ${n} dòng — chia nhỏ rồi nhập lại.`,
			loRong: "Không có dòng nào để nhập.",
			khongDongHopLe: "Không có dòng hợp lệ nào để ghi.",
			vuotTran: (n: number) => `Lô làm đơn vị vượt trần ${n} mục tiêu của chương trình.`,
		},
	},
} as const;
```

- [ ] **Step 2: Viết `tien-do.ts` (thuần) và bài kiểm nhỏ trong `okr.spec.ts` sau**

```ts
import { soNgayVN } from "@crm/db/onboarding-nhac";
import type { LoaiMucTieu } from "@crm/validation/okr-muc-tieu";

export type ChuKyNgan = {
	id: string;
	kind: string;
	phase: string;
	startsOn: string;
	endsOn: string;
};

export function chonChuKyHienTai(
	cycles: ChuKyNgan[],
	homNay: string,
): ChuKyNgan | null {
	const quy = cycles.filter((c) => c.kind === "quy");
	const dangChay = quy.find(
		(c) => c.phase === "dang-chay" && c.startsOn <= homNay && homNay <= c.endsOn,
	);
	if (dangChay) return dangChay;
	const sap = [...quy].sort((a, b) =>
		Math.abs(a.startsOn.localeCompare(homNay)) -
		Math.abs(b.startsOn.localeCompare(homNay)),
	);
	return sap[0] ?? cycles[0] ?? null;
}

export function kyVongTheoNgay(
	congBo: Date | null,
	ketThuc: Date,
	homNay: Date,
	nghi: { tu: Date; den: Date } | null,
): number | null {
	if (congBo === null) return null;
	const tong = soNgayVN(congBo, ketThuc) - (nghi ? soNgayVN(nghi.tu, nghi.den) + 1 : 0);
	if (tong <= 0) return 100;
	let da = soNgayVN(congBo, homNay);
	if (nghi && homNay > nghi.den) da -= soNgayVN(nghi.tu, nghi.den) + 1;
	return Math.max(0, Math.min(100, Math.round((da / tong) * 100)));
}

export const NGUONG = { thamVong: 0.7, cham: 0.85, truot: 0.5 } as const;

export type TinhTrang = "dung-nhip" | "cham-nhip" | "truot" | "chua-co-ky-vong";

export function tinhTrang(
	phanTram: number,
	kyVong: number | null,
	loai: LoaiMucTieu,
): TinhTrang {
	if (kyVong === null || kyVong === 0) return "chua-co-ky-vong";
	const tiLe = phanTram / kyVong;
	if (loai === "tham-vong") return tiLe >= NGUONG.thamVong ? "dung-nhip" : "cham-nhip";
	if (tiLe >= NGUONG.cham) return "dung-nhip";
	if (tiLe >= NGUONG.truot) return "cham-nhip";
	return "truot";
}
```

- [ ] **Step 3: Viết `okr.contracts.ts`**

```ts
import { z } from "zod";
import { chuKyInput, LOAI_CHU_KY, PHA_CHU_KY } from "@crm/validation/okr-chu-ky";
import { okrProgram } from "@crm/validation/okr-chuong-trinh";
import { KIEU_KR, krInput, NGUON_KR } from "@crm/validation/okr-kr";
import {
	CAP_MUC_TIEU,
	donViMucTieu,
	LOAI_MUC_TIEU,
	mucTieuInput,
	mucTieuUpdate,
	TRANG_THAI_MUC_TIEU,
} from "@crm/validation/okr-muc-tieu";
import { HANH_DONG_VET, okrVetSnapshot } from "@crm/validation/okr-vet";
import { OKR } from "./okr-config";

const ma = z.string().trim().min(1).max(120);
const ngay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const nguoiOkr = z.object({ id: z.string(), name: z.string(), email: z.string() });

export const chuKyOutput = z.object({
	id: z.string(),
	kind: z.enum(LOAI_CHU_KY),
	name: z.string(),
	parentId: z.string().nullable(),
	startsOn: ngay,
	endsOn: ngay,
	phase: z.enum(PHA_CHU_KY),
	breakStartsOn: ngay.nullable(),
	breakEndsOn: ngay.nullable(),
	updateWeekday: z.number(),
});
export const cyclesOutput = z.object({
	cycles: z.array(chuKyOutput),
	currentId: z.string().nullable(),
});
export const createCycleInput = chuKyInput;
export const setCyclePhaseInput = z.object({ id: ma, phase: z.enum(PHA_CHU_KY) });
export const programOutput = okrProgram.extend({ version: z.number() });
export const setProgramInput = okrProgram;
export const accessOutput = z.object({
	canManageProgram: z.boolean(),
	headOf: z.object({ divisions: z.array(z.string()), departments: z.array(z.string()) }),
});

export const krOutput = z.object({
	id: z.string(),
	objectiveId: z.string(),
	title: z.string(),
	kind: z.enum(KIEU_KR),
	owner: nguoiOkr,
	startValue: z.number(),
	targetValue: z.number(),
	currentValue: z.number(),
	unit: z.string(),
	dueOn: ngay.nullable(),
	weight: z.number(),
	source: z.enum(NGUON_KR),
	startLocked: z.boolean(),
	progress: z.number(),
	laCuaToi: z.boolean(),
});
export const noiGopOutput = z.object({
	alignmentId: z.string(),
	targetObjectiveId: z.string(),
	targetKeyResultId: z.string().nullable(),
	unitName: z.string(),
	objectiveTitle: z.string(),
	keyResultTitle: z.string().nullable(),
});
export const mucTieuOutput = z.object({
	id: z.string(),
	cycleId: z.string(),
	level: z.enum(CAP_MUC_TIEU),
	unitId: z.string().nullable(),
	unitName: z.string(),
	title: z.string(),
	kind: z.enum(LOAI_MUC_TIEU),
	status: z.enum(TRANG_THAI_MUC_TIEU),
	owner: nguoiOkr,
	participants: z.array(nguoiOkr),
	whyNow: z.string(),
	publishedAt: z.string().nullable(),
	droppedAt: z.string().nullable(),
	progress: z.number(),
	expected: z.number().nullable(),
	keyResults: z.array(krOutput),
	alignments: z.array(noiGopOutput),
	canEdit: z.boolean(),
});
export const vetOutput = z.object({
	id: z.string(),
	at: z.string(),
	actor: nguoiOkr.nullable(),
	action: z.enum(HANH_DONG_VET),
	keyResultId: z.string().nullable(),
	before: okrVetSnapshot.nullable(),
	after: okrVetSnapshot.nullable(),
	note: z.string().nullable(),
});
export const donViChon = z.union([
	z.object({ loai: z.literal("goc") }),
	z.object({ loai: z.literal("bp"), id: ma }),
	z.object({ loai: z.literal("pb"), id: ma }),
	z.object({ loai: z.literal("nguoi"), id: ma }),
]);
export const byUnitInput = z.object({ cycleId: ma, unit: donViChon });
export const byUnitOutput = z.object({
	objectives: z.array(mucTieuOutput),
	canEdit: z.boolean(),
	canhBao: z.string().nullable(),
});
export const mineInput = z.object({ cycleId: ma });
export const mineOutput = z.object({ objectives: z.array(mucTieuOutput) });
export const objectiveInput = z.object({ id: ma });
export const objectiveOutput = mucTieuOutput.extend({
	trail: z.array(vetOutput),
	canEditKr: z.array(z.string()),
});
export const createObjectiveInput = mucTieuInput;
export const updateObjectiveInput = mucTieuUpdate;
export const idInput = z.object({ id: ma });
export const okOutput = z.object({ id: z.string(), canhBao: z.string().nullable() });
export const createKrInput = krInput.extend({ objectiveId: ma });
export const updateKrInput = krInput.partial().extend({ id: ma });
export const alignmentInput = z.object({
	objectiveId: ma,
	targetObjectiveId: ma.nullable(),
	targetKeyResultId: ma.nullable(),
});
export const alignmentTargetsInput = z.object({ objectiveId: ma });
export const alignmentTargetsOutput = z.object({
	targets: z.array(
		z.object({
			objectiveId: z.string(),
			keyResultId: z.string().nullable(),
			label: z.string(),
			unitName: z.string(),
		}),
	),
});
export const nutCanChinh: z.ZodType<NutCanChinh> = z.lazy(() =>
	z.object({
		id: z.string(),
		loai: z.enum(["muc-tieu", "kr"]),
		objectiveId: z.string(),
		unitName: z.string(),
		title: z.string(),
		progress: z.number(),
		status: z.enum(TRANG_THAI_MUC_TIEU),
		kind: z.enum(LOAI_MUC_TIEU),
		gop: z.number(),
		lapLai: z.boolean(),
		children: z.array(nutCanChinh),
	}),
);
export type NutCanChinh = {
	id: string;
	loai: "muc-tieu" | "kr";
	objectiveId: string;
	unitName: string;
	title: string;
	progress: number;
	status: (typeof TRANG_THAI_MUC_TIEU)[number];
	kind: (typeof LOAI_MUC_TIEU)[number];
	gop: number;
	lapLai: boolean;
	children: NutCanChinh[];
};
export const alignmentTreeInput = z.object({ cycleId: ma });
export const alignmentTreeOutput = z.object({
	roots: z.array(nutCanChinh),
	chuaCanChinh: z.array(nutCanChinh),
});
export const importInput = z.object({
	cycleId: ma,
	unit: donViChon,
	text: z.string().max(OKR.lo.toiDaKyTu),
});
export const importApplyInput = importInput.extend({ congBo: z.boolean() });
export const dongNhapOutput = z.object({
	line: z.number(),
	objective: z.string(),
	keyResult: z.string(),
	kind: z.string(),
	start: z.string(),
	target: z.string(),
	unit: z.string(),
	email: z.string(),
	error: z.string().nullable(),
});
export const importPreviewOutput = z.object({
	rows: z.array(dongNhapOutput),
	summary: z.object({ valid: z.number(), invalid: z.number(), objectives: z.number() }),
});
export const importApplyOutput = z.object({
	written: z.number(),
	objectives: z.number(),
	keyResults: z.number(),
});

export type ChuKyOutput = z.infer<typeof chuKyOutput>;
export type MucTieuOutput = z.infer<typeof mucTieuOutput>;
export type KrOutput = z.infer<typeof krOutput>;
export type DonViChon = z.infer<typeof donViChon>;
export type DongNhapOutput = z.infer<typeof dongNhapOutput>;
export type { DonViMucTieu } from "@crm/validation/okr-muc-tieu";
```

- [ ] **Step 4: Viết `okr-access.service.ts`**

```ts
import { isWorkspaceAdmin, type WorkspaceRole, workspaceRoleOf } from "@crm/auth";
import type { Db } from "@crm/db";
import { HANG_CAP } from "@crm/validation/okr-muc-tieu";
import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { ToChucService } from "../to-chuc/to-chuc.service";
import type { TreeOutput } from "../to-chuc/to-chuc.contracts";
import { OKR } from "./okr-config";

export type DonViCuaMucTieu = {
	level: keyof typeof HANG_CAP;
	divisionId: string | null;
	departmentId: string | null;
	personUserId: string | null;
};

export type Quyen = {
	role: WorkspaceRole;
	quanTri: boolean;
	truongBoPhan: Set<string>;
	truongPhongBan: Set<string>;
	boPhanCua: Map<string, string | null>;
	phongBanChinh: Map<string, string | null>;
	cay: TreeOutput;
};

@Injectable()
export class OkrAccessService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(ToChucService) private readonly toChuc: ToChucService,
	) {}

	async quyen(userId: string): Promise<Quyen> {
		const role = await workspaceRoleOf(userId);
		if (!role) throw new ForbiddenException("You are not a member of this workspace.");
		const cay = await this.toChuc.tree();
		const truongBoPhan = new Set(
			cay.divisions.filter((b) => b.head?.id === userId).map((b) => b.id),
		);
		const moiPb = [...cay.divisions.flatMap((b) => b.departments), ...cay.chuaXep];
		const truongPhongBan = new Set(
			moiPb.filter((p) => p.head?.id === userId).map((p) => p.id),
		);
		return {
			role,
			quanTri: isWorkspaceAdmin(role),
			truongBoPhan,
			truongPhongBan,
			boPhanCua: new Map(moiPb.map((p) => [p.id, p.divisionId])),
			phongBanChinh: new Map(cay.people.map((n) => [n.id, n.primaryDepartmentId])),
			cay,
		};
	}

	suaDuocDonVi(q: Quyen, userId: string, dv: DonViCuaMucTieu): boolean {
		switch (dv.level) {
			case "onehub":
				return q.quanTri;
			case "bo-phan":
				return dv.divisionId !== null && q.truongBoPhan.has(dv.divisionId);
			case "phong-ban": {
				if (dv.departmentId === null) return false;
				if (q.truongPhongBan.has(dv.departmentId)) return true;
				const bp = q.boPhanCua.get(dv.departmentId) ?? null;
				return bp !== null && q.truongBoPhan.has(bp);
			}
			case "ca-nhan": {
				if (dv.personUserId === null) return false;
				if (dv.personUserId === userId) return true;
				const pb = q.phongBanChinh.get(dv.personUserId) ?? null;
				if (pb === null) return false;
				if (q.truongPhongBan.has(pb)) return true;
				const bp = q.boPhanCua.get(pb) ?? null;
				return bp !== null && q.truongBoPhan.has(bp);
			}
		}
	}

	async assertQuanTri(userId: string): Promise<void> {
		if (!isWorkspaceAdmin(await workspaceRoleOf(userId)))
			throw new ForbiddenException(OKR.thongDiep.canQuyenQuanTri);
	}

	async assertSuaDonVi(userId: string, dv: DonViCuaMucTieu): Promise<Quyen> {
		const q = await this.quyen(userId);
		if (!this.suaDuocDonVi(q, userId, dv))
			throw new ForbiddenException(OKR.thongDiep.khongSuaDuocDonVi);
		return q;
	}

	async assertNhapDuoc(userId: string, dv: DonViCuaMucTieu): Promise<Quyen> {
		const q = await this.quyen(userId);
		if (!q.quanTri && !this.suaDuocDonVi(q, userId, dv))
			throw new ForbiddenException(OKR.thongDiep.khongSuaDuocDonVi);
		return q;
	}

	async assertSuaMucTieu(userId: string, objectiveId: string) {
		const mt = await this.db.okrObjective.findUnique({
			where: { id: objectiveId },
			select: { id: true, cycleId: true, level: true, divisionId: true, departmentId: true, personUserId: true, status: true },
		});
		if (!mt) throw new NotFoundException(OKR.thongDiep.khongCoMucTieu(objectiveId));
		await this.assertSuaDonVi(userId, mt as DonViCuaMucTieu);
		return mt;
	}

	async assertSuaKr(userId: string, keyResultId: string) {
		const kr = await this.db.okrKeyResult.findUnique({
			where: { id: keyResultId },
			include: { objective: { select: { id: true, cycleId: true, level: true, divisionId: true, departmentId: true, personUserId: true, status: true } } },
		});
		if (!kr) throw new NotFoundException(OKR.thongDiep.khongCoKr(keyResultId));
		if (kr.ownerUserId === userId) return kr;
		const q = await this.quyen(userId);
		if (!this.suaDuocDonVi(q, userId, kr.objective as DonViCuaMucTieu))
			throw new ForbiddenException(OKR.thongDiep.khongSuaDuocKr);
		return kr;
	}
}
```

- [ ] **Step 5: Viết `okr.service.ts` phần chu kỳ, cấu hình, access, khoá pha, vết**

```ts
import { isWorkspaceAdmin, WORKSPACE_ID, workspaceRoleOf } from "@crm/auth";
import type { Db, Prisma } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";
import { type ChuKyInput, ghiDuocOPha, PHA_CHU_KY, type PhaChuKy } from "@crm/validation/okr-chu-ky";
import { OKR_PROGRAM_MAC_DINH, type OkrProgram } from "@crm/validation/okr-chuong-trinh";
import type { HanhDongVet, OkrVetSnapshot } from "@crm/validation/okr-vet";
import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { OkrAccessService } from "./okr-access.service";
import { OKR } from "./okr-config";
import type { ChuKyOutput } from "./okr.contracts";
import { chonChuKyHienTai } from "./tien-do";

const T = OKR.thongDiep;
type Tx = Prisma.TransactionClient;

const ngay = (d: Date) => ngayVN(d);
const toDate = (s: string) => new Date(`${s}T00:00:00Z`);

@Injectable()
export class OkrService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrAccessService) private readonly access: OkrAccessService,
	) {}

	async access(userId: string) {
		const q = await this.access.quyen(userId);
		return {
			canManageProgram: q.quanTri,
			headOf: { divisions: [...q.truongBoPhan], departments: [...q.truongPhongBan] },
		};
	}

	private chuKyRa(c: {
		id: string; kind: string; name: string; parentId: string | null; startsOn: Date; endsOn: Date;
		phase: string; breakStartsOn: Date | null; breakEndsOn: Date | null; updateWeekday: number;
	}): ChuKyOutput {
		return {
			id: c.id,
			kind: c.kind as ChuKyOutput["kind"],
			name: c.name,
			parentId: c.parentId,
			startsOn: ngay(c.startsOn),
			endsOn: ngay(c.endsOn),
			phase: c.phase as PhaChuKy,
			breakStartsOn: c.breakStartsOn ? ngay(c.breakStartsOn) : null,
			breakEndsOn: c.breakEndsOn ? ngay(c.breakEndsOn) : null,
			updateWeekday: c.updateWeekday,
		};
	}

	async cycles(homNay = new Date()) {
		const rows = await this.db.okrCycle.findMany({ orderBy: [{ startsOn: "desc" }, { kind: "asc" }] });
		const cycles = rows.map((c) => this.chuKyRa(c));
		return { cycles, currentId: chonChuKyHienTai(cycles, ngay(homNay))?.id ?? null };
	}

	async createCycle(userId: string, input: ChuKyInput) {
		await this.access.assertQuanTri(userId);
		return this.db.$transaction(async (tx) => {
			if (input.kind === "nam" && input.parentId !== null) throw new BadRequestException(T.namKhongCoCha);
			if (input.kind === "quy") {
				if (input.parentId === null) throw new BadRequestException(T.namKhongCoCha);
				const cha = await tx.okrCycle.findUnique({ where: { id: input.parentId } });
				if (!cha || cha.kind !== "nam") throw new NotFoundException(T.khongCoChuKy(input.parentId));
				if (input.startsOn < ngay(cha.startsOn) || input.endsOn > ngay(cha.endsOn)) throw new BadRequestException(T.quyNgoaiNam);
				const anhEm = await tx.okrCycle.findMany({ where: { parentId: cha.id } });
				const chong = anhEm.find((q) => ngay(q.startsOn) <= input.endsOn && input.startsOn <= ngay(q.endsOn));
				if (chong) throw new BadRequestException(T.quyChong(chong.name));
			}
			const c = await tx.okrCycle.create({
				data: {
					kind: input.kind, name: input.name, parentId: input.parentId,
					startsOn: toDate(input.startsOn), endsOn: toDate(input.endsOn),
					breakStartsOn: input.breakStartsOn ? toDate(input.breakStartsOn) : null,
					breakEndsOn: input.breakEndsOn ? toDate(input.breakEndsOn) : null,
					updateWeekday: input.updateWeekday,
				},
			});
			await this.vet(tx, userId, "tao-chu-ky", { cycleId: c.id }, null, { name: c.name, kind: c.kind });
			return { id: c.id, canhBao: null };
		});
	}

	async setCyclePhase(userId: string, id: string, phase: PhaChuKy) {
		await this.access.assertQuanTri(userId);
		return this.db.$transaction(async (tx) => {
			const c = await tx.okrCycle.findUnique({ where: { id } });
			if (!c) throw new NotFoundException(T.khongCoChuKy(id));
			const cu = PHA_CHU_KY.indexOf(c.phase as PhaChuKy);
			const moi = PHA_CHU_KY.indexOf(phase);
			if (moi <= cu) throw new BadRequestException(T.phaChiDiToi);
			await tx.okrCycle.update({ where: { id }, data: { phase } });
			await this.vet(tx, userId, "doi-pha", { cycleId: id }, { phase: c.phase }, { phase });
			return { id, canhBao: null };
		});
	}

	async program(tx: Tx | Db = this.db): Promise<OkrProgram & { version: number }> {
		const row = await tx.okrProgramConfig.findFirst({ orderBy: { version: "desc" } });
		if (!row) return { ...OKR_PROGRAM_MAC_DINH, version: 0 };
		return {
			version: row.version, objectiveCap: row.objectiveCap, krCap: row.krCap,
			capMode: row.capMode as OkrProgram["capMode"], scoreScale: row.scoreScale as OkrProgram["scoreScale"],
			weightsOn: row.weightsOn, personalOn: row.personalOn,
		};
	}

	async setProgram(userId: string, input: OkrProgram) {
		await this.access.assertQuanTri(userId);
		return this.db.$transaction(async (tx) => {
			const cu = await this.program(tx);
			const row = await tx.okrProgramConfig.create({ data: { ...input, version: cu.version + 1, createdById: userId } });
			await this.vet(tx, userId, "cau-hinh", {}, { version: cu.version }, { ...input, version: row.version });
			return { ...input, version: row.version };
		});
	}

	async assertKyGhiDuoc(tx: Tx, cycleId: string) {
		const c = await tx.okrCycle.findUnique({ where: { id: cycleId }, select: { phase: true } });
		if (!c) throw new NotFoundException(T.khongCoChuKy(cycleId));
		if (!ghiDuocOPha(c.phase as PhaChuKy)) throw new BadRequestException(T.kyDaKhoa);
	}

	async vet(
		tx: Tx,
		actorUserId: string,
		action: HanhDongVet,
		dich: { cycleId?: string; objectiveId?: string; keyResultId?: string },
		before: OkrVetSnapshot | null,
		after: OkrVetSnapshot | null,
		note: string | null = null,
	) {
		await tx.okrTrail.create({
			data: {
				actorUserId, action, note,
				cycleId: dich.cycleId ?? null, objectiveId: dich.objectiveId ?? null, keyResultId: dich.keyResultId ?? null,
				before: before === null ? undefined : before,
				after: after === null ? undefined : after,
			},
		});
	}
}
```

- [ ] **Step 6: Viết `okr.router.ts` (phần chu kỳ/cấu hình; các thủ tục sau thêm ở Task 3–6) và `okr.module.ts`, đăng ký `AppModule`**

```ts
import { Inject } from "@nestjs/common";
import { Ctx, Input, Mutation, Query, Router, UseMiddlewares } from "nestjs-trpc";
import type { z } from "zod";
import type { AuthedTrpcContext } from "../trpc/context.types";
import { PhamViOkrMiddleware } from "../trpc/middlewares/pham-vi-du-lieu.middleware";
import { restMeta } from "../trpc/openapi";
import { accessOutput, createCycleInput, cyclesOutput, okOutput, programOutput, setCyclePhaseInput, setProgramInput } from "./okr.contracts";
import { OkrService } from "./okr.service";

const TAG = ["OKR"];

@Router({ alias: "okr" })
@UseMiddlewares(PhamViOkrMiddleware)
export class OkrRouter {
	constructor(@Inject(OkrService) private readonly okr: OkrService) {}

	@Query({ output: accessOutput, meta: restMeta("GET", "/okr/access", TAG) })
	access(@Ctx() ctx: AuthedTrpcContext) {
		return this.okr.access(ctx.user.id);
	}

	@Query({ output: cyclesOutput, meta: restMeta("GET", "/okr/cycles", TAG) })
	cycles() {
		return this.okr.cycles();
	}

	@Mutation({ input: createCycleInput, output: okOutput, meta: restMeta("POST", "/okr/cycles", TAG) })
	createCycle(@Ctx() ctx: AuthedTrpcContext, @Input() input: z.infer<typeof createCycleInput>) {
		return this.okr.createCycle(ctx.user.id, input);
	}

	@Mutation({ input: setCyclePhaseInput, output: okOutput, meta: restMeta("POST", "/okr/cycles/{id}/phase", TAG) })
	setCyclePhase(@Ctx() ctx: AuthedTrpcContext, @Input() input: z.infer<typeof setCyclePhaseInput>) {
		return this.okr.setCyclePhase(ctx.user.id, input.id, input.phase);
	}

	@Query({ output: programOutput, meta: restMeta("GET", "/okr/program", TAG) })
	program() {
		return this.okr.program();
	}

	@Mutation({ input: setProgramInput, output: programOutput, meta: restMeta("PUT", "/okr/program", TAG) })
	setProgram(@Ctx() ctx: AuthedTrpcContext, @Input() input: z.infer<typeof setProgramInput>) {
		return this.okr.setProgram(ctx.user.id, input);
	}
}
```

`okr.module.ts`:

```ts
import { Module } from "@nestjs/common";
import { ToChucModule } from "../to-chuc/to-chuc.module";
import { TrpcModule } from "../trpc/trpc.module";
import { OkrAccessService } from "./okr-access.service";
import { OkrRouter } from "./okr.router";
import { OkrService } from "./okr.service";

@Module({
	imports: [TrpcModule, ToChucModule],
	providers: [OkrAccessService, OkrService, OkrRouter],
})
export class OkrModule {}
```

`app.module.ts`: thêm `import { OkrModule } from "./okr/okr.module";` và `OkrModule,` sau `ToChucModule,`.

- [ ] **Step 7: Viết sàn `okr-san.ts` và bài `chu-ky`, `chuong-trinh` trong `okr.spec.ts` (đỏ trước khi router chạy, xanh sau)**

`apps/api/test/okr-san.ts`: chép khung `to-chuc-san.ts` (`goi`, `doc`, `ok`, `tao`, `nguoiMoi`, `dungSan`) với `TIEN_TO = \`dok${…}\``, thêm phiên `okr` (role `okr`) vào `phien`, và `afterAll` xoá theo thứ tự: `okrTrail` (actorUserId startsWith TIEN_TO hoặc objectiveId in fixture), `okrAlignment`, `okrKeyResult`, `okrParticipant`, `okrObjective` (cycle.name startsWith TIEN_TO), `okrCycle` (name startsWith TIEN_TO, con trước cha), `okrProgramConfig` (createdById startsWith TIEN_TO), rồi cây tổ chức và người như `to-chuc-san`. Thêm helper:

```ts
export const taoNam = (ten: string, nam: number) =>
	tao("okr.createCycle", { kind: "nam", name: ma(ten), parentId: null, startsOn: `${nam}-01-01`, endsOn: `${nam}-12-31`, breakStartsOn: null, breakEndsOn: null, updateWeekday: 1 }, `nam ${ten}`);
export const taoQuy = (ten: string, parentId: string, tu: string, den: string) =>
	tao("okr.createCycle", { kind: "quy", name: ma(ten), parentId, startsOn: tu, endsOn: den, breakStartsOn: null, breakEndsOn: null, updateWeekday: 1 }, `quy ${ten}`);
export const dangChay = (id: string) => ok(await goi("okr.setCyclePhase", { id, phase: "dang-chay" }), "dang chay");
```

`apps/api/test/okr.spec.ts` (mở đầu):

```ts
import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { chonChuKyHienTai } from "../src/okr/tien-do";
import { dungSan, goi, doc, ma, ok, phien, tao, taoNam, taoQuy } from "./okr-san";

dungSan();

describe("chu-ky", () => {
	test("chu-ky: nam va quy doc lai dung 16 o, tu choi 5 ca, hien tai theo ngay VN", async () => {
		const nam = await taoNam("nam", 2026);
		const quy = await tao("okr.createCycle", { kind: "quy", name: ma("q4"), parentId: nam, startsOn: "2026-10-01", endsOn: "2026-12-31", breakStartsOn: "2026-11-01", breakEndsOn: "2026-11-03", updateWeekday: 1 }, "q4");
		ok(await goi("okr.setCyclePhase", { id: quy, phase: "dang-chay" }), "pha");
		const rows = await db.okrCycle.findMany({ where: { id: { in: [nam, quy] } }, orderBy: { kind: "asc" } });
		const ngay = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);
		const mong = [
			["nam", null, "2026-01-01", "2026-12-31", null, null, 1, "lap-ke-hoach"],
			["quy", nam, "2026-10-01", "2026-12-31", "2026-11-01", "2026-11-03", 1, "dang-chay"],
		];
		expect(rows.map((r) => [r.kind, r.parentId, ngay(r.startsOn), ngay(r.endsOn), ngay(r.breakStartsOn), ngay(r.breakEndsOn), r.updateWeekday, r.phase])).toEqual(mong);
		const truoc = await db.okrCycle.count();
		const tuChoi = [
			{ vao: { kind: "quy", name: ma("x"), parentId: nam, startsOn: "2026-12-01", endsOn: "2027-01-31", breakStartsOn: null, breakEndsOn: null, updateWeekday: 1 }, ai: "quan", loi: "Quý phải nằm trọn trong năm cha." },
			{ vao: { kind: "quy", name: ma("y"), parentId: nam, startsOn: "2026-11-15", endsOn: "2026-12-15", breakStartsOn: null, breakEndsOn: null, updateWeekday: 1 }, ai: "quan", loi: "Chồng ngày" },
			{ vao: { kind: "nam", name: ma("z"), parentId: null, startsOn: "2027-01-01", endsOn: "2027-12-31", breakStartsOn: null, breakEndsOn: null, updateWeekday: 1 }, ai: "thuong", loi: "Cần quyền quản trị" },
			{ vao: { kind: "nam", name: ma("w"), parentId: null, startsOn: "2027-01-01", endsOn: "2027-12-31", breakStartsOn: null, breakEndsOn: null, updateWeekday: 1 }, ai: "okr", loi: "Cần quyền quản trị" },
		] as const;
		for (const c of tuChoi) {
			const r = await goi("okr.createCycle", c.vao, c.ai);
			expect(`${c.loi}: ${r.status} ${r.loi}`).toContain(`${c.loi}`);
			expect(r.status).not.toBe(200);
		}
		const lui = await goi("okr.setCyclePhase", { id: quy, phase: "lap-ke-hoach" });
		expect(lui.loi).toBe("Pha chu kỳ chỉ đi tới, không lùi.");
		expect(await db.okrCycle.count()).toBe(truoc);
		const cs = (await doc<{ cycles: { id: string; kind: string; phase: string; startsOn: string; endsOn: string }[] }>("okr.cycles")).cycles;
		expect(chonChuKyHienTai(cs, "2026-11-15")?.id).toBe(quy);
		expect(chonChuKyHienTai(cs, "2027-01-15")?.id).not.toBe(quy);
	});
});
```

Bài `chuong-trinh` cùng khuôn: ghi cấu hình `{objectiveCap:2,krCap:2,capMode:"canh-bao",scoreScale:"0-1",weightsOn:true,personalOn:false}`, đọc `okrProgramConfig` orderBy version desc take 2, khẳng định version mới = cũ + 1 và dòng cũ toEqual bản chụp trước; member ghi → 403. (Phần trần và cá nhân thêm ở Task 3 sau khi có `createObjective`.)

- [ ] **Step 8: Sinh types, chạy bài kiểm**

Run: `cd apps/api && bun run trpc:generate && bun run test -- "cd apps/api && bun test test/okr.spec.ts -t chu-ky"` (chạy từ gốc kho: `bun run test -- "cd apps/api && bun test test/okr.spec.ts -t chu-ky"`)
Expected: PASS. Ca `TZ`: chạy thêm `TZ=America/Los_Angeles bun run test -- "…-t chu-ky"` — vẫn PASS (ngày so theo chuỗi).

- [ ] **Step 9: Commit**

```bash
git add apps/api/src/okr apps/api/src/app.module.ts apps/api/src/generated/server.ts apps/api/test/okr-san.ts apps/api/test/okr.spec.ts
git commit -m "okr: module okr — chu kỳ, cấu hình chương trình, quyền theo bản ghi, vết"
```

---

### Task 3: Mục tiêu, KR, công bố, bỏ, khoá pha, vết

Phục vụ E3, E4 (b), E5, E8, phần trần của E2. `independent: false`.

**Files:**
- Modify: `apps/api/src/okr/okr.service.ts`, `okr.router.ts`
- Modify: `apps/api/test/okr.spec.ts` (thêm `describe("muc-tieu")`, `("sau-kieu-kr")`, `("cong-bo")`, `("vet-okr")`, bổ sung `chuong-trinh`)

**Interfaces:**
- Produces: `OkrService.{createObjective, updateObjective, publishObjective, dropObjective, createKeyResult, updateKeyResult, removeKeyResult, objective, byUnit, mine}`; hàm nội bộ `docMucTieu(tx, ids, viewerId, q)` trả `MucTieuOutput[]`.

- [ ] **Step 1: Viết bài `muc-tieu` (đỏ trước)** — gieo cây qua `org.*` (`org.createDivision`, `org.createDepartment`, `org.setHead` sau khi `org.setPlacement` cho trưởng phòng ban), chu kỳ đang chạy, `okr.setProgram` với `personalOn: true`. Bốn lượt `okr.createObjective` bởi bốn phiên (dùng `mintPhien` cho trưởng P và B như `okr-san` cấp `phienCua(userId)`). Đọc `db.okrObjective.findMany({ where: { id: { in } }, include: { participants: true } })`, so ma trận 4 × 9 ô bằng `toEqual` trên mảng tuple. Ba ca từ chối: `{ level: "phong-ban" }` thiếu `departmentId` (400 Zod), `{ level: "bo-phan", divisionId, departmentId }` (400 Zod — discriminatedUnion loại), `ownerUserId: "khong-co"` → 400 `T.khongPhaiThanhVien`. `updateObjective` đổi title/kind/participantIds → đọc lại đúng 3 ô, `whyNow` không đổi.

- [ ] **Step 2: Viết service phần mục tiêu**

Trong `okr.service.ts` thêm:

```ts
	private donViCua(unit: DonViMucTieu) {
		return {
			level: unit.level,
			divisionId: unit.level === "bo-phan" ? unit.divisionId : null,
			departmentId: unit.level === "phong-ban" ? unit.departmentId : null,
			personUserId: unit.level === "ca-nhan" ? unit.personUserId : null,
		};
	}

	private async assertThanhVien(tx: Tx, ids: string[]) {
		const co = await tx.member.findMany({ where: { organizationId: WORKSPACE_ID, userId: { in: ids } }, select: { userId: true } });
		const thieu = ids.find((id) => !co.some((m) => m.userId === id));
		if (thieu) throw new BadRequestException(T.khongPhaiThanhVien(thieu));
	}

	private async kiemTranMucTieu(tx: Tx, cycleId: string, dv: ReturnType<OkrService["donViCua"]>, them: number) {
		const ct = await this.program(tx);
		const dem = await tx.okrObjective.count({ where: { cycleId, level: dv.level, divisionId: dv.divisionId, departmentId: dv.departmentId, personUserId: dv.personUserId, status: { not: "da-bo" } } });
		if (dem + them <= ct.objectiveCap) return null;
		if (ct.capMode === "chan") throw new BadRequestException(T.vuotTranMucTieu(dem));
		return T.vuotTranMucTieu(dem);
	}

	async createObjective(userId: string, input: MucTieuInput) {
		const dv = this.donViCua(input.unit);
		await this.access.assertSuaDonVi(userId, dv);
		return this.db.$transaction(async (tx) => {
			await this.assertKyGhiDuoc(tx, input.cycleId);
			if (dv.level === "ca-nhan" && !(await this.program(tx)).personalOn) throw new BadRequestException(T.caNhanTat);
			await this.assertThanhVien(tx, [input.ownerUserId, ...input.participantIds]);
			const canhBao = await this.kiemTranMucTieu(tx, input.cycleId, dv, 1);
			const viTri = await tx.okrObjective.count({ where: { cycleId: input.cycleId } });
			const mt = await tx.okrObjective.create({
				data: { cycleId: input.cycleId, ...dv, ownerUserId: input.ownerUserId, kind: input.kind, title: input.title, whyNow: input.whyNow, position: viTri,
					participants: { create: input.participantIds.map((u) => ({ userId: u })) } },
			});
			await this.vet(tx, userId, "tao", { objectiveId: mt.id, cycleId: mt.cycleId }, null, { title: mt.title, kind: mt.kind, level: mt.level, status: mt.status });
			return { id: mt.id, canhBao };
		});
	}
```

`updateObjective`: `assertSuaMucTieu` → transaction: `assertKyGhiDuoc`, từ chối nếu `status === "da-bo"` (`T.daBo`), kiểm thành viên nếu có owner/participants, `before`/`after` chỉ chứa các ô có trong input (title, kind, ownerUserId, whyNow, participantIds), `update` + `participants: { deleteMany: {}, create }` khi có `participantIds`, vết `sua`.

`publishObjective`: `assertSuaMucTieu` → transaction: `assertKyGhiDuoc`, `status !== "nhap"` → 400 (`T.daCongBo` / `T.daBo`), đếm KR = 0 → 400 `T.congBoCanKr`, `update { status: "cong-bo", publishedAt: now }`, `okrKeyResult.updateMany({ where: { objectiveId, startLockedAt: null }, data: { startLockedAt: now } })`, vết `cong-bo` before `{status:"nhap"}` after `{status:"cong-bo"}`.

`dropObjective`: tương tự → `da-bo`, `droppedAt`, vết `bo`.

- [ ] **Step 3: Viết service phần KR**

```ts
	private soKr = (d: Prisma.Decimal | number) => Number(d);

	private assertSoTheoKieu(kind: KieuKr, khoi: number, dich: number) {
		const loi = kiemSoTheoKieu(kind, khoi, dich);
		if (loi) throw new BadRequestException(T.soTheoKieu[loi]);
	}

	async createKeyResult(userId: string, input: KrInput & { objectiveId: string }) {
		const mt = await this.access.assertSuaMucTieu(userId, input.objectiveId);
		return this.db.$transaction(async (tx) => {
			await this.assertKyGhiDuoc(tx, mt.cycleId);
			if (mt.status === "da-bo") throw new BadRequestException(T.daBo);
			this.assertSoTheoKieu(input.kind, input.startValue, input.targetValue);
			await this.assertThanhVien(tx, [input.ownerUserId]);
			const ct = await this.program(tx);
			const dem = await tx.okrKeyResult.count({ where: { objectiveId: mt.id } });
			let canhBao: string | null = null;
			if (dem + 1 > ct.krCap) {
				if (ct.capMode === "chan") throw new BadRequestException(T.vuotTranKr(dem));
				canhBao = T.vuotTranKr(dem);
			}
			const kr = await tx.okrKeyResult.create({
				data: { objectiveId: mt.id, title: input.title, kind: input.kind, ownerUserId: input.ownerUserId, startValue: input.startValue, targetValue: input.targetValue, currentValue: input.currentValue, unit: input.unit, dueOn: input.dueOn ? toDate(input.dueOn) : null, weight: input.weight, position: dem,
					startLockedAt: mt.status === "cong-bo" ? new Date() : null },
			});
			await this.vet(tx, userId, "tao-kr", { objectiveId: mt.id, keyResultId: kr.id }, null, { title: kr.title, kind: kr.kind, startValue: input.startValue, targetValue: input.targetValue });
			return { id: kr.id, canhBao };
		});
	}
```

`updateKeyResult`: `assertSuaKr` → transaction: `assertKyGhiDuoc(kr.objective.cycleId)`; nếu `input.startValue !== undefined && kr.startLockedAt !== null && input.startValue !== soKr(kr.startValue)` → 400 `T.khoiDiemDaKhoa`; kiểm số theo kiểu với giá trị gộp; before/after chỉ ô đổi; vết `sua-kr`. `removeKeyResult`: `assertSuaMucTieu(kr.objectiveId)`, xoá, vết `xoa-kr` before `{title}`.

- [ ] **Step 4: Viết phần đọc: `docMucTieu`, `byUnit`, `mine`, `objective`**

`docMucTieu(tx, where, viewerId, q, homNay)`: `findMany` include `owner`, `participants.user`, `keyResults.owner` (orderBy position), `alignments` với `targetObjective` (select title, level, divisionId, departmentId, personUserId, division.name, department.name, person.name) và `targetKeyResult` (title), `cycle` (endsOn, breakStartsOn, breakEndsOn). Tên đơn vị: `onehub` → «OneHub» (tên workspace lấy từ `workspace.get`? không — dùng hằng `OKR.tenGoc = "OneHub"` thêm vào config), bộ phận/phòng ban từ relation, cá nhân từ `person.name`. `progress` = trung bình `tienDoKr` (có trọng số khi `weightsOn`); `expected` = `kyVongTheoNgay(publishedAt, cycle.endsOn, homNay, nghi)`; `canEdit = access.suaDuocDonVi(q, viewerId, mt)`; `laCuaToi = kr.ownerUserId === viewerId`.

`byUnit`: lọc `where` theo `unit` (`goc` → level onehub; `bp` → divisionId; `pb` → departmentId; `nguoi` → personUserId), `canEdit` của đơn vị, `canhBao` null. `mine`: `OR: [{ ownerUserId }, { participants: { some: { userId } } }, { keyResults: { some: { ownerUserId } } }]`. `objective`: một mục tiêu + `trail` (findMany orderBy at asc, join `user` cho actor bằng `findMany` id in) + `canEditKr` (KR mà viewer là owner hoặc `canEdit`).

Router: thêm `byUnit`, `mine`, `objective` (Query), `createObjective`, `updateObjective`, `publishObjective`, `dropObjective`, `createKeyResult`, `updateKeyResult`, `removeKeyResult` (Mutation) với `restMeta` `GET /okr/units/objectives`, `GET /okr/mine`, `GET /okr/objectives/{id}`, `POST /okr/objectives`, `PATCH /okr/objectives/{id}`, `POST /okr/objectives/{id}/publish`, `POST /okr/objectives/{id}/drop`, `POST /okr/key-results`, `PATCH /okr/key-results/{id}`, `DELETE /okr/key-results/{id}`.

- [ ] **Step 5: Viết bài `sau-kieu-kr`, `cong-bo`, `vet-okr`, bổ sung `chuong-trinh`**

`sau-kieu-kr`: 6 KR đủ 6 kiểu, owner khác nhau; đọc `db.okrKeyResult`, ma trận 6 × 9 tuple `toEqual`; 4 ca từ chối với câu ghim đúng `OKR.thongDiep.soTheoKieu.*` và Zod cho kiểu lạ; `removeKeyResult` → count 5 và `db.okrTrail.findFirst({ where: { keyResultId, action: "xoa-kr" } })` khác null; ca `owner-roi`: `workspace.removeMember` (hoặc `db.member.delete`) người owner → `okr.objective` vẫn 200, KR còn `owner.name`.

`cong-bo`: theo expected E5 — ma trận 11 thủ tục × 2 pha là mảng hằng `THU_TUC_GHI` trong bài, mỗi phần tử `{ ten, vao: () => Json }` với đầu vào hợp lệ tính từ fixture; đối chứng dương ở `dang-chay` (11 × 200 — với `applyImport` dùng lô 1 dòng mới; `removeKeyResult`/`removeAlignment` tạo trước rồi xoá), rồi `setCyclePhase cham-diem` → 11 × 400 `T.kyDaKhoa`, `da-dong` → 11 × 400; so `toEqual` mảng `[ten, pha, status]`. Bản ghi đích: chụp `db.okrObjective.findUnique` + `db.okrKeyResult.findMany` trước/sau, `toEqual`.

`vet-okr`: đếm `db.activity.count()` trước; chuỗi 11 thủ tục (bảng `[ai, thuTuc, vao]`); đọc `db.okrTrail.findMany({ where: { OR: [{ objectiveId }, { cycleId }, { action: "cau-hinh", actorUserId: phien.quan.nguoi }] }, orderBy: { at: "asc" } })`; ma trận 11 × `[actorUserId, action, dichId]`; `parseOkrVet(before/after)` không ném; dòng `sua` `before.title !== after.title && before.kind === undefined`; dòng `cong-bo` `{status: nhap} → {status: cong-bo}`; `db.activity.count()` bằng; thêm một thủ tục → 12.

`chuong-trinh` bổ sung: objectiveCap 2 canh-bao → mục tiêu thứ 3 200 với `canhBao` chuỗi; `setProgram capMode chan` → thứ 4 400 `T.vuotTranMucTieu(3)`; `personalOn false` → cấp cá nhân 400 `T.caNhanTat`; bật → 200.

- [ ] **Step 6: Chạy bốn khoá, xanh**

Run (gốc kho): `bun run test -- "cd apps/api && bun test test/okr.spec.ts -t muc-tieu"`, `… -t sau-kieu-kr`, `… -t cong-bo`, `… -t vet-okr`, `… -t chuong-trinh`, và `cd packages/validation && bun test test/okr-kr.spec.ts`.
Expected: PASS tất cả.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/okr apps/api/src/generated/server.ts apps/api/test/okr.spec.ts apps/api/test/okr-san.ts
git commit -m "okr: mục tiêu bốn cấp, KR sáu kiểu, công bố khoá khởi điểm, bỏ, khoá pha, vết"
```

---

### Task 4: Ma trận quyền theo bản ghi, vai «chỉ OKR», «Của tôi»

Phục vụ E6, E14, E22. `independent: false`.

**Files:**
- Modify: `apps/api/test/okr.spec.ts` (thêm `describe("quyen-ban-ghi")`, `("chi-okr")`, `("cua-toi")`)
- Modify: `apps/api/test/vai-chi-okr.spec.ts:42-51` (`ALIAS_CHO_PHEP` thêm `"okr"`)

- [ ] **Step 1: Bài `quyen-ban-ghi`** — cây B1(p1,p2) B2(p3), trưởng b1, b2, p1, p2, người k (member không vai trò) là owner một KR trên P1; 7 phiên (dùng `mintPhien`). Bảng hằng `KY_VONG: Record<Ai, boolean[]>` 7 × 8 việc `[suaP1, congBoP1, suaP2, suaB1, suaB2, suaOnehub, suaKrK, taoChuKy]`; chạy hết, gom `ketQua[ai] = viec.map(r => r.status === 200)`; `expect(ketQua).toEqual(KY_VONG)`. Hàng `b1-kiem-p3`: gán b1 cũng làm trưởng P3 → b1 sửa được P3 (thêm cột thứ 9 chỉ cho hàng b1). Đối chứng đọc: 7 người `okr.objective` và `okr.byUnit` đều 200. Mỗi việc dùng mục tiêu riêng để công bố không làm lệch việc sau.

- [ ] **Step 2: Bài `chi-okr`** — người vai `okr` được `org.setHead` làm trưởng P (sau `org.setPlacement`); `createObjective`, `createKeyResult`, `publishObjective` 200 và đọc lại DB; `org.tree` 200; người vai `okr` không trưởng: `okr.byUnit` 200, `createObjective` 403 với `T.khongSuaDuocDonVi` (khác `KHONG_TRONG_PHAM_VI`); cả hai `contacts.list`, `deals.list` → 403 `KHONG_TRONG_PHAM_VI`.

- [ ] **Step 3: Sửa `ALIAS_CHO_PHEP` thêm `"okr"`, chạy `-t ma-tran-trpc`** — PASS (tập cho phép có thêm mọi `okr.*`). Nếu `SO_MUTATION_KHONG_DAU_VAO` đổi (thêm mutation không đầu vào), cập nhật số và ghi vào sổ quyết định.

- [ ] **Step 4: Bài `cua-toi`** — fixture theo E22; `okr.mine` bằng phiên k: 3 mục tiêu, tập id `toEqual` sắp, KR `laCuaToi` đếm 1, P3 vắng; member trắng: 0; `okr.byUnit(P1)` member trắng vẫn trả P1; `okr.access`: trưởng P1 `headOf.departments` chứa P1, `canManageProgram false`; admin `true`, `headOf` rỗng.

- [ ] **Step 5: Chạy ba khoá `dok_quyen`, `dok_chi_okr`, `dok_cua_toi` — xanh. Commit**

```bash
git add apps/api/test
git commit -m "okr: ma trận quyền theo bản ghi, vai chỉ OKR làm trưởng, Của tôi"
```

---

### Task 5: Căn chỉnh nhiều–nhiều và cây căn chỉnh

Phục vụ E7. `independent: false`.

**Files:**
- Create: `apps/api/src/okr/can-chinh.ts`, `apps/api/test/okr-can-chinh.spec.ts`
- Modify: `okr.service.ts`, `okr.router.ts`, `okr.spec.ts` (`describe("can-chinh")`)

- [ ] **Step 1: Bài hàm thuần (đỏ trước)** — `dungCayCanChinh(objectives, alignments)` với 5 mục tiêu (O onehub công bố 2 KR; B bộ phận; P phòng ban; P2; K không góp) và 3 alignment (P→KR1 của O, P→B, B→O); kỳ vọng cây viết trước: `roots = [O{children:[KR1{children:[P]}, KR2{children:[]}, B{children:[P(lapLai:true)]}]}]`, `chuaCanChinh = [P2, K]`; `toEqual` toàn cây. Ca `dich-da-bo`: B `status: "da-bo"` → vẫn hiện, `status` truyền ra, không ném.

- [ ] **Step 2: Viết `can-chinh.ts`**

```ts
import type { MucTieuOutput, NutCanChinh } from "./okr.contracts";

export function dungCayCanChinh(mts: MucTieuOutput[]): { roots: NutCanChinh[]; chuaCanChinh: NutCanChinh[] } {
	const theoId = new Map(mts.map((m) => [m.id, m]));
	const gopVao = new Map<string, MucTieuOutput[]>();
	for (const m of mts) for (const a of m.alignments) {
		const k = a.targetKeyResultId ?? a.targetObjectiveId;
		gopVao.set(k, [...(gopVao.get(k) ?? []), m]);
	}
	const daHien = new Set<string>();
	const nutMt = (m: MucTieuOutput): NutCanChinh => {
		const lapLai = daHien.has(m.id);
		daHien.add(m.id);
		return {
			id: m.id, loai: "muc-tieu", objectiveId: m.id, unitName: m.unitName, title: m.title, progress: m.progress,
			status: m.status, kind: m.kind, gop: m.alignments.length, lapLai,
			children: lapLai ? [] : [
				...m.keyResults.map((k) => ({
					id: k.id, loai: "kr" as const, objectiveId: m.id, unitName: m.unitName, title: k.title, progress: k.progress,
					status: m.status, kind: m.kind, gop: 0, lapLai: false,
					children: (gopVao.get(k.id) ?? []).map(nutMt),
				})),
				...(gopVao.get(m.id) ?? []).map(nutMt),
			],
		};
	};
	const roots = mts.filter((m) => m.level === "onehub").map(nutMt);
	const chuaCanChinh = mts.filter((m) => m.level !== "onehub" && m.alignments.length === 0).map(nutMt);
	void theoId;
	return { roots, chuaCanChinh };
}
```

(Bỏ `theoId` nếu không dùng — không để biến thừa.) Trong cây, mục tiêu cấp dưới có chỗ góp nhưng đích không thuộc cùng chu kỳ (góp vào năm) vẫn nằm dưới đích ở cây của chu kỳ năm; ở cây quý nó vào `chuaCanChinh` khi không có đích cùng chu kỳ — service truyền vào `mts` gồm cả mục tiêu của chu kỳ năm cha để cây có gốc.

- [ ] **Step 3: Service `addAlignment`, `removeAlignment`, `alignmentTargets`, `alignmentTree`** — `addAlignment`: `assertSuaMucTieu(objectiveId)`; đúng một trong hai đích (`T.canChinh.khongCoDich`); tải đích (mục tiêu hoặc KR→mục tiêu); `HANG_CAP[dich.level] < HANG_CAP[nguon.level]` nếu không → `cungCap`; `dich.id === nguon.id` → `chinhNo`; `dich.status !== "cong-bo"` → `chuaCongBo`; chu kỳ: `dich.cycleId === nguon.cycleId || dich.cycleId === nguon.cycle.parentId` nếu không → `khacChuKy`; tồn tại → `daGan` (bắt `P2002` cũng vậy); `assertKyGhiDuoc`; create; vết `gan-can-chinh`. `alignmentTargets`: mục tiêu công bố cấp cao hơn cùng chu kỳ hoặc năm cha, kèm KR của chúng. `alignmentTree({cycleId})`: `docMucTieu` cho chu kỳ + chu kỳ cha (nếu có), `dungCayCanChinh`.

- [ ] **Step 4: Bài `can-chinh` trong `okr.spec.ts`** theo expected E7 (đếm 3, cây có P hai lần với `lapLai`, `alignmentTargets` so bằng tập, 6 ca từ chối câu ghim, gỡ → 2).

- [ ] **Step 5: Chạy `dok_can_chinh` — xanh. Commit**

```bash
git add apps/api/src/okr apps/api/src/generated/server.ts apps/api/test
git commit -m "okr: căn chỉnh nhiều–nhiều lên cấp trên đã công bố, cây căn chỉnh"
```

---

### Task 6: Nhập từ bảng tính — xem trước rồi ghi

Phục vụ E9. `independent: false`.

**Files:**
- Create: `apps/api/src/okr/nhap.ts`, `apps/api/test/okr-nhap.spec.ts`
- Modify: `okr.service.ts`, `okr.router.ts`, `okr.spec.ts` (`describe("nhap-bang-tinh")`)

- [ ] **Step 1: Bài hàm thuần (đỏ trước)** — `phanTichLoOkr(chu, snap)` với `SnapNhapOkr = { members: {id,email}[]; daCo: string[] (tên mục tiêu đã có, khoá); tranConLai: number | null }`; lô 12 dòng tab-separated (mỗi loại lỗi một dòng + 3 hợp lệ gom 2 mục tiêu); ma trận 12 × câu lỗi ghim; `summary {valid 3, invalid 9, objectives 2}`; ca `nhap-so-viet`: «1.250,5» → 1250.5, dòng trống bỏ, email hoa thường.

- [ ] **Step 2: Viết `nhap.ts`** — dùng lại `tachDong`/`tachO`/`boDau`/`khoa` từ `../to-chuc/nhap` (chỉ nhập, không sửa). Bảy cột `[objective, keyResult, kind, start, target, unit, email]`; kiểu tra `OKR.nhap.kieu[boDau(kind)]`; số: `Number(s.replace(/\./g,"").replace(",", "."))` khi có dấu phẩy, ngược lại `Number(s)`; `moc` cho phép trống khởi điểm/đích (0/1), `phan-tram` mặc định 0/100; kiểm `kiemSoTheoKieu`; lỗi theo thứ tự `thieuMucTieu · thieuKr · kieuLa · emailLa · thieuDich · soLa · soTheoKieu · daCo`; gom `hopLe` theo `khoa(objective)` giữ thứ tự xuất hiện; `tranConLai !== null && soMucTieuMoi > tranConLai` → mọi dòng hợp lệ lỗi `vuotTran`.

- [ ] **Step 3: Service `previewImport`/`applyImport`** — `assertNhapDuoc(userId, dv)`; `kiemLo` (`loQuaDai`, `loRong`); snapshot: members (email), `daCo` = title của mục tiêu chưa bỏ cùng đơn vị & chu kỳ, `tranConLai` = `capMode === "chan" ? objectiveCap - dem : null`; preview trả rows + summary. `applyImport`: transaction, `assertKyGhiDuoc`, phân tích lại, `hopLe.length === 0` → 400 `khongDongHopLe`; tạo mục tiêu (`ownerUserId` = trưởng đơn vị: `Department.head`/`Division.head` từ `q.cay`, quản trị nhập cho OneHub thì `userId`), KR theo dòng, `congBo` → `status cong-bo`, `publishedAt`, `startLockedAt`; vết `tao` từng mục tiêu + một vết `nhap-bang-tinh` `after {unit, cycleId, objectives, keyResults}` chỉ khi `written > 0`; trả `{written, objectives, keyResults}`.

- [ ] **Step 4: Bài `nhap-bang-tinh`** theo expected E9 (b) — kể cả admin nhập cho phòng ban mình không làm trưởng → 200, member trắng → 403, lần hai `written 0` và vết không đổi, `capMode chan` vượt trần → 400.

- [ ] **Step 5: Chạy `dok_nhap` — xanh. Commit**

```bash
git add apps/api/src/okr apps/api/src/generated/server.ts apps/api/test
git commit -m "okr: nhập bộ OKR từ bảng tính bảy cột, xem trước rồi ghi, vết cho cả lô"
```

---

### Task 7: Điều hướng — mục «Mục tiêu», slug dự trữ, phạm vi màn

Phục vụ E10. `independent: true`.

**Files:**
- Modify: `apps/app/lib/khung-dieu-huong.ts` (`MucRailKey` thêm `"okr"`, `MUC_RAIL` chèn `{ key: "okr", href: "/okr", match: "prefix" }` trước `settings`)
- Modify: `apps/app/lib/messages/khung-ung-dung.ts` (`rail.okr`: en «Objectives», vi «Mục tiêu»)
- Modify: `apps/app/components/app-icon-rail.tsx:47-56` (`okr: Target` — `import Target from "@carbon/icons-react/es/Target"`)
- Modify: `apps/app/proxy.ts:31-37` (`SECTIONS` thêm `"/okr"`)
- Modify: `packages/db/src/workspace.ts:16-30` (`RESERVED_SLUGS` thêm `"okr"` sau `"grant-access"`)
- Modify: `apps/app/lib/pham-vi-man.ts` (`RAIL_CHI_OKR` giữ `okr`)
- Modify: `apps/app/lib/search-param-keys.ts` (`okr: { ky: "ky", don: "don", xem: "xem" }` — `don` trùng tên với `toChuc.don` nhưng ở nhóm khác: `assertUnreservedSearchParamKeys` chỉ chặn khoá ngoài `SEARCH_PARAM`; hai màn khác nhau không cùng URL)
- Modify: `apps/app/lib/messages/tong-quan.ts` (`chiOkr.moTa` vi «Khu Mục tiêu đã mở — đặt và theo dõi OKR của đơn vị bạn ở đó.», `chiOkr.noiKhu` vi «Mở Mục tiêu» / en «Open Objectives»); `apps/app/app/(app)/[slug]/tong-quan-chi-okr.tsx` nút thứ nhất trỏ `workspaceUrl(slug, "/okr")`
- Modify: `apps/app/test/khung-dieu-huong.spec.ts` (8 → 9; thêm test `muc-tieu: sau 30 ngay dau, truoc cai dat, nhan Muc tieu/Objectives`), `apps/app/test/pham-vi-man.spec.ts` (`["overview","okr","settings"]`, `okr[2]` là settings, `dieuHuongTheoVai("okr","/okr/theo-don-vi")` = ok), `packages/db/test/workspace-slug.spec.ts` (thêm `expect(workspaceSlug("okr")).toBe("okr-crm")`)

- [ ] **Step 1: Sửa ba bài kiểm trước (đỏ)** — Run `cd apps/app && bun test test/khung-dieu-huong.spec.ts test/pham-vi-man.spec.ts` → FAIL (8 ≠ 9, mảng thiếu okr).
- [ ] **Step 2: Sửa tám tệp nguồn như liệt kê.**
- [ ] **Step 3: Chạy `dok_dieu_huong`** — `cd apps/app && bun test test/khung-dieu-huong.spec.ts test/pham-vi-man.spec.ts && cd ../../packages/db && bun test test/workspace-slug.spec.ts` → PASS. `cd apps/app && bun run check-types` → xanh (mọi `Record<MucRailKey, …>` đã có `okr`).
- [ ] **Step 4: Commit**

```bash
git add apps/app/lib apps/app/components/app-icon-rail.tsx apps/app/proxy.ts packages/db/src/workspace.ts apps/app/test packages/db/test "apps/app/app/(app)/[slug]/tong-quan-chi-okr.tsx"
git commit -m "okr: mục Mục tiêu trên thanh điều hướng, /okr dự trữ, vai chỉ OKR thấy ba mục"
```

---

### Task 8: Khu `/okr` — layout bốn tab, Của tôi, Theo đơn vị, Toàn cảnh

Phục vụ E11, E22 (màn). `independent: false` (cần Task 2–6 và `generated/server.ts`).

**Files:**
- Create: `apps/app/lib/messages/okr.ts` (vi/en: tiêu đề bốn tab, chu kỳ, đơn vị, nhãn KR sáu kiểu, tình trạng, trạng thái mục tiêu, nút, trạng thái rỗng/lỗi/chưa chu kỳ/chưa trưởng, hộp thoại mục tiêu/KR/căn chỉnh/nhập, sheet, vết, Cài đặt)
- Create: `apps/app/app/(app)/[slug]/okr/okr-search-params.ts` (`okrParsers`: `ky` `parseAsString`, `don` `parseAsDon` nhập từ `settings/organization/to-chuc-search-params` **không** — chép parser sang `okr-search-params.ts` với thêm `nguoi:<id>`; `xem` `parseAsStringLiteral(["danh-sach","cay"])`)
- Create: `okr/layout.tsx` (server: `requireSession`, prefetch `okr.cycles`, `okr.access`, `org.tree`; `PageShell` với `PageShellHeader` tiêu đề theo tab + `ChonChuKy` + `Tabs variant="line"` ba `TabsTrigger` là `Link`), `okr/chon-chu-ky.tsx` (client `Select` ghi `ky` lên URL), `okr/thanh-tab.tsx`
- Create: `okr/page.tsx` (Của tôi: `okr.mine`), `okr/cua-toi.tsx`
- Create: `okr/theo-don-vi/page.tsx`, `okr/theo-don-vi/theo-don-vi.tsx`, `okr/cay-don-vi.tsx`, `okr/khoi-muc-tieu.tsx`, `okr/bang-kr.tsx`, `okr/cay-can-chinh.tsx`, `okr/tien-do-kr.tsx` (`Progress` + `StatusIndicator` + nhãn), `okr/trang-thai-okr.tsx` (`DangTai`, `Loi`, `ChuaChuKy`, `Rong`)
- Create: `okr/toan-canh/page.tsx` (`Empty` «Toàn cảnh mở ở lượt 5»)

**Interfaces:**
- Consumes: `RouterOutputs["okr"]["byUnit"|"mine"|"alignmentTree"|"cycles"|"access"]`, `RouterOutputs["org"]["tree"]`.
- Produces: `useChuKy()` trả `{ cycles, currentId, ky, datKy }`; `KhoiMucTieu({ mucTieu, hienDonVi, danhDauCuaToi })`; `TienDoKr({ progress, expected, kind, laMoc })`; `NhanTrangThai({ status })`.

- [ ] **Step 1: Viết `messages/okr.ts` (khuôn `to-chuc.ts`: `const vi = {...}; const en = {...} satisfies OkrMessages; export function okrMessages(locale)`)** — bảng nhãn kiểu KR: `kieu: { "tang-toi": "Tăng tới", "giam-xuong": "Giảm xuống", "giu-tren": "Giữ trên", "giu-duoi": "Giữ dưới", moc: "Mốc", "phan-tram": "Phần trăm" }`; `tinhTrang: { "dung-nhip": "Đúng nhịp", "cham-nhip": "Chậm nhịp", truot: "Trượt", "chua-co-ky-vong": "Chưa công bố" }`; `trangThai: { nhap: "Nháp", "cong-bo": "Đã công bố", "da-bo": "Đã bỏ" }`.

- [ ] **Step 2: Viết `layout.tsx` + `thanh-tab.tsx` + `chon-chu-ky.tsx`** — tab là `Tabs value={tabHienTai}` với `TabsList variant="line"` chứa ba `TabsTrigger asChild` bọc `Link` tới `/okr`, `/okr/theo-don-vi`, `/okr/toan-canh` (giữ `?ky=`); tab hiện tại suy từ `usePathname`. Không thêm class ngoài `variant`.

- [ ] **Step 3: Viết `tien-do-kr.tsx`, `trang-thai-okr.tsx`, `khoi-muc-tieu.tsx`, `bang-kr.tsx`**

`khoi-muc-tieu.tsx` (rút gọn):

```tsx
"use client";

import { Badge } from "@crm/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@crm/ui/components/card";
import { useLocale } from "@crm/ui/components/locale-provider";
import { okrMessages } from "@/lib/messages/okr";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { BangKr } from "./bang-kr";
import type { MucTieu } from "./kieu";

export function KhoiMucTieu({ mucTieu, hienDonVi, danhDauCuaToi }: { mucTieu: MucTieu; hienDonVi: boolean; danhDauCuaToi: boolean }) {
	const m = okrMessages(useLocale());
	const mo = useOpenRecord();
	return (
		<Card data-muc-tieu={mucTieu.id}>
			<CardHeader>
				<CardTitle>
					<button type="button" className="text-start" translate="no" onClick={() => mo({ kind: "objective", id: mucTieu.id })}>
						{mucTieu.title}
					</button>
				</CardTitle>
				<CardDescription>
					{hienDonVi ? <span translate="no">{mucTieu.unitName} · </span> : null}
					{m.phuTrach} <span translate="no">{mucTieu.owner.name}</span>
					{mucTieu.alignments.length > 0 ? ` · ${m.gopVao(mucTieu.alignments.length)}` : null}
				</CardDescription>
				<Badge variant="outline">{m.loai[mucTieu.kind]}</Badge>
				<Badge variant={mucTieu.status === "cong-bo" ? "secondary" : "outline"}>{m.trangThai[mucTieu.status]}</Badge>
			</CardHeader>
			<CardContent>
				<BangKr keyResults={mucTieu.keyResults} kind={mucTieu.kind} expected={mucTieu.expected} danhDauCuaToi={danhDauCuaToi} />
			</CardContent>
		</Card>
	);
}
```

`bang-kr.tsx`: `SimpleTable columns=[{id:"ten"},{id:"phuTrach"},{id:"tienDo",width:"12rem"},{id:"dich",align:"right"}]` với `SimpleTableRow`/`TableCell`; ô tiến độ = `TienDoKr`; đích = `giaTri(kr)` («Xong/Chưa xong» cho mốc, `${so} ${unit}`); hàng KR của tôi thêm `Badge variant="outline"` «Của tôi» khi `danhDauCuaToi && kr.laCuaToi`. Không `<table>`, không `divide-y`.

- [ ] **Step 4: Viết `cay-don-vi.tsx`** — props `{ cay: RouterOutputs["org"]["tree"]; dem: Map<string, number>; chon: DonChon | null; chonDon(d) }`; ghép `NavItem` level 0/1/2 y hệt hình `settings/organization/cay-dieu-huong.tsx` (gốc «Toàn công ty», nhánh bộ phận, phòng ban, mục «Chưa xếp»); số cạnh mỗi đơn vị là `dem.get(id) ?? 0` (số mục tiêu đã công bố — lấy từ `okr.byUnit` gốc? Không: thêm thủ tục `okr.countByUnit({cycleId})` trả `{unitId: count}` — thêm ở service Task 8 Step 4b, router `GET /okr/units/count`), máy nhỏ (`KHO_HEP`) thành `Select` với `SelectGroup` theo bộ phận.

- [ ] **Step 5: Viết `theo-don-vi.tsx`** — `useQuery(trpc.org.tree)`, `okr.cycles`, `okr.access`, `okr.byUnit({cycleId, unit})`, `okr.alignmentTree` khi `xem === "cay"`; trạng thái: `isPending` → `DangTai`; `isError` → `Loi` với `onClick={() => refetch()}`; `cycles.length === 0` → `ChuaChuKy` (quản trị thấy `Link` tới `/settings/okr`); đầu đơn vị (tên, cấp, trưởng hoặc «Chưa có trưởng», đếm) bằng `PageShellHeading`? — không, dùng `CardHeader` phẳng: `CardTitle` + `CardDescription`; `ToggleGroup` Danh sách / Cây căn chỉnh; nút «Thêm mục tiêu» (mở `HopThoaiMucTieu` Task 9) và «Nhập từ bảng tính» (Task 10) khi `byUnit.data.canEdit`; rỗng: `Empty` với câu «<đơn vị> chưa đặt OKR cho <kỳ>» + (đơn vị không trưởng → câu gán trưởng, quản trị có `Link` tới `/settings/organization`); danh sách → `KhoiMucTieu` mỗi mục tiêu; cây → `CayCanChinh` = `SimpleTable` một cột `title` với `paddingInlineStart` theo cấp qua `style`, cột tiến độ và `StatusIndicator`, nhóm «Chưa căn chỉnh» là hàng tiêu đề phụ.

- [ ] **Step 6: Viết `cua-toi.tsx`, `page.tsx`, `toan-canh/page.tsx`** — Của tôi: `okr.mine({cycleId})`; rỗng → `Empty` «Bạn chưa phụ trách mục tiêu hay KR nào» + `Button asChild variant="outline"` `Link` `/okr/theo-don-vi`.

- [ ] **Step 7: Bài DOM `apps/app/test/okr-theo-don-vi.dom.tsx`** (khuôn `to-chuc.dom.tsx`): render `TheoDonVi` với `QueryClient` gieo sẵn dữ liệu `okr.byUnit`/`org.tree`/`okr.cycles`/`okr.access` (tên test `theo-don-vi-danh-sach`, `theo-don-vi-rong`, `theo-don-vi-truong-thay-nut`); thêm khoá `dok_dom` vào `_acceptance/config.yaml` `executors.test` nếu muốn ghim — không bắt buộc bởi evals (E11 chụp màn thật).

- [ ] **Step 8: `cd apps/app && bun run check-types && bun run lint`** xanh. Commit

```bash
git add "apps/app/app/(app)/[slug]/okr" apps/app/lib/messages/okr.ts apps/app/lib/search-param-keys.ts apps/api/src/okr apps/api/src/generated/server.ts apps/app/test
git commit -m "okr: khu Mục tiêu — bốn tab, Của tôi, Theo đơn vị với cây đơn vị thật và cây căn chỉnh"
```

---

### Task 9: Sheet mục tiêu và ba hộp thoại

Phục vụ E12, E13. `independent: false`.

**Files:**
- Modify: `apps/app/components/crm/record-sheet/record-stack.ts:16` (`RECORD_KINDS = [...ENTITY_KINDS, "plan", "objective"]`), `record-sheet-host.tsx` (nhánh `objective`), `record-prefetch.ts` (case `objective` → `okr.objective`), `apps/app/lib/trpc/cache.ts` (`okr(id?)`: invalidate `okr.objective` (id), `okr.byUnit`, `okr.mine`, `okr.alignmentTree`, `okr.countByUnit`)
- Create: `apps/app/components/crm/record-sheet/objective-sheet.tsx`, `apps/app/app/(app)/[slug]/okr/hop-thoai-muc-tieu.tsx`, `hop-thoai-kr.tsx`, `hop-thoai-can-chinh.tsx`, `bang-vet.tsx`

- [ ] **Step 1: `objective-sheet.tsx`** — `RecordSheetFrame` với `title` tên, `description` «<đơn vị> · <chu kỳ>», `note` hai `Badge` (loại, trạng thái), `media` `EntityLogo name={title} size="lg"` (không logo), `actions` `DropdownMenu` «…» khi `canEdit`: Sửa · Công bố (khi `nhap`) · Bỏ (khi không `da-bo`); `stats` `DetailSheetStats` ba ô (Tiến độ «lẽ ra X%», Tình trạng `StatusIndicator`, Phụ trách `OwnerCell`); tabs: `kr` (`BangKr` + hàng menu Sửa/Xoá khi `canEditKr.includes(kr.id)` + nút «Thêm KR» khi `canEdit`), `can-chinh` (`SimpleTable` chỗ góp + nút «Gắn thêm»), `vet` (`BangVet`). Công bố/Bỏ qua `ConfirmDialog` nhập từ `@/app/(app)/[slug]/settings/members/confirm-dialog` (như `plan-sheet.tsx`). Mọi mutation `onSuccess: () => cache.okr(id)`, `onError: toast.error`; `canhBao` → `toast.warning`.

- [ ] **Step 2: Ba hộp thoại (`Dialog`, `Field`/`FieldLabel`/`FieldError`/`FieldDescription`, `Input`, `Select`, `Combobox` cho người (từ `users.list`), `DatePicker` cho hạn)** — `HopThoaiKr`: ô kiểu `Select` sáu mục; ô khởi điểm `disabled={kr?.startLocked}` với `FieldDescription` «Đã khoá khi công bố»; kiểm `kiemSoTheoKieu` từ `@crm/validation/okr-kr` (client được nhập `@crm/validation`) để tắt nút gửi; số nhập nhận dấu phẩy (`Number(v.replace(",", "."))`). `HopThoaiMucTieu`: cấp (`Select` — cấp cá nhân chỉ khi `program.personalOn`), đơn vị điền sẵn từ `don`, tên, loại, phụ trách, người tham gia (`Combobox` nhiều lần chọn → danh sách `Badge` có nút bỏ), vì sao lúc này (`Textarea`). `HopThoaiCanChinh`: `Combobox` ứng viên từ `okr.alignmentTargets`.

- [ ] **Step 3: `bang-vet.tsx`** — `SimpleTable` cột lúc (`formatDay` + giờ), ai, việc (`m.hanhDong[action]`), trước → sau (ghép các khoá khác nhau: `k: before → after`).

- [ ] **Step 4: Bài DOM `apps/app/test/okr-sheet.dom.tsx`**: mở sheet với dữ liệu `okr.objective` gieo; test `sheet-nhap-co-nut-cong-bo`, `sheet-cong-bo-khoa-khoi-diem` (mở hộp KR, ô `startValue` disabled), `sheet-vet-ba-dong`.

- [ ] **Step 5: `check-types`, `lint`, DOM test xanh. Commit**

```bash
git add apps/app/components/crm/record-sheet "apps/app/app/(app)/[slug]/okr" apps/app/lib/trpc/cache.ts apps/app/test
git commit -m "okr: sheet mục tiêu trong record sheet, hộp thoại mục tiêu, KR, gắn căn chỉnh, tab Vết"
```

---

### Task 10: Hộp thoại nhập từ bảng tính

Phục vụ E20, E21. `independent: false`.

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/hop-thoai-nhap.tsx`

- [ ] **Step 1: Chép khung `settings/organization/hop-thoai-nhap.tsx`** (ba bước `StepList`, `Textarea` dán, chọn tệp `.csv`, bảng xem trước `Table` của `@crm/ui` bọc trong `Dialog size="wide"` — dùng `SimpleTable` thay `Table` để đúng bảng dấu hiệu), thêm ở bước 1 hai `Select` chu kỳ và đơn vị (điền sẵn từ URL), ở bước 2 `Field orientation="horizontal"` + `Switch` «Công bố ngay», gọi `okr.previewImport` / `okr.applyImport({ …, congBo })`, bước 3 «Đã ghi N mục tiêu, M KR» + nút «Xem danh sách» (`cache.okr()` rồi đóng). Cột bảy: dòng · mục tiêu · KR · kiểu · khởi điểm · đích · đơn vị đo · email · kết quả. Placeholder `mau`: `"Mạng lưới đối tác đủ dày\tCông ty ký thoả thuận mới\ttăng tới\t0\t40\tcông ty\tlan@onehub.vn"`.

- [ ] **Step 2: Nối nút «Nhập từ bảng tính» ở `theo-don-vi.tsx`.**

- [ ] **Step 3: Bài DOM `okr-nhap.dom.tsx`**: `nhap-nut-ghi-khoa-khi-0-hop-le`, `nhap-tom-tat-dong-hong`. `check-types`, `lint` xanh. Commit

```bash
git add "apps/app/app/(app)/[slug]/okr" apps/app/test
git commit -m "okr: hộp thoại nhập bộ OKR từ bảng tính, xem trước rồi ghi, công bố ngay"
```

---

### Task 11: Cài đặt › Chương trình OKR

Phục vụ E15, E16. `independent: false`.

**Files:**
- Modify: `apps/app/lib/cai-dat-dieu-huong.ts` (`{ khoa: "chuongTrinhOkr", href: \`${GOC_CAI_DAT}/okr\` }` sau `toChuc`), `apps/app/lib/messages/settings.ts` (`thanhBen.chuongTrinhOkr`: en «OKR program», vi «Chương trình OKR»; `tieuDeTab.chuongTrinhOkr`), `apps/app/lib/pham-vi-man.ts` (vai «chỉ OKR» KHÔNG thấy mục này — giữ hai mục cá nhân)
- Create: `apps/app/app/(app)/[slug]/settings/okr/page.tsx`, `bang-chu-ky.tsx`, `sheet-mo-chu-ky.tsx`, `form-cau-hinh.tsx`, `okr-settings-search-params.ts`

- [ ] **Step 1: `page.tsx`** — `PageShell width="page"`, `PageShellHeader` tiêu đề + mô tả + (không đủ quyền) `PageShellDescription` thứ hai «Chỉ quản trị đổi được cấu hình chương trình.»; prefetch `workspace.get`, `okr.cycles`, `okr.program`; `HydrateClient` bọc hai `Card`.
- [ ] **Step 2: `bang-chu-ky.tsx`** — `Card` + `CardHeader` (`CardTitle` «Chu kỳ», `CardAction` nút «Mở chu kỳ» mở `SheetMoChuKy` qua `useQueryState("moChuKy", parseAsBoolean)`), `CardTable` (`SimpleTable` bên trong `Card`) cột tên · loại · từ · đến · pha (`StatusIndicator`) · «…» menu «Chuyển sang <pha kế>» với `ConfirmDialog`; rỗng → `CardTableEmpty`.
- [ ] **Step 3: `sheet-mo-chu-ky.tsx`** — `Sheet side="right"`, form: loại (`Select`), tên, năm cha (`Select` các chu kỳ năm, chỉ khi quý), hai `DatePicker`, khoảng nghỉ (hai `DatePicker` tuỳ chọn), ngày cập nhật (`Select` 1–7); `SheetFooter` «Huỷ» trái, nút chính phải, `disabled` tới khi `chuKyInput.safeParse(...).success`; `onSuccess`: `cache.okr()`, toast, đóng.
- [ ] **Step 4: `form-cau-hinh.tsx`** — theo `archive-retention.tsx`: `Card`, `CardTitle` «Cấu hình», `CardAction` nút Lưu `type="submit" form="okr-program"` `disabled={!coQuyen || !daSua || !hopLe || dangLuu}`; `FieldGroup` với `Input inputMode="numeric"` trần mục tiêu, trần KR; `Select` chế độ (cảnh báo/chặn); `Select` thang chấm; hai `Field orientation="horizontal"` với `Switch` (trọng số, OKR cá nhân); `onSuccess`: `cache.okr()`, `toast.success(m.caiDat.daLuu)`.
- [ ] **Step 5: Bài DOM `okr-cai-dat.dom.tsx`**: `cai-dat-khong-quyen-khoa-dieu-khien` (hai `CardTitle` vẫn có, mọi `input`/`button[type=submit]` disabled), `cai-dat-luu-bat-khi-sua`. `check-types`, `lint`. Commit

```bash
git add "apps/app/app/(app)/[slug]/settings/okr" apps/app/lib apps/app/test
git commit -m "okr: Cài đặt › Chương trình OKR — bảng chu kỳ, mở chu kỳ, form cấu hình theo docs/settings.md"
```

---

### Task 12: Răng chụp màn thật, cổng thiết kế, tài liệu, ghim lại, năm lệnh

Phục vụ E11, E12, E13, E15, E16, E17, E18, E20, E21. `independent: false`.

**Files:**
- Create: `_acceptance/dat-okr-trong-crm/rang/man-okr.mjs`, `san-thiet-ke.mjs`
- Modify: `docs/api.md` (mục «OKR» sau «The organization tree»), `CONTEXT.md` (mục «Kiểu KR», «Chương trình OKR»), `_acceptance/dat-okr-trong-crm/rang/cau-hinh.mjs` (`sau` = sha cuối), `apps/app/app/(app)/[slug]/okr/**` nếu san-thiet-ke đỏ

- [ ] **Step 1: `san-thiet-ke.mjs`** — chép `cau-truc-to-chuc/rang/san-thiet-ke.mjs`, `VUNG` = ba regex (`okr/.+\.tsx$`, `settings/okr/.+\.tsx$`, `record-sheet/objective-sheet\.tsx$`), sau vòng design-gate thêm quét regex `DAU_HIEU = [/<table\b/, /<h1\b/, /<h2\b/, /size-2 rounded-full/, /navigator\.clipboard/, /AlertDialog/, /divide-y/, /rounded-lg border/]` trên nội dung từng tệp → mỗi khớp `hong += 1`, in «dau hieu ve tay: <mẫu> (<tệp>)»; và `git diff --name-only --diff-filter=M VONG.truoc...VONG.sau -- packages/ui/src` phải rỗng (in «packages/ui bi sua: …»). `--chieu-do`: tệp giả tmpdir chứa `<table>` → bắt; danh sách giả có `packages/ui/src/components/progress.tsx` → bắt.
- [ ] **Step 2: `man-okr.mjs`** — khung `vai-chi-okr/rang/man-chi-okr.mjs` (canh cây, `dev:session`, `datVai`, puppeteer, `kiem`, ảnh vào `.acceptance-runs/dat-okr-trong-crm/evidence/` hoặc `BANG_CHUNG`); gieo qua API thật bằng cookie admin (`org.createDivision`, `org.createDepartment` ×2, `org.setPlacement`, `org.setHead`, `okr.createCycle` năm + quý, `okr.setCyclePhase`, `okr.createObjective` ×3, `okr.createKeyResult`); các bước E11 (13 ảnh), E12 (11 ảnh, sheet Thoả thuận `seed-deal-wise-1` từ `db.deal.findFirst`), E15 (8 ảnh), E20 (7 ảnh); chặn request `okr.byUnit` bằng `page.setRequestInterception(true)` trả 500 rồi bỏ; ca không chu kỳ: `db.okrTrail.deleteMany` + `db.okrAlignment/okrKeyResult/okrObjective/okrCycle.deleteMany` fixture rồi chụp, gieo lại; dán lô bằng `page.type` với `\t`; sau mỗi thao tác ghi gọi API (`fetch ${API}/api/trpc/okr.objective?input=…` với cookie) để khẳng định E13/E16/E21; dọn dẹp ở `finally`.
- [ ] **Step 3: Chạy hai răng tay** — dựng app+api ở cổng 3910/3911 (`PORT=3910 bun run dev` trong `apps/app`, `PORT=3911` trong `apps/api`, cùng cây), rồi `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/dat-okr-trong-crm/rang/man-okr.mjs"` với `APP_URL`/`API_URL` → exit 0, đủ ảnh; `bun _acceptance/dat-okr-trong-crm/rang/san-thiet-ke.mjs` → exit 0. Mở vài ảnh bằng Read để nhìn.
- [ ] **Step 4: `docs/api.md` mục «## OKR»** — sáu gạch đầu dòng: router `okr` nhóm dữ liệu `okr` cho cả bốn vai; quyền theo bản ghi từ trưởng đơn vị (`OkrAccessService`), quản trị chỉ chu kỳ/cấu hình/cấp OneHub/nhập; mười một thủ tục ghi khoá theo pha; mọi ghi để một dòng `OkrTrail`, không qua `Activity`; danh mục là khuôn Zod ở `@crm/validation/okr-*`; nhập xem trước rồi ghi như tổ chức. `CONTEXT.md`: mục **Kiểu KR** (sáu kiểu, chốt 2026-09-25) và **Chương trình OKR** (cấu hình có phiên bản do quản trị khai).
- [ ] **Step 5: Ghim lại hai hồ sơ đã ký** — `node /Users/manhphan/.claude/plugins/cache/acceptance-gate-kit/feature-loop/2.18.3/scripts/repin-lane.mjs --root . --slug vai-chi-okr --slug <slug giữ khung-dieu-huong> --reason "thêm mục Mục tiêu và nhóm dữ liệu okr (dat-okr-trong-crm AC-10, AC-12)" --write` với PATH Node 24; commit dòng repin.
- [ ] **Step 6: Năm lệnh chứng với Node 24** — `PATH="/Users/manhphan/.local/share/fnm/node-versions/v24.15.0/installation/bin:$PATH" bun run test && bun run check-types && bun run lint && bun run lint:slop && bun run build` → xanh.
- [ ] **Step 7: Đặt `cau-hinh.mjs` `sau` = `git rev-parse HEAD` sau commit cuối; contract `status: implemented`; commit**

```bash
git add _acceptance/dat-okr-trong-crm docs/api.md CONTEXT.md
git commit -m "okr: răng chụp màn thật và cổng thiết kế, tài liệu API và từ điển, ghim lại hai hồ sơ; implemented"
```

---

## Self-review

- **Spec coverage:** mục 2 (Task 1), 3–4 (Task 2–5), 5 (Task 6), 6 (Task 7–11), 7 (Task 2 `tien-do.ts`), 8 (Task 12), 9 (Task 12). Không mục nào không có task.
- **Placeholder:** không «TBD»; mọi bước có mã hoặc chỉ đích danh tệp và nội dung.
- **Type consistency:** `DonViChon` (`goc|bp|pb|nguoi`) dùng chung API và URL; `okOutput {id, canhBao}` cho mọi mutation ghi; `MucTieuOutput` là đầu ra của `byUnit`, `mine`, `objective` (mở rộng `trail`, `canEditKr`).
- **Review Focus:** năm ca có test ở Task 2 (`TZ`), 3 (`owner-roi`), 4 (`b1-kiem-p3`), 5 (`dich-da-bo`), 6 (`nhap-so-viet`).
