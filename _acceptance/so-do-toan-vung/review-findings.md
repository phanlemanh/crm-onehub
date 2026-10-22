# Review findings: so-do-toan-vung (round 2)

## Trong hợp đồng

- **Hình dạng 4 (assert âm tính một mình): kiểm data-dang-mo !== "false" không bao giờ đỏ được, dòng lý do góp vào không đo (E3 ô (i), E6)**
  file: `apps/app/test/okr-so-do-toan-vung.dom.tsx:756`
  severity: high
  AC: AC-6
  source: measurement
  detail: the-don-vi.tsx:88 dựng `data-dang-mo={dangMo || undefined}`. Khi thẻ đóng thì thuộc tính vắng hẳn (getAttribute trả null), không bao giờ là "false". Hệ quả: `if (the?.getAttribute("data-dang-mo") === "false") sai.push("the don vi khong mo san")` (dòng 756) ở vk6-bo-cay và `expect(the?.getAttribute("data-dang-mo")).not.toBe("false")` (dòng 550) ở vk6-hai-kieu luôn qua, kể cả khi moDonVi không mở thẻ. Lời hứa «thẻ có dòng lý do góp vào» (E3 (i), E6 kèm «đối chứng dương: ca gieo có lý do») chỉ được đo bằng `the?.textContent?.length > 0` (dòng 551). Điều này luôn đúng vì tên đơn vị nằm sẵn trong thẻ. Không assert nào chạm [data-dong-gop], là phần chỉ dựng khi dangMo. Theo anh-xa-nghi.json, chín eval đã ký (cay-can-chinh-co-ly-do E3–E8, E11; doi-nhan-khu-muc-tieu E12; toan-canh-okr E5) đều khai nghỉ và trỏ về đúng E6 này. Vậy hành vi lý do góp vào của chúng hiện không còn thước nào đo thật.
  rationale: AC-6 hứa lý do góp vào vẫn đọc được trên thẻ đơn vị mở ra, và bài kiểm duy nhất cho lời hứa đó không thể đỏ.

- **Hình dạng 5 (tuyên ma trận nhưng chỉ có điểm-case): E3 hứa 9 ô (a)–(i) kèm «Số ô === 9», bài thiếu (c), (d), (f), phím Enter của (e) và không đếm ô**
  file: `apps/app/test/okr-so-do-toan-vung.dom.tsx:478`
  severity: high
  AC: AC-3
  source: measurement
  detail: evals.yaml E3 khai ma trận viết trước gồm (c) bấm msg.veCaCongTy khi toàn màn hình thì vẫn toàn màn hình; (d) mở thẻ đơn vị, mở ngăn, bấm msg.xemTrenSoDo thì sang kiểu quanh mục tiêu và vẫn toàn màn hình; (e) cả bấm lẫn Enter; (f) rê chuột thì thẻ ngoài đường mờ, kèm đối chứng dương; cuối cùng «Số ô (a)–(i) === 9». Trong describe("vk6-hai-kieu") (dòng 478–553) không có bước bấm [data-nut=ve-ca-cong-ty] (chỉ đọc href ở dòng 507), không có xemTrenSoDo, không có sự kiện mouseover/pointer, không có keydown Enter, và không có mảng ô nào để assert số lượng bằng 9. Có grep xác nhận cả hai tệp lệnh vk6_hai_kieu không chứa hover, Enter hay xemTrenSoDo. Ba ô hành vi đã dời từ hồ sơ đã ký vì thế không có assert nào.
  rationale: AC-3 đòi đổi qua lại hai kiểu xem bằng «Về sơ đồ cả công ty» hay thẻ › ngăn › «Xem trên sơ đồ» vẫn giữ toàn màn hình, mà bài kiểm không có bước bấm nào cho các lối đó.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Breadcrumb TenTam hiện khung xương mãi mãi khi quanhMucTieu lỗi hoặc NOT_FOUND**
  Người dùng thấy gì: Khi sơ đồ quanh một mục tiêu bị lỗi hoặc mục tiêu không tìm thấy, ô tên cuối ở thanh đường dẫn phía trên cứ nhấp nháy như đang tải mãi, dù bên dưới đã báo lỗi.
  Căn cứ: Chỉ là chi tiết hiển thị gây hơi khó hiểu ở đường lỗi, không mất dữ liệu, người dùng vẫn đọc được thông báo lỗi và bấm thử lại hay tải lại trang.
  file: `apps/app/app/(app)/[slug]/okr/so-do/dai-cong-cu.tsx`
  severity: medium
  Đề xuất: known-limits

- **Biến thể lop="trang" của SoDoDonVi và QuanhMucTieuNoiDung không còn ai gọi; khối lọc ToggleGroup bị chép đôi**
  Người dùng thấy gì: Không ảnh hưởng gì tới người dùng hiện tại; chỉ là còn sót một phần giao diện cũ không còn được dùng nên về sau sửa bộ lọc dễ lệch giữa hai bản.
  Căn cứ: Người dùng không thấy gì khác đi, chỉ tốn công bảo trì về sau, dọn dẹp lúc nào cũng được.
  file: `apps/app/app/(app)/[slug]/okr/toan-canh/so-do-don-vi.tsx`
  severity: medium
  Đề xuất: known-limits

- **Ref ghi trong lúc render để né closure cũ thay vì useEffectEvent đã có trong kho**
  Người dùng thấy gì: Người dùng không thấy khác biệt; phím Esc vẫn thoát toàn màn hình đúng như hứa.
  Căn cứ: Không có hậu quả nhìn thấy với người dùng, chỉ là lối viết kém chuẩn, sửa lúc nào cũng không gấp.
  file: `apps/app/app/(app)/[slug]/okr/so-do/man-so-do.tsx`
  severity: low
  Đề xuất: wont-fix

- **Đường chuyển cũ tự ghép chuỗi truy vấn thay vì dùng serializer của nuqs**
  Người dùng thấy gì: Đường dẫn cũ vẫn đưa người dùng tới đúng sơ đồ; chỉ có điều nếu ai đó dán đường cũ mang giá trị lọc lạ thì nó được chép sang nguyên xi chứ chưa được kiểm.
  Căn cứ: Giá trị lạ chỉ làm bộ lọc về mặc định, người dùng tự sửa được bằng cách chọn lại bộ lọc.
  file: `apps/app/app/(app)/[slug]/okr/so-do/duong-so-do.ts`
  severity: low
  Đề xuất: known-limits

- **TEP_THUOC is a /g regex, so .test() inside filter skips every second rang file listed in paths**
  Người dùng thấy gì: Không ảnh hưởng sản phẩm; chỉ là bộ canh hồ sơ nghiệm thu có thể bỏ sót một số trường hợp trong tương lai mà không báo.
  Căn cứ: Không chạm người dùng cuối và hiện chưa bỏ sót ca nào, nhưng nên sửa sớm vì sửa rẻ và lỗi này im lặng.
  file: `_acceptance/so-do-toan-vung/rang/giu-ho-so.mjs`
  severity: low
  Đề xuất: known-limits

- **TenTam in the toolbar shows a skeleton forever when quanhMucTieu fails (NOT_FOUND or another error)**
  Người dùng thấy gì: Khi tải sơ đồ quanh một mục tiêu bị lỗi, thanh đường dẫn phía trên vẫn hiện ô chờ như đang tải, trong khi bên dưới đã báo lỗi.
  Căn cứ: Chỉ gây hiểu nhầm nhẹ ở đường lỗi, không mất dữ liệu và người dùng thử lại hay tải lại là xong.
  file: `apps/app/app/(app)/[slug]/okr/so-do/dai-cong-cu.tsx`
  severity: low
  Đề xuất: known-limits

- **The E4 expected text of so-do-can-chinh-don-vi contradicts itself after the update**
  Người dùng thấy gì: Không ảnh hưởng người dùng; chỉ là một câu mô tả trong hồ sơ nghiệm thu cũ còn nói điều không còn đúng, người đọc hồ sơ có thể bối rối.
  Căn cứ: Chỉ sai chữ trong tài liệu, bài kiểm vẫn chạy đúng, sửa một dòng bất cứ lúc nào.
  file: `_acceptance/so-do-can-chinh-don-vi/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (assert «có mặt» trong khi lời hứa là quan hệ): E3 ô (e) chỉ kiểm openRecord được gọi, không kiểm {kind: objective, id}**
  Người dùng thấy gì: Bài kiểm chưa chặn được trường hợp bấm thẻ mà mở nhầm mục tiêu; hiện chưa thấy lỗi như vậy xảy ra thật.
  Căn cứ: Là điểm yếu của bài kiểm chứ chưa phải lỗi người dùng gặp, và hành vi này đã có hồ sơ cũ đo.
  file: `apps/app/test/okr-so-do-toan-vung.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 / 4: E7 rút danh sách kỳ vọng từ chính đầu ra, nên thiếu nhóm hay danh sách rỗng vẫn qua**
  Người dùng thấy gì: Bài kiểm danh sách bốn nhóm trên điện thoại có thể vẫn xanh dù thiếu một nhóm; hiện chưa thấy màn thật thiếu nhóm.
  Căn cứ: Lỗi nằm ở thước đo chứ chưa phải màn hình, và người dùng chỉ gặp nếu sau này có ai làm mất nhóm mà không ai biết.
  file: `apps/app/test/okr-so-do-toan-vung.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng danh sách viết tay): E9 «mọi khoá mới rút từ object vi, đếm vi === en» lại dùng mảng KHOA_MOI cố định**
  Người dùng thấy gì: Một chữ mới thêm sau này có thể thiếu bản tiếng Anh mà bài kiểm không bắt; hiện chưa thấy chữ nào thiếu.
  Căn cứ: Chỉ là rủi ro tương lai về bài kiểm, nếu thiếu thì người dùng thấy chữ sai ngôn ngữ nhẹ và dễ sửa.
  file: `apps/app/test/okr-so-do-toan-vung.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: ux-lai-thu-8c-okr E2 vẫn tuyên «ma trận viết trước 3 thành phần vẽ thẻ», N 1, 2, trong khi ca Cây (thành phần thứ ba, ca N=2 duy nhất) đã bị xoá**
  Người dùng thấy gì: Hồ sơ nghiệm thu cũ còn nói có ba thành phần được đo trong khi thực tế chỉ còn hai; người đọc hồ sơ có thể tưởng bài kiểm rộng hơn thực tế.
  Căn cứ: Chỉ làm tài liệu nghiệm thu nói quá, không đổi gì cho người dùng, sửa một câu là xong.
  file: `_acceptance/ux-lai-thu-8c-okr/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assert âm tính một mình): dh4-cach-xem sau khi đổi chỉ còn ba lần kiểm vắng, không có đối chứng dương rằng ToanCanh đã dựng**
  Người dùng thấy gì: Nếu màn Sức khoẻ bị kẹt ở trạng thái chờ hay rỗng thì bài kiểm này vẫn xanh; hiện chưa thấy màn thật bị như vậy.
  Căn cứ: Chỉ là bài kiểm có thể xanh giả trong tình huống hiếm, người dùng không bị ảnh hưởng hiện tại.
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo khai báo thay vì đầu ra): dh5-trang-thai «dải công cụ ở cả ba trạng thái» chỉ được đo bằng tên hàm của fallback Suspense**
  Người dùng thấy gì: Bài kiểm chưa tự xem thanh công cụ có thật hiện lúc chờ tải hay không, dù mã khai là có.
  Căn cứ: Là điểm yếu của bài kiểm; người dùng chỉ ảnh hưởng nếu sau này thanh công cụ biến mất mà không ai bắt được.
  file: `apps/app/test/okr-quanh-muc-tieu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 / 5: vk6-toan-man kiểm «đường dẫn không mang khoá toàn màn hình» bằng regex đoán tên và không có đối chứng dương; đếm bước là phép đếm tự đúng**
  Người dùng thấy gì: Bài kiểm trạng thái toàn màn hình có chỗ đếm tự đúng và chưa thử bước tải lại trang, nên có thể bỏ sót một lỗi hiếm.
  Căn cứ: Mức nhẹ, chỉ là độ chặt của bài kiểm và người dùng tự thoát toàn màn hình hay tải lại được.
  file: `apps/app/test/okr-so-do-toan-vung.dom.tsx`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/16 lỗi rơi vào file không bộ đo nào phủ (_acceptance/so-do-can-chinh-don-vi/evals.yaml, _acceptance/ux-lai-thu-8c-okr/evals.yaml, apps/app/test/okr-so-do-don-vi.dom.tsx, apps/app/test/okr-quanh-muc-tieu.dom.tsx) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
