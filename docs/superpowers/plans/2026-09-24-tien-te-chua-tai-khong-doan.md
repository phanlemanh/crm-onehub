# Đồng tiền chưa tải thì không đoán — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Hai ô số tiền thoả thuận không đọc số hay lưu theo đồng tiền đoán khi thiết lập tiền tệ chưa tải hoặc tải lỗi.

**Architecture:** `MoneyInput` nhận `currency: string | null` và câu `missingCurrency`; tấm tạo bỏ dự phòng `"USD"`, chặn gửi khi có số mà chưa biết đồng tiền; thêm nhanh mở nút Tạo khi tải lỗi, thêm nút Thử lại.

**Spec:** `docs/superpowers/specs/2026-09-24-tien-te-chua-tai-khong-doan-design.md` · hợp đồng `_acceptance/tien-te-chua-tai-khong-doan/contract.md`

## Global Constraints

- Không chú thích trong code; `/packages/ui` là nguồn UI; câu mới đủ vi và en; mọi phép đo mới có cặp hai chiều và thông điệp ghim.
- Giữ hai hành vi của hồ sơ trước: nút Tạo của tấm tạo không khoá vì số tiền; nút Tạo của thêm nhanh khoá khi đang tải.

## Review Focus

1. Thiết lập về SAU khi người đã chọn đồng tiền — đồng người chọn thắng (Task 2, ô chon-USD của ma trận).
2. Thử lại thất bại lần nữa — nút Thử lại vẫn còn, câu lỗi vẫn còn (Task 3).
3. Người gõ số rồi xoá hết khi tải lỗi — dòng biến mất, Tạo gửi không kèm currency (Task 3, ca để trống).

---

### Task 1: `MoneyInput` biết «chưa biết đồng tiền» — phục vụ E7 · independent: false
Files: `packages/ui/src/components/money-input.tsx`, `packages/ui/src/lib/messages.ts`, test `packages/ui/test/money-input.dom.tsx` (`describe("chua-biet")`).
Produces: `currency: string | null`, `missingCurrency?: string`.
Verify: `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/money-input.dom.tsx` + phá-thử.

### Task 2: Tấm tạo — phục vụ E1, E2, E3, E10 · independent: false
Files: `apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx`, `apps/app/lib/messages/deals.ts`, test `apps/app/test/tien-te-chua-tai.dom.tsx`.
`knownCurrency = currency || workspaceCurrency || null`; ô chọn `value={knownCurrency ?? ""}` + placeholder; Tạo: có số mà chưa biết → focus ô chọn; gửi `currency: knownCurrency ?? undefined`.

### Task 3: Thêm nhanh — phục vụ E4, E5, E6 · independent: false
Files: `apps/app/components/crm/record-sheet/quick-add.tsx`, `apps/app/lib/messages/record-sheet.ts`, cùng tệp kiểm.
`ready` = tên ∧ (đã biết đồng tiền ∨ tải lỗi); tải lỗi → nút Thử lại (`settings.refetch()`) ở ô `end`; có số mà chưa biết → focus ô số tiền.

### Task 4: Thước của hồ sơ — phục vụ E8, E9, E10, E11, E12 · independent: false
Files: `_acceptance/tien-te-chua-tai-khong-doan/rang/man-that.mjs`, `rang/soi-ma.mjs`. Chiều đỏ trên bản trước vòng (PR #114).

### Task 5: Bộ chứng của kho + ghim lại hồ sơ trước
`bun run test`, `check-types`, `lint`, `lint:slop`, `build`; đặt `implemented`.
