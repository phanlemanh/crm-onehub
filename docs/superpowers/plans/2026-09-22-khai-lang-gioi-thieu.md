# Kế hoạch — khai-lang-gioi-thieu

Hồ sơ: `_acceptance/khai-lang-gioi-thieu/` (T2, đã duyệt Cổng Phạm vi 2026-09-21T22:25:02Z). Mã AC-1..AC-3 đã có ở `946ef000`; kế hoạch này chỉ phục vụ AC-4 và việc dời fixture của E2 xuống dưới vùng tiếng Việt.

## Task 1 — Khối giới thiệu thành thành phần trình bày, đo bằng bài kiểm của kho

- **Files:**
  - `apps/app/components/crm/record-sheet/record-parts.tsx` — thêm `CompanyAbout({ title, description })`: không dựng gì khi `description` rỗng; ngược lại `DetailSheetSection` + `DetailSheetProse` + `ForeignText lang="en"`.
  - `apps/app/components/crm/record-sheet/company-sheet.tsx` — `CompanyOverview` gọi `CompanyAbout` thay khối dựng tại chỗ; gỡ import thừa.
  - `apps/app/test/khai-tieng-metaline.spec.tsx` — «chieu b» dựng dưới tổ tiên `lang="vi"` và đòi vùng `vi` cho phần không khai; thêm «chieu d» cho `CompanyAbout` (vùng `en` cho đoạn giới thiệu, vùng `vi` cho tiêu đề, không dựng gì khi rỗng).
- **Verify:** `cd apps/app && bun test test/khai-tieng-metaline.spec.tsx` xanh; phá thử — gỡ `ForeignText` khỏi `CompanyAbout` thì «chieu d» đỏ với `Expected: "en"` / `Received: "vi"`; rồi năm lệnh chứng của kho.
- **Phục vụ:** E2 (AC-2), E4 (AC-4).
- **independent:** true (task duy nhất).
