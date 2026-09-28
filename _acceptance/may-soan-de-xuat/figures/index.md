# Hình tại điểm quyết định — may-soan-de-xuat

| Điểm | Đếm | Hình |
|---|---|---|
| d-1 tải thẳng Blob private, API băm lại | 5 bước nối tiếp (xinCho → PUT → nhan → get + băm → ghi hàng và việc) + 2 nhánh (trùng, sai loại) | `duong-nguon` |
| d-2 máy soạn là subagent riêng, một tool | 6 bước (việc → tải byte và băm lại → đọc chữ → phiên may_soan → nop_ban_de_xuat kiểm → hàm ghi chung) + 3 nhánh (cần gõ tay, chưa soạn được, bác và thử lại) | `duong-nguon` (chung hình) |
| d-3 người tải chọn một đích | dưới ngưỡng: 1 nhánh hai lối | — |
| d-4 bản máy là cả trang, không vá theo mục | dưới ngưỡng: 0 bước mới | — |
| d-5 hàm tạo đề xuất dùng chung | dưới ngưỡng: 2 bên gọi một hàm | — |
| d-6 khoá thứ hai vắng thì dùng đường chung | dưới ngưỡng: 1 nhánh | — |
| d-7 thiếu Quy tắc viết thì không soạn | dưới ngưỡng: 1 nhánh (có trong hình `duong-nguon`) | — |
| d-8 chạy design-pass | dưới ngưỡng | — |
| tick từng khẳng định trước Duyệt — chủ kho chọn B 2026-09-28 | 3 bước nối tiếp (bước 1 nguồn → bước 2 cạnh nhau → Duyệt) + 2 nhánh (có tick / không tick) | `man-duyet` |
| human-gate1 từ điển mục Nguồn | dưới ngưỡng: sửa một câu | — |
| [GIẢ ĐỊNH] ngưỡng cần gõ tay, một tệp một trang, model mặc định | dưới ngưỡng: ba giả định rời | — |

## Đề bài `duong-nguon`

- Loại: flowchart trái → phải, hai làn (API · agent), một làn phụ «người».
- Nút: Người chọn tệp và đích → `xinCho` (URL ký) → trình duyệt PUT vào Blob private → `nhan`: đọc lại byte, băm sha256, kiểm chữ ký tệp → ghi `TaiLieuNguon` + `AgentTask soan-tu-nguon` → agent: tải byte, băm lại → đọc chữ + thử độ tin → phiên `subagent may_soan` (không mạng, một tool) → `nop_ban_de_xuat`: kiểm trích đoạn và từng số mới → hàm tạo đề xuất dùng chung → bản đề xuất «chờ duyệt».
- Nhánh: trùng hash → «Nguồn này đã có» (xoá blob mới) · sai loại/quá cỡ → câu lỗi, xoá blob · bản quét/lớp chữ hỏng → «Cần gõ tay» · thiếu Quy tắc viết, model lỗi, hết giờ, sai khuôn, hết trần bị bác → «Chưa soạn được» + Soạn lại · bác số → quay lại model trong trần bước.
- Chú thích: đường ghi của máy dừng ở «chờ duyệt»; mũi tên «Duyệt» chỉ đi từ người.
- AC: AC-2, AC-3, AC-4, AC-6, AC-7, AC-8, AC-9, AC-10, AC-14.

## Đề bài `man-duyet`

- Loại: flowchart trên → dưới, ba bước màn duyệt.
- Nút: Bước 1 «Nguồn nói gì» (chữ nguồn, đoạn trích tô nền, bảng Con số và ngày; không có nút Duyệt) → bấm «Đã đọc nguồn, xem bản máy soạn» → Bước 2 (nguồn trái, bản máy phải ở 1440; hai thẻ ở 390) → quyết: Duyệt · Trả lại · Sửa bản này.
- Nhánh quyết định cần người chọn: A «không tick» — Duyệt mở ngay ở bước 2 · B «tick bắt buộc» — Duyệt khoá tới khi tick hết các dòng Con số và ngày (máy khuyên B).
- Chú thích: không nút nào nhận focus sẵn; «Sửa bản này» giữ nguồn.
- AC: AC-11.
