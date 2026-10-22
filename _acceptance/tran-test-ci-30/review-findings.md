# Review findings: tran-test-ci-30 (round 2)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hạt giống ghi số đo M5 chưa sửa, lệch với bảng đo lại trong design doc**
  Người dùng thấy gì: Ghi chú về việc tách ô kiểm thử vẫn mang số đo cũ, lệch với bảng đo lại. Người đọc ghi chú này sau này có thể thấy số liệu sai về số lượt bị cắt khi cân nhắc có mở lại việc tách hay không.
  Căn cứ: Chỉ là số liệu tham khảo cũ trong một ghi chú, không ảnh hưởng chạy hệ thống, và sửa lại lúc nào cũng được bằng một lần chép số.
  file: `docs/plan/2026-10-22-hat-giong-tach-o-api.md`
  severity: low
  Đề xuất: known-limits

- **Hàng `check` của bảng số đo nhét nhóm «nhảy qua vì PR nháp» vào ô «huỷ vì lượt mới»**
  Người dùng thấy gì: Một hàng đối chiếu trong bảng số đo trình bày gộp nhóm không đúng cột, nên người đọc cộng tay sẽ không ra 40. Ba hàng chính về các ô kiểm thử vẫn đúng.
  Căn cứ: Chỉ làm bảng khó đọc ở một hàng phụ, không sai ở các số quyết định, và không ảnh hưởng người dùng hay hệ thống chạy.
  file: `docs/superpowers/specs/2026-10-22-tran-test-ci-30-design.md`
  severity: low
  Đề xuất: known-limits

- **Hạt giống vẫn ghi số đo M5 không cộng đủ 40 lượt và lệch số đo lại trong design doc**
  Người dùng thấy gì: Ghi chú về việc tách ô kiểm thử vẫn giữ bộ số đo cũ không cộng đủ 40 lượt, trong khi bảng đo lại đã cho số khác. Người mở lại ghi chú có thể đọc phải số đã bị thay.
  Căn cứ: Chỉ là số liệu cũ trong tài liệu tham khảo, không làm mất dữ liệu hay hỏng chức năng, và dễ sửa sau bằng cách chép số đo lại.
  file: `docs/plan/2026-10-22-hat-giong-tach-o-api.md`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp, chỉ có điểm-case): thay-boi và e3-cu chỉ xét giam-phut-ci-nhap-t1/E3, bỏ sót eval đã ký trỏ vào giam-phut-ci-nhap-t1#AC-3**
  Người dùng thấy gì: Một hồ sơ nghiệm thu cũ đang trỏ vào tiêu chí mà bài kiểm của nó vừa bị thay, nên lần kiểm lại hồ sơ có thể báo lỗi và chặn gộp. Thay đổi này không tự phát hiện được chỗ gãy đó.
  Căn cứ: Hậu quả là chặn quy trình nghiệm thu chứ không ảnh hưởng người dùng cuối, nhưng sẽ vấp ở lần kiểm lại kế tiếp; nên xử lý trong một việc riêng thay vì nhét vào vòng nâng trần này.
  file: `_acceptance/tran-test-ci-30/rang/kiem.mjs`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 4 (đối chứng âm không có đối chứng dương): trên cây, ca đột biến test-strategy được tính là «BAT» dù mục đích của nó đã đỏ sẵn**
  Người dùng thấy gì: Một trong các phép thử giả lập lỗi trên cấu hình CI báo bắt được lỗi dù thực ra nó đã đỏ sẵn, nên tín hiệu đó không chứng minh gì thêm. Bốn phép còn lại vẫn có giá trị.
  Căn cứ: Chỉ làm bằng chứng kiểm thử yếu đi một phần, không gây hỏng hay mất dữ liệu cho người dùng, và bằng chứng chính vẫn đứng nhờ các phép khác cùng lượt CI thật.
  file: `_acceptance/tran-test-ci-30/rang/kiem.mjs`
  severity: low
  Đề xuất: known-limits

- **Khai not-run cho giam-phut-ci-nhap-t1/E3 làm gãy con trỏ thay thế đã ký của ci-ma-tran-ba-o/E3 (ac-thay-khong-con-eval) (r1)**
  Người dùng thấy gì: Việc nâng trần làm một hồ sơ nghiệm thu đã ký trước đó (ma trận ba ô của CI) bị kiểm lại là đỏ, dù không ai đụng tới hồ sơ ấy. Sản phẩm vẫn chạy bình thường, nhưng lần kiểm lại nghiêm ngặt sau này có thể chặn việc gộp cho tới khi con trỏ được nối lại.
  Căn cứ: Không ảnh hưởng người dùng cuối và không mất dữ liệu, nhưng sẽ làm kiểm lại báo đỏ lặp đi lặp lại cho tới khi có người sửa, nên nên mở việc riêng để nối lại cho gọn.
  file: `_acceptance/giam-phut-ci-nhap-t1/evals.yaml`
  severity: high
  Đề xuất: new-contract

- **Số đo trong hạt giống trái với bảng số đo của design doc (r1)**
  Người dùng thấy gì: Tài liệu ghi nhớ về việc tách ô kiểm thử nêu số lượt chạy chậm khác với bảng đo lại cùng ngày. Người đọc có thể thấy hai con số không khớp khi cân nhắc có mở lại việc tách hay không.
  Căn cứ: Chỉ là chênh lệch con số trong tài liệu ghi chú, không ảnh hưởng người dùng hay dữ liệu, và sửa lại lúc nào cũng được vì điều kiện mở lại vẫn đúng.
  file: `docs/plan/2026-10-22-hat-giong-tach-o-api.md`
  severity: medium
  Đề xuất: known-limits

- **Đánh not-run giam-phut-ci-nhap-t1/E3 làm gãy con trỏ ci-ma-tran-ba-o/E3 → giam-phut-ci-nhap-t1#AC-3, và gãy hẳn (ký tran-test-ci-30 cũng không gỡ được) (r1)**
  Người dùng thấy gì: Một hồ sơ nghiệm thu đã ký trước đó sẽ bị báo đỏ vĩnh viễn khi kiểm lại, và việc ký hồ sơ của vòng này cũng không làm nó hết đỏ. Cần có người nối lại hồ sơ cũ sang chỗ còn hiệu lực thì mới hết.
  Căn cứ: Không đụng tới người dùng cuối hay dữ liệu, nhưng lỗi không tự hết và có thể chặn việc gộp ở các lần kiểm sau, nên nên mở việc riêng; sửa lúc này còn rẻ vì chỉ là nối lại một con trỏ.
  file: `_acceptance/giam-phut-ci-nhap-t1/evals.yaml`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 3 (assert «chuỗi có mặt» thay cho quan hệ): trên cây, ca đột biến test-strategy được tính là BAT dù đột biến không làm đổi gì (r1)**
  Người dùng thấy gì: Bài kiểm xác nhận trần mới không làm hỏng các phép kiểm CI có một chỗ so sánh yếu, nên một phần bằng chứng nhìn chắc hơn thực tế. Một chỗ khác của bài kiểm vẫn giữ đúng điều quan trọng là trần job test chỉ đổi đúng một giá trị.
  Căn cứ: Hệ quả rất nhẹ, không ảnh hưởng người dùng hay dữ liệu, vì phần bảo đảm chính vẫn được giữ ở chỗ khác; ghi lại như một giới hạn đã biết là đủ.
  file: `_acceptance/tran-test-ci-30/rang/kiem.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

