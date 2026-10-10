# Review findings: quyet-gop-y-noi-dung-ly-do (round 1)

## Trong hợp đồng

- **Hình dạng 3 (assert chuỗi có mặt thay vì quan hệ): mot-nguon miễn tệp chỉ vì tệp có chứa token `satisfies Record<LyDoKhongQuyet`**
  AC: AC-6
  file: `_acceptance/quyet-gop-y-noi-dung-ly-do/rang/mot-nguon.mjs:55`
  severity: medium
  source: measurement
  detail: AC-6 hứa một quan hệ: trong hai tệp được miễn, chuỗi mã CHỈ được dùng làm khoá của bảng có `satisfies Record<LyDoKhongQuyet, …>`. Phép đo ở dòng 53-56 chỉ làm `if (MIEN.includes(rel)) { if (!noi.includes(KHOA)) mot(...); continue; }`: tìm token đó ở bất kỳ đâu trong tệp, rồi miễn mọi lần mã xuất hiện trong tệp. Lần xuất hiện của mã không được gắn với khối có `satisfies`. Ca hỏng cụ thể: thêm `if (loi.message === "x") return "can-chinh-da-gan";` vào tro-ly.service.ts, hoặc một `switch` theo chuỗi mã vào okr-gop-y.ts, thì E6 vẫn xanh vì token `satisfies` đã có ở dòng 116 của tệp đó. Hiện okr-gop-y.ts chỉ có một token `satisfies Record<LyDoKhongQuyet` (ở bản vi), và bản en (dòng 266) không có token này; một token cho cả tệp đủ cho phép đo gật đầu với cả hai bản đồ. Không vết đột biến nào của dot-bien.mjs thử chiều này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có ca điểm): `so-sai-kieu` ánh xạ ba câu nhưng ma trận E1 chỉ thử một, và E6 chỉ đòi ≥1**
  Người dùng thấy gì: Khi một Kết quả chính (KR) bị nhập sai kiểu (ví dụ KR giảm xuống hoặc KR phần trăm), nếu sau này ai đó gõ nhầm một trong hai câu phụ thì người dùng có thể lại thấy câu lỗi chung chung thay vì câu nói rõ lý do, và bộ kiểm hiện tại không bắt được.
  file: `apps/api/test/quyet-gop-y-noi-dung-ly-do.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): ba ca hàm thuần `lyDoKhongQuyetCua(...) === null` thiếu cặp đối chứng dương trong cùng eval**
  Người dùng thấy gì: Nếu có người làm hỏng việc nhận diện lý do từ chối cố định, chạy riêng nhóm kiểm lỗi ngoài danh sách vẫn báo xanh. Tuy vậy nhóm kiểm lý do cố định vẫn bắt được lỗi này nên người dùng không bị ảnh hưởng.
  file: `apps/api/test/quyet-gop-y-noi-dung-ly-do.spec.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
