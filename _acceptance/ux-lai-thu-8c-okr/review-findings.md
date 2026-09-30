# Review findings — ux-lai-thu-8c-okr (round 1)

## Trong hợp đồng

- **Hình dạng 4 (âm tính một mình): thước E15 bước «theo-don-vi-dang-tai» chỉ khẳng định KHÔNG có «chưa đặt OKR», không có đối chứng dương**
  AC: AC-11
  file: `_acceptance/ux-lai-thu-8c-okr/rang/man-ux-8d.mjs:751`
  severity: medium
  source: measurement
  detail: buocDangTai mở Pháp chế (có mục tiêu, gồm thẻ G), chặn okr.danhSach rồi bấm sang Kho vận; L751-755 `kiem(..., !chu.includes("chưa đặt OKR"))`. Lỗi AC-11 cần bắt là dữ liệu giữ chỗ của đơn vị trước hiện dưới tên đơn vị mới. Ở đây đơn vị trước là Pháp chế, có mục tiêu, nên khi hỏng màn sẽ hiện thẻ của Pháp chế chứ không hiện câu rỗng. Phép khẳng định âm này vì vậy xanh cả khi hỏng. Không có bước nào cho thấy câu đó hiện được trên màn này (bài DOM có `truocRong: true` làm đối chứng, thước này không có). Không kiểm thẻ `[data-muc-tieu='G']` đã biến mất sau khi đổi đơn vị. Chuỗi «chưa đặt OKR» cũng viết cứng, trong khi E15 ghi «chuỗi cố định lấy từ bản dịch messages lúc chạy»: đổi câu chữ thì phép âm này xanh mà không đo gì. Chỉ còn aria-busy là khẳng định dương.
  lý do vào hợp đồng: AC-11 đòi không vẽ dữ liệu đơn vị trước dưới tên đơn vị mới và không hiện câu chưa đặt OKR; phép đo chỉ khẳng định âm và xanh cả khi hỏng nên không chứng minh được AC-11.

- **Hình dạng 5 (tuyên ma trận, chỉ có điểm-case): bài khung-xuong khai hai ca viết trước nhưng chỉ chạy một ca, và ca đó rỗng nghĩa**
  AC: AC-11
  file: `apps/app/test/okr-theo-don-vi.dom.tsx:651`
  severity: medium
  source: measurement
  detail: E14 khai «hai ca viết trước: (1) okr.danhSach treo lần đầu; (2) đã có dữ liệu của X (0 mục tiêu), chọn Y treo», kèm chữ sr-only «Đang tải…», «giải rỗng → chứa câu chưa đặt OKR cho», «giải 2 mục tiêu → 2 thẻ, không khung xương». Bài chỉ có một test: pb-1 tải xong rồi bấm sang Kho vận đang treo. Không có ca (1) treo ngay lần đầu. Không có assert nào cho «Đang tải…». Promise không bao giờ được giải nên hai nhánh rỗng và 2 mục tiêu chưa hề chạy. Kỳ vọng «ca (2) không chứa thẻ nào của X» cũng không bắt được lỗi, vì X (pb-1) không có mục tiêu nào. expect cuối chỉ có 3 khoá (truocRong, busy, rong), ít hơn số ô trong ma trận đã khai.
  lý do vào hợp đồng: AC-11 nêu rõ ba trạng thái (đang chờ có khung xương và Đang tải, dữ liệu rỗng, có mục tiêu) mà bài kiểm chỉ chạy một ca rỗng nghĩa, hai nhánh còn lại chưa hề được thử.

- **Hình dạng 3: thước E15 lấy số kỳ vọng từ chính API xem trước đang bị đo, không từ dữ liệu phiên đo**
  AC: AC-6
  file: `_acceptance/ux-lai-thu-8c-okr/rang/man-ux-8d.mjs:981`
  severity: low
  source: measurement
  detail: Ở chuyen-vuot-tran (L981-1002), câu kỳ vọng được ghép từ `tran.vuotTran.soSau` và `tran.vuotTran.tran`, tức kết quả của okr.chuyenDonViXemTruoc, cũng là nguồn mà giao diện vẽ ra. Thước đã tự tính `soNam` và `mo.length` (L904, L909) nhưng không khẳng định soSau === soNam + mo.length hay tran === soNam + 1. Xem trước cộng sai thì màn vẫn khớp chính nó. Cũng vậy ở luu-tru-hai-dieu-kien (L943-952): màn được so với `xem.lyDo` của org.luuTruXemTruoc, không so với số mục tiêu mở (`mo.length`) hay số người chính đếm từ kho, trong khi E15 hứa «còn <okrMo> mục tiêu» và «còn <số người chính> người» tính từ dữ liệu phiên đo. E15 còn ghi «vượt trần 5», nhưng thước đặt trần soNam + 1.
  lý do vào hợp đồng: AC-6 đòi số sau khi chuyển và trần đúng là cặp số chuyenDonVi dùng; thước tự lấy kỳ vọng từ chính kết quả xem trước nên tự khớp chính nó và không kiểm được điều AC-6 hứa (tương tự với hai điều kiện lưu trữ của AC-5).

- **Hình dạng 5: soNguoiXem chỉ đo cho G, bỏ qua mục giới hạn thứ hai G0 có mặt trong ba ô**
  AC: AC-1
  file: `apps/api/test/okr-ux-8d.spec.ts:199`
  severity: low
  source: measurement
  detail: L199 `const soG = muc.find((m) => m.id === G)?.soNguoiXem` và kỳ vọng L221 chỉ ghép «soNguoiXem G 2». AC-1 hứa soNguoiXem bằng số hàng người xem của từng mục trả về. Bài tự gieo G0 (giới hạn, đúng 1 người xem là V), và G0 có mặt ở okr.mine×chu và okr.alignmentTree×{v, chu}, nhưng không ô nào đối chiếu soNguoiXem của G0 với số hàng okrNguoiXem. Bài cũng không kiểm soNguoiXem có mặt trên mọi mục như đã làm với hienThi (`thieuCo`). Cờ hienThi được quét cả lớp, còn soNguoiXem chỉ có một điểm.
  lý do vào hợp đồng: AC-1 đòi soNguoiXem của mỗi mục giới hạn trả về bằng số hàng người xem của mục đó; bài chỉ đối chiếu cho G, không cho G0 cũng có mặt trong danh sách.

- **Hình dạng 3: bài go-nguoi khai «số lấy nguyên từ transferPreview (đổi mock sang 7/2 thì chữ đổi theo)» nhưng chỉ chạy một bộ số**
  AC: AC-3
  file: `apps/app/test/chuyen-okr.dom.tsx:511`
  severity: low
  source: measurement
  detail: E3 hứa một quan hệ giữa số trên hộp gỡ và kết quả transferPreview, và nói rõ phép thử đổi mock sang 7/2. Test go-nguoi chỉ dùng một điểm {kr 3, mucTieu 1}, so với `dien(tv.xacNhan.go.coOkr, { kr: 3, mucTieu: 1 })`, và điều kiện chờ hộp chuyển là `includes("3 KR")`. Không có lần chạy nào với bộ số thứ hai, nên bài không phân biệt được hộp đọc số từ transferPreview với hộp vẽ ra đúng cặp 3/1 từ nguồn khác. Phép đổi mock mà eval khai không có trong mã.
  lý do vào hợp đồng: AC-3 đòi hộp gỡ dùng đúng số transferPreview trả, không tự đếm lại; bài chỉ chạy một bộ số 3/1 nên không phân biệt được hộp đọc từ transferPreview với số vẽ cứng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **English users now see the department archive reasons in Vietnamese: the dialog shows the server's Vietnamese-only sentence instead of the translated app text**
  Người dùng thấy gì: Người dùng chọn giao diện tiếng Anh vẫn thấy lý do không lưu trữ được phòng ban bằng tiếng Việt trong hộp xác nhận. Tên khuôn do người nhập có thể bị trình duyệt tự dịch sai.
  file: `apps/app/app/(app)/[slug]/settings/organization/xac-nhan-luu-tru.tsx`
  severity: medium
  Đề xuất: new-contract

- **The template-membership check in `lyDoChanLuuTru` runs outside the archive transaction, but docs/api.md says archive re-checks everything under the lock**
  Người dùng thấy gì: Nếu đúng lúc quản trị bấm lưu trữ một phòng ban thì có người khác vừa gắn phòng ban đó vào một khuôn, việc lưu trữ có thể vẫn đi qua. Tình huống này hiếm và tài liệu đang viết mạnh hơn thực tế.
  file: `apps/api/src/to-chuc/to-chuc.service.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/7 lỗi rơi vào file không bộ đo nào phủ (_acceptance/ux-lai-thu-8c-okr/rang/man-ux-8d.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
