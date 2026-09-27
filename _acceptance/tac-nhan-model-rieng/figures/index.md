# Hình tại Cổng Phạm vi — tac-nhan-model-rieng

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-1 Model giải theo vai, bộ chạy thôi ghim theo bản | 4 bước nối tiếp | cần hình: `model-theo-vai` |
| [GIẢ ĐỊNH] dạng kết quả lỗi `{code, message}` + AC-4, AC-5 đóng lượt | 3 nhánh | cần hình: `dong-luot` |
| d-…-2 Khuôn di động, kết quả phẳng | dưới ngưỡng: 1 bước, 0 nhánh | — |
| d-…-3 Bỏ đặc tả UX | dưới ngưỡng: 0 | — |
| d-…-4 Không tách ô Cài đặt riêng | dưới ngưỡng: 0 | — |
| d-…-5 Không gửi hãng | dưới ngưỡng: 0 | — |
| d-…-6 Đo bằng lời gọi thật ba nhà cung cấp | dưới ngưỡng: 1 bước | — |
| [GIẢ ĐỊNH] cách chuyển khuôn trùng với eve | dưới ngưỡng: 0 | — |
| Nền hạ tầng đỏ (hai chỗ, không do kho) | dưới ngưỡng: 0 | — |

## Đề bài `model-theo-vai`

- Loại hình: luồng trái sang phải, so sánh «hôm nay» (trên) với «sau vòng này» (dưới).
- Hôm nay: Quản trị chọn model ở Cài đặt → Lưu bản nháp Tác nhân chụp model vào bản → Mỗi lượt chạy đọc model của bản → đổi Cài đặt không có tác dụng.
- Sau: Quản trị chọn model ở Cài đặt → Điều phối lượt hỏi bộ giải theo vai «Tác nhân» → Ghi model vào lượt và giao cho bộ chạy → Bộ chạy chạy đúng model đó; bản chỉ ghi «dựng bằng».
- Nhãn bằng chữ cho người; tên kỹ thuật (modelTheoVai, AgentRun.modelId) chỉ ở chú thích dưới hình.
- AC liên quan: AC-6, AC-7.

## Đề bài `dong-luot`

- Loại hình: cây quyết định một gốc, ba nhánh.
- Gốc: «Bộ chạy làm việc trong lượt».
- Nhánh 1: Bộ chạy báo lỗi → lượt Hỏng ngay, mang lý do của nhà cung cấp (không có lý do thì câu «Bộ chạy báo lỗi nhưng không nói lý do.»).
- Nhánh 2: Phiên xong mà bộ chạy chưa nộp kết quả → lượt Hỏng, «Bộ chạy dừng trước khi nộp kết quả.».
- Nhánh 3: Bộ chạy nộp kết quả → lượt Xong.
- Chú thích dưới hình: hôm nay nhánh 1 và 2 đều ra «Xong».
- AC liên quan: AC-4, AC-5.
