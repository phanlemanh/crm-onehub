# Review findings: quyet-gop-y-noi-dung-ly-do (round 2)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **New ngoai-bang red direction is described in the eval but no command runs it**
  Người dùng thấy gì: Phép kiểm bảo đảm mã lý do chỉ được viết ở đúng chỗ quy định hiện chạy đúng, nhưng máy chưa tự chứng minh được rằng nó biết kêu lên khi có mã lạc ra ngoài. Nếu sau này phép kiểm hỏng âm thầm thì bảng bằng chứng vẫn xanh và người duyệt không biết.
  file: `_acceptance/quyet-gop-y-noi-dung-ly-do/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **mot-nguon khoiKhoa: when the brace walk never balances, the block silently widens to the top of the file**
  Người dùng thấy gì: Trong một tình huống hiếm về sau, phép kiểm mã lý do có thể coi cả đầu tệp là bảng cho phép và bỏ qua một mã nằm sai chỗ mà không báo. Hiện không tệp nào gặp tình huống này nên người dùng chưa bị ảnh hưởng.
  file: `_acceptance/quyet-gop-y-noi-dung-ly-do/rang/mot-nguon.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có ca điểm): `so-sai-kieu` ánh xạ ba câu nhưng ma trận E1 chỉ thử một, và E6 chỉ đòi ≥1** (r1)
  Người dùng thấy gì: Khi một Kết quả chính (KR) bị nhập sai kiểu (ví dụ KR giảm xuống hoặc KR phần trăm), nếu sau này ai đó gõ nhầm một trong hai câu phụ thì người dùng có thể lại thấy câu lỗi chung chung thay vì câu nói rõ lý do, và bộ kiểm hiện tại không bắt được.
  file: `apps/api/test/quyet-gop-y-noi-dung-ly-do.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): ba ca hàm thuần `lyDoKhongQuyetCua(...) === null` thiếu cặp đối chứng dương trong cùng eval** (r1)
  Người dùng thấy gì: Nếu có người làm hỏng việc nhận diện lý do từ chối cố định, chạy riêng nhóm kiểm lỗi ngoài danh sách vẫn báo xanh. Tuy vậy nhóm kiểm lý do cố định vẫn bắt được lỗi này nên người dùng không bị ảnh hưởng.
  file: `apps/api/test/quyet-gop-y-noi-dung-ly-do.spec.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
