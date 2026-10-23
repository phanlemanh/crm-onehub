# Hình tại Cổng Phạm vi — hop-tuan-mo-dung-bo

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Hỏi-1 — chọn bộ khi Họp tuần không kèm đơn vị | 4 nhánh rẽ (dẫn · quản trị · phòng ban chính · còn lại) | `chon-bo.html` |
| Hỏi-2 — đổi AC-7 của VK3 (liên kết trần) | 4 bước nối tiếp (thanh bên/liên kết cũ → next.config → page.tsx chuyển → thẻ Họp tuần) | `duong-vao.html` |
| Hỏi-3 — hàng số Họp tuần cạnh VK8 AC-3 | dưới ngưỡng: 1 bước, không rẽ | — |
| Hỏi-4 — bỏ design-pass | dưới ngưỡng: 1 bước, không rẽ | — |
| Màn rỗng ba lý do (thiết kế mục 4) | 3 nhánh rẽ | `ly-do-rong.html` |

## Đề bài

### chon-bo.html

- Loại hình: cây quyết định (flowchart rẽ nhánh).
- Nút: «Mở Họp tuần, URL không có donOkr» → «Dẫn ≥1 đơn vị?» → có: «Đơn vị đầu theo thứ tự cây (bộ phận trước)».
- Không: «Quản trị chương trình?» → có: «Bộ OneHub» · không: «Có phòng ban chính?» → có: «Phòng ban chính», không:
  «Bộ OneHub».
- Nhánh phụ: «URL có donOkr (kể cả goc)» → «Giữ nguyên, không chuyển».
- AC: AC-2.

### duong-vao.html

- Loại hình: luồng (flowchart ngang).
- Ba điểm vào: «Thanh bên · Họp tuần», «/okr/theo-don-vi?xemOkr=hop-tuan (cũ)», «/okr/bo-okr?xemOkr=hop-tuan (trần)».
- Chuỗi: next.config (theo-don-vi → bo-okr, giữ truy vấn) → page.tsx máy chủ: không donOkr + xemOkr=hop-tuan →
  redirect thêm donOkr → thẻ Họp tuần của bộ người xem.
- Nhánh song song không đổi: «Thẻ con / tin sáng (có donOkr)» → thẳng thẻ Họp tuần của bộ ấy.
- Ghi chú đỏ: «VK3 AC-7 cũ: trần → OneHub» bị thay.
- AC: AC-1, AC-3, AC-10.

### ly-do-rong.html

- Loại hình: cây quyết định.
- «Thẻ Họp tuần tải xong» → «Chu kỳ chưa chạy và chưa có lần cập nhật?» → có: «Câu: chu kỳ bắt đầu dd/mm».
- Không: «tongKr = 0?» → có: «Câu: chưa KR công bố + Đơn vị có KR / Xem mọi bộ OKR» · không: «Chưa KR nào cập
  nhật?» → có: «Hàng số 0/n + câu tuanDau», không: «Hàng số + bảng».
- AC: AC-6, AC-7.
