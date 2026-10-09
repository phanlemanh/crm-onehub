# Review findings — ly-do-can-chinh-tu-soan (round 1)

## Trong hợp đồng

- **E1/AC-1 promises the objective and KR counts still match, but the dua-vao test never checks them**
  AC: AC-1
  file: `apps/api/test/okr-ly-do-can-chinh.spec.ts:112`
  severity: low
  source: bugs
  detail: AC-1 ends with «mục tiêu và KR đưa vào như trước». E1's expected says «số mục tiêu và KR đưa vào khớp như bài cũ». In the dua-vao test, nhanVaDuaVao only checks `ra.ok` on SoanDuaVaoOutput and throws if it is false. It never asserts `ra.soMucTieu`, `ra.soKr` or `ra.mucTieuIds.length`, and it never reads okrObjective or okrKeyResult back from the database. A regression in soan-dua-vao.ts that still returns ok: true but creates the wrong number of objectives or KRs would leave E1 green. Add `expect([ra.soMucTieu, ra.soKr]).toEqual([1, 1])`, or a DB count by taoRaId of m.mucTieu and m.kr.
  rationale: AC-1 có vế rõ ràng «mục tiêu và KR đưa vào như trước» mà bài thử không khẳng định, nên AC-1 chưa được chứng minh đủ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E11 (do-nguong) checks 0 against data E1/E6 never seeded, so the 0 passes trivially**
  Người dùng thấy gì: Phép kiểm cuối cùng xác nhận mọi căn chỉnh đưa vào từ Soạn OKR đều giữ lý do đang đếm trên một kho trống, nên nó luôn báo đạt. Nếu sau này lý do bị rơi mất khi đưa vào OKR, phép kiểm này vẫn xanh, và chỉ phép kiểm đưa-vào riêng còn bắt được.
  file: `apps/api/test/okr-ly-do-can-chinh.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm-tính-một-mình): E11 khẳng định «đếm = 0» trên một kho không có dữ liệu E1/E2/E6, và chiều đỏ khai báo không được đo**
  Người dùng thấy gì: Phép kiểm tổng «không căn chỉnh nào thiếu lý do» chạy trên dữ liệu rỗng nên không thể đỏ, dù đường đưa vào OKR có làm rơi lý do. Người dùng không thấy gì khác đi ngay, nhưng một lỗi mất lý do về sau có thể lọt qua phép kiểm này mà không ai biết.
  file: `apps/api/test/okr-ly-do-can-chinh.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm-tính-một-mình): đối chứng «bộ ghi từ chối viSao rỗng» chỉ kiểm safeParse thất bại, không có đối chứng dương, không ghim đường lỗi viSao**
  Người dùng thấy gì: Phép kiểm rằng dòng nháp có lý do rỗng không thể được lưu chỉ xác nhận «bị từ chối» mà không xác nhận bị từ chối vì đúng lý do rỗng. Nếu sau này dòng nháp bị từ chối vì một lỗi khác, phép kiểm vẫn xanh và người dùng có thể vẫn bị chặn nhầm mà không ai hay.
  file: `apps/api/test/okr-ly-do-can-chinh.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
