# Review findings: mot-nut-tao-muc-tieu (round 3)

## Trong hợp đồng

Không có phát hiện nào trong vòng này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 4 (assert âm tính một mình): «0 lần gọi thủ tục ghi» ở bốn ô đường dẫn của mnt-khoa vẫn không có hành động nào có thể làm nó sai; đối chứng dương mới đặt ở đường khác (r2 · tệp đã đổi)**
  Người dùng thấy gì: Khi người không có quyền mở thẳng đường dẫn tạo mục tiêu, bài kiểm tự động chỉ chứng minh chắc chắn là hộp không mở. Việc «không ghi gì vào dữ liệu» chưa có bài kiểm nào bắt được nếu sau này bị hỏng. Hiện sản phẩm không có lỗi nhìn thấy được.
  Căn cứ: Hậu quả nhẹ vì không phát hiện lỗi nào đang xảy ra với người dùng, chỉ là lưới an toàn cho thay đổi sau này hơi lỏng; không mất dữ liệu, và có thể siết bài kiểm sau với chi phí thấp.
  file: `apps/app/test/mot-nut-tao-muc-tieu.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assert âm tính một mình): ô trang server so-do và quanh của mnt-man-doc mù với thành phần client đặt trong PageShellActions; đối chứng dương chỉ phủ Button viết thẳng (r2 · tệp đã đổi)**
  Người dùng thấy gì: Nếu sau này ai đó thêm lại một nút tạo vào đầu trang Sơ đồ hay sơ đồ quanh một mục tiêu bằng một thành phần dựng ở phía trình duyệt, bài kiểm tự động có thể không phát hiện. Hiện tại hai màn này đúng là không có nút tạo nào.
  Căn cứ: Người dùng hiện không gặp lỗi gì, rủi ro chỉ là nút tạo lọt trở lại ở hai màn chỉ đọc mà không ai báo; nếu lọt thì người dùng thấy ngay và sửa sau được, không mất dữ liệu.
  file: `apps/app/test/mot-nut-tao-muc-tieu.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Thước màn của các hồ sơ đã ký vẫn bấm đường cũ mà không có superseded_by (mới khai cho eval DOM) (r1)**
  Người dùng thấy gì: Một số bài đo màn của các tính năng đã ký trước đây vẫn bấm vào nút cũ đã bị gỡ, nên khi kiểm lại chúng sẽ báo đỏ dù tính năng không hỏng.
  Căn cứ: Không ảnh hưởng người dùng cuối nhưng làm các lần kiểm lại sau này đỏ giả và gây nhiễu; sửa cần một việc riêng đi qua 11 hồ sơ đã ký.
  file: `_acceptance/dieu-huong-khu-muc-tieu/evals.yaml`
  severity: high
  Đề xuất: new-contract

- **NutSoan nay là code chết, chỉ bài kiểm còn giữ nó sống; eval đã ký vẫn đo «nút soạn» trên chính component chết đó, còn logic và hằng thì bị nhân đôi sang duong-soan.ts (r1)**
  Người dùng thấy gì: Trong mã còn một nút Soạn cũ không còn hiện ở màn nào; người dùng không thấy gì, nhưng sau này hai bản logic có thể lệch nhau.
  Căn cứ: Không gây lỗi hay mất dữ liệu cho người dùng, chỉ là nợ bảo trì; dọn sau rẻ và không gấp.
  file: `apps/app/app/(app)/[slug]/okr/soan/duong-soan.ts`
  severity: medium
  Đề xuất: known-limits

- **Mở thẳng đường dẫn tuMauOkr thì vào hộp chọn mẫu rỗng không lối ra; nút «Viết tay» đã bị gỡ (r1)**
  Người dùng thấy gì: Nếu ai mở một liên kết cũ dẫn thẳng vào bước chọn mẫu cho đơn vị chưa có mẫu, họ thấy một hộp trống và chỉ còn cách đóng lại.
  Căn cứ: Hiếm gặp (cần liên kết cũ hoặc mẫu bị xoá), không mất dữ liệu và người dùng thoát được bằng cách đóng rồi bấm Thêm mục tiêu lại.
  file: `apps/app/app/(app)/[slug]/okr/tu-mau.tsx`
  severity: medium
  Đề xuất: known-limits

- **useCoMau gộp lúc đang tải và lúc lỗi vào lý do khoá «Chưa có mẫu cho cấp này» (r1 · tệp đã đổi)**
  Người dùng thấy gì: Trong lúc danh sách mẫu còn đang tải hoặc tải lỗi, dòng «Từ mẫu» có thể báo sai là chưa có mẫu cho cấp này.
  Căn cứ: Chỉ là thông báo sai thoáng qua, người dùng tải lại là hết và không mất dữ liệu.
  file: `apps/app/app/(app)/[slug]/okr/hop-chon-duong.tsx`
  severity: low
  Đề xuất: known-limits

- **DsCuocTheoUrl bỏ mất cổng quyền và pha mà NutSoan từng áp cho ?dsCuoc (r1)**
  Người dùng thấy gì: Người chỉ được xem có thể mở một liên kết để thấy danh sách các cuộc soạn của đơn vị, dù không có quyền soạn.
  Căn cứ: Dữ liệu vẫn được máy chủ lọc theo quyền nên không lộ gì thêm, chỉ lệch nếp giao diện; sửa sau rẻ.
  file: `apps/app/app/(app)/[slug]/okr/hanh-dong-khu.tsx`
  severity: low
  Đề xuất: known-limits

- **Biến thể khoá của Item làm mờ 50% đúng câu lý do khoá mà thiết kế đòi người dùng đọc được (r1)**
  Người dùng thấy gì: Các dòng bị khoá trong hộp Thêm mục tiêu bị làm mờ, nên câu giải thích vì sao khoá hơi khó đọc, nhất là với người nhìn kém.
  Căn cứ: Chữ vẫn hiện và đọc được ở mức vừa phải, không mất chức năng; sửa nằm ở thành phần dùng chung nên cần cân nhắc ảnh hưởng chỗ khác.
  file: `packages/ui/src/components/item.tsx`
  severity: low
  Đề xuất: known-limits

- **Hết cuộc soạn trong kỳ thì lối «Các cuộc đã soạn» biến mất, đúng ca mà quyết định d-15 muốn giữ (r1)**
  Người dùng thấy gì: Khi một đơn vị đã dùng hết số cuộc soạn trong kỳ, người dùng không còn cách nào mở lại danh sách các cuộc đã soạn từ màn này.
  Căn cứ: Mất một khả năng xem lại đang có, nhưng không mất dữ liệu và chỉ xảy ra ở đơn vị đã hết cuộc; nên xử lý bằng việc riêng.
  file: `apps/app/app/(app)/[slug]/okr/soan/duong-soan.ts`
  severity: high
  Đề xuất: new-contract

- **Chọn «Soạn cùng Kara» mà soanMo từ chối (ok:false, không có cuocDang) thì không có phản hồi nào, lý do bị bỏ (r1)**
  Người dùng thấy gì: Hiếm khi, bấm «Soạn cùng Kara» đúng lúc vừa hết lượt thì hộp đóng lại mà không có thông báo vì sao.
  Căn cứ: Chỉ xảy ra khi hai thao tác đua nhau, không mất dữ liệu và người dùng bấm lại sẽ thấy dòng đã khoá kèm lý do.
  file: `apps/app/app/(app)/[slug]/okr/soan/duong-soan.ts`
  severity: medium
  Đề xuất: known-limits

- **Mở ngăn ở chế độ «Từ mẫu» mà danh sách mẫu rỗng thì kẹt: không còn nút «Viết tay» để thoát (r1)**
  Người dùng thấy gì: Nếu mở lại một liên kết đang ở bước chọn mẫu mà đơn vị không còn mẫu, ngăn chỉ còn tiêu đề và danh sách trống, người dùng chỉ có thể bấm Huỷ.
  Căn cứ: Hiếm gặp, không mất dữ liệu, người dùng thoát được bằng Huỷ rồi làm lại từ nút Thêm mục tiêu.
  file: `apps/app/app/(app)/[slug]/okr/tu-mau.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): item-khoa kiểm chuỗi lớp Tailwind có mặt, không kiểm nền khi rê chuột của dòng khoá (r1)**
  Người dùng thấy gì: Dòng bị khoá trong hộp có thể vẫn đổi màu nền khi rê chuột, làm trông như bấm được, và bài kiểm hiện tại không phát hiện được lỗi này.
  Căn cứ: Chỉ là chi tiết thị giác nhẹ, không mất dữ liệu; dòng khoá vẫn không bấm được.
  file: `packages/ui/test/item-khoa.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt trong khi lời hứa là quan hệ đếm): E8 hứa «dung mot muc tieu» nhưng chỉ dò innerText.includes (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài đo màn sẽ không phát hiện nếu bấm lưu một lần mà sinh ra hai mục tiêu trùng tên.
  Căn cứ: Lỗi nhân đôi nếu có sẽ thấy ngay trên màn và người dùng xoá được; bài đo yếu hơn lời ghi nhưng không che lỗi của tiêu chí đã ký.
  file: `_acceptance/mot-nut-tao-muc-tieu/rang/do-man.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

