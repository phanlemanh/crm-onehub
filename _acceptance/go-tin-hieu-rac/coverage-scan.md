# Quét độ phủ — go-tin-hieu-rac (TH5)

Preset: `entity-feature` (một loại bản ghi — tín hiệu — thêm một cách dọn). Quét 19/10/2026, không hỏi người (phiên
thợ của đợt lo-trinh-tin-hieu).

## Ngữ cảnh

- Sản phẩm: CRM của OneHub, trang «Tín hiệu đã gửi» với thẻ «Tất cả» cho quản trị (LT2, TH4) và lệnh kéo về của đội
  sản phẩm (LT2, TH1).
- Chân sản phẩm: đào kho — `CONTEXT.md` mục «Tín hiệu», «Lưu trữ», «Đã lưu trữ»; `docs/vong-doi.md`; bảng `tinHieu`
  của `packages/db/prisma/schema.prisma`; `apps/api/src/tin-hieu/tin-hieu.service.ts`; hàng TH5 của
  `docs/plan/lo-trinh-okr.json`.
- Chân ngành: [NGÀNH: Productboard Insights] — lưu trữ một hay nhiều phản hồi, tìm lại bằng bộ lọc trạng thái
  «Archived», bỏ lưu trữ từ cùng menu (support.productboard.com «How can I archive feedback?»); [NGÀNH: Featurebase]
  — kiểm duyệt bài trước khi hiện, duyệt/từ chối/gộp bài trùng; [NGÀNH: Khoros Communities] — đánh dấu bài là rác và
  khôi phục bài đánh nhầm. Canny: tra không ra tài liệu kiểm duyệt rác — không dùng làm chân.

## Trục

- Trục A — Thao tác: lưu trữ | hoàn tác ngay sau khi lưu trữ | khôi phục từ «Đã lưu trữ» | lưu trữ lại bản đã lưu
  trữ | xoá vĩnh viễn | lưu trữ hàng loạt
  [thước CE: ba cách dọn của `docs/vong-doi.md`; NGÀNH: Productboard (archive · unarchive · bulk), Khoros (mark spam ·
  recover)]
- Trục B — Tín hiệu đang ở đâu lúc thao tác: chưa lấy về | đã lấy về | đang lưu trữ | đã bị người gửi xoá | lượt kéo
  về chạy cùng lúc
  [thước CE: cột `keoVeLuc` của bảng `tinHieu`; khoá bảng của `keoVe` và `xoa` trong `tin-hieu.service.ts`]
- Trục C — Ai gọi: chủ · quản trị | thành viên · vai chỉ OKR | người gửi (không phải quản trị) | khoá kéo theo lịch |
  REST bằng khoá API
  [thước CE: `laQuanTriWorkspace`; `KhoaKeoTinHieuMiddleware`; bảng phạm vi router `docs/api.md`]
- Trục D — Chỗ thấy hậu quả: tệp và dấu của lượt kéo về | bảng «Tất cả» và «Đã lưu trữ» | ba ô số | trang của người
  gửi | vết người gỡ
  [thước CE: ngưỡng `bat_khi` của hàng TH5; mục «Danh sách mặc định hiện gì» của `docs/vong-doi.md`]

Cắt ngang mọi ô: bộ chữ «Lưu trữ · Khôi phục · Đã lưu trữ · Hoàn tác» (`CONTEXT.md`); dữ liệu người nhập không dịch;
ca màn (đang làm, lỗi, rỗng, 375 px).

## Không gian (A × B, rồi C, D chiếu lên ô sống)

| A \ B | chưa lấy về | đã lấy về | đang lưu trữ | đã bị xoá | kéo về cùng lúc |
| --- | --- | --- | --- | --- | --- |
| lưu trữ | **Core** | **Core** (từ chối) | **Core** (giữ ngày đầu) | Never — không còn hàng | **Core** (một trong hai thắng) |
| hoàn tác | **Core** | — | — | — | Later |
| khôi phục | — | — | **Core** | — | Never — bản lưu trữ không vào lượt kéo |
| lưu trữ lại | — | — | gộp vào «lưu trữ × đang lưu trữ» | — | — |
| xoá vĩnh viễn | Never | Never | Never | — | — |
| hàng loạt | Later | Later | Later | — | — |

## Core

1. Lưu trữ tín hiệu chưa lấy về — vật chính của câu giao. → AC-1
2. Lượt kéo về bỏ qua tín hiệu đang lưu trữ, cả tệp lẫn dấu — ngưỡng sống. → AC-2
3. Lưu trữ bị từ chối khi đã lấy về, và khi chạy cùng lượt kéo về chỉ một bên thắng. → AC-3
4. Chỉ chủ và quản trị gọi được, qua tRPC lẫn REST. → AC-4
5. Hoàn tác và Khôi phục, mỗi lần đều có vết người làm. → AC-1, AC-5
6. Chỗ tìm lại «Đã lưu trữ» trên thanh công cụ bảng «Tất cả». → AC-6
7. Ba ô số và số đếm bộ lọc chỉ đếm tín hiệu đang dùng. → AC-7
8. Người gửi thấy tín hiệu của mình đã bị lưu trữ. → AC-8

## Later

- Lưu trữ hàng loạt bằng chọn nhiều dòng [NGÀNH: Productboard bulk archive] — mỗi tuần vài tín hiệu rác, một dòng một
  lần bấm đủ dùng; mở lại khi «Đã lưu trữ» quá 20 dòng một tuần.
- Lý do lưu trữ (thử · trùng · nhầm) — chưa ai đọc lý do; mở lại khi Cổng Giá trị cần đếm theo loại rác.
- Báo người gửi khi tín hiệu của họ bị lưu trữ — thuộc dãy thông báo (TB2).
- Kiểm duyệt trước khi tín hiệu vào lượt kéo [NGÀNH: Featurebase post moderation] — đổi mặc định thành «chờ duyệt», đi
  ngược câu giao «gỡ trước khi lấy về».

## Never

- Xoá vĩnh viễn tín hiệu của người khác — hàng TH5 ghi «không xoá hẳn».
- Lưu trữ tín hiệu đã lấy về — tệp đã nằm trong kho sản phẩm; gỡ ở CRM không gỡ được tệp, nên nút ấy nói dối.
- Đưa tín hiệu đã lưu trữ vào lịch dọn tự động 180 ngày — là xoá vĩnh viễn trá hình.

## Cross-cutting áp mọi ô Core

- Bộ chữ của `docs/vong-doi.md`; trạng thái thô không hiện ra màn.
- Tên người, tiêu đề, màn đánh dấu không dịch.
- Nhật ký máy chủ ghi người gọi và mã, không ghi nội dung tín hiệu.
