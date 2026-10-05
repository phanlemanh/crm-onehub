# Màn «Đã gửi» đếm đúng KR còn chờ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`).

**Goal:** `DaGui` chỉ báo «K KR … vẫn chờ» với K = KR chưa cập nhật tuần này và không có trong lượt gửi.

**Architecture:** một biểu thức ở chỗ gọi `DaGui` trong `BangCapNhat`; không đổi chữ, không đổi API.

**Tech Stack:** React client component, bun test + jsdom.

**Spec:** `docs/superpowers/specs/2026-10-04-da-gui-dem-dung-kr-cho-design.md` · `_acceptance/da-gui-dem-dung-kr-cho/{contract.md,evals.yaml}`

## Global Constraints

- Không viết chú thích trong mã. Không đổi chữ trong `lib/messages`. Chỉ `okr/cap-nhat-tuan/**` và test của nó.
- So giá trị nguyên thuỷ trong `toEqual` (không đặt phần tử DOM vào object so).

## Review Focus

1. Lượt gửi có cả KR đã gửi trước (AC-6) — không trừ hai lần.
2. Mock `guiCapNhat` phải trả `written` bằng số dòng gửi, nếu không tiêu đề «Đã gửi N» luôn là 1.

### Task 1: Ma trận «da gui dem dung» + sửa phép đếm (E1–E4, E6) · independent: false

**Files:** Modify `apps/app/test/okr-cap-nhat-tuan.dom.tsx` (mock trả `written = items.length`; describe mới), `apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan.tsx` (biểu thức `chuaGui`).

- [ ] Viết describe «man cap nhat tuan: da gui dem dung», 6 ô × 3 cột (tập id gửi, tiền tố tiêu đề `daGui.title(N, …)`, câu `daGui.conCho(K)`), in số khẳng định = 18.
- [ ] Chạy `config:executors.test.r1c_dg_da_gui_dom` → ĐỎ (ô AC-1, AC-2 có câu chờ; AC-6 ra conCho(2)).
- [ ] Sửa: `chuaGui={duLieu.items.filter((kr) => !kr.updatedThisWeek && !daGui.dong.some((d) => d.kr.keyResultId === kr.keyResultId)).length}`.
- [ ] XANH; chạy cả tệp; phá-thử (a) công thức cũ → AC-1 đỏ, (b) trừ hai lần → AC-6 đỏ, (c) `chuaGui = 0` → AC-4a đỏ.
- [ ] `config:executors.test.r1c_dg_san_thiet_ke` xanh; commit.
