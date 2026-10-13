# Hình tại điểm quyết định — khung-man-chung

| Điểm | Đếm | Hình |
|---|---|---|
| Luồng một màn từ bấm vào tới có dữ liệu hoặc lỗi (d-…-1, d-…-3, d-…-15, AC-4/5/6) | 4 bước nối tiếp (đầu trang → khung xương → nội dung / lỗi → thử lại), 2 nhánh rẽ | cần hình: `luong-tai.html` |
| Đầu trang trước/sau ở 375 và 1280 (d-…-6, d-…-7, AC-7/8/10) | 2 nhánh rẽ theo khổ | cần hình: `dau-trang.html` |
| Đầu trang OKR: tiêu đề rời layout vào page.tsx (d-…-3) | 3 bước nối tiếp (layout · page · Suspense nhỏ) | gộp vào `luong-tai.html` (lớp «chỗ dựng») |
| Hỏi-1, Hỏi-2, Hỏi-3 | mỗi câu một lựa chọn hai lối, không bước nối | dưới ngưỡng: 0 bước nối, 2 lối — chữ trên thẻ đủ |
| Năm hình khung xương (d-…-1) | 5 giá trị, không bước | dưới ngưỡng: bảng trong design doc |

## Đề bài `luong-tai.html`

- Loại: sơ đồ luồng (flowchart) có hai làn: «chỗ dựng» (page.tsx máy chủ · Suspense · mã khách) và «người thấy».
- Nút: Bấm mục ở thanh bên → Đầu trang (tiêu đề, mô tả hoặc breadcrumb) hiện ngay [page.tsx, ngoài Suspense] → Khung xương cùng hình + «Đang tải…» [Suspense fallback] → rẽ: Có dữ liệu → Nội dung tại chỗ, không nhảy; Lỗi → VungTaiLoi (tiêu đề, một câu, Thử lại) → Thử lại → quay về Khung xương.
- Nhãn chữ: «trước: vòng quay giữa vùng, 7 màn mất tiêu đề» ghi mờ cạnh nút khung xương.
- AC: AC-1, AC-2, AC-4, AC-5, AC-6.

## Đề bài `dau-trang.html`

- Loại: so sánh hai cột (trước | sau), mỗi cột hai khung wireframe: 375 và 1280.
- Nút: Tiêu đề · Mô tả · Dòng lý do · Nút (outline, outline, primary tắt).
- Trước 375: Tiêu đề / Nút / Mô tả. Sau 375: Tiêu đề / Mô tả / Dòng lý do / Nút. 1280 trước và sau: Tiêu đề | Nút cùng hàng, mô tả dưới; sau có dòng lý do dưới mô tả, nút tắt trỏ tới nó.
- AC: AC-7, AC-8, AC-9, AC-10.
