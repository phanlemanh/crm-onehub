# Review findings: loc-don-vi-khong-tu-dong (round 1)

## Trong hợp đồng

- **AC-4 never checks that okr.danhSach was actually held, so the 'no skeleton while clearing filters' check can pass without testing anything**
  file: `_acceptance/loc-don-vi-khong-tu-dong/rang/man-loc.mjs:388`
  severity: medium
  AC: AC-4
  source: bugs
  detail: In the 'khong khop roi bo loc 1440' path the page first loads with no filter, so the unfiltered okr.danhSach key goes into the cache. The query client sets staleTime: 30_000 (apps/app/lib/trpc/query-client.ts:15). The script then picks an empty value, waits for the no-match panel and clicks clear, which normally takes well under 30 s. Clearing returns to the same, still-fresh key, so TanStack serves the cached data and may send no request at all. In that case `chan.che = "giu"` holds nothing, and `k` only counts samples taken in the first 700 ms. `c` (skeleton samples) comes out as 0 no matter how the screen handles placeholder data. Unlike AC-2 (`const giu = chan.so > 0`, line 349), AC-4 never checks that `chan.so` went up after the click, so 'khung cho khi bo loc 0' prints as a pass even when no wait happened. This fits the E4 pin for go-bang having to accept either message, because 'SAI AC-4: bo loc qua khung cho' cannot fire. Fix: record `chan.so` before the click and treat no new request as KHONG DO DUOC, or invalidate or remove the cached unfiltered query first so the hold really engages.
  rationale: Vế «bấm bỏ lọc thì bảng không lần nào bị thay bằng khung chờ» của AC-4 được đo bằng thước không có đối chứng rằng lúc chờ đã xảy ra, nên có thể xanh mà không kiểm gì.

- **Hình dạng 4 (chỉ có khẳng định âm, không có đối chứng dương): phần bỏ lọc của AC-4 không bao giờ ở trạng thái đang nạp, nên c = 0 xảy ra ở mọi bản dựng**
  file: `_acceptance/loc-don-vi-khong-tu-dong/rang/man-loc.mjs:462`
  severity: high
  AC: AC-4
  source: measurement
  detail: Lúc tải trang, đoạn AC-4 mở URL không có tham số lọc (duongDon(DON)). Nút «bỏ lọc» trong khung không khớp gọi boLoc, hàm này đặt mọi khoá lọc về null (theo-don-vi.tsx:137). Như vậy khoá truy vấn okr.danhSach quay lại đúng khoá đã nạp vài giây trước. Khoá đó còn trong cache và còn tươi (staleTime 30_000 ở apps/app/lib/trpc/query-client.ts:15), nên không có request nào để giữ, isPending và isPlaceholderData đều false, và không nhánh nào vẽ khung chờ. Thước lại không có đối chứng dương rằng «lúc chờ» đã xảy ra: `const k = demNeu(s, (x) => x.luc <= GIU_MS)` chỉ đếm mẫu theo thời gian. Đoạn này không kiểm `chan.so` hay `chan.giu.length`, trong khi AC-2 có kiểm `giu = chan.so > 0`. Nó cũng không kiểm có mẫu nào `banDung`/aria-busy. Vì vậy `if (c > 0) dong(false, "AC-4: bo loc qua khung cho")` không thể đỏ, và nhánh KHONG DO DUOC «khong bat duoc luc cho khi bo loc» cũng không bắt được trường hợp không có lúc chờ. Bằng chứng gián tiếp: hai commit 4b27ee567 và a5ecc0e77 phải nới ghim go-bang ở hai-chieu.mjs:86 thành `SAI AC-4: (bo loc qua khung cho|khong khop dong menu Loc)`. Chiều đỏ của AC-4 đến từ nửa «menu đóng khi chọn lọc không khớp», không đến từ nửa «bỏ lọc không qua khung chờ» mà AC-4 hứa.
  rationale: Vế «bấm bỏ lọc, bảng không lần nào bị thay bằng khung chờ» của AC-4 không có chiều đỏ thật nên lời hứa không được chứng minh.

- **Hình dạng 4 (chỉ có khẳng định âm, không có đối chứng dương): AC-2 coi mẫu không tìm thấy nút hay khung Lọc là mẫu đạt**
  file: `_acceptance/loc-don-vi-khong-tu-dong/rang/man-loc.mjs:411`
  severity: high
  AC: AC-2
  source: measurement
  detail: Bộ lấy mẫu đọc `khungMo: nut ? ... : null` và `khungHien: khungLoc ? hien(khungLoc) : null` (dòng 131-132). Nút được nhận ra qua thuộc tính `data-ldv-nut-khung` mà rang tự gắn vào DOM một lần (dòng 385). Nếu DataTable bị gỡ, tức đúng lỗi mà AC-2 canh, nút cũ rời khỏi document. Nút mới dựng lại thì không mang dấu đó, nên mọi mẫu sau lúc gỡ có khungMo và khungHien là null. Thế nhưng `a = demNeu(s, (x) => x.khungHien === false)` và `b = demNeu(s, (x) => x.khungMo === false)` chỉ đếm `=== false`, nên mẫu null đi qua như mẫu đạt. Thước cũng không có đối chứng dương rằng mỗi mẫu còn thấy nút đã đánh dấu. Ở chiều đỏ go-bang, dòng «SAI AC-2: khung Loc thu lai khi doi loc» mà hai-chieu.mjs:86 ghim có thể chỉ đến từ `!tich` (handle o đã rời DOM, aria-checked chưa bao giờ thành true). Còn con số «khung thu <a> · aria-expanded sai <b>» mà E2 đọc thì vẫn là 0. Nghĩa là hai chiều không chứng minh được phép đo «khung Lọc không thu lại».
  rationale: AC-2 đòi khung Lọc ở 390 px không thu lại; thước đếm mẫu không tìm thấy nút như mẫu đạt nên không chứng minh được lời hứa.

- **Hình dạng 4 (chỉ có khẳng định âm, không có đối chứng dương): «sau khi ve ban v» của AC-3 bằng 0 theo cách dựng thước**
  file: `_acceptance/loc-don-vi-khong-tu-dong/rang/man-loc.mjs:362`
  severity: medium
  AC: AC-3
  source: measurement
  detail: `const v = s.at(-1)?.ban ?? 0` đọc ngay sau `await choHetBan(t)` (dòng 334). choHetBan chờ tới khi không còn `[data-slot=page-shell-content] [aria-busy=true]`, tức đúng điều kiện mà `ban` đếm (dòng 128-130). Nếu aria-busy không bao giờ bỏ, d.doi hết hạn và ném lỗi (man-lib.mjs:315-322), khối catch gọi khongDoDuoc rồi thoát mã 2. Vì vậy `if (v > 0) dong(false, "AC-3: con ban sau khi danh sach ve")` không thể in SAI: lời hứa «aria-busy bỏ khi danh sách về» không có chiều đỏ, hồi quy chỉ ra KHONG DO DUOC. Cùng lúc giữ này cũng không có khẳng định nào cho vế «dòng mới thay dòng cũ» và «vùng bảng hết mờ» của AC-3: batMau được gọi với idCu = null, nên hangCu luôn bằng 0 và không mẫu nào sau lúc thả đọc `mo`.
  rationale: Vế «khi danh sách về thì dòng mới thay dòng cũ, aria-busy bỏ, vùng bảng hết mờ» của AC-3 không có khẳng định có thể đỏ.

- **Hình dạng 4 (chỉ có khẳng định âm, không có đối chứng dương): AC-7 kiểm ô tìm và phân trang nằm ngoài vùng mờ mà không kiểm chúng có được vẽ**
  file: `packages/ui/test/data-table-tai-lai.dom.tsx:108`
  severity: low
  AC: AC-7
  source: measurement
  detail: `phai(v.querySelector("[data-o-tim]") === null, ...)` và `phai(v.querySelector("[data-meta-bang]") === null, ...)` chỉ khẳng định vắng mặt trong vùng. Bài không khẳng định `o.querySelector("[data-o-tim]")` hay `[data-meta-bang]` có mặt trong cây. Nút Lọc thì có đối chứng (dòng 104: `nut !== undefined`), hai phần tử này thì không. Nếu DataTable thôi vẽ `search` hay `meta`, hai khẳng định vẫn xanh. Phá thử boc-ca-goc ở hai-chieu.mjs chỉ ghim thông điệp của nút Lọc, nên hai khẳng định này không có chiều đỏ nào đã chạy.
  rationale: AC-7 đòi khối lọc và phân trang nằm ngoài vùng mờ; bài kiểm chỉ khẳng định vắng mặt trong vùng mà không có đối chứng chúng có mặt, nên có thể xanh khi phần tử không được vẽ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **DataTable bọc bảng trong VungDangTai làm hỏng bố cục layout="fill" (mặc định) khi có refreshing**
  Người dùng thấy gì: Chưa màn nào bị ảnh hưởng. Nếu sau này một màn khác dùng bảng kiểu lấp đầy chỗ trống và bật chế độ làm mờ khi tải lại, bảng có thể mất thanh cuộn riêng và mất tiêu đề dính, cả trang bị tràn.
  Căn cứ: Hiện chỉ trang Theo đơn vị dùng tính năng này và nó không dính lỗi, nên người dùng chưa thấy gì; lỗi chỉ hiện khi có màn mới và người làm màn đó thấy ngay khi dựng, sửa lúc đó rẻ.
  file: `packages/ui/src/components/data-table.tsx`
  severity: medium
  Đề xuất: known-limits

- **giu-bang.ts tự viết thêm một bản Zod cho DonChonOkr thay vì dùng một schema chung ở packages/validation**
  Người dùng thấy gì: Hiện người dùng không thấy gì. Nếu sau này thêm một loại đơn vị mới mà quên cập nhật bản sao này, trang Theo đơn vị sẽ lặng lẽ quay lại khung chờ mỗi lần đổi lọc, và menu Lọc lại bị đóng như lỗi ban đầu.
  Căn cứ: Hậu quả chỉ xuất hiện khi có thay đổi sau này, không mất dữ liệu, người dùng tải lại là xong; gom về một nơi là việc dọn dẹp có thể làm riêng khi thêm loại đơn vị.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/giu-bang.ts`
  severity: medium
  Đề xuất: known-limits

- **The new `refreshing` prop breaks the default layout="fill": the wrapper div drops the table container out of the flex chain**
  Người dùng thấy gì: Chưa màn nào bị ảnh hưởng. Nếu sau này một màn khác dùng bảng kiểu lấp đầy chỗ trống và bật chế độ làm mờ khi tải lại, bảng có thể mất thanh cuộn riêng và mất tiêu đề dính.
  Căn cứ: Hiện không có màn nào dính nên người dùng chưa gặp; lỗi lộ ra ngay lúc dựng màn mới và sửa lúc đó rẻ.
  file: `packages/ui/src/components/data-table.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): queryKey trong bài kiểm giuKhiChiDoiLoc không lấy từ tRPC**
  Người dùng thấy gì: Nếu thư viện đổi cách đặt khoá truy vấn, bài kiểm nhỏ vẫn xanh trong khi bảng lại bị gỡ mỗi lần đổi lọc. Bài kiểm trên trình duyệt vẫn sẽ bắt được.
  Căn cứ: Có lớp kiểm thứ hai trên trình duyệt chạy qua đường thật nên lỗi này khó lọt tới người dùng; chỉ là bài kiểm nhỏ kém chặt.
  file: `apps/app/test/loc-don-vi-giu-bang.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

