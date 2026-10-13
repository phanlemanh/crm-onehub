# Review findings: bo-ca-mau-quy-4 (round 1)

## Trong hợp đồng

- **Missing control-case record is counted as 'caught', so the red-direction check passes without running**
  AC: AC-7
  file: `_acceptance/bo-ca-mau-quy-4/rang/do-gop-y-quy-4.mjs:471`
  severity: medium
  detail: The `thieu` check (line 465) only looks at cases read from `nguon` (`docBoCaGopY(nguon)`). The control case `doi-chung-goi-50-cuoc` is written only into the copied folder `DO.ra/ca`, so it is never in that list. If the eval writes no summary record for the control case (it crashes, times out, or hits `t.skip` because the spend cap was reached), `ghi.get(DO.caDoiChung.id)` is undefined. `chamCa` then returns `["khong co ban ghi — ..."]`, `doiChung.length > 0` is true, and the rang prints `DOI CHUNG ...: bat duoc — khong co ban ghi` and exits 0. The control is supposed to prove the scoring catches a wrong `khongGopY` expectation, but here it passes without the case ever being measured. The 9b rang this was copied from (`_acceptance/tro-ly-okr-de-xuat/rang/eval-gop-y.mjs:676/738`) has a separate branch, `doiChungKhongGhi` → `khongDo` (exit 2), that was dropped here. Fix: if `ghi` has no `DO.caDoiChung.id`, return `khongDo(...)`. Also consider requiring that the control's error is specifically `CHAM.luat.khongGopY`, not just any error.
  source: bugs

- **Hình dạng 4 (âm tính một mình, không ghim thông điệp): ca đối chứng E7 thiếu bản ghi vẫn tính là «bắt được»**
  AC: AC-7
  file: `_acceptance/bo-ca-mau-quy-4/rang/do-gop-y-quy-4.mjs:471`
  severity: high
  detail: Dòng 471–476: `const doiChung = chamCa(DO.caDoiChung, ghi.get(DO.caDoiChung.id), tuyChon); if (doiChung.length === 0) {…return 3}` rồi in «bat duoc» và thoát 0. Kiểm thiếu bản ghi ở dòng 465 chỉ chạy trên `ca = docBoCaGopY(nguon)`, tức bộ nguồn không có ca đối chứng, vì ca đối chứng chỉ được chép vào thư mục `ra/ca`. Nên khi ca đối chứng không có bản ghi tổng kết (eval không chạy tới nó, hay nó không vào bộ), `chamCa(..., undefined)` trả `["khong co ban ghi …"]` (cham-ca.mjs:143), mảng khác rỗng, và rang báo đã bắt được ca đối chứng rồi thoát 0. Hợp đồng AC-7 lại nói thiếu bản ghi là mã 2. Ngoài ra, bất kỳ lỗi nào cũng được tính là «bắt được»: `viec dong bang` (outcome khác da-nop) hay `so moi con lai` đều đủ, không cần đúng luật `khongGopY` mà ca đối chứng dựng ra để kích. Phép đối chứng dương này không ghim luật nào, nên không chứng minh được thước bắt được lỗi mà nó cài.
  source: measurement

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **docJudge đọc summary.json của eve mà không parse, lệch khỏi chính mẫu nó chép**
  Người dùng thấy gì: Nếu công cụ chạy thử đổi cách ghi kết quả, phần điểm đánh giá sẽ hiện «—» mà không báo lỗi, người đọc có thể tưởng là chưa có điểm chứ không phải đọc hỏng.
  file: `_acceptance/bo-ca-mau-quy-4/rang/do-gop-y-quy-4.mjs`
  severity: medium
  Đề xuất: known-limits

- **Bỏ mất chốt chặn khi maCamNg rỗng: luật NG 'ng co dong' thành rỗng nghĩa mà không ai thấy**
  Người dùng thấy gì: Nếu danh sách mã bị cấm trong ca NG bị rỗng do sửa cấu hình, phép đo vẫn báo các ca đó đúng mà thực ra không kiểm gì cả.
  file: `_acceptance/bo-ca-mau-quy-4/rang/do-gop-y-quy-4.mjs`
  severity: medium
  Đề xuất: known-limits

- **Ca NG quý 4 mang mục tiêu OneHub của năm làm cấp trên, nhưng eval gieo nó thành mục tiêu cấp bộ phận**
  Người dùng thấy gì: Khi đo Kara trên các ca căn chỉnh, mục tiêu cấp trên được dựng thành mục tiêu cấp bộ phận chứ không phải cấp OneHub, nên Kara thấy quan hệ cấp khác với dữ liệu thật mà ca mô tả.
  file: `apps/api/scripts/okr-mau/ca-quy-4.ts`
  severity: medium
  Đề xuất: new-contract

- **okr:ca-quy-4 xoá mọi tệp .json lạ trong --ra tuỳ ý, và đường dẫn tương đối tính từ apps/api**
  Người dùng thấy gì: Nếu gõ nhầm thư mục đích khi sinh bộ ca, lệnh có thể xoá các tệp dữ liệu khác trong thư mục đó, kể cả cấu hình của ứng dụng.
  file: `apps/api/scripts/okr-ca-quy-4.ts`
  severity: medium
  Đề xuất: known-limits

- **Luật chấm của 9b bị chép thành bản thứ hai thay vì dùng chung**
  Người dùng thấy gì: Luật chấm của bộ ca mới là bản chép riêng, nên nếu sau này luật của bộ ca mẫu đổi thì hai kết quả có thể không còn so sánh công bằng được.
  file: `_acceptance/bo-ca-mau-quy-4/rang/cham-ca.mjs`
  severity: low
  Đề xuất: wont-fix

- **Bài kiểm của agent đọc cong-ty.json bằng ép kiểu viết tay, không qua schema**
  Người dùng thấy gì: Một bài kiểm đọc dữ liệu công ty mẫu theo cách ít chặt, nên nếu tên trường đổi thì bài kiểm có thể vẫn xanh trong khi so sánh trên giá trị trống.
  file: `apps/agent/test/okr-ca-quy-4.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **docJudge reads eve's summary.json without validation; a format change silently yields judge '—'**
  Người dùng thấy gì: Nếu công cụ chạy thử đổi định dạng kết quả, điểm đánh giá sẽ lặng lẽ hiện «—»; danh sách mã cấm rỗng cũng khiến luật cấm không kiểm gì mà không báo.
  file: `_acceptance/bo-ca-mau-quy-4/rang/do-gop-y-quy-4.mjs`
  severity: low
  Đề xuất: known-limits

- **The eval seeds the quy-4 NG cases' parent objective (OneHub) as a division (bo-phan) objective**
  Người dùng thấy gì: Khi đo Kara, mục tiêu cấp trên của các ca căn chỉnh bị gieo thành cấp bộ phận chứ không phải cấp OneHub, nên số đo cho nhóm ca này không khớp cấu trúc mà dữ liệu hứa.
  file: `apps/agent/evals/okr/gop-y.eval.ts`
  severity: low
  Đề xuất: new-contract

- **eve timeout (120 minutes) is longer than the declared long_running (90 minutes)**
  Người dùng thấy gì: Nếu lượt đo chạy quá 90 phút, hệ thống nghiệm thu coi là quá hạn trước khi công cụ kịp báo lỗi cụ thể, nên người xem mất thông báo rõ nguyên nhân.
  file: `_acceptance/bo-ca-mau-quy-4/rang/do-gop-y-quy-4.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E6 grep mã nguồn gop-y.eval.ts thay vì đo danh sách ca eval dựng ra**
  Người dùng thấy gì: Bài kiểm việc chọn thư mục ca chỉ đọc chữ trong mã chứ không chạy thật, nên có thể xanh dù hành vi đổi, hoặc đỏ dù hành vi vẫn đúng.
  file: `apps/agent/test/okr-ca-quy-4.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi thay vì quan hệ đủ trường): E2 chỉ so tên của capTren, không so toEqual cả mục tiêu và KR**
  Người dùng thấy gì: Bài kiểm chỉ so tên mục tiêu và KR cấp trên, nên nếu bộ sinh chép sai số hay kiểu thì bài kiểm vẫn xanh.
  file: `apps/api/test/okr-ca-quy-4.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): khẳng định vắng ca-ng-q4-kd-bac-2 không ghim tiền đề «có căn chỉnh»**
  Người dùng thấy gì: Bài kiểm xác nhận một mục tiêu không có ca NG nhưng không kiểm nó thật sự có căn chỉnh, nên nếu dữ liệu mẫu đổi thì bài kiểm không còn chứng minh được vế đó.
  file: `apps/api/test/okr-ca-quy-4.spec.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
