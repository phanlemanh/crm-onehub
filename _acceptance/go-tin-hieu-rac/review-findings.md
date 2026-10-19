# Review findings: go-tin-hieu-rac (round 3)

## Trong hợp đồng

- **Dòng vết lưu trữ không mang cùng thời điểm với archivedAt — phép đo giá trị đã hứa sẽ không khớp** — `apps/api/src/tin-hieu/tin-hieu.service.ts:216` — severity: medium — AC: AC-1
  Trong `luuTru` (dòng 157), lúc lưu trữ là `const luc = new Date()` và được ghi vào `archivedAt`. Nhưng `ghiVet` tạo dòng `tinHieuVet` mà không truyền `luc`: `data: { tinHieuId, so, nguoiId, loai }`. Vì vậy cột `luc` của vết lấy từ `@default(now())` (CURRENT_TIMESTAMP của giao dịch, hoặc giờ do engine Prisma tự sinh). Thời điểm đó khác `archivedAt`: nó có trước lệnh LOCK, cũng như trước `new Date()` của tiến trình, và còn lệch theo đồng hồ máy chủ DB. Trong contract.md, mục Thước «mỗi lần gỡ có vết người gỡ» đo trên production bằng điều kiện «có một dòng vết «lưu trữ» cùng tín hiệu với `luc` bằng `archivedAt`». Theo mã hiện tại, so khớp chính xác sẽ hỏng ở mọi tín hiệu. Bài `tin-hieu-luu-tru.spec.ts` chỉ sắp vết theo `luc` mà không kiểm `vet.luc === archivedAt`, nên không bắt được lỗi này. Cách sửa: truyền `luc` vào `ghiVet` cho nhánh lưu trữ, dùng cùng một biến đã ghi lên cột.
  source: conventions
  Lý do xếp trong hợp đồng: đường đo ghi AC-1 và AC-5 bảo đảm vết nằm «cùng lúc với cột» và thước so luc với archivedAt; AC-1 đòi đúng một dòng vết «lưu trữ» đi kèm lúc lưu trữ ghi trên tín hiệu.

- **Archiving two signals quickly loses the result of the first, including its error** — `apps/app/app/(app)/[slug]/tin-hieu/tat-ca/tat-ca-trang.tsx:75` — severity: medium — AC: AC-9
  goLuuTru and goKhoiPhuc put onSuccess and onError on each mutate call of one shared useMutation. In TanStack Query 5.101 (query-core mutationObserver.js lines 57-61 and 77-119), every new mutate call replaces #mutateOptions and detaches the observer from the previous mutation. Only the latest call's callbacks ever run. The menu only disables the row whose id is in dangCho, so an admin can archive row A and then row B while A is still pending. If A fails (a 409 because the product team just pulled it, or a network error), no toast appears and the cache is not refreshed for A, so the failure is silent. If A succeeds, its 'archived' toast and Undo button never appear, so the admin cannot undo A. The mutation-level onSettled also clears dangCho when A finishes while B is still pending, which re-enables B's menu item. To fix, either move the per-row handling into mutation-level callbacks that read the row from the mutation variables, or block every row's action while any archive or restore is pending.
  source: bugs
  Lý do xếp trong hợp đồng: AC-9 đòi lệnh hỏng thì có thông báo lỗi đúng lý do và dòng ở lại bảng, mục đang chờ bị khoá; finding cho thấy lưu trữ hai dòng liên tiếp làm mất thông báo lỗi của dòng đầu và mở khoá sớm.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Ba con số ngưỡng chuyển từ server page sang client component tự tính**
  Người dùng thấy gì: Nếu quản trị để trang «Tất cả» mở rất lâu rồi mới lưu trữ hay khôi phục, ô «quá 7 ngày» có thể lệch nhẹ so với giờ thật cho tới khi tải lại trang.
  Căn cứ: Chỉ lệch ở một ô số khi trang mở rất lâu, không mất dữ liệu, và tải lại trang là số đúng ngay.
  file: `apps/app/app/(app)/[slug]/tin-hieu/tat-ca/tat-ca-trang.tsx`
  severity: low
  Đề xuất: known-limits

- **Dạng «Đã lưu trữ» vẫn có bộ lọc Trạng thái, và gán nhãn «Chờ lấy về» cho tín hiệu đã lưu trữ**
  Người dùng thấy gì: Ở dạng «Đã lưu trữ», ô lọc trạng thái vẫn hiện và liệt kê «Chờ lấy về» cho tín hiệu đã lưu trữ. Bộ lọc trạng thái chọn từ dạng đang dùng còn nguyên khi chuyển sang, nên bảng có thể trống mà người dùng không hiểu vì sao.
  Căn cứ: Chỉ gây khó hiểu chứ không mất hay lộ dữ liệu, và người dùng tự gỡ được bằng cách bỏ chọn bộ lọc.
  file: `apps/app/components/tin-hieu/bang-tat-ca.tsx`
  severity: low
  Đề xuất: known-limits

- **Archive fails silently-generic when the sender has already deleted the signal; the row never leaves the list**
  Người dùng thấy gì: Nếu người gửi vừa xoá một tín hiệu, quản trị bấm lưu trữ sẽ thấy báo «thử lại sau» và dòng vẫn nằm trong bảng. Thử lại bao nhiêu lần cũng hỏng cho tới khi tải lại trang.
  Căn cứ: Ca hiếm, không mất dữ liệu, và tải lại trang là dòng biến mất nên người dùng tự gỡ được.
  file: `apps/app/app/(app)/[slug]/tin-hieu/tat-ca/tat-ca-trang.tsx`
  severity: low
  Đề xuất: known-limits

- **Archived view shows a status filter built from the wrong status and carries the status filter over from the active view**
  Người dùng thấy gì: Ở dạng «Đã lưu trữ», tín hiệu bị gắn nhãn «Chờ lấy về» trong ô lọc, và bộ lọc chọn từ dạng đang dùng có thể làm danh sách đã lưu trữ hiện trống dù vẫn có tín hiệu.
  Căn cứ: Gây nhầm lẫn nhẹ ở một màn quản trị, không mất hay lộ dữ liệu, bỏ chọn bộ lọc là thấy lại.
  file: `apps/app/components/tin-hieu/bang-tat-ca.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (mẫu viết tay đúng khuôn bên đọc): mẫu chiều đỏ của bài quét ghi đè giao diện chỉ có dạng className="..." mà bộ đọc hiểu được, còn cây thật có dạng nó bỏ qua im lặng**
  Người dùng thấy gì: Bài kiểm tự động về việc không ghi đè kiểu dáng giao diện bỏ sót một số cách viết, nên một lần ghi đè kiểu dáng sau này có thể lọt qua mà bài kiểm vẫn xanh. Người dùng không thấy ảnh hưởng ngay.
  Căn cứ: Chỉ làm lưới kiểm tra thủng ở một dạng viết mã, không ảnh hưởng người dùng hiện tại, và có thể bổ sung sau với chi phí thấp.
  file: `_acceptance/go-tin-hieu-rac/rang/khong-ghi-de.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên ma trận viết trước nhưng chỉ có điểm-case): E6 hứa ma trận 4 ô, bài kiểm không có ma trận và thiếu khẳng định cho ô thứ tư**
  Người dùng thấy gì: Bài kiểm của màn thao tác lưu trữ không phủ ô «đã lưu trữ mà đã lấy về». Nếu sau này có dòng rơi vào ô đó thì bài kiểm sẽ không báo.
  Căn cứ: Ô này vốn không nên xuất hiện trong dữ liệu thật, nên rủi ro thấp và chỉ là lỗ hổng trong lưới kiểm tra.
  file: `apps/app/test/tin-hieu-luu-tru.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (khẳng định một chuỗi có mặt trong khi lời hứa là quan hệ): tổng kết của lệnh kéo về được ghim bằng hằng «2 tín hiệu» chứ không tính lại từ phản hồi**
  Người dùng thấy gì: Bài kiểm tự động về dòng tổng kết của lệnh kéo về dùng con số viết tay thay vì tính lại từ kết quả. Bài vẫn đỏ nếu số sai, chỉ là chặt chẽ kém hơn lời hứa.
  Căn cứ: Không ảnh hưởng người dùng và bài vẫn bắt được sai số trong điều kiện kho thử hiện tại; sửa tốn công mà lợi ít.
  file: `apps/api/test/tin-hieu-luu-tru.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (khẳng định âm đứng một mình): «thân phản hồi 403 không chứa tiêu đề đã gieo» không có đối chứng dương cho chính phép tìm**
  Người dùng thấy gì: Bài kiểm khẳng định phản hồi từ chối không lộ tiêu đề tín hiệu có thể xanh dù chuỗi tìm lệch khỏi tiêu đề thật. Hiện chưa có bằng chứng sản phẩm đang lộ tiêu đề cho người không có quyền.
  Căn cứ: Là điểm yếu của bài kiểm chứ không phải lỗi người dùng gặp; mã từ chối 403 vẫn được kiểm và thêm đối chứng sau rất rẻ.
  file: `apps/api/test/tin-hieu-luu-tru.spec.ts`
  severity: low
  Đề xuất: known-limits

- **`tinHieu.daLuuTru` là thủ tục danh sách mới, không nhận listInput, mà không có ngoại lệ ghi tên (r1)**
  Người dùng thấy gì: Dạng xem «Đã lưu trữ» tải hết tín hiệu đã lưu trữ về trình duyệt rồi mới lọc và chia trang. Với số lượng hiện nay người dùng không thấy khác biệt, nhưng khi kho lưu trữ lớn dần thì trang sẽ chậm.
  Căn cứ: Nhẹ với người dùng hôm nay vì số tín hiệu lưu trữ còn ít, dữ liệu không mất hay lộ, và sửa sau không đụng gì đến thứ người dùng đã thấy.
  file: `apps/api/src/tin-hieu/tin-hieu.router.ts`
  severity: medium
  Đề xuất: known-limits

- **Ba con số chuyển từ trang máy chủ sang component client tự tính (r1)**
  Người dùng thấy gì: Ba ô số đầu thẻ hiển thị đúng như hợp đồng; chỉ là cách tính được đặt ở phía trình duyệt thay vì phía máy chủ. Người dùng không thấy khác biệt nào.
  Căn cứ: Không ảnh hưởng gì tới người dùng: số vẫn đúng, không mất hay lộ dữ liệu; chỉ là lệch nếp dựng nên có thể dọn sau.
  file: `apps/app/app/(app)/[slug]/tin-hieu/tat-ca/tat-ca-trang.tsx`
  severity: low
  Đề xuất: known-limits

- **Dạng xem «Đã lưu trữ» gắn trạng thái «Chưa lấy về» cho tín hiệu đã lưu trữ và đưa nó vào bộ lọc Trạng thái (r1)**
  Người dùng thấy gì: Ở dạng «Đã lưu trữ», ô lọc Trạng thái vẫn hiện và đề nghị lọc theo «Chưa lấy về» cho các tín hiệu đã lưu trữ, gây khó hiểu dù cột trạng thái đã ẩn.
  Căn cứ: Chỉ gây rối mắt ở một ô lọc phụ, không làm mất hay sai dữ liệu, người dùng bỏ qua hoặc bỏ lọc là xong; sửa sau rẻ.
  file: `apps/app/lib/tin-hieu/loc-tat-ca.ts`
  severity: low
  Đề xuất: known-limits

- **Phép đo màn thiếu chặn kho riêng `_do` mà các phép đo cùng loại đều có, dù nó gọi kéo về thật (r1)**
  Người dùng thấy gì: Chạy phép đo màn theo cách trần (không qua lệnh chuẩn) có thể ghi vào kho dữ liệu chung và đóng dấu «đã lấy về» lên tín hiệu thật. Người dùng cuối không bị ảnh hưởng nếu cứ chạy bằng lệnh chuẩn.
  Căn cứ: Chỉ xảy ra khi người làm chạy sai cách một công cụ nội bộ; nhưng nếu xảy ra thì dấu đã lấy về không đảo được, nên cần ghi chú cảnh báo, sửa rẻ.
  file: `_acceptance/go-tin-hieu-rac/rang/do-man.mjs`
  severity: low
  Đề xuất: known-limits

- **In the Archived view, archived signals show up as 'Not opened yet' (Chờ lấy về) in the status filter, and a status filter carried over from the main view can show the 'No archived signals' message when archived signals exist (r1)**
  Người dùng thấy gì: Nếu đang lọc theo một trạng thái ở bảng chính rồi chuyển sang «Đã lưu trữ», bảng có thể báo «Chưa lưu trữ tín hiệu nào» dù thực ra có tín hiệu đã lưu trữ. Ô lọc Trạng thái ở đó cũng ghi «Chưa lấy về» cho tín hiệu đã lưu trữ.
  Căn cứ: Gây hiểu nhầm tạm thời nhưng không mất dữ liệu; người dùng gỡ bộ lọc là thấy lại đủ tín hiệu, sửa sau không đắt.
  file: `apps/app/lib/tin-hieu/loc-tat-ca.ts`
  severity: medium
  Đề xuất: known-limits

- **The migration check (gtr_migration) fails after the PR merges, because it compares the schema against merge-base(HEAD, origin/onehub) (r1)**
  Người dùng thấy gì: Sau khi gộp, phép kiểm migration của hồ sơ này sẽ báo đỏ dù migration vẫn chỉ thêm và an toàn. Người dùng không thấy gì, chỉ người làm gặp báo đỏ giả ở lần ghim lại.
  Căn cứ: Không đụng dữ liệu hay màn hình người dùng; hậu quả là một lần đỏ giả cần giải thích khi ghim lại, đã gặp ở các hồ sơ trước và có cách xử lý biết sẵn.
  file: `_acceptance/go-tin-hieu-rac/rang/migration-chi-them.mjs`
  severity: medium
  Đề xuất: known-limits

- **Archiving or restoring a signal the sender has deleted shows 'try again in a moment' and leaves the row in place, so retrying can never succeed (r1)**
  Người dùng thấy gì: Nếu người gửi vừa xoá tín hiệu đúng lúc quản trị bấm Lưu trữ hay Khôi phục, quản trị thấy báo «thử lại sau» và dòng vẫn nằm đó; thử lại bao nhiêu lần cũng không được cho tới khi tải lại trang.
  Căn cứ: Hiếm gặp, không mất hay lộ dữ liệu, và người dùng tự gỡ được bằng cách tải lại trang; chỉ thông báo chưa nói đúng lý do.
  file: `apps/app/app/(app)/[slug]/tin-hieu/tat-ca/tat-ca-trang.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): khong-ghi-de.mjs tuyên «không phần tử nào» nhưng bộ dò chỉ thấy một dạng cú pháp (r1)**
  Người dùng thấy gì: Phép kiểm tự động «không tô lại giao diện chung» bỏ sót một số kiểu viết, nên có thể để lọt một chỗ tô màu hay chỉnh góc sai nếp mà không báo. Người dùng cuối không thấy hậu quả ngay.
  Căn cứ: Chỉ làm lỏng một lưới kiểm về độ đồng nhất giao diện, không ảnh hưởng dữ liệu hay thao tác của người dùng; lệch nếp nếu có thì bắt được ở rà soát và sửa sau rẻ.
  file: `_acceptance/go-tin-hieu-rac/rang/khong-ghi-de.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).