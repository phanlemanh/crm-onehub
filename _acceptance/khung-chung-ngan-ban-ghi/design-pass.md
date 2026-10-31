---
slug: khung-chung-ngan-ban-ghi
at: 2026-10-31T16:40:00Z
route: /proto/khung-chung-ngan-ban-ghi (do:man, cổng tự do của cây)
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (ghim)
options:
divergence: skipped — hướng đã chốt bởi câu giao BK1 và luật 31 «sửa khung, không thoát khung» của gói đợt
ds_skill: repo-tokens
states: [7 đối tượng × dang-tai · loi · du, ST-kr-cu-moi-dang-tai, ST-kr-cu-moi-loi]
breakpoints: [mobile-375, desktop-1280]
themes: [light]
patched: 2
deferred: 2
---
# design-pass — khung-chung-ngan-ban-ghi

Bản mẫu dựng bằng thành phần thật của nhánh: `KhungNgan`, `KhungXuongNgan`, `KhungTaiLoi`, `DetailSheetHeader`,
`DetailSheetStats`, `Tabs`. Mỗi ô là một khung cao cố định bọc trong `Sheet open modal={false}` để có ngữ cảnh của đầu
ngăn mà không mở lớp phủ. Mỗi trạng thái đặt ngăn đang xét cạnh ngăn deal, là màn mẫu. Hai trạng thái
`ST-kr-cu-moi-*` đặt bản chép ngăn KR tự dựng của onehub cạnh ngăn KR trong khung (luật 33).

Chụp bằng `rang/chup-proto.mjs` trong phiên đo (`bun run do:man`): 46 ảnh, 0 ảnh tràn ngang, 0 ảnh thiếu ngăn. Lượt
chụp đầu ra trang lỗi của Next mà không ai biết. Từ lượt thứ hai, răng đếm `[data-ngan-mau]` và ghi `pageerror`, nên
một ảnh trang lỗi làm lệnh thoát mã 1.

## Ma trận capture

Mỗi state chụp ở 1280 và 375, theme sáng: `evidence/design-pass/<state>--<khổ>--light.png`, 23 × 2 = 46 tệp.

## Phát hiện

| # | Thấy gì | Xử lý |
|---|---|---|
| 1 | Ngăn KR cũ chờ tải bằng một khối xám lớn, khác hình ngăn deal | sửa: `KhungXuongNgan` (hình `ngan` của `KhungXuong`) cho cả bảy ngăn |
| 2 | Trang mẫu sập ngoài app thật vì đầu ngăn cần ngữ cảnh Sheet; bài DOM không thấy vì nó luôn bọc `DetailSheet` | sửa: ô mẫu bọc `Sheet open modal={false}`; răng chụp đếm ngăn |
| 3 | Ngăn KR đặt thẻ con Việc · Bằng chứng trong một mục giữa thân, ngăn deal đặt thẻ ngay dưới ô số | hoãn: khung nay có khe `than` để giữ bố cục KR; thống nhất vị trí thẻ là việc riêng |
| 4 | Theme tối chưa chụp | hoãn: khung không thêm màu mới, chỉ dùng token sẵn có |

Lỗi tải của KR dùng mặt «không còn» với nút «Về mục tiêu». Đó là hành vi đã ký ở `ngan-kr-mot-cho`, nên giữ, chỉ đổi
lớp vỏ sang `KhungTaiLoi`.
