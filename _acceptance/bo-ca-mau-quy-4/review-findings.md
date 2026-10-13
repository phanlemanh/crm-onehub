# Review findings: bo-ca-mau-quy-4 (round 3)

## Trong hợp đồng

Không có finding nào trong hợp đồng ở vòng này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **tenLenh lặp lại chuỗi tên lệnh đã có trong lenh của cùng khối cấu hình**
  Người dùng thấy gì: Tên lệnh sinh bộ ca mẫu quý 4 được ghi hai lần trong cấu hình. Người đổi tên lệnh có thể quên một chỗ, nhưng lệnh hiện vẫn chạy đúng và người dùng không thấy khác gì.
  file: `apps/api/scripts/okr-mau/cau-hinh.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): bài 'đúng dạng lệnh của tài liệu' tự ghép lệnh từ hằng cấu hình, không rút từ docs/setup.md**
  Người dùng thấy gì: Bài kiểm xanh dù tài liệu hướng dẫn có thể ghi sai lệnh sinh bộ ca quý 4. Nếu sau này ai sửa tài liệu lệch đi, người làm theo tài liệu có thể gặp lỗi mà không có cảnh báo trước.
  file: `apps/api/test/okr-ca-quy-4.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): bài 'chiều đỏ: cờ lạ sau --' không đi qua nhánh xử lý '--' mà nó định đo**
  Người dùng thấy gì: Nếu cách lệnh xử lý dấu phân cách '--' bị hỏng về sau, bài kiểm hiện tại vẫn xanh và không báo. Người chạy lệnh sinh bộ ca có thể gặp lỗi đó mà không được cảnh báo trước.
  file: `apps/api/test/okr-ca-quy-4.spec.ts`
  severity: low
  Đề xuất: known-limits

- **E9 expected chưa nói tới ma trận tự kiểm đối chứng bốn dòng mới thêm (r2 · tệp đã đổi)**
  Người dùng thấy gì: Một phần bước tự kiểm của phép đo chưa được ghi trong mô tả bài kiểm. Nếu ai đó lỡ gỡ phần này đi thì không cổng nào báo, nhưng kết quả đo cho người dùng vẫn đúng như hiện tại.
  file: `_acceptance/bo-ca-mau-quy-4/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **E8 đưa .gitignore vào paths: mọi thay đổi .gitignore ở bất kỳ đâu trong kho sẽ làm E8 cũ và kéo ghim lại (r2 · tệp đã đổi)**
  Người dùng thấy gì: Sau này bất kỳ thay đổi nào ở tệp bỏ qua của kho, dù không liên quan, cũng làm hồ sơ này bị coi là cũ và phải ghim lại. Chỉ tốn thêm công cho người duyệt, không làm sai kết quả đo.
  file: `_acceptance/bo-ca-mau-quy-4/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **The tracked evidence table is written before the control-case check, so a run that ends with exit 2 or 3 still leaves a clean-looking result in git (r2)**
  Người dùng thấy gì: Nếu lần đo kết thúc với cảnh báo không đáng tin, tệp kết quả lưu trong kho vẫn trông như một kết quả hợp lệ. Người đọc tệp mà không xem mã thoát có thể tin nhầm con số.
  file: `_acceptance/bo-ca-mau-quy-4/rang/do-gop-y-quy-4.mjs`
  severity: medium
  Đề xuất: known-limits

- **The eve timeout (120 minutes) is longer than E7's long_running (90 minutes), so the timeout and database-cleanup path never runs under S4 (r2)**
  Người dùng thấy gì: Nếu lần đo chạy quá lâu và bị cổng nghiệm thu ngắt, kho dữ liệu đo dùng một lần có thể bị bỏ lại mà không dọn. Chỉ để rác trên máy đo, không làm sai kết quả.
  file: `_acceptance/bo-ca-mau-quy-4/rang/do-gop-y-quy-4.mjs`
  severity: medium
  Đề xuất: known-limits

- **A flag with no value is treated as absent, so --thu-muc silently falls back to the quarter-4 set and overwrites the tracked evidence (r2)**
  Người dùng thấy gì: Nếu gõ cờ chọn thư mục mà quên giá trị, phép đo lặng lẽ đo bộ quý 4 và ghi đè tệp kết quả trong kho thay vì báo lỗi. Người chạy có thể tưởng đã đo bộ khác.
  file: `_acceptance/bo-ca-mau-quy-4/rang/do-gop-y-quy-4.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): ma trận tự kiểm của rang bỏ sót hai luật NG (từ cấm, mã cấm) và bốn trên năm mã vanDe (r2)**
  Người dùng thấy gì: Bước tự kiểm trước khi đo chưa thử hai luật cấm cho ca NG và vài mã vấn đề, nên nếu các luật đó hỏng thì bước tự kiểm vẫn báo xanh. Kết quả đo có thể được chấm sai ở những chỗ đó mà không ai biết.
  file: `_acceptance/bo-ca-mau-quy-4/rang/do-gop-y-quy-4.mjs`
  severity: medium
  Đề xuất: known-limits

- **docJudge đọc summary.json của eve mà không parse, lệch khỏi chính mẫu nó chép (r1)**
  Người dùng thấy gì: Nếu công cụ chạy thử đổi cách ghi kết quả, phần điểm đánh giá sẽ hiện «—» mà không báo lỗi, người đọc có thể tưởng là chưa có điểm chứ không phải đọc hỏng.
  file: `_acceptance/bo-ca-mau-quy-4/rang/do-gop-y-quy-4.mjs`
  severity: medium
  Đề xuất: known-limits

- **Bỏ mất chốt chặn khi maCamNg rỗng: luật NG 'ng co dong' thành rỗng nghĩa mà không ai thấy (r1)**
  Người dùng thấy gì: Nếu danh sách mã bị cấm trong ca NG bị rỗng do sửa cấu hình, phép đo vẫn báo các ca đó đúng mà thực ra không kiểm gì cả.
  file: `_acceptance/bo-ca-mau-quy-4/rang/do-gop-y-quy-4.mjs`
  severity: medium
  Đề xuất: known-limits

- **Ca NG quý 4 mang mục tiêu OneHub của năm làm cấp trên, nhưng eval gieo nó thành mục tiêu cấp bộ phận (r1)**
  Người dùng thấy gì: Khi đo Kara trên các ca căn chỉnh, mục tiêu cấp trên được dựng thành mục tiêu cấp bộ phận chứ không phải cấp OneHub, nên Kara thấy quan hệ cấp khác với dữ liệu thật mà ca mô tả.
  file: `apps/api/scripts/okr-mau/ca-quy-4.ts`
  severity: medium
  Đề xuất: new-contract

- **okr:ca-quy-4 xoá mọi tệp .json lạ trong --ra tuỳ ý, và đường dẫn tương đối tính từ apps/api (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu gõ nhầm thư mục đích khi sinh bộ ca, lệnh có thể xoá các tệp dữ liệu khác trong thư mục đó, kể cả cấu hình của ứng dụng.
  file: `apps/api/scripts/okr-ca-quy-4.ts`
  severity: medium
  Đề xuất: known-limits

- **Luật chấm của 9b bị chép thành bản thứ hai thay vì dùng chung (r1)**
  Người dùng thấy gì: Luật chấm của bộ ca mới là bản chép riêng, nên nếu sau này luật của bộ ca mẫu đổi thì hai kết quả có thể không còn so sánh công bằng được.
  file: `_acceptance/bo-ca-mau-quy-4/rang/cham-ca.mjs`
  severity: low
  Đề xuất: wont-fix

- **Bài kiểm của agent đọc cong-ty.json bằng ép kiểu viết tay, không qua schema (r1)**
  Người dùng thấy gì: Một bài kiểm đọc dữ liệu công ty mẫu theo cách ít chặt, nên nếu tên trường đổi thì bài kiểm có thể vẫn xanh trong khi so sánh trên giá trị trống.
  file: `apps/agent/test/okr-ca-quy-4.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **docJudge reads eve's summary.json without validation; a format change silently yields judge '—' (r1)**
  Người dùng thấy gì: Nếu công cụ chạy thử đổi định dạng kết quả, điểm đánh giá sẽ lặng lẽ hiện «—»; danh sách mã cấm rỗng cũng khiến luật cấm không kiểm gì mà không báo.
  file: `_acceptance/bo-ca-mau-quy-4/rang/do-gop-y-quy-4.mjs`
  severity: low
  Đề xuất: known-limits

- **The eval seeds the quy-4 NG cases' parent objective (OneHub) as a division (bo-phan) objective (r1)**
  Người dùng thấy gì: Khi đo Kara, mục tiêu cấp trên của các ca căn chỉnh bị gieo thành cấp bộ phận chứ không phải cấp OneHub, nên số đo cho nhóm ca này không khớp cấu trúc mà dữ liệu hứa.
  file: `apps/agent/evals/okr/gop-y.eval.ts`
  severity: low
  Đề xuất: new-contract

- **eve timeout (120 minutes) is longer than the declared long_running (90 minutes) (r1)**
  Người dùng thấy gì: Nếu lượt đo chạy quá 90 phút, hệ thống nghiệm thu coi là quá hạn trước khi công cụ kịp báo lỗi cụ thể, nên người xem mất thông báo rõ nguyên nhân.
  file: `_acceptance/bo-ca-mau-quy-4/rang/do-gop-y-quy-4.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E6 grep mã nguồn gop-y.eval.ts thay vì đo danh sách ca eval dựng ra (r1)**
  Người dùng thấy gì: Bài kiểm việc chọn thư mục ca chỉ đọc chữ trong mã chứ không chạy thật, nên có thể xanh dù hành vi đổi, hoặc đỏ dù hành vi vẫn đúng.
  file: `apps/agent/test/okr-ca-quy-4.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi thay vì quan hệ đủ trường): E2 chỉ so tên của capTren, không so toEqual cả mục tiêu và KR (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm chỉ so tên mục tiêu và KR cấp trên, nên nếu bộ sinh chép sai số hay kiểu thì bài kiểm vẫn xanh.
  file: `apps/api/test/okr-ca-quy-4.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): khẳng định vắng ca-ng-q4-kd-bac-2 không ghim tiền đề «có căn chỉnh» (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm xác nhận một mục tiêu không có ca NG nhưng không kiểm nó thật sự có căn chỉnh, nên nếu dữ liệu mẫu đổi thì bài kiểm không còn chứng minh được vế đó.
  file: `apps/api/test/okr-ca-quy-4.spec.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
