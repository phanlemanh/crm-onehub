# Review findings: tran-test-ci-30 (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Khai not-run cho giam-phut-ci-nhap-t1/E3 làm gãy con trỏ thay thế đã ký của ci-ma-tran-ba-o/E3 (ac-thay-khong-con-eval)**
  Người dùng thấy gì: Việc nâng trần làm một hồ sơ nghiệm thu đã ký trước đó (ma trận ba ô của CI) bị kiểm lại là đỏ, dù không ai đụng tới hồ sơ ấy. Sản phẩm vẫn chạy bình thường, nhưng lần kiểm lại nghiêm ngặt sau này có thể chặn việc gộp cho tới khi con trỏ được nối lại.
  Căn cứ: Không ảnh hưởng người dùng cuối và không mất dữ liệu, nhưng sẽ làm kiểm lại báo đỏ lặp đi lặp lại cho tới khi có người sửa, nên nên mở việc riêng để nối lại cho gọn.
  file: `_acceptance/giam-phut-ci-nhap-t1/evals.yaml`
  severity: high
  Đề xuất: new-contract

- **Số đo trong hạt giống trái với bảng số đo của design doc**
  Người dùng thấy gì: Tài liệu ghi nhớ về việc tách ô kiểm thử nêu số lượt chạy chậm khác với bảng đo lại cùng ngày. Người đọc có thể thấy hai con số không khớp khi cân nhắc có mở lại việc tách hay không.
  Căn cứ: Chỉ là chênh lệch con số trong tài liệu ghi chú, không ảnh hưởng người dùng hay dữ liệu, và sửa lại lúc nào cũng được vì điều kiện mở lại vẫn đúng.
  file: `docs/plan/2026-10-22-hat-giong-tach-o-api.md`
  severity: medium
  Đề xuất: known-limits

- **Đánh not-run giam-phut-ci-nhap-t1/E3 làm gãy con trỏ ci-ma-tran-ba-o/E3 → giam-phut-ci-nhap-t1#AC-3, và gãy hẳn (ký tran-test-ci-30 cũng không gỡ được)**
  Người dùng thấy gì: Một hồ sơ nghiệm thu đã ký trước đó sẽ bị báo đỏ vĩnh viễn khi kiểm lại, và việc ký hồ sơ của vòng này cũng không làm nó hết đỏ. Cần có người nối lại hồ sơ cũ sang chỗ còn hiệu lực thì mới hết.
  Căn cứ: Không đụng tới người dùng cuối hay dữ liệu, nhưng lỗi không tự hết và có thể chặn việc gộp ở các lần kiểm sau, nên nên mở việc riêng; sửa lúc này còn rẻ vì chỉ là nối lại một con trỏ.
  file: `_acceptance/giam-phut-ci-nhap-t1/evals.yaml`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 3 (assert «chuỗi có mặt» thay cho quan hệ): trên cây, ca đột biến test-strategy được tính là BAT dù đột biến không làm đổi gì**
  Người dùng thấy gì: Bài kiểm xác nhận trần mới không làm hỏng các phép kiểm CI có một chỗ so sánh yếu, nên một phần bằng chứng nhìn chắc hơn thực tế. Một chỗ khác của bài kiểm vẫn giữ đúng điều quan trọng là trần job test chỉ đổi đúng một giá trị.
  Căn cứ: Hệ quả rất nhẹ, không ảnh hưởng người dùng hay dữ liệu, vì phần bảo đảm chính vẫn được giữ ở chỗ khác; ghi lại như một giới hạn đã biết là đủ.
  file: `_acceptance/tran-test-ci-30/rang/kiem.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

