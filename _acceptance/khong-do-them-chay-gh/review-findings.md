# Review findings: khong-do-them-chay-gh (round 1)

## Trong hợp đồng

- **Bản sao của dung-lai-cay thiếu scripts/resolve-plugin.mjs, nên mọi ca thử đều đỏ và cả năm phép phá-thử (E6/AC-6) bắt được mà không đo gì**
  AC: AC-6
  file: `_acceptance/khong-do-them-chay-gh/rang/dung-lai-cay.mjs:91`
  severity: high
  source: bugs
  detail: Mỗi bản sao chỉ chép `scripts/kiem-cheo` và `lib`. Nhưng `napGoiDieuPhoi` (scripts/kiem-cheo/goi-dieu-phoi.mjs) luôn chạy `GIAI_BANG = join(dirname(import.meta.url), "..", "resolve-plugin.mjs")`, tức `scripts/resolve-plugin.mjs`, mà tệp này không có trong bản sao. Tôi đã chạy thử một bản sao chép đúng như thước, không đổi gì trong dem.mjs, với hai ca B1 và B4: cả hai `not ok`, kết `khong-chay-duoc`, ly_do «goi dieu-phoi khong giai duoc: ... Cannot find module '.../scripts/resolve-plugin.mjs'». Chép thêm scripts/resolve-plugin.mjs vào thì `# pass 2 # fail 0`. Hệ quả: ở mọi bản sao, bốn ca B1–B4 đều đỏ bất kể mảnh mã nào bị bỏ. Vì vậy `trung = r.notOk.some(d => d.includes(BAO_DAM[m.fail]))` luôn đúng, mọi dòng `BAT <manh>` đều in ra, và `bao dam Bx co chieu do` đều xanh. Phần «bỏ mảnh mã giữ nó làm đúng ca đó đỏ» của AC-6 thực ra không được đo: một phép phá-thử không làm đỏ gì vẫn báo xanh. Cách sửa: chép thêm `scripts/resolve-plugin.mjs` (hoặc cả `scripts/`) vào bản sao, và thêm một bản sao đối chứng không đổi gì phải ra pass 4/fail 0 trước khi tin các lần phá-thử.
  rationale: AC-6 đòi mỗi bảo đảm có một lần bỏ mảnh mã làm đúng ca đó đỏ; khi mọi ca đỏ vì thiếu tệp thì phép phá-thử không chứng minh được điều ấy.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hợp paths của hồ sơ thiếu _acceptance/config.yaml và goi.mjs dù E3/E4/E5 đọc thẳng chúng; với stale_scope: paths, đổi các tệp đó sẽ không làm hồ sơ hoá cũ**
  Người dùng thấy gì: Sau này nếu có người chỉ đổi lệnh kiểm luồng tự động hoặc phần giải gói điều phối, bằng chứng đã ký của vòng này vẫn hiện xanh dù thứ nó đo đã đổi. Người duyệt có thể tin nhầm là phép đo còn đúng.
  Căn cứ: Hậu quả chỉ xảy ra ở các lần đổi sau này, không làm sai kết quả của vòng hiện tại, và người sau vẫn tự ghim lại hồ sơ bằng tay được khi biết giới hạn này.
  file: `_acceptance/khong-do-them-chay-gh/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **--chi không lọc bước đột biến lkv_ci, và thước ban-do-that bỏ sót dòng báo của bước này**
  Người dùng thấy gì: Khi chỉ muốn đo hai phép kiểm luồng, bàn đo vẫn chạy thêm một phép kiểm thứ ba và in thêm một dòng không liên quan. Kết quả hai phép cần đo vẫn đúng, chỉ chạy lâu hơn và nhiều chữ hơn.
  Căn cứ: Không làm sai kết luận xanh hay đỏ của hai phép cần đo, chỉ tốn thêm thời gian và gây nhiễu khi đọc, nên ghi lại là đủ.
  file: `_acceptance/chuyen-goi-dieu-phoi/rang/khong-do-them.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (thiếu đối chứng dương): ô «repo» của E1/E2 vẫn đạt khi cả hai lần gọi gh repo view đều hỏng**
  Người dùng thấy gì: Khi máy chưa đăng nhập GitHub hoặc mất mạng, bàn đo có thể báo ô kiểm tên kho là đạt dù chưa hỏi được GitHub lần nào. Người đọc kết quả xanh có thể tưởng tên kho đã được xác nhận.
  Căn cứ: Chỉ xảy ra khi môi trường chạy bị hỏng, và các phép chạy lệnh GitHub thật ở phần khác của bàn đo sẽ đỏ ngay trong tình huống đó, nên người dùng khó bị đánh lừa lâu.
  file: `_acceptance/khong-do-them-chay-gh/rang/nen.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
