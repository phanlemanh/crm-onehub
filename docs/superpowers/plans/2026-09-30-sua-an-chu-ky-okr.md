# Sửa và ẩn chu kỳ OKR tạo nhầm — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quản trị sửa, gỡ, ẩn và hiện lại chu kỳ OKR tạo nhầm ở Cài đặt › Chương trình OKR; chu kỳ ẩn vắng khỏi mọi chỗ tự tìm chu kỳ; vết luôn còn.

**Architecture:** Một hàm thuần `viecChuKy` (packages/validation) quyết năm cờ việc; một cột `okrCycle.anLuc` và một hằng lọc `KY_CON_HIEN` (packages/db) đặt vào 15 chỗ tự tìm chu kỳ; bốn thủ tục tRPC mới trong router `okr`, khoá hàng theo thứ tự cố định; màn Cài đặt đọc cờ từ `okr.cycles`, không tự suy.

**Tech Stack:** Bun, NestJS + nestjs-trpc, Prisma 7 (Postgres), Zod, Next.js 16 + React Query + nuqs, shadcn/ReUI trong `packages/ui`, puppeteer-core cho thước màn.

**Spec:** `docs/superpowers/specs/2026-09-30-sua-an-chu-ky-okr-design.md` · hợp đồng `_acceptance/sua-an-chu-ky-okr/contract.md` (13 AC, đã duyệt Cổng 1) · kế hoạch đo `_acceptance/sua-an-chu-ky-okr/evals.yaml` (E1–E19) · danh sách nơi đọc `_acceptance/sua-an-chu-ky-okr/rang/noi-doc-chu-ky.json`.

## Global Constraints

- Không viết chú thích trong mã mới hay mã sửa (AGENTS.md).
- Trí khôn sống ở API/agent đúng chỗ đã có; không vendor client mới.
- Đầu vào mới parse ở biên bằng Zod; không `Record<string, unknown>`; kiểu suy bằng `z.infer`.
- Hằng chỉnh được sống một chỗ theo vùng; `viecChuKy`, `suaChuKyInput`, `KY_CON_HIEN`, `QUAN_HE_GIU_CHU_KY` mỗi thứ định nghĩa đúng một lần.
- UI chỉ từ `packages/ui`; biến thể mới dựng trong `packages/ui` (ở đây: `DatePicker` nhận `disabled`); không `className` đổi màu/góc/khoảng cách lên component `@crm/ui`.
- Client component không nhập `@crm/db`, `@crm/auth`; nhập `@crm/ui` theo subpath.
- Chữ mới có vi và en khác nhau; vi có dấu; hàm chữ khai `GHIM` trong `apps/app/test/messages-guard.spec.ts`; tên chu kỳ và lý do mang `translate="no"`.
- Lý do ẩn: 10–500 ký tự (khuôn `lyDo` của `@crm/validation/okr-khep`, `OKR_KHEP.lyDo`). Tên chu kỳ 2–80 ký tự.
- Migration chỉ `ALTER TABLE "okrCycle" ADD COLUMN "anLuc" TIMESTAMP(3);`, mốc `20261009010000_okr_an_chu_ky` (sau mốc mới nhất `20261008010000_*` của onehub).
- Bốn thủ tục mới: `okr.suaChuKy` `PATCH /okr/cycles/{id}` · `okr.goChuKy` `DELETE /okr/cycles/{id}` · `okr.anChuKy` `POST /okr/cycles/{id}/hide` · `okr.hienChuKy` `POST /okr/cycles/{id}/unhide`; đều `assertQuanTri`.
- Bốn hành động vết mới trong `HANH_DONG_VET` (`packages/db/src/okr-vet.ts`): `sua-chu-ky`, `go-chu-ky`, `an-chu-ky`, `hien-chu-ky`.
- Thứ tự khoá `FOR UPDATE`: năm cha → chu kỳ đang xét → quý anh em cùng năm theo `id` tăng dần; `assertKyChuaAn` khoá `FOR SHARE` trong giao dịch ghi. Móc tiêm `MOC_SAU_KHOA_CHU_KY` gọi ngay sau khi lấy khoá.
- Kiểm cục bộ đủ năm lệnh trước khi coi một việc xong: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` (việc chạm apps/app hoặc packages/ui thì bắt buộc build).
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture (xanh trên vật lành, đỏ với thông điệp ghim trên bản phá) — thiếu cặp là việc chưa xong.
- Không `git add -A`; không `--no-verify`.

## Review Focus

1. Người đang xem một chu kỳ qua đường dẫn `?kyOkr=<id>` thì chu kỳ đó bị ẩn → trang rơi về kỳ mặc định, không trắng và không lỗi (Task 7, ca `giai-ky-an-url`).
2. Tab cũ của quản trị còn menu «Gỡ» sau khi người khác vừa thêm mục tiêu → máy chủ từ chối bằng câu ghim, màn hiện toast và làm mới bảng (Task 3, ca `go-sau-khi-co-du-lieu`; Task 7, ca `go-bi-tu-choi`).
3. Tên chỉ có khoảng trắng hoặc trùng tên chu kỳ khác → khoảng trắng bị Zod từ chối; trùng tên được phép như `createCycle` hôm nay (Task 1, ca `ten-khoang-trang`; Task 3, ca `ten-trung`).
4. Hiện lại một năm có quý đang ẩn → quý vẫn ẩn, không hiện dây chuyền (Task 3, ca `hien-nam-khong-day-chuyen`).
5. Gỡ chính chu kỳ đang là kỳ mặc định → `okr.cycles` làm mới, `currentId` đổi, khu OKR không lỗi (Task 3, ca `go-ky-mac-dinh`; Task 7, ca `sau-go-ky-mac-dinh`).

## Sơ đồ tệp

| Tệp | Trách nhiệm |
|---|---|
| `packages/validation/src/okr-chu-ky.ts` | `viecChuKy`, `TinhTrangChuKy`, `ViecChuKy`, `suaChuKyInput`, `goChuKyInput`, `hienChuKyInput` |
| `packages/validation/src/okr-khep.ts` | `anChuKyInput = z.object({ id: ma, lyDo })` (cạnh `moLaiKyInput`, tránh vòng nhập) |
| `packages/db/src/okr-vet.ts` | bốn hành động vết mới |
| `packages/db/prisma/schema.prisma`, migration mới | cột `anLuc` |
| `packages/db/src/okr-chu-ky-hien.ts` (mới, xuất `./okr-chu-ky-hien`) | `KY_CON_HIEN`, `QUAN_HE_GIU_CHU_KY`, `tinhTrangGiu(tx, ids)` |
| `apps/api/src/okr/dong-ho.ts` | token `MOC_SAU_KHOA_CHU_KY` + kiểu `MocSauKhoa` |
| `apps/api/src/okr/okr-chu-ky.service.ts` (mới) | `suaChuKy`, `goChuKy`, `anChuKy`, `hienChuKy`, `khoaChuKy` |
| `apps/api/src/okr/okr.service.ts` | `cycles` (trường mới, `currentId` bỏ ẩn), `createCycle` (lọc, năm cha ẩn), `assertKyGhiDuoc` → gọi `assertKyChuaAn`, `alignmentTargets`, `mucTieuCuaCay` |
| `apps/api/src/okr/okr.contracts.ts`, `okr.router.ts`, `okr.module.ts`, `okr-config.ts` | khuôn ra, bốn thủ tục, provider, thông điệp `OKR.thongDiep.chuKy.*` |
| 15 chỗ lọc trong `rang/noi-doc-chu-ky.json` | thêm `KY_CON_HIEN` |
| `apps/api/test/okr-sua-an-chu-ky.spec.ts`, `apps/api/test/okr-sua-an-san.ts` (mới) | bài API E2–E9, E19 |
| `apps/agent/test/okr-nhac.integration.spec.ts`, `okr-chup.integration.spec.ts` | ca `ky-an` (E10) |
| `packages/ui/src/components/date-picker.tsx` + `packages/ui/test/date-picker-tat.dom.tsx` (mới) | `disabled` |
| `apps/app/app/(app)/[slug]/settings/okr/o-chu-ky.tsx` (mới) | các ô chung của sheet mở và sheet sửa |
| `.../settings/okr/sheet-sua-chu-ky.tsx`, `hop-thoai-an-chu-ky.tsx` (mới); `bang-chu-ky.tsx`, `sheet-mo-chu-ky.tsx`, `okr-settings-search-params.ts` | màn |
| `apps/app/app/(app)/[slug]/okr/okr-search-params.ts`, `chon-chu-ky.tsx` | bỏ chu kỳ ẩn khỏi chọn và giải kỳ |
| `apps/app/lib/messages/okr.ts`, `apps/app/lib/search-param-keys.ts` | chữ, tham số URL `suaChuKy` |
| `apps/app/test/okr-giai-ky-an.spec.ts`, `apps/app/test/okr-sua-an-chu-ky.dom.tsx` (mới); `apps/app/test/okr-cai-dat.dom.tsx` (fixture) | E12, E13 |
| `_acceptance/sua-an-chu-ky-okr/rang/soi-ma.mjs`, `migration-chi-them.mjs`, `man-sua-an.mjs` (mới) | E11, E16, E18, E14, E15 |
| `docs/api.md` | mục «Sửa, gỡ, ẩn chu kỳ» |

---

### Task 1: Hàm việc và khuôn đầu vào

independent: true · phục vụ E1 (AC-1), nền cho E2–E8

**Files:**
- Modify: `packages/validation/src/okr-chu-ky.ts`
- Modify: `packages/validation/src/okr-khep.ts` (thêm `anChuKyInput` sau `moLaiKyInput`)
- Modify: `packages/db/src/okr-vet.ts` (thêm bốn hành động sau `"tao-chu-ky"`)
- Test: `packages/validation/test/okr-chu-ky-viec.spec.ts`

**Interfaces:**
- Produces:
  - `type TinhTrangChuKy = { phase: PhaChuKy; kind: LoaiChuKy; trong: boolean; daAn: boolean; quyConHien: number }`
  - `type ViecChuKy = { suaMoiO: boolean; suaTen: boolean; go: boolean; an: boolean; hienLai: boolean }`
  - `function viecChuKy(t: TinhTrangChuKy): ViecChuKy`
  - `suaChuKyInput` (id + các trường của `chuKyInput` trừ `kind`, `parentId`, cùng hai `refine` ngày), `goChuKyInput = z.object({ id })`, `hienChuKyInput = z.object({ id })`, `anChuKyInput = z.object({ id: ma, lyDo })`; kiểu `SuaChuKyInput` … bằng `z.infer`.

- [ ] **Step 1: Viết bài đỏ** — `okr-chu-ky-viec.spec.ts`:

```ts
import { describe, expect, test } from "bun:test";
import {
	LOAI_CHU_KY,
	PHA_CHU_KY,
	suaChuKyInput,
	type TinhTrangChuKy,
	type ViecChuKy,
	viecChuKy,
} from "../src/okr-chu-ky";

const KHONG: ViecChuKy = { suaMoiO: false, suaTen: false, go: false, an: false, hienLai: false };

function mong(t: TinhTrangChuKy): ViecChuKy {
	if (t.daAn) return { ...KHONG, hienLai: true };
	const conQuy = t.kind === "nam" && t.quyConHien > 0;
	return {
		suaMoiO: t.trong && t.phase === "lap-ke-hoach",
		suaTen: t.phase !== "da-dong",
		go: t.trong,
		an: !t.trong && !conQuy,
		hienLai: false,
	};
}

const LOAI_CA = [
	{ kind: "nam", quyConHien: 0 },
	{ kind: "nam", quyConHien: 1 },
	{ kind: "quy", quyConHien: 0 },
] as const;

describe("viec-chu-ky", () => {
	let soCa = 0;
	for (const phase of PHA_CHU_KY)
		for (const trong of [true, false])
			for (const daAn of [true, false])
				for (const l of LOAI_CA) {
					const t: TinhTrangChuKy = { phase, trong, daAn, kind: l.kind, quyConHien: trong && l.kind === "nam" ? 0 : l.quyConHien };
					test(`${phase} trong=${trong} an=${daAn} ${l.kind}/${l.quyConHien}`, () => {
						soCa += 1;
						expect(viecChuKy(t)).toEqual(mong(t));
					});
				}
	test("du 48 ca", () => expect(soCa).toBe(48));
	test("ca ghim", () => {
		expect(viecChuKy({ phase: "lap-ke-hoach", kind: "quy", trong: true, daAn: false, quyConHien: 0 })).toEqual({ suaMoiO: true, suaTen: true, go: true, an: false, hienLai: false });
		expect(viecChuKy({ phase: "dang-chay", kind: "quy", trong: false, daAn: false, quyConHien: 0 })).toEqual({ suaMoiO: false, suaTen: true, go: false, an: true, hienLai: false });
		expect(viecChuKy({ phase: "da-dong", kind: "quy", trong: false, daAn: false, quyConHien: 0 })).toEqual({ suaMoiO: false, suaTen: false, go: false, an: true, hienLai: false });
		expect(viecChuKy({ phase: "dang-chay", kind: "nam", trong: false, daAn: false, quyConHien: 1 }).an).toBe(false);
	});
	test("ten-khoang-trang", () => {
		expect(suaChuKyInput.safeParse({ id: "c", name: "   ", startsOn: "2027-01-01", endsOn: "2027-12-31", breakStartsOn: null, breakEndsOn: null, updateWeekday: 1 }).success).toBe(false);
	});
	test("so loai", () => expect(LOAI_CHU_KY).toEqual(["nam", "quy"]));
});
```

Lưu ý: `soCa` đếm trong thân từng `test`, còn ca «du 48 ca» chạy sau cùng trong cùng `describe` (bun chạy tuần tự trong tệp). Nếu bun xếp khác thì chuyển đếm vào một `afterAll`.

- [ ] **Step 2:** `cd packages/validation && bun test test/okr-chu-ky-viec.spec.ts` → FAIL (`viecChuKy` chưa có).
- [ ] **Step 3: Cài**

```ts
export type TinhTrangChuKy = {
	phase: PhaChuKy;
	kind: LoaiChuKy;
	trong: boolean;
	daAn: boolean;
	quyConHien: number;
};

export type ViecChuKy = {
	suaMoiO: boolean;
	suaTen: boolean;
	go: boolean;
	an: boolean;
	hienLai: boolean;
};

export function viecChuKy(t: TinhTrangChuKy): ViecChuKy {
	if (t.daAn)
		return { suaMoiO: false, suaTen: false, go: false, an: false, hienLai: true };
	return {
		suaMoiO: t.trong && t.phase === "lap-ke-hoach",
		suaTen: t.phase !== "da-dong",
		go: t.trong,
		an: !t.trong && !(t.kind === "nam" && t.quyConHien > 0),
		hienLai: false,
	};
}
```

`suaChuKyInput`: dựng một `truongNgayChuKy` (object `name, startsOn, endsOn, breakStartsOn, breakEndsOn, updateWeekday`) và một hàm `kiemNgay` dùng lại cho cả `chuKyInput` lẫn `suaChuKyInput` — không chép hai lần hai `refine`. `id: z.string().trim().min(1).max(120)`.

- [ ] **Step 4:** chạy lại → PASS; phá thử: đổi `suaTen: t.phase !== "da-dong"` thành `true` trong bản sao ở tmpdir, chạy bài với bản sao → ca `da-dong` đỏ, in tình trạng (ghi lượt phá vào báo cáo việc; không commit bản phá).
- [ ] **Step 5:** `bun run check-types` xanh.
- [ ] **Step 6: Commit** — `git add packages/validation/src/okr-chu-ky.ts packages/validation/src/okr-khep.ts packages/db/src/okr-vet.ts packages/validation/test/okr-chu-ky-viec.spec.ts && git commit -m "feat(okr): viecChuKy và khuôn sửa, gỡ, ẩn, hiện chu kỳ"`

---

### Task 2: Cột «đã ẩn», hằng lọc và thước migration

independent: true · phục vụ E18 (AC-13), nền cho E5, E8–E11

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (model `OkrCycle`: thêm `anLuc DateTime?` sau `updateWeekday`, thêm `@@index([anLuc])`)
- Create: `packages/db/prisma/migrations/20261009010000_okr_an_chu_ky/migration.sql`
- Create: `packages/db/src/okr-chu-ky-hien.ts`; Modify: `packages/db/package.json` (exports `"./okr-chu-ky-hien": "./src/okr-chu-ky-hien.ts"`)
- Create: `_acceptance/sua-an-chu-ky-okr/rang/migration-chi-them.mjs`

**Interfaces:**
- Produces:
  - `export const KY_CON_HIEN = { anLuc: null } as const satisfies Prisma.OkrCycleWhereInput;`
  - `export const QUAN_HE_GIU_CHU_KY = ["objectives", "children", "cuaSoRa", "diemKr", "mangSangToi", "hoiY"] as const;`
  - `export async function tinhTrangGiu(tx: Tx | Db, ids: string[]): Promise<Map<string, { trong: boolean; quyConHien: number }>>` — một `okrCycle.findMany` chọn `_count` năm quan hệ nhiều + `hoiY: { select: { id: true } }`, cộng một `okrCycle.groupBy({ by: ["parentId"], where: { parentId: { in: ids }, ...KY_CON_HIEN } })` cho `quyConHien`. `trong` = mọi quan hệ trong `QUAN_HE_GIU_CHU_KY` bằng 0/null — đọc tên quan hệ từ hằng, không liệt lại.

- [ ] **Step 1:** migration.sql đúng một câu: `ALTER TABLE "okrCycle" ADD COLUMN "anLuc" TIMESTAMP(3);` và `CREATE INDEX "okrCycle_anLuc_idx" ON "okrCycle"("anLuc");`
- [ ] **Step 2:** `cd packages/db && bun run db:generate`; áp vào kho kiểm thử (`bun run db:test --reset` ở gốc kho) → không lỗi.
- [ ] **Step 3: Thước** — chép khung `_acceptance/khep-ky-okr/rang/migration-chi-them.mjs` (suy `GOC` từ vị trí tệp; `MIGRATION_LUOT = "20261009010000_okr_an_chu_ky"`; `TRUOC` theo `merge-base HEAD origin/onehub`). Tập câu cho phép viết trước đúng hai mẫu: `ALTER TABLE "okrCycle" ADD COLUMN "anLuc" TIMESTAMP(3)` (không `NOT NULL`, không `DEFAULT`) và `CREATE INDEX … ON "okrCycle"`. Mọi câu khác → vi phạm ghim. Chạy trên kho tạm: gieo chu kỳ, mục tiêu, cập nhật tuần bằng các migration cũ + INSERT; vân tay mỗi bảng `okr*` trước/sau; mọi `okrCycle.anLuc` NULL. `--chieu-do`: ba ca giả (`ADD COLUMN "anLuc" TIMESTAMP(3) NOT NULL DEFAULT now()`; `UPDATE "okrCycle" SET …`; `DROP INDEX …`) → mỗi ca exit 1 với câu ghim; ca đối chứng chỉ `ADD COLUMN "anLuc" TIMESTAMP(3)` → exit 0. Không có migration mới → exit 2 `KHONG DO DUOC`.
- [ ] **Step 4:** `bun _acceptance/sua-an-chu-ky-okr/rang/migration-chi-them.mjs` → exit 0; `… --chieu-do` → exit 1 và in đủ ba câu ghim.
- [ ] **Step 5:** `bun run check-types` xanh.
- [ ] **Step 6: Commit** — các tệp trên, message `feat(db): cột anLuc của okrCycle và hằng KY_CON_HIEN`.

---

### Task 3: Bốn thủ tục, danh sách chu kỳ và kỳ mặc định

independent: false (cần Task 1, 2) · phục vụ E2, E3, E4, E5, E6, E7, E8, E19 (AC-1…AC-7)

**Files:**
- Create: `apps/api/src/okr/okr-chu-ky.service.ts`
- Modify: `apps/api/src/okr/dong-ho.ts` (`export const MOC_SAU_KHOA_CHU_KY = Symbol("MOC_SAU_KHOA_CHU_KY"); export type MocSauKhoa = (buoc: string, id: string) => Promise<void>;`)
- Modify: `apps/api/src/okr/okr.module.ts` (provider `OkrChuKyService`, `{ provide: MOC_SAU_KHOA_CHU_KY, useValue: async () => {} }`)
- Modify: `apps/api/src/okr/okr.service.ts` (`cycles`, `chuKyRa`, `createCycle`, `assertKyGhiDuoc`, thêm `assertKyChuaAn`)
- Modify: `apps/api/src/okr/okr.contracts.ts` (`chuKyOutput` thêm `anLuc: z.string().nullable()`, `anLyDo: z.string().nullable()`, `quyConHien: z.number().int()`, `viec: z.object({ suaMoiO, suaTen, go, an, hienLai: z.boolean() })`; bốn input dùng lại khuôn ở `@crm/validation`)
- Modify: `apps/api/src/okr/okr.router.ts` (bốn `@Mutation` theo Global Constraints)
- Modify: `apps/api/src/okr/okr-config.ts` (khối `thongDiep.chuKy`: `chiSuaTen`, `daDongKhongSua`, `daAnKhongSua`, `khongTrong`, `trongThiGo`, `daAn`, `chuaAn`, `conQuyHien: (n: number) => string`, `namChaDaAn`, `hienLaiChong: (ten: string) => string`, `kyDaAn` — chữ viết trước trong bài)
- Modify: `apps/api/src/generated/server.ts` (chỉ bằng `cd apps/api && bun run trpc:generate`)
- Modify: `apps/api/test/vai-chi-okr.spec.ts` (danh sách `THU_TUC_SUA_AN_CHU_KY` bốn tên, thêm vào hợp ở ca so `choPhep()`; `DAU_VAO_HOP_LE` bốn dòng `{ id: "khong-co", … }`)
- Create: `apps/api/test/okr-sua-an-san.ts`, `apps/api/test/okr-sua-an-chu-ky.spec.ts`
- Modify: `apps/app/test/okr-cai-dat.dom.tsx` (hàm `ky(...)` thêm `anLuc: null, anLyDo: null, quyConHien: 0, viec: { tất cả false }` — khẳng định cũ giữ nguyên)

**Interfaces:**
- Consumes: `viecChuKy`, các input (Task 1); `KY_CON_HIEN`, `QUAN_HE_GIU_CHU_KY`, `tinhTrangGiu` (Task 2).
- Produces:
  - `OkrService.assertKyChuaAn(tx: Tx, cycleId: string): Promise<void>` — `SELECT id FROM "okrCycle" WHERE id = … FOR SHARE`, đọc `anLuc`, khác null → `BadRequestException(T.chuKy.kyDaAn)`.
  - `OkrService.assertKyGhiDuoc` gọi `assertKyChuaAn` khi được truyền `tx` là giao dịch; mọi chỗ gọi hiện có giữ chữ ký.
  - `OkrChuKyService.suaChuKy(userId, input: SuaChuKyInput)`, `goChuKy(userId, { id })`, `anChuKy(userId, { id, lyDo })`, `hienChuKy(userId, { id })` → `{ id, canhBao: null }`.
  - `OkrChuKyService.khoaChuKy(tx, id): Promise<{ c: OkrCycle; cha: OkrCycle | null; anhEm: OkrCycle[] }>` — khoá theo thứ tự năm cha → chu kỳ → anh em (id tăng), rồi `await this.moc("khoa", id)`.
- Bài API gọi qua `goi(...)` của `apps/api/test/okr-san.ts` (dựng `AppModule` bằng `dungSan`); `okr-sua-an-san.ts` xuất `dungSanSuaAn()` ghi đè `MOC_SAU_KHOA_CHU_KY` bằng chốt `chan(buoc, id)` / `tha()`, cùng các hàm gieo: `gieoTrong(kind, pha, cha?)`, `gieoCoMucTieu(cycleId)`, `gieoTheoQuanHe: Record<(typeof QUAN_HE_GIU_CHU_KY)[number], (cycleId) => Promise<void>>`.

- [ ] **Step 1: Bài đỏ theo nhóm `describe`** (tên nhóm khớp `-t` của `_acceptance/config.yaml`):
  - `cycles-viec` (E2): năm dạng gieo qua thủ tục thật; `viec` so `viecChuKy(tình trạng đếm trực tiếp từ DB trong bài)`; `anLuc`, `anLyDo`, `quyConHien`.
  - `sua-moi-o` (E3): ma trận đúng theo `evals.yaml` E3, 4 ca từ chối + 1 đối chứng chồng quý đã ẩn; vết `sua-chu-ky` before/after chỉ khoá đã đổi; ca `ten-trung` (tên trùng chu kỳ khác → ghi được).
  - `sua-ten` (E4): 3 chu kỳ × 4 ca = 12, khẳng định số ca; đã đóng, đã ẩn bị từ chối.
  - `go-chu-ky` (E5): đọc `db._runtimeDataModel` qua một khuôn Zod `moHinhDuLieu = z.object({ models: z.record(z.string(), z.object({ fields: z.array(z.object({ name: z.string(), kind: z.string(), type: z.string(), relationFromFields: z.array(z.string()).optional() })) })) })`; tập = mọi field `kind === "object"` có `type === "OkrCycle"` ở model khác `OkrTrail`, quy về tên quan hệ phía `OkrCycle` (tên field ngược trong model `OkrCycle` có `type` là model đó) — so tập với `QUAN_HE_GIU_CHU_KY`; thiếu hàm gieo cho một quan hệ → đỏ in tên; G0 trống gỡ được; ca `go-sau-khi-co-du-lieu` (G0' gieo mục tiêu sau khi đọc `okr.cycles` → gỡ 400 câu ghim); ca `go-ky-mac-dinh` (gỡ kỳ đang là `currentId` → `currentId` đổi).
  - `an-hien` (E6): theo `evals.yaml` E6; ca `hien-nam-khong-day-chuyen`.
  - `dong-thoi` (E19): 4 cặp × 2 thứ tự thả, dùng chốt `MOC_SAU_KHOA_CHU_KY` và `Promise.all`; bất biến đọc lại; không 500, không `P2003`. Cặp `createObjective` cần chốt ở `assertKyChuaAn` — đặt `this.moc("ghi", cycleId)` ngay sau `FOR SHARE` (OkrService nhận `MOC_SAU_KHOA_CHU_KY` qua `@Optional() @Inject`).
  - `ky-mac-dinh` (E8): theo `evals.yaml` E8.
  - `quyen` (E7): thành viên và vai okr gọi bốn thủ tục → 403, bản ghi và vết không đổi; quản trị → được.
- [ ] **Step 2:** `bun run test -- "cd apps/api && bun test test/okr-sua-an-chu-ky.spec.ts"` → FAIL.
- [ ] **Step 3: Cài `OkrChuKyService`** — mỗi thủ tục: `assertQuanTri` → `$transaction` → `khoaChuKy` → `tinhTrangGiu` dưới khoá → `viecChuKy` → từ chối theo cờ bằng thông điệp khối `chuKy`:
  - `suaChuKy`: cờ `suaMoiO` false mà có ô ngoài tên khác bản lưu → `chiSuaTen` (kiểm trước khi ghi bất kỳ ô nào); `suaTen` false → `daDongKhongSua` / `daAnKhongSua`; quý: trong năm cha, không chồng anh em `anLuc: null`; ghi; vết `sua-chu-ky` before/after chỉ các khoá đổi.
  - `goChuKy`: `go` false → `khongTrong`; xoá; vết `go-chu-ky` before = `{ name, kind, startsOn, endsOn, phase }`, `cycleId` giữ.
  - `anChuKy`: đã ẩn → `daAn`; trống → `trongThiGo`; năm có `quyConHien > 0` → `conQuyHien(n)`; ghi `anLuc = new Date()`; vết `an-chu-ky` với `note = lyDo`.
  - `hienChuKy`: chưa ẩn → `chuaAn`; quý có năm cha đã ẩn → `namChaDaAn`; chồng anh em `anLuc: null` → `hienLaiChong(ten)`; ghi `anLuc = null`; vết `hien-chu-ky`.
- [ ] **Step 4: Sửa `OkrService`:** `cycles()` gọi `tinhTrangGiu` cho mọi id, lấy `anLyDo` bằng một `okrTrail.findMany({ where: { cycleId: { in: idsDaAn }, action: "an-chu-ky" }, orderBy: { at: "desc" } })`, `chuKyRa` thêm bốn trường; `currentId` = `chonChuKyHienTai(cycles.filter((c) => c.anLuc === null), …)`; `createCycle` lọc anh em `...KY_CON_HIEN`, khoá năm cha `FOR UPDATE`, năm cha đã ẩn → `namChaDaAn`; `assertKyGhiDuoc` gọi `assertKyChuaAn`.
- [ ] **Step 5:** `cd apps/api && bun run trpc:generate`; bài xanh; phá thử theo CHIỀU ĐỎ của E2, E3, E4, E5, E6, E8, E19 (bản sao dịch vụ trong tmpdir hoặc cờ phá trong bài chạy qua biến môi trường riêng của bài — không để mã phá trong nhánh), mỗi lượt đỏ đúng câu ghim.
- [ ] **Step 6:** năm lệnh kiểm xanh (bài màn cũ `okr-cai-dat.dom.tsx` xanh với fixture mới).
- [ ] **Step 7: Commit** — `feat(okr): sửa, gỡ, ẩn, hiện chu kỳ và kỳ mặc định bỏ chu kỳ ẩn`.

---

### Task 4: Chu kỳ ẩn vắng khỏi mọi chỗ tự tìm và mọi thao tác ghi

independent: false (cần Task 3) · phục vụ E9, E10 (AC-8)

**Files:**
- Modify (lọc `KY_CON_HIEN`, đúng 15 chỗ «loc» của `rang/noi-doc-chu-ky.json`): `apps/api/src/okr/okr.service.ts` (`alignmentTargets`, `mucTieuCuaCay`), `okr-khep.service.ts` (`mangSang` đích), `okr-cap-nhat.service.ts` (`capNhatTuan`), `okr-trao-doi.service.ts` (`dieuKienChuyen`), `packages/db/src/okr-don-vi.ts` (`dieuKienOkrMo`), `packages/db/src/okr-nhac.ts` (`docKr` qua `CHAY`, `viecHoiY`, `viecChoDuyet`, `lienQuanOkr`), `apps/agent/agent/lib/okr-chup.ts` (`chupSoOkr`), `apps/agent/agent/lib/okr/doc.ts` (`docDichCanChinh`). `cycles`, `createCycle`, `assertKyGhiDuoc` đã xong ở Task 3.
- Modify (chặn ghi): `okr-hoi-y.service.ts` — một hàm riêng `kiemKyChuaAn(tx, cycleId)` gọi `okr.assertKyChuaAn` trong MỌI method ghi (`moHoiY` … `hieuViSao`, 14 method); `okr-khep.service.ts` (`moRa`, `dongRa`, `moLaiKy`, `chamKr`, `ghiDieuHocDuoc`, `mangSang` phía nguồn); `okr.service.ts` `setCyclePhase`; mọi mutation còn lại trong router tra theo bảng ở Step 1.
- Modify: `apps/api/test/okr-sua-an-chu-ky.spec.ts` (nhóm `an-vang`), `apps/agent/test/okr-nhac.integration.spec.ts`, `apps/agent/test/okr-chup.integration.spec.ts` (nhóm `ky-an`)

**Interfaces:**
- Consumes: `KY_CON_HIEN` (Task 2), `OkrService.assertKyChuaAn` (Task 3), `soThuTuc` của `apps/api/test/ma-tran-thu.ts`.
- Produces: bảng `GHI_VAO_KY_AN: Record<string, (x: SanAn) => { vao: unknown; doi: (vId) => unknown; doc: () => Promise<unknown> }>` và `MIEN_GHI: Record<string, string>` (tên → lý do) trong bài.

- [ ] **Step 1: Bài đỏ `an-vang` (E9)** — `soThuTuc(app)` lọc mutation `okr.*`; khẳng định tập tên = khoá `GHI_VAO_KY_AN` ∪ khoá `MIEN_GHI` (so tập, in phần chênh). `MIEN_GHI` chỉ gồm thủ tục không chạm chu kỳ hoặc bản ghi con (`setProgram`, `troLyDeXuat` nếu không nhận id chu kỳ/mục tiêu, `luuMau`, `luuTruMau`, `khoiPhucMau`, `follow`, `moHopTuan` — soát từng tên trên router thật, ghi lý do) và bốn thủ tục mới. Mỗi dòng `GHI_VAO_KY_AN` gọi vào X → 400 câu `kyDaAn`, `doc()` trước/sau `toEqual`; `doi(V)` → được. Ba dòng nơi đọc (mang sang, cập nhật tuần của tôi, chuyển việc) theo E9 (2)–(4), so bằng id; hiện lại X → id của X quay lại.
- [ ] **Step 2: Bài đỏ `ky-an` (E10)** — okr-nhac: gieo X (ẩn) / V theo khung `gieoChuKy`, `gieoMucTieu`, `gieoKr` của `apps/agent/test/support/okr-gieo.ts` (thêm tham số `anLuc` cho `gieoChuKy`); `viecCanNhac(db, { now, cuaSo: "truc-tiep" })` → mục của U đúng tập id của V (cập nhật tuần, chờ duyệt, hỏi ý); `lienQuanOkr` người chỉ có dữ liệu ở X → false. okr-chup: KR nguồn máy ở X và V, `chupSoOkr(now, docGia(...))` → `okrSoChup` chỉ có KR của V; hiện lại X, chạy lại → có X.
- [ ] **Step 3:** chạy hai lệnh `sac_an_vang_api`, `sac_an_vang_nen` → FAIL.
- [ ] **Step 4:** cài lọc và chặn đúng danh sách. Mọi đường ghi chặn bằng `assertKyChuaAn` trong giao dịch (không tự viết `anLuc` rải rác).
- [ ] **Step 5:** xanh; phá thử theo CHIỀU ĐỎ E9 (bỏ `KY_CON_HIEN` khỏi `okr-cap-nhat`) và E10 (bỏ khỏi `okr-chup`) → đỏ đúng id.
- [ ] **Step 6:** năm lệnh kiểm xanh; các bài OKR sẵn có xanh không sửa kỳ vọng (chỉ thêm ca).
- [ ] **Step 7: Commit** — `feat(okr): chu kỳ ẩn vắng khỏi nơi tự tìm và không nhận ghi`.

---

### Task 5: Bài soi mã «nơi đọc chu kỳ»

independent: false (xanh sau Task 4) · phục vụ E11 (AC-9)

**Files:**
- Create: `_acceptance/sua-an-chu-ky-okr/rang/soi-ma.mjs` (ca `ky-con-hien`; ca `thiet-ke` thêm ở Task 9)

**Interfaces:**
- Consumes: `_acceptance/sua-an-chu-ky-okr/rang/noi-doc-chu-ky.json`.

- [ ] **Step 1:** khung theo `_acceptance/khep-ky-okr/rang/soi-ma.mjs` (`GOC` suy từ vị trí tệp, `typescript` qua `createRequire`, `--ca`, `--chieu-do`, `inVaThoat`). Duyệt AST mọi `.ts` ở ba thư mục (bỏ `generated`, `.eve`, `test`); mỗi `ObjectLiteralExpression` có khoá `cycle` (mọi độ sâu), khoá `cycleId` mà giá trị là object có `in`, khoá `startsOn`/`endsOn` nằm trong một object là giá trị của khoá `cycle`, lời gọi `okrCycle.findMany|findFirst|count|groupBy`, tagged template `$queryRaw` có chuỗi `okrCycle` mà không có `WHERE id =` → ghi (tệp, hàm bao quanh gần nhất: method, function, hoặc `const` cấp tệp). Bỏ qua object chỉ chứa `select`/`include` (đọc trường, không lọc).
- [ ] **Step 2:** so tập (tệp, hàm) với `loc ∪ mien` (mục `mien` có `ham: "*"` phủ cả tệp); thừa hoặc thiếu → `HONG` in phần chênh. Mỗi mục `loc`: trong hàm đó phải có định danh `KY_CON_HIEN` nằm trong cùng object where hoặc một `AND` bao nó → thiếu thì `HONG <tệp> <hàm> thiếu KY_CON_HIEN`.
- [ ] **Step 3:** `--chieu-do` ba ca trong tmpdir như E11 (a)(b)(c); bắt đủ → exit 1 (khuôn của `khep-ky-okr/rang/soi-ma.mjs`); đối chứng dương trên cây thật → exit 0.
- [ ] **Step 4:** `bun _acceptance/sua-an-chu-ky-okr/rang/soi-ma.mjs --ca ky-con-hien` → exit 0 sau Task 4; nếu còn chênh thì sửa MÃ hoặc cập nhật `noi-doc-chu-ky.json` kèm dòng sổ `fix` nói vì sao (không nới luật soi).
- [ ] **Step 5: Commit** — `test(sua-an-chu-ky-okr): soi mã nơi đọc chu kỳ`.

---

### Task 6: Ô chọn ngày tắt được

independent: true · phục vụ E13, E14 (sheet «chỉ sửa tên»); finding Nhóm 2 của design-pass

**Files:**
- Modify: `packages/ui/src/components/date-picker.tsx` (prop `disabled?: boolean` → `<button disabled={disabled} data-disabled={disabled ? "" : undefined}>`, `Popover` không mở khi `disabled`)
- Create: `packages/ui/test/date-picker-tat.dom.tsx`

- [ ] **Step 1: Bài đỏ** — render `<DatePicker value="2026-10-01" onChange={spy} disabled />`: nút `[data-slot=date-picker-trigger]` có `disabled`; bấm → không có `[role=dialog]`/lịch, `spy` không gọi; đối chứng dương: không `disabled` → bấm mở lịch.
- [ ] **Step 2:** `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/date-picker-tat.dom.tsx` → FAIL; cài; → PASS; phá thử (bỏ `disabled` khỏi nút) → ca tắt đỏ.
- [ ] **Step 3:** `bun run check-types`, `bun run build` xanh.
- [ ] **Step 4: Commit** — `feat(ui): DatePicker nhận disabled`.

---

### Task 7: Màn Cài đặt và khu OKR

independent: false (cần Task 3, 6) · phục vụ E12, E13 (AC-10, AC-11)

**Files:**
- Create: `apps/app/app/(app)/[slug]/settings/okr/o-chu-ky.tsx` — thành phần `OChuKy` nhận `{ gia, doi, khoaNgoaiTen: boolean, loai, namCha }` và vẽ các ô tên, ngày đầu, ngày cuối, khoảng nghỉ, ngày cập nhật tuần; `SheetMoChuKy` chuyển sang dùng nó (hành vi cũ giữ nguyên, bài cũ xanh).
- Create: `.../settings/okr/sheet-sua-chu-ky.tsx` — mở theo `?suaChuKy=<id>` (thêm `SEARCH_PARAM.okr.suaChuKy` ở `apps/app/lib/search-param-keys.ts`, `THAM_SO_SUA_CHU_KY`/`parseSuaChuKy = parseAsString` ở `okr-settings-search-params.ts`); loại, năm cha chỉ đọc; `khoaNgoaiTen = !ky.viec.suaMoiO` với `FieldDescription` giải thích; Lưu bật khi đã đổi và `suaChuKyInput` hợp lệ; `SheetClose` bọc Huỷ; gọi `trpc.okr.suaChuKy`, `cache.okr()`, toast.
- Create: `.../settings/okr/hop-thoai-an-chu-ky.tsx` — cùng hình `hop-thoai-mo-lai.tsx` (ô lý do bắt buộc `OKR_KHEP.lyDo.toiThieu`, `data-o-ly-do-an`, `DialogClose` bọc Huỷ).
- Modify: `bang-chu-ky.tsx` — thứ tự: `theoNam(chưa ẩn)` rồi chu kỳ đã ẩn; cột Pha của chu kỳ ẩn `StatusIndicator` tông `neutral` nhãn «Đã ẩn»; tên chu kỳ ẩn chữ mờ bằng dòng phụ (không `className` lên component `@crm/ui`); dòng phụ «Ẩn <ngày> lúc pha <pha> · <lý do>»; `MenuChuKy`: chu kỳ đã ẩn chỉ có «Hiện lại»; chưa ẩn thì mục mới theo `ky.viec` (`sua` khi `suaMoiO || suaTen`, `go`, `an` — `an` false mà năm có `quyConHien > 0` thì hiện mục tắt kèm «Còn <n> quý đang hiện — ẩn hoặc gỡ quý trước»), rồi mục cũ theo pha như hôm nay; `ConfirmDialog` tông `destructive` cho gỡ, `default` cho hiện lại; `SheetMoChuKy` nhận `cacNam` bỏ năm đã ẩn.
- Modify: `apps/app/app/(app)/[slug]/okr/okr-search-params.ts` — `giaiKy`, `giaiKyHoiY`, `kyMacDinhHoiY` coi id đã ẩn như id lạ; `chon-chu-ky.tsx` lọc `anLuc === null`.
- Modify: `apps/app/lib/messages/okr.ts` (vi và en), `apps/app/test/messages-guard.spec.ts` (`GHIM` cho hàm chữ mới).
- Create: `apps/app/test/okr-giai-ky-an.spec.ts` (E12, gồm ca `giai-ky-an-url`), `apps/app/test/okr-sua-an-chu-ky.dom.tsx` (E13, khung giả tRPC theo `okr-cai-dat.dom.tsx`: `thuTuc`, `mo`, `moMenu`, `chonMuc`, `bam`, `go`; gồm ca `go-bi-tu-choi` — mutation giả ném lỗi → toast, bảng làm mới — và `sau-go-ky-mac-dinh`).

**Interfaces:**
- Consumes: `ChuKy` (nay có `anLuc`, `anLyDo`, `quyConHien`, `viec`), `suaChuKyInput`, `OKR_KHEP.lyDo`, `DatePicker disabled`.

- [ ] **Step 1:** bài đỏ E12 và E13 đúng tập mục menu viết trước trong `evals.yaml` E13 (sáu hàng, gồm việc cũ).
- [ ] **Step 2:** `bun run test -- "cd apps/app && bun test test/okr-giai-ky-an.spec.ts"` và lệnh `sac_bang_dom` → FAIL.
- [ ] **Step 3:** cài theo Files; đo bằng mắt trên máy chủ dev của cây (cổng tự do, không 3000/3001), khớp ảnh `evidence/design-pass/*` đã duyệt.
- [ ] **Step 4:** xanh; phá thử CHIỀU ĐỎ E12 (không lọc `anLuc` trong `kyMacDinhHoiY`) và E13 (menu hiện «Gỡ» theo pha) → đỏ đúng câu.
- [ ] **Step 5:** năm lệnh kiểm xanh; `okr-cai-dat.dom.tsx` xanh không sửa kỳ vọng.
- [ ] **Step 6: Commit** — `feat(okr): màn sửa, gỡ, ẩn, hiện chu kỳ ở Cài đặt`.

---

### Task 8: Thước màn thật

independent: false (cần Task 7) · phục vụ E14, E15 (AC-11)

**Files:**
- Create: `_acceptance/sua-an-chu-ky-okr/rang/man-sua-an.mjs`

- [ ] **Step 1:** khung theo `_acceptance/khep-ky-okr/rang/man-khep-ky.mjs`: `HO_SO = "sua-an-chu-ky-okr"`, `BANG_CHUNG = .acceptance-runs/sua-an-chu-ky-okr/evidence`, `MOI_EVAL = ["E14","E15"]`, `EVAL`/`--chi`; `canhCay` từ `_acceptance/man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs`; `API, APP, CHROME, chiaCookie, khongDo, suySlug, ket` từ `man-that-lib.mjs`; tiền đề kho `okrCycle.count() === 0`; `phienCua` bằng `dev:session`; `lam(cookie, duong, vao)` gọi tRPC.
- [ ] **Step 2:** gieo qua API thật đúng sáu hàng của E14; chạy các bước E14 (ảnh 1440 và 390, `scrollWidth <= innerWidth`, chữ so tệp chữ); sau mỗi bước đọc DB như E15.
- [ ] **Step 3:** `--chieu-do` theo khuôn `motChieuDo` (worktree tạm, cấy lỗi): E14 — sheet sửa không tắt ô ngày khi chỉ sửa tên → «ô ngày còn bật»; E15 — hộp ẩn gửi lý do rỗng → in `note` đọc được.
- [ ] **Step 4:** `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/sua-an-chu-ky-okr/rang/man-sua-an.mjs"` → exit 0; `--chieu-do` → bắt đủ.
- [ ] **Step 5: Commit** — `test(sua-an-chu-ky-okr): thước màn sửa, gỡ, ẩn chu kỳ`.

---

### Task 9: Tài liệu và soi thiết kế

independent: false (cuối) · phục vụ E16, E17 (AC-12)

**Files:**
- Modify: `docs/api.md` (mục OKR: «Sửa, gỡ, ẩn chu kỳ» — năm cờ `viecChuKy`, bốn thủ tục, `KY_CON_HIEN` và `rang/noi-doc-chu-ky.json`, thứ tự khoá, `assertKyChuaAn`)
- Modify: `_acceptance/sua-an-chu-ky-okr/rang/soi-ma.mjs` (thêm ca `thiet-ke` theo khuôn `khep-ky-okr`: design-gate static, dấu hiệu vẽ tay, `DialogClose`/`SheetClose`, không chú thích, không `Record<string, unknown>`, không `useEffect(` trần, mỗi định danh một định nghĩa, `docs/api.md` có bốn tên thủ tục và `KY_CON_HIEN`, `CONTEXT.md` có «Ẩn» và «Gỡ»; `--chieu-do` hai vi phạm)

- [ ] **Step 1:** viết tài liệu; `bun _acceptance/sua-an-chu-ky-okr/rang/soi-ma.mjs --ca thiet-ke` → exit 0; `--chieu-do` → đỏ đủ hai vi phạm.
- [ ] **Step 2:** năm lệnh kiểm xanh toàn kho; `bun _acceptance/sua-an-chu-ky-okr/rang/soi-ma.mjs --ca ky-con-hien` và `migration-chi-them.mjs` xanh.
- [ ] **Step 3: Commit** — `docs(okr): luật sửa, gỡ, ẩn chu kỳ`.

---

## Thứ tự và song song

- Task 1, Task 2, Task 6 độc lập với nhau → chạy song song.
- Task 3 sau Task 1 và 2; Task 4 sau Task 3; Task 5 viết được sau Task 2 nhưng xanh sau Task 4; Task 7 sau Task 3 và 6; Task 8 sau Task 7; Task 9 cuối.

## Hồ sơ đã ký có thể phải ghim lại sau gộp

`dat-okr-trong-crm`, `khep-ky-okr`, `vai-chi-okr`, `dot-hoi-y-tuong-okr`, `so-okr-tu-chay` (hợp đồng Notes). Chạy `pre-merge-check` toàn kho sau Task 9; hồ sơ báo `evidence is stale` thì ghim lại bằng làn máy trước khi mở PR.
