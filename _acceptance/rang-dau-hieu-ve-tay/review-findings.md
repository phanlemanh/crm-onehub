# Review findings: rang-dau-hieu-ve-tay (round 1)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Rule khong-ve-tay bỏ qua lỗi đọc danh sách nợ (`loi`) và vẫn chạy trên danh sách thiếu**
  Người dùng thấy gì: Nếu ai đó gõ sai một dòng trong danh sách nợ cũ, kiểm tra chất lượng khi đẩy mã vẫn xanh và dòng đó lặng lẽ bị bỏ qua. Chỉ bài kiểm riêng của danh sách mới phát hiện ra.
  Căn cứ: Hậu quả nhẹ: lỗi vẫn bị bài kiểm bắt ở lần chạy test, không mất dữ liệu, và người làm tự sửa được bằng cách sửa dòng nợ rồi chạy lại.
  file: `tools/oxlint/onehub/rules/khong-ve-tay.ts`
  severity: medium
  Đề xuất: known-limits

- **Danh sách nợ (JSON) được đọc bằng ép kiểu lỏng thay vì schema chặt ở chỗ vào**
  Người dùng thấy gì: Một dòng nợ khai số chỗ bằng chữ hoặc giá trị sai kiểu vẫn có thể được chấp nhận thay vì bị từ chối. Danh sách nợ có thể lỏng hơn mức người viết luật mong muốn.
  Căn cứ: Hậu quả nhẹ: chỉ ảnh hưởng nội bộ danh sách nợ do chính đội viết, không đến người dùng cuối, và sai sót lộ ra khi số chỗ không khớp lúc chạy lint.
  file: `tools/oxlint/onehub/shared/no-ve-tay.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
