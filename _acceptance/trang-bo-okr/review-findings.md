## Trong hợp đồng

- **Nút 'Thêm mục tiêu' và 'Nhập bảng tính' cho bộ OneHub ở các thẻ khác giờ dẫn tới trang danh sách, và hộp thoại không mở**
  file: `apps/app/app/(app)/[slug]/okr/hanh-dong-khu.tsx:125`
  severity: high
  AC: AC-7
  source: bugs
  detail: Lượt này đổi nghĩa của `/okr/bo-okr` khi URL không có `donOkr`. Trước đây URL thiếu `donOkr` mở bộ gốc (goc). Nay page.tsx:43 xét `don === null && xem === null` thì hiện `<DanhSachBo/>` thay cho `<TheoDonVi/>`. Diff đã sửa toan-canh.tsx và chonDon để luôn ghi `donOkr=goc`, nhưng còn sót `useDuongTheoDonVi` trong hanh-dong-khu.tsx. Chỗ đó vẫn bỏ tham số khi đơn vị là goc: `if (don.loai !== "goc") q.set(SEARCH_PARAM.okr.don, khoaDon(don));`. Ở thẻ Của tôi và Toàn cảnh, `NutThem` và `MenuThem` dựng `<Link href={toi(q.dich.don, SEARCH_PARAM.dialog.create / okr.nhap)}>`. Người xem không dẫn bộ nào thì có `donDich` là `{don: GOC, nguon: "goc"}`. Trường hợp này gặp ở quản trị chương trình, người có `canCreate` ở gốc. Liên kết khi đó thành `/okr/bo-okr?new=true` hoặc `?nhapOkr=true` và rơi vào DanhSachBo. Chỉ TheoDonVi mới gắn `NganTaoMucTieu` và hộp thoại nhập, còn DanhSachBo không gắn cả hai. Bấm nút thì trang đổi sang danh sách bộ, hộp thoại tạo hay nhập không mở, và không có báo lỗi nào. Bài okr-dau-trang-khu.dom.tsx (~dòng 717) vẫn coi thiếu `donOkr` là 'goc' (`u.searchParams.get("donOkr") ?? "goc"`), nên bài kiểm không bắt được hồi quy này.
  rationale: AC-7 đòi mọi liên kết trong app trỏ tới bộ OneHub phải mang donOkr=goc; liên kết dựng ở hanh-dong-khu bỏ tham số này nên rơi vào trang danh sách.

- **Hình dạng 5 (tuyên quét lớp, chỉ có điểm-case): tbo-lien-ket lập danh sách «mọi chỗ dựng liên kết /okr/bo-okr» bằng grep chuỗi nguyên văn, sót chỗ dựng qua hằng DUONG**
  file: `apps/app/test/trang-bo-okr.dom.tsx:520`
  severity: high
  AC: AC-7
  source: measurement
  detail: choDungLienKet() (dòng 520-528) chỉ lấy tệp có chuỗi nguyên văn "/okr/bo-okr" trong apps/app/app. E11 hứa «mọi chỗ dựng liên kết /okr/bo-okr trong apps/app». Cách lập danh sách này bỏ sót mọi chỗ dựng đường qua hằng DUONG["theo-don-vi"] (tab-okr.ts:6). Một chỗ bị sót: apps/app/app/(app)/[slug]/okr/hanh-dong-khu.tsx:115-128 useDuongTheoDonVi dựng `${url(DUONG["theo-don-vi"])}?${q}`, và với đơn vị gốc thì bỏ hẳn donOkr (`if (don.loai !== "goc") q.set(SEARCH_PARAM.okr.don, ...)`). Theo page.tsx của vòng này, không có donOkr và không có xemOkr nghĩa là vào trang danh sách. Vì vậy nút «Thêm mục tiêu» và mục «Nhập bảng tính» ở các tab khác (người xem không dẫn đơn vị nào, donDich trả GOC) mở trang danh sách: `?create`/`?nhap` không còn tác dụng, vì DanhSachBo không đọc hai tham số đó. Tập so khớp «viết tay ↔ grep» chỉ tự xác nhận chính khuôn grep, nên ca thiếu này không bao giờ đỏ. Muốn phủ đủ lớp thì phải liệt kê theo đích (mọi chỗ dùng DUONG/DUONG_MUC trỏ theo-don-vi), không phải theo chuỗi nguyên văn.
  rationale: Bài quét hứa phủ mọi liên kết trong app trỏ tới bộ OneHub (AC-7) nhưng sót lớp dựng qua hằng đường dẫn, để lọt đúng liên kết thiếu donOkr=goc.

- **Hình dạng 5 (tuyên quét lớp, chỉ có điểm-case): E15 khong-doi-hinh chỉ chạy eval executor test, bỏ hết eval script của các hồ sơ đã ký có thước bị sửa trong vòng**
  file: `_acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs:71`
  severity: high
  AC: AC-11
  source: measurement
  detail: evals.yaml E15 hứa «Chạy eval test/script không not-run của từng hồ sơ trên cây vòng và trên worktree origin/onehub». Nhưng danhSach() bỏ mọi eval không phải test: `if (String(e.executor).trim() !== "test") continue;` (dòng 71). Như vậy các eval script đo chính những thước mà vòng này sửa đều không được chạy để so cây với nền: trang-don-vi-mot-bang E3/E4/E5/E17 (dvb_man, đọc man-don-vi.mjs), vo-khu-muc-tieu E4/E6/E10/E12-14 (vkm_man, đọc do-man-dieu-huong.mjs), khung-cho-don-vi-mot-hinh E1-E4 (kcd_man). Riêng khep-ky-okr (kko_man_chrome, đọc man-khep-ky.mjs) còn vắng hẳn khỏi HO_SO (dòng 22-31), dù TEP_CUA_HO_SO có ánh xạ man-khep-ky.mjs về hồ sơ này. Lời hứa AC-11 «mọi mục không xấu hơn trên nền» vì thế chưa được đo cho đúng những thước đã đổi. Dòng «danh sach viet truoc: N muc test» trông như một phép quét toàn phần, nhưng chỉ phủ phần test.
  rationale: AC-11 đòi chạy eval máy của mọi hồ sơ đã ký có thước chạm trang này và mọi mục không xấu hơn nền; thước bỏ qua eval dạng script nên chưa đo đủ.

- **Hình dạng 3 (assert «chuỗi có mặt» khi lời hứa là quan hệ): E15 coi cả khối diff là «đổi chuỗi» chỉ cần khối đó chứa một token được phép**
  file: `_acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs:170`
  severity: medium
  AC: AC-11
  source: measurement
  detail: AC-11 hứa mọi thay đổi trong thước của hồ sơ đã ký chỉ là đổi chuỗi đường dẫn hay bộ chọn. Đó là quan hệ giữa dòng cũ và dòng mới: mỗi dòng đổi chỉ khác ở chuỗi literal. Thước lại làm `khoi.filter((k) => !KHUON_DOI_CHUOI.test(k))` (dòng 170) trên cả khối +/- đã nối lại. KHUON_DOI_CHUOI (dòng 53) gồm các token như donOkr, aria-current, bo-okr, xem=, data-the. Chỉ cần một dòng của khối chứa một token là cả khối qua, kể cả khi khối thêm hay đổi logic. Có ví dụ thật ngay trong diff: do-man-dieu-huong.mjs đổi điều kiện `h.duong === ...` thành `h.nhan === ...` và đổi biểu thức dựng đường, khối đó vẫn qua vì có chuỗi "/okr/bo-okr". Chiều đỏ (dòng 192) chèn `export const doiLogicThu = 1 + 1;`, một dòng không chứa token nào, nên nó chỉ chứng minh trường hợp dễ và không chứng minh thước bắt được logic trộn chung khối với chuỗi được phép. Sổ d-17 đã tự ghi nhận chỗ hở này.
  rationale: AC-11 hứa mọi thay đổi trong thước của hồ sơ đã ký chỉ là đổi chuỗi đường dẫn hay bộ chọn; thước hiện cho qua cả khối có đổi logic nếu lẫn một token được phép.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **viecCuaBo gộp dòng chiến dịch hoặc kế hoạch không có quyền hay đã xoá thành tieuDe rỗng, nên giao diện vẽ một dòng việc trắng**
  Người dùng thấy gì: Ở thẻ Việc của một bộ, nếu việc gắn với chiến dịch hay kế hoạch đã bị xoá, hoặc người xem không có quyền đọc, thì hàng việc hiện ra với ô tên trống. Người xem không biết đó là việc gì và vì sao trống.
  Căn cứ: Chỉ ảnh hưởng vài hàng ở ca hiếm (bản ghi đã xoá hoặc vai không đủ quyền), không mất dữ liệu, người dùng vẫn đọc được các hàng còn lại; sửa sau rẻ.
  file: `apps/api/src/okr/bo-okr.ts`
  severity: medium
  Đề xuất: known-limits

- **Người làm của việc lấy thẳng quan hệ User, bỏ qua lớp lọc thành viên đã rời mà canhKr đang dùng**
  Người dùng thấy gì: Ở thẻ Việc, người đã rời workspace vẫn hiện như người làm bình thường, trong khi ở cạnh KR của cùng việc đó họ được đánh dấu là đã rời. Hai nơi cho thông tin hơi lệch nhau.
  Căn cứ: Chỉ là lệch nhỏ về cách hiển thị, không mất dữ liệu và không chặn việc nào; người dùng vẫn thấy tên người làm đúng.
  file: `apps/api/src/okr/bo-okr.ts`
  severity: low
  Đề xuất: known-limits

- **chonViecBo chép lại phần select campaign và plan của chonHangCanh thay vì dùng chung**
  Người dùng thấy gì: Người dùng không thấy gì khác đi hôm nay. Rủi ro chỉ là sau này hai nơi lấy dữ liệu có thể lệch nhau khi một nơi được sửa mà nơi kia không.
  Căn cứ: Không có hậu quả nào cho người dùng ở thời điểm này; việc dọn lại chỉ đáng làm khi đụng tới phần này lần sau.
  file: `apps/api/src/okr/bo-okr.ts`
  severity: low
  Đề xuất: wont-fix

- **Thụt cấp bằng cách đè padding của TableCell qua className tại chỗ gọi**
  Người dùng thấy gì: Cách thụt dòng của các bộ con trong danh sách bộ OKR không theo đúng quy ước giao diện chung của kho. Người dùng nhìn vào vẫn thấy thụt cấp đúng.
  Căn cứ: Chỉ là lệch quy ước nội bộ, giao diện hiển thị bình thường, không ảnh hưởng thao tác của ai; sửa sau rẻ khi dọn giao diện.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/danh-sach-bo.tsx`
  severity: low
  Đề xuất: known-limits

- **Liên kết soạn cũ `?cuocSoan=` không mang `donOkr` không còn được chuyển hướng**
  Người dùng thấy gì: Một liên kết soạn cũ đã lưu hay đã gửi từ trước (dạng cuộc soạn không kèm đơn vị) giờ mở ra danh sách bộ OKR thay vì khung soạn, và không có thông báo nào.
  Căn cứ: Chỉ ảnh hưởng liên kết cũ đã lưu, người dùng tự quay về đúng bản nháp qua màn Soạn được, không mất dữ liệu; sửa sau rẻ.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/danh-sach-bo.tsx`
  severity: medium
  Đề xuất: known-limits

- **Việc loại chiến dịch hoặc kế hoạch trả tiêu đề rỗng khi không có quyền hoặc khi bản ghi đã xoá**
  Người dùng thấy gì: Ở thẻ Việc, việc thuộc chiến dịch hoặc kế hoạch đã xoá hay không đủ quyền hiện thành một hàng không có tên, không nói rõ là bị xoá hay thiếu quyền.
  Căn cứ: Ca hiếm, chỉ làm hàng đó khó hiểu, không mất dữ liệu và không chặn thao tác khác; sửa sau rẻ.
  file: `apps/api/src/okr/bo-okr.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo lời khai thay vì đầu ra): bốn tệp thước trong VIET_LAI được tính đạt nhờ sổ có dòng fix, diff của chúng không được soát**
  Người dùng thấy gì: Với bốn bài kiểm của hồ sơ cũ đã được chủ kho cho viết lại, thẻ nghiệm thu chỉ dựa vào ghi chú trong sổ mà không soát lại nội dung thay đổi. Nếu sau đó có sửa thêm ngoài phạm vi đã cho, thẻ vẫn báo đạt.
  Căn cứ: Rủi ro chỉ có nếu có người sửa vượt phạm vi, không ảnh hưởng người dùng cuối, và người ký vẫn xem được sổ ghi chú; thêm bước soát sau rẻ.
  file: `_acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
