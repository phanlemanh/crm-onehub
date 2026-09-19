# Review findings — vao-bang-email-va-mat-khau

Ghi từ lượt NGHIỆM THU TƯƠI, round 1 run_id `vao-bang-email-va-mat-khau-20260919-r1`
(verified_commit `ff84234ee8ac73bc5c6c3bd10b501ab4e85f206e`), round 2 run_id
`vao-bang-email-va-mat-khau-20260919-r2` (verified_commit
`5669ebb814be2a8989bf4bf620be94b23de26b51`), round 3 run_id
`vao-bang-email-va-mat-khau-20260919-r3` (verified_commit
`3dd48ef15d2ce343c09311587b43ece6a61a45b1`).

## Vòng 3 — không có mục ngoài hợp đồng mới

Không có phát hiện ngoài-hợp-đồng nào mới ở vòng này. Hai mục dưới đây
(một từ vòng 1, một từ vòng 2) GIỮ NGUYÊN không sửa gì thêm — không phải phạm
vi của vòng đo này:

- **va chạm id trong `apps/api/scripts/dev-session.ts`** (vòng 1): chưa đọc
  lại mã lần này để xác nhận còn hay hết, vì công cụ này không nằm trong
  đường chạy của bất kỳ eval nào ở vòng 3 (không tạo tài khoản demo mới nào
  qua nó — vòng này dùng lại các tài khoản demo có sẵn từ các vòng trước
  cộng với `bun run dev:session` trên hai địa chỉ email KHÔNG trùng 10 ký tự
  đầu). Giữ nguyên mục ghi từ vòng 1.
- **Trang Thành viên xếp chồng hai bảng ở một số chiều cao khung nhìn** (vòng
  2): TÁI XÁC NHẬN vẫn còn ở vòng 3 — gặp lại y hệt khi dựng
  `evidence/E12-ghivet.png`: ở viewport mặc định 1280×900, tiêu đề "Được
  phép vào" đè lên đúng vị trí các hàng bảng "Thành viên", phải chuyển sang
  1280×1400 mới chụp sạch được. Không mô tả lại chi tiết ở đây (xem mục vòng
  2 bên dưới) — chỉ xác nhận nó KHÔNG PHẢI hồi quy của lần vá E12 (bản vá
  `whitespace-normal align-top` trên cột Tên không đụng gì tới bố cục hai
  bảng), và KHÔNG nằm trong phạm vi AC-6/AC-11 mà E12 đo.

## Vòng 2 — trong hợp đồng (lý do E12 = UNCERTAIN, chép lại từ evidence-report.md để dễ tra)

- **E12 / AC-6+AC-11, khung hình ghi vết**: `apps/app/app/(app)/[slug]/settings/members/vet-line.tsx`
  (tệp mới của chính vòng này) render dòng "X đã phát liên kết · N phút
  trước" bên dưới tên trong cột "Tên" của `members-table.tsx`. Cột này rộng
  `w-[26%]`, dùng chung với avatar + tên + badge "Bạn". `getComputedStyle`
  trên trang sống xác nhận span ghi vết có `white-space: nowrap` bên trong
  một `<td>` có `overflow: hidden` — không có `truncate`/ellipsis nào được
  áp cho riêng nó, chỉ là tràn-rồi-cắt-cứng. Kết quả: đuôi "· N phút trước"
  (phần "lúc nào" mà AC-11 hứa) bị cắt mất khỏi màn hình thật ở bề rộng chụp
  chuẩn 1280px của kho. Thử lại với người phát có tên NGẮN ("Ada Okafor" thay
  vì "e12-admin-1789807964659") vẫn bị cắt, chỉ đỡ hơn (mất chữ cuối "vừa
  xong" → "vừa xo"). Vá gợi ý: bỏ `white-space: nowrap` khỏi `VetLine` (để nó
  tự xuống dòng trong cột đã `flex-col`), hoặc nới `width` của cột "Tên", hoặc
  rút ngắn phần "ai" khi cần (ví dụ chỉ hiện tên, bỏ id) để nhường chỗ cho
  phần "lúc nào" — không sửa tại phiên đo này, chỉ ghi lại.

- **Bố cục trang Thành viên xếp chồng hai bảng ở một số chiều cao khung nhìn**:
  phát hiện trong lúc dựng bằng chứng E12 cho vai admin (người duy nhất thấy
  cả hai bảng "Thành viên" và "Được phép vào" cùng lúc). Ở `1280×700`,
  `1280×900` (mặc định puppeteer-core), và `1280×1000`, khung nhìn admin của
  trang `/[slug]/settings/members` render tiêu đề "Được phép vào" cùng thanh
  công cụ (Lọc/Sắp xếp/Cột/"Cho phép một địa chỉ") ĐÈ LÊN đúng vị trí đáng lẽ
  là các hàng của bảng "Thành viên" — không có hàng thành viên nào hiện ra,
  chỉ thấy tiêu đề trang rồi nhảy thẳng tới "Được phép vào" chồng chữ lên
  thanh công cụ của chính nó. `getBoundingClientRect()` xác nhận đây không
  phải ảo giác của ảnh chụp: bảng "Thành viên" đo được `top:205 bottom:704`
  và bảng "Được phép vào" đo được `top:252 bottom:1038` — hai khoảng chồng
  lấn nhau thật trong DOM đã layout, không chỉ trong ảnh PNG. Ở `1280×1400`
  hiện tượng biến mất hoàn toàn, hai bảng xếp đúng thứ tự dọc không chồng.
  Đáng chú ý: `evidence/E12-ghivet.png` của CHÍNH VÒNG 1 (đã commit ở
  `0d446a34`, chụp ở 1280×900) mang chính xác cùng một kiểu chồng chữ này —
  tức lỗi này đã có từ trước vòng 2, không phải hồi quy mới, và mục quan sát
  của vòng 1 ("hàng của người vừa nhận hiện 'e12-admin-... đã phát liên kết
  ...'") mô tả một thứ mà ảnh chụp kèm theo của chính họ không thực sự cho
  thấy — một lệch data/ảnh giữa hai vòng, không phải điều tôi tự suy luận.
  1280×900–1000 là những chiều cao cửa sổ trình duyệt thực tế phổ biến (ví dụ
  laptop 13"), nên đây là lỗi thật người dùng thật có thể gặp, không chỉ là
  giả tạo của công cụ chụp headless. Không sửa tại phiên đo này, chỉ ghi lại
  kèm bước tái hiện: mở `/<slug>/settings/members` với vai admin/owner, cỡ
  cửa sổ trình duyệt khoảng 1280×700 đến 1280×1000.

## Vòng 1 — trong hợp đồng (đã liệt trong bảng eval của evidence-report.md, chép lại đây để dễ tra)

- **E1 / AC-1**: eval tham chiếu một test tên `phat-chia` không tồn tại trong
  `apps/api/test/mat-khau-lien-ket.spec.ts`. `bun test -t phat-chia` khớp 0 test,
  thoát mã 1. Đây là lỗ hổng phía sinh eval (khuôn AC-1 chưa từng có bài kiểm
  cross-layer độc lập của riêng nó), không phải lỗi sản phẩm — nhưng nghĩa là
  AC-1 hiện KHÔNG có phép đo máy nào phủ nó.
- **E5 / AC-5**: bài kiểm `het-han` xanh (1 pass) nhưng thiếu đúng nửa "mật khẩu
  cũ vẫn dùng được" mà chính `expected` của eval đòi. Fixture `qua-han` là một
  người mới toanh (`gieoNguoiVaChia()`), chưa từng có mật khẩu nào để so.
- **E7 / AC-7**: bài kiểm `chan-tu-dang-ky` xanh (2 pass) nhưng thiếu hẳn "chiều
  dương" mà `expected` đòi: xác nhận đường đặt mật khẩu BẰNG CHIA vẫn thành công
  cho CHÍNH địa chỉ vừa bị chặn tự đăng ký. Không có bước tiếp nối nào trong cả
  hai test của describe đó.
- **E13 / AC-9 (nghiêm trọng nhất vòng này)**: `apps/app/app/(landing)/sign-in/page.tsx`
  chỉ render `<PasswordSignIn>` khi `social.length > 0 || showSso` — tức khi có
  ít nhất một cửa Google/Microsoft/SSO đã cấu hình. Khi cả ba đều trống (đúng
  kịch bản `.env` hiện có của kho: `GOOGLE_CLIENT_ID=""`, không Microsoft,
  không SSO — cũng chính là kịch bản mục tiêu của toàn bộ tính năng này: mạng
  chặn Google), nhánh `!showSso && social.length === 0` trả về màn "Chưa có
  cách nào để vào" và KHÔNG BAO GIỜ chạm tới `<PasswordSignIn>`. Ô email/mật
  khẩu không hiện ra — người dùng bị khoá hoàn toàn, kể cả bằng cửa mới. Đã xác
  nhận bằng ảnh chụp thật (`E13-dangnhap.png`, cả bản tiếng Anh lẫn tiếng Việt)
  và bằng đọc mã nguồn (`configured`/`social`/`showSso` logic).

## Vòng 4 — khuyết tật bắt được đúng lúc ký, đã vá

Không phải phát hiện về sản phẩm: phát hiện về **bộ đo của chính vòng này**.

- **Ba eval màn hình chưa từng chạy một lượt máy nào** (E12/AC-6, E13/AC-9,
  E17/AC-8). Chúng khai `cmd: config:executors.design.ui_check`, mà
  `design-scan.js` của bộ kit là payload tiêm vào trình duyệt
  (`window.__IMPECCABLE_CONFIG__ = …`) — chạy bằng `node` là `ReferenceError:
  window is not defined` ngay dòng đầu. `run-log.jsonl` không có dòng nào cho
  ba eval đó ở cả ba vòng, trong khi các khối của chúng vẫn ghi `exit_code: 0`
  và mượn `run_id` của vòng 3. Nền thật của ba khẳng định là ảnh chụp cộng lời
  tường thuật.
  Vì sao ba vòng không ai thấy: cổng `L2 SUBSTANCE` chỉ bắn khi verdict cố lên
  `PASS`; `PENDING-JUDGMENT` không kích hoạt phép kiểm tính thật của verifier.
  Đã vá: ba chân đo mới, chạy thật, thoát 0, có dòng run-log `…-r4`, mỗi chân
  qua chiều đỏ — `apps/app/test/mk-nut-phat-chia.dom.tsx`,
  `mk-dang-nhap-cung-man.spec.ts`, `mk-dat-mat-khau-loi.dom.tsx`.

- **Làn nghiệm thu bỏ qua mọi eval khai `executor: ui-check`**. Làn gom eval
  theo `executor: test|script`, nên lượt đo ngay sau khi vá vẫn chỉ chạy 13/13
  và im lặng nhảy qua đúng ba eval vừa vá. Nếu không đổi nhãn thì bản vá chỉ
  xanh một lần rồi chết. Đã đổi sang `executor: test`, khai lối thoát
  `bỏ ui-observed — …` ở sổ quyết định dòng 20; làn nay chạy 16 eval, tất cả
  exit 0.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người
quyết, máy không tự sửa.

- **Công cụ dựng phiên dev đụng khoá khi hai email giống nhau 10 ký tự đầu**
  Người dùng thấy gì: người dựng tài khoản thử bằng lệnh dev thấy lệnh văng lỗi trùng khoá ở lần thứ hai, và không dựng được tài khoản nào nữa cho tới khi đổi tên địa chỉ thử.
  file: `apps/api/scripts/dev-session.ts`
  severity: Important
  Đề xuất: new-contract — công cụ dev, không phải mã sản phẩm, nhưng chắc chắn tái diễn
  Chi tiết: script sinh `id: dev-${Buffer.from(email).toString("hex").slice(0,20)}`,
  tức chỉ lấy 10 byte đầu của địa chỉ email làm khoá. Hai email khác nhau nhưng
  cùng tiền tố 10 ký tự (ví dụ `e12-member-1789807881@onehub.center` và
  `e12-member-1789807964659@onehub.center`) sinh CÙNG một `id`, và lần `upsert`
  thứ hai văng `PrismaClientKnownRequestError: Unique constraint failed on the
  fields: (id)`. Gặp thật trong lúc dựng tài khoản demo cho E12. Đây là công cụ
  dev-only (`bun run dev:session`), không phải mã sản phẩm chấm theo hợp đồng,
  nhưng đáng vá vì bất kỳ ai dùng công cụ này với hai địa chỉ thử đặt tên giống
  nhau (rất dễ xảy ra khi test tay) đều dính.

- **Màn Thành viên chồng hai bảng lên nhau ở cửa sổ cao khoảng 700–1000 điểm**
  Người dùng thấy gì: quản trị mở màn Thành viên trên cửa sổ trình duyệt cỡ laptop 13 inch không thấy hàng thành viên nào — phần "Được phép vào" đè lên chỗ đáng lẽ là danh sách thành viên, nên cũng không đọc được vết ai đã phát liên kết cho ai.
  file: `apps/app/app/(app)/[slug]/settings/members/page.tsx`
  severity: Important
  Đề xuất: new-contract — lỗi bố cục có từ trước vòng này, chắn đúng thứ AC-11 hứa cho người xem
  Chi tiết: phát hiện trong lúc dựng bằng chứng E12 cho vai admin (người duy nhất
  thấy cả hai bảng "Thành viên" và "Được phép vào" cùng lúc). Ở `1280×700`,
  `1280×900` và `1280×1000`, tiêu đề "Được phép vào" cùng thanh công cụ đè lên
  đúng vị trí các hàng của bảng "Thành viên". `getBoundingClientRect()` xác nhận
  không phải ảo giác ảnh chụp: "Thành viên" đo `top:205 bottom:704`, "Được phép
  vào" đo `top:252 bottom:1038` — hai khoảng chồng thật trong DOM đã layout. Ở
  `1280×1400` hiện tượng biến mất. Đã có từ trước vòng 2: `evidence/E12-ghivet.png`
  của vòng 1 (commit `0d446a34`, chụp 1280×900) mang chính xác kiểu chồng này.
  Tái xác nhận còn nguyên ở vòng 3. Tái hiện: mở `/<slug>/settings/members` vai
  admin hoặc chủ, cửa sổ khoảng 1280×700 đến 1280×1000.

- **Hai màn mới hiện chữ tiếng Anh khi trình duyệt không khai ngôn ngữ**
  Người dùng thấy gì: người mở màn đăng nhập hoặc trang đặt mật khẩu từ một trình duyệt chưa từng chọn ngôn ngữ sẽ thấy toàn bộ nhãn bằng tiếng Anh, chứ không phải tiếng Việt.
  file: `apps/app/lib/locale/server.ts`
  severity: Minor
  Đề xuất: known-limits — có sẵn từ trước vòng này, không phải hồi quy
  Chi tiết: không phải hồi quy của vòng này (cơ chế
  `resolveLocale` đã có sẵn từ trước và tôn trọng cookie `lang=vi`/header khi có),
  nhưng đáng ghi lại vì nó ảnh hưởng trực tiếp đến cách chụp bằng chứng: chụp lần
  đầu (trước khi tôi đặt cookie `lang=vi`) ra toàn bộ chữ tiếng Anh, không phản
  ánh đúng những gì một nhân viên kinh doanh người Việt sẽ thấy. Đã chụp lại toàn
  bộ ảnh trong `evidence/` với cookie `lang=vi` đặt tay.
