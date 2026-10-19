# Review findings: khong-do-them-chay-gh (round 2)

## Trong hợp đồng

Không có lỗi nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E6 paths thiếu scripts/resolve-plugin.mjs, tệp mà bản gương mới chép và bài đo phụ thuộc**
  Người dùng thấy gì: Nếu sau này có người sửa tệp tìm plugin mà phép kiểm bản gương dựa vào, hệ thống sẽ không báo kết quả cũ của phép kiểm đó là lỗi thời. Phép kiểm vẫn chạy đúng khi được chạy lại, chỉ là không tự được nhắc chạy lại.
  Căn cứ: Hậu quả nhẹ: không mất dữ liệu, không ảnh hưởng người dùng cuối, chỉ có thể bỏ sót một lần nhắc chạy lại phép kiểm; người làm tự chạy lại được, và thêm một dòng vào danh sách phạm vi là sửa rẻ ở vòng sau.
  file: `_acceptance/khong-do-them-chay-gh/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **E6 now depends on scripts/resolve-plugin.mjs, but the file is not in E6's paths, so changes to it will not mark E6 stale**
  Người dùng thấy gì: Một thay đổi sau này ở tệp tìm plugin có thể làm phép kiểm bản gương hỏng mà không có tín hiệu nào báo kết quả đã ký là cũ. Chỉ khi ai đó tự chạy lại thì mới thấy.
  Căn cứ: Hậu quả nhẹ và tự khắc phục được: phép kiểm vẫn đúng khi chạy lại, không ảnh hưởng người dùng cuối, và sửa sau chỉ là thêm một dòng khai phạm vi.
  file: `_acceptance/khong-do-them-chay-gh/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hợp paths của hồ sơ thiếu _acceptance/config.yaml và goi.mjs dù E3/E4/E5 đọc thẳng chúng; với stale_scope: paths, đổi các tệp đó sẽ không làm hồ sơ hoá cũ (r1 · tệp đã đổi)**
  Người dùng thấy gì: Sau này nếu có người chỉ đổi lệnh kiểm luồng tự động hoặc phần giải gói điều phối, bằng chứng đã ký của vòng này vẫn hiện xanh dù thứ nó đo đã đổi. Người duyệt có thể tin nhầm là phép đo còn đúng.
  Căn cứ: Hậu quả chỉ xảy ra ở các lần đổi sau này, không làm sai kết quả của vòng hiện tại, và người sau vẫn tự ghim lại hồ sơ bằng tay được khi biết giới hạn này.
  file: `_acceptance/khong-do-them-chay-gh/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **--chi không lọc bước đột biến lkv_ci, và thước ban-do-that bỏ sót dòng báo của bước này (r1)**
  Người dùng thấy gì: Khi chỉ muốn đo hai phép kiểm luồng, bàn đo vẫn chạy thêm một phép kiểm thứ ba và in thêm một dòng không liên quan. Kết quả hai phép cần đo vẫn đúng, chỉ chạy lâu hơn và nhiều chữ hơn.
  Căn cứ: Không làm sai kết luận xanh hay đỏ của hai phép cần đo, chỉ tốn thêm thời gian và gây nhiễu khi đọc, nên ghi lại là đủ.
  file: `_acceptance/chuyen-goi-dieu-phoi/rang/khong-do-them.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (thiếu đối chứng dương): ô «repo» của E1/E2 vẫn đạt khi cả hai lần gọi gh repo view đều hỏng (r1)**
  Người dùng thấy gì: Khi máy chưa đăng nhập GitHub hoặc mất mạng, bàn đo có thể báo ô kiểm tên kho là đạt dù chưa hỏi được GitHub lần nào. Người đọc kết quả xanh có thể tưởng tên kho đã được xác nhận.
  Căn cứ: Chỉ xảy ra khi môi trường chạy bị hỏng, và các phép chạy lệnh GitHub thật ở phần khác của bàn đo sẽ đỏ ngay trong tình huống đó, nên người dùng khó bị đánh lừa lâu.
  file: `_acceptance/khong-do-them-chay-gh/rang/nen.mjs`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/2 lỗi rơi vào file không bộ đo nào phủ (_acceptance/khong-do-them-chay-gh/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
