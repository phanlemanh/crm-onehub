## Người dùng thấy gì khác

- Chuông vẫn nhận đủ mọi loại thông báo; Zalo hay Slack chỉ chuyển tiếp những loại người dùng cho phép.
- Trang Nhắc buổi sáng có mục «Loại thông báo»: hai nhóm Cần làm và Để biết, mỗi loại một dòng, cột Chuông luôn bật và
  cột mang tên kênh người đang dùng. Ô bật ra của chuông có nút «Cài đặt thông báo» tới mục này.
- Ai chưa đổi gì thì tin Zalo/Slack buổi sáng giống từng chữ như trước; tin về Kara và tín hiệu đổi chỗ chỉ ra Zalo/Slack
  khi người dùng tự bật — khi bật, tin tới trong khoảng hai phút sau khi thông báo được ghi, mỗi thông báo một lần.
- Chủ kho có khối «kênh ngoài» trong `bun run thong-bao:doi-chieu`: mỗi mục đã ra Zalo/Slack có bản trong chuông không.

## Hồ sơ

`_acceptance/thong-bao-mot-nguon-nhieu-kenh/` — hàng TB2 của `docs/plan/lo-trinh-okr.json` (N3, N4 của
`docs/plan/pham-vi-vong-tin-hieu-1410.md`). Cổng Đáng 19/10, Cổng Phạm vi và Gate 1.5 23/10 (Manh Phan).

## Dữ liệu

Migration chỉ thêm: bảng `caiDatThongBao` (một hàng mỗi người × loại khi khác mặc định) và bốn cột `dayLan`, `dayLuc`,
`dayKenh`, `dayLoi` trên `thongBao`.

## Giao diện — bậc đã dừng (docs/design.md «Vẽ tay là bậc cuối»)

- Mục «Loại thông báo»: dừng ở bậc 1 — `Card`, `SimpleTable` (từ `md`), `Item` (dưới `md`), `Field`, `Switch`,
  `KhungXuong`, `VungTaiLoi` của `packages/ui`; ghép thẻ + bảng theo khuôn `settings/currencies/currency-settings.tsx`.
  Không tra bậc 2–4 vì bậc 1 đủ mọi mảnh.
- Nút «Cài đặt thông báo» trong ô bật ra của chuông: bậc 1 — `Button size="icon" variant="ghost"` bọc `Link`.

## Ngoài vùng của làn

Không chạm `apps/agent/agent/channels/**` (làn Mac Studio). Chạm thêm: trang `reminders/page.tsx` (thêm một mục),
`nhac-ke-hoach.ts`, `schedules/dispatch.ts` (thêm một bước), `lib/trpc/cache.ts` (đổi kênh làm mới cài đặt loại).
