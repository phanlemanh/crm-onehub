# Review findings: thu-lai-sau-45-giay

## Trong hợp đồng

- **A turn that finishes by itself leaves the old «Chưa gửi lại được…» error and locks the composer (breaks AC-2 «chỗ báo lỗi tắt»)**
  file: `apps/app/app/(app)/[slug]/okr/soan/dung-cuoc-soan.ts:220`
  severity: high
  source: bugs
  AC: AC-2
  detail: `khiKhep` handles a turn that closes on its own (`kieuKhep` → "thuong") by calling `boChuoi(false)`. `boChuoi(false)` clears `choGuiLai` and `dangChoKhep`, but it never resets `loiGuiLai`. Only `guiLai` sets `loiGuiLai` back to false, and the "thuong" path does not call it. `loiGuiLai` feeds `hong`, `trongChuoiThu` and `chuaGuiLai`, and `hong` feeds `khoaSoan`.

  How to reproduce, using the flow the test 'gui-lai-bi-tu-choi: phien con ban thi bam tiep huy lai' already sets up:
  1. Press «Thử lại» while the turn is busy. The cancel fails or the resend is rejected, so `loiGuiLai` = true.
  2. The old turn is still streaming. Press «Thử lại» again, which runs `huyLuot`.
  3. The old turn then finishes normally (`session.waiting` with no `turn.cancelled`), so the result is "thuong".

  Result: the answer is on screen, `busy` is false, but the alert still says «Chưa gửi lại được — lượt trước chưa dừng hẳn…» with «Đã thử lại 2 lần», and the composer stays locked. The only way out is «Thử lại», which goes to `guiLai(tin)` because the session is idle. That resends a message that already got an answer, a duplicate turn that uses up quota.

  AC-2 says a turn that closes without `turn.cancelled` gets no resend and the error indicator turns off. No test covers `khep("thuong")` after `loiGuiLai` is set. Fix: call `setLoiGuiLai(false)` on the "thuong" branch.
  rationale: AC-2 nói rõ lượt cũ khép mà không có turn.cancelled (tự xong) thì chỗ báo lỗi tắt; đường này vẫn để lại câu lỗi và khoá ô nhập.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **giu-r1h.mjs anchors its 'signed file untouched' guard to a moving merge-base and fails open after merge**
  Người dùng thấy gì: Sau khi tính năng này được gộp, bài kiểm giữ nguyên các bài kiểm đã ký của vòng trước sẽ không còn so với bản đã ký nữa nên không còn bảo vệ được gì. Người dùng không thấy ảnh hưởng, chỉ là lưới an toàn cho vòng sau mỏng đi.
  file: `_acceptance/thu-lai-sau-45-giay/rang/giu-r1h.mjs`
  severity: medium
  Đề xuất: known-limits

- **Cancel URL is hand-built and duplicates the route shape CUA_OKR already owns**
  Người dùng thấy gì: Nếu sau này đổi đường dẫn huỷ ở một nơi mà quên nơi kia, nút Thử lại sẽ báo chưa gửi lại được dù không có lỗi thật. Hiện tại hai nơi đang khớp nhau nên người dùng chưa gặp vấn đề.
  file: `apps/app/app/(app)/[slug]/okr/soan/huy-luot.ts`
  severity: low
  Đề xuất: wont-fix

- **After a failed cancel the chain is dropped but the stream keeps running, so the error and lock stay after the old turn completes**
  Người dùng thấy gì: Khi huỷ không được rồi lượt cũ tự trả lời xong, màn vẫn báo chưa gửi lại được và khoá ô nhập dù câu trả lời đã hiện. Bấm Thử lại lúc đó sẽ gửi lại một tin đã có trả lời và tốn thêm một lượt.
  file: `apps/app/app/(app)/[slug]/okr/soan/dung-cuoc-soan.ts`
  severity: medium
  Đề xuất: new-contract

- **Shape 5 (claims a class, tests point cases): the 'cancel reply does not match the schema' class has one case that breaks two fields at once**
  Người dùng thấy gì: Bài kiểm chưa phân biệt từng kiểu hồi âm huỷ sai, nên sau này nếu ai nới lỏng việc kiểm hồi âm thì có thể không bị phát hiện. Hiện tại người dùng không bị ảnh hưởng.
  file: `apps/app/test/soan-okr-thu-lai-45s.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (asserts presence, promise is a relation): turn.cancelled must belong to turn T, but no fixture uses a different turnId**
  Người dùng thấy gì: Bài kiểm chưa có ca một lượt khác bị huỷ, nên nếu sau này ai bỏ điều kiện đúng lượt thì có thể gửi lại nhầm mà không ai hay. Hiện tại màn vẫn chạy đúng.
  file: `apps/app/test/soan-okr-thu-lai-45s.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (asserts presence, promise is a relation): 'last message.received' is never tested with more than one message.received**
  Người dùng thấy gì: Bài kiểm chưa thử phiên có nhiều tin nên có thể không phát hiện nếu sau này màn lấy nhầm lượt cũ để huỷ. Hiện tại người dùng không gặp lỗi.
  file: `apps/app/test/soan-okr-thu-lai-45s.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Shape 4 (lone negative assertion): the giu-r1h ratchet pins only the 'error not shown' half of 'the 45 s timer resets'**
  Người dùng thấy gì: Ai đó có thể lặng lẽ xoá phép kiểm rằng báo lỗi quay lại sau 45 giây mà bộ giữ vẫn xanh. Người dùng chưa bị ảnh hưởng, chỉ là kiểm tra yếu đi.
  file: `_acceptance/thu-lai-sau-45-giay/rang/giu-r1h.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (lone negative assertion): 'opening turn refused does not show chuaGuiLai' asserts only coLoi()===false and never checks that the refused send happened**
  Người dùng thấy gì: Bài kiểm lượt mở đầu bị từ chối có thể xanh dù lượt đó chưa thật sự bị từ chối. Người dùng không thấy khác biệt, chỉ là độ tin cậy của bài kiểm thấp hơn.
  file: `apps/app/test/soan-okr-thu-lai-45s.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture shaped for the reader): onFinish snapshots are built by hand and cast `as Snap` / `as SuKien[]`, never taken from a real EveAgentStore and fed to kieuKhep**
  Người dùng thấy gì: Hai trường hợp lượt cũ tự xong và lượt khép lỗi chỉ được thử bằng dữ liệu giả dựng tay, nên nếu Trợ lý thật gửi dữ liệu khác một chút thì có thể xử lý sai mà chưa ai thấy.
  file: `apps/app/test/soan-okr-thu-lai-45s.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
