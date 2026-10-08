# Hình tại điểm quyết định — soan-okr-khong-lac (Cổng 1)

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-1 khoá URL riêng cho trang soạn | dưới ngưỡng: 1 bước | — |
| d-…-2 tập kết quả nộp một nguồn | 3 nhánh (đã ghi / bị từ chối / lỗi hay không đọc được) | luat-moc-nop.html |
| d-…-3 lỗi nhóm vẽ trong KaraProposalGroup | dưới ngưỡng: 1 bước | — |
| d-…-4, d-…-5 bỏ quét độ phủ, bỏ design-pass | dưới ngưỡng: 1 bước | — |
| d-…-6 đo màn bằng bàn đo K2 | dưới ngưỡng: 1 bước | — |

## Đề bài luat-moc-nop

- Loại hình: luồng quyết định, trái sang phải, ba nhánh.
- Nút: «Kara gọi nộp bản nháp» → «Kết quả nộp đọc được?» — KHÔNG: «Dòng hệ thống: nộp nhưng không đọc được kết quả · không mốc · không làm gốc so sánh» · CÓ → «Kết quả?» — «đã ghi»: «Mốc nộp, so với lần đã ghi trước · dòng phụ «sửa lúc» theo lần này» · «bị từ chối» hoặc lỗi công cụ: «Dòng hệ thống: Kara nộp bản nháp chưa được — lý do · không mốc · không làm gốc so sánh».
- Một dải ví dụ dưới hình: lần 1 đã ghi → mốc; lần 2 bị từ chối → dòng hệ thống; lần 3 đã ghi → mốc «thêm 1 KR» so với lần 1 (không phải lần 2). Hôm nay (trước khi sửa): lần 2 cũng thành mốc.
- Nhãn bằng chữ cho người; tên hàm xuống chú thích (`mocTuTranscript`, `docKetQuaNop`).
- AC liên quan: AC-5, AC-6, AC-7.
