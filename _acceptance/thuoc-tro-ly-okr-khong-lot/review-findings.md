# Review findings: thuoc-tro-ly-okr-khong-lot (round 2)

## Trong hợp đồng

Không có finding nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **hongHet nuốt lỗi đọc nhật ký và tự dựng lại đường dẫn nhật ký thay vì dùng tacTu.nhatKy**
  Người dùng thấy gì: Khi phép đo không đọc được nhật ký của trợ lý, báo cáo vẫn viết là «không có dòng lỗi model». Người xem có thể tưởng nhật ký sạch trong khi thật ra chưa đọc được nó.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/do-tre.mjs`
  severity: medium
  Đề xuất: known-limits

- **Thẻ Cổng Phạm vi gọi đơn vị cách ly là «máy», còn hợp đồng và mã thì cách ly theo «cây» (worktree)**
  Người dùng thấy gì: Thẻ duyệt phạm vi nói «mỗi máy» có kho đo riêng, nhưng thật ra là mỗi bản làm việc. Người ký có thể hiểu sai là hai máy khác nhau cũng được tách, trong khi cái được sửa là hai bản làm việc chạy cùng lúc.
  file: `_acceptance/thuoc-tro-ly-okr-khong-lot/card-plain.json`
  severity: low
  Đề xuất: known-limits

- **hongHet nuốt lỗi đọc nhật ký rồi khẳng định nhật ký 'không có dòng lỗi model'**
  Người dùng thấy gì: Khi không đọc được nhật ký, phép đo vẫn khẳng định nhật ký không có lỗi model, nên người xem không phân biệt được «nhật ký sạch» với «chưa đọc được nhật ký».
  file: `_acceptance/tro-ly-okr-de-xuat/rang/do-tre.mjs`
  severity: medium
  Đề xuất: known-limits

- **Mọi lượt quá hạn 180 s bị gắn nhãn 'khong phai do tre' và thoát 2 thay vì KHONG DAT**
  Người dùng thấy gì: Nếu trợ lý chậm quá 3 phút ở mọi lượt, phép đo báo «không đo được» và ghi «không phải do trễ», chứ không báo không đạt. Một lần chậm thật có thể bị đọc nhầm là lỗi hạ tầng.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/do-tre.mjs`
  severity: medium
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
