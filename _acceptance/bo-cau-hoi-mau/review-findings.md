# Review findings: bo-cau-hoi-mau (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **docBaoCao ép kiểu JSON trong báo cáo bằng `as Bang` thay vì parse bằng Zod ở biên**
  Người dùng thấy gì: Nếu ai đó sửa tay bảng trong báo cáo đo đã lưu cho sai khuôn, lệnh kiểm sẽ chết kèm một đống chữ khó hiểu thay vì báo rõ chỗ nào lệch. Báo cáo sai vẫn không lọt qua, chỉ là thông báo lỗi khó đọc.
  file: `_acceptance/bo-cau-hoi-mau/rang/bang-do.ts`
  severity: medium
  Đề xuất: known-limits

- **nhanCua chép lại nguyên logic nhanTuKetCuc của quyet-do, kể cả hai lần ép kiểu ketCuc**
  Người dùng thấy gì: Cách gán nhãn kết quả cho từng câu đang được viết ở hai nơi. Nếu sau này một nơi đổi mà nơi kia không đổi theo, bảng của bộ câu hỏi mẫu có thể lệch bảng của lần đo chính, nhưng hiện chưa có gì sai.
  file: `_acceptance/bo-cau-hoi-mau/rang/bang-do.ts`
  severity: low
  Đề xuất: wont-fix

- **--do ghi nhận như đã đo xong một lượt mà script chấm chưa chạy hết (thiếu cham-bo-do.md): Tổng rỗng, và lỗi crash mã 1 bị đọc thành «dưới ngưỡng»**
  Người dùng thấy gì: Nếu công cụ chấm hỏng ở bước cuối, lần đo vẫn được ghi là xong với phần tổng điểm để trống, và có thể bị đọc nhầm là trợ lý đạt thấp. Người xem nên mở báo cáo xem phần tổng có số hay không trước khi tin kết quả.
  file: `_acceptance/bo-cau-hoi-mau/rang/do-bo-mau.ts`
  severity: medium
  Đề xuất: known-limits

- **jsonl sai khuôn làm --do chết bằng lỗi không bắt (mã 1), không ra «KHONG DO DUOC» mã 2**
  Người dùng thấy gì: Nếu tệp kết quả của lần đo bị cắt ngang hoặc có dòng hỏng, lệnh đo báo lỗi kỹ thuật thay vì câu «không đo được» quen thuộc. Người dùng vẫn thấy lần đo không thành công, chỉ là thông báo kém rõ.
  file: `_acceptance/bo-cau-hoi-mau/rang/do-bo-mau.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — assert chuỗi có mặt cho 'bam tro-ly' trong khi lời hứa là quan hệ (băm đúng mã trợ lý lúc đo)**
  Người dùng thấy gì: Bài kiểm chỉ xác nhận dấu vân tay mã trợ lý có dạng hợp lệ, chưa xác nhận nó đúng với mã thật. Nếu phần tính dấu vân tay sai, báo cáo đo có thể ghi sai mà bài kiểm vẫn xanh.
  file: `_acceptance/bo-cau-hoi-mau/rang/do-bo-mau.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — assert âm tính một mình: 'git status tro-ly-doc-kho không đổi' chạy trên script chấm giả không bao giờ ghi vào đó**
  Người dùng thấy gì: Bài kiểm khẳng định lần đo không đụng vào hồ sơ đã ký, nhưng bài kiểm đó khó mà đỏ dù lần đo có lỡ ghi nhầm chỗ. Việc đảm bảo đang dựa vào cách làm, chưa có phép thử bắt được lỗi.
  file: `_acceptance/bo-cau-hoi-mau/rang/do-bo-mau.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
