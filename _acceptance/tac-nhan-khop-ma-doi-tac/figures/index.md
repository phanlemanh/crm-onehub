# Hình tại điểm quyết định — tac-nhan-khop-ma-doi-tac

| Điểm | Đếm | Hình |
|---|---|---|
| Luồng ghép một môi giới nền tảng gửi, và nhánh nào ghi, nhánh nào chỉ đề xuất (d-…-3, điểm 3 và 4 của thiết kế) | 3 bước nối tiếp, 5 nhánh rẽ | F1-luong-ghep |
| Lưu mục không khớp vào bảng mới, nâng hạng T3 (d-…-4) | dưới ngưỡng: 1 bước, 1 nhánh | — |
| Người xác nhận ứng viên đã mang mã khác thì bị từ chối (AC-11) | dưới ngưỡng: 1 bước, 2 nhánh — gộp vào F1 | F1-luong-ghep |

## F1-luong-ghep — đề bài

- Loại hình: flowchart từ trái sang phải.
- Nút: Lô nền tảng gửi → Điểm nhận khớp mã? (có → Cập nhật ghi danh) → (không) Lưu hàng chờ + ghi việc → Tác nhân tra email và số điện thoại → năm nhánh: Khớp đúng một Cá nhân chưa có mã khác → Tự ghép (ghi danh + ghi mã) · Nhiều Cá nhân · Chỉ khớp tên · Cá nhân đã mang mã khác · Email và số chỉ về hai người → Đề xuất trên khối Chờ ghép · Không ai → Không tìm thấy, vẫn hiện · Từ Đề xuất: Người xác nhận → Ghi danh (trừ khi ứng viên mang mã khác → Từ chối) · Người bác → Đã bác.
- Nhãn tiếng Việt như trên; tô khác màu cho nhánh MÁY GHI và nhánh CHỈ ĐỀ XUẤT.
- AC liên quan: AC-2, AC-3, AC-5, AC-6, AC-7, AC-8, AC-11, AC-14.
