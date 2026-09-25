# Giờ màn Kết nối › Zalo theo múi giờ xưởng — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `ngayGio` định dạng theo múi giờ truyền vào; trang Kết nối › Zalo truyền `NHAC.muiGio`.

**Architecture:** thêm tham số bắt buộc `muiGio` cho `ngayGio` → `timeZone`; trang máy chủ import `NHAC` từ `@crm/db/onboarding-nhac`.

**Tech Stack:** Next.js (App Router, component máy chủ), `Intl.DateTimeFormat`, bun test.

**Spec:** `docs/superpowers/specs/2026-09-25-zalo-gio-theo-mui-gio-xuong-design.md` · hợp đồng `_acceptance/zalo-gio-theo-mui-gio-xuong/`.

## Global Constraints

- Không chú thích trong mã. Không viết chuỗi `Asia/Ho_Chi_Minh` ở `apps/app` — lấy `NHAC.muiGio`.
- `apps/app/lib/nhac-qua-zalo-man.ts` không import gói máy chủ.
- Định dạng giữ nguyên; chỉ đổi múi giờ.

## Review Focus

1. Tiến trình chạy UTC (Vercel) — test chạy `TZ=UTC` tường minh.
2. Thời điểm qua nửa đêm giờ VN — ngày phải là ngày giờ VN (E2).
3. Định dạng en 12 giờ không đổi (E1, E2 ghim nguyên văn).

---

### Task 1: `ngayGio` nhận múi giờ, trang truyền `NHAC.muiGio`

`independent: false` · phục vụ E1, E2, E3

**Files:**
- Create: `apps/app/test/zalo-gio-theo-mui-gio-xuong.spec.ts`
- Modify: `apps/app/lib/nhac-qua-zalo-man.ts` (`ngayGio`)
- Modify: `apps/app/app/(app)/[slug]/settings/connections/zalo/page.tsx:40`

- [ ] **Step 1: Test** — `describe("ca-production")` 2 ô vi/en cho `2026-09-24T22:27:04Z` → `05:27 25-09`, `09/25, 05:27 AM`; đối chứng: `new Intl.DateTimeFormat("vi", {…không timeZone}).format(t)` ra `22:27 24-09` (chứng tiến trình UTC). `describe("bien-nua-dem")` 4 ô. Mỗi bảng một `toEqual` với thông điệp ghim.
- [ ] **Step 2: Đỏ** — `cd apps/app && TZ=UTC bun test ./test/zalo-gio-theo-mui-gio-xuong.spec.ts` → lỗi kiểu/đỏ (chưa có tham số).
- [ ] **Step 3: Sửa**

```ts
export function ngayGio(locale: string, luc: string | Date, muiGio: string): string {
	return new Intl.DateTimeFormat(locale, {
		day: "2-digit",
		month: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		timeZone: muiGio,
	}).format(new Date(luc));
}
```

`page.tsx`: `import { NHAC } from "@crm/db/onboarding-nhac";` và `ngayGio(locale, xuong.pollCuoi, NHAC.muiGio)`.
- [ ] **Step 4: Xanh + phá thử** — test xanh; bản sao bỏ `timeZone` → đỏ với thông điệp ghim; `bun run check-types`, `bun run build` (trang máy chủ import `@crm/db`).
- [ ] **Step 5: Commit** `fix(app): giờ màn Kết nối › Zalo theo múi giờ xưởng`.
