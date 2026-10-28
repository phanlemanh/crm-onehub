# Review findings: hop-tuan-tren-bang (round 1)

## Trong hợp đồng

- **Race: the board reads stale hopTuan data after a submit, so the KR that moves to the collapsed «Còn lại» section disappears and loses focus (AC-4e fails outside the test)**
  file: apps/app/app/(app)/[slug]/okr/hop-tuan.tsx:533
  severity: medium
  AC: AC-4
  source: bugs
  detail: In HopThoaiCapNhatKr.onSuccess, `cache.okr(objectiveId, { settle: "record" })` only waits for `objective` and `comments`. `hopTuan` is in the `rest` group of `run()` in apps/app/lib/trpc/cache.ts, so it is invalidated in the background with `void`. `onDaGui` then calls `setVuaGui(K)` and `qc.invalidateQueries({ queryKey: trpc.okr.hopTuan.queryKey() })`. The default is `cancelRefetch: true`, so if the background fetch is still running it is cancelled and started again. The cache keeps the old data until that fetch returns.

  The next render runs the effect in `BangCoDuLieu` with that old `d`. K is still in `d.dangBan` there, so `trongConLai` is false and `canMo` is false while `coDong` is true. The effect focuses K's button in «Đang bàn» and calls `xongGui()`, which clears `vuaGui`.

  When the new data arrives and K now sits in `conLai` (for example the «im» reason went away after the update), the row unmounts from Đang bàn and remounts inside the collapsed Collapsible. Nothing reopens it because `vuaGui` is already null. The KR the user just updated vanishes from view and focus drops to body. That is exactly what AC-4(e) is meant to prevent.

  The DOM test E4 (apps/app/test/hop-tuan-tren-bang.dom.tsx:540-612) does not catch this. The tRPC mock answers `okr.hopTuan` synchronously, so the background refetch has already landed before `onDaGui` runs. With a real network it only works when the hopTuan query (which computes the whole board) finishes before objective, comments, canhKr and dienBien.

  Fix: wait for the hopTuan refetch before calling `setVuaGui`, or don't clear `vuaGui` until data with `dataUpdatedAt` after the submit has arrived.
  rationale: AC-4 đòi nếu K rời Đang bàn sang Còn lại đang gập thì Còn lại tự mở và tiêu điểm về nút «Cập nhật» của K; finding mô tả đúng chiều ngược lại khi mạng thật chậm.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Schema đầu ra dongHop nới bằng .default() để mồi thử cũ thiếu khoá vẫn parse — trái luật «schema tả cái thật sự có»**
  Người dùng thấy gì: Màn Họp tuần vẫn hiện đúng cho người dùng. Chỉ là nếu sau này máy chủ lỡ thiếu thông tin đơn vị của một KR, màn sẽ hiện trống thay vì báo lỗi rõ ràng.
  Căn cứ: Người dùng không gặp hậu quả nào hôm nay vì dữ liệu luôn đầy đủ; chỉ làm khó phát hiện lỗi sau này, và sửa lúc này buộc phải đụng bài kiểm đã ký.
  file: `apps/api/src/okr/okr-xem.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **Làm mới cache bằng cách liệt khoá okr.hopTuan ngay ở chỗ gọi, thay vì qua useCrmCache, và trùng với lần làm mới cache.okr đã có**
  Người dùng thấy gì: Sau khi cập nhật một KR, bảng Họp tuần bị tải lại hai lần thay vì một. Người dùng chỉ có thể thấy bảng cập nhật chậm hơn một chút.
  Căn cứ: Nhẹ: dữ liệu cuối cùng vẫn đúng, không mất gì, chỉ tốn thêm một lượt tải; sửa thì động vào cách làm mới chung nên không đáng.
  file: `apps/app/app/(app)/[slug]/okr/hop-tuan.tsx`
  severity: medium
  Đề xuất: wont-fix

- **ngayThang viết lại hàm đã export ở cap-nhat-tuan.tsx**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào; ngày tháng trên bảng vẫn hiện đúng.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; chỉ là dọn mã cho gọn, làm sau cũng rẻ nên không cần mở việc riêng.
  file: `apps/app/app/(app)/[slug]/okr/hop-tuan/muc-doi.tsx`
  severity: low
  Đề xuất: wont-fix

- **Chuyển giaTri sang gia-tri-kr.ts nhưng vẫn re-export ở bang-kr, để lại hai đường import**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào; các con số trên bảng vẫn in đúng.
  Căn cứ: Không có hậu quả nào với người dùng; chỉ là dọn mã, sửa lúc nào cũng rẻ.
  file: `apps/app/app/(app)/[slug]/okr/bang-kr.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (âm tính một mình, đối chứng dương rỗng): «trước khi gửi Còn lại gập» được đo bằng việc phần Còn lại KHÔNG tồn tại**
  Người dùng thấy gì: Một lỗi sau này khiến phần «Còn lại» luôn mở sẵn có thể lọt qua bài kiểm mà không ai biết. Hôm nay người dùng thấy đúng.
  Căn cứ: Không gây hại cho người dùng ngay; chỉ làm lưới an toàn thủng một lỗ, và việc này vẫn có thể bổ sung sau khi gộp.
  file: `apps/app/test/hop-tuan-tren-bang.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không đối chứng dương): «đóng ngăn thì URL hết tham số nguồn» chỉ kiểm khoá chữ cứng `thuTuKr` vắng mặt, chưa từng kiểm nó có mặt**
  Người dùng thấy gì: Nếu sau này đổi cách ghi nhớ nguồn mở ngăn, bài kiểm vẫn xanh dù ngăn có thể đi sai thứ tự. Hôm nay người dùng không thấy lỗi.
  Căn cứ: Không ảnh hưởng người dùng hiện tại, tự khắc phục được bằng tải lại trang; chỉ là kiểm thử yếu.
  file: `apps/app/test/hop-tuan-tren-bang.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (đối chứng dương rỗng): DOI CHUNG DEM ở khổ 375 nhân bản một ghi chú đang hiện, nên luôn đếm ra 2**
  Người dùng thấy gì: Phép đo trên màn điện thoại không chứng minh được rằng mỗi ghi chú chỉ hiện một lần. Người dùng điện thoại vẫn thấy đúng, nhưng bằng chứng yếu hơn.
  Căn cứ: Không gây hại cho người dùng; chỉ làm bằng chứng ở khổ 375 kém chắc, có thể bổ sung sau.
  file: `_acceptance/hop-tuan-tren-bang/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): ca «bảng một KR thì không có đếm, không có ‹ ›» chỉ kiểm vắng mặt dưới `[data-dau-ngan-kr]`, không ghim đầu ngăn có mặt**
  Người dùng thấy gì: Nếu đầu ngăn KR không dựng được, bài kiểm vẫn có thể báo đạt. Người dùng hiện không gặp lỗi.
  Căn cứ: Không ảnh hưởng người dùng hôm nay; chỉ làm bài kiểm kém chắc cho trường hợp bảng chỉ có một KR.
  file: `apps/app/test/hop-tuan-tren-bang.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
