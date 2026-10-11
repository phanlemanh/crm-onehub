# Gỡ bộ OKR mẫu gỡ phiên bản cấu hình — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `bun run okr:mau --xoa` (và nạp lại) xoá phiên bản `okrProgramConfig` do người mẫu tạo, gỡ mã đơn vị mẫu khỏi 6 mảng `*DonVi` của các phiên bản còn lại, và đếm cả hai vào dòng in.

**Architecture:** Mở rộng `tapMau`/`xoaTrong` trong `apps/api/scripts/okr-mau/nap.ts` — cùng giao dịch, cùng luật chọn theo tiền tố `mau-okr-` như cuộc soạn. Danh sách mảng rút từ `OKR_PROGRAM_MAC_DINH`. Phép đo ở spec mới `apps/api/test/okr-mau-cau-hinh.spec.ts` và `omx-xoa` bỏ `DU_PHEP`.

**Tech Stack:** Bun, Prisma, bun:test, NestJS app trong test.

**Spec:** `docs/superpowers/specs/2026-10-11-okr-mau-xoa-cau-hinh-design.md` · hợp đồng `_acceptance/okr-mau-xoa-cau-hinh/contract.md` · evals `_acceptance/okr-mau-xoa-cau-hinh/evals.yaml`.

## Global Constraints

- Không chú thích trong code (AGENTS.md).
- Chỉ chạm `apps/api/scripts/okr-mau/**`, `apps/api/test/okr-mau-*.ts`, `docs/setup.md`, `_acceptance/okr-mau-xoa-cau-hinh/**`.
- Chuỗi neo của `_acceptance/okr-mau-xoa-cuoc-soan/rang/dot-bien.mjs` phải còn đúng một lần trong `nap.ts`/`lenh.ts` (AC-10).
- Chuỗi in nguyên văn: «N phiên bản cấu hình chương trình OKR do người mẫu tạo», «gỡ mã đơn vị mẫu khỏi M phiên bản khác».

## Review Focus

1. Phiên bản ngoài bộ mẫu gạt thành mảng rỗng với phạm vi `danh-sach` — bốn bộ đọc phải đọc được (E4 ca hai).
2. Spec để lại hàng cấu hình cho spec sau — `omc-tra-lai` (E11).
3. Mã 5 phải để `okrProgramConfig` nguyên nội dung — mọi ghi đi qua `tx` (E7).
4. Kho chỉ còn phiên bản mồ côi — tính vào `tong` (E5).
5. Một cột `*DonVi` mới — danh sách rút từ mặc định, spec ghim 6 cột (E3).

---

### Task 1: Phép đo đỏ trước

**Files:**
- Create: `apps/api/test/okr-mau-cau-hinh.spec.ts`
- Modify: `apps/api/test/okr-mau-san.ts` (thêm `demThamChieuMang`)
- Modify: `apps/api/test/okr-mau-cuoc-soan.spec.ts` (bỏ `DU_PHEP`, thêm quét mảng)

**Phục vụ:** E1, E2, E3, E4, E5, E6, E7, E11 · **independent:** false

**Interfaces:**
- Produces: `demThamChieuMang(ids: string[]): Promise<{ dem: Record<string, number>; cot: string[] }>` trong `okr-mau-san.ts`.

- [ ] Step 1: `demThamChieuMang` — truy vấn `information_schema.columns` `data_type = 'ARRAY'` và `udt_name = '_text'`, mỗi cột `SELECT count(*) WHERE "<c>" && $1::text[]`; trả `cot` = mọi `bảng.cột` đã quét.
- [ ] Step 2: `omx-xoa`: thay `DU_PHEP` bằng khoá theo dõi `okrProgramConfig.createdById` (đối chứng trước, phải mất sau, không lọc); quét mảng trước (đòi khoá `okrProgramConfig.aiSoanDonVi`) và sau (rỗng, ghim `omx: con ma mau trong mang`); `cot` so với truy vấn độc lập + 6 cột ghim (`omx: quet mang thieu cot`).
- [ ] Step 3: Spec `omc-` — `beforeAll` chụp `to_jsonb` mọi hàng `okrProgramConfig`, `traLai()` xoá hết rồi `INSERT … SELECT * FROM jsonb_populate_record`, `afterAll` gọi `traLai()`. Bộ dựng: `banMau(sua)` = `ghiCauHinh` qua cookie `le-hai-dang` rồi đọc hàng mới nhất; `doiTacGia(id, nguoi)` UPDATE đúng cột `createdById`; `tamMang(ma)` dựng input 6 mảng + 6 phạm vi `danh-sach` từ `information_schema` (tên phải bằng 6 tên ghim). Các describe: `omc-lui` (hai ca), `omc-gat` (hai ca, gồm dòng in), `omc-mo-coi` (hai ca), `omc-nap-lai`, `omc-dang-giu`, `omc-tra-lai` (cuối tệp). Thông điệp ghim đúng như `evals.yaml`.
- [ ] Step 4: Chạy `bun run test -- "cd apps/api && bun test test/okr-mau-cau-hinh.spec.ts"` — Expected: đỏ ở `omc: cau hinh mau con`, `omc: con ma don vi mau`, `omc: mo coi bao khong co bo mau`, `omc: nap lai con cau hinh mau`; `omc-dang-giu`, `omc-tra-lai` xanh. `-t omx-xoa` đỏ `omx: con tham chieu mau`.

### Task 2: Gỡ cấu hình trong `xoaTrong`

**Files:**
- Modify: `apps/api/scripts/okr-mau/nap.ts` (`tapMau`, `xoaTrong`, kiểu `DemCauHinh`)
- Modify: `apps/api/scripts/okr-mau/lenh.ts` (dòng in `--xoa`)

**Phục vụ:** E1–E7, E10 · **independent:** false

**Interfaces:**
- Produces: `export type DemCauHinh = { cauHinh: number; cauHinhGat: number }`; `xoaTrong` trả `(DemBoMau & DemCuocSoan & DemCauHinh) | null`.

- [ ] Step 1: Trong `nap.ts`:

```ts
type KhoaDonVi = {
	[K in keyof OkrProgram]: OkrProgram[K] extends string[] ? K : never;
}[keyof OkrProgram];

const laKhoaDonVi = (k: string): k is KhoaDonVi =>
	Array.isArray(OKR_PROGRAM_MAC_DINH[k as keyof OkrProgram]);

const MANG_DON_VI = Object.keys(OKR_PROGRAM_MAC_DINH).filter(laKhoaDonVi);
```

  `tapMau` thêm:

```ts
	const cauHinhMau = await tx.okrProgramConfig.findMany({
		where: {
			OR: [{ createdById: { in: ids(nguoi) } }, { createdById: tien }],
		},
		select: { id: true },
	});
	const conLai = await tx.okrProgramConfig.findMany({
		where: { id: { notIn: ids(cauHinhMau) } },
	});
	const cauHinhGat = conLai.filter((row) =>
		MANG_DON_VI.some((k) => row[k].some((ma) => ma.startsWith(OKR_MAU.tienTo))),
	);
```

  trả `cauHinh: ids(cauHinhMau)`, `cauHinhGat` (hàng đầy đủ). `tong` cộng `cauHinhGat.length` (mảng hàng, không phải id — tách khỏi `danhSach` như `taiLieu`).
- [ ] Step 2: `xoaTrong` sau khối cuộc soạn: `deleteMany({ where: { id: { in: t.cauHinh } } })`; mỗi hàng `cauHinhGat` → `tx.okrProgramConfig.update({ where: { id }, data: Object.fromEntries(MANG_DON_VI.map(k => [k, row[k].filter(ma => !ma.startsWith(OKR_MAU.tienTo))])) })`. Trả `cauHinh: xoa.count, cauHinhGat: gat.length`.
- [ ] Step 3: `lenh.ts` — nối sau vế cuộc soạn: `, ${dem.cauHinh} phiên bản cấu hình chương trình OKR do người mẫu tạo, gỡ mã đơn vị mẫu khỏi ${dem.cauHinhGat} phiên bản khác`. Giữ nguyên chuỗi neo `, ${dem.cuocSoan} cuộc soạn OKR với ${dem.deXuatSoan} đề xuất soạn`.
- [ ] Step 4: Chạy cả tệp `okr-mau-cau-hinh.spec.ts` và `okr-mau-cuoc-soan.spec.ts` — Expected: xanh. `bun run check-types`.
- [ ] Step 5: Chiều đỏ tay của E11: bỏ `INSERT` trong `traLai` → `omc: spec de lai cau hinh`; trả lại.
- [ ] Step 6: Commit.

### Task 3: Phép đo đột biến

**Files:** Create `_acceptance/okr-mau-xoa-cau-hinh/rang/dot-bien.mjs` (khuôn của hồ sơ anh em, 8 cặp theo E9)

**Phục vụ:** E9, E10 · **independent:** false (neo vào mã Task 2)

- [ ] Step 1: Viết 8 cặp với chuỗi neo lấy nguyên văn từ `nap.ts`/`lenh.ts` sau Task 2.
- [ ] Step 2: `bun _acceptance/okr-mau-xoa-cau-hinh/rang/dot-bien.mjs` — Expected `DOT BIEN: 8/8 cap dat`; `bun _acceptance/okr-mau-xoa-cuoc-soan/rang/dot-bien.mjs` — Expected `7/7`.
- [ ] Step 3: Commit.

### Task 4: Tài liệu

**Files:** Modify `docs/setup.md` mục «Bộ OKR mẫu» (thay câu «hiện vẫn còn sau `--xoa`»)

**Phục vụ:** E8 · **independent:** true

- [ ] Step 1: Viết đoạn: `--xoa` và nạp lại xoá phiên bản cấu hình do người mẫu tạo (kể cả bản sót), gỡ mã đơn vị mẫu khỏi phiên bản khác, cấu hình đang dùng lùi về bản trước phiên mẫu hoặc mặc định.
- [ ] Step 2: `bun run lint`, `bun run lint:slop`, commit.
