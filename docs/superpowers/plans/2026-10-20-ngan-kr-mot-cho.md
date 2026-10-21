# Ngăn KR một chỗ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mọi lối bấm vào một KR mở cùng ngăn `KrSheet`; ngăn có đếm «n/N», ‹ ›, nút Cập nhật; trang đơn vị có nút Cập nhật trên dòng KR; hộp cập nhật vẽ trước điểm mới so với đích; cập nhật một KR số trong 3 bấm.

**Architecture:** Một hook `useCapNhatKr` (tách từ `TabKr` của ngăn mục tiêu) mở `HopThoaiCapNhatKr` từ ba chỗ: «…» của ngăn mục tiêu, đầu ngăn KR, dòng KR trang đơn vị. Mọi dữ liệu cập nhật lấy từ `okr.objective({ id })` (đã có `keyResults` theo `position` và `canEditKr`). ‹ › dùng `thayDinh` của `useRecordStack`. Không thủ tục API mới.

**Tech Stack:** Next.js app (`apps/app`), tRPC + TanStack Query, `@crm/ui` (shadcn), bun test + jsdom (`packages/ui/test/setup-dom.ts`), nuqs.

**Spec:** `docs/superpowers/specs/2026-10-20-ngan-kr-mot-cho-design.md`; hợp đồng `_acceptance/ngan-kr-mot-cho/contract.md` (đã duyệt 20/10); thước `_acceptance/ngan-kr-mot-cho/evals.yaml`.

## Global Constraints

- Không viết chú thích trong code (`AGENTS.md`).
- Không chạm `record-sheet-host.tsx`, `record-stack.ts`, `nap-san-khi-mo-ngan.tsx` (hồ sơ VS8 đã ký).
- `apps/app/lib/messages/okr*.ts`, `_acceptance/config.yaml`: chỉ THÊM dòng (luật 7). Mỗi khoá chữ có `vi` và `en` khác nhau.
- Thành phần UI chỉ từ `@crm/ui` theo subpath; biến thể mới làm trong `packages/ui`, không `className` đổi màu/góc ở chỗ gọi.
- Tên KR, mục tiêu, người mang `translate="no"`.
- Mức tự tin vẫn bắt buộc; `okr.moCapNhat` gửi `entry: "sheet"` ở mọi lối mới.
- ‹ › đi trong một mục tiêu theo `position`; hết thì nút tắt (chủ kho chọn 20/10).
- Thước hồ sơ đã ký: chỉ sửa theo khuôn luật 21 chủ kho đã cho (đổi đúng chỗ hoặc khai `status: not-run` + `superseded_by: ngan-kr-mot-cho#AC-n`; đo hai chiều; một dòng sổ `fix` mang `decided_by: Phan Le Manh` mỗi hồ sơ).

## Review Focus

- KR có `hienTaiQuaCapNhat: false` (số do máy đọc) — mọi nút Cập nhật mới phải ẩn, như mục «…» hôm nay → Task 3, Task 5 thêm ca.
- Mở ngăn KR thẳng từ đường dẫn (`?record=kr:<id>`, chồng một tầng) — `lotDuoi` đặt ngăn mục tiêu dưới; ‹ › vẫn phải chạy khi `okr.objective` chưa về (nút tắt tới khi có) → Task 3.
- Gửi cập nhật từ ngăn KR — `canhKr` và `dienBien` của KR phải làm mới, không chỉ `okr.objective` → Task 1 (cache) + Task 3 (E5).
- Hai lần bấm Cập nhật nhanh trên hai dòng khác nhau — hộp phải mang đúng KR của dòng bấm sau (phiên `moCapNhat` cũ bị bỏ) → Task 1.
- Dưới `md` (`Drawer`) đầu ngăn quá hẹp: đếm, ‹ ›, Cập nhật phải xuống dòng, không tràn → Task 3 (E10).

---

### Task 1: `useCapNhatKr` — một chỗ mở hộp cập nhật

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/cap-nhat-kr.tsx`
- Modify: `apps/app/components/crm/record-sheet/objective-sheet.tsx` (`TabKr` ~545–705: thay `hop`/`moPhien`/`moCapNhat` + khối `HopThoaiCapNhatKr` bằng hook)
- Modify: `apps/app/app/(app)/[slug]/okr/hop-thoai-cap-nhat-kr.tsx` (truyền `tuDongFocus` cho `OGiaTri`; `onSuccess` làm mới thêm `canhKr` + `dienBien` của KR)
- Test: `apps/app/test/ngan-kr-mot-cho.dom.tsx` (tạo tệp, khung trpc giả theo `apps/app/test/okr-quanh-loi-vao.dom.tsx`)

**Interfaces:**
- Produces: `useCapNhatKr(): { mo: (mt: ChiTiet, kr: KetQua) => void; hop: ReactNode }` — `hop` là phần tử cần đặt trong cây; `ChiTiet = RouterOutputs["okr"]["objective"]`, `KetQua` từ `okr/kieu`.
- Produces: `coTheCapNhat(mt: ChiTiet, kr: KetQua): boolean` = `kr.hienTaiQuaCapNhat && mt.canEditKr.includes(kr.id)`.

- [ ] Test `vk7-cap-nhat-ngan` phần hộp: mở hộp → `document.activeElement` là ô giá trị; hai lần `mo` liên tiếp K1 rồi K3 → hộp mang tiêu đề K3, `guiCapNhat` nhận `keyResultId: K3`.
- [ ] Chạy, thấy đỏ. Viết hook; `TabKr` dùng nó, mục «…» giữ `data-muc="cap-nhat-kr"`.
- [ ] Chạy lại cùng các bài đã ký: `config:executors.test` của `no-sau-luot-4-okr` E8 (`sheet-quyen-cap-nhat.dom.tsx`) và `okr-sheet.dom.tsx` xanh.
- [ ] Commit `feat(ngan-kr-mot-cho): một hook mở hộp cập nhật KR`.

independent: false · phục vụ E5, E6, E8

### Task 2: Điểm xem trước trên đồ thị đích

**Files:**
- Modify: `packages/ui/src/components/target-line-chart.tsx` (prop tuỳ chọn `previewPoint?: { x: string; value: number }` — vẽ điểm vòng rỗng mang `data-diem-moi`, nối nét đứt từ điểm cuối; vắng prop thì đầu ra y hệt hôm nay)
- Modify: `packages/ui/test/target-line-chart.dom.ts` (thêm ca, giữ ca cũ)
- Modify: `apps/app/app/(app)/[slug]/okr/hop-thoai-cap-nhat-kr.tsx` (khối `XemTruoc`: `okr.dienBien({ keyResultId })` + `previewPoint` = giá trị đang gõ; dòng «tiến độ mới» từ `tienDoKr` của `@crm/validation/okr-kr`; KR mốc không vẽ)
- Modify: `apps/app/lib/messages/okr.ts` (chỉ thêm `capNhat.xemTruoc`, `capNhat.tienDoMoi(n)`)

**Interfaces:**
- Consumes: Task 1 hộp.
- Produces: `TargetLineChart` prop `previewPoint`.

- [ ] Test `vk7-xem-truoc` đúng `expected` của E9 (ba kiểu KR, `tienDoKr` thật, đối chứng đỏ «thieu diem moi»). Test ở `packages/ui`: có prop → đúng một `[data-diem-moi]`; vắng → không có.
- [ ] Chạy đỏ → làm → xanh. Chạy `toan-canh-okr` E16 (`target-line-chart.dom.ts`) xanh.
- [ ] Commit `feat(ngan-kr-mot-cho): hộp cập nhật xem trước điểm mới`.

independent: true (sau Task 1) · phục vụ E9

### Task 3: Ngăn KR — đầu ngăn, ‹ ›, thân ngăn

**Files:**
- Modify: `apps/app/components/crm/record-sheet/kr-sheet.tsx` (`KrSheet`, `KhungKr`)
- Modify: `apps/app/components/crm/record-sheet/so-kr-sheet.tsx` (xuất phần thân `NoiDungSoKr({ keyResultId })` để nhúng; `SoKrSheet` giữ chạy cho tới Task 4)
- Modify: `apps/app/lib/messages/okr-canh-kr.ts` (chỉ thêm `khung.{krTruoc,krKe,dem(n,N),capNhat,hienTai,tienDo,lichSu,viecBangChung,soNguon,chiTiet,khongThay,loiTai}`)
- Test: `apps/app/test/ngan-kr-mot-cho.dom.tsx`

**Interfaces:**
- Consumes: `useCapNhatKr`, `coTheCapNhat` (Task 1); `useRecordStack().thayDinh`.
- Produces: thân ngăn có `data-muc-ngan` ∈ `so, tien-do, lich-su, viec-bang-chung, so-nguon, chi-tiet`; nút có `aria-label` = `khung.krTruoc` / `khung.krKe`; prop/param mở thẳng mục Số và nguồn: `useRecordSheetView` tab `so-nguon`.

- [ ] Tests `vk7-dau-ngan` (E2), `vk7-than-ngan` (E3), `vk7-kr-ke` (E4, spy mount `RecordSheetHost` === 1), `vk7-cap-nhat-ngan` (E5, trpc giả trả dữ liệu mới sau mutation, bài không tự invalidate), `vk7-hep` (E10), `vk7-trang-thai` (E11) — đúng `expected` trong `evals.yaml`.
- [ ] Đỏ → làm: đầu ngăn dùng `DetailSheetHeader` ô `actions`; thân bọc trong `div` thường (bẫy `StatGroup` co trong `SheetBody` flex — sổ design-pass); lịch sử dùng `okr.dienBien`; ‹ › tắt khi `okr.objective` chưa về.
- [ ] Chạy `canh-kr-okr` E13 (`ckr_khung_kr_dom`) xanh.
- [ ] Commit `feat(ngan-kr-mot-cho): ngăn KR có Cập nhật ở đầu và sang KR kế`.

independent: false · phục vụ E2, E3, E4, E5, E10, E11

### Task 4: Mọi lối mở cùng ngăn KR

**Files:**
- Modify: `apps/app/components/crm/record-sheet/dien-bien-kr.ts` (`useMoDienBien` → mở `{ kind: "kr", id }`; giữ `useKrDienBien` cho tab Diễn biến)
- Modify: `apps/app/app/(app)/[slug]/okr/bang-kr.tsx` (`data-so-kr` → mở `kr` ở mục Số và nguồn)
- Modify: `apps/app/components/crm/record-sheet/so-kr-sheet.tsx` + chỗ host gọi `so-kr` (gỡ mọi `openRecord({ kind: "so-kr" })`; kind `so-kr` còn trong `RECORD_KINDS` — `record-stack.ts` ngoài ranh giới — đường cũ `?record=so-kr:<id>` vẫn mở được)
- Create: `_acceptance/ngan-kr-mot-cho/rang/quet-loi.mjs` + `_acceptance/ngan-kr-mot-cho/rang/moi/` (thư mục mồi)

**Interfaces:**
- Consumes: Task 3 mục `so-nguon`.

- [ ] Test `vk7-moi-loi` (E1: ma trận bảy lối) + `quet-loi.mjs` (phân tích TS bằng `typescript` của kho; số lối quét === số ô; mồi ra đúng hai dòng).
- [ ] Đỏ → làm → xanh.
- [ ] Commit `feat(ngan-kr-mot-cho): mọi lối bấm KR mở cùng một ngăn`.

independent: false · phục vụ E1

### Task 5: Nút Cập nhật trên dòng KR ở trang đơn vị

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/theo-don-vi/bang.tsx` (ô cuối của dòng con KR: `NutCapNhatDong({ objectiveId, kr })` — `useQuery(okr.objective({ id }))`, hiện khi `coTheCapNhat`; dưới `md` trong danh sách)
- Test: `apps/app/test/ngan-kr-mot-cho.dom.tsx`

**Interfaces:**
- Consumes: `useCapNhatKr`, `coTheCapNhat`.

- [ ] Tests `vk7-tren-dong` (E6) và `vk7-ba-bam` (E8: đếm pointer click === 3 cho KR số, 4 cho KR mốc; item `toEqual`).
- [ ] Đỏ → làm → xanh. Chạy `trang-don-vi-mot-bang` E6 (`okr-trang-don-vi.dom.tsx`) xanh.
- [ ] Commit `feat(ngan-kr-mot-cho): nút Cập nhật trên dòng KR`.

independent: false · phục vụ E6, E8

### Task 6: Ghi thật ở máy chủ

**Files:**
- Create: `apps/api/test/ngan-kr-mot-cho.spec.ts`
- Modify: `apps/app/app/(app)/[slug]/okr/hop-thoai-cap-nhat-kr.tsx` (xuất hàm dựng payload `mucGui(kr, o, bangChung)` mà nút Gửi dùng — để E7 dựng đầu vào bằng chính nó)

- [ ] Test `vk7-ghi-that` đúng E7 (CSDL kiểm thật, đếm lần cập nhật trước/sau, thiếu tự tin bị từ chối).
- [ ] Chạy qua `bun run test -- "cd apps/api && bun test test/ngan-kr-mot-cho.spec.ts -t vk7-ghi-that"`.
- [ ] Commit `test(ngan-kr-mot-cho): cập nhật từ hộp ghi thật`.

independent: true (sau Task 1) · phục vụ E7

### Task 7: Thước của vòng và hồ sơ đã ký

**Files:**
- Modify: `_acceptance/config.yaml` (chỉ thêm `executors.test.vk7_*` và `executors.script.vk7_man`, `vk7_giu_ho_so`, theo khuôn dòng `dh5_*`)
- Create: `_acceptance/ngan-kr-mot-cho/rang/man.mjs` (E12, theo `_acceptance/so-do-quanh-muc-tieu/rang/man.mjs`), `rang/giu-ho-so.mjs` + `rang/anh-xa-nghi.json` (E13)
- Modify (khuôn luật 21): `evals.yaml` của hồ sơ đã ký mà E13 in `DO` — mỗi hồ sơ một dòng sổ `fix` `decided_by: Phan Le Manh`

- [ ] Chạy `bun _acceptance/ngan-kr-mot-cho/rang/giu-ho-so.mjs`; với mỗi `DO`: đổi đúng chỗ đo màn cũ sang ngăn KR, hoặc khai nghỉ `superseded_by`; đo hai chiều; ghi ánh xạ.
- [ ] Gửi `cham-tep` cho mọi `evals.yaml` đã ký bị chạm (qua lệnh `yeu-cau cham-tep` của đợt).
- [ ] Commit `test(ngan-kr-mot-cho): thước màn thật và giữ hồ sơ đã ký`.

independent: false (cuối cùng) · phục vụ E12, E13
