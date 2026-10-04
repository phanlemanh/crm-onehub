# Review findings: soan-okr-song-lai (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E4 (và một phần E3) hứa đi qua client eve thật / fetch giả, nhưng bài DOM tiêm lỗi thẳng vào useEveAgent đã mock**
  Người dùng thấy gì: Mô tả của hai bài kiểm tự động nói là chúng thử qua kênh chat thật, nhưng thực tế chúng dùng một bản thay thế. Người dùng không thấy khác biệt gì; việc kiểm trên trình duyệt thật vẫn phủ đường thật, chỉ có phần mô tả ghi chưa đúng.
  file: `_acceptance/soan-okr-song-lai/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — Fixture viết tay đúng khuôn bên đọc: lỗi 503 chua-cau-hinh không đi từ cửa thật sang client thật ở phép đo nào**
  Người dùng thấy gì: Khi máy chủ chưa bật Soạn OKR, màn hình đang báo đúng câu giải thích. Tuy nhiên các bài kiểm chưa bắt được trường hợp ai đó đổi cách máy chủ trả lỗi, khi đó người dùng có thể lại thấy câu báo lỗi chung chung mà bài kiểm vẫn không báo đỏ.
  file: `apps/app/test/soan-okr-song-lai.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 — Khẳng định âm một mình: spy soanMo bằng 0 mà không hề bấm, và 'không chữ Tiếp' không có đối chứng dương**
  Người dùng thấy gì: Bài kiểm chưa thật sự thử bấm vào nút đang bị khoá để chứng minh bấm không mở được cuộc soạn nào. Nút vẫn bị khoá và người dùng không bị ảnh hưởng, chỉ là mức chắc chắn của bài kiểm thấp hơn lời hứa.
  file: `apps/app/test/soan-okr-song-lai.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — Ma trận 22 ô không có cột kỳ vọng viết trước: 'hình hôm nay' rút từ chính mã đang đo**
  Người dùng thấy gì: Bài kiểm các tổ hợp người dùng và kết quả lấy chuẩn so sánh từ chính mã đang chạy, nên nếu nút Soạn OKR cùng lúc biến mất ở nhiều trường hợp thì bài kiểm vẫn có thể báo xanh. Hiện chưa có trường hợp thật nào bị mất nút.
  file: `apps/app/test/soan-okr-song-lai.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — Chiều đỏ của E11 không ghim thông điệp: chính cờ --kiem-do-do gây ra dòng SAI soLuot, đủ để chiều đỏ qua**
  Người dùng thấy gì: Phép thử ngược của bài đo màn có thể báo đã bắt được lỗi vì một lý do khác với lý do định kiểm. Người dùng không bị ảnh hưởng, nhưng khi bài đo màn đỏ thì khó biết ngay phần nào đã cắn.
  file: `_acceptance/soan-okr-song-lai/rang/man-chua-cau-hinh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — Lời hứa là quan hệ (Root Directory = apps/agent-okr; bí mật của app «cùng giá trị») nhưng chỉ đo chuỗi có mặt, một vế luôn đúng**
  Người dùng thấy gì: Bài kiểm tự động chỉ xác nhận hướng dẫn bật Trợ lý OKR có nhắc đủ các mục cần đặt, chưa xác nhận từng giá trị ghi đúng chỗ. Nếu sau này ai đó ghi sai một giá trị trong hướng dẫn, chủ kho có thể làm theo mà không được cảnh báo.
  file: `_acceptance/soan-okr-song-lai/rang/huong-dan-trien-khai.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
