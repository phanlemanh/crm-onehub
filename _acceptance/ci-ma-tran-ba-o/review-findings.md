# Review findings: ci-ma-tran-ba-o (round 1)

## Trong hợp đồng

- **do-7-ngay.mjs silently swallows a failed `git show` and falls back to the current timeouts, which can misclassify cap-hit cancellations**
  AC: AC-6
  file: `_acceptance/ci-ma-tran-ba-o/rang/do-7-ngay.mjs:121`
  severity: low
  detail: `tran` is computed with `try { tranTuTep(git show ${r.headSha}:ci.yml) } catch { return tranHienTai; }`. The catch has no message, which breaks the rule against silently swallowing errors. A pull_request run's headSha is often not available locally (for example, another session's branch that was never fetched). The script then quietly uses the current file's timeouts (check=20, test=20). For runs made under the old ci.yml, the single job «check-types, lint, test» had a 30-minute cap. tranCua maps it to tran.check = 20, so a job cancelled by a superseding push at 19–29 minutes is counted as «dừng vì trần». The DEAD threshold is «có lượt huỷ vì trần», so this misclassification flips the conclusion directly, and the output does not say which run used the fallback.
  source: conventions
  rationale: AC-6 định nghĩa «dừng vì trần» theo trần của chính job, khác dừng vì đẩy chồng; fallback lặng lẽ sang trần hiện tại làm sai đúng định nghĩa này.

- **`catch` nuốt lỗi `git show` rồi lặng lẽ dùng trần của ci.yml hiện tại cho lượt cũ**
  AC: AC-6
  file: `_acceptance/ci-ma-tran-ba-o/rang/do-7-ngay.mjs:125`
  severity: low
  detail: Khi `git show <headSha>:.github/workflows/ci.yml` thất bại (sha chưa fetch, hoặc nhánh đã force-push hay đã xoá), `catch { return tranHienTai; }` thay bằng trần hiện tại (check 20) mà không in gì. Kết hợp với `tranCua`, mọi tên job không bắt đầu bằng «test (» và không phải «ci-ok» đều lấy `tran.check`. Ví dụ job cũ «check-types, lint, test» có trần 30′, bị huỷ vì đẩy chồng ở phút 22: script tính thành dừng vì trần (22 ≥ 20 − 1). Đây đúng là loại nhầm lẫn mà AC-6 muốn tách ra, và người đọc không biết đã có fallback.
  source: bugs
  rationale: Cùng gốc t2: phân biệt dừng vì trần với dừng vì đẩy chồng theo trần của chính job là yêu cầu trực tiếp của AC-6, và fallback im lặng làm lẫn hai loại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The 7-day CI measurement can never find a run: do-7-ngay.mjs filters by branch, and onehub has no ci.yml runs**
  Người dùng thấy gì: Phép đo ngưỡng 7 ngày theo đúng lệnh ghi trong hồ sơ luôn báo «chưa đủ mẫu», nên Cổng Giá trị không bao giờ có con số thật để quyết định CI nhanh hơn hay chưa.
  file: `_acceptance/ci-ma-tran-ba-o/rang/do-7-ngay.mjs`
  severity: medium
  Đề xuất: new-contract

- **Đường đo 7 ngày `--nhanh onehub` luôn đọc 0 lượt, nên ngưỡng không bao giờ đo được mà vẫn thoát mã 0**
  Người dùng thấy gì: Lệnh đo 7 ngày ghi trong hồ sơ cứ báo «chưa đủ mẫu» mà không báo lỗi, nên người duyệt dễ tưởng chỉ là chưa đủ lượt chạy trong khi thật ra không bao giờ đo được.
  file: `_acceptance/ci-ma-tran-ba-o/rang/do-7-ngay.mjs`
  severity: high
  Đề xuất: new-contract

- **Lệnh đo ghi trong hồ sơ dùng `node`, mà script gọi `Bun.YAML` nên chết ngay**
  Người dùng thấy gì: Ai làm đúng theo lệnh đo ghi trong thẻ duyệt sẽ gặp lỗi thay vì con số; phải chạy bằng công cụ khác mới ra kết quả.
  file: `_acceptance/ci-ma-tran-ba-o/card.html`
  severity: medium
  Đề xuất: known-limits

- **Thước «7 ngày» không lọc theo thời gian: lấy tới 200 lượt bất kể tuổi**
  Người dùng thấy gì: Con số đo CI có thể lẫn cả những lượt chạy cũ hơn một tuần, nên một lần CI chậm từ lâu vẫn có thể làm kết luận «có lượt bị dừng vì quá giờ» sai, hoặc lượt cũ đếm cho đủ mẫu.
  file: `_acceptance/ci-ma-tran-ba-o/rang/do-7-ngay.mjs`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 3 — kiểm «chuỗi có mặt» trong khi lời hứa là quan hệ giữa các giá trị: E1 chỉ xét tên biến env, không xét giá trị, và chỉ xét postgres có mặt**
  Người dùng thấy gì: Phép kiểm tự động chỉ chắc chắn rằng các cài đặt môi trường cho ô test còn đủ tên, nên nếu sau này ai đó đổi giá trị hay cấu hình cơ sở dữ liệu thì kiểm tra vẫn báo xanh.
  file: `_acceptance/ci-ma-tran-ba-o/rang/hinh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — bản đối chứng viết tay, không lấy từ chính lượt đã đo: E3 ghim ci-323.yml bằng sha do tác giả tự ghi, không nối với head_sha của hai lượt #323**
  Người dùng thấy gì: Việc khẳng định số đo 10,1 phút và 11,2 phút là của đúng cấu hình được gộp hiện dựa vào một bản chép và mã tay do người viết ghi, chưa được máy tự đối chiếu lại với lượt đã chạy.
  file: `_acceptance/ci-ma-tran-ba-o/rang/khop-323.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
