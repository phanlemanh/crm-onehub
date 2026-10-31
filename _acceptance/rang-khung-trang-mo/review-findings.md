# Review findings: rang-khung-trang-mo

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The exceptions table schema accepts any string for `loai`, though the allowed values are already listed in LOAI_NGOAI_LE**
  Người dùng thấy gì: Người dùng cuối không thấy gì. Bài kiểm vẫn báo đỏ khi bảng ngoại lệ ghi sai loại; chỉ là trình biên dịch chưa bắt được lỗi gõ sai ở vài chỗ so sánh nội bộ của bài kiểm.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; bài kiểm vẫn chặn đúng giá trị sai, sửa chỉ là dọn gọn nội bộ nên không đáng mở việc.
  file: `apps/app/test/support/khung-trang.ts`
  severity: low
  Đề xuất: wont-fix

- **git ls-files bỏ stderr nên lỗi git mất câu chẩn đoán**
  Người dùng thấy gì: Nếu môi trường git của máy dựng hỏng, bài kiểm vẫn đỏ nhưng người sửa phải tự chạy lại lệnh để biết vì sao. Người dùng cuối không gặp gì.
  Căn cứ: Chỉ làm người bảo trì mất thêm vài phút tìm nguyên nhân hiếm gặp, bài kiểm không bao giờ xanh giả, và không có dữ liệu nào bị mất.
  file: `apps/app/test/support/khung-trang.ts`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
