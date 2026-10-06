# «Thử lại» sau 45 giây — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** «Thử lại» khi phiên bận huỷ lượt qua cửa, dừng luồng, chờ cả lượt cũ khép lẫn hồi âm huỷ rồi gửi lại đúng một lần; gửi không được thì nói ra.

**Architecture:** Toàn bộ thay đổi nằm trong hook `dung-cuoc-soan.ts` (ref `choGuiLai` hai cờ, hẹn giờ trần, cờ `loiGuiLai`), một câu mới trong `LuotLoi`, một hằng `SOAN_UI.choKhepMs`. Cửa không đổi.

**Tech Stack:** React hook, eve 0.29.4 (`useEveAgent` `onFinish`, `EveAgentStore`), bun test + jsdom, puppeteer qua `mot-luot.sh`.

**Spec:** `docs/superpowers/specs/2026-10-04-thu-lai-sau-45-giay-design.md`; hợp đồng `_acceptance/thu-lai-sau-45-giay/contract.md`.

## Global Constraints

- Không chú thích trong mã; không `useEffect`; số chỉnh được trong `SOAN_UI`.
- Không sửa `khung-soan-okr.tsx`, `khung-cua-hoan.ts`, tệp kiểm của hồ sơ đã ký, `route.ts`.
- `lib/messages/okr-soan.ts` chỉ thêm khoá; không thêm mã vào `MA_LY_DO_HONG`.

## Review Focus

1. Hai điều (khép, hồi âm huỷ) tới theo mọi thứ tự, kể cả cùng một vi tác vụ — gửi đúng một lần (Task 2).
2. Hẹn giờ trần nổ sau khi đã gửi lại — không bật «Chưa gửi lại được» oan (Task 2).
3. Bấm «Thử lại» lần nữa khi đang chờ — nút đã khoá, không tạo chuỗi chờ thứ hai (Task 2).
4. Yêu cầu huỷ ném lỗi mạng — vẫn tính là «đã có hồi âm» để không treo (Task 2).
5. Thân lỗi từ cửa khi huỷ — không làm hiện chỗ báo lỗi mới (Task 2).

### Task 1: Bài store eve thật (E9) và bài cửa huỷ (E5) — independent: true

Files: Create `apps/app/test/soan-okr-store-eve-huy.spec.ts`, `apps/app/test/soan-okr-huy-luot.spec.ts`.
Verify: `tl45_store_eve_that`, `tl45_huy_cua` xanh ngay (đo hành vi sẵn có — thước của tiền đề); phá thử ghim `onfinish-khong-goi`, `huy-tinh-luot`.
Phục vụ: E9 (AC-2), E5 (AC-5).

### Task 2: Hook «Thử lại» khi bận (E1–E4) — independent: false

Files: Modify `dung-cuoc-soan.ts`, `hoi-thoai-soan.tsx`, `cau-hinh.ts` (`choKhepMs: 15_000`), `lib/messages/okr-soan.ts` (`hoiThoai.chuaGuiLai` vi/en). Create `apps/app/test/soan-okr-thu-lai-45s.dom.tsx`.
Bước: viết bài DOM đỏ trước (huy-truoc-gui, gui-lai-sau-khep ba ca, dang-cho-khep + trần, gui-lai-bi-tu-choi hai nhánh); cài:

```ts
const choGuiLai = useRef<{ tin: string; daKhep: boolean; daHuy: boolean } | null>(null);
const thuGuiLai = () => {
	const cho = choGuiLai.current;
	if (!cho || !cho.daKhep || !cho.daHuy) return;
	choGuiLai.current = null;
	setDangChoKhep(false);
	void guiThang(cho.tin);
};
```

`onFinish` đặt `daKhep = true` rồi `thuGuiLai()`; `fetch(<host>/eve/v1/session/<phiên>/cancel, POST, okrSoanHeader)` `.finally` đặt `daHuy = true` rồi `thuGuiLai()`; hẹn giờ `choKhepMs` bỏ tin chờ và bật `loiGuiLai` nếu `choGuiLai.current` còn. `guiThang` bắt lỗi → `setLoiGuiLai(true)`; gửi qua → tắt.
Verify: bốn lệnh `tl45_*` dom xanh; `tl45_giu_r1h`; `messages-guard`; phá thử từng chiều đỏ đã khai trong evals.
Phục vụ: E1, E2, E3, E4, E6, E8.

### Task 3: Đo màn thật (E7) — independent: false

Files: Create `_acceptance/thu-lai-sau-45-giay/rang/thu-lai-45s-man-that.mjs` (khung từ `soan-okr-khong-tru-luot/rang/thu-lai-man-that.mjs`).
Verify: `tl45_man_that` qua `mot-luot.sh` hai khổ; `--kiem-do-do` mã 1 với 'khong thay qua 45 giay'.
Phục vụ: E7.
