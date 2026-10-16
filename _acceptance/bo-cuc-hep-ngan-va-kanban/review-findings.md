# Review findings: bo-cuc-hep-ngan-va-kanban (round 2)

## Trong hợp đồng

Không có finding nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Ảnh E4-step1.png đã commit là ảnh cũ, chụp trước khi sửa: ô Phụ trách hiện «—», đúng trạng thái mà thước hiện tại chấm đỏ**
  Người dùng thấy gì: Ảnh minh hoạ cho ngăn công ty ở khổ hẹp là ảnh chụp từ lần chạy cũ, ô Phụ trách còn trống, nên người duyệt không thấy tận mắt trường hợp tên phụ trách rất dài. Giao diện thật không bị đánh giá là hỏng, chỉ là ảnh trình duyệt chưa khớp với kiểm tra mới nhất.
  file: `_acceptance/bo-cuc-hep-ngan-va-kanban/evidence/E4-step1.png`
  severity: medium
  Đề xuất: known-limits

- **Bước 6 (E6) không chụp ảnh nào; E6-step1.png và E6-step2.png là cùng một tệp, chép từ ảnh bước 2**
  Người dùng thấy gì: Hai ảnh minh hoạ cho kiểm tra «trang không cuộn ngang» thực ra là một ảnh, và chỉ thấy phần đầu ngăn. Người duyệt xem ảnh sẽ không thấy phần thân ngăn, nhưng kết quả kiểm tra vẫn do máy đo.
  file: `_acceptance/bo-cuc-hep-ngan-va-kanban/rang/do-bo-cuc.mjs`
  severity: low
  Đề xuất: wont-fix

- **Ảnh bước 1 (E1) không chụp tới thẻ DAI đang được đo ở khổ 375**
  Người dùng thấy gì: Ảnh bảng Kanban ở khổ điện thoại không chụp tới thẻ thoả thuận tên dài vì thẻ nằm ở cột nằm ngoài khung nhìn. Người xem ảnh không tự thấy được thẻ đó, dù máy đã đo là thẻ không bị tràn.
  file: `_acceptance/bo-cuc-hep-ngan-va-kanban/rang/do-bo-cuc.mjs`
  severity: low
  Đề xuất: wont-fix

- **OOS-3 trong hợp đồng và thẻ vẫn nói «KHÔNG sửa đầu ngăn», nhưng code của vòng này có sửa đầu ngăn (r1)**
  Người dùng thấy gì: Thẻ nghiệm thu vẫn ghi là phần đầu ngăn (tên bản ghi, nhãn giai đoạn góc phải) không bị sửa, trong khi vòng này có sửa nó để tên giai đoạn không bị cắt trên điện thoại. Người duyệt có thể hiểu sai phạm vi thay đổi nếu không được báo.
  file: `_acceptance/bo-cuc-hep-ngan-va-kanban/card-plain.json`
  severity: medium
  Đề xuất: known-limits

- **Dòng «8 o chu» mà E2 dựa vào luôn được in, kể cả khi số ô chữ không phải 8 (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nhật ký đo luôn có dòng «8 ô chữ» dù số ô thật khác 8, nên đọc nhật ký có thể tưởng nhầm. Kết quả xanh/đỏ của phép đo vẫn đúng.
  file: `_acceptance/bo-cuc-hep-ngan-va-kanban/rang/do-bo-cuc.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
