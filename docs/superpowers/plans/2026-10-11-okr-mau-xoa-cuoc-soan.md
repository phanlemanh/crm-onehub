# Gỡ bộ OKR mẫu gỡ luôn cuộc soạn — kế hoạch

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `bun run okr:mau --xoa` và nạp lại gỡ mọi `okrCuocSoan` trỏ bộ mẫu cùng `okrDeXuat` của chúng, đếm vào dòng in, giữ `aiChiPhi`.

**Architecture:** `tapMau` (`apps/api/scripts/okr-mau/nap.ts`) thêm tập `cuocSoan` chọn theo tiền tố `mau-okr-` trên ba cột đơn vị/chu kỳ hoặc người mở là người mẫu; `xoaTrong` xoá đề xuất theo `cuocSoanId` rồi xoá cuộc, trả thêm hai số đếm; `lenh.ts` in chúng ở nhánh `--xoa`.

**Tech Stack:** Bun test, Prisma 7, NestJS (thủ tục `okr.soanMo` thật trong spec).

**Spec:** `docs/superpowers/specs/2026-10-11-okr-mau-xoa-cuoc-soan-design.md` · hợp đồng `_acceptance/okr-mau-xoa-cuoc-soan/contract.md` · evals `_acceptance/okr-mau-xoa-cuoc-soan/evals.yaml`.

## Global Constraints

- Không chú thích trong code (AGENTS.md).
- Không chạm `packages/db/prisma/**` (T3) — không thêm khoá ngoại.
- Dòng in thêm đúng vế `, <n> cuộc soạn OKR với <m> đề xuất soạn` ở nhánh `--xoa`.
- Không xoá `aiChiPhi`, `agentEvent`.
- Spec chạy qua `bun run test -- "cd apps/api && bun test test/okr-mau-cuoc-soan.spec.ts -t <nhãn>"` (CSDL kiểm riêng mỗi lượt).

## Review Focus

- Kho chỉ còn cuộc mồ côi (bộ mẫu đã đi) → `--xoa` phải gỡ, không báo «không có gì» — Task 2 (`omx-mo-coi`).
- Cuộc chỉ trỏ bộ mẫu ở một vế (phòng, bộ phận, hay người mở) → vẫn bị gỡ — Task 2 (`omx-xoa`, ba cuộc một-vế).
- Cuộc ngoài bộ mẫu → đứng nguyên — Task 2 (`omx-xoa`).
- Mã 5 → không hàng nào đổi kể cả cuộc soạn — Task 2 (`omx-dang-giu`).
- Hàng chi phí của cuộc → giữ, tổng tháng không đổi — Task 2 (`omx-xoa`).

---

### Task 1: Spec đỏ trước (phục vụ E1–E7) · independent: false

**Files:**
- Create: `apps/api/test/okr-mau-cuoc-soan.spec.ts`
- Modify: `apps/api/test/okr-mau-san.ts` (`lamSachOkr` thêm `"okrCuocSoan"` vào `TRUNCATE`)

**Interfaces:**
- Consumes: `batDauMau`, `ketThucMau`, `dungUngDung`, `phienMau`, `ghiCauHinh`, `gieoChiPhi`, `ok`, `CHO_DB`, `TIEN_TO_TLO` (`tro-ly-okr-san.ts`); `goiSoan`, `vaoDonVi`, `DON_VI`, `CHU_KY_NAM_KE`, `PB`, `BP`, `gieoDongNhap` (`soan-okr-san.ts`); `chayLenh`, `demThamChieu`, `tapIdMau`, `nguoiMau`, `vanTayKho` (`okr-mau-san.ts`); `moCuoc`, `docCuoc` (`@crm/db/okr-cuoc-soan`); `chiTieuThang`, `thangVN` (`@crm/db/ai-chi-phi`).
- Produces: bốn nhãn `-t`: `omx-xoa`, `omx-mo-coi`, `omx-nap-lai`, `omx-dang-giu`; thông điệp ghim như `evals.yaml`.

- [ ] **Step 1:** Viết spec (mã đầy đủ ở tệp; dựng: `batDauMau` → cookie `le-hai-dang` ghi `{ aiOn: true, aiSoanPhamVi: "danh-sach", aiSoanDonVi: [PB("kd-bac")], aiSoanAnPhamVi: "tat", aiSoanAnDonVi: [] }` → cookie `nguyen-thi-lan` gọi `okr.soanMo` trên `CHU_KY_NAM_KE` cho `DON_VI.kdBac` → `docCuoc` → `gieoDongNhap`). Thứ tự kiểm sau `--xoa`: mã thoát → cuộc chính theo mã («omx: con cuoc soan mau (chinh)») → ba cuộc một-vế theo mã («omx: con cuoc ve-pb|ve-bp|ve-nguoi») → tổng theo tiền tố («omx: con cuoc soan mau (<n>)») → đề xuất («omx: con de xuat soan») → `demThamChieu` («omx: con tham chieu mau») → chi phí («omx: chi phi soan bi doi», «omx: tong chi thang doi») → cuộc ngoài («omx: cuoc ngoai bi doi») → dòng in («omx: dong in thieu dem cuoc soan») → nạp lại mã 0.
- [ ] **Step 2:** `lamSachOkr` thêm `"okrCuocSoan"`.
- [ ] **Step 3:** Chạy `bun run test -- "cd apps/api && bun test test/okr-mau-cuoc-soan.spec.ts"` — mong đỏ ở `omx-xoa` «omx: con cuoc soan mau (chinh)», `omx-mo-coi` «omx: cuoc mo coi con», `omx-nap-lai` «omx: nap lai con cuoc cu»; `omx-dang-giu` xanh (giao dịch đã nguyên tử từ trước).

### Task 2: Gỡ cuộc soạn trong `xoaTrong` (phục vụ E1–E7) · independent: false

**Files:**
- Modify: `apps/api/scripts/okr-mau/nap.ts` (`tapMau`, `xoaTrong`, kiểu `DemCuocSoan`, `xoaBoOkrMau`)
- Modify: `apps/api/scripts/okr-mau/lenh.ts` (nhánh `--xoa`)

**Interfaces:**
- Produces: `export type DemCuocSoan = { cuocSoan: number; deXuatSoan: number }`; `xoaTrong(tx): Promise<(DemBoMau & DemCuocSoan) | null>`; `xoaBoOkrMau(db): Promise<(DemBoMau & DemCuocSoan) | null>`.

- [ ] **Step 1:** `tapMau` — sau `Promise.all`:

```ts
const cuocSoan = await tx.okrCuocSoan.findMany({
	where: {
		OR: [
			{ cycleId: tien },
			{ divisionId: tien },
			{ departmentId: tien },
			{ nguoiMoUserId: { in: ids(nguoi) } },
		],
	},
	select: { id: true },
});
```
và trả `cuocSoan: ids(cuocSoan)` (đi vào `tong`).

- [ ] **Step 2:** `xoaTrong` — ngay sau `const K = …`:

```ts
const CS = { in: t.cuocSoan };
const deXuatSoan = await tx.okrDeXuat.deleteMany({ where: { cuocSoanId: CS } });
const cuocSoan = await tx.okrCuocSoan.deleteMany({ where: { id: CS } });
```
trả thêm `cuocSoan: cuocSoan.count, deXuatSoan: deXuatSoan.count`.

- [ ] **Step 3:** `lenh.ts` nhánh `--xoa`: `` `Đã xoá bộ OKR mẫu: ${tomTat(dem)}, ${dem.cuocSoan} cuộc soạn OKR với ${dem.deXuatSoan} đề xuất soạn.` ``
- [ ] **Step 4:** Chạy cả spec: xanh bốn nhãn. Chạy `bun run test -- "cd apps/api && bun test test/okr-mau.spec.ts -t xoa-mau"` và `-t nap-lai-mau`: xanh. `bun run check-types`.
- [ ] **Step 5:** Commit.

### Task 3: Tài liệu (phục vụ E8) · independent: true

**Files:** Modify `docs/setup.md` mục «Bộ OKR mẫu» — một đoạn sau đoạn hỏi ý.

- [ ] **Step 1:** Viết đoạn: cuộc soạn mở trên chu kỳ, bộ phận, phòng ban mẫu hay bởi người mẫu (và đề xuất của chúng) đi theo `--xoa` và nạp lại, kể cả cuộc sót từ lần xoá trước; hàng chi phí AI (`aiChiPhi`) của các cuộc đó ở lại vì đó là tiền đã tiêu và trần chi phí AI tháng đọc nó.
- [ ] **Step 2:** Commit.

### Task 4: Chiều đỏ (phục vụ E9) · independent: false (cần Task 1–2)

**Files:** Create `_acceptance/okr-mau-xoa-cuoc-soan/rang/dot-bien.mjs` theo khuôn `_acceptance/zalo-gui-hong-ghi-ly-do/rang/dot-bien.mjs` (`dungBanSao`, `thayMotLan`, `goBanSao` của `ca-chap-chon-cach-ly/rang/ban-sao.mjs`), `SO_CAP_KHAI = 7`, mỗi lệnh chạy xanh một lần (nhớ kết quả theo lệnh), mỗi cặp chạy đỏ một lần.

| Cặp | Tệp | Thay | Lệnh | Ghim |
|---|---|---|---|---|
| a | nap.ts | `const cuocSoan = await tx.okrCuocSoan.deleteMany({ where: { id: CS } });` → `const cuocSoan = { count: t.cuocSoan.length };` | omx-xoa | `omx: con cuoc soan mau` |
| b | nap.ts | dòng xoá `okrDeXuat` theo `cuocSoanId` → `const deXuatSoan = { count: 0 };` | omx-xoa | `omx: con de xuat soan` |
| c | nap.ts | khối `OR: [ … ]` của `okrCuocSoan.findMany` → `cycleId: { in: ids(chuKy) },` | omx-mo-coi | `omx: cuoc mo coi con` |
| d | nap.ts | sau dòng xoá cuộc thêm `await tx.aiChiPhi.deleteMany({ where: { taskId: CS } });` | omx-xoa | `omx: chi phi soan bi doi` |
| e | lenh.ts | bỏ vế `, ${dem.cuocSoan} cuộc soạn OKR với ${dem.deXuatSoan} đề xuất soạn` | omx-xoa | `omx: dong in thieu dem cuoc soan` |
| f | nap.ts | bỏ dòng `{ departmentId: tien },` trong khối chọn cuộc | omx-xoa | `omx: con cuoc ve-pb` |
| g | nap.ts | bỏ dòng `{ nguoiMoUserId: { in: ids(nguoi) } },` | omx-xoa | `omx: con cuoc ve-nguoi` |

- [ ] **Step 1:** Viết script; wire đã có ở `executors.script.omx_dot_bien`.
- [ ] **Step 2:** Chạy `bun _acceptance/okr-mau-xoa-cuoc-soan/rang/dot-bien.mjs` → `DOT BIEN: 7/7 cap dat`.
- [ ] **Step 3:** Commit.
