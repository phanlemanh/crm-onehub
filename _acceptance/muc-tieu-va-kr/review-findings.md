# Review findings: muc-tieu-va-kr (round 5)

## Trong hợp đồng

Không có finding nào được map vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Below md (e.g. the 390 px sheet), the KR number button no longer carries data-so-kr, so the signed-off check so-okr-tu-chay E11 step 10 breaks**
  Người dùng thấy gì: Trên màn điện thoại, nút mở số liệu của KR vẫn bấm được, nhưng phép kiểm tự động của sổ số không còn tìm ra nó. Nếu sau này nút này hỏng ở màn điện thoại thì sẽ không ai được báo.
  file: `apps/app/app/(app)/[slug]/okr/bang-kr.tsx`
  severity: high
  Đề xuất: new-contract

- **NhipGon copies PaceIndicator at the call site instead of adding a variant in packages/ui**
  Người dùng thấy gì: Dấu nhịp của KR trên màn điện thoại là một bản chép riêng. Sau này nếu thêm hoặc đổi tên một mức nhịp, màn điện thoại và màn máy tính có thể hiện chữ hoặc màu khác nhau cho cùng một KR.
  file: `apps/app/app/(app)/[slug]/okr/tien-do-kr.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): bộ đếm «số eval thật đã chạy» của ho-so-cham cộng độ dài danh sách, không đếm lượt chạy thật**
  Người dùng thấy gì: Phép kiểm báo đã chạy đủ các eval cũ có thể vẫn báo đủ khi một eval bị bỏ sót hoặc chỉ dùng lại kết quả cũ, nên một hồi quy có thể lọt qua mà vẫn hiện xanh.
  file: `_acceptance/muc-tieu-va-kr/rang/ho-so-cham.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): ca ST-mtkr-kr-moc và ST-mtkr-kr-may chỉ đo một hai màn, trong khi dòng bảng ghi «mọi màn»**
  Người dùng thấy gì: Với KR kiểu mốc và KR lấy từ máy, bài kiểm chỉ thử trên một hai màn. Nếu có lỗi chỉ xảy ra ở Theo đơn vị hoặc Chấm điểm thì bài kiểm vẫn xanh.
  file: `apps/app/test/muc-tieu-va-kr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5/4: kiểm «bảng không cuộn ngang» trên màn Chấm điểm ở E13 chạy mà không có dữ liệu gây áp lực (tên KR 120 ký tự) như ba màn kia**
  Người dùng thấy gì: Màn Chấm điểm trên điện thoại chưa được thử với tên KR rất dài, nên nếu tên dài làm bảng tràn ngang ở màn này thì phép kiểm hiện tại không phát hiện được.
  file: `_acceptance/muc-tieu-va-kr/rang/man-mtkr.mjs`
  severity: medium
  Đề xuất: known-limits

- **Breakpoint for hiding columns is defined twice: header in bang-kr.tsx, row cells in khoi-muc-tieu.tsx**
  Người dùng thấy gì: Ngưỡng độ rộng màn hình để ẩn cột nằm ở hai nơi. Hôm nay hai nơi khớp nhau nên người dùng không thấy gì, nhưng nếu sau này chỉnh một nơi quên nơi kia thì hàng mục tiêu và hàng tiêu đề có thể lệch cột ở một dải độ rộng.
  file: `apps/app/app/(app)/[slug]/okr/khoi-muc-tieu.tsx`
  severity: low
  Đề xuất: wont-fix

- **Proto overrides the row background with className although the new `nested` variant exists**
  Người dùng thấy gì: Bản mẫu giao diện dùng nền hàng tự đặt thay vì kiểu hàng con mới. Sản phẩm thật không bị ảnh hưởng, nhưng nếu đổi màu hàng con sau này thì bản mẫu sẽ không còn giống bản thật.
  file: `apps/app/app/proto/_modules/muc-tieu-va-kr/cham.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính một mình): kiểm reduced-motion của E5 chỉ đòi transition-duration 0s, còn đối chứng no-preference chỉ được ghi ra chứ không được kiểm**
  Người dùng thấy gì: Phép kiểm chế độ giảm chuyển động chỉ chứng minh mũi tên đứng yên khi người dùng xin giảm, chưa chứng minh nó vẫn chuyển động ở chế độ thường. Người dùng không bị ảnh hưởng, chỉ là phép kiểm yếu hơn mức lý tưởng.
  file: `_acceptance/muc-tieu-va-kr/rang/man-mtkr.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): «mũi tên chỉ phải» của ST-mtkr-da-thu được đo bằng sự có mặt của chuỗi lớp Tailwind, không phải bằng phép xoay đã vẽ**
  Người dùng thấy gì: Hướng mũi tên khi thu gọn mục tiêu chỉ được kiểm bằng tên lớp trong mã, không phải bằng hình đã vẽ. Nếu kiểu xoay không được áp dụng thì mũi tên không xoay mà bài kiểm vẫn xanh.
  file: `apps/app/test/muc-tieu-va-kr.dom.tsx`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
