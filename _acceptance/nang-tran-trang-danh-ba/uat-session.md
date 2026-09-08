---
schema_version: 1
slug: nang-tran-trang-danh-ba
feature: Bộ gieo đọc danh bạ tới khi cạn thay vì tới một trần đoán, và lộ số điện thoại theo danh sách tầng khai trong cấu hình
owner: omre.cnsp4@onemount.com
stage: scheduled
verdict:
decided_by:
decided_at:
---

# Phiên nghiệm thu — nang-tran-trang-danh-ba

## Ngưỡng đã khai tại Cổng Đáng (CHÉP NGUYÊN VĂN — cấm sửa sau khi thấy số)

Chốt bởi Mạnh, 09/09/2026. Đo bằng ĐÚNG MỘT lượt nạp thật `--limit 200` với cấu
hình đang ship, đọc từ dòng `lượt chạy:` mà lệnh in ra.

| Thước | Đọc ở đâu | Sống | Chết |
| --- | --- | --- | --- |
| Mức Thấp có người thật | `phan_bo_tang.thap` | ≥ 50 trên 200 hồ sơ | < 20 |
| Gọi được người mức thấp | số hồ sơ mức `thap` có trường `phone` | ≥ 30 | < 10 |
| Chi phí một lượt còn chịu được | đồng hồ, và `trang_danh_ba_hong` chia tổng số trang đã đụng | dưới 75 phút VÀ trang hỏng dưới 35% | quá 120 phút HOẶC trang hỏng từ 50% |

## Người dự

| Tên | Vai | Đại diện cho ai |
| --- | --- | --- |
| | | |

Chưa mời. Người dùng đại diện thật ưu tiên hơn người trong đội.

## Chấm kín (thu TRƯỚC mọi thảo luận chung)

Chưa thu. Không có nhật-ký lái-thử người-lạ cho vòng này nên không có câu gợi
sẵn — cờ vàng, không chặn phiên.

Câu ràng buộc hỏi từng người: «anh/chị sẽ gọi cho môi giới nào, khi nào?»

## Thảo luận sau khi đã chấm

Chưa họp.

## Số đo thật đặt cạnh ngưỡng

| Thước | Ngưỡng | Số đo được | SỐNG/CHẾT |
| --- | --- | --- | --- |
| Mức Thấp có người thật | ≥ 50 | CHƯA ĐO | |
| Gọi được người mức thấp | ≥ 30 | CHƯA ĐO | |
| Chi phí một lượt | < 75 phút, hỏng < 35% | CHƯA ĐO | |

Cần một lượt cào thật khoảng 45 phút vào nhatot, chế độ `--dry-run` để không nạp
gì vào kho.

## Quyết định Cổng Giá trị

Chưa ký. KILL ở cổng này là THÀNH CÔNG của quy trình — câu trả lời mua bằng giá
một vòng dựng, không phải thất bại của người làm.
