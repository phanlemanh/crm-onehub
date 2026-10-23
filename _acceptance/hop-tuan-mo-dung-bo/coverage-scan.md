# Quét độ phủ — hop-tuan-mo-dung-bo (preset entity-feature)

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub, khu Mục tiêu (OKR).
- Chân sản phẩm: đào kho — `CONTEXT.md` (Đơn vị, Trưởng đơn vị, Họp tuần, Bộ OKR),
  `apps/api/src/okr/okr-access.service.ts`, hồ sơ VK3 `trang-bo-okr`.
- Chân ngành: Tability — plan của đội mở đúng đội, bốn ô số đầu plan. Chụp thật trong không gian «onehub» ngày 22/10,
  ghi ở `docs/plan/pham-vi-okr-hop-tuan-2210.md`.

## Trục

- **Trục A — người xem** [thước CE: `okr-access.service.ts:80-104` — bốn tập quyền `quanTriChuongTrinh`,
  `truongBoPhan`, `truongPhongBan`, `phongBanChinh`]:
  - trưởng phòng ban · trưởng bộ phận · dẫn bộ phận và phòng ban · dẫn hai phòng ban;
  - quản trị không dẫn · quản trị kiêm trưởng;
  - thành viên có phòng ban chính · thành viên không phòng ban · trưởng đã rời.

  Nguồn: [SUY-TỪ-REPO: apps/api/src/okr/okr-access.service.ts].
- **Trục B — đường vào** [thước CE: báo cáo dò đường vào trên `onehub` và VK3 —
  `thanh-ben-muc-tieu.tsx`, `the-con.tsx`, `next.config.ts:52-54`, `nhac-ke-hoach.ts:183-190`]:
  - thanh bên;
  - thẻ con (mang `donOkr`);
  - `bo-okr` trần có hoặc không `kyOkr`;
  - `theo-don-vi` cũ trần;
  - `donOkr=goc` tường minh;
  - tin sáng (mang `donOkr=pb:`).

  Nguồn: [SUY-TỪ-REPO: apps/app/next.config.ts].
- **Trục C — trạng thái bộ** [thước CE: nhánh trạng thái của `hop-tuan.tsx:220-282` + pha chu kỳ `PHA_CHUYEN_DUOC`
  + `[NGÀNH: Tability]` plan rỗng nói lý do]:
  - chu kỳ chưa chạy;
  - chưa KR công bố, có đơn vị trực thuộc có KR;
  - chưa KR công bố, không đơn vị trực thuộc có KR;
  - có KR, chưa ai cập nhật;
  - có cập nhật, không dòng đáng bàn;
  - có cập nhật, có dòng đáng bàn.

## Không gian

A × B: mọi đường vào mang `donOkr` (thẻ con, `goc`, tin sáng) không phụ thuộc A — một ô «không chuyển» cho mọi người
xem. Còn lại, ba đường vào không kèm đơn vị × 9 người xem = 27 ô.

- Hàm chọn bộ phủ 9 người xem.
- Đường vào chỉ đổi URL trước khi gọi hàm, nên 3 đường × 1 người xem đủ cho phần chuyển hướng.

C: 6 ô, độc lập với A, B khi bộ đã chọn.

## Core

1. Hàm chọn bộ × 9 người xem (AC-2) — luật lõi của H1; mỗi ô là một nhánh.
2. Ba đường vào không kèm đơn vị × trưởng phòng ban, trên màn thật (AC-1) — đúng ca production 22/10.
3. Đường mang `donOkr` không bị chuyển (AC-2) — chặn đảo nghĩa liên kết đã chọn bộ.
4. Thanh bên có mục và trạng thái mở (AC-3) — «từ thanh bên» của `bat_khi`.
5. Hàng số × có cập nhật (AC-4, AC-5) — H4.
6. Ba trạng thái rỗng có lý do (AC-6, AC-7) — H2.

## Later

- Kiểu xem khác không kèm `donOkr` mở bộ người xem — chưa có báo lỗi; giữ luật VK3.
- Nhớ bộ chọn lần trước.

## Never

- Thẻ con nhảy sang bộ người xem dẫn — phá VK3 AC-5 (thẻ con giữ bộ đang xem).
- Liệt kê người chưa cập nhật trên Họp tuần — `CONTEXT.md` «Họp tuần»: bảng xếp theo KR, không liệt người.

## Cross-cutting áp mọi ô Core

- Tải: đang tải · lỗi `hopTuan` · lỗi `boHopTuan` → AC-8.
- Ngày chu kỳ: trước bắt đầu · giữa · ngày cuối · đã qua → AC-5.
- Quyền thấy: mục tiêu hạn chế ở đơn vị trực thuộc → AC-6.
- Khổ 1440 · 375, sáng · tối → AC-9.
- Hồ sơ đã ký → AC-10.
