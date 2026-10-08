# Review findings: ca-chap-chon-cach-ly (round 2)

## Trong hợp đồng

Không có finding nào map được vào AC ở round này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The 600_000 ms command timeout is written twice in the same area instead of coming from one shared constant**
  Người dùng thấy gì: Hai chỗ trong bộ kiểm của vòng này cùng ghi một con số giới hạn thời gian, nên sau này ai đổi một chỗ phải nhớ đổi chỗ kia. Hiện tại mọi thứ vẫn chạy đúng và người dùng không thấy ảnh hưởng nào.
  file: `_acceptance/ca-chap-chon-cach-ly/rang/du-ca.mjs`
  severity: low
  Đề xuất: wont-fix

- **(r1) SOKR_KHONG_CHAY_AGENT_CU added to turbo globalPassThroughEnv but has no entry in .env.example**
  Người dùng thấy gì: Công tắc bỏ ca kiểm hoạt động đúng nhưng chưa có dòng nào ghi trong tài liệu cấu hình, nên người tiếp quản khó biết nó tồn tại. Ship như hiện tại, ghi rõ là còn thiếu phần mô tả.
  file: `turbo.json`
  severity: medium
  Đề xuất: known-limits

- **(r1) ban-sao.mjs hardcodes /private/tmp instead of the os.tmpdir()/mkdtemp pattern every other tooth script uses**
  Người dùng thấy gì: Phép thử chứng minh bước dọn có tác dụng chỉ chạy được trên máy Mac. Trên máy chủ Linux của công ty nó sẽ dừng mà không cho kết quả, và nếu bị ngắt giữa chừng có thể để sót thư mục tạm.
  file: `_acceptance/ca-chap-chon-cach-ly/rang/ban-sao.mjs`
  severity: medium
  Đề xuất: known-limits

- **(r1) Process-check helpers duplicated: eve-gia.ts re-exports songCon, which already exists in khoi-dong.ts; mo-coi.mjs copies ps/cayCon/song**
  Người dùng thấy gì: Cùng một đoạn kiểm tra tiến trình còn sống được chép ở vài nơi. Hiện vẫn chạy đúng, nhưng sau này sửa một nơi mà quên nơi kia thì các phép thử có thể lệch nhau.
  file: `apps/agent-okr/test/support/eve-gia.ts`
  severity: low
  Đề xuất: known-limits

- **(r1) Orphan check matches only the generic '/node_modules/.bin/eve dev', while E2 promises a check against '<gốc>/node_modules/.bin/eve dev'**
  Người dùng thấy gì: Bước bảo vệ khỏi dừng nhầm tiến trình khác thực tế dựa vào thời điểm khởi chạy nên rất khó dừng nhầm. Nhưng mô tả của phép đo nói kiểm chặt hơn những gì máy thật sự kiểm.
  file: `apps/agent-okr/test/support/khoi-dong.ts`
  severity: low
  Đề xuất: known-limits

- **(r1) chu.json is rewritten in place without an atomic write, so a waiting process can read it empty, treat a live lock as stale, kill the owner's eve and remove the lock**
  Người dùng thấy gì: Khi hai lượt kiểm cùng chờ một máy, có một khoảnh khắc ngắn lượt chờ có thể tưởng khoá đang dùng là khoá cũ, rồi dừng nhầm máy của lượt đang chạy. Hiếm gặp nhưng khi xảy ra thì lại đỏ chập chờn đúng thứ vòng này muốn trừ.
  file: `apps/agent-okr/test/support/khoi-dong.ts`
  severity: medium
  Đề xuất: new-contract

- **(r1) Adding an await between the stale check and rmSync widens the window in which a second waiter deletes the lock the first waiter just took**
  Người dùng thấy gì: Khi hai tiến trình cùng chờ để dọn máy mồ côi, tiến trình đến sau có thể xoá nhầm khoá mà tiến trình đến trước vừa lấy, làm hai bên cùng chạy một máy và một bên báo lỗi. Cần một hợp đồng riêng nếu muốn trừ hẳn.
  file: `apps/agent-okr/test/support/khoi-dong.ts`
  severity: medium
  Đề xuất: new-contract

- **(r1) If spawn fails, `pid ?? 0` makes the alive check pass for nothing and makes cleanup SIGKILL the whole process group**
  Người dùng thấy gì: Nếu bài thử không dựng được tiến trình giả, bài vẫn báo xanh mà không kiểm gì, và bước dọn có thể giết cả nhóm tiến trình đang chạy cùng, kể cả bộ chạy test. Chỉ xảy ra khi máy thiếu công cụ cần thiết.
  file: `apps/agent-okr/test/khoi-dong-don.spec.ts`
  severity: low
  Đề xuất: known-limits

- **(r1) mo-coi.mjs only tracks the orphaned agent-okr eve; an orphaned apps/agent eve from the same killed run is never stopped (it stays alive in do mode)**
  Người dùng thấy gì: Sau phép thử giết lượt giữa chừng, một tiến trình máy của gói bên cạnh có thể còn sót lại trên máy người chạy. Không ảnh hưởng kết quả, chỉ để lại rác tạm.
  file: `_acceptance/ca-chap-chon-cach-ly/rang/mo-coi.mjs`
  severity: low
  Đề xuất: known-limits

- **(r1) Hình dạng 4 — E9 chỉ khẳng định âm «không có tệp cấm», không có đối chứng dương rằng danh sách diff thật có nội dung**
  Người dùng thấy gì: Phép kiểm "không đụng mã sản phẩm" sẽ báo đạt cả khi nó không thấy tệp nào đổi vì đo sai khoảng. Kết luận hiện đúng, nhưng chưa có đối chứng chứng minh máy đang nhìn đúng chỗ.
  file: `_acceptance/ca-chap-chon-cach-ly/rang/pham-vi.mjs`
  severity: medium
  Đề xuất: known-limits

- **(r1) Hình dạng 5 — AC-2 khai lớp «không phải eve dev CỦA GỐC ĐÓ», nhưng chỉ có một điểm-case `sleep`, không phân biệt được việc so có gốc hay không gốc**
  Người dùng thấy gì: Bài thử chỉ kiểm trường hợp tiến trình hoàn toàn lạ, chưa kiểm trường hợp một máy eve của thư mục khác. Việc bảo vệ khỏi dừng nhầm vẫn hoạt động nhưng chưa được chứng minh cho riêng trường hợp đó.
  file: `apps/agent-okr/test/khoi-dong-don.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **(r1) Hình dạng 3 — AC-1 hứa thứ tự «dừng TRƯỚC khi eve mới được gọi», nhưng bài chỉ đo «rồi cũng chết» trong 10 s sau khi giuKhoaEve trả về**
  Người dùng thấy gì: Bài thử chỉ xác nhận máy cũ rồi cũng bị dừng trong vài giây, chưa xác nhận nó đã dừng hẳn trước khi máy mới được gọi. Mã hiện chạy đúng thứ tự nhưng nếu sau này ai đó làm sai thứ tự thì bài thử có thể không bắt được.
  file: `apps/agent-okr/test/khoi-dong-don.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **(r1) Hình dạng 3 — vế «khoiDongEve vẫn ném lỗi có tên (pid, url, lệnh kill)» của AC-2 chỉ được đo bằng sự có mặt của một cụm chữ, trên bản sao đã phá**
  Người dùng thấy gì: Thông báo lỗi khi gặp máy lạ chỉ được kiểm là có xuất hiện câu quen thuộc, chưa kiểm là đủ số tiến trình, địa chỉ và lệnh dừng. Người chạy có thể gặp thông báo thiếu chi tiết mà bài thử không báo đỏ.
  file: `_acceptance/ca-chap-chon-cach-ly/rang/mo-coi.mjs`
  severity: medium
  Đề xuất: known-limits

- **(r1) Hình dạng 1 — «ném trước khi hook app-rieng hết giờ» được đo bằng cách so hai hằng cấu hình, không đo thời điểm lỗi thật sự ra**
  Người dùng thấy gì: Việc báo lỗi có tên trước khi bài thử hết giờ chỉ được kiểm bằng cách so hai con số cấu hình, không đo thời gian thật. Trong tình huống chậm nhiều lớp, lỗi có thể ra muộn hơn người ta tưởng.
  file: `apps/agent-okr/test/khoi-dong-don.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **(r1) Lệch giữa eval và bài — E3 ca (2) hứa «số lần hỏi > 3», bài chỉ đếm số lần hỏi tới máy SAU khi máy đã mở**
  Người dùng thấy gì: Mô tả phép đo nói số lần hỏi phải trên ba, nhưng bài thử chỉ đếm những lần hỏi sau khi máy đã mở. Hành vi chờ vẫn được kiểm, chỉ con số trong mô tả không khớp.
  file: `apps/agent-okr/test/khoi-dong-don.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

