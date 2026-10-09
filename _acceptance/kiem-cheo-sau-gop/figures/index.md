# Hình tại điểm quyết định — kiem-cheo-sau-gop

| Điểm | Đếm | Hình |
| --- | --- | --- |
| d-…-1 chạy lượt đêm, xin khoá như một thợ | 3 nhánh (có đợt trống · có đợt bận ± moc · không đợt) | `lay-khoa` |
| AC-6 phân loại một eval đỏ (lời hứa thay tra-loi-tin-nhac/E11) | 4 bước nối tiếp, 3 nhánh kết cục | `phan-loai-do` |
| d-…-2 chỉ báo, không hoàn tác | dưới ngưỡng: 1 bước, 2 kênh | — |
| d-…-3 sửa tra-loi-tin-nhac sau Cổng 2 | dưới ngưỡng: 2 bước nối tiếp | — |
| d-…-4 bỏ đặc tả UX | dưới ngưỡng: 0 nhánh | — |
| d-…-5 bỏ vế năm spec Zalo | dưới ngưỡng: 0 nhánh | — |

## Đề bài `lay-khoa`

Loại: flowchart. Nút: «Lượt đêm cần khoá s4» → rẽ «Có đợt, bộ phát lịch sống?». Nhánh có: «Quá 20 giờ từ kết quả
trước?» → có: «Đơn xin mang moc (ngày lần gộp cũ nhất chưa kiểm) — xếp trước đơn s4 thường» / không: «Đơn xin
thường» → «Chờ chu.json ghi kiem-cheo» → rẽ «Được cấp trước giờ chờ tối đa?» → có: «Chạy làn (trần 90 phút) → trả
khoá» / không: «bo-luot-khoa-ban, mốc không tiến». Nhánh không có đợt: «Khoá tay khoa/s4 trống?» → có: «Tạo khoá
tay → chạy → xoá» / không: «bo-luot-khoa-ban». AC-4, AC-5, AC-7, AC-8.

## Đề bài `phan-loai-do`

Loại: flowchart. Nút: «Eval đỏ ở đỉnh D» → «Chạy lại ở D» → rẽ «xanh?» → có: «chap-chon». Không → rẽ «Hồ sơ/eval có ở
mốc T?» → không: «Tìm nhị phân từ lần gộp mang hồ sơ vào» → «do-moi + sha lần gộp». Có → «Chạy ở T» → rẽ «đỏ?» →
có: «do-san (không đổ lỗi lần gộp nào)» / không: «Tìm nhị phân trên M1…Mk» → «do-moi + sha lần gộp đầu tiên làm
đỏ». Chú thích: kết quả ngày là «do» khi có ít nhất một do-moi. AC-6.
