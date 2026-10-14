# Kanban việc Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** «Việc của tôi» có kiểu xem Bảng bốn cột kéo được (kèm menu «Chuyển sang…» và kéo bằng phím), thứ tự riêng từng người trong cột, và việc con một tầng thêm từ khung việc.

**Architecture:** Mọi lệnh ghi mới sống ở `packages/db/src/viec-ghi.ts` cạnh hàm DA1 và chỉ THÊM hàm (`keoViec`, `taoViecCon`), gọi lại `doiTrangThai`, `taoViec` của DA1 nguyên vẹn. API thêm một service riêng `viec-bang.service.ts` và ba thủ tục trên router `viec` (`bang`, `keo`, `taoCon`) cộng một truy vấn `con`. Giao diện dựng trên `Board` của `packages/ui`, mở rộng hai lựa chọn không bắt buộc `canDrop` và `reorder`.

**Tech Stack:** Prisma 7 (Postgres), NestJS + nestjs-trpc, Next.js app router, React Query, nuqs, dnd-kit (qua `reui/kanban.tsx`), bun:test, happy-dom.

**Spec:** `docs/superpowers/specs/2026-10-13-kanban-viec-design.md` · hợp đồng `_acceptance/kanban-viec/contract.md` (12 AC, đã duyệt 13/10) · `_acceptance/kanban-viec/evals.yaml` (19 eval).

## Global Constraints

- Không viết chú thích trong code (AGENTS.md).
- Chỉ THÊM hàm và giá trị ở `packages/db/src/viec-ghi.ts`, `packages/db/src/viec.ts`; không sửa thân hàm cũ (Điều phối M5, 13/10 — DA1b chạy song song).
- `packages/ui`: lựa chọn mới của `Board` không bắt buộc; vắng chúng thì `Board` chạy y như cũ.
- Client component không nhập `@crm/db`, `@crm/auth`; nhập `@crm/ui/components/<tên>` theo subpath, hằng Việc từ `@crm/validation/viec`.
- Không `className` đổi màu, góc, khoảng cách component `@crm/ui`.
- Hằng tinh chỉnh vào `VIEC` (`packages/db/src/viec.ts`): `VIEC.bang.xongGanDayNgay = 7`.
- Chữ người dùng ở `apps/app/lib/messages/viec.ts` (en và vi); dữ liệu người nhập `translate="no"`; số đếm `tabular-nums`.
- Lời ghim lỗi của phép đo dùng đúng chuỗi trong `evals.yaml` (tiền tố `kv: …`).
- Migration: tên thư mục mang giờ UTC thật lúc tạo, sau `20261013015131`; kiểm `origin/onehub` trước khi đẩy.
- Hỏi-1…5 đã duyệt theo lối máy khuyên: thứ tự riêng từng người; cột Xong 7 ngày; checklist ngoài; ngưỡng đọc `tiLeBangKeo`; việc con chép gắn và người của cha.

## Review Focus

1. Kéo một thẻ trong lúc thẻ khác đang chờ máy chủ — thẻ đang chờ phải khoá tay kéo (`pendingIds`), không gửi hai lệnh chồng.
2. Danh sách `thuTu` gửi lên chứa mã việc người kéo không thấy (bị gỡ khỏi việc riêng giữa chừng) — máy chủ bỏ qua mã đó, không ghi khoá, không lỗi.
3. Việc con khi cha bị gỡ hết gắn sau lúc tạo — con giữ gắn của nó (không đồng bộ ngược), vẫn mở được.
4. Đổi nhóm (`?nhomViec=`) trong lúc đang kéo hay đang chờ — bảng tải theo nhóm mới, không áp thẻ chờ của nhóm cũ.
5. Tiêu đề rất dài trên thẻ ở 375 — xuống dòng, không đẩy trang cuộn ngang.

Mỗi dòng có bài kiểm ở việc sở hữu: (1) Task 5 ca `kv-man-keo` «chờ khoá tay kéo»; (2) Task 2 ca `kv-thu-tu` «mã lạ trong thuTu»; (3) Task 3 ca `kv-con-tao` «gỡ gắn cha sau khi tạo»; (4) Task 5 ca `kv-man-bang` «đổi nhóm giữ kiểu xem»; (5) Task 8 `man.mjs` ảnh 375 với tiêu đề dài trong dữ liệu mẫu.

---

### Task 1: Cột dữ liệu, migration, hằng và khoá chèn giữa

**Phục vụ:** E5 (khoá chèn giữa), nền cho E1–E10. **independent: false** (mọi task sau dựa vào).

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (model `Viec`: thêm `chaId`, `cha`, `con`, `thuTu`; model mới `ViecThuTu`; `User` thêm quan hệ ngược)
- Create: `packages/db/prisma/migrations/<UTC>_kanban_viec/migration.sql`
- Modify: `packages/db/src/viec.ts` (thêm giá trị vào `NGUON_VIEC`, `LOAI_VET_VIEC`, một nhánh `vetViec`, khối `VIEC.bang`, `VIEC.con`, ba thông điệp)
- Create: `packages/db/src/viec-thu-tu.ts`
- Modify: `packages/db/package.json` (export `./viec-thu-tu`)
- Test: `packages/db/test/viec-thu-tu.spec.ts`

**Interfaces:**
- Produces: `khoaGiua(truoc: string | null, sau: string | null): string`; `khoaLienTiep(n: number): string[]`; Prisma `viec.chaId`, `viecThuTu { userId, viecId, khoa }`; `NguonViec` gồm `"bang-keo" | "bang-menu"`; vết `{ loai: "them-viec-con", truoc: null, sau: { conId: string; tieuDe: string } }`; `VIEC.bang.xongGanDayNgay`, `VIEC.thongDiep.conKhongCoCon`, `VIEC.thongDiep.chiThemConKhiMo`, `VIEC.lam.themCon`.

- [ ] **Step 1: Viết bài kiểm khoá chèn giữa (đỏ)**

```ts
import { describe, expect, test } from "bun:test";
import { khoaGiua, khoaLienTiep } from "../src/viec-thu-tu";

describe("kv-khoa", () => {
	test("kv-khoa: chèn giữa hai khoá cho khoá nằm giữa", () => {
		const a = khoaGiua(null, null);
		const b = khoaGiua(a, null);
		const g = khoaGiua(a, b);
		if (!(a < g && g < b)) throw new Error(`kv: khoa chen giua sai ${a} ${g} ${b}`);
	});
	test("kv-khoa: hai lần chèn vào cùng một khe cho hai khoá khác nhau, đúng thứ tự chèn", () => {
		const a = khoaGiua(null, null);
		const b = khoaGiua(a, null);
		const x = khoaGiua(a, b);
		const y = khoaGiua(a, x);
		if (x === y) throw new Error("kv: khoa chen giua trung");
		const sap = [b, x, a, y].sort();
		expect(sap).toEqual([a, y, x, b]);
	});
	test("kv-khoa: chèn 200 lần vào đầu vẫn tăng chặt", () => {
		let dau = khoaGiua(null, null);
		const ds = [dau];
		for (let i = 0; i < 200; i++) {
			dau = khoaGiua(null, dau);
			ds.unshift(dau);
		}
		for (let i = 1; i < ds.length; i++) {
			const t = ds[i - 1] ?? "";
			const s = ds[i] ?? "";
			if (!(t < s)) throw new Error(`kv: khoa chen giua trung ${i}`);
		}
	});
	test("kv-khoa: khoaLienTiep(n) tăng chặt, đủ n", () => {
		const ds = khoaLienTiep(30);
		expect(ds.length).toBe(30);
		for (let i = 1; i < ds.length; i++) expect((ds[i - 1] ?? "") < (ds[i] ?? "")).toBe(true);
	});
	test("kv-khoa: khoá sai thứ tự bị từ chối", () => {
		expect(() => khoaGiua("b", "a")).toThrow("kv: khoa nguoc");
	});
});
```

- [ ] **Step 2: Chạy, thấy đỏ** — `cd packages/db && bun test test/viec-thu-tu.spec.ts` → FAIL «Cannot find module "../src/viec-thu-tu"».

- [ ] **Step 3: Viết `packages/db/src/viec-thu-tu.ts`**

Bảng chữ số base-62 theo thứ tự byte (`0-9A-Za-z`) để so chuỗi JS khớp so số; khoá là phần thập phân, không bao giờ kết thúc bằng chữ số nhỏ nhất.

```ts
const SO = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const NHO = SO[0] ?? "0";

function giuaChuoi(a: string, b: string | null): string {
	let i = 0;
	let dau = "";
	for (;;) {
		const ca = SO.indexOf(a[i] ?? NHO);
		const cb = b === null ? SO.length : SO.indexOf(b[i] ?? NHO);
		if (ca === cb) {
			dau += SO[ca];
			i++;
			continue;
		}
		const giua = Math.floor((ca + cb) / 2);
		if (giua > ca) return dau + SO[giua];
		dau += SO[ca];
		return dau + giuaChuoi(a.slice(i + 1), null);
	}
}

export function khoaGiua(truoc: string | null, sau: string | null): string {
	if (truoc !== null && sau !== null && !(truoc < sau)) {
		throw new Error(`kv: khoa nguoc ${truoc} ${sau}`);
	}
	return giuaChuoi(truoc ?? "", sau);
}

export function khoaLienTiep(n: number): string[] {
	const ds: string[] = [];
	let truoc: string | null = null;
	for (let i = 0; i < n; i++) {
		const k = khoaGiua(truoc, null);
		ds.push(k);
		truoc = k;
	}
	return ds;
}
```

- [ ] **Step 4: Chạy lại, xanh** — cùng lệnh → 5 pass. Nếu ca 200 lần đỏ vì khoá chạm `NHO` cuối, sửa `giuaChuoi` cho nhánh `cb === ca + 1` đi tiếp xuống chữ số sau (không trả khoá kết thúc bằng `0`), chạy lại.

- [ ] **Step 5: Schema**

Trong `model Viec` thêm (giữ nguyên các dòng cũ):

```prisma
  chaId           String?
  cha             Viec?         @relation("ViecCon", fields: [chaId], references: [id], onDelete: NoAction)
  con             Viec[]        @relation("ViecCon")
  thuTu           ViecThuTu[]

  @@index([chaId])
```

Model mới:

```prisma
model ViecThuTu {
  id     String   @id @default(cuid())
  userId String
  user   User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  viecId String
  viec   Viec     @relation(fields: [viecId], references: [id], onDelete: Cascade)
  khoa   String
  doiLuc DateTime @updatedAt

  @@unique([userId, viecId])
  @@index([userId])
  @@map("viecThuTu")
}
```

`model User` thêm `viecThuTu ViecThuTu[]`. `onDelete: NoAction` (không `Restrict`) để `deleteMany` dọn test xoá cha và con trong cùng một câu lệnh — Postgres kiểm NO ACTION cuối câu lệnh.

- [ ] **Step 6: Migration** — tạo thư mục `packages/db/prisma/migrations/$(date -u +%Y%m%d%H%M%S)_kanban_viec/migration.sql`:

```sql
-- AlterTable
ALTER TABLE "viec" ADD COLUMN "chaId" TEXT;

-- CreateTable
CREATE TABLE "viecThuTu" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "viecId" TEXT NOT NULL,
    "khoa" TEXT NOT NULL,
    "doiLuc" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "viecThuTu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "viec_chaId_idx" ON "viec"("chaId");

-- CreateIndex
CREATE INDEX "viecThuTu_userId_idx" ON "viecThuTu"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "viecThuTu_userId_viecId_key" ON "viecThuTu"("userId", "viecId");

-- AddForeignKey
ALTER TABLE "viec" ADD CONSTRAINT "viec_chaId_fkey" FOREIGN KEY ("chaId") REFERENCES "viec"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viecThuTu" ADD CONSTRAINT "viecThuTu_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viecThuTu" ADD CONSTRAINT "viecThuTu_viecId_fkey" FOREIGN KEY ("viecId") REFERENCES "viec"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

Tên bảng người dùng: đọc `@@map` của `model User` trong schema và dùng đúng tên đó trong `REFERENCES`. Kiểm: `cd packages/db && bun run db:generate` rồi `bunx prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --exit-code` (theo `docs/setup.md` mục migrate diff) → mã 0.

- [ ] **Step 7: Hằng và vết ở `packages/db/src/viec.ts`** (chỉ thêm)

```ts
export const NGUON_VIEC = ["web", "zalo", "api", "chuyen-viec", "bang-keo", "bang-menu"] as const;
```
`LOAI_VET_VIEC` thêm `"them-viec-con"` vào cuối. Nhánh mới cuối `vetViec`:
```ts
	z.object({
		loai: z.literal("them-viec-con"),
		truoc: z.null(),
		sau: z.object({ conId: z.string(), tieuDe: z.string() }),
	}),
```
Trong `VIEC`: `bang: { xongGanDayNgay: 7 }`; trong `VIEC.lam`: `themCon: "thêm việc con"`; trong `VIEC.thongDiep`: `conKhongCoCon: "Việc con không có việc con."`, `chiThemConKhiMo: "Chỉ thêm việc con cho việc đang mở."`. Lời 403 dùng `chiGiaoVaThucHien(VIEC.lam.themCon)` → «Chỉ người giao và người thực hiện được thêm việc con.».

Thêm hàm thuần:
```ts
export function chuyenDuocCua(
	v: { trangThai: TrangThaiViec; nguoiGiaoId: string; nguoiThucHienId: string; theoDoi: { userId: string }[] },
	userId: string,
): TrangThaiViec[] {
	return dichDuoc(v.trangThai, vaiCua(v, userId));
}
```

- [ ] **Step 8: Export** — `packages/db/package.json` exports thêm `"./viec-thu-tu": "./src/viec-thu-tu.ts"`; `packages/validation/src/viec.ts` không đổi (nó re-export `NGUON_VIEC`, giá trị mới tự đi theo).

- [ ] **Step 9: Kiểm** — `cd packages/db && bun test test/viec-thu-tu.spec.ts test/viec.spec.ts && cd ../.. && bunx tsc --noEmit -p packages/db` → xanh; `bun test test/viec.spec.ts` của DA1 còn xanh chứng nhánh vết cũ không đổi.

- [ ] **Step 10: Commit** — `git add packages/db && git commit -m "feat(kanban-viec): cột việc cha, bảng thứ tự riêng, khoá chèn giữa"`

---

### Task 2: Lệnh kéo và bảng ở máy chủ

**Phục vụ:** E1, E2, E3, E5, E6 (+ chiều đỏ E15 a–e). **independent: false** (dựa Task 1).

**Files:**
- Modify: `packages/db/src/viec-ghi.ts` (THÊM `KeoViecInput`, `keoViec`)
- Create: `apps/api/src/viec/viec-bang.service.ts`
- Modify: `apps/api/src/viec/viec.contracts.ts` (THÊM `viecBangInput`, `theBang`, `viecBangOutput`, `viecKeoInput`)
- Modify: `apps/api/src/viec/viec.router.ts` (THÊM thủ tục `bang`, `keo`)
- Modify: `apps/api/src/viec/viec.module.ts` (provider `ViecBangService`)
- Modify: `apps/api/src/generated/server.ts` (sinh lại bằng `cd apps/api && bun run trpc:generate`)
- Test: `apps/api/test/viec-bang.spec.ts`

**Interfaces:**
- Consumes: `doiTrangThai`, `docViecGhi` (riêng tư — `keoViec` tự khoá hàng bằng `doiTrangThai` khi đổi; khi chỉ sắp thì đọc `viec.findFirst` với `dieuKienXemViec`), `khoaGiua`, `khoaLienTiep`, `chuyenDuocCua`.
- Produces:
  - `keoViec(tx: DbGhi, input: KeoViecInput): Promise<void>` với `KeoViecInput = DauGhi & { den: TrangThaiViec; thuTu: string[] }` (`nguon` phải là `"bang-keo" | "bang-menu"`).
  - tRPC `viec.bang({ nhom })` → `{ cot: { trangThai: "CHUA_LAM"|"DANG_LAM"|"CHO_DANH_GIA"|"XONG"; tong: number; viec: TheBang[] }[]; soHuy: number; daHuy: ViecDong[] }`, `TheBang = ViecDong & { chuyenDuoc: TrangThaiViec[]; con: { xong: number; tong: number } | null; cha: { id: string; tieuDe: string } | null; conMo: number }`.
  - tRPC `viec.keo({ id, den, thuTu, nguon })` → `{ ok: true }`.

- [ ] **Step 1: Bài kiểm đỏ `apps/api/test/viec-bang.spec.ts`** — dựng theo khuôn `viec-ghi.spec.ts` (`batApp`, `goi`, `nguoi`, `thoaThuan`, `taoThu`, `doiThu`, `donViec`, `donDep`), năm `describe` đúng tên lệnh của config: `kv-bang`, `kv-keo`, `kv-ma-tran`, `kv-thu-tu`, `kv-tranh-chap`. Nội dung từng ca chép nguyên điều kiện và lời ghim từ `expected` của E1, E2, E3, E5, E6 trong `evals.yaml`. Ma trận E3 viết sẵn:

```ts
const NGUOI = ["giao", "thucHien", "theoDoi", "khac", "quanTri"] as const;
const TT = ["CHUA_LAM", "DANG_LAM", "CHO_DANH_GIA", "XONG", "HUY"] as const;
const DUOC: Record<(typeof TT)[number], Partial<Record<(typeof TT)[number], "G" | "GT">>> = {
	CHUA_LAM: { DANG_LAM: "GT", CHO_DANH_GIA: "GT", XONG: "GT", HUY: "G" },
	DANG_LAM: { CHUA_LAM: "GT", CHO_DANH_GIA: "GT", XONG: "GT", HUY: "G" },
	CHO_DANH_GIA: { DANG_LAM: "G", XONG: "G", HUY: "G" },
	XONG: { DANG_LAM: "G" },
	HUY: { CHUA_LAM: "G" },
};
const O = NGUOI.flatMap((n) => TT.flatMap((tu) => TT.filter((den) => den !== tu).map((den) => ({ n, tu, den }))));
```
Bảng `DUOC` là đáp án chép tay từ `docs/api.md`, không nhập `DO_THI`. Ca mã lạ (Review Focus 2): `thuTu` chứa một mã việc riêng của người khác → lệnh thành công, không có hàng `viecThuTu` cho mã đó.

- [ ] **Step 2: Chạy, thấy đỏ** — `bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/viec-bang.spec.ts"` → FAIL «No procedure found on path "viec.bang"».

- [ ] **Step 3: `keoViec` ở `viec-ghi.ts`** (thêm cuối tệp)

```ts
export type KeoViecInput = DauGhi & { den: TrangThaiViec; thuTu: string[] };

export async function keoViec(tx: DbGhi, input: KeoViecInput): Promise<void> {
	const hienTai = await tx.viec.findFirst({
		where: { AND: [{ id: input.viecId }, dieuKienXemViec(input.nguoiId)] },
		select: { trangThai: true },
	});
	if (hienTai === null) {
		throw new LoiViec("khong-thay", VIEC.thongDiep.khongCoViec(input.viecId));
	}
	if (hienTai.trangThai !== input.den) {
		await doiTrangThai(tx, input);
	}
	const thay = await tx.viec.findMany({
		where: { AND: [{ id: { in: input.thuTu } }, dieuKienXemViec(input.nguoiId)] },
		select: { id: true },
	});
	const duocThay = new Set(thay.map((v) => v.id));
	const ds = input.thuTu.filter((id) => duocThay.has(id));
	const viTri = ds.indexOf(input.viecId);
	if (viTri === -1) return;
	const cu = await tx.viecThuTu.findMany({
		where: { userId: input.nguoiId, viecId: { in: ds } },
		select: { viecId: true, khoa: true },
	});
	const khoaCu = new Map(cu.map((k) => [k.viecId, k.khoa]));
	const ben = ds.filter((id) => id !== input.viecId);
	const tangDan = ben.every((id, i) => {
		const k = khoaCu.get(id);
		const truoc = i === 0 ? null : khoaCu.get(ben[i - 1] ?? "");
		return k !== undefined && (truoc === null || (truoc !== undefined && truoc < k));
	});
	const khoaMoi = new Map<string, string>();
	if (!tangDan) {
		const moi = khoaLienTiep(ds.length);
		ds.forEach((id, i) => khoaMoi.set(id, moi[i] ?? ""));
	} else {
		const truoc = viTri === 0 ? null : (khoaCu.get(ds[viTri - 1] ?? "") ?? null);
		const sau = viTri === ds.length - 1 ? null : (khoaCu.get(ds[viTri + 1] ?? "") ?? null);
		khoaMoi.set(input.viecId, khoaGiua(truoc, sau));
	}
	for (const [viecId, khoa] of khoaMoi) {
		await tx.viecThuTu.upsert({
			where: { userId_viecId: { userId: input.nguoiId, viecId } },
			create: { userId: input.nguoiId, viecId, khoa },
			update: { khoa },
		});
	}
}
```

`doiTrangThai` ném `LoiViec` khi bị từ chối, nên giao dịch huỷ trước khi ghi khoá nào (AC-3 «ô bị từ chối không ghi khoá»). Không có `ghiVet` nào cho phần sắp xếp.

- [ ] **Step 4: Hợp đồng** — `viec.contracts.ts` thêm:

```ts
export const viecBangInput = viecCuaToiInput;
const COT_BANG = ["CHUA_LAM", "DANG_LAM", "CHO_DANH_GIA", "XONG"] as const;
export const theBang = viecDong.extend({
	chuyenDuoc: z.array(z.enum(TRANG_THAI_VIEC)),
	con: z.object({ xong: z.number().int(), tong: z.number().int() }).nullable(),
	cha: z.object({ id: z.string(), tieuDe: z.string() }).nullable(),
	conMo: z.number().int(),
});
export const viecBangOutput = z.object({
	cot: z.array(z.object({ trangThai: z.enum(COT_BANG), tong: z.number().int(), viec: z.array(theBang) })),
	soHuy: z.number().int(),
	daHuy: z.array(viecDong),
});
export const viecKeoInput = z.object({
	id: ma,
	den: z.enum(TRANG_THAI_VIEC),
	thuTu: z.array(ma).max(VIEC.tranKhep * 4),
	nguon: z.enum(["bang-keo", "bang-menu"]),
});
export const viecOkOutput = z.object({ ok: z.literal(true) });
```
và các `type … = z.infer<…>` theo nếp cuối tệp.

- [ ] **Step 5: `ViecBangService`** (`apps/api/src/viec/viec-bang.service.ts`) — `bang(input, userId)`:
  1. `where` chung = `AND [dieuKienNhom(nhom, userId), dieuKienXemViec(userId)]`.
  2. Đọc việc mở (`TRANG_THAI_MO`) và việc Xong có `khepLuc >= now - VIEC.bang.xongGanDayNgay ngày`, `select: { ...CHON_VIEC, chaId: true, cha: { select: { id: true, tieuDe: true } }, con: { select: { trangThai: true } }, thuTu: { where: { userId }, select: { khoa: true } } }`.
  3. Đếm `tong` cột Xong bằng `count` toàn bộ Xong của nhóm (cho dòng «Xem n việc xong cũ hơn»); `tong` cột mở = số việc đọc được; `soHuy` = `count` Huỷ; `daHuy` = tối đa `VIEC.tranKhep` việc Huỷ theo `khepLuc desc` (cho dòng gập).
  4. Mỗi thẻ: `viecRa(h, now)` (nhập từ `viec.service.ts`) + `chuyenDuoc: chuyenDuocCua(h, userId)` + `con: h.con.length === 0 ? null : { xong: số XONG, tong: số khác HUY }` + `cha: h.cha` + `conMo: số con TRANG_THAI_MO`.
  5. Trong cột: thẻ chưa có khoá trước, theo `theoHan`; rồi thẻ có khoá theo `khoa` tăng dần.

  `keo(input, userId)`: `this.ghi((tx) => keoViec(tx, { viecId: input.id, nguoiId: userId, den: input.den, thuTu: input.thuTu, nguon: input.nguon, now: new Date() }))` với `ghi` = `db.$transaction` + `dichLoi` y như `ViecService` (chép hàm `ghi`, `dichLoi` là `export` từ `viec.service.ts` — đổi `function dichLoi` thành `export function dichLoi` là thêm từ khoá, không đổi thân).

- [ ] **Step 6: Router + module** — thêm vào `ViecRouter` (constructor nhận thêm `@Inject(ViecBangService) private readonly bangSv: ViecBangService`):

```ts
	@Query({ input: viecBangInput, output: viecBangOutput, meta: restMeta("GET", "/viec/bang", TAG) })
	bang(@Ctx() ctx: AuthedTrpcContext, @Input() input: z.infer<typeof viecBangInput>) {
		return this.bangSv.bang(input, ctx.user.id);
	}

	@Mutation({ input: viecKeoInput, output: viecOkOutput, meta: restMeta("POST", "/viec/{id}/keo", TAG) })
	keo(@Ctx() ctx: AuthedTrpcContext, @Input() input: z.infer<typeof viecKeoInput>) {
		return this.bangSv.keo(input, ctx.user.id);
	}
```
`viec.module.ts` providers thêm `ViecBangService`. Sinh lại `apps/api/src/generated/server.ts`: `cd apps/api && bun run trpc:generate`.

- [ ] **Step 7: Chạy xanh** — lệnh Step 2 → 5 describe xanh; `kv_ma_tran` in đủ 100 ô.

- [ ] **Step 8: Không phá DA1** — `bun run test -- "cd apps/api && bun test test/viec-ghi.spec.ts test/viec-quyen.spec.ts test/viec-cua-toi.spec.ts"` → xanh.

- [ ] **Step 9: Commit** — `git add packages/db/src/viec-ghi.ts apps/api/src/viec apps/api/src/generated/server.ts apps/api/test/viec-bang.spec.ts && git commit -m "feat(kanban-viec): viec.bang và viec.keo — kéo đi đúng đồ thị trạng thái, thứ tự riêng không ghi vết"`

---

### Task 3: Việc con ở máy chủ

**Phục vụ:** E7, E8, E9 (+ chiều đỏ E15 f–i). **independent: false** (dựa Task 1, 2).

**Files:**
- Modify: `packages/db/src/viec-ghi.ts` (THÊM `TaoViecConInput`, `taoViecCon`)
- Modify: `apps/api/src/viec/viec-bang.service.ts` (`taoCon`, `con`)
- Modify: `apps/api/src/viec/viec.contracts.ts` (THÊM `viecTaoConInput`, `viecConOutput`)
- Modify: `apps/api/src/viec/viec.router.ts` (THÊM `taoCon`, `con`), `apps/api/src/generated/server.ts`
- Test: `apps/api/test/viec-con.spec.ts`

**Interfaces:**
- Consumes: `taoViec`, `canGiaoHayLam` (riêng tư → `taoViecCon` tự kiểm vai bằng `vaiCua`), `kiemNguoiNhanViec`, `banGhiCua`, `ghiVet` (riêng tư, cùng tệp — dùng được).
- Produces: `taoViecCon(tx, input: { chaId: string; nguoiId: string; tieuDe: string; nguoiThucHienId?: string; hanNgay?: Date | null; now: Date }): Promise<{ id: string }>`; tRPC `viec.taoCon({ chaId, tieuDe, nguoiThucHienId?, hanNgay? })` → `{ id }`; tRPC `viec.con({ id })` → `{ cha: { id; tieuDe } | null; con: { id; tieuDe; trangThai; nguoiThucHien: { id; name; image } }[]; conMo: number; themDuoc: boolean }`.

- [ ] **Step 1: Bài kiểm đỏ `apps/api/test/viec-con.spec.ts`** — ba `describe`: `kv-con-tao` (E7 nguyên văn, thêm ca Review Focus 3: gỡ gắn D khỏi P sau khi tạo K → K vẫn gắn D và kv-c vẫn mở được K), `kv-con-quyen` (bảng sáu ca viết sẵn của E8 + ca việc riêng), `kv-dong-cha` (E9).

- [ ] **Step 2: Chạy, đỏ** — `bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/viec-con.spec.ts"` → FAIL «No procedure found on path "viec.taoCon"».

- [ ] **Step 3: `taoViecCon`** (thêm cuối `viec-ghi.ts`)

```ts
export type TaoViecConInput = {
	chaId: string;
	nguoiId: string;
	tieuDe: string;
	nguoiThucHienId?: string;
	hanNgay?: Date | null;
	now: Date;
};

export async function taoViecCon(tx: DbGhi, input: TaoViecConInput): Promise<{ id: string }> {
	await tx.$queryRaw`SELECT id FROM viec WHERE id = ${input.chaId} FOR UPDATE`;
	const cha = await tx.viec.findFirst({
		where: { AND: [{ id: input.chaId }, dieuKienXemViec(input.nguoiId)] },
		select: {
			id: true,
			chaId: true,
			trangThai: true,
			nguoiGiaoId: true,
			nguoiThucHienId: true,
			theoDoi: { select: { userId: true } },
			gan: { select: CHON_GAN },
		},
	});
	if (cha === null) throw new LoiViec("khong-thay", VIEC.thongDiep.khongCoViec(input.chaId));
	const vai = vaiCua(cha, input.nguoiId);
	if (!vai.giao && !vai.thucHien) {
		throw new LoiViec("khong-quyen", VIEC.thongDiep.chiGiaoVaThucHien(VIEC.lam.themCon));
	}
	if (cha.chaId !== null) throw new LoiViec("khong-hop-le", VIEC.thongDiep.conKhongCoCon);
	if (!TRANG_THAI_MO.includes(cha.trangThai)) {
		throw new LoiViec("khong-hop-le", VIEC.thongDiep.chiThemConKhiMo);
	}
	const nguoiThucHienId = input.nguoiThucHienId ?? input.nguoiId;
	const theoDoi = [cha.nguoiGiaoId, cha.nguoiThucHienId].filter(
		(id) => id !== input.nguoiId && id !== nguoiThucHienId,
	);
	const con = await taoViec(tx, {
		nguoiId: input.nguoiId,
		tieuDe: input.tieuDe,
		hanNgay: input.hanNgay ?? null,
		nguoiThucHienId,
		nguoiTheoDoiIds: [...new Set(theoDoi)],
		gan: cha.gan.map((g) => {
			const b = banGhiCua(g);
			return { loai: b.loai, id: b.id };
		}),
		nguon: "web",
		now: input.now,
	});
	await tx.viec.update({ where: { id: con.id }, data: { chaId: cha.id } });
	await ghiVet(
		tx,
		{ viecId: cha.id, nguoiId: input.nguoiId, nguon: "web", luc: input.now },
		{ loai: "them-viec-con", truoc: null, sau: { conId: con.id, tieuDe: input.tieuDe } },
	);
	return con;
}
```
`TRANG_THAI_MO`, `CHON_GAN` thêm vào khối import từ `./viec` (thêm tên vào import, không đổi hàm). `taoViec` gọi `kiemNguoiNhanViec` cho người thực hiện — người vai `okr` ra 400 có tên và chữ «chỉ OKR» trước khi có hàng nào (giao dịch huỷ).

Kiểm «một tầng» phía con: việc đã có con không thành con — không có đường nào đổi `chaId` của việc cũ ở lượt này (không có «đổi cha»), nên chỉ cần chặn cha là con.

- [ ] **Step 4: Hợp đồng + service + router** —

```ts
export const viecTaoConInput = z.object({
	chaId: ma,
	tieuDe: z.string().trim().min(1).max(VIEC.tieuDeToiDa),
	nguoiThucHienId: ma.optional(),
	hanNgay: ngayLich.nullable().optional(),
});
export const viecConOutput = z.object({
	cha: z.object({ id: z.string(), tieuDe: z.string() }).nullable(),
	con: z.array(z.object({ id: z.string(), tieuDe: z.string(), trangThai: z.enum(TRANG_THAI_VIEC), nguoiThucHien: nguoiRa })),
	conMo: z.number().int(),
	themDuoc: z.boolean(),
});
```
`hanNgay` đổi sang `Date` đúng cách `ViecService.create` đang đổi (đọc thân `create` và chép đúng biến đổi đó). `con({ id }, userId)`: đọc việc với `dieuKienXemViec` (404 `khongCoViec` nếu không thấy), `cha`, các con mà người xem thấy (`dieuKienXemViec` áp lên con), `conMo`, `themDuoc = (vai.giao || vai.thucHien) && chaId === null && TRANG_THAI_MO.includes(trangThai)`. Router: `@Mutation taoCon` (`POST /viec/{chaId}/con`, output `viecTaoOutput`) và `@Query con` (`GET /viec/{id}/con`, output `viecConOutput`). Sinh lại `server.ts`.

- [ ] **Step 5: Chạy xanh** — lệnh Step 2 → ba describe xanh; lệnh Task 2 Step 8 vẫn xanh.

- [ ] **Step 6: Commit** — `git commit -m "feat(kanban-viec): việc con một tầng mang gắn và người của việc cha"`

---

### Task 4: `Board` biết cột không nhận và sắp trong cột

**Phục vụ:** E4 (+ nền cho E4b, chiều đỏ E15 m). **independent: true** (chỉ chạm `packages/ui`).

**Files:**
- Modify: `packages/ui/src/components/board.tsx`
- Modify: `packages/ui/src/lib/messages.ts` (vi/en: `board.khongNhan(cot)`)
- Test: `packages/ui/test/board.dom.tsx`

**Interfaces:**
- Produces: `BoardProps` thêm `canDrop?: (cardId: string, columnId: string) => boolean` và `reorder?: boolean`; `BoardMove` thêm `order?: string[]` (thứ tự mã thẻ của cột đích sau khi thả; có khi `reorder` bật).

- [ ] **Step 1: Bài kiểm đỏ `packages/ui/test/board.dom.tsx`** theo khuôn `board-giu-nguyen.dom.tsx` (`createRoot`, `act`, `LocaleProvider`), kéo bằng bàn phím trên tay kéo (`KanbanItemHandle`): focus tay kéo, `keydown` Space, ArrowRight, Space (dnd-kit KeyboardSensor). Ba `describe`: `board-can-drop`, `board-reorder`, `board-cu` — điều kiện và lời ghim đúng E4.

- [ ] **Step 2: Chạy, đỏ** — `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/board.dom.tsx` → FAIL (`data-khong-nhan` không có).

- [ ] **Step 3: Cài đặt** — trong nhánh `onMove` của `Board`:
  - giữ `const [dangKeo, setDangKeo] = useState<string | null>(null)`; đặt khi `Kanban` báo bắt đầu kéo (`onDragStart` của `reui/kanban.tsx` — đọc props của `KanbanRootProps` và dùng đúng tên sự kiện có sẵn), xoá khi kết thúc hay huỷ;
  - mỗi `KanbanColumn` `li` mang `data-khong-nhan={dangKeo && canDrop && !canDrop(dangKeo, column.id) ? "true" : undefined}`; kiểu mờ đặt ở `COLUMN_CLASS` bằng biến thể dữ liệu `data-[khong-nhan=true]:opacity-50` (biến thể sống trong `packages/ui`, không ở chỗ gọi);
  - `handleMove`: nếu `canDrop` có và trả false → không gọi `onMove`; nếu `activeContainer === overContainer` → chỉ gọi `onMove` khi `reorder` bật, kèm `order` = mã thẻ cột đó sau khi chuyển `activeIndex → overIndex`; khác cột → `onMove` kèm `order` = mã thẻ cột đích với thẻ chèn ở `overIndex` khi `reorder` bật;
  - lời đọc màn hình khi thả vào cột không nhận: `msg.board.khongNhan(column.label)` qua `announcements` mặc định.

- [ ] **Step 4: Chạy xanh** — lệnh Step 2 → 3 describe xanh; `bun test --preload ./test/setup-dom.ts ./test/board-giu-nguyen.dom.tsx` vẫn xanh.

- [ ] **Step 5: Ba bảng đang dùng `Board` không đổi** — `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts $(grep -l "Board" test/*.dom.tsx)` → xanh.

- [ ] **Step 6: Commit** — `git commit -m "feat(ui): Board nhận canDrop và reorder, không bật mặc định"`

---

### Task 5: Kiểu xem Bảng ở Việc của tôi

**Phục vụ:** E1b, E4b, E6b (+ chiều đỏ E15 m). **independent: false** (dựa Task 2, 4).

**Files:**
- Modify: `apps/app/app/(app)/[slug]/viec/viec-cua-toi.tsx` (thêm `ViewSwitch`, rẽ sang `BangCotViec`)
- Create: `apps/app/components/viec/bang-cot-viec.tsx`, `apps/app/components/viec/the-viec-bang.tsx`, `apps/app/components/viec/hoi-dong-cha.tsx`
- Modify: `apps/app/lib/search-param-keys.ts` (`SEARCH_PARAM.viec.xem = "xemViec"`), `apps/app/lib/messages/viec.ts` (khối `bang`, `con`, en + vi)
- Test: `apps/app/test/viec-bang.dom.tsx`

**Interfaces:**
- Consumes: `trpc.viec.bang`, `trpc.viec.keo`, `Board` (`canDrop`, `reorder`, `pendingIds`, `renderCard`), `ViewSwitch`, `ConfirmDialog`, `DropdownMenu`, `useOpenRecord({ kind: "viec", id })`, `useCrmCache().viec()`.
- Produces: `BangCotViec({ nhom }: { nhom: NhomViec })`; `TheViecBang({ the, chiXem, onChuyen })`; `HoiDongCha({ the, den, open, onOpenChange, onDongY })` (dùng lại ở Task 6).

- [ ] **Step 1: Bài kiểm đỏ** — `apps/app/test/viec-bang.dom.tsx` theo khuôn mock tRPC của `viec-cua-toi.dom.tsx`; ba `describe`: `kv-man-bang` (E1b + Review Focus 4: đổi `nhomViec` giữ `xemViec=bang`), `kv-man-keo` (E4b + Review Focus 1: trong lúc `viec.keo` treo, tay kéo của thẻ đó `disabled`), `kv-man-tra-ve` (E6b).

- [ ] **Step 2: Chạy, đỏ** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/viec-bang.dom.tsx` → FAIL.

- [ ] **Step 3: Cài đặt**
  - `viec-cua-toi.tsx`: `const [xem, setXem] = useQueryState(SEARCH_PARAM.viec.xem, parseAsStringLiteral(["danh-sach", "bang"]).withDefault("danh-sach"))`; hàng chip thành `flex flex-wrap items-center justify-between gap-3` chứa chip nhóm và `ViewSwitch label={m.bang.kieuXem}`; `xem === "bang"` → `<BangCotViec nhom={nhom} />` thay khối danh sách (giữ chip, giữ màn chờ/lỗi của `BangCotViec`).
  - `bang-cot-viec.tsx`: `useQuery(trpc.viec.bang.queryOptions({ nhom }))`; chờ tải → khung xương bốn cột (`Skeleton`, `data-bang-cho-tai`); lỗi → `VungTaiLoi` (`m.bang.loiTieuDe`, `m.bang.loiMoTa`); rỗng (mọi `tong` = 0 và `soHuy` = 0) → `Board` bốn cột rỗng (chữ «Chưa có việc» qua `msg.board.empty` của `packages/ui` — nếu chữ đó là «Trống», thêm `emptyLabel?: string` vào `Board` ở Task 4 và truyền `m.bang.rongCot`). Cột: `{ id: trangThai, label: m.trangThai[trangThai], count: cot.viec.length, cards }`; dưới bảng: nút dẫn `m.bang.xongCu(tongXong - soXongHien)` (đổi `xemViec` về danh sách) khi > 0, và `DongGapViec ds={daHuy} nhan={dien(m.daHuy, { n: soHuy })}`.
  - Kéo: `canDrop={(id, cot) => cot === hienTai(id) || chuyenDuoc(id).includes(cot)}`; `reorder`; `onMove({ cardId, to, order })` → nếu thẻ là cha (`conMo > 0`) và `to === "XONG"` → mở `HoiDongCha`, chưa gọi máy chủ; ngược lại `keo.mutate({ id, den: to, thuTu: order ?? [], nguon: "bang-keo" })`. Lạc quan: giữ `Map` thẻ → cột chờ, `pendingIds` = các mã đang chờ; `onError` → bỏ chờ, `toast.error(e.message, { action: lỗi mạng ? { label: m.bang.thuLai, onClick: thử lại } : undefined })`, `cache.viec()`; `onSettled` → `invalidate viec.bang` và `viec.cuaToi`.
  - `the-viec-bang.tsx`: tiêu đề (`translate="no"`, `break-words`), dòng `m.bang.thuoc(cha.tieuDe)`, hạn (`HanViec`), người thực hiện khi nhóm khác `giao-cho-toi`, `Badge variant="secondary"` `m.bang.conXong(xong, tong)`, `DropdownMenu` «Chuyển sang…» liệt kê `chuyenDuoc` (trừ trạng thái hiện tại) với nhãn `nhanNut` của `khung-viec.tsx` (chuyển `nhanNut` sang `apps/app/components/viec/trang-thai-viec.tsx` và `export` — dời, không đổi thân); `chuyenDuoc` rỗng → nút khoá + dòng `m.bang.choDanhGiaKhoa` khi trạng thái là `CHO_DANH_GIA`; nhóm `dang-theo-doi` → `Board` không nhận `onMove` (thẻ là đường dẫn mở khung, không tay kéo, không menu). Chọn menu → cùng đường với kéo, `nguon: "bang-menu"`, `thuTu: []` (máy chủ không ghi khoá khi `thuTu` rỗng).
  - `hoi-dong-cha.tsx`: `ConfirmDialog` `tieuDe={m.con.hoiDongTieuDe}`, `than={dien(den === "HUY" ? m.con.hoiHuy : m.con.hoiXong, { n: conMo })}` («Việc này còn {n} việc con chưa xong. Vẫn đánh dấu xong?» / «… Vẫn huỷ?»).
  - Chữ (vi): `bang.kieuXem «Kiểu xem»`, `bang.danhSach «Danh sách»`, `bang.bang «Bảng»`, `bang.nhan «Bảng việc theo trạng thái»`, `bang.chuyenSang «Chuyển sang…»`, `bang.choDanhGiaKhoa «Chỉ người giao xử lý việc đang chờ đánh giá.»`, `bang.conXong «{xong}/{tong} việc con xong»`, `bang.thuoc «Thuộc: {cha}»`, `bang.xongCu «Xem {n} việc xong cũ hơn ở Danh sách»`, `bang.rongCot «Chưa có việc»`, `bang.loiTieuDe «Không tải được bảng việc»`, `bang.loiMoTa «Máy chủ không trả lời. Thử lại sau ít phút.»`, `bang.thuLai «Thử lại»`; en tương ứng.

- [ ] **Step 4: Chạy xanh** — lệnh Step 2 xanh; `viec-cua-toi.dom.tsx` của DA1 vẫn xanh (mặc định là danh sách).

- [ ] **Step 5: Commit** — `git commit -m "feat(kanban-viec): kiểu xem Bảng ở Việc của tôi — kéo, menu Chuyển sang, trả về khi bị từ chối"`

---

### Task 6: Việc con trong khung việc

**Phục vụ:** E7b, E9b. **independent: false** (dựa Task 3, 5).

**Files:**
- Create: `apps/app/components/viec/muc-viec-con.tsx`, `apps/app/components/viec/o-soan-viec-con.tsx`
- Modify: `apps/app/components/viec/khung-viec.tsx` (gắn `MucViecCon` vào thân chi tiết; nút Xong/Huỷ đi qua `HoiDongCha` khi `conMo > 0`)
- Test: `apps/app/test/viec-con.dom.tsx`

**Interfaces:**
- Consumes: `trpc.viec.con`, `trpc.viec.taoCon`, `trpc.onboarding.nguoiNhanViec` (ô chọn người như `OSoanViec`), `HoiDongCha`, `useOpenRecord`.
- Produces: `MucViecCon({ viecId })`; `OSoanViecCon({ chaId, onXong })`.

- [ ] **Step 1: Bài kiểm đỏ** — `viec-con.dom.tsx` theo khuôn mock của `viec-khung.dom.tsx`: `describe("kv-man-con")` (E7b) và `describe("kv-man-hoi-cha")` (E9b, đủ bốn đường: thả, menu, Xong trong khung, Huỷ trong khung, cùng đối chứng `conMo` 0).

- [ ] **Step 2: Chạy, đỏ** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/viec-con.dom.tsx` → FAIL.

- [ ] **Step 3: Cài đặt**
  - `MucViecCon`: `useQuery(trpc.viec.con.queryOptions({ id: viecId }))`; `cha` khác null → `DetailSheetProperty label={m.con.thuocViec}` với `Button variant="link"` mở khung cha, không mục con; ngược lại `SectionHeading level={4} actions={themDuoc ? <Button size="sm" variant="outline">{m.con.them}</Button> : null}` chữ `dien(m.con.muc, { xong, tong })`, `ItemGroup` các con (`Item` bấm mở khung con: tiêu đề `translate="no"`, `TrangThaiViecNhan`, người thực hiện), và `OSoanViecCon` khi đang thêm.
  - `OSoanViecCon`: `Field` + `FieldLabel htmlFor` tiêu đề (`Input name="tieuDeViecCon" autoComplete="off" placeholder={m.con.goiY}`), `Combobox` người thực hiện (mặc định «Tôi»), `DatePicker` hạn, `FieldDescription m.con.mangGan`, nút `variant="outline"` `m.con.them` / «Đang thêm…»; lỗi → `FieldError` dưới nút, giữ chữ; xong → `invalidate viec.con`, `viec.bang`, `viec.cuaToi`, đóng ô soạn.
  - `khung-viec.tsx`: thay `onClick={() => doi.mutate({ id: v.id, den })}` bằng `onClick={() => batDoi(den)}` với `batDoi` mở `HoiDongCha` khi `(den === "XONG" || den === "HUY") && (conQ.data?.conMo ?? 0) > 0`, ngược lại gọi `doi.mutate` như cũ; thêm `<MucViecCon viecId={v.id} />` cuối `DetailSheetBody` của thẻ chi tiết.
  - Chữ (vi): `con.muc «Việc con ({xong}/{tong})»`, `con.them «Thêm việc con»`, `con.themNut «Thêm»`, `con.dangThem «Đang thêm…»`, `con.tieuDe «Tiêu đề việc con»`, `con.goiY «Ví dụ: Gửi hợp đồng cho phòng pháp chế…»`, `con.mangGan «Việc con mang theo bản ghi gắn với việc cha.»`, `con.thuocViec «Thuộc việc»`, `con.hoiDongTieuDe «Việc cha còn việc con chưa xong»`, `con.hoiXong «Việc này còn {n} việc con chưa xong. Vẫn đánh dấu xong?»`, `con.hoiHuy «Việc này còn {n} việc con chưa xong. Vẫn huỷ?»`, `con.dongY «Vẫn làm»`, `con.thoi «Thôi»`; en tương ứng.

- [ ] **Step 4: Chạy xanh** — lệnh Step 2 xanh; `viec-khung.dom.tsx` của DA1 vẫn xanh (mock thêm `viec.con` trả `{ cha: null, con: [], conMo: 0, themDuoc: false }` nếu bài cũ cần — sửa fixture, không sửa thước).

- [ ] **Step 5: Commit** — `git commit -m "feat(kanban-viec): mục Việc con trong khung việc, hỏi lại khi đóng việc cha còn con mở"`

---

### Task 7: Dữ liệu mẫu và thước đo ngưỡng

**Phục vụ:** E10 (+ chiều đỏ E15 j, l). **independent: false** (dựa Task 2, 3).

**Files:**
- Modify: `packages/db/src/viec-gieo.ts` (`gieoViecMau` thêm một cha ba con và hai lần đổi qua `keoViec`)
- Create: `_acceptance/kanban-viec/rang/do-nguong.mjs`, `_acceptance/kanban-viec/rang/dap-an.json`
- Test: `apps/api/test/viec-bang-do-nguong.spec.ts`, `packages/db/test/viec-gieo.spec.ts` (thêm ca `kv-gieo`)

**Interfaces:**
- Consumes: `taoViecCon`, `keoViec`, `doiTrangThai`.
- Produces: `do-nguong.mjs --tu <ISO> --den <ISO>` in một dòng JSON `{ doiTrangThaiNguoi, quaBangKeo, quaBangMenu, tiLeBangKeo, tiLeBang, viecCoCon, nguoiTaoCon }` (tỉ lệ làm tròn 4 chữ số, mẫu 0 → 0).

- [ ] **Step 1: Bài kiểm đỏ** — `viec-bang-do-nguong.spec.ts` đúng E10: gọi `gieoViecMau` thật, `spawn` `bun _acceptance/kanban-viec/rang/do-nguong.mjs` với `DATABASE_URL` của lượt, so bảy khoá với `dap-an.json`, đếm hàng năm bảng trước/sau, đọc mã nguồn thước tìm `create|update|delete|\$executeRaw`, rồi hai ca đối chứng (một lần `bang-keo`, một lần `bang-menu`).

- [ ] **Step 2: Chạy, đỏ** — `bun run test -- "cd apps/api && bun test test/viec-bang-do-nguong.spec.ts"` → FAIL (thước chưa có).

- [ ] **Step 3: Cài đặt**
  - `gieoViecMau`: sau phần DA1, nếu chưa có việc cha mẫu (tìm theo tiêu đề cố định `"Triển khai đại lý mẫu tháng 11"`) → `taoViec` cha gắn thoả thuận mẫu đầu tiên, `taoViecCon` ba con (người thực hiện là ba thành viên mẫu khác nhau), `doiTrangThai` con 1 → XONG nguồn `api`, `keoViec` con 2 → DANG_LAM nguồn `bang-keo`, `keoViec` cha → DANG_LAM nguồn `bang-menu`. Hàm vẫn chạy được nhiều lần (tìm trước khi tạo).
  - `do-nguong.mjs`: nhập `db` từ `@crm/db` (theo khuôn `_acceptance/viec-chung/rang/do-nguong.mjs`), chỉ `findMany`/`count`/`groupBy`; `doiTrangThaiNguoi` = vết `doi-trang-thai` có `nguoiId` trong khoảng; `tiLeBangKeo = quaBangKeo / doiTrangThaiNguoi`; `tiLeBang = (quaBangKeo + quaBangMenu) / doiTrangThaiNguoi`; `viecCoCon` = số `viecId` khác nhau có vết `them-viec-con` trong khoảng; `nguoiTaoCon` = số `nguoiId` khác nhau trên các vết đó.
  - `dap-an.json`: đáp án tính tay trên dữ liệu mẫu (kể cả vết DA1 có sẵn trong `gieoViecMau`) — đếm bằng tay từ thân `gieoViecMau`, ghi kèm một dòng `"_cach_tinh"` liệt kê từng vết được đếm.

- [ ] **Step 4: Chạy xanh** — lệnh Step 2 xanh; `bun run test -- "cd packages/db && bun test test/viec-gieo.spec.ts"` xanh.

- [ ] **Step 5: Commit** — `git commit -m "feat(kanban-viec): dữ liệu mẫu cha–con và thước đo ngưỡng bảng"`

---

### Task 8: Răng đo màn, sạch thiết kế, đột biến

**Phục vụ:** E11, E11b, E15. **independent: false** (dựa mọi task trên).

**Files:**
- Create: `_acceptance/kanban-viec/rang/man.mjs`, `_acceptance/kanban-viec/rang/san-thiet-ke.mjs`, `_acceptance/kanban-viec/rang/dot-bien.mjs`

- [ ] **Step 1: `man.mjs`** — theo khuôn `_acceptance/viec-chung/rang/man.mjs` (chạy dưới `scripts/lan-do/tien-de.mjs --chay`, đặt dấu mốc cây, `bun run dev:session`, gieo qua `gieoViecMau`). Thêm một việc mẫu tiêu đề 160 ký tự (Review Focus 5). Chụp sáu ảnh của E11 vào `$BANG_CHUNG`, mỗi ảnh kèm `document.documentElement.outerHTML` ra `kv-*.html` cạnh ảnh; ở 375 đo `scrollWidth ≤ 375` và đi bước menu «Chuyển sang… › Bắt đầu» rồi đọc lại `viec.get`; dòng cuối `kanban-viec man: dat` (mã 0), `kv man: …` (mã 1), không đo được → mã 2.
- [ ] **Step 2: `san-thiet-ke.mjs`** — chạy `config:executors.design.gate` … `--mode static --require-html` trên từng `evidence/kv-*.html`; thiếu tệp → mã 2 `kv san: thieu html <ten>`; vi phạm P0 → mã 1 `kv san: <tep> <luat>`; in `kv san: N tep, M vi pham`.
- [ ] **Step 3: `dot-bien.mjs`** — theo khuôn `_acceptance/viec-chung/rang/dot-bien.mjs` (bản sao cây bằng `git stash create` + worktree riêng có `node_modules`, `GIT_INDEX_FILE` riêng — bài học «Răng chạy song song chết vì chỉ mục git dùng chung»), mười ba cặp (a)–(m) đúng E15, `SO_CAP_KHAI = 13`, trần 900 giây.
- [ ] **Step 4: Chạy một lượt từng răng** (máy rảnh, không phải làn S4): `node _acceptance/kanban-viec/rang/san-thiet-ke.mjs` sau một lượt `man.mjs`; `dot-bien.mjs` chạy NỀN với `nice -n 10` (xin lượt M5 nếu M5 coi là làn nặng).
- [ ] **Step 5: Commit** — `git commit -m "chore(kanban-viec): răng đo màn, sạch thiết kế trên HTML chụp, đột biến 13 cặp"`

---

### Task 9: Từ điển và tài liệu API

**Phục vụ:** E12. **independent: false** (ghi lại tên đã chốt ở Task 2–3).

**Files:**
- Modify: `CONTEXT.md` (mục mới «Việc con» ngay sau «Việc»; câu về kiểu xem Bảng trong «Việc của tôi»)
- Modify: `docs/api.md` mục «Việc» (gạch đầu dòng mới «Bảng và việc con»)

- [ ] **Step 1: `CONTEXT.md`** — mục «Việc con»: «một Việc nằm dưới đúng một việc cha, một tầng (việc con không có con); lúc tạo mang theo bản ghi gắn của cha, và người giao, người thực hiện của cha thành người theo dõi; đóng hay huỷ cha không tự đóng con — máy hỏi lại khi cha còn con mở. Đặt 2026-10-13 (hàng DA2).» + `_Avoid_: subtask, việc phụ` + một dòng «Vì sao». Mục «Việc của tôi» thêm: «Có hai kiểu xem: Danh sách và Bảng (bốn cột Chưa làm · Đang làm · Chờ đánh giá · Xong; Xong chỉ 7 ngày gần nhất).»
- [ ] **Step 2: `docs/api.md`** — gạch «Bảng và việc con»: `viec.bang` (bốn cột, `chuyenDuoc` do máy chủ tính, cột Xong `VIEC.bang.xongGanDayNgay` ngày), `viec.keo` (đi qua `doiTrangThai`, nguồn `bang-keo` hay `bang-menu`; thứ tự riêng từng người ở `viecThuTu`, không ghi vết, không tính là lịch sử), `viec.taoCon` và `viec.con` (một tầng, chép gắn, người của cha thành người theo dõi, vết `them-viec-con` trên cha nên cha có con không xoá được).
- [ ] **Step 3: Kiểm** — `bun run lint:slop` xanh trên hai tệp.
- [ ] **Step 4: Commit** — `git commit -m "docs(kanban-viec): từ điển Việc con, kiểu xem Bảng; tài liệu API bảng và việc con"`

---

## Kết S3

Sau Task 9: `bun run check-types`, `bun run lint`, `bun run lint:slop` ở gốc (không chạy `bun run test` toàn bộ — đó là làn S4, xin lượt M5). Đặt hợp đồng `status: implemented`, rồi S4.
