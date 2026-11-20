# Review findings: chuyen-cho-delivery-loop-3-0

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Cổng 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Các phép đo của hồ sơ mới neo vào `merge-base HEAD origin/onehub`, nên sẽ hết hạn và chuyển đỏ ngay sau khi gộp**
  Người dùng thấy gì: Sau khi gộp, các phép kiểm của chính hồ sơ này sẽ chuyển đỏ cùng lúc, và mọi PR sau đó bị kéo vào kiểm lại một cách vô ích. Người dùng sẽ thấy cảnh báo đỏ giả trên các thay đổi không liên quan.
  Căn cứ: Hậu quả là đỏ giả kéo dài nhiều PR sau, gây nhiễu chứ không mất dữ liệu; sửa bằng cách neo vào mốc cố định rẻ nếu làm riêng một việc.
  file: `_acceptance/chuyen-cho-delivery-loop-3-0/rang/kit.mjs`
  severity: high
  Đề xuất: new-contract

- **`ung-vien.mjs` tự viết bộ đọc evals.yaml thứ ba và tự giải `config:executors.*`, thay vì dùng `lib/eval-yaml.cjs` và `evidence-core.cjs`**
  Người dùng thấy gì: Công cụ chọn hồ sơ cần ghim lại dùng một cách đọc riêng, có thể lệch với lưới thật ở các hồ sơ lạ sau này. Hiện tại chưa làm sót hồ sơ nào.
  Căn cứ: Chưa gây sai kết quả nào hôm nay, chỉ là rủi ro lệch về sau và người dùng cuối không bị ảnh hưởng.
  file: `_acceptance/chuyen-cho-delivery-loop-3-0/rang/ung-vien.mjs`
  severity: medium
  Đề xuất: known-limits

- **Khai trùng `t127_scripts` và `kcs_don_vi` ở `executors.script`, cùng lệnh với khoá đã có ở `executors.test`**
  Người dùng thấy gì: Hai lệnh kiểm được khai ở hai nơi, sửa một nơi có thể quên nơi kia. Người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Chỉ là trùng lặp cấu hình nội bộ, không ảnh hưởng người dùng, và sửa tốn công hơn hậu quả.
  file: `_acceptance/config.yaml`
  severity: low
  Đề xuất: wont-fix

- **Trần thời gian viết thẳng `40 * 60_000` trong setTimeout**
  Người dùng thấy gì: Một con số thời gian chờ nằm thẳng trong mã của công cụ kiểm, hơi khó chỉnh. Người dùng không thấy gì.
  Căn cứ: Chỉ là chuyện đặt tên hằng số trong công cụ nội bộ, không có hậu quả với người dùng.
  file: `_acceptance/chuyen-cho-delivery-loop-3-0/rang/chay-kho.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (khẳng định âm tính đứng một mình): ca AC-8 «hồ sơ ghim lại khớp hợp đồng» qua được mà không cần chạy, hai bản phá đã hứa không bao giờ chạy**
  Người dùng thấy gì: Phần kiểm dòng ghim lại chưa từng được thấy đỏ, vì vòng này không có hồ sơ nào cần ghim. Nếu sau này có, lỗi ở phần này có thể lọt.
  Căn cứ: Không ảnh hưởng người dùng hôm nay; rủi ro chỉ xuất hiện khi một vòng sau có hồ sơ ghim.
  file: `_acceptance/chuyen-cho-delivery-loop-3-0/thu/chuyen-cho.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (khẳng định có mặt trong khi lời hứa là một quan hệ): lớp «doi-nhanh» dựa vào kết quả bản sau gộp giả, nhưng sha của bản ấy không được kiểm**
  Người dùng thấy gì: Việc miễn ghim cho 8 phép đo dựa vào một kết quả ghi lại mà không kiểm được nó đến từ đâu. Nếu kết quả ấy sai, một phép đo đỏ có thể bị bỏ qua.
  Căn cứ: Chỉ ảnh hưởng độ tin cậy của bằng chứng nội bộ, không mất dữ liệu; chạy lại làn khô là kiểm được.
  file: `_acceptance/chuyen-cho-delivery-loop-3-0/rang/ghim.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (bộ đọc viết tay, không đi một vòng qua bộ đọc thật): danh sách ứng viên «suy lại» dùng lại đúng hàm đã sinh ra nó, và bộ đọc YAML tự viết lệch bộ đọc thật**
  Người dùng thấy gì: Phép kiểm danh sách hồ sơ cần ghim tự so với chính nó nên không bắt được lỗi của bộ đọc. Hiện tại không có hồ sơ nào bị sót.
  Căn cứ: Không có hậu quả đo được hôm nay và người dùng không gặp gì.
  file: `_acceptance/chuyen-cho-delivery-loop-3-0/rang/ung-vien.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3: `kq.n === 14` đếm số lần thay, không đếm «14 tên lệnh» như AC-6 hứa**
  Người dùng thấy gì: Một con số trong bài kiểm đếm số lần thay chữ chứ không phải số tên lệnh, dễ gây hiểu lầm khi đọc. Kết quả thay thế vẫn đúng.
  Căn cứ: Chỉ là cách diễn đạt trong bài kiểm; kết quả thực tế đã được kiểm bằng phép so trực tiếp.
  file: `_acceptance/chuyen-cho-delivery-loop-3-0/thu/chuyen-cho.test.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 và 4: bộ quét «không mã nào nạp dieu-phoi/scripts/» chỉ được thử trên bản cấy viết đúng khuôn regex, không có đối chứng trên cây thật**
  Người dùng thấy gì: Bộ quét tìm chỗ còn nạp thư mục cũ chỉ bắt được một số cách viết, nên một cách nạp khác có thể lọt. Hiện không còn chỗ nào như vậy.
  Căn cứ: Rủi ro thực thấp vì thư mục cũ đã bị gỡ khỏi kho, nên mã nạp sót sẽ lỗi ngay khi chạy.
  file: `_acceptance/chuyen-cho-delivery-loop-3-0/rang/luat.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
