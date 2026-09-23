## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **tosd_that qua mot-luot.sh làm chặn APP_URL/API_URL của caThat không bao giờ bắn**
  Người dùng thấy gì: Nếu ai chạy bước kiểm tra này riêng lẻ mà quên tự khai rõ địa chỉ máy chủ, kết quả đo có thể vô tình lấy dữ liệu từ một dự án khác đang chạy song song trên cùng máy, mà không có cảnh báo nào.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hạn thatMs (600s mỗi lượt con, 3 lượt) vượt Bash timeout 600000 mà step E7 bắt dùng, nên đường dọn của bộ đo không bao giờ tới**
  Người dùng thấy gì: Bước kiểm tra cuối có thể bị dừng đột ngột giữa chừng nếu toàn bộ quá trình chạy lâu hơn dự kiến, khiến một số dữ liệu thử nghiệm (tài khoản giả, ảnh chụp, hội thoại) bị bỏ sót lại thay vì được dọn sạch.
  file: `_acceptance/thuoc-o-soan-don-dep/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Bọc tosd_that trong mot-luot kéo thêm tiền đề người dùng email thật cho E7**
  Người dùng thấy gì: Bước kiểm tra mới vẫn cần có sẵn một người dùng cụ thể trong hệ thống mới chạy được, giống hệt các bước kiểm tra cũ khác đã có từ trước.
  file: `_acceptance/config.yaml`
  severity: low
  Đề xuất: known-limits

- **E7 step caps the Bash call at 600000 ms, below the command's own worst case, and a kill there skips every cleanup**
  Người dùng thấy gì: Bước kiểm tra cuối có thể bị dừng giữa chừng nếu chạy quá lâu, để lại dữ liệu thử nghiệm (tài khoản giả, ảnh chụp, hội thoại) chưa được dọn thay vì báo lỗi rõ ràng.
  file: `_acceptance/thuoc-o-soan-don-dep/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Wrapping tosd_that in mot-luot.sh makes the APP_URL/API_URL guard in caThat unreachable; a bare run measures the 3500/3501 servers instead of failing**
  Người dùng thấy gì: Khi chạy bước kiểm tra này riêng lẻ mà không tự khai rõ địa chỉ máy chủ, nó có thể đo nhầm trên một dự án khác đang chạy song song mà không có cảnh báo.
  file: `_acceptance/config.yaml`
  severity: low
  Đề xuất: known-limits

- **A signal during gieo() leaks the conversation because donDep runs only once (r1)**
  Người dùng thấy gì: Nếu dừng thước đo bằng tín hiệu đúng lúc nó đang tạo dữ liệu thử (trước khi bước tạo xong), một cuộc hội thoại thử có thể bị bỏ sót trong cơ sở dữ liệu phát triển thay vì được dọn sạch.
  file: `_acceptance/o-soan-va-ly-do-loi/rang/o-soan.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 5/5 lỗi rơi vào file không bộ đo nào phủ (_acceptance/config.yaml, _acceptance/thuoc-o-soan-don-dep/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
