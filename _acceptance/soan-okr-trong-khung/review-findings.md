# Review findings: soan-okr-trong-khung (round 1)

## Trong hợp đồng

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): mục 1 của luat.mjs mù với cả thư mục okr/soan, còn chiều đỏ --tu-thu bơm dòng thẳng vào bên đọc nên không lộ ra**
  file: `_acceptance/soan-okr-trong-khung/rang/luat.mjs:136`
  severity: high
  AC: AC-10
  source: measurement
  detail: docVatThat() gọi `git diff -U0 <nen> -- 'apps/app/app/(app)/[slug]/okr/soan/*.tsx' … '${SOAN}/**/*.tsx'`. Git hiểu `[slug]` là lớp ký tự (khớp một chữ s/l/u/g), nên hai pathspec này không khớp tệp nào dưới thư mục `[slug]` thật. Chạy lại đúng các pathspec đó với merge-base 291e0a88 và `--name-only`: kết quả chỉ có `record-sheet-host.tsx` và `soan-sheet.tsx`. Bảy tệp .tsx đã đổi dưới okr/soan (khung-soan.tsx, trang-soan.tsx, hoi-thoai-soan.tsx…) không vào được `dongThem`. Khi dùng `:(literal)…/soan` thì bảy tệp này hiện ra. Vậy mục 1 («không bề ngang viết bằng số ở chỗ gọi» trong khu soạn) không bao giờ thấy được khu soạn. Chiều đỏ ghim ở dòng 196-199 không bắt được lỗi này, vì nó không sửa bản sao khung-soan.tsx rồi đi qua git diff + dongThemTuDiff (bên viết). Nó tự viết sẵn `{ tep: "…/khung-soan.tsx", chu: '<div className="w-[380px]">' }` đúng khuôn mà muc1 đọc rồi nối thẳng vào `v.dongThem`. Chạy `bun …/luat.mjs` hôm nay in «muc 1: dat», nhưng màu xanh đó không đo gì ở okr/soan.
  rationale: AC-10 hứa quét diff để chứng minh khu soạn không có bề ngang viết bằng số; phép quét không thấy tệp nào trong okr/soan nên lời hứa chưa được kiểm.

- **Hình dạng 4 (âm tính một mình): banGhiCuoi() trả null cả khi không có lần ghi URL nào, nên mọi assert «đóng xong, bỏ record» đều đạt ngay cả khi không có gì xảy ra**
  file: `apps/app/test/soan-okr-trong-khung.dom.tsx:72`
  severity: high
  AC: AC-7
  source: measurement
  detail: `banGhiCuoi()` trả `null` khi `urlDoi.at(-1) === undefined`. `urlDoi` chỉ được thêm phần tử trong `onUrlUpdate` của NuqsTestingAdapter, mà callback này chỉ chạy khi có cập nhật. `record=soan:cuoc-1` lúc mở lại đến từ `searchParams` ban đầu, không phải từ một cập nhật. Vì thế `expect(banGhiCuoi()).toBeNull()` đạt khi close() ghi record=null, và cũng đạt khi Esc, bấm ra ngoài hay nút đóng không làm gì. Ba ca «Kara rảnh × ra-ngoai/esc/nut-dong» (dòng 443-451) chỉ có hai assert âm tính là `hop()` null và `banGhiCuoi()` null. Không ca nào kiểm `[data-slot=sheet-content]` biến mất hay kiểm `urlDoi.length > 0`. Đây là toàn bộ bằng chứng cho phần AC-7 «khi Kara rảnh mọi cách trên đóng ngay». Dòng 255 (sk-record (d): close() → adapter ghi record=null) và dòng 437 (sau «Đóng» khi đang soạn) mắc cùng lỗi.
  rationale: AC-7 hứa khi Kara rảnh mọi cách đóng đều đóng ngay; các assert chỉ kiểm vắng mặt nên vẫn đạt khi nút đóng không làm gì.

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): «đường giữ /ws/deals» được kiểm bằng chính biến giả mà test vừa gán**
  file: `apps/app/test/soan-okr-trong-khung.dom.tsx:246`
  severity: medium
  AC: AC-2
  source: measurement
  detail: `dinhVi.duong = "/ws/deals"` được gán trong test và chỉ được đọc qua `usePathname` giả. `router.push/replace` giả chỉ ghi vào `diTrang`, không mã nào trong bản dựng ghi lại `dinhVi.duong`. Vì thế `expect(dinhVi.duong).toBe("/ws/deals")` ở dòng 246 và 256 luôn đạt, bất kể mã gọi push sang Theo đơn vị hay không. Đầu ra thật của lời hứa AC-2 «đường không đổi» là `diTrang` (không có lần push/replace nào), nhưng sk-record (c) và (d) không assert `diTrang.length === 0`.
  rationale: AC-2 hứa mở khung ở trang khác mà đường không đổi; assert đọc lại biến giả do test gán nên không thể đỏ.

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): test recordHref của soan tự đưa đích vào rồi assert lại đúng đích đó**
  file: `apps/app/test/soan-okr-trong-khung.dom.tsx:230`
  severity: medium
  AC: AC-2
  source: measurement
  detail: AC-2 hứa «recordHref của loại soan trả liên kết sang Theo đơn vị». Nhưng `recordHref(slug, list, kind, id)` nhận đích qua tham số `list`. Test gọi `recordHref("ws", "/okr/theo-don-vi", "soan", "cuoc-1")` rồi assert `pathname === "/ws/okr/theo-don-vi"`, tức là đọc lại chính tham số đã truyền vào. Hàm không tự quyết đích nào cho soan: gọi `recordHref("ws", "/deals", "soan", id)` vẫn typecheck và trả /ws/deals. Ngoài test cũng không có nơi gọi nào trong production dùng recordHref cho soan. Assert này không thể đỏ vì bất kỳ thay đổi nào trong record-href.ts.
  rationale: AC-2 hứa recordHref của loại soan trả liên kết sang Theo đơn vị; hàm nhận đích qua tham số nên lời hứa chưa được chứng minh, thậm chí chưa được hiện thực.

- **Hình dạng 3 (assert chuỗi có mặt khi lời hứa là quan hệ): mục 5 chỉ đòi các chữ «phải», «trái» xuất hiện đâu đó trong mục**
  file: `_acceptance/soan-okr-trong-khung/rang/luat.mjs:82`
  severity: medium
  AC: AC-10
  source: measurement
  detail: AC-10 hứa mục «Kara ở đâu» nói Kara ở cột phải, còn vật phẩm mở về bên trái. Đó là quan hệ gắn từng đối tượng với một phía. `muc5` chỉ chạy `CHU_MUC.filter((c) => !than.includes(c))` với `["phải", "trái", "Soạn OKR", "K5"]`. Một mục viết đảo thành «Kara ở cột trái, vật phẩm bên phải» vẫn đạt. Chữ «phải» còn có nghĩa thường gặp là «cần», nên gần như mục nào cũng có chữ này. Chiều đỏ --tu-thu chỉ thử trường hợp xoá tiêu đề, không thử trường hợp đảo phía.
  rationale: AC-10 hứa mục «Kara ở đâu» nói Kara ở cột phải và vật phẩm mở bên trái; phép kiểm chỉ tìm chữ nên mục viết đảo phía vẫn đạt.

- **Hình dạng 4 (âm tính một mình): E14 đòi «nút của phòng không còn Tiếp tục» nhưng nhóm nút vắng mặt cũng đạt**
  file: `_acceptance/soan-okr-trong-khung/rang/man-dua-vao.mjs:47`
  severity: low
  AC: AC-13
  source: measurement
  detail: `coTiep: !!nhom && nhom.innerText.includes(tiep)`. Nếu `[data-nhom-soan]` không dựng sau Đưa vào (ví dụ soanSanSang lỗi, hoặc NutSoan trả null), `coTiep` bằng false và ở dòng 141 nhánh `sau.coTiep` không báo lỗi. Không có assert dương nào kiểm nhóm nút của phòng vẫn hiện, hay kiểm `sau.hinh` mang một trạng thái cụ thể. Dòng log có in `sau.hinh` nhưng giá trị này không vào phần kết luận.
  rationale: AC-13 hứa nút của phòng không còn «Tiếp tục» sau khi đưa vào; phép kiểm đạt cả khi nhóm nút không hiện.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **TabsList/Tabs restyled with className at the call site instead of adding a packages/ui variant**
  Người dùng thấy gì: Thanh tab Trò chuyện/Bản nháp trên khổ hẹp được chỉnh kiểu tại chỗ thay vì thành một kiểu dùng chung. Người dùng không thấy khác biệt, nhưng sau này sửa giao diện thanh tab phải sửa ở hai nơi.
  file: `apps/app/app/(app)/[slug]/okr/soan/khung-soan.tsx`
  severity: medium
  Đề xuất: known-limits

- **Old-link redirect builds the query string by hand and calls router.replace instead of the nuqs/record-stack setter**
  Người dùng thấy gì: Mở một link soạn OKR cũ trong lúc địa chỉ đang mang thêm lựa chọn của bản ghi khác (tab, luồng trao đổi) thì các lựa chọn đó có thể bị áp nhầm sang khung soạn. Gặp hiếm vì link cũ thường mở từ ngoài vào.
  file: `apps/app/app/(app)/[slug]/okr/soan/chuyen-link-cu.ts`
  severity: medium
  Đề xuất: known-limits

- **Legacy /okr/soan/[cuocSoanId] redirect page departs from the repo's record-redirect pattern**
  Người dùng thấy gì: Mở đường dẫn soạn OKR cũ có thể thoáng thấy khung trang trước khi được chuyển sang Theo đơn vị, thay vì chuyển ngay. Đích đến vẫn đúng.
  file: `apps/app/app/(app)/[slug]/okr/soan/[cuocSoanId]/page.tsx`
  severity: low
  Đề xuất: known-limits

- **duongTrangSoan is now an unused export; donViCua is re-exported from a second module**
  Người dùng thấy gì: Còn sót một hàm không ai dùng và một hàm có thể nhập từ hai nơi. Người dùng không thấy gì; chỉ làm mã khó đọc hơn một chút.
  file: `apps/app/app/(app)/[slug]/okr/soan/luat-ban-nhap.ts`
  severity: low
  Đề xuất: wont-fix

- **Khung soạn mất phần chặn liên kết của GiuTrangSoan: liên kết trong khung điều hướng đi khi Kara đang soạn mà không hỏi**
  Người dùng thấy gì: Khi Kara đang soạn hoặc anh chị đã gõ dở, bấm vào một liên kết trong khung (ví dụ «Tới Kho tài liệu») sẽ rời khung ngay mà không hỏi, và chữ đang gõ bị mất.
  file: `apps/app/app/(app)/[slug]/okr/soan/trang-soan.tsx`
  severity: medium
  Đề xuất: new-contract

- **Tham số tabSoan sót trên URL sau khi đóng khung, lần mở cuộc sau ở khổ hẹp rơi vào tab Bản nháp**
  Người dùng thấy gì: Trên màn hình hẹp, nếu anh chị đóng khung khi đang ở tab Bản nháp thì lần mở cuộc soạn sau, kể cả cuộc mới chưa có bản nháp, sẽ mở thẳng tab Bản nháp thay vì Trò chuyện.
  file: `apps/app/components/crm/record-sheet/record-stack.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét ma trận nhưng thiếu ô): sk-khung khai 4 ô {rộng rỗng, rộng có nháp, hẹp rỗng, hẹp có nháp} nhưng không có ô «hẹp rỗng»**
  Người dùng thấy gì: Trường hợp khung hẹp khi chưa có bản nháp nào chưa có bài thử tự động riêng, nên nếu sau này hỏng thì có thể không ai báo.
  file: `apps/app/test/soan-okr-trong-khung.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): mục 2 grep định nghĩa biến thể trong dock.tsx, không xem cột Kara của khu soạn thực sự dùng biến thể nào**
  Người dùng thấy gì: Một kiểm tra phụ chỉ xem bảng kích thước có khai đủ, không xem khung soạn có dùng đúng kích thước đó; kích thước thật vẫn được đo riêng bằng trình duyệt.
  file: `_acceptance/soan-okr-trong-khung/rang/luat.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): «không gõ gì: rời trang đi ngay» chỉ kiểm không có hộp hỏi, trong khi bộ dựng thử không thể đóng**
  Người dùng thấy gì: Một bài thử cũ về việc rời màn soạn khi chưa gõ gì chỉ kiểm không có hộp hỏi, nên không phát hiện được nếu nút đóng ngừng hoạt động.
  file: `apps/app/test/soan-okr.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (assert có mặt khi lời hứa là số lần): sk-duong (a) hứa «ghi record=soan đúng 1 lần» nhưng chỉ đọc lần ghi cuối**
  Người dùng thấy gì: Nếu mở khung soạn vô tình thêm hai mục vào lịch sử trình duyệt thay vì một, bài thử hiện tại sẽ không phát hiện; người dùng sẽ phải bấm Quay lại hai lần.
  file: `apps/app/test/soan-okr-trong-khung.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): «không khai thì đóng ngay, không hộp» chỉ kiểm không có alertdialog**
  Người dùng thấy gì: Một bài thử của thành phần khung dùng chung chỉ kiểm không có hộp hỏi chứ không kiểm khung thật sự đóng, nên không bắt được lỗi nút đóng bị kẹt.
  file: `packages/ui/test/giu-thay-doi-loi-hoi.dom.tsx`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/17 lỗi rơi vào file không bộ đo nào phủ (_acceptance/soan-okr-trong-khung/rang/man-dua-vao.mjs, packages/ui/test/giu-thay-doi-loi-hoi.dom.tsx) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
