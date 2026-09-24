# Một tên cho đồng tiền báo cáo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans.

**Goal:** Tấm tạo thoả thuận gọi thiết lập là «đồng tiền báo cáo» như Cài đặt và thêm nhanh; từ điển có mục cho khái niệm này.
**Spec:** `docs/superpowers/specs/2026-09-24-ten-dong-tien-bao-cao-design.md` · hợp đồng `_acceptance/ten-dong-tien-bao-cao/contract.md`

## Global Constraints
- Không chú thích trong code; câu đủ vi và en; mọi phép đo mới có chiều đỏ ghim thông điệp.

## Review Focus
1. Dấu chấm lửng một ký tự «…» và gạch dài «—» phải giữ đúng như hợp đồng (Task 2 so nguyên văn).

### Task 1: Bài kiểm hai tiếng + thước quét chữ — phục vụ E1, E2, E3, E6 · independent: false
Files: `apps/app/test/tien-te-chua-tai.dom.tsx` (`describe("ten-bao-cao")`, `dung` nhận tiếng), `_acceptance/ten-dong-tien-bao-cao/rang/quet-chu.mjs`. Chạy trên mã cũ → đỏ.

### Task 2: Đổi chữ + từ điển + dòng Notes hồ sơ cũ — phục vụ E1–E3, E6 · independent: false
Files: `apps/app/lib/messages/deals.ts`, `CONTEXT.md`, `_acceptance/tien-te-chua-tai-khong-doan/contract.md` (chỉ Notes).

### Task 3: Cập nhật thước hồ sơ cũ — phục vụ E4, E5 · independent: false
Files: hằng câu trong `apps/app/test/tien-te-chua-tai.dom.tsx`, `_acceptance/tien-te-chua-tai-khong-doan/rang/man-that.mjs`. Chạy làn máy hai hồ sơ trước khi sửa (đỏ) và sau khi sửa (xanh).

### Task 4: Bộ chứng của kho; đặt `implemented`.
