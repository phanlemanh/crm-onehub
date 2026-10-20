# Review findings: vo-khu-muc-tieu (round 1)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đường mới viết cứng ở 9 chỗ dù diff đã dựng bảng DUONG / DUONG_MUC / DUONG_SO_DO**
  Người dùng thấy gì: Người dùng không thấy gì khác: các liên kết vẫn mở đúng chỗ. Chỉ là lần đổi đường sau sẽ phải tìm sửa nhiều nơi.
  Căn cứ: Không ảnh hưởng người dùng hiện tại, chỉ làm việc bảo trì sau này tốn công hơn.
  file: `apps/app/app/(app)/[slug]/okr/cua-toi.tsx`
  severity: medium
  Đề xuất: wont-fix

- **DUONG_CHUONG_TRINH chép lại đường cài đặt đã có hằng số trong cai-dat-dieu-huong**
  Người dùng thấy gì: Liên kết «Chương trình OKR» ở chân thanh bên vẫn mở đúng trang cài đặt. Nếu sau này đổi đường cài đặt thì liên kết này có thể bị lệch.
  Căn cứ: Hiện chạy đúng, rủi ro chỉ xảy ra khi có lần đổi đường sau và sửa rất rẻ lúc đó.
  file: `apps/app/app/(app)/[slug]/okr/thanh-ben-muc-tieu.tsx`
  severity: medium
  Đề xuất: wont-fix

- **Thanh thẻ cũ và prop chonChuKy còn lại thành code chết, chỉ bài kiểm còn giữ**
  Người dùng thấy gì: Người dùng không thấy gì: thanh thẻ cũ không còn hiện ở màn nào. Chỉ còn mã thừa trong kho.
  Căn cứ: Không có hậu quả nhìn thấy được với người dùng, dọn dẹp sau cũng được và rẻ.
  file: `apps/app/app/(app)/[slug]/okr/thanh-tab.tsx`
  severity: low
  Đề xuất: wont-fix

- **Trang toan-canh/suc-khoe/page.tsx không còn tới được nhưng vẫn giữ một bản lấy dữ liệu riêng**
  Người dùng thấy gì: Người dùng không gặp gì: liên kết cũ vẫn chuyển đúng sang trang mới. Trong mã còn một trang cũ không ai mở tới.
  Căn cứ: Không ảnh hưởng người dùng; chỉ nên ghi lại là giữ có chủ ý để không bị xoá nhầm.
  file: `apps/app/app/(app)/[slug]/okr/toan-canh/suc-khoe/page.tsx`
  severity: low
  Đề xuất: known-limits

- **Lỗi tải okr.access trên máy chủ làm mất hẳn phần «Chương trình OKR» mà không báo gì, và nút «Sức khoẻ» trỏ tới một neo không có**
  Người dùng thấy gì: Khi tải quyền bị lỗi thoáng qua, người quản lý chương trình có thể thấy trang Sức khoẻ thiếu phần quản trị mà không có lời giải thích; bấm nút Sức khoẻ thì không cuộn tới đâu. Tải lại trang thường sẽ hiện lại.
  Căn cứ: Chỉ xảy ra khi tải quyền lỗi, không mất dữ liệu và người dùng tự khắc phục được bằng cách tải lại trang.
  file: `apps/app/app/(app)/[slug]/okr/toan-canh/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **Thước của hồ sơ đã ký dot-hoi-y-tuong-okr bị xoá các phép kiểm huy hiệu Hỏi ý thay vì chuyển sang mục thanh bên, nên E12/E15 qua mà không đo huy hiệu**
  Người dùng thấy gì: Huy hiệu số ý kiến chưa góp vẫn hiện cho người dùng, nhưng bộ kiểm của tính năng Hỏi ý tưởng không còn kiểm nó nữa. Nếu sau này đếm sai thì không ai bị báo.
  Căn cứ: Người dùng chưa gặp lỗi nào, nhưng mất lớp kiểm cho một con số họ nhìn thấy; khôi phục phép kiểm trên thanh bên là việc riêng và rẻ.
  file: `_acceptance/dot-hoi-y-tuong-okr/rang/man-hoi-y.mjs`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): dvb-giu-xem được sửa đường để xanh tiếp nhưng vẫn dựng ThanhTabOkr, thành phần không màn nào còn gắn**
  Người dùng thấy gì: Một bài kiểm cũ về việc giữ chế độ xem khi đổi mục đang kiểm một thanh thẻ mà người dùng không còn thấy. Thanh bên mới chỉ giữ chu kỳ, không giữ đơn vị hay kiểu xem.
  Căn cứ: Hành vi thanh bên chỉ giữ chu kỳ là đúng theo hợp đồng; chỉ có bài kiểm cũ đo nhầm vật, không làm người dùng mất gì.
  file: `apps/app/test/okr-trang-don-vi.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E11 lấy cả tệp okr-cua-toi-ba-phan.dom.tsx làm bằng chứng, trong đó ctbp-bon-the vẫn đo ThanhTabOkr chết**
  Người dùng thấy gì: Một bài kiểm đếm bốn thẻ trên thanh thẻ mà người dùng không còn thấy, nhưng vẫn được tính vào bằng chứng. Các lối vào Của tôi vẫn hoạt động như cũ.
  Căn cứ: Không ảnh hưởng người dùng; chỉ làm bằng chứng hơi thừa màu xanh và dọn lúc nào cũng được.
  file: `apps/app/test/okr-cua-toi-ba-phan.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính đứng một mình): vế «0 ô chu kỳ trong HanhDongKhu» của vkm-chu-ky không thể đỏ trên đường hồi quy thật**
  Người dùng thấy gì: Nếu sau này có người đặt lại ô chu kỳ vào hàng nút hành động theo một đường khác thì bài kiểm này có thể không bắt được. Hiện ô chu kỳ vẫn nằm ở đầu thanh bên.
  Căn cứ: Chỉ là lưới an toàn yếu cho lần sửa sau, hiện tại người dùng không bị ảnh hưởng.
  file: `apps/app/test/vo-khu-muc-tieu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
