## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Bốn eval chiều đỏ nuốt lỗi git thành mã đạt (fail-open)**
  Người dùng thấy gì: Các phép kiểm chứng dùng để bảo đảm khoá bảo vệ luôn được phát hiện nếu bị gỡ có thể báo 'đạt' ngay cả khi việc đo tự nó gặp lỗi, nên nếu sau này có sự cố thật, không ai được cảnh báo.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **Cả năm eval chiều đỏ là hằng số với cây đang kiểm — vẫn «đúng-theo-cấu-tạo»**
  Người dùng thấy gì: Các phép đối chứng cho khoá bảo vệ không thực sự đọc bản sửa đang xét, nên nếu khoá bảo vệ bị gỡ khỏi bản sửa, các phép đối chứng này vẫn báo bình thường như chưa có gì xảy ra.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **E12 không đảo được khẳng định mang tải của E3 — mất phép neo nguyên văn**
  Người dùng thấy gì: Phép đối chứng cho quy tắc 'dòng khoá phải đặt đúng chỗ' không kiểm được đúng lỗi đặt sai chỗ, nên nếu sau này ai đó vô tình đặt sai vị trí, lỗi đó có thể không bị phát hiện.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **Điều kiện ghim slug kho hãng thay vì hỏi «đây có phải bản rẽ không»**
  Người dùng thấy gì: Điều kiện chặn hiện ghi cứng tên kho gốc thay vì hỏi chung 'đây có phải bản tách không'; nếu sau này kho gốc đổi tên hay đổi chủ, khoá bảo vệ có thể im lặng mất tác dụng, nhưng đổi cách viết bây giờ sẽ phá vỡ đúng điều kiện mà nhóm đã cố ý chốt.
  file: `.github/workflows/auto-pr.yml`
  severity: low
  Đề xuất: wont-fix

- **Red-lane evals E13/E14 pass when git errors — `test $? -ne 0` swallows fatal exit 128**
  Người dùng thấy gì: Hai phép đối chứng khác cũng có thể báo 'đạt' khi việc đo gặp lỗi thay vì đo đúng điều cần đo, nên một sự cố đo lường thật có thể bị bỏ lọt mà không ai hay.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **Red-lane evals E11/E12 pass when git errors — `test -z "$(...)"` reads a fatal as an empty diff**
  Người dùng thấy gì: Hai phép đối chứng dùng để chứng minh khoá bảo vệ hoạt động đúng có thể báo 'đạt' ngay cả khi việc đo bị lỗi ngầm, nên một sự cố đo lường thật có thể trôi qua mà không ai biết.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **evals.yaml declares E10–E14 but the signed evidence report covers only E1–E9 and claims failed_evals: []**
  Người dùng thấy gì: Báo cáo bằng chứng đã ký chỉ ghi nhận chín trên tổng mười bốn phép kiểm đã khai; năm phép còn lại chưa từng được chạy hay ghi nhận, nên hồ sơ ký duyệt có thể đang xác nhận nhiều hơn những gì thực sự đã kiểm tra.
  file: `_acceptance/auto-pr-thoi-do-o-ban-re/evidence-report.md`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình — E11 `apr_lech_so_dong_do` coi "lệnh không chạy" là đạt**
  Người dùng thấy gì: Một phép đối chứng chỉ kiểm 'kết quả có trống hay không', nên nó không phân biệt được giữa 'không có gì thay đổi' và 'việc đo đã thất bại' — cả hai đều báo đạt như nhau.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình — E12 không chạy phép đối khớp mà E3 mang tải**
  Người dùng thấy gì: Phép đối chứng của quy tắc 'dòng khoá phải đúng chỗ' chạy một phép so sánh khác, lỏng hơn, nên nó không thực sự chứng minh quy tắc kia biết bắt lỗi đặt sai chỗ.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình — E13/E14 đọc mã lỗi 128 của git thành "đạt"**
  Người dùng thấy gì: Hai phép đối chứng chỉ kiểm 'có phải mã lỗi khác không' mà không phân biệt được lỗi mong đợi với lỗi hệ thống thật, nên cả hai trường hợp đều báo đạt như nhau.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **Chiều đỏ E14 dùng đúng dạng lệnh mà hợp đồng khai là hỏng — không đối chứng tính chất E9 tồn tại để bắt**
  Người dùng thấy gì: Phép đối chứng cho quy tắc 'tệp trên bản sửa phải khớp mốc gốc' lại dùng đúng cách đo mà tài liệu đã tự cảnh báo là bỏ sót thay đổi chưa lưu, nên nó không chứng minh được quy tắc kia thực sự bắt lỗi.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **E11 khai một tính chất phụ-thuộc-cây mà lệnh của nó không thể có**
  Người dùng thấy gì: Mô tả của một phép đối chứng nói nó so sánh theo bản sửa hiện tại, nhưng cách đo thực tế của nó không đọc bản sửa hiện tại chút nào — mô tả và cách đo không khớp nhau.
  file: `_acceptance/auto-pr-thoi-do-o-ban-re/evals.yaml`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 11/12 lỗi rơi vào file không bộ đo nào phủ (_acceptance/config.yaml, _acceptance/auto-pr-thoi-do-o-ban-re/evidence-report.md, _acceptance/auto-pr-thoi-do-o-ban-re/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
