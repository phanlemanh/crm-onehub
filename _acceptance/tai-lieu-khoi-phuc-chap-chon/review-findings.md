# Review findings: tai-lieu-khoi-phuc-chap-chon (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **tlkp-dem tạo bản ghi TaiLieuSuKien với chiTiet rỗng, không qua được schema suKienChiTiet**
  Người dùng thấy gì: Bài kiểm có một ca dùng bản ghi sự kiện mẫu thiếu thông tin so với bản ghi thật. Người dùng không bị ảnh hưởng gì; chỉ là dữ liệu mẫu trong bài kiểm chưa giống hệt dữ liệu thật.
  file: `apps/api/test/tai-lieu-luu-tru.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): luật quét suKienSau( không có đối chứng dương nào thật sự kích nó**
  Người dùng thấy gì: Nếu sau này ai đó vô tình gỡ một luật kiểm tra phụ trong bài kiểm, bài kiểm vẫn xanh và không báo. Người dùng không thấy ảnh hưởng, nhưng lưới an toàn của bài kiểm lỏng hơn mức mong muốn.
  file: `apps/api/test/tai-lieu-luu-tru.spec.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
