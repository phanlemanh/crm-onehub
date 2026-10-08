# Review findings: ca-chap-chon-cach-ly (round 1)

## Trong hợp đồng

- **E6 promises a pass-count >= merge-base test-count check that no command performs; demCa silently falls back to the index when merge-base fails**
  AC: AC-5
  file: `_acceptance/ca-chap-chon-cach-ly/rang/dot-bien.mjs:101`
  severity: low
  source: bugs
  detail: E6 (evals.yaml line 49) expects the number of «(pass)» lines to be >= the test( count at merge-base, 'counted in rang/dot-bien.mjs, prints CA: <n>'. But E6's cmd (cccl_tai_lieu) only runs bun test and never prints CA. dot-bien.mjs only logs caGoc and compares it to nothing, so no machine checks the >= condition. Separately, demCa does not check the exit status of `git merge-base HEAD origin/onehub`. If it fails, base is '', `git show :<spec>` reads the index (current HEAD) version instead of merge-base, and the wrong count is printed with no warning.
  rationale: AC-5 hứa hai spec tài liệu vẫn xanh đủ số ca như trước, mà không lệnh nào so số ca với mốc merge-base.

- **Hình dạng 3 — lời hứa là quan hệ «số (pass) ≥ số ca ở merge-base», nhưng không máy nào so hai số đó**
  AC: AC-5
  file: `_acceptance/ca-chap-chon-cach-ly/evals.yaml:44`
  severity: high
  source: measurement
  detail: E6 hứa: 0 fail VÀ số «(pass)» trong log ≥ số ca `test(` của hai tệp ở merge-base, con số này dot-bien.mjs in ra thành «CA: <n>». Nhưng lệnh của E6 (`config:executors.test.cccl_tai_lieu` = `bun run test -- "cd apps/api && bun test …tai-lieu-khong-ro… …tai-lieu-thay-trang…"`) chỉ cho một mã thoát, không đếm «(pass)». Còn dot-bien.mjs:107-108 chỉ `console.log(`CA: ${caGoc}`)`, không đem so với lượt nào. Vậy vế «vẫn xanh đủ số ca như trước» của AC-5 rút về «có chạy và exit 0»: một ca bị bỏ qua hay mất đi vẫn ra exit 0. Thêm nữa, `demCa` (dot-bien.mjs:100-103) không kiểm mã thoát của `git merge-base`/`git show`. Thiếu `origin/onehub` thì nó lặng lẽ in «CA: 0», và quan hệ ≥ đúng một cách vô nghĩa.
  rationale: Vế «vẫn xanh đủ số ca như trước» của AC-5 chỉ còn là «có chạy và thoát 0»; một ca bị bỏ qua hay mất vẫn lọt.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **SOKR_KHONG_CHAY_AGENT_CU added to turbo globalPassThroughEnv but has no entry in .env.example**
  Người dùng thấy gì: Công tắc bỏ ca kiểm hoạt động đúng nhưng chưa có dòng nào ghi trong tài liệu cấu hình, nên người tiếp quản khó biết nó tồn tại. Ship như hiện tại, ghi rõ là còn thiếu phần mô tả.
  file: `turbo.json`
  severity: medium
  Đề xuất: known-limits
- **ban-sao.mjs hardcodes /private/tmp instead of the os.tmpdir()/mkdtemp pattern every other tooth script uses**
  Người dùng thấy gì: Phép thử chứng minh bước dọn có tác dụng chỉ chạy được trên máy Mac. Trên máy chủ Linux của công ty nó sẽ dừng mà không cho kết quả, và nếu bị ngắt giữa chừng có thể để sót thư mục tạm.
  file: `_acceptance/ca-chap-chon-cach-ly/rang/ban-sao.mjs`
  severity: medium
  Đề xuất: known-limits
- **Process-check helpers duplicated: eve-gia.ts re-exports songCon, which already exists in khoi-dong.ts; mo-coi.mjs copies ps/cayCon/song**
  Người dùng thấy gì: Cùng một đoạn kiểm tra tiến trình còn sống được chép ở vài nơi. Hiện vẫn chạy đúng, nhưng sau này sửa một nơi mà quên nơi kia thì các phép thử có thể lệch nhau.
  file: `apps/agent-okr/test/support/eve-gia.ts`
  severity: low
  Đề xuất: known-limits
- **Orphan check matches only the generic '/node_modules/.bin/eve dev', while E2 promises a check against '<gốc>/node_modules/.bin/eve dev'**
  Người dùng thấy gì: Bước bảo vệ khỏi dừng nhầm tiến trình khác thực tế dựa vào thời điểm khởi chạy nên rất khó dừng nhầm. Nhưng mô tả của phép đo nói kiểm chặt hơn những gì máy thật sự kiểm.
  file: `apps/agent-okr/test/support/khoi-dong.ts`
  severity: low
  Đề xuất: known-limits
- **chu.json is rewritten in place without an atomic write, so a waiting process can read it empty, treat a live lock as stale, kill the owner's eve and remove the lock**
  Người dùng thấy gì: Khi hai lượt kiểm cùng chờ một máy, có một khoảnh khắc ngắn lượt chờ có thể tưởng khoá đang dùng là khoá cũ, rồi dừng nhầm máy của lượt đang chạy. Hiếm gặp nhưng khi xảy ra thì lại đỏ chập chờn đúng thứ vòng này muốn trừ.
  file: `apps/agent-okr/test/support/khoi-dong.ts`
  severity: medium
  Đề xuất: new-contract
- **Adding an await between the stale check and rmSync widens the window in which a second waiter deletes the lock the first waiter just took**
  Người dùng thấy gì: Khi hai tiến trình cùng chờ để dọn máy mồ côi, tiến trình đến sau có thể xoá nhầm khoá mà tiến trình đến trước vừa lấy, làm hai bên cùng chạy một máy và một bên báo lỗi. Cần một hợp đồng riêng nếu muốn trừ hẳn.
  file: `apps/agent-okr/test/support/khoi-dong.ts`
  severity: medium
  Đề xuất: new-contract
- **If spawn fails, `pid ?? 0` makes the alive check pass for nothing and makes cleanup SIGKILL the whole process group**
  Người dùng thấy gì: Nếu bài thử không dựng được tiến trình giả, bài vẫn báo xanh mà không kiểm gì, và bước dọn có thể giết cả nhóm tiến trình đang chạy cùng, kể cả bộ chạy test. Chỉ xảy ra khi máy thiếu công cụ cần thiết.
  file: `apps/agent-okr/test/khoi-dong-don.spec.ts`
  severity: low
  Đề xuất: known-limits
- **mo-coi.mjs only tracks the orphaned agent-okr eve; an orphaned apps/agent eve from the same killed run is never stopped (it stays alive in do mode)**
  Người dùng thấy gì: Sau phép thử giết lượt giữa chừng, một tiến trình máy của gói bên cạnh có thể còn sót lại trên máy người chạy. Không ảnh hưởng kết quả, chỉ để lại rác tạm.
  file: `_acceptance/ca-chap-chon-cach-ly/rang/mo-coi.mjs`
  severity: low
  Đề xuất: known-limits
- **Hình dạng 4 — E9 chỉ khẳng định âm «không có tệp cấm», không có đối chứng dương rằng danh sách diff thật có nội dung**
  Người dùng thấy gì: Phép kiểm "không đụng mã sản phẩm" sẽ báo đạt cả khi nó không thấy tệp nào đổi vì đo sai khoảng. Kết luận hiện đúng, nhưng chưa có đối chứng chứng minh máy đang nhìn đúng chỗ.
  file: `_acceptance/ca-chap-chon-cach-ly/rang/pham-vi.mjs`
  severity: medium
  Đề xuất: known-limits
- **Hình dạng 5 — AC-2 khai lớp «không phải eve dev CỦA GỐC ĐÓ», nhưng chỉ có một điểm-case `sleep`, không phân biệt được việc so có gốc hay không gốc**
  Người dùng thấy gì: Bài thử chỉ kiểm trường hợp tiến trình hoàn toàn lạ, chưa kiểm trường hợp một máy eve của thư mục khác. Việc bảo vệ khỏi dừng nhầm vẫn hoạt động nhưng chưa được chứng minh cho riêng trường hợp đó.
  file: `apps/agent-okr/test/khoi-dong-don.spec.ts`
  severity: medium
  Đề xuất: known-limits
- **Hình dạng 3 — AC-1 hứa thứ tự «dừng TRƯỚC khi eve mới được gọi», nhưng bài chỉ đo «rồi cũng chết» trong 10 s sau khi giuKhoaEve trả về**
  Người dùng thấy gì: Bài thử chỉ xác nhận máy cũ rồi cũng bị dừng trong vài giây, chưa xác nhận nó đã dừng hẳn trước khi máy mới được gọi. Mã hiện chạy đúng thứ tự nhưng nếu sau này ai đó làm sai thứ tự thì bài thử có thể không bắt được.
  file: `apps/agent-okr/test/khoi-dong-don.spec.ts`
  severity: medium
  Đề xuất: known-limits
- **Hình dạng 3 — vế «khoiDongEve vẫn ném lỗi có tên (pid, url, lệnh kill)» của AC-2 chỉ được đo bằng sự có mặt của một cụm chữ, trên bản sao đã phá**
  Người dùng thấy gì: Thông báo lỗi khi gặp máy lạ chỉ được kiểm là có xuất hiện câu quen thuộc, chưa kiểm là đủ số tiến trình, địa chỉ và lệnh dừng. Người chạy có thể gặp thông báo thiếu chi tiết mà bài thử không báo đỏ.
  file: `_acceptance/ca-chap-chon-cach-ly/rang/mo-coi.mjs`
  severity: medium
  Đề xuất: known-limits
- **Hình dạng 1 — «ném trước khi hook app-rieng hết giờ» được đo bằng cách so hai hằng cấu hình, không đo thời điểm lỗi thật sự ra**
  Người dùng thấy gì: Việc báo lỗi có tên trước khi bài thử hết giờ chỉ được kiểm bằng cách so hai con số cấu hình, không đo thời gian thật. Trong tình huống chậm nhiều lớp, lỗi có thể ra muộn hơn người ta tưởng.
  file: `apps/agent-okr/test/khoi-dong-don.spec.ts`
  severity: medium
  Đề xuất: known-limits
- **Lệch giữa eval và bài — E3 ca (2) hứa «số lần hỏi > 3», bài chỉ đếm số lần hỏi tới máy SAU khi máy đã mở**
  Người dùng thấy gì: Mô tả phép đo nói số lần hỏi phải trên ba, nhưng bài thử chỉ đếm những lần hỏi sau khi máy đã mở. Hành vi chờ vẫn được kiểm, chỉ con số trong mô tả không khớp.
  file: `apps/agent-okr/test/khoi-dong-don.spec.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/16 lỗi rơi vào file không bộ đo nào phủ (_acceptance/ca-chap-chon-cach-ly/rang/ban-sao.mjs, apps/agent-okr/test/support/eve-gia.ts, _acceptance/ca-chap-chon-cach-ly/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.

