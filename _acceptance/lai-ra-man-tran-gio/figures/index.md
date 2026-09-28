# Hình tại điểm quyết định — Cổng Bằng chứng

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Ngoài-1 (t1) tran-gio can-cu: bảng hỏng thoát 1 thay vì 2 | 1 lựa chọn a/b/c, không chuỗi — dưới ngưỡng | không |
| Ngoài-2 (t2) hằng số lặp, chưa gom vào CAU_HINH | 1 lựa chọn a/b/c — dưới ngưỡng | không |
| Ngoài-3 (t3) console.error có thể bị tắt sau một ca quá hạn | chuỗi 2 bước (ca cũ lưu no-op → ca mới lưu no-op) — dưới ngưỡng | không |
| Ngoài-4 (t4) lỗi đọc/parse thoát 1 thay vì 2 | 1 lựa chọn — dưới ngưỡng | không |
| Ngoài-5 (t5) E1 bỏ sót lời gọi test dạng template/test.only | 1 lựa chọn — dưới ngưỡng | không |
| Ngoài-6 (t6) bảng đo CI sinh bằng lệnh không lưu trong kho | 1 lựa chọn — dưới ngưỡng | không |
| E5 — một lens UNCERTAIN | có/không — dưới ngưỡng | không |

0 điểm vượt N5.
