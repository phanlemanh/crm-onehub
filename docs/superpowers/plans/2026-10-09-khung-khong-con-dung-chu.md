# Khung «không còn» không nói chắc nguyên nhân — Implementation Plan

**Goal:** đổi câu mô tả `khung.khongCon.moTa` (vi, en) thành câu không khẳng định nguyên nhân.
**Spec:** `docs/superpowers/specs/2026-10-09-khung-khong-con-dung-chu-design.md` · hợp đồng `_acceptance/khung-khong-con-dung-chu/contract.md`.

### Task 1: Bài kiểm chữ (phục vụ E1) — independent: false
- Create `apps/app/test/khung-loi-ban-ghi-khong-con.dom.tsx` (describe `kkc-chu`, so literal 4 chuỗi giữ nguyên + 2 câu mới + 4 chữ cấm).
- Verify: `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/khung-loi-ban-ghi-khong-con.dom.tsx` → ĐỎ trước khi sửa chữ.

### Task 2: Đổi chữ (phục vụ E1–E6) — independent: false
- Modify `apps/app/lib/messages/kara-ban-ghi.ts` hai dòng `moTa` của `khongCon` (en, vi).
- Verify: Task 1 xanh; `kkc_hoi_quy`, `kkc_canh_chu` xanh; phá-thử: trả câu cũ → «kkc-chu vi: moTa» đỏ; đổi `dong` en → «kkc-chu en: tieu de va nut giu nguyen» đỏ.
