# Review findings: vo-khu-muc-tieu (round 3)

## Trong hợp đồng

(không có finding nào map được vào AC)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E2 expected vẫn đòi «đỉnh nút < đỉnh [role=tablist]» mà thước đã gỡ vế đó**
  Người dùng thấy gì: Người ký nghiệm thu của hồ sơ điều hướng cũ có thể đọc một lời hứa nói rằng thứ tự nút và thanh thẻ vẫn được kiểm, trong khi bài đo đã không còn kiểm nữa. Người dùng cuối không thấy gì khác trên màn hình.
  Căn cứ: Chỉ làm lệch chữ trong hồ sơ nội bộ, không ảnh hưởng người dùng, không mất dữ liệu và sửa lại bất cứ lúc nào chỉ bằng việc chỉnh một câu mô tả.
  file: `_acceptance/dieu-huong-khu-muc-tieu/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **E3 expected sửa vòng này nhưng còn nói 5 thẻ, 10 ô và ô chu kỳ nằm trong hàng hành động**
  Người dùng thấy gì: Lời hứa trong hồ sơ nghiệm thu cũ mô tả năm thẻ và ô chu kỳ nằm trong hàng nút, trái với màn thật nay có bốn thẻ và ô chu kỳ ở thanh bên. Người dùng cuối vẫn dùng màn bình thường.
  Căn cứ: Chỉ là chữ mô tả lỗi thời trong hồ sơ nội bộ, người dùng không bị ảnh hưởng, không mất dữ liệu và chỉnh lại rẻ.
  file: `_acceptance/dieu-huong-khu-muc-tieu/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Bước AC8 của man-dau-trang.mjs vẫn đo đỉnh [role=tablist], nay luôn -1 nên luôn «KHONG NHAY»**
  Người dùng thấy gì: Một phép đo về việc đầu trang có bị nhảy hay không luôn báo xanh dù đầu trang có nhảy thật hay không. Hiện chưa có bài nghiệm thu nào dùng đến phép đo này nên người dùng không bị ảnh hưởng.
  Căn cứ: Hậu quả nhẹ: chỉ là một phép đo nội bộ chưa ai dùng, người dùng không gặp gì, và có thể sửa hoặc gỡ sau khi cần dùng lại.
  file: `_acceptance/dieu-huong-khu-muc-tieu/rang/man-dau-trang.mjs`
  severity: low
  Đề xuất: known-limits

- **Phần «Chương trình OKR» trên Sức khoẻ biến mất không báo lỗi khi okr.access lỗi ở máy chủ; nút Sức khoẻ trỏ vào neo không tồn tại**
  Người dùng thấy gì: Nếu việc kiểm quyền gặp lỗi tạm thời, người quản lý chương trình sẽ không thấy phần quản trị trên trang Sức khoẻ mà không có thông báo lỗi hay nút Thử lại. Nút Sức khoẻ ở Toàn cảnh khi đó bấm vào không dẫn tới đâu.
  Căn cứ: Chỉ xảy ra khi có lỗi tạm và chỉ với người quản lý, không mất dữ liệu, tải lại trang thường khôi phục được; nhưng lỗi im lặng dễ gây hiểu nhầm nên đáng làm thành một việc riêng.
  file: `apps/app/app/(app)/[slug]/okr/toan-canh/page.tsx`
  severity: medium
  Đề xuất: new-contract

- **Prop chonChuKy bị bỏ dùng nhưng vẫn khai trong kiểu, bài kiểm vẫn truyền vào (r2)**
  Người dùng thấy gì: Người dùng không thấy gì khác: ô chọn chu kỳ vẫn nằm ở đầu thanh bên và hoạt động đúng. Chỉ là trong mã còn sót một khai báo thừa, dễ gây hiểu nhầm cho người sửa sau này.
  Căn cứ: Không ảnh hưởng người dùng, không mất hay lộ dữ liệu, và dọn lúc nào cũng rẻ nên ghi lại là đủ, không cần chặn bản giao này.
  file: `apps/app/app/(app)/[slug]/okr/hanh-dong-khu.tsx`
  severity: low
  Đề xuất: known-limits

- **OKR route paths are hard-coded at each call site even though tab-okr.ts has a route map (r1)**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào: mọi liên kết trong khu Mục tiêu đều mở đúng chỗ. Chỉ là lần đổi tên đường dẫn sau sẽ phải sửa nhiều nơi bằng tay.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; chi phí dọn lớn hơn lợi ích tức thời, có thể làm khi có đợt đổi đường dẫn kế tiếp.
  file: `apps/app/app/(app)/[slug]/okr/tab-okr.ts`
  severity: low
  Đề xuất: wont-fix

- **The tab bar was removed but its leftovers stay as dead code kept alive only by tests (r1)**
  Người dùng thấy gì: Người dùng không gặp gì: thanh thẻ cũ đã biến mất khỏi mọi màn. Trong mã còn sót một ít thành phần không dùng.
  Căn cứ: Hoàn toàn vô hình với người dùng và không có rủi ro dữ liệu; dọn sau rẻ và an toàn, không cần chặn lần giao này.
  file: `apps/app/app/(app)/[slug]/okr/thanh-tab.tsx`
  severity: low
  Đề xuất: known-limits

- **English label for Sơ đồ is «Map», a term CONTEXT.md avoids (r1)**
  Người dùng thấy gì: Người dùng chọn giao diện tiếng Anh sẽ thấy mục Sơ đồ gọi là «Map», từ mà từ điển sản phẩm muốn tránh. Bản tiếng Việt không bị ảnh hưởng.
  Căn cứ: Chỉ là nhãn chữ ở bản tiếng Anh, vẫn hiểu được và không ảnh hưởng chức năng; đổi chữ sau rất rẻ.
  file: `apps/app/lib/messages/okr-vo-khu.ts`
  severity: low
  Đề xuất: known-limits

- **If okr.access fails on the server, the program section is hidden silently and the 'Sức khoẻ' button points to an anchor that does not exist (r1)**
  Người dùng thấy gì: Khi tải quyền bị lỗi mạng hoặc lỗi máy chủ, người quản lý chương trình thấy trang Sức khoẻ không có phần quản trị chương trình và không có thông báo lỗi. Nút dẫn tới phần đó có thể không làm gì.
  Căn cứ: Chỉ xảy ra khi tải quyền thất bại, hiếm gặp, không mất dữ liệu và người dùng tải lại trang là có lại phần quản trị.
  file: `apps/app/app/(app)/[slug]/okr/toan-canh/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): vkm-chu-ky kiểm 'không có ô chu kỳ trong HanhDongKhu' nhưng không bao giờ truyền ô chu kỳ vào, nên không thể đỏ (r1)**
  Người dùng thấy gì: Người dùng không thấy lỗi nào hôm nay: ô chu kỳ đã ở đầu thanh bên. Nhưng nếu sau này ô đó bị đặt lại vào hàng nút, bài kiểm này sẽ không báo.
  Căn cứ: Không ảnh hưởng người dùng lúc này; rủi ro chỉ là một hồi quy tương lai khó bị phát hiện sớm, và bàn đo màn vẫn kiểm chỗ này.
  file: `apps/app/test/vo-khu-muc-tieu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Đường mới viết cứng ở 9 chỗ dù diff đã dựng bảng DUONG / DUONG_MUC / DUONG_SO_DO (r1)**
  Người dùng thấy gì: Người dùng không thấy gì khác: các liên kết vẫn mở đúng chỗ. Chỉ là lần đổi đường sau sẽ phải tìm sửa nhiều nơi.
  Căn cứ: Không ảnh hưởng người dùng hiện tại, chỉ làm việc bảo trì sau này tốn công hơn.
  file: `apps/app/app/(app)/[slug]/okr/cua-toi.tsx`
  severity: medium
  Đề xuất: wont-fix

- **DUONG_CHUONG_TRINH chép lại đường cài đặt đã có hằng số trong cai-dat-dieu-huong (r1)**
  Người dùng thấy gì: Liên kết «Chương trình OKR» ở chân thanh bên vẫn mở đúng trang cài đặt. Nếu sau này đổi đường cài đặt thì liên kết này có thể bị lệch.
  Căn cứ: Hiện chạy đúng, rủi ro chỉ xảy ra khi có lần đổi đường sau và sửa rất rẻ lúc đó.
  file: `apps/app/app/(app)/[slug]/okr/thanh-ben-muc-tieu.tsx`
  severity: medium
  Đề xuất: wont-fix

- **Thanh thẻ cũ và prop chonChuKy còn lại thành code chết, chỉ bài kiểm còn giữ (r1)**
  Người dùng thấy gì: Người dùng không thấy gì: thanh thẻ cũ không còn hiện ở màn nào. Chỉ còn mã thừa trong kho.
  Căn cứ: Không có hậu quả nhìn thấy được với người dùng, dọn dẹp sau cũng được và rẻ.
  file: `apps/app/app/(app)/[slug]/okr/thanh-tab.tsx`
  severity: low
  Đề xuất: wont-fix

- **Trang toan-canh/suc-khoe/page.tsx không còn tới được nhưng vẫn giữ một bản lấy dữ liệu riêng (r1)**
  Người dùng thấy gì: Người dùng không gặp gì: liên kết cũ vẫn chuyển đúng sang trang mới. Trong mã còn một trang cũ không ai mở tới.
  Căn cứ: Không ảnh hưởng người dùng; chỉ nên ghi lại là giữ có chủ ý để không bị xoá nhầm.
  file: `apps/app/app/(app)/[slug]/okr/toan-canh/suc-khoe/page.tsx`
  severity: low
  Đề xuất: known-limits

- **Lỗi tải okr.access trên máy chủ làm mất hẳn phần «Chương trình OKR» mà không báo gì, và nút «Sức khoẻ» trỏ tới một neo không có (r1)**
  Người dùng thấy gì: Khi tải quyền bị lỗi thoáng qua, người quản lý chương trình có thể thấy trang Sức khoẻ thiếu phần quản trị mà không có lời giải thích; bấm nút Sức khoẻ thì không cuộn tới đâu. Tải lại trang thường sẽ hiện lại.
  Căn cứ: Chỉ xảy ra khi tải quyền lỗi, không mất dữ liệu và người dùng tự khắc phục được bằng cách tải lại trang.
  file: `apps/app/app/(app)/[slug]/okr/toan-canh/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **Thước của hồ sơ đã ký dot-hoi-y-tuong-okr bị xoá các phép kiểm huy hiệu Hỏi ý thay vì chuyển sang mục thanh bên, nên E12/E15 qua mà không đo huy hiệu (r1)**
  Người dùng thấy gì: Huy hiệu số ý kiến chưa góp vẫn hiện cho người dùng, nhưng bộ kiểm của tính năng Hỏi ý tưởng không còn kiểm nó nữa. Nếu sau này đếm sai thì không ai bị báo.
  Căn cứ: Người dùng chưa gặp lỗi nào, nhưng mất lớp kiểm cho một con số họ nhìn thấy; khôi phục phép kiểm trên thanh bên là việc riêng và rẻ.
  file: `_acceptance/dot-hoi-y-tuong-okr/rang/man-hoi-y.mjs`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): dvb-giu-xem được sửa đường để xanh tiếp nhưng vẫn dựng ThanhTabOkr, thành phần không màn nào còn gắn (r1)**
  Người dùng thấy gì: Một bài kiểm cũ về việc giữ chế độ xem khi đổi mục đang kiểm một thanh thẻ mà người dùng không còn thấy. Thanh bên mới chỉ giữ chu kỳ, không giữ đơn vị hay kiểu xem.
  Căn cứ: Hành vi thanh bên chỉ giữ chu kỳ là đúng theo hợp đồng; chỉ có bài kiểm cũ đo nhầm vật, không làm người dùng mất gì.
  file: `apps/app/test/okr-trang-don-vi.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E11 lấy cả tệp okr-cua-toi-ba-phan.dom.tsx làm bằng chứng, trong đó ctbp-bon-the vẫn đo ThanhTabOkr chết (r1)**
  Người dùng thấy gì: Một bài kiểm đếm bốn thẻ trên thanh thẻ mà người dùng không còn thấy, nhưng vẫn được tính vào bằng chứng. Các lối vào Của tôi vẫn hoạt động như cũ.
  Căn cứ: Không ảnh hưởng người dùng; chỉ làm bằng chứng hơi thừa màu xanh và dọn lúc nào cũng được.
  file: `apps/app/test/okr-cua-toi-ba-phan.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính đứng một mình): vế «0 ô chu kỳ trong HanhDongKhu» của vkm-chu-ky không thể đỏ trên đường hồi quy thật (r1)**
  Người dùng thấy gì: Nếu sau này có người đặt lại ô chu kỳ vào hàng nút hành động theo một đường khác thì bài kiểm này có thể không bắt được. Hiện ô chu kỳ vẫn nằm ở đầu thanh bên.
  Căn cứ: Chỉ là lưới an toàn yếu cho lần sửa sau, hiện tại người dùng không bị ảnh hưởng.
  file: `apps/app/test/vo-khu-muc-tieu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/4 lỗi rơi vào file không bộ đo nào phủ (_acceptance/dieu-huong-khu-muc-tieu/evals.yaml, _acceptance/dieu-huong-khu-muc-tieu/rang/man-dau-trang.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
