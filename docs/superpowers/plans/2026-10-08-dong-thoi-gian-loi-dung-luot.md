# K6e dong-thoi-gian-loi-dung-luot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hai thông báo lỗi của tab Hoạt động chỉ đổi khi một lượt tải đã xong, theo đúng lượt đã hỏng.

**Architecture:** Một hàm `useLoiTheoLuot(history, khoa)` trong `timeline.tsx` giữ hai cờ `xemCu`, `lamMoi`; cập nhật trong `useEffect` khi `!isFetching`, nhận lỗi mới bằng `errorUpdateCount`, nhận thành công bằng `dataUpdatedAt` + số trang. Thông báo «xem cũ» đọc `xemCu` thay cho `isFetchNextPageError`, thông báo «làm mới» đọc `lamMoi` thay cho `isRefetchError`.

**Tech Stack:** TanStack Query 5.101, React 19, bun test + jsdom.

**Spec:** `docs/superpowers/specs/2026-10-08-dong-thoi-gian-loi-dung-luot-design.md` · hợp đồng `_acceptance/dong-thoi-gian-loi-dung-luot/contract.md` · evals `_acceptance/dong-thoi-gian-loi-dung-luot/evals.yaml`.

## Global Constraints

- Không chú thích trong mã. Chỉ sửa `apps/app/components/crm/timeline/timeline.tsx` và tạo `apps/app/test/dong-thoi-gian-loi-dung-luot.dom.tsx`.
- Bài DOM chỉ so giá trị nguyên thuỷ; tệp mới chạy lần đầu dưới trần và đo RSS (luật 35); mỗi bài đặt lại đồng hồ thật bằng `setSystemTime()`.
- Không `typeof` lúc chạy (lint:slop).

## Review Focus

1. Quay lại tab đang lỗi trong cache khi staleTime > 0 — E4 ô quay lại.
2. Hai lỗi liên tiếp trong cùng mili-giây — dùng `errorUpdateCount`.
3. Thông báo nháy một commit trước khi effect chạy — đếm bằng MutationObserver (E1, E2).
4. Các bài K6c chạy lại không sửa (E5) — `nutCo(showOlder) === null` khi đang có thông báo «xem cũ».
5. Thử lại «xem cũ» đang chạy: thông báo giữ, nút tắt.

---

### Task 1: useLoiTheoLuot + bài DOM

**Files:**
- Modify: `apps/app/components/crm/timeline/timeline.tsx`
- Create: `apps/app/test/dong-thoi-gian-loi-dung-luot.dom.tsx`

- [ ] **Step 1: Viết bài (đỏ trước)** — bốn test `dtl-lam-moi-roi-xem-cu`, `dtl-xem-cu-roi-lam-moi`, `dtl-thu-lai-lam-moi`, `dtl-doi-tab` đúng `expected` của E1–E4; promise do bài giữ (`hoan()` trả `{p, giai, tuChoi}`), `demChen(sel)` bằng MutationObserver.
- [ ] **Step 2: Chạy — đỏ đúng thông điệp ghim** `cd apps/app && /usr/bin/time -l perl -e 'alarm 120; exec @ARGV' bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dong-thoi-gian-loi-dung-luot.dom.tsx`
- [ ] **Step 3: Cài hàm**

```tsx
type LoiTheoLuot = { xemCu: boolean; lamMoi: boolean };
const KHONG_LOI: LoiTheoLuot = { xemCu: false, lamMoi: false };
```

`useLoiTheoLuot` giữ `useState<{ khoa; loi }>` và `useRef<{ khoa; loi: number; du: number; soTrang: number }>` (mốc «chưa thấy gì»: `loi -1, du 0, soTrang 0`, đặt lại khi `khoa` đổi). Trong `useEffect`: bỏ qua khi `isFetching` hoặc chưa có dữ liệu; `isError` và `errorUpdateCount` khác mốc → bật `xemCu` nếu `isFetchNextPageError`, ngược lại `lamMoi`; thành công và `dataUpdatedAt` khác mốc → số trang tăng (và mốc đã có dữ liệu) thì tắt `xemCu`, ngược lại tắt cả hai. Trả `KHONG_LOI` khi `state.khoa !== khoa`.

- [ ] **Step 4: Nối vào màn** — `khoa = JSON.stringify([anchor, tab])`; thông báo làm mới khi `loi.lamMoi`; cuối danh sách: `loi.xemCu` → thông báo «xem cũ», ngược lại nút «Xem cũ hơn».
- [ ] **Step 5: Xanh** — bài mới, `dong-thoi-gian-giu-khi-loi.dom.tsx`, `kara-trang-thai-vung.dom.tsx -t dong-thoi-gian`, `tsc`, `lint:slop`, biome.
- [ ] **Step 6: Phá thử** sau commit — (a) dùng lại cờ của lượt đang chạy → «dtl: thong bao xem cu hien khi dang tai», «dtl: canh bao lam moi hien khi dang tai»; (b) tắt `lamMoi` khi số trang tăng → «dtl: canh bao lam moi tat sau xem cu»; (c) không đặt lại theo khoa → «dtl: thong bao theo sang tab moi»; (d) mốc lấy giá trị hiện tại khi đổi khoa → «dtl: quay lai tab loi mat thong bao».
- [ ] **Step 7: Commit**

### Task 2: Kiểm toàn kho rồi S4

- [ ] `bun run test`, `check-types`, `lint`, `lint:slop`, `build` xanh; hợp đồng `implemented`.
