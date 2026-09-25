## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub, một xưởng ở Việt Nam. Chân sản phẩm: đào repo
  (`apps/app/lib/nhac-qua-zalo-man.ts` hàm `ngayGio`, trang
  `apps/app/app/(app)/[slug]/settings/connections/zalo/page.tsx`, hằng `NHAC.muiGio` =
  `Asia/Ho_Chi_Minh` trong `packages/db/src/onboarding-nhac.ts`). Chân ngành: Web Interface
  Guidelines của Vercel — «Dates/times: use `Intl.DateTimeFormat`» và «guard against hydration
  mismatch (server vs client)»; Vercel Functions chạy với `TZ=UTC`.

## Trục

- Trục A — ngôn ngữ màn: vi | en [thước CE: `LocaleProvider`, hai bộ chữ `nhac-qua-zalo.ts`]
- Trục B — thời điểm UTC so với nửa đêm giờ VN: cùng ngày (UTC 16:59 → VN 23:59) | qua ngày
  (UTC 17:00 → VN 00:00 hôm sau) | ca lỗi thật đo trên production (UTC 22:27 24-09 → VN 05:27 25-09)
  [thước CE: độ lệch cố định +07:00 của `Asia/Ho_Chi_Minh`, không có giờ mùa hè]
- Trục C — nơi định dạng: máy chủ (trang Kết nối › Zalo, `ngayGio`) | trình duyệt (`gioPhut` ở
  Thông báo của bạn) [thước CE: `"use client"` trong `khoi-zalo.tsx`]

## Core

1. Máy chủ × {vi, en} × {cùng ngày, qua ngày, ca production} — lỗi đang thấy.
2. Màn thật chạy máy chủ với `TZ=UTC` như Vercel — chứng dòng «trả lời lần cuối» trên ảnh.

## Later

- `gioPhut` («Hết hạn lúc» ở Thông báo của bạn) định dạng trong trình duyệt theo múi giờ máy
  người xem — đúng cho người ở VN; thống nhất theo múi giờ xưởng là việc riêng nếu có người
  xem từ múi giờ khác.

## Never

- Cho mỗi người tự chọn múi giờ — xưởng một múi giờ, nhắc 08:30 đã theo `NHAC.muiGio`.

## Cross-cutting áp mọi ô Core

- Múi giờ lấy từ một nguồn (`NHAC.muiGio`), không viết chuỗi `Asia/Ho_Chi_Minh` lần hai.
- Tệp client không import `@crm/db`.
