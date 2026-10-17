# Ca kiểm lưu trữ và khôi phục không còn đỏ ngẫu nhiên — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hai ca đếm sự kiện của `tai-lieu-luu-tru.spec.ts` đếm bằng tập id chụp trước lệnh duyệt, không dùng mốc đồng hồ.

**Architecture:** Thay hàm `suKienSau(trangId, moc)` bằng cặp `idSuKien(trangId)` + `suKienMoi(trangId, truoc)`. Thêm ca `tlkp-dem` (hai chiều trên cùng dữ liệu gieo) và `tlkp-tinh` (quét nguồn chính tệp).

**Tech Stack:** bun test, Prisma (`@crm/db`), bộ dựng sẵn `./tai-lieu-san`.

**Spec:** `docs/superpowers/specs/2026-10-16-tai-lieu-khoi-phuc-chap-chon-design.md` · hợp đồng `_acceptance/tai-lieu-khoi-phuc-chap-chon/contract.md` · evals cùng thư mục.

## Global Constraints

- Không viết chú thích trong code (AGENTS.md).
- Chỉ sửa `apps/api/test/tai-lieu-luu-tru.spec.ts`; không chạm mã sản phẩm.
- Cách đếm theo mốc giờ cũ chỉ sống trong thân ca `tlkp-dem`.
- Verify: `bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru.spec.ts"`, rồi `bun run check-types`, `bun run lint`, `bun run lint:slop`.

## Review Focus

- Sự kiện có `luc` ở tương lai sinh trước khi chụp — `tlkp-dem` gieo đúng ca này.
- Sự kiện sinh sau khi chụp phải được đếm — `tlkp-dem` đối chứng dương.
- Mốc viết không dấu cách (`Date.now()-1`) — `tlkp-tinh` mẫu đỏ thứ nhất.
- Thân ca chụp id sau lệnh duyệt — `tlkp-tinh` mẫu đỏ thứ ba.
- Dòng đối chứng chép vào thân ca khôi phục — `tlkp-tinh` mẫu đỏ thứ tư.

---

### Task 1: Hàm đếm theo id và hai ca đã sửa

independent: false · phục vụ E1, E2, E3, E5

**Files:** Modify `apps/api/test/tai-lieu-luu-tru.spec.ts` (hàm `suKienSau` dòng 70; ca dòng 193, 274; thêm ca `tlkp-dem`).

- [ ] Viết ca `tlkp-dem`, chạy với hàm cũ để thấy đối chứng đỏ đúng ghim.
- [ ] Thêm `idSuKien`, `suKienMoi`; bỏ `suKienSau` ở cấp tệp (dời cách đếm cũ vào thân `tlkp-dem`); sửa hai ca.
- [ ] Chạy cả tệp — xanh.
- [ ] Commit `fix(tai-lieu-khoi-phuc-chap-chon): đếm sự kiện của lần duyệt theo id chụp trước`.

### Task 2: Ca quét nguồn `tlkp-tinh`

independent: false · phục vụ E4

**Files:** Modify `apps/api/test/tai-lieu-luu-tru.spec.ts`.

- [ ] Viết hàm quét nhận chuỗi nguồn, trả danh sách vi phạm; ca quét chính tệp (xanh) và bốn mẫu đỏ có ghim.
- [ ] Phá thử: chép dòng mốc cũ vào thân ca khôi phục trong một bản sao → ca đỏ đúng ghim.
- [ ] Chạy cả tệp, `check-types`, `lint`, `lint:slop`.
- [ ] Commit `test(tai-lieu-khoi-phuc-chap-chon): ca quét nguồn chặn mốc đồng hồ quay lại`.
