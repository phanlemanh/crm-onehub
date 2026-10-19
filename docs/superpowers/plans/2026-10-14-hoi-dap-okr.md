# Hỏi đáp OKR theo quyền (hàng C) — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Người dùng hỏi Kara về OKR trong cột Kara của khu OKR và nhận câu trả lời chỉ từ Mục tiêu, KR mình xem được, có trích và số do mã kiểm.

**Architecture:** Loại phiên mới `okr-hoi` trong app eve `apps/agent-okr` (model ZDR). Ba công cụ tĩnh `tim_okr`, `doc_okr`, `nop_tra_loi`, mỗi công cụ tự kiểm purpose và lọc theo `nguCanhXemOkr` + `dieuKienXemMucTieu`. Câu trả lời người đọc thấy do mã dựng sau khi kiểm trích và số. Bảng `OkrCuocHoi` giữ chủ cuộc và lượt. Cửa `/eve/agents/okr` nhận cuộc hỏi. Cột Kara mở qua `?record=hoi-okr:<cuộc>`.

**Tech Stack:** eve 0.29.4, `@crm/ai-okr` (`xuongModelZdr`), Prisma, NestJS + tRPC, Next.js App Router, zod, bun test, `packages/ui` (khối Kara).

**Spec:** `docs/superpowers/specs/2026-10-14-hoi-dap-okr-design.md` · hợp đồng `_acceptance/hoi-dap-okr/contract.md` (approved 2026-10-14) · bộ đo `_acceptance/hoi-dap-okr/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- `apps/agent-okr` không nhập gì từ `apps/agent`; chỉ `@crm/db`, `@crm/validation`, `@crm/ai-okr`, `@crm/env`, `eve`.
- Quyền ở `tool`: mỗi `execute` tự kiểm purpose và quyền; từ chối là kết quả `{ ok: false, reason }`, không ném.
- Không dùng `defineDynamic` cho công cụ; `execute` viết tại chỗ.
- Khuôn đầu vào của công cụ không đệ quy (`z.json()`, `z.lazy()` cấm) — `test/khuon-di-dong.spec.ts` của agent-okr quét.
- Mọi hằng tinh chỉnh vào `TRO_LY_OKR_HOI` trong `apps/agent-okr/agent/lib/config.ts` (khuôn `as const`, đơn vị dẫn từ `MINUTE_MS`).
- Trần: 40 câu mỗi người mỗi ngày (giờ Asia/Ho_Chi_Minh), 10 USD mỗi tháng cho workspace, mục sổ chi phí `okr.hoi-dap` (Hỏi-2).
- Parse ở biên bằng zod; không truyền `Record<string, unknown>`.
- Tệp chữ chung (`apps/app/lib/messages/*.ts`, `_acceptance/config.yaml`, `CONTEXT.md`) chỉ thêm dòng; chữ mới vào tệp mới `apps/app/lib/messages/okr-hoi.ts`.
- AI chỉ mang tên Kara; mọi chữ vi + en; dữ liệu người nhập `translate="no"`.
- `migration` lấy mốc `date -u +%Y%m%d%H%M%S`, chỉ thêm bảng; kiểm `origin/onehub` ngay trước đẩy.
- Lệnh đo ghi tạo phẩm vào `.acceptance-runs/hoi-dap-okr/`, chỉ chép sang `_acceptance/hoi-dap-okr/evidence/` khi contract chưa `signed-off`.
- Mọi phép đo mới có cặp hai chiều trên cùng dựng cảnh: lành → xanh, phá → đỏ với thông điệp ghim.

## Review Focus

1. Câu hỏi gọi Mục tiêu giới hạn bằng chữ (không mã) — `tim_okr` tìm theo chữ phải không trả nó lẫn KR của nó (Task 3, ca từ khoá).
2. Kara kết thúc lượt mà không nộp `nop_tra_loi`, hoặc nộp bị từ chối hết — màn hiện «Kara chưa trả lời được» + «Thử lại», không treo «đang đọc» (Task 8, ca `hdo-man-khong-nop`).
3. Số viết kiểu Việt có dấu chấm nghìn («1.000», «14.000.000») — bộ kiểm số đọc là số nguyên, không phải 1,0 (Task 1, ca `nghin`).
4. Người bị gỡ khỏi workspace hay đổi sang vai ngoài danh sách khi thẻ còn hạn — kênh từ chối ở request kế (Task 5, ca `the-con-han`).
5. Chu kỳ chưa có OKR nào người hỏi xem được — `tim_okr` trả danh sách rỗng có cờ `rong: true`, Kara nộp `khong-biet` (Task 3 ca `rong`, Task 9 câu mẫu `chu-ky-trong`).

---

### Task 1: Khuôn phiên hỏi và bộ kiểm câu trả lời (`packages/validation`)

`independent: true` · phục vụ E4 (AC-4), nền cho E1–E3, E5.

**Files:**
- Create: `packages/validation/src/okr-phien-hoi.ts`
- Create: `packages/validation/src/okr-tra-loi.ts`
- Modify: `packages/validation/src/phien-tac-tu.ts` (thêm `"okr-hoi"` vào `SESSION_PURPOSES` — chỉ thêm phần tử)
- Modify: `packages/validation/package.json` (subpath `./okr-phien-hoi`, `./okr-tra-loi`)
- Test: `packages/validation/test/okr-tra-loi.spec.ts`

**Interfaces:**
- Produces:
  - `OKR_PHIEN_HOI = { purpose: "okr-hoi", issuer: "crm-app", audience: "crm-okr-agent" } as const`
  - `thuocTinhPhienHoi = z.object({ purpose: z.literal("okr-hoi"), cuocHoiId: z.string().trim().min(1), vai: z.enum(WORKSPACE_ROLES), email?, name? })`, `theCuaPhienHoi = thuocTinhPhienHoi.omit({ vai: true })`, type `ThuocTinhPhienHoi`.
  - `LOAI_TRA_LOI = ["tra-loi", "khong-biet", "ngoai-pham-vi"] as const`
  - `trichOkr = z.object({ loai: z.enum(["objective", "kr"]), id: z.string().trim().min(1).max(120) })`
  - `nopTraLoiInput = z.object({ loai: z.enum(LOAI_TRA_LOI), cauHoi: z.string().trim().min(1).max(500), cau: z.array(z.object({ chu: z.string().trim().min(1).max(600), trich: z.array(trichOkr).max(8) })).max(8).optional() })`
  - `type GiaTriTrich = { loai: "objective" | "kr"; id: string; truong: number[] }` — các giá trị trường của thứ được trích (tiến độ %, hiện tại, đích, mức tự tin dạng số).
  - `kiemSoCau(chu: string, trich: GiaTriTrich[]): { ok: true } | { ok: false; so: string; lop: "truong" | "dem" | "la" }`
  - `docSo(chuoi: string): number | null` — «42,5» và «42.5» → 42.5; «1.000», «14.000.000», «42.500» → 1000, 14000000, 42500 (dấu chấm theo nhóm ba chữ số là dấu nghìn).
  - `cauTraLoiDung = z.object({ loai, cau: z.array(z.object({ chu, trich: z.array(trichOkr.extend({ ten: z.string() })) })) })` — câu người đọc thấy, mã dựng.

- [ ] **Step 1: Viết bài đỏ** — `okr-tra-loi.spec.ts` với bảng ca viết sẵn, số khẳng định bằng số hàng:

```ts
import { describe, expect, test } from "bun:test";
import { docSo, kiemSoCau, type GiaTriTrich } from "../src/okr-tra-loi";

const kr = (id: string, truong: number[]): GiaTriTrich => ({ loai: "kr", id, truong });
const mt = (id: string, truong: number[]): GiaTriTrich => ({ loai: "objective", id, truong });

const CA: Array<{ ten: string; chu: string; trich: GiaTriTrich[]; ok: boolean; so?: string }> = [
	{ ten: "truong-tien-do-khop", chu: "KR này đạt 42%.", trich: [kr("k1", [42.49, 10, 20])], ok: true },
	{ ten: "truong-tien-do-lech", chu: "KR này đạt 55%.", trich: [kr("k1", [42.49, 10, 20])], ok: false, so: "55" },
	{ ten: "truong-hien-tai-phay", chu: "Hiện là 42,5 hợp đồng.", trich: [kr("k1", [10, 42.5, 60])], ok: true },
	{ ten: "truong-hien-tai-cham", chu: "Hiện là 42.5 hợp đồng.", trich: [kr("k1", [10, 42.5, 60])], ok: true },
	{ ten: "truong-dich-lech", chu: "Đích là 70.", trich: [kr("k1", [10, 42.5, 60])], ok: false, so: "70" },
	{ ten: "truong-tu-tin-khop", chu: "Mức tự tin 3.", trich: [kr("k1", [10, 3])], ok: true },
	{ ten: "nghin", chu: "Đã chốt 14.000.000 đồng.", trich: [kr("k1", [14000000])], ok: true },
	{ ten: "dem-kr-khop", chu: "Có 2 KR đang chậm.", trich: [kr("k1", [1]), kr("k2", [1])], ok: true },
	{ ten: "dem-kr-lech", chu: "Có 3 KR đang chậm.", trich: [kr("k1", [1]), kr("k2", [1])], ok: false, so: "3" },
	{ ten: "dem-muc-tieu-khop", chu: "Phòng có 1 Mục tiêu.", trich: [mt("o1", [50])], ok: true },
	{ ten: "mien-nam-quy", chu: "Trong quý 4 năm 2026 chưa có Mục tiêu nào trượt.", trich: [], ok: true },
	{ ten: "so-la", chu: "Đạt 80% kế hoạch.", trich: [kr("k1", [42, 10, 20])], ok: false, so: "80" },
	{ ten: "khong-so", chu: "KR này đang đúng nhịp.", trich: [kr("k1", [42])], ok: true },
];

describe("okr-tra-loi kiem so", () => {
	for (const c of CA) {
		test(c.ten, () => {
			const kq = kiemSoCau(c.chu, c.trich);
			expect(kq.ok).toBe(c.ok);
			if (!kq.ok) expect(kq.so).toBe(c.so);
		});
	}
	test("so-ca-bang-so-hang", () => expect(CA.length).toBe(13));
	test("doc-so", () => {
		expect(docSo("42,5")).toBe(42.5);
		expect(docSo("42.5")).toBe(42.5);
		expect(docSo("1.000")).toBe(1000);
		expect(docSo("14.000.000")).toBe(14000000);
		expect(docSo("abc")).toBeNull();
		expect(docSo("42.500")).toBe(42500);
	});
});
```

- [ ] **Step 2: Chạy, thấy đỏ** — `cd packages/validation && bun test test/okr-tra-loi.spec.ts` → FAIL «Cannot find module ../src/okr-tra-loi».
- [ ] **Step 3: Viết `okr-phien-hoi.ts`** theo đúng khuôn `okr-phien-soan.ts` (đổi `purpose`, `cuocSoanId` → `cuocHoiId`, tên hằng/kiểu như mục Interfaces), thêm `"okr-hoi"` vào `SESSION_PURPOSES`.
- [ ] **Step 4: Viết `okr-tra-loi.ts`**:

```ts
import { z } from "zod";

export const LOAI_TRA_LOI = ["tra-loi", "khong-biet", "ngoai-pham-vi"] as const;
export const LOAI_TRICH = ["objective", "kr"] as const;
const ma = z.string().trim().min(1).max(120);

export const trichOkr = z.object({ loai: z.enum(LOAI_TRICH), id: ma });
export const nopTraLoiInput = z.object({
	loai: z.enum(LOAI_TRA_LOI),
	cauHoi: z.string().trim().min(1).max(500),
	cau: z
		.array(z.object({ chu: z.string().trim().min(1).max(600), trich: z.array(trichOkr).max(8) }))
		.max(8)
		.optional(),
});
export type NopTraLoiInput = z.infer<typeof nopTraLoiInput>;

export const cauTraLoiDung = z.object({
	loai: z.enum(LOAI_TRA_LOI),
	cau: z.array(
		z.object({ chu: z.string(), trich: z.array(trichOkr.extend({ ten: z.string() })) }),
	),
});
export type CauTraLoiDung = z.infer<typeof cauTraLoiDung>;

export type GiaTriTrich = { loai: (typeof LOAI_TRICH)[number]; id: string; truong: number[] };
export type KetQuaKiemSo =
	| { ok: true }
	| { ok: false; so: string; lop: "truong" | "dem" | "la" };

const SO = /\d+(?:[.,]\d+)*/g;
const DEM = /^\s*(Mục tiêu|KR)\b/i;
const MIEN = /(năm|quý|quy)\s*$/i;

export function docSo(chuoi: string): number | null {
	const s = chuoi.trim();
	if (/^\d{1,3}(\.\d{3})+$/.test(s)) return Number(s.replaceAll(".", ""));
	if (/^\d{1,3}(,\d{3}){2,}$/.test(s)) return Number(s.replaceAll(",", ""));
	if (/^\d+([.,]\d+)?$/.test(s)) return Number(s.replace(",", "."));
	return null;
}

const khop = (n: number, v: number) => Math.round(n) === Math.round(v) || Math.abs(n - v) < 1e-9;

export function kiemSoCau(chu: string, trich: GiaTriTrich[]): KetQuaKiemSo {
	for (const m of chu.matchAll(SO)) {
		const so = m[0];
		const truoc = chu.slice(0, m.index);
		const sau = chu.slice((m.index ?? 0) + so.length);
		if (MIEN.test(truoc)) continue;
		const n = docSo(so);
		if (n === null) return { ok: false, so, lop: "la" };
		const dem = DEM.exec(sau);
		if (dem) {
			const loai = dem[1]?.toLowerCase() === "kr" ? "kr" : "objective";
			if (trich.filter((t) => t.loai === loai).length === n) continue;
			return { ok: false, so, lop: "dem" };
		}
		if (trich.some((t) => t.truong.some((v) => khop(n, v)))) continue;
		return { ok: false, so, lop: trich.length ? "truong" : "la" };
	}
	return { ok: true };
}
```

  Luật đọc số: dấu chấm theo nhóm ba chữ số là dấu nghìn («1.000», «14.000.000»; cả «42.500» đọc là 42500 theo lệ tiếng Việt); dấu phẩy là dấu thập phân trừ khi có từ hai nhóm ba chữ số; còn lại một dấu chấm hay phẩy là thập phân («42.5», «42,5»).
- [ ] **Step 5: Chạy, thấy xanh** — `cd packages/validation && bun test test/okr-tra-loi.spec.ts` → 15 pass.
- [ ] **Step 6: Phá-thử** — tạm đổi `kiemSoCau` trả `{ ok: true }` ngay đầu hàm, chạy lại → 4 ca lệch đỏ, thông điệp in tên ca; hoàn lại, chạy lại xanh.
- [ ] **Step 7: Commit** — `git add packages/validation && git commit -m "feat(hoi-dap-okr): khuôn phiên hỏi và bộ kiểm số câu trả lời"`.

### Task 2: Bảng `OkrCuocHoi`, mục chi phí, hàm cuộc hỏi (`packages/db`)

`independent: true` · nền cho E3, E5, E6, E7.

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (thêm model, chỉ thêm)
- Create: `packages/db/prisma/migrations/<UTC>_okr_cuoc_hoi/migration.sql` (sinh bằng `bun run db:migrate:dev --name okr_cuoc_hoi` hoặc `prisma migrate diff`, mốc UTC thật)
- Create: `packages/db/src/okr-cuoc-hoi.ts`
- Modify: `packages/db/src/ai-chi-phi-danh-muc.ts` (thêm `"okr.hoi-dap"` vào danh mục, cùng khuôn mục `okr.soan`)
- Modify: `packages/db/package.json` (subpath `./okr-cuoc-hoi`)
- Test: `packages/db/test/okr-cuoc-hoi.spec.ts`

**Interfaces:**
- Produces:

```prisma
model OkrCuocHoi {
  id                String   @id @default(cuid())
  nguoiHoiUserId    String
  sessionId         String   @unique
  cacPhien          String[] @default([])
  streamIndex       Int      @default(0)
  continuationToken String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([nguoiHoiUserId, createdAt])
  @@map("okrCuocHoi")
}

model OkrLuotHoi {
  id         String   @id @default(cuid())
  cuocHoiId  String
  userId     String
  ngay       String
  createdAt  DateTime @default(now())

  @@index([userId, ngay])
  @@map("okrLuotHoi")
}
```

  - `taoCuocHoi(db, userId): Promise<{ id: string; sessionId: string }>` — `sessionId = "cho-eve:" + crypto.randomUUID()`.
  - `cuocHoiCua(db, cuocHoiId): Promise<{ id; nguoiHoiUserId; sessionId; cacPhien } | null>`
  - `ghiPhienEve(db, cuocHoiId, sessionId): Promise<void>` — thay placeholder; đã có phiên thật thì nối `cacPhien`.
  - `demLuotNgay(db, userId, ngay: string): Promise<number>`; `ghiLuot(db, { cuocHoiId, userId, ngay }): Promise<void>`
  - `chiPhiThangHoiDap(db, thang: Date): Promise<number>` — tổng `AiChiPhi.costUsd` mục `okr.hoi-dap` từ đầu tháng (giờ Asia/Ho_Chi_Minh).

- [ ] **Step 1: Viết bài đỏ** `okr-cuoc-hoi.spec.ts` (kho kiểm `test-database`): tạo cuộc → `sessionId` bắt đầu `cho-eve:`; `ghiPhienEve` lần 1 thay placeholder, lần 2 nối `cacPhien`; `ghiLuot` 3 lần → `demLuotNgay` = 3, ngày khác = 0; gieo `AiChiPhi` hai hàng `okr.hoi-dap` tháng này + một hàng tháng trước + một hàng `okr.soan` → `chiPhiThangHoiDap` bằng tổng hai hàng đầu.
- [ ] **Step 2: Chạy, thấy đỏ** — `bun run test -- "cd packages/db && bun test test/okr-cuoc-hoi.spec.ts"` → FAIL.
- [ ] **Step 3: Thêm model, sinh migration** (`date -u +%Y%m%d%H%M%S` làm mốc; `bun run db:generate`), thêm mục danh mục, viết `okr-cuoc-hoi.ts`.
- [ ] **Step 4: Chạy, thấy xanh.**
- [ ] **Step 5: Commit** — `feat(hoi-dap-okr): bảng cuộc hỏi, lượt hỏi và mục chi phí okr.hoi-dap`.

### Task 3: Công cụ đọc theo quyền `tim_okr`, `doc_okr` (`apps/agent-okr`)

`independent: false` (cần Task 1, 2) · phục vụ E1 (AC-1), E2 (AC-2).

**Files:**
- Create: `apps/agent-okr/agent/lib/hoi-doc.ts`
- Create: `apps/agent-okr/agent/tools/tim_okr.ts`, `apps/agent-okr/agent/tools/doc_okr.ts`
- Modify: `apps/agent-okr/agent/lib/phien.ts` (đọc cả hai khuôn: `cuocSoanId` hay `cuocHoiId`, `purpose` thuộc `{okr-soan, okr-hoi}`)
- Modify: `apps/agent-okr/agent/lib/config.ts` (khối `TRO_LY_OKR_HOI`: `purpose`, `tuChoi` hằng câu từ chối vi, `tranKetQua: { mucTieu: 30, kr: 60, capNhat: 4 }`, `tinhNang: "okr.hoi-dap"`, `tran: { cauMoiNgay: 40, usdMoiThang: 10 }`, `mui: "Asia/Ho_Chi_Minh"`)
- Test: `apps/agent-okr/test/hoi-quyen.integration.spec.ts`, `apps/agent-okr/test/hoi-purpose.spec.ts`

**Interfaces:**
- Consumes: `nguCanhXemOkr`, `dieuKienXemMucTieu` (`@crm/db/okr-hien-thi`); `tienDoKr` (`@crm/validation/okr-kr`); `kyVongTheoNgay`, `tienDoMucTieu` (`@crm/db/okr-tien-do`); `tinhTrang` (`@crm/validation/okr-muc-tieu`); `OKR_PHIEN_HOI`.
- Produces:
  - `type TuChoi = { ok: false; reason: string }`
  - `canPhienHoi(ctx): { userId: string; cuocHoiId: string } | TuChoi` — purpose khác `okr-hoi` → `TuChoi` với `TRO_LY_OKR_HOI.tuChoi.saiMucDich`.
  - `timOkr(userId, loc: { tu?: string; cycleId?: string; cuaToi?: boolean; tinhTrang?: TinhTrang }): Promise<{ ok: true; rong: boolean; mucTieu: MucTieuNgan[] }>` — `MucTieuNgan = { id, ten, donVi, loai, tienDo, tinhTrang, kr: { id, ten, tienDo, hienTai, dich, donVi, tuTin: number | null }[] }`. Tìm chữ khớp tên Mục tiêu hay tên KR, nhưng chỉ trong tập Mục tiêu `dieuKienXemMucTieu(nc)`.
  - `docOkr(userId, ma: { loai: "objective" | "kr"; id: string }): Promise<{ ok: true; mucTieu: MucTieuDay } | { ok: false; reason: string }>` — `MucTieuDay` = `MucTieuNgan` + `capNhat` (bốn Cập nhật tuần gần nhất mỗi KR: tuần, giá trị, mức tự tin). Mã ngoài quyền và mã bịa trả cùng một `reason` `khongThay`.
  - Công cụ `tim_okr`, `doc_okr`: `execute` gọi `canPhienHoi` trước rồi `timOkr`/`docOkr`.

- [ ] **Step 1: Viết bài đỏ `hoi-quyen.integration.spec.ts`** — nạp bộ M bằng đường ghi thật của `okr:mau` (gọi hàm nạp mà `apps/api/scripts/okr-mau.ts` xuất, trên kho kiểm của lượt); ma trận năm người viết sẵn:

```ts
const NGUOI = ["admin", "truong-phong", "thanh-vien", "thai-minh-chau", "tran-quoc-bao"] as const;
const CONG_CU = ["tim_okr", "doc_okr"] as const;
```

  Với mỗi (người, công cụ): tập mã Mục tiêu và KR trả về `toEqual` tập rút từ `db.okrObjective.findMany({ where: { AND: [locChuKy, dieuKienXemMucTieu(nc)] }, include: { keyResults: true } })`; người không có tên ở `q4-phap-che-3` → `JSON.stringify(kq)` không chứa mã, tên Mục tiêu đó và mã, tên mọi KR của nó (rút từ db lúc chạy); `tim_okr({ tu: <chữ trong tên một KR của q4-phap-che-3> })` với người đó → không có KR ấy; `doc_okr` mã giới hạn và mã bịa trả cùng `reason`. Đối chứng dương: `tran-quoc-bao`, admin thấy. `expect(soKhangDinhMaTran).toBe(NGUOI.length * CONG_CU.length)`. Ca `rong`: chu kỳ năm kế (không OKR) → `rong: true`.
- [ ] **Step 2: Viết bài đỏ `hoi-purpose.spec.ts`** — ma trận 3 purpose × 4 công cụ (12 ô), dùng ctx giả theo khuôn `SessionContext`; ô sai purpose trả `{ ok: false, reason: TRO_LY_OKR_HOI.tuChoi.saiMucDich }` (hay hằng soạn cho `nop_ban_nhap`) và bộ đếm truy vấn (`db.$extends({ query: { $allOperations } })`) bằng 0.
- [ ] **Step 3: Chạy, thấy đỏ** — `bun run test -- "cd apps/agent-okr && CRM_TELEMETRY_DISABLED=1 bun test test/hoi-quyen.integration.spec.ts test/hoi-purpose.spec.ts"`.
- [ ] **Step 4: Viết `hoi-doc.ts`, hai công cụ, khối config, sửa `phien.ts`.** `description` của công cụ bằng tiếng Anh, nói rõ: chỉ trả OKR người hỏi xem được; không tìm thấy nghĩa là không có hoặc không được xem.
- [ ] **Step 5: Chạy, thấy xanh.**
- [ ] **Step 6: Phá-thử** — (a) thay `dieuKienXemMucTieu(nc)` bằng `{}` → hàng thành viên đỏ, in tập thừa; (b) tìm KR theo chữ không qua Mục tiêu cha → ca từ khoá đỏ; hoàn lại.
- [ ] **Step 7: Commit** — `feat(hoi-dap-okr): công cụ tim_okr, doc_okr lọc theo quyền người hỏi`.

### Task 4: `nop_tra_loi` — kiểm trích, kiểm số, mã dựng câu (`apps/agent-okr`)

`independent: false` (cần Task 1, 3) · phục vụ E3 (AC-3), E4 (AC-4).

**Files:**
- Create: `apps/agent-okr/agent/lib/hoi-tra-loi.ts`, `apps/agent-okr/agent/tools/nop_tra_loi.ts`
- Test: `apps/agent-okr/test/nop-tra-loi.integration.spec.ts`

**Interfaces:**
- Consumes: `canPhienHoi`, `docOkr` (Task 3); `nopTraLoiInput`, `kiemSoCau`, `cauTraLoiDung` (Task 1).
- Produces: `nopTraLoi(userId, input: NopTraLoiInput): Promise<{ ok: true; traLoi: CauTraLoiDung } | { ok: false; reason: string; ma?: string; so?: string }>` — mọi trích qua `docOkr` của người hỏi; một trích hỏng hay một số hỏng thì từ chối cả câu trả lời, `reason` nêu mã hay số; `loai: "khong-biet" | "ngoai-pham-vi"` không cần trích. Công cụ trả `ketQua` này; `outputSchema` là union đó.

- [ ] **Step 1: Bài đỏ** — ma trận 6 ô {objective, kr} × {xem được, giới hạn, mã bịa} cho thành viên không có tên; ô giới hạn/mã bịa → `ok: false` với `ma` đúng; câu hợp lệ đi kèm câu sai → không có `traLoi`; đối chứng: `tran-quoc-bao` trích `q4-phap-che-3` và KR của nó được nhận; câu có số khớp tiến độ được nhận, `traLoi.cau[0].trich[0].ten` = tên Mục tiêu thật.
- [ ] **Step 2: Chạy đỏ** — `bun run test -- "cd apps/agent-okr && CRM_TELEMETRY_DISABLED=1 bun test test/nop-tra-loi.integration.spec.ts"`.
- [ ] **Step 3: Viết lib và công cụ.** Giá trị trường mỗi trích: tiến độ %, hiện tại, đích, khởi điểm, mức tự tin dạng số (thang của `okrCheckIn.confidence`), tiến độ Mục tiêu.
- [ ] **Step 4: Chạy xanh. Phá-thử:** bỏ bước tra quyền của trích kr → ô (kr, giới hạn) đỏ; hoàn lại.
- [ ] **Step 5: Commit** — `feat(hoi-dap-okr): nop_tra_loi kiểm trích và số, mã dựng câu trả lời`.

### Task 5: Kênh, lời dặn theo phiên, sổ chi phí, ghim ZDR (`apps/agent-okr`)

`independent: false` (cần Task 1, 2) · phục vụ E5b (AC-5), E7 (AC-7), E11 (AC-11), E12 (AC-12).

**Files:**
- Modify: `apps/agent-okr/agent/lib/kenh-cua.ts` — nhận thẻ phiên hỏi: parse `theCuaPhienHoi`; đọc hàng `member` mỗi request; cuộc hỏi phải thuộc người gọi (`ForbiddenError` với `TRO_LY_OKR_HOI.tuChoi.cuocKhongThuocPhien`); trả `attributes: thuocTinhPhienHoi.parse({...})`. Nhánh soạn giữ nguyên.
- Move: `apps/agent-okr/agent/instructions.md` → nội dung chuyển vào `apps/agent-okr/agent/instructions/soan.ts` (`defineDynamic`, `session.started`, chỉ trả khi purpose `okr-soan`); `goi.ts` giữ, chỉ chạy cho `okr-soan`.
- Create: `apps/agent-okr/agent/instructions/hoi.ts` — lời dặn hỏi đáp (tiếng Việt): luôn gọi `tim_okr`/`doc_okr` trước khi nói một con số; mọi câu trả lời đi qua `nop_tra_loi` đúng một lần cuối lượt; câu xin sửa → `ngoai-pham-vi` kèm chỉ chỗ sửa; câu đối tác → `ngoai-pham-vi`; không tìm thấy → `khong-biet`; chỉ trích thứ đã đọc.
- Modify: `apps/agent-okr/agent/hooks/chi-phi.ts` — `tinhNang` và `taskId` theo purpose (`okr.hoi-dap` + `cuocHoiId`; `okr.soan` + `cuocSoanId`).
- Test: `apps/agent-okr/test/kenh-cua-hoi.spec.ts`, `test/chi-phi-hoi.spec.ts`, `test/loi-dan-theo-phien.spec.ts`, `test/zdr-hoi.spec.ts`

- [ ] **Step 1: Bài đỏ bốn tệp:**
  - `kenh-cua-hoi.spec.ts`: thẻ hỏi còn hạn của người bị xoá `member` → `null`; đổi vai sang giá trị ngoài `vaiDuocVao` → `null`; cuộc của người khác → `ForbiddenError` với hằng; thẻ hợp lệ → principal có `purpose: "okr-hoi"` (ca `the-con-han`).
  - `chi-phi-hoi.spec.ts`: sự kiện `step.completed` theo khuôn eve thật (lấy một sự kiện ghi lại trong `apps/agent-okr/test/fixtures/` hay tái dùng fixture của bài chi phí có sẵn) cho phiên hỏi và phiên soạn → đúng một hàng mỗi phiên, `okr.hoi-dap`/`okr.soan`.
  - `loi-dan-theo-phien.spec.ts`: resolver `soan.ts` trả lời dặn cho `okr-soan`, `null` cho `okr-hoi`; `hoi.ts` ngược lại; câu mốc đầu của lời dặn soạn không xuất hiện ở phiên hỏi.
  - `zdr-hoi.spec.ts`: `agent.ts` dùng `xuongModelZdr` một model; quét nguồn `_acceptance/hoi-dap-okr/rang/*.mjs` không có import gateway/provider nào ngoài `@crm/ai-okr`.
- [ ] **Step 2: Chạy đỏ.**
- [ ] **Step 3: Viết.** Chạy lại bài soạn có sẵn: `bun run test -- "cd apps/agent-okr && CRM_TELEMETRY_DISABLED=1 bun test"` — mọi bài cũ xanh không sửa kỳ vọng.
- [ ] **Step 4: Phá-thử** — hook ghi cứng `okr.soan` → ca hỏi đỏ; nạp lời dặn soạn cho mọi phiên → ca hỏi đỏ; hoàn lại.
- [ ] **Step 5: Commit** — `feat(hoi-dap-okr): kênh nhận phiên hỏi, lời dặn theo phiên, sổ chi phí okr.hoi-dap`.

### Task 6: API mở cuộc hỏi, đếm lượt, trần (`apps/api`)

`independent: false` (cần Task 2) · phục vụ E6 (AC-6).

**Files:**
- Create: `apps/api/src/okr/hoi.service.ts`
- Modify: `apps/api/src/okr/okr.router.ts` (ba thủ tục: `hoiMo` POST `/okr/hoi/sessions`, `hoiTangLuot` POST `/okr/hoi/sessions/{cuocHoiId}/turn`, `hoiCuaToi` GET `/okr/hoi/sessions`), `okr.module.ts` (provider), `okr.contracts.ts` hay `packages/validation/src/okr-tra-loi.ts` (khuôn vào/ra)
- Modify: `apps/api/src/generated/server.ts` (sinh lại bằng `bun run trpc:generate`)
- Test: `apps/api/test/okr-hoi-luot.spec.ts`

**Interfaces:**
- Produces: `hoiMo(userId) → { cuocHoiId, sessionId }`; `hoiTangLuot(userId, cuocHoiId, now = new Date()) → { ok: true } | { ok: false; lyDo: "het-luot-ngay" | "het-tran-thang" }` — cuộc không thuộc người gọi → `ForbiddenException`; ngày tính theo `TRO_LY_OKR_HOI.mui`; trần đọc từ `TRO_LY_OKR_HOI.tran` (xuất qua `packages/validation/src/okr-tra-loi.ts` để API không nhập agent-okr). `hoiCuaToi(userId) → { id, createdAt }[]` (20 cuộc gần nhất).

- [ ] **Step 1: Bài đỏ** (đồng hồ ghim `setSystemTime` TRƯỚC khi gieo, `TZ=Asia/Ho_Chi_Minh`): 40 lượt qua, lượt 41 `het-luot-ngay`; sang ngày mới qua; ghi `AiChiPhi` bằng chính hook chi phí của agent-okr (nhập hàm ghi mà hook gọi — `ghiChiPhi` với `tinhNang` của config) tới trần → `het-tran-thang`; hàng tháng trước không tính; cuộc của người khác → Forbidden.
- [ ] **Step 2: Chạy đỏ** — `bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/okr-hoi-luot.spec.ts"`.
- [ ] **Step 3: Viết service, router, sinh lại `server.ts`.** Router mang `PhamViOkrMiddleware` như các thủ tục OKR khác; thêm dòng đầu vào vào `DAU_VAO_HOP_LE` của `apps/api/test/vai-chi-okr.spec.ts` nếu bài ma trận đòi.
- [ ] **Step 4: Chạy xanh; chạy `apps/api/test/vai-chi-okr.spec.ts` xanh. Phá-thử:** trần vô cực → lượt 41 qua, bài đỏ.
- [ ] **Step 5: Commit** — `feat(hoi-dap-okr): API mở cuộc hỏi, đếm lượt ngày, trần tháng`.

### Task 7: Cửa web nhận cuộc hỏi (`apps/app`)

`independent: false` (cần Task 1, 6) · phục vụ E5a (AC-5), E6c (AC-6).

**Files:**
- Modify: `apps/app/app/eve/agents/okr/eve/v1/[...path]/route.ts` — header mới `x-crm-cuoc-hoi` (loại trừ với `x-crm-cuoc-soan`); cuộc hỏi phải của người gọi (403 `cuoc-khong-thuoc`); đường phiên phải thuộc `sessionId`/`cacPhien` (409 `phien-da-thay`); `POST session` chỉ khi còn placeholder; mỗi lượt gọi `okr.hoiTangLuot` — `ok: false` → 429 thân `{ lyDo }`, KHÔNG chuyển tiếp; mint thẻ với `purpose: "okr-hoi"`, `cuocHoiId`.
- Modify: `apps/app/lib/cua-okr-config.ts` (tên header, mã từ chối), `apps/app/lib/agent-bridge.ts` (`mintOkrBridgeToken` nhận thuộc tính phiên hỏi — mở rộng tham số, hàm cũ không đổi hành vi soạn)
- Test: `apps/app/test/cua-okr-hoi.spec.ts`

- [ ] **Step 1: Bài đỏ** — gọi handler thật với `fetch` tới agent-okr thay bằng bộ đếm; ma trận: cuộc người khác 403, đường phiên lạ 409, không `member` 403, vai `okr` và `member` với cuộc của mình chuyển (đối chứng); mọi ca từ chối: `hoiTangLuot` không được gọi. Ca `hdo-tran`: lượt 40 qua (đếm 1), lượt 41 → 429 `het-luot-ngay`, đếm vẫn 1; trần tháng → 429 `het-tran-thang`.
- [ ] **Step 2: Chạy đỏ** — `bun run test -- "cd apps/app && TZ=Asia/Ho_Chi_Minh bun test ./test/cua-okr-hoi.spec.ts"`.
- [ ] **Step 3: Viết.** Chạy `apps/app/test/cua-okr.spec.ts` (soạn) xanh không sửa.
- [ ] **Step 4: Phá-thử** — bỏ so chủ cuộc → ca cuộc người khác 200, bài đỏ; bắt 429 rồi vẫn chuyển → đếm tăng, bài đỏ.
- [ ] **Step 5: Commit** — `feat(hoi-dap-okr): cửa /eve/agents/okr nhận cuộc hỏi, chặn khi hết lượt`.

### Task 8: Cột Kara hỏi đáp và nút «Hỏi Kara» (`apps/app`)

`independent: false` (cần Task 7) · phục vụ E6m (AC-6), E10m (AC-10), E13 (AC-13), mặt cho E10.

**Files:**
- Modify: `apps/app/components/crm/record-sheet/record-stack.ts` (thêm `"hoi-okr"` vào `RECORD_KINDS`), `record-sheet-host.tsx` (nhánh `hoi-okr` → cỡ `kara`, render `CotHoiKara`)
- Create: `apps/app/app/(app)/[slug]/okr/hoi/cot-hoi-kara.tsx` (client: `KaraDock` chỉ cột Kara, `KaraTranscript`, `KaraComposer`, `KaraState`, `KaraRetry`; `useEveAgent` qua host `/eve/agents/okr`, header `x-crm-cuoc-hoi`)
- Create: `apps/app/app/(app)/[slug]/okr/hoi/the-tra-loi.tsx` (render `CauTraLoiDung`: mỗi câu + `InlineCitation` đẩy `?record=objective:<id>`/`kr:<id>`; tên trong `<span translate="no">`; `AiFeedback`)
- Create: `apps/app/app/(app)/[slug]/okr/hoi/nut-hoi-kara.tsx` (gọi `okr.hoiMo` rồi đẩy `?record=hoi-okr:<cuộc>`)
- Modify: `apps/app/app/(app)/[slug]/okr/dau-trang-okr.tsx` và trang tổng quan của vai chỉ OKR (`tong-quan-chi-okr.tsx`) — thêm `NutHoiKara` trong `PageShellActions`, `variant="outline"`
- Create: `apps/app/lib/messages/okr-hoi.ts` (vi + en, cùng tập khoá); đăng ký vào chỗ gộp messages (chỉ thêm dòng)
- Test: `apps/app/test/okr-hoi.dom.tsx`

**Interfaces:**
- Consumes: `cauTraLoiDung` (Task 1) — parse kết quả công cụ `nop_tra_loi` từ luồng sự kiện ở biên (`cauTraLoiDung.safeParse`), không truyền object thô.
- Produces: `CotHoiKara({ cuocHoiId }: { cuocHoiId: string })`, `TheTraLoi({ traLoi }: { traLoi: CauTraLoiDung })`, `NutHoiKara()`.

- [ ] **Step 1: Bài đỏ `okr-hoi.dom.tsx`** với luồng sự kiện giả rút từ một phiên agent-okr ghi lại (fixture `apps/app/test/fixtures/okr-hoi-luong.json`, chép từ `AgentEvent` của một lượt thật trên kho đo — không tự dựng khuôn):
  - `hdo-man`: câu trả lời hiện mỗi câu một `InlineCitation` và một `AiFeedback`; bấm trích → router đẩy `record=objective:<id>`; dưới 768 px khung phủ toàn màn.
  - `hdo-man-khong-nop`: lượt kết thúc không có kết quả `nop_tra_loi` được nhận → «Kara chưa trả lời được» + `KaraRetry` gửi lại đúng câu.
  - `hdo-khoa`: phản hồi 429 `het-luot-ngay` / `het-tran-thang` → ô gõ `disabled` + `FieldDescription` chữ từ messages; 200 → ô gõ bật.
  - `hdo-chu`: khoá vi = khoá en; tên Mục tiêu nằm trong phần tử `translate="no"`.
- [ ] **Step 2: Chạy đỏ** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-hoi.dom.tsx`.
- [ ] **Step 3: Viết thành phần.** Chỉ dùng khối của `packages/ui` (bậc 1 của `docs/design.md`); không `className` đổi màu, góc, khoảng cách.
- [ ] **Step 4: Chạy xanh; chạy `apps/app/test/messages-guard.spec.ts`, `kara-mot-ten.spec.ts` xanh. Phá-thử:** bỏ `InlineCitation` → `hdo-man` đỏ.
- [ ] **Step 5: Commit** — `feat(hoi-dap-okr): cột Kara hỏi đáp, nút Hỏi Kara ở khu OKR`.

### Task 9: Bộ câu mẫu và ba lệnh đo (`apps/agent-okr/evals`, `_acceptance/hoi-dap-okr/rang`)

`independent: false` (cần Task 3–8) · phục vụ E8 (AC-8), E9/E9j (AC-9), E10 (AC-10), E12.

**Files:**
- Create: `apps/agent-okr/evals/okr-hoi/ca/*.json` — ít nhất 30 câu, mỗi câu `{ ma, nguoiHoi (email bộ M), yDinh (một trong bảy), cauHoi, kyVong: { loai, trichBatBuoc: string[], tenCam: string[] } }`; đủ năm người hỏi × bảy ý định theo `coverage-scan.md`, gồm `chu-ky-trong`, câu gọi `q4-phap-che-3` bằng chữ, câu đối tác của vai okr, câu xin sửa.
- Create: `apps/agent-okr/evals/okr-hoi/ca.ts` (khuôn zod của câu mẫu, parse ở biên)
- Create: `_acceptance/hoi-dap-okr/rang/do-hoi-dap.mjs` — dựng cuộc hỏi qua cửa thật cho từng người, gửi câu, đọc kết quả `nop_tra_loi`, chấm luật mã (quyền: không tên cấm, không trích ngoài quyền; trích bắt buộc; số qua `kiemSoCau`), chấm hội đồng ZDR (model từ `@crm/ai-okr`, ba phiếu, đa số) với ảnh chụp giá trị Mục tiêu/KR rút từ kho đo; ghi bảng + JSON vào `.acceptance-runs/hoi-dap-okr/`, chép sang `evidence/` chỉ khi chưa ký; ngưỡng `NGUONG = { quyen: 1, trichSo: 0.9, dungY: 0.85 }` khai một chỗ; thiếu người hay ý định → thoát 2 trước khi gọi model.
- Create: `_acceptance/hoi-dap-okr/rang/do-hoi-dap.test.ts` — ca hỏng dựng sẵn (câu trả lời giả nhắc tên cấm; phiếu giả dưới ngưỡng) qua hàm chấm thuần của lệnh đo → thoát 1, gọi tên câu, in tỷ lệ.
- Create: `_acceptance/hoi-dap-okr/rang/chi-hoi-okr.mjs` — đối chứng dương trước (thành viên hỏi «liệt kê deals của công ty» qua `/eve/v1` của Kara CRM → ≥1 tên đối tác, không thì thoát 2); rồi `thai-minh-chau` qua cửa OKR: câu OKR có ≥1 trích; câu đối tác 0 tên đối tác trong mọi `AgentEvent` của phiên, công cụ ⊆ {tim_okr, doc_okr, nop_tra_loi}.
- Create: `_acceptance/hoi-dap-okr/rang/chi-hoi-okr.sql` — đếm theo vai mọi `AgentEvent` của phiên `okr-hoi` gọi công cụ ngoài ba công cụ OKR (kỳ vọng 0), cho production lúc bật.
- Create: `_acceptance/hoi-dap-okr/rang/man-hoi.mjs` — khuôn `kanban-viec/rang/man.mjs`: cảnh cây, mỗi khổ một phiên (1280, 375), mốc dương mỗi bước, ảnh vào `.acceptance-runs/hoi-dap-okr/evidence/`, Kara giả theo khuôn sự kiện thật cho bước trả lời.

- [ ] **Step 1: Viết khuôn câu mẫu + bài `do-hoi-dap.test.ts` (đỏ).**
- [ ] **Step 2: Viết 30+ câu mẫu; chạy kiểm phủ:** `node _acceptance/hoi-dap-okr/rang/do-hoi-dap.mjs --kiem-phu` → in bảng năm người × bảy ý định, thoát 0.
- [ ] **Step 3: Viết ba lệnh đo; chạy bài thuần xanh; phá-thử ca tên cấm → thoát 1.**
- [ ] **Step 4: Chạy thật trên phiên đo** (cần khoá — chạy trong S4, không ở S3): chỉ kiểm cú pháp ở S3 bằng `node --check`.
- [ ] **Step 5: Commit** — `test(hoi-dap-okr): bộ câu hỏi OKR mẫu và ba lệnh đo`.

### Task 10: Tài liệu và cổng năm lệnh

`independent: false` (cuối) · phục vụ AC-11, AC-13 gián tiếp.

**Files:**
- Modify: `docs/agent.md` — mục «App eve thứ hai» thêm đoạn loại phiên `okr-hoi`, ba công cụ, câu trả lời mã dựng, trần; bảng «Áp dụng hôm nay» thêm hàng hỏi đáp OKR.
- Modify: `docs/ai-ux.md` — §11 «Đang áp» thêm cột Kara hỏi đáp; bảng lộ trình thêm hàng `hoi-dap-okr`.
- Modify: `docs/environment.md` không đổi (không biến mới).

- [ ] **Step 1: Viết tài liệu.**
- [ ] **Step 2: Chạy năm lệnh từ gốc kho:** `bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build` — tất cả exit 0.
- [ ] **Step 3: Commit** — `docs(hoi-dap-okr): agent.md, ai-ux.md`.

## Thứ tự và song song

Task 1 và Task 2 độc lập, làm trước. Task 3, 5, 6 cần cả hai; Task 4 cần 3; Task 7 cần 6; Task 8 cần 7; Task 9 cần 3–8; Task 10 cuối. Thực thi Native (phiên này), tuần tự theo số.
