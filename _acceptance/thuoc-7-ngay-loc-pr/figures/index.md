# Hình tại điểm quyết định — thuoc-7-ngay-loc-pr

Ngưỡng N5: từ ba bước nối tiếp hoặc từ hai nhánh rẽ thì cần hình.

| Điểm | Đếm | Hình |
| --- | --- | --- |
| d-…-1 xếp huỷ theo annotation | 1 lựa chọn, không nhánh | dưới ngưỡng: 1 bước |
| d-…-2 gắn PR qua commits/<sha>/pulls | 1 lựa chọn | dưới ngưỡng: 1 bước |
| d-…-3 giữ --nhanh, đổi nghĩa thành base | 1 lựa chọn | dưới ngưỡng: 1 bước |
| d-…-4 cửa sổ từ commit gộp cuối đổi ci.yml | 1 lựa chọn | dưới ngưỡng: 1 bước |
| d-…-5 mã 3 khi chưa kết luận | 1 nhánh (0/2/3) | dưới ngưỡng: 1 nhánh |
| d-…-6 không dựng lượt phá-thử | 1 lựa chọn | dưới ngưỡng: 1 bước |

0 điểm vượt ngưỡng — không vẽ hình.
