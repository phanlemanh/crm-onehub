# Số điện thoại ở thoả thuận và tab Cá nhân của công ty — kế hoạch thi công

**Goal:** sale đọc được số của từng người ngay trong ngăn thoả thuận, tab Cá nhân của công ty và ô chọn người khi gắn vào thoả thuận.

**Architecture:** API thêm `phone` vào ba lối đọc đã có (không đổi ghi, không migration). App dùng lại `SoDienThoai` của DT1 cho hai bảng và ô chọn.

**Spec:** `docs/superpowers/specs/2026-10-10-dien-thoai-o-deal-cong-ty-design.md` · hợp đồng `_acceptance/dien-thoai-o-deal-cong-ty/contract.md`.

## Global Constraints

- Không chú thích trong mã; không `className` đổi màu/góc của thành phần `@crm/ui`.
- Số hiển thị qua `SoDienThoai` (DT1), không tự định dạng.
- Chữ mới có cả tiếng Việt có dấu và tiếng Anh khác nhau (messages-guard).

## Review Focus

1. Khổ 375: cột phần trăm 16% chỉ còn ~36 px cho số → cột Điện thoại rộng cố định `w-32`, các cột phần trăm thu lại để tổng vừa 375 (đổi so với design doc: 24/16/18/18/18 % → 19 %/`w-32`/12/12/12 %). E3 ô `deal-bang-375` đo.
2. Người không có số: ô trống chuẩn `EmptyCellValue`, không chuỗi rỗng. E3 dòng Q.
3. Router lọc khoá: schema đầu ra thiếu `phone` thì app nhận `undefined` dù service có — bài API parse qua schema đầu ra.
4. Ô chọn người không có chức danh hoặc không có số: bỏ vế trống, không thừa « · ». E5.
5. Tiếng Anh: hai bảng đều có tiêu đề «Phone». E6.

### Task 1: API trả `phone` (E1, E2)

**Files:** `apps/api/src/deals/deals.service.ts` (`CONTACT_SELECT`), `apps/api/src/deals/deals.contracts.ts` (`dealContactSummaryOutput`), `apps/api/src/companies/companies.service.ts` (select `contacts`), `apps/api/src/companies/companies.contracts.ts` (`companyDetailContactOutput`) · Test: `apps/api/test/dien-thoai-o-deal-cong-ty.spec.ts`.

- [x] Viết bài đỏ: describe `deal-co-so`, `cong-ty-co-so`, fixture qua `ContactsService.create`, parse bằng `dealDetailOutput`, `dealContactOptionsOutput`, `companyDetailOutput`; ghim «deal-co-so: thieu phone», «cong-ty-co-so: thieu phone».
- [x] Chạy: `cd apps/api && bun test test/dien-thoai-o-deal-cong-ty.spec.ts` → đỏ 3/3 với đúng hai câu ghim.
- [x] Thêm `phone` vào bốn chỗ → xanh 3/3.

### Task 2: Hai bảng và ô chọn (E3–E7)

**Files:** `apps/app/lib/messages/record-sheet.ts` (`contactColumns.phone` ×4), `apps/app/components/crm/record-sheet/deal-sheet.tsx`, `company-sheet.tsx`, `quick-add.tsx` · Test: `apps/app/test/dien-thoai-o-deal-cong-ty.dom.tsx`, `_acceptance/dien-thoai-o-deal-cong-ty/rang/do-man.mjs`, `rang/dung-so-chung.mjs`.

- [x] Bài DOM đỏ `chon-nguoi` (ghim «chon-nguoi: thieu so») → thêm vế số vào `SelectItem` → xanh.
- [x] Cột Điện thoại sau Tên ở hai bảng bằng `<SoDienThoai so={…} />`, ô trống `EmptyCellValue`.
- [x] `rang/dung-so-chung.mjs` xanh; `--tu-thu` đỏ «dung-so-chung: tu dinh dang so».
- [x] `rang/do-man.mjs` 6/6 ô (ngăn thoả thuận mở `&tab=contacts`; tràn đo trên ô `td`); chiều đỏ: cột 8 % → «so bi cat o 375», bỏ cột → «thieu cot Dien thoai».
- [x] `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.
