---
schema_version: 1
feature: Màn Kết nối › Zalo in «trả lời lần cuối» theo múi giờ của xưởng (Asia/Ho_Chi_Minh) thay vì giờ UTC của máy chủ
slug: zalo-gio-theo-mui-gio-xuong
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
design_doc: docs/superpowers/specs/2026-09-25-zalo-gio-theo-mui-gio-xuong-design.md
approved_by:
approved_at:
---

# Acceptance Contract: zalo-gio-theo-mui-gio-xuong

## Context

Thử production 25/09: `zalo.xuong` trả `pollCuoi` `2026-09-24T22:27:04Z` (05:27 sáng 25/09 giờ
Việt Nam), nhưng màn Kết nối › Zalo in «trả lời lần cuối lúc 22:27 24-09» — trang render ở máy
chủ Vercel (UTC) và `ngayGio` không khai múi giờ. Quản trị viên đọc nhầm là tác tử im bảy tiếng.
Source input: prompt · lượt thử production 25/09 trong phiên · design doc ở `design_doc`.

## Criteria

- AC-1: Given tiến trình chạy `TZ=UTC` và thời điểm `2026-09-24T22:27:04Z`, When định dạng bằng `ngayGio` với múi giờ `NHAC.muiGio` ở ngôn ngữ vi và en, Then mỗi chuỗi bằng đúng chuỗi của `Intl.DateTimeFormat` cùng ngôn ngữ, cùng tuỳ chọn, `timeZone: "Asia/Ho_Chi_Minh"`; chứa «05:27» và «25»; không chứa «22:27».
- AC-2: Given tiến trình chạy `TZ=UTC`, When định dạng `2026-09-24T16:59:00Z` và `2026-09-24T17:00:00Z` bằng `ngayGio` với `NHAC.muiGio` ở vi và en (4 ô), Then 16:59Z ra «23:59» ngày 24 và 17:00Z ra «00:00» ngày 25, mỗi ô bằng chuỗi đối chứng giờ VN.
- AC-3: Given app và api của cây đang xét, máy chủ app chạy `TZ=UTC` như Vercel, `AppSetting.zaloPolledAt` = `2026-09-24T22:27:04Z`, When quản trị viên mở Kết nối › Zalo ở khổ 1440 và 375, Then dòng trạng thái bot có «trả lời lần cuối lúc» kèm «05:27» và «25», không có «22:27».

## Coverage

Quét bằng `morphological-scan` (`_acceptance/zalo-gio-theo-mui-gio-xuong/morphological-scan.md`).

- Trục A — ngôn ngữ màn: vi | en [thước CE: `LocaleProvider`, hai bộ chữ `nhac-qua-zalo.ts`]
- Trục B — thời điểm so với nửa đêm giờ VN: cùng ngày | qua ngày | ca production [thước CE: độ lệch cố định +07:00 của `Asia/Ho_Chi_Minh`]
- Trục C — nơi định dạng: máy chủ | trình duyệt [thước CE: `"use client"` trong `khoi-zalo.tsx`]
- Ánh xạ Core → tiêu chí: máy chủ × {vi, en} × ca production → AC-1 · máy chủ × {vi, en} × biên nửa đêm → AC-2 · màn thật với máy chủ UTC → AC-3
- `[GIẢ ĐỊNH]` chờ người gạch:
  - (1) Giờ trên màn quản trị nên theo múi giờ xưởng (`NHAC.muiGio`), không theo múi giờ máy người xem — cùng múi giờ với nhắc 08:30.

## Out of scope

- `gioPhut` («Hết hạn lúc» ở Thông báo của bạn): định dạng trong trình duyệt, theo múi giờ máy người xem.
- Cho mỗi người tự chọn múi giờ; đổi `TZ` của project trên Vercel.
- Các lỗi khác thấy khi thử production 25/09 (TLS khi đọc DB, dòng năng lực Zalo in `off`).

## Notes

- `ngayGio` nhận múi giờ là tham số bắt buộc; trình biên dịch bắt chỗ gọi quên nó.
