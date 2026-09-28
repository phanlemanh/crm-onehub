# Hình tại điểm quyết định — kho-nguon-khoa-rieng (Cổng Phạm vi)

| Điểm | Đếm | Hình |
| --- | --- | --- |
| d-1 Không lùi sang `BLOB_READ_WRITE_TOKEN` | hai nhánh rẽ (lùi / không lùi) × hai cấu hình production | cần hình → `hai-khoa-hai-kho` |
| d-2 Hồ sơ mới thay AC-5, không sửa hợp đồng đã ký | hai nhánh rẽ, ba bước nối tiếp (hồ sơ mới → chạm thước cũ → ghim lại cũ) | cần hình → `ho-so-moi-thay-ac5` |
| d-3 Bỏ đặc tả UX | một bước (không đổi màn) | dưới ngưỡng: 1 bước |
| d-4 Hoãn telemetry, kiểm kiểu store | một bước (Later) | dưới ngưỡng: 1 bước |
| [GIẢ ĐỊNH] store public từ chối ghi private | một mệnh đề | dưới ngưỡng: 1 mệnh đề — nằm trong hình `hai-khoa-hai-kho` |

## Đề bài `hai-khoa-hai-kho`

- Loại: sơ đồ luồng so sánh, hai cột (Chọn A: không lùi · Chọn B: lùi sang tên chung).
- Nút: hai biến (`KHO_TAI_LIEU_BLOB_TOKEN`, `BLOB_READ_WRITE_TOKEN`) → hai bên đọc (kho nguồn `blob-nguon.ts`, logo `blob.ts`) → hai store (`kho-tai-lieu-nguon` private, kho logo public).
- Kịch bản dưới mỗi cột: production chỉ đặt khoá logo → A: nút tải nguồn khoá, logo chạy · B: nút tải nguồn mở, mọi lượt tải hỏng (giả định: store public từ chối ghi private).
- Nhãn chữ tiếng Việt, tên biến giữ nguyên.
- AC liên quan: AC-1, AC-3.

## Đề bài `ho-so-moi-thay-ac5`

- Loại: dòng thời gian ba bước + nhánh bị loại.
- Nút: `may-soan-de-xuat` đã ký (AC-5 nói `BLOB_READ_WRITE_TOKEN`) → hồ sơ mới `kho-nguon-khoa-rieng` (AC-3 thay AC-5) → vòng chạm thước của hồ sơ cũ (`blob-nguon.ts`, `blob-that.mjs`, `man-tai-nguon.mjs`) → ghim lại `may-soan-de-xuat` ở đầu nhánh. Nhánh bị loại (nét đứt): sửa `contract.md` đã ký.
- AC liên quan: AC-3, AC-6, AC-7.
