# Review findings: giam-phut-ci-nhap-t1 (round 2)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **`**/*.md` treated as T1 lets a PR that only edits test inputs or agent prompts skip `test` and still get a green `ci-ok`**
  Người dùng thấy gì: Một thay đổi chỉ sửa tệp chữ nằm trong thư mục của trợ lý AI hoặc tài liệu mà bài kiểm đọc vào có thể được gộp với dấu xanh mà bài kiểm không hề chạy. Nếu bài kiểm đó hỏng thì chỉ phát hiện ra ở lần đẩy không liên quan sau này.
  file: `.github/scripts/phan-loai.mjs`
  severity: high
  Đề xuất: new-contract

- **T1 classification skips every test job for .md files that tests assert on or the agent runs as its prompt; nothing re-checks after merge**
  Người dùng thấy gì: Sửa riêng một bảng trong tài liệu thiết kế hoặc lời dặn của trợ lý AI có thể làm bài kiểm hỏng mà vẫn được báo xanh và gộp, vì bài kiểm không chạy và sau khi gộp cũng không ai kiểm lại.
  file: `.github/scripts/phan-loai.mjs`
  severity: medium
  Đề xuất: new-contract

- **do-phut-ci swallows failed job-log fetches, so the T1 threshold verdict can come out falsely SONG or 'chua co luot'**
  Người dùng thấy gì: Khi không tải được nhật ký của một lượt chạy, công cụ đo thời gian im lặng bỏ lượt đó và có thể kết luận sai là đã đạt ngưỡng ở lượt chỉ sửa tài liệu. Người quyết sẽ đọc một con số tưởng đáng tin mà thật ra thiếu dữ liệu.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/do-phut-ci.mjs`
  severity: low
  Đề xuất: known-limits

- **nen-gop treats any HTTP 404 from gh api as 'no required checks', so E12 passes vacuously**
  Người dùng thấy gì: Phép kiểm xem có check bắt buộc nào bị kẹt hay không có thể báo đạt khi thật ra không đọc được luật bảo vệ nhánh, ví dụ sai kho hoặc thiếu quyền. Hiện kết quả đúng nhưng chỉ do tình cờ.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/nen-gop.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 5 (class sweep with only a tautological count): the cell-count guard can never fail**
  Người dùng thấy gì: Phép đếm số ô của bảng kiểm luôn tự khớp nên không bắt được trường hợp bảng thiếu hoặc thừa ô. Bảng kiểm có thể thiếu ô mà vẫn báo đủ.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/phan-loai.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative assertion alone): any HTTP 404 becomes an empty required-check set, so «no required check is missing» passes vacuously**
  Người dùng thấy gì: Phép kiểm check bắt buộc có thể báo đạt mà thật ra chưa đọc được luật nào, nếu gọi sai kho hoặc thiếu quyền. Người đọc báo cáo sẽ tin rằng đã kiểm.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/nen-gop.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture in the reader's shape): the required-check parser is never round-tripped against a real API response**
  Người dùng thấy gì: Bộ đọc danh sách check bắt buộc chỉ được thử trên dữ liệu tự dựng vì nhánh thật hiện chưa có check bắt buộc. Khi sau này bật check bắt buộc, cách đọc có thể lệch mà chưa ai biết.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/nen-gop.mjs`
  severity: low
  Đề xuất: wont-fix

- **Shape 4 (outcome not pinned): the CLI rename case checks only nang=true without pinning ly_do, so an error path also passes**
  Người dùng thấy gì: Phép thử đổi tên tệp mã thành tài liệu chỉ xem kết quả có là nặng hay không chứ không xem vì lý do gì, nên một lỗi khác cũng làm nó qua. Chủ yếu làm lưới kiểm lỏng hơn mức cần.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/phan-loai.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 4 (negative assertion alone): «check skipped» in a CI draft run passes when the check job is absent**
  Người dùng thấy gì: Nếu bước kiểm kiểu và lint bị đổi tên hoặc biến mất, phép đo lượt PR nháp vẫn báo là đã bị bỏ qua đúng. Lỗi cấu hình kiểu đó sẽ không bị phát hiện.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/luot-that.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 3 (string presence while the promise is a relation): «Cổng Bằng chứng» and «vẽ bản đồ» are not tied to «gh pr ready»**
  Người dùng thấy gì: Phép kiểm luật PR nháp chỉ xem các cụm từ có xuất hiện không, chưa kiểm câu nói đúng thời điểm chuyển PR sang sẵn sàng. Một đoạn viết lệch ý vẫn có thể qua.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/claude-md.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 3 (per-AC relation replaced by a global presence check): the ac-thay-khong-con-eval exception uses coKhoi.size === 0**
  Người dùng thấy gì: Phép kiểm việc thay eval cũ xét sự có mặt của khối eval trong cả báo cáo thay vì từng tiêu chí được trỏ tới, nên có thể chấp nhận hoặc từ chối nhầm. Hiện báo cáo đủ nên chưa sai.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/thay-boi.mjs`
  severity: low
  Đề xuất: known-limits

- **T1 classification via `**/*.md` skips the `test` job for .md files that tests and the agent read (r1)**
  Người dùng thấy gì: Một PR sẵn sàng chỉ sửa tệp chữ mà ứng dụng hoặc bài kiểm thật sự đọc (lời dặn của trợ lý AI, tài liệu thiết kế) sẽ không chạy bài kiểm nào. Lỗi có thể lọt vào nhánh chính mà CI vẫn xanh.
  file: `.github/scripts/phan-loai.mjs`
  severity: high
  Đề xuất: known-limits

- **Classifier logic lives in files listed as T1 outside .github/, contradicting the 'editing the classifier always runs the full set' invariant (r1)**
  Người dùng thấy gì: Nếu ai chỉ sửa cách đọc danh sách tệp tài liệu hoặc cách so khớp, PR đó có thể bị coi là chỉ tài liệu và không chạy kiểm đầy đủ, dù nó làm đổi cách phân loại. Bài kiểm riêng của bộ phân loại vẫn bắt được hỏng nặng.
  file: `.github/scripts/phan-loai.mjs`
  severity: low
  Đề xuất: known-limits

- **PRs touching only T1 files now skip every CI test, but the T1 list includes .md files that tests check and agent prompts the app runs (r1)**
  Người dùng thấy gì: PR chỉ sửa tài liệu thiết kế hoặc lời dặn của trợ lý AI sẽ không chạy các bài kiểm đang đọc chính những tệp đó. Sau khi gộp, nhánh chính cũng không có lượt kiểm nào bắt lại, chỉ còn bước kiểm cục bộ trước khi đẩy.
  file: `.github/scripts/phan-loai.mjs`
  severity: medium
  Đề xuất: known-limits

- **do-phut-ci swallows failed log fetches, so the T1 threshold can pass when it should fail (r1)**
  Người dùng thấy gì: Khi công cụ đo 7 ngày không tải được nhật ký của một lượt, nó coi lượt đó không phải lượt chỉ tài liệu và không báo lỗi. Người quyết có thể nhận kết luận lạc quan hoặc thấy chưa có lượt nào.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/do-phut-ci.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không ghim thông điệp): E7 coi «cùng mã thoát» là «đỏ sẵn», nên che được hồi quy (r1)**
  Người dùng thấy gì: Phép so với bản cũ chỉ xem lệnh đỏ hay không đỏ, không xem đỏ nặng hơn bao nhiêu. Một lệnh vốn đỏ sẵn mà vòng này làm đỏ thêm vẫn bị ghi là đỏ sẵn, nên người duyệt phải đọc nhật ký mới thấy.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/khong-do-them.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng số assert không đếm độc lập): kiểm «so-o» của E1 luôn đúng (r1)**
  Người dùng thấy gì: Bài kiểm bộ phân loại tự khai đủ số tình huống nhưng không đếm độc lập. Nếu ai xoá bớt một tình huống thì không có gì báo thiếu.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/phan-loai.mjs`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 2 (không round-trip qua bên đọc thật): bên đối chiếu của E2(a) lấy danh sách glob từ chính bộ phân loại (r1)**
  Người dùng thấy gì: Bài kiểm 'chỉ một nguồn danh sách tệp tài liệu' lấy danh sách từ chính bộ phân loại, nên một lỗi khi đọc danh sách có thể không bị phát hiện.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/mot-nguon.mjs`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 2 (fixture viết tay đi tắt qua bên đọc): dòng «nguong T1» của E9 chưa từng đi qua bộ đọc log (r1)**
  Người dùng thấy gì: Bài kiểm ngưỡng lượt chỉ tài liệu dùng dữ liệu dựng sẵn và chưa từng đi qua bước đọc nhật ký thật. Lỗi ở bước đọc nhật ký sẽ không bị bài kiểm này bắt.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/do-phut-ci.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính không ghim thông điệp): ca «PATH không có bash» của E1 nhận mọi lỗi (r1)**
  Người dùng thấy gì: Bài kiểm trường hợp thiếu công cụ chạy lệnh chấp nhận mọi kiểu lỗi, chưa chứng minh đúng nhánh lỗi đó đã chạy. Trường hợp thật vẫn an toàn vì lỗi nào cũng buộc chạy đủ job nặng.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/phan-loai.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (âm tính một mình): E12 coi mọi HTTP 404 là tập rỗng, nên phép «tập con» đúng một cách rỗng (r1)**
  Người dùng thấy gì: Khi đọc luật bảo vệ nhánh bị lỗi 404 vì lý do khác (sai kho, thiếu quyền), công cụ coi như không có check bắt buộc nào và báo ổn. Người duyệt có thể tin nhầm là CI mới không làm kẹt PR.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/nen-gop.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): E11 không đòi job «check-types, lint» phải có mặt (r1)**
  Người dùng thấy gì: Phép kiểm trên lượt CI thật của PR nháp không báo lỗi nếu bước kiểm kiểu và lint biến mất khỏi lượt chạy. Thay đổi cấu hình như vậy vẫn bị bài kiểm đọc tệp workflow bắt.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/luot-that.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
