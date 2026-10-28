## Trong hợp đồng

- **Tên và «Vì sao» của một mục tiêu có sẵn dùng chung một hàng lưu: lưu «Vì sao» xoá dấu lỗi của tên, và việc chờ có thể bị đè**
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/use-ghi-ban-nhap.ts:262`
  severity: medium
  AC: AC-9
  source: bugs
  detail: luuTenCo (dòng 243) và luuViSaoCo (dòng 262) cùng gọi luuDong.luu(mt.id, …), nên cả hai dùng chung một Hang và một ô trạng thái trong useLuuDong. Mỗi việc chỉ gửi một trường: tên chỉ gửi title, «Vì sao» chỉ gửi whyNow.

  (1) Lỗi bị xoá mà không báo, xảy ra lần lượt chứ không cần đua. Lưu tên hỏng thì trạng thái thành {loai:'loi'}. Vì giuChuKhiLoiLuu mặc định là true, banNhap.tenCo vẫn giữ tên vừa gõ. Ca tên ngắn hơn tenToiThieu cũng vậy: trạng thái là chua-luu 'thieu-ten'. Sau đó người dùng sửa «Vì sao» rồi rời ô. luu() gọi doiGo(mt.id,false), chay() đặt 'dang-luu', rồi khi thành công đặt YEN (use-luu-dong.ts:92) đè lên lỗi của tên. Ô tên vẫn hiện chữ chưa lưu nhưng TrangThaiDong của mt.id không còn báo gì. coChuaLuu thành false, nên HoiKhiDong không hỏi khi đóng khung, và tên đã gõ mất hẳn mà không có lời nào.

  (2) Việc chờ bị đè. Khi một việc đang chạy, luu() ghi đè hang.cho bằng việc mới (use-luu-dong.ts:113). Chuỗi bị mất: lưu tên đang chạy, xếp «Vì sao» vào chờ, rồi sửa tên lần nữa. Lúc đó việc «Vì sao» bị thay và whyNow không bao giờ được gửi. Với KR, cách thay này không mất gì, vì mỗi việc luuKrCo mang đủ mọi trường. Ở đây hai việc mang hai trường khác nhau.

  Cách sửa: đặt khoá riêng cho từng trường (ví dụ `${mt.id}:ten` và `${mt.id}:viSao`), hoặc gộp title và whyNow vào cùng một việc như luuMucTieu đang làm.
  lý do vào hợp đồng: AC-9 hứa lưu lỗi giữ chữ đã gõ, hiện câu lỗi và lưu lại khi rời ô; finding cho thấy dấu lỗi của tên bị xoá âm thầm và chữ «Vì sao» có thể không bao giờ được gửi, kéo theo hộp «Bỏ dòng chưa lưu?» của AC-8 không hỏi.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Save errors are classified by running a regex over the server's display text instead of reading structured error data**
  Người dùng thấy gì: Hôm nay người dùng gõ sai số vẫn thấy câu «Ô này nhận số…». Nếu sau này đổi cách máy chủ viết câu lỗi, họ có thể chỉ thấy câu lỗi chung chung.
  Căn cứ: Hiện chưa ai gặp lỗi nào, chỉ là rủi ro khi sửa về sau; nếu xảy ra thì người dùng vẫn thấy lỗi và gõ lại được, nên hậu quả nhẹ.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/use-luu-dong.ts`
  severity: medium
  Đề xuất: known-limits

- **Keyboard hint built from Badge variant="mono" instead of installing shadcn kbd**
  Người dùng thấy gì: Gợi ý phím Enter ở nút thêm KR hiện bằng một nhãn có sẵn thay vì thành phần phím chuẩn. Người dùng vẫn đọc được và dùng được bình thường.
  Căn cứ: Chỉ khác về cách dựng bên trong, người dùng không thấy khác biệt đáng kể và không mất gì; sửa sau rất rẻ nếu muốn.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/dong-muc-tieu.tsx`
  severity: low
  Đề xuất: wont-fix

- **Chip «Kara · N góp ý» ở mục «KR tôi phụ trách» dẫn chủ KR không sửa được bộ tới phiếu mục tiêu không còn chỗ xem góp ý; neo bị xoá mà không báo**
  Người dùng thấy gì: Người phụ trách một KR nhưng không sửa được bộ thấy chip «N góp ý», bấm vào thì không thấy góp ý nào. Họ không còn cách xem hay nhận góp ý Kara cho KR của mình.
  Căn cứ: Không mất dữ liệu nhưng người dùng bấm vào một lối cụt và mất đường xem góp ý; cần quyết định sản phẩm về việc chủ KR có được xem góp ý hay không nên tách thành việc riêng.
  file: `apps/app/components/crm/record-sheet/objective-sheet.tsx`
  severity: medium
  Đề xuất: new-contract

- **Shape 2/4: the 'vung con' red direction uses a hand-written element shaped for the reader's selector instead of the real VungKara**
  Người dùng thấy gì: Sản phẩm hiện không còn khối Kara trong phiếu mục tiêu như hứa. Nhưng bài kiểm tự động có thể không bắt được nếu sau này ai đó dựng lại khối đó.
  Căn cứ: Người dùng hôm nay không bị ảnh hưởng; rủi ro chỉ là một hồi quy tương lai lọt qua bài kiểm, và vá bài kiểm sau cũng không đắt.
  file: `apps/app/test/che-do-soan-bo-okr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 4: `[data-de-xuat-neo]` is a negative assertion on a selector that has never had a producer**
  Người dùng thấy gì: Một điểm kiểm tự động về góp ý neo dưới KR không bao giờ có thể đỏ. Người dùng không thấy khác biệt vì chốt chặn thật vẫn nằm ở dòng kiểm kế bên.
  Căn cứ: Không ảnh hưởng người dùng và có chốt chặn thật khác; sửa hay không đều gần như không đổi độ an toàn.
  file: `apps/app/test/che-do-soan-bo-okr.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Shape 4: 'tRPC write calls = 0' after typing in read-only mode cannot go red, because the action never triggers a save**
  Người dùng thấy gì: Ở chế độ chỉ xem, ô nhập đang khoá nên người dùng không ghi được gì. Bài kiểm tự động chưa chứng minh được riêng việc không có lệnh ghi nào sau khi gõ.
  Căn cứ: Ô đã bị khoá nên người dùng không gây ghi được hôm nay; chỉ là bằng chứng kiểm thử yếu hơn lời hứa.
  file: `apps/app/test/che-do-soan-bo-okr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 4: mnt-khoa loses the positive control for the write counter; '0 write mutations' is now negative-only**
  Người dùng thấy gì: Bài kiểm tự động của hộp «Thêm mục tiêu» khi bị khoá không còn có phép thử chứng minh bộ đếm lệnh ghi hoạt động. Người dùng không thấy khác gì ở màn hình.
  Căn cứ: Thay đổi này nằm trong lớp chủ kho đã duyệt, mở Soạn nay không còn gọi lệnh ghi nên đối chứng cũ không còn ý nghĩa; không ảnh hưởng người dùng.
  file: `apps/app/test/mot-nut-tao-muc-tieu.dom.tsx`
  severity: medium
  Đề xuất: wont-fix

- **Shape 3: «ANH 10/10» only checks that a file exists and is non-empty, while the files are already committed in git**
  Người dùng thấy gì: Phép kiểm ảnh chỉ xem đủ mười ảnh có mặt, chưa chắc ảnh là của lượt chạy này. Người ký có thể xem ảnh cũ mà không biết.
  Căn cứ: Không ảnh hưởng người dùng cuối; người ký vẫn tự nhìn ảnh ở Cổng 2 và chạy lại là có ảnh mới, nên hậu quả nhẹ.
  file: `_acceptance/che-do-soan-bo-okr/rang/man-soan-do.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
