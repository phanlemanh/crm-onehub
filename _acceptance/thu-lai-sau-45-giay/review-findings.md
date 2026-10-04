# Review findings: thu-lai-sau-45-giay (round 1)

## Trong hợp đồng

- **Hình dạng 3 — assert 'chuỗi có mặt' trong khi lời hứa là QUAN HỆ: E5 không so thân/status của cửa với thân/status của Trợ lý**
  file: `apps/app/test/soan-okr-huy-luot.spec.ts:75`
  severity: medium
  AC: AC-5
  source: measurement
  detail: AC-5 hứa cửa trả nguyên status và thân của Trợ lý, và evals.yaml E5 ghi rõ 'thân toEqual thân của Trợ lý'. Nhưng test chỉ có `expect(than).toHaveProperty("ok", true)` (dòng 75) và `expect(res.status).toBe(200)` (dòng 74). Đây là kiểm một trường có mặt và một hằng số, không phải quan hệ giữa hai giá trị. Thân giả của Trợ lý (khung-cua-hoan.ts dòng 76-78) là `{ ok: true, sessionId: <suffix>-eve-N, continuationToken: 'eve:...' }`, mà test không lấy giá trị này ra để so. Vì vậy một cửa trả hằng `{ok:true}`, hoặc sửa/bỏ sessionId/continuationToken, vẫn xanh. Phần status cũng vậy: chỉ thử một giá trị (ketQua=200), nên một cửa trả cứng 200 cho đường /cancel vẫn qua. Muốn đo đúng lời hứa thì phải toEqual với thân Trợ lý thật đã trả cho lời gọi đó (ví dụ dựng lại từ k.trangThai.soLanFetch hoặc ghi lại response của fetchGia), và thử thêm ít nhất một status khác 200.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The "turn has ended" signal comes from the local stop(), not the server's turn.cancelled — this contradicts eve's documented cancel contract**
  Người dùng thấy gì: Bấm Thử lại có thể gửi lại tin khi Trợ lý chưa kịp dừng hẳn lượt cũ, nên đôi khi người dùng vẫn thấy câu «Chưa gửi lại được» dù đã chờ đúng. Muốn chặt hơn thì phải làm một tính năng riêng, chờ máy chủ báo lượt cũ đã khép.
  file: `apps/app/app/(app)/[slug]/okr/soan/dung-cuoc-soan.ts`
  severity: high
  Đề xuất: new-contract

- **Cancel uses a hand-built fetch instead of eve's ClientSession.cancel(); status is not checked and errors are swallowed**
  Người dùng thấy gì: Khi yêu cầu huỷ bị từ chối hoặc rớt mạng, màn vẫn coi như đã huỷ và gửi lại tin, nên người dùng có thể thấy lời từ chối chung chung thay vì lý do thật.
  file: `apps/app/app/(app)/[slug]/okr/soan/dung-cuoc-soan.ts`
  severity: medium
  Đề xuất: known-limits

- **After a cancel, the resent message's stream stops at the OLD turn's turn.cancelled/session.waiting, so the new reply never shows**
  Người dùng thấy gì: Sau khi bấm Thử lại, tin có thể đã gửi đi nhưng câu trả lời mới của Trợ lý không hiện ra, màn lại im như trước. Cần một tính năng riêng để màn đọc đúng lượt mới sau khi huỷ lượt cũ.
  file: `apps/app/app/(app)/[slug]/okr/soan/dung-cuoc-soan.ts`
  severity: high
  Đề xuất: new-contract

- **Cancel request errors are swallowed and treated as a successful cancel**
  Người dùng thấy gì: Nếu lệnh huỷ lượt cũ bị từ chối (hết phiên đăng nhập, mất mạng, Trợ lý bận), màn vẫn gửi lại tin và người dùng thấy một lời từ chối khó hiểu, không biết thật ra lệnh huỷ đã hỏng.
  file: `apps/app/app/(app)/[slug]/okr/soan/dung-cuoc-soan.ts`
  severity: medium
  Đề xuất: new-contract

- **A late cancel reply from an earlier click marks daHuy for a later wait**
  Người dùng thấy gì: Hiếm khi, nếu lệnh huỷ đầu bị treo rất lâu rồi người dùng bấm Thử lại lần nữa, tin có thể được gửi lại sớm hơn lệnh huỷ thứ hai và bị Trợ lý từ chối.
  file: `apps/app/app/(app)/[slug]/okr/soan/dung-cuoc-soan.ts`
  severity: low
  Đề xuất: wont-fix

- **E7 fake Tro ly does not model real eve cancel: it replies only after the turn ends and never writes the cancellation boundary to the stream**
  Người dùng thấy gì: Phép thử trên màn thật dùng một Trợ lý giả không giống hệt Trợ lý thật, nên một lỗi chỉ xảy ra với Trợ lý thật có thể lọt qua mà không bị phát hiện.
  file: `_acceptance/thu-lai-sau-45-giay/rang/thu-lai-45s-man-that.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — assertion âm tính một mình: 'lượt mở đầu bị từ chối không báo chưa gửi lại' thiếu đối chứng dương rằng lượt mở đầu đã thật sự bị từ chối**
  Người dùng thấy gì: Một bài kiểm phụ có thể xanh mà không thật sự chứng minh rằng lượt mở đầu bị từ chối sẽ không hiện câu «Chưa gửi lại được». Hậu quả với người dùng thấp, chỉ làm giảm độ tin của bài kiểm.
  file: `apps/app/test/soan-okr-thu-lai-45s.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
