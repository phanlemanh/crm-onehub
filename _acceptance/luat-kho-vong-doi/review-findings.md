# Review findings: luat-kho-vong-doi (round 2)

## Trong hợp đồng

Không có phát hiện nào trong hợp đồng ở vòng này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E3 now reads packages/db/prisma.config.ts, but its `paths` does not list that file, so the stale-by-paths filter will not re-run E3 when the file changes**
  Người dùng thấy gì: Nếu sau này ai đó thêm một biến môi trường mới vào cấu hình cơ sở dữ liệu, bằng chứng cũ vẫn báo xanh trong khi bước kiểm tra trên CI có thể đỏ ở khâu cài đặt. Người duyệt sẽ tưởng kiểm tra CI vẫn ổn.
  file: `_acceptance/luat-kho-vong-doi/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **E3 reads packages/db/prisma.config.ts, but that file is not in E3's paths, so a stale PASS can survive**
  Người dùng thấy gì: Một thay đổi về biến môi trường cần cho bước cài đặt có thể làm job kiểm tra luật kho đỏ trên CI mà kết quả đã ký trước đó vẫn giữ nguyên xanh, nên cổng duyệt không phát hiện kịp.
  file: `_acceptance/luat-kho-vong-doi/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Shape 1 (đo chỉ dẫn thay vì đầu ra): E3 chỉ đọc YAML và grep env("…") trong prisma.config.ts, không bao giờ chạy bước bun install của job**
  Người dùng thấy gì: Kiểm tra hiện chỉ xem job CI có khai đủ biến cần thiết hay không, chứ không thật sự chạy bước cài đặt. Một yêu cầu cài đặt mới viết theo kiểu khác có thể làm job đỏ trên CI mà kiểm tra vẫn báo ổn.
  file: `_acceptance/luat-kho-vong-doi/rang/ci.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 (tuyên quét lớp nhưng chỉ có điểm-case): chiều đỏ của phép kiểm biến hardcode một mình DATABASE_URL, không sinh từ BIEN_CAI**
  Người dùng thấy gì: Phép kiểm chỉ thử gỡ đúng một biến môi trường đã biết. Nếu sau này có thêm biến, biến mới có thể chưa được chứng minh là bị bắt khi thiếu, nhưng hiện tại chưa gây sai lệch nào.
  file: `_acceptance/luat-kho-vong-doi/rang/ci.mjs`
  severity: low
  Đề xuất: wont-fix

- **card-plain.json holds the HTML card instead of the JSON plain-language overlay, so it is silently dropped (r1)**
  Người dùng thấy gì: Thẻ duyệt ở Cổng 2 của tính năng này sẽ hiện các câu bị cắt dở thay vì bản diễn giải dễ hiểu, nên người quyết phải đọc nguyên văn tiêu chí. Không ảnh hưởng tới việc máy bắt lỗi vòng đời.
  file: `_acceptance/luat-kho-vong-doi/card-plain.json`
  severity: medium
  Đề xuất: known-limits

- **thoi-gian.mjs calls process.exit(2) inside try/finally, so the archive temp dir is never removed (r1)**
  Người dùng thấy gì: Mỗi lần phép đo thời gian chạy hỏng sẽ để lại một thư mục tạm chiếm chỗ trên máy người chạy. Chỉ tốn dung lượng, không làm sai kết quả nào.
  file: `_acceptance/luat-kho-vong-doi/rang/thoi-gian.mjs`
  severity: low
  Đề xuất: wont-fix

- **Shape 5 (claims a full matrix but the total is computed from itself): pha.mjs prints soO/soO (r1)**
  Người dùng thấy gì: Nếu sau này ai đó lỡ xoá bớt một ca phá thử, bộ kiểm vẫn báo đủ và xanh, nên một lỗ hổng trong kiểm tra có thể lọt mà không ai thấy.
  file: `_acceptance/luat-kho-vong-doi/rang/pha.mjs`
  severity: high
  Đề xuất: known-limits

- **Shape 5 (claims a full matrix but the total is computed from itself): do-cay prints bat/PHA.length, and N = 32 + 7 is never checked (r1)**
  Người dùng thấy gì: Nếu một ca tự kiểm của máy bị xoá nhầm sau này, máy vẫn báo toàn bộ đạt và người dùng không biết mình đã mất một lớp bảo vệ.
  file: `scripts/luat-kho/do-cay.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative assertion with no positive control): khongDo does not check that the vong-doi rule actually ran (r1)**
  Người dùng thấy gì: Một số ca phá thử có thể báo xanh dù luật vòng đời không thực sự chạy, nên phép kiểm có thể tin quá mức ở vài tình huống hiếm.
  file: `_acceptance/luat-kho-vong-doi/rang/pha.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (no positive control): h1/h2 never run the unmutated copy and do not pin which case goes SAI (r1)**
  Người dùng thấy gì: Phép thử giả lập máy hỏng có thể báo đạt vì một lý do khác với lý do dự kiến, nên khó biết chính xác điều gì đã được kiểm.
  file: `_acceptance/luat-kho-vong-doi/rang/pha.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative assertion with no positive control): thoi-gian only asserts the limit was not exceeded, and the declared reverse check is not in cmd (r1)**
  Người dùng thấy gì: Phép đo thời gian chỉ chứng minh được lúc này chưa vượt trần; nó chưa tự chứng minh được rằng mình sẽ báo đỏ khi thước chậm quá mức.
  file: `_acceptance/luat-kho-vong-doi/rang/thoi-gian.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/4 lỗi rơi vào file không bộ đo nào phủ (_acceptance/luat-kho-vong-doi/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
