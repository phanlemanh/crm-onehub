# Loại mục tiêu «Học tập» — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm loại `hoc-tap` với cách đọc riêng giữa kỳ, cuối kỳ và điều kiện chặn khép kỳ.

**Architecture:** Một nguồn `LOAI_MUC_TIEU`; hai hàm thuần (`tinhTrang`, `cachDoc`) rẽ theo loại; một bộ đếm `hocTapChuaGhi` dùng chung cho API khép kỳ và `bangCham`; UI chỉ thêm nhãn, chú thích và một danh sách chặn.

**Tech Stack:** Zod, NestJS + nestjs-trpc, Prisma, Next.js App Router, React Query, bun test.

**Spec:** `docs/superpowers/specs/2026-10-07-okr-loai-hoc-tap-design.md` · `_acceptance/okr-loai-hoc-tap/{contract.md,evals.yaml}`

## Global Constraints

- Không chú thích trong mã. Không `className` đè component `@crm/ui`; chữ phụ dùng `FieldDescription`.
- Tệp chữ dùng chung (`apps/app/lib/messages/*.ts`, `CONTEXT.md`, `_acceptance/config.yaml`) chỉ thêm dòng (luật 7 của đợt sau-14-10).
- Khoá messages mới có hàm → thêm dòng `GHIM` trong `apps/app/test/messages-guard.spec.ts`.
- Lệnh nặng chạy nền khi giữ khoá đợt → bọc `node scripts/dieu-phoi/giu-nhip.mjs --`; S4 và ghim lại xin khoá qua `xin/`.
- Nhãn: «Học tập»/«Learning», «Đã trả lời»/«Answered», «Chưa trả lời»/«Not yet answered», «Bắt buộc trước khi khép kỳ»/«Required before the cycle closes».

## Review Focus

- Học tập chờ duyệt không được chặn khép kỳ (lọc `status = cong-bo`, không lọc loại trừ) — Task 3, E7.
- Điều học được chỉ khoảng trắng là chưa ghi — `trim()` ở cả `cachDoc` lẫn `hocTapChuaGhi` — Task 1, Task 3.
- Lưu điều học được phải làm mới `bangCham` — Task 4.
- Mọi `Record<LoaiMucTieu, …>` / `Record<CachDoc, …>` thêm khoá mới, kẻo `check-types` đỏ — Task 2, Task 4.
- `gieoMucTieuCongBo` (test helper khép kỳ) nhận `kind` hoc-tap — Task 3.

---

### Task 1: Validation — một nguồn, tình trạng, cách đọc

`independent: false` · phục vụ E1, E3, E4, E15 · verify: `cd packages/validation && bun test test/okr-loai-hoc-tap.spec.ts`

**Files:** Modify `packages/validation/src/okr-muc-tieu.ts`, `okr-khep.ts`, `okr-cuoc-soan.ts`; Test `packages/validation/test/okr-loai-hoc-tap.spec.ts` (describe `mot-nguon`, `tinh-trang`, `cach-doc`, `soan-nhan`).

**Interfaces — Produces:** `LOAI_MUC_TIEU` ba giá trị; `CACH_DOC` sáu giá trị; `cachDoc(loai: LoaiMucTieu, diem: number | null, dieuHocDuoc: string): CachDoc | null`.

- [ ] Test đỏ theo bảng E1/E3/E4/E15 (21 + 13 dòng gõ tay, thông điệp ghim như evals).
- [ ] Cài:

```ts
export const LOAI_MUC_TIEU = ["cam-ket", "tham-vong", "hoc-tap"] as const;
// tinhTrang
if (loai !== "cam-ket")
	return tiLe >= NGUONG_TINH_TRANG.thamVong ? "dung-nhip" : "cham-nhip";
```

```ts
export const CACH_DOC = ["tot", "duoi-muc-tot", "dat", "chua-tron", "da-tra-loi", "chua-tra-loi"] as const;
export function cachDoc(loai: LoaiMucTieu, diem: number | null, dieuHocDuoc: string): CachDoc | null {
	if (loai === "hoc-tap") return dieuHocDuoc.trim() ? "da-tra-loi" : "chua-tra-loi";
	if (diem === null) return null;
	if (loai === "tham-vong") return diem >= OKR_KHEP.nguongThamVong ? "tot" : "duoi-muc-tot";
	return diem >= 1 ? "dat" : "chua-tron";
}
```

`okr-cuoc-soan.ts`: `export const LOAI_MUC_TIEU_NHAP = LOAI_MUC_TIEU;` (import từ `./okr-muc-tieu`).
- [ ] Verify xanh; phá-thử (a)(c)(d) tại chỗ sau commit; commit `feat(okr): loai muc tieu hoc-tap trong validation`.

### Task 2: API — hợp đồng, bảng chấm, khép kỳ

`independent: false` · phục vụ E2, E5, E6, E7, E18 · verify: `bun run test -- "cd apps/api && bun test test/okr-hoc-tap.spec.ts"` + `bun run test -- "cd apps/api && bun test test/okr-khep.spec.ts"`

**Files:** Modify `apps/api/src/okr/okr.contracts.ts` (`loaiMucTieu: z.enum(LOAI_MUC_TIEU)`), `khep.ts` (`hocTapChuaGhi`), `okr.service.ts` (`setCyclePhase`), `okr-khep.service.ts` (`cachDoc(loai, diem, m.nhinLai?.dieuHocDuoc ?? "")`, `hocTapChuaGhi` vào `bangCham`), `okr-khep.contracts.ts` (`hocTapChuaGhi: z.array(z.object({ id: z.string(), ten: z.string() }))`), `okr-config.ts` (`conHocTapChuaGhi(n, ten)`); Modify test helper `apps/api/test/okr-khep-san.ts` (`kind?: LoaiMucTieu`); Test `apps/api/test/okr-hoc-tap.spec.ts` (describe `tao-hoc-tap`, `bang-cham`, `khep-chan`, `khep-bien`).

**Interfaces — Produces:** `hocTapChuaGhi(tx, cycleId, nc?: NguCanhXem): Promise<{ id: string; ten: string }[]>`.

```ts
export async function hocTapChuaGhi(tx, cycleId, nc?) {
	const ds = await tx.okrObjective.findMany({
		where: { AND: [{ cycleId, kind: "hoc-tap", status: "cong-bo" }, ...(nc ? [dieuKienXemMucTieu(nc)] : [])] },
		orderBy: [{ position: "asc" }, { id: "asc" }],
		select: { id: true, title: true, nhinLai: { select: { dieuHocDuoc: true } } },
	});
	return ds.filter((m) => !(m.nhinLai?.dieuHocDuoc ?? "").trim()).map((m) => ({ id: m.id, ten: m.title }));
}
```

`setCyclePhase`, nhánh `phase === "da-dong"` sau kiểm `conLai`: `const ht = await hocTapChuaGhi(tx, id); if (ht.length > 0) throw new BadRequestException(T.khep.conHocTapChuaGhi(ht.length, ht.map((m) => m.ten)));` — thông điệp `Còn ${n} mục tiêu học tập chưa ghi điều học được: ${ten.join(", ")}.`
- [ ] Test đỏ (E2, E5, E6 gồm ca hai mục tiêu position ngược, E7 bảng 4 trạng thái — chờ duyệt: `setProgram` `duyetCongBo: true`, người không phải trưởng gửi công bố), cài, xanh; chạy lại `okr-khep.spec.ts` đã ký; commit `feat(okr): khep ky chan khi hoc-tap chua ghi dieu hoc duoc`.

### Task 3: App — nhãn, hộp chọn, màn chấm, hộp khép

`independent: false` · phục vụ E8, E9, E10, E17 · verify: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/okr-hoc-tap.dom.tsx` + `bun test ./test/messages-guard.spec.ts` + `bun run check-types`

**Files:** Modify `apps/app/lib/messages/okr.ts` (`loai["hoc-tap"]`), `okr-khep.ts` (`cachDoc` hai khoá, `chamDiem.batBuocHoc`, `caiDat.dong.hocTapTieuDe`), `okr/cham-diem.tsx` (nhãn khi `cachDoc !== null` dù `diem === null`; `FieldDescription` cho `kind === "hoc-tap"`; `onSuccess` của `ghiDieuHocDuoc` gọi `cache.okr()`), `settings/okr/hop-thoai-dong-ky.tsx` (điều kiện xác nhận `conLai === 0 && hocTapChuaGhi.length === 0`; `ItemGroup data-hoc-tap-chua-ghi` với `<span translate="no">{m.ten}</span>`); fixture `bangCham` trong test sẵn có thêm `hocTapChuaGhi: []`; Test `apps/app/test/okr-hoc-tap.dom.tsx`.
- [ ] Test đỏ (E8 ba ca, E9, E10 vi/en), cài, xanh; `bun run test:dom` toàn app; design-gate static hai tệp; commit `feat(okr): man cham va hop khep cho muc tieu hoc tap`.

### Task 4: Kara và từ điển

`independent: true` · phục vụ E14, E15 · verify: `bun run lint:slop`

**Files:** Modify `apps/agent-okr/agent/instructions.md` (dòng `loai`: `cam-ket`, `tham-vong` hoặc `hoc-tap` + một câu khi nào dùng học tập); `CONTEXT.md` thêm mục «Loại mục tiêu»; `apps/api/src/okr/okr.contracts.ts` `dongSoan.loaiMucTieu: z.enum(LOAI_MUC_TIEU_NHAP)`.
- [ ] Sửa, verify, commit `docs(okr): Kara va tu dien cho loai Hoc tap`.

### Task 5: Thước màn thật và phá thử

`independent: false` · phục vụ E11, E12, E13, E16 · verify: lành qua `tien-de.mjs`, `--chieu-do E11`, `E11b`, `E13`, rồi `node _acceptance/okr-loai-hoc-tap/rang/dot-bien.mjs`

**Files:** Create `_acceptance/okr-loai-hoc-tap/rang/man-lib.mjs` (chép từ `_acceptance/okr-cua-toi-tach-theo-doi/rang/man-lib.mjs` trên nhánh `feat/okr-cua-toi-tach-theo-doi`, hoặc từ `kho-tai-lieu`), `man-hoc-tap.mjs` (năm bước E11; chu kỳ 2031 đang chạy và 2024 Q1 quá hạn qua `setCyclePhase` cham-diem — cần giờ máy sau ngày cuối, 2024 đã qua), `dot-bien.mjs` (14 cặp, `SO_CAP_KHAI = 14` gõ tay và khẳng định bằng độ dài bảng; bản sao `git worktree` ngoài kho).
- [ ] Lành 5/5 bước; ba chiều đỏ đúng ghim; 14/14 cặp; commit `test(okr-loai-hoc-tap): thuoc man that va pha thu`.

## Sau Task 5

`check-types`, `lint`, `lint:slop`, `build`; contract `status: implemented`; xin khoá `s4` qua `xin/` rồi S4.
