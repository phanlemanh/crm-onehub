# Review findings: che-do-soan-bo-okr (round 4)

## Trong hợp đồng

Không có finding nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The save-error type is read by running a regex over the server's message text, not from a parsed field**
  Người dùng thấy gì: Hiện nay khi nhập sai số, người dùng vẫn thấy câu «Ô này nhận số…». Nếu sau này máy chủ đổi cách viết câu lỗi, người dùng sẽ lặng lẽ chỉ thấy câu lỗi chung chung hơn.
  Căn cứ: Chưa có hậu quả với người dùng hôm nay, nếu hỏng chỉ làm câu lỗi kém cụ thể chứ không mất dữ liệu, và sửa được sau khi có lý do đổi phía máy chủ.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/use-luu-dong.ts`
  severity: low
  Đề xuất: known-limits

- **The production tree carries 16 test-only switches through PhuThuocSoanContext, including one that turns off the read-only-by-permission check**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào. Mã chạy thật mang thêm các nhánh chỉ dùng cho kiểm thử, nên màn có thêm phần thừa và việc đọc, bảo trì khó hơn.
  Căn cứ: Không ảnh hưởng người dùng và không mở lỗ hổng vì quyền ghi vẫn do máy chủ giữ; sửa tốn công lớn (gỡ cả cơ chế và viết lại bài kiểm) so với lợi ích.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/phu-thuoc.ts`
  severity: low
  Đề xuất: wont-fix

- **tenMuon/viSaoMuon keep a value from a blur with no edit, then a later save sends that old value and undoes Kara's accepted rewrite**
  Người dùng thấy gì: Trong một tình huống hẹp, người soạn nhận câu Kara viết lại cho tên hay lý do, rồi rời sang ô kia, thì chữ cũ có thể bị ghi đè lên và câu Kara vừa nhận biến mất mà không báo gì.
  Căn cứ: Mất lặng lẽ chữ vừa nhận từ Kara nên đáng sửa, nhưng chỉ xảy ra với một thứ tự thao tác hẹp và người dùng gõ lại hoặc nhận lại được; sửa nhỏ, nên làm thành việc riêng.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/use-ghi-ban-nhap.ts`
  severity: medium
  Đề xuất: new-contract

- **suaKr/themKr rewrite bn.kr without rows that were marked deleted, so restoring a row after a failed delete fails silently**
  Người dùng thấy gì: Nếu xoá một KR bị lỗi đúng lúc người soạn đang thêm hay gõ KR khác của cùng mục tiêu, KR đó biến khỏi màn soạn dù vẫn còn trên máy chủ, và khi đóng khung có thể hỏi về thay đổi chưa lưu mà người dùng không thấy.
  Căn cứ: Cần hai việc trùng nhau là xoá lỗi và gõ tiếp ngay lúc đó nên hiếm; dữ liệu không mất vì KR vẫn còn ở máy chủ và tải lại màn là thấy lại.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/ban-nhap.ts`
  severity: low
  Đề xuất: known-limits

- **useQuyenSoanBo returns null forever when the danhSach/cycles query fails, so the suggestions chip disappears and the neoGopY anchor is never cleared**
  Người dùng thấy gì: Khi việc tải thông tin quyền hay chu kỳ bị lỗi, chip «Kara · N góp ý» biến mất không kèm thông báo, và menu xoá mục tiêu nháp cũng không hiện. Người dùng không biết vì sao, nhưng tải lại trang là có lại.
  Căn cứ: Chỉ xảy ra khi mạng hay máy chủ lỗi, không mất dữ liệu, người dùng tự khắc phục bằng cách tải lại; sửa sau cũng không đắt.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/use-bo-soan.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — chỉ kiểm «tệp có mặt» trong khi lời hứa là quan hệ giữa ảnh và lượt chạy: «ANH 10/10» không bao giờ đỏ**
  Người dùng thấy gì: Người ký có thể được cho xem ảnh chụp cũ của lần chạy trước mà bộ kiểm vẫn báo đủ mười ảnh, nên một ảnh không chụp được ở lần này có thể không bị phát hiện.
  Căn cứ: Không ảnh hưởng người dùng sản phẩm; chỉ làm bằng chứng nghiệm thu bớt chặt, và người ký vẫn tự xem ảnh được.
  file: `_acceptance/che-do-soan-bo-okr/rang/man-soan-do.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — khẳng định âm tính đứng một mình: mnt-hop lật thành «dòng soạn không có dấu Kara», không có đối chứng dương, không có chiều đỏ**
  Người dùng thấy gì: Bài kiểm xác nhận «dòng soạn không có dấu Kara» có thể xanh ngay cả khi bộ chọn của nó không bắt được dấu, nên nếu dấu Kara vô tình quay lại dòng soạn thì có thể không ai thấy.
  Căn cứ: Không ảnh hưởng người dùng hôm nay, chỉ làm lưới an toàn của một chi tiết giao diện yếu hơn; thêm đối chứng sau cũng rẻ.
  file: `apps/app/test/mot-nut-tao-muc-tieu.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
