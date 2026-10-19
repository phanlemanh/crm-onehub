# Hình tại điểm quyết định — tin-hieu-tu-ve-kho (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Sổ d-…-1: khoá chỉ-kéo là cấu hình khoá riêng, không mở phiên | hai nhánh rẽ (cấu hình khớp → phiên · lệch → 401) và hai đường vào (mọi đường đọc phiên · đường kéo theo lịch) | `khoa-chi-keo.html` |
| Lượt lịch chạy (AC-7 đến AC-10, lối A của Cổng Đáng) | năm bước nối tiếp, ba nhánh rẽ (lỗi · có tệp mới · có PR mở) | `luot-lich.html` |
| Sổ d-…-2: giữ đường kéo về của LT2 | dưới ngưỡng: 1 bước | — |
| Sổ d-…-3: không làm trang hiện lượt kéo gần nhất | dưới ngưỡng: 0 bước | — |
| Sổ d-…-4: chạy design-pass | dưới ngưỡng: 0 bước | — |

## Đề bài `khoa-chi-keo`

- Loại: sơ đồ luồng có rẽ nhánh (flowchart).
- Nút: «Khoá đi trong đầu x-api-key» → hai đường: (A) «Bất kỳ đường đọc phiên: trang web, cầu tác nhân, tRPC, thư viện xác thực» → «Thư viện đối chiếu cấu hình mặc định» → rẽ: «khoá thường → mở phiên như hôm nay» / «khoá chỉ-kéo → cấu hình lệch → 401, không phiên»; (B) «Đường kéo theo lịch» → «Xác minh đúng cấu hình chỉ-kéo + quyền kéo tín hiệu» → «Đọc lại vai chủ khoá» → rẽ: «quản trị → kéo về, đóng dấu» / «không còn quản trị → 403».
- AC liên quan: AC-3, AC-4, AC-5, AC-6.

## Đề bài `luot-lich`

- Loại: sơ đồ luồng (flowchart) theo thời gian, một lượt.
- Nút: «21:00Z / 09:00Z — lịch chạy» → «Kéo về bằng khoá chỉ-kéo» (rẽ lỗi → «lượt đỏ, không đẩy, thư báo») → «Người gửi thấy Chờ gom» (nhánh phụ, ghi chú) → «Dựng nhánh hàng chờ = đỉnh onehub + một commit tệp tín hiệu» → rẽ «cây khác nhánh hàng chờ? có → đẩy / không → giữ» → «Nhánh hàng chờ khác onehub và chưa có PR mở? → mở PR Tín hiệu kéo về» (rẽ «kho cấm mở PR → lượt đỏ») → «Điều phối gộp theo lô (người, ngoài lượt)».
- AC liên quan: AC-7, AC-8, AC-9, AC-10.
