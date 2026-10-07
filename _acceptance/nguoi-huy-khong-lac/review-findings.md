# Review findings: nguoi-huy-khong-lac (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 4 (âm-tính-một-mình): bộ đếm soLanHuySan chỉ được khẳng định bằng 0, không ca nào chứng nó từng đếm lên 1**
  Người dùng thấy gì: Phép kiểm tra tự động xác nhận việc người dùng huỷ lúc đang chờ Trợ lý OKR chỉ nhìn một chiều, nên nếu bộ đếm bị hỏng thầm lặng thì phép kiểm tra vẫn báo xanh. Hành vi thật của người dùng vẫn được các ca khác theo dõi, nên ship như hiện tại và ghi lại hạn chế này.
  file: `apps/app/test/soan-okr-khong-tru-luot.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm-tính-một-mình): 'thân không có luot' trong E1 không ghim thông điệp và không có đối chứng dương trong phạm vi lệnh nhkl_duong_cham**
  Người dùng thấy gì: Khi chạy riêng phép kiểm tra đường chậm, vế «không báo lượt đã hoàn cho người dùng đã huỷ» có thể xanh với một câu trả lời sai hình dạng. Phép kiểm tra ở lệnh khác vẫn bắt được trường hợp lỗi thật, nên ship như hiện tại và ghi lại hạn chế này.
  file: `apps/app/test/soan-okr-khong-tru-luot.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
