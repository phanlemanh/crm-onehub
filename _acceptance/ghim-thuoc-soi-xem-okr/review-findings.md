# Review findings: ghim-thuoc-soi-xem-okr (round 1)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Thẻ Cổng 1 vẫn hứa phần AC-6 và E6d đã bị bỏ khi mở lại Cổng 1**
  Người dùng thấy gì: Thẻ trình người duyệt còn ghi một lời hứa đã bị bỏ: rằng các thước đang đỏ sẵn sẽ không đỏ thêm dòng nào. Thực tế không có phép đo nào kiểm lời hứa này, nên người đọc thẻ có thể tưởng nhầm là đã có bảo đảm.
  file: `_acceptance/ghim-thuoc-soi-xem-okr/card-plain.json`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (assert «chuỗi có mặt» trong khi lời hứa là một quan hệ): E7 đọc chữ 'acceptance gate' trong docs/api.md nhưng không thước nào buộc tên đó vào job luat-kho**
  Người dùng thấy gì: Nếu sau này ai đó đổi tên bước kiểm tra trên CI hoặc dời nó sang chỗ khác, tài liệu sẽ nói sai mà không có phép kiểm nào báo đỏ. Hiện tại tài liệu vẫn đúng, nên chưa ai bị ảnh hưởng.
  file: `_acceptance/ghim-thuoc-soi-xem-okr/rang/buoc-ci.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét cả lớp nhưng thiếu assert cho từng ô): ô «không qua bộ phân loại» của Coverage không có kiểm nào, và ba điều kiện của kiem() không có đột biến chiều đỏ**
  Người dùng thấy gì: Bước kiểm tra OKR trên CI có thể bị chặn chạy trên các lượt đẩy lên nhánh chính nếu ai đó cho nó phụ thuộc vào bước phân loại PR, mà phép đo hiện tại vẫn báo xanh. Rủi ro chỉ xảy ra khi có người sửa tệp cấu hình CI theo hướng đó.
  file: `_acceptance/ghim-thuoc-soi-xem-okr/rang/buoc-ci.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
