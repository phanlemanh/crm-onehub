## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Test helper hand-types the diff segment shape instead of importing the exported DoanDoi type**
  Người dùng thấy gì: Đây là vấn đề kỹ thuật bên trong bài kiểm thử, không ảnh hưởng gì tới người dùng đang xem hay duyệt trang.
  file: `packages/validation/test/tai-lieu-diff.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Changing the column count puts the new header row in the table body; the new doi-so-cot test does not catch it**
  Người dùng thấy gì: Khi một bản đề xuất sửa thêm hoặc bớt cột trong một bảng, người duyệt có thể thấy dòng tiêu đề mới của bảng bị xếp lẫn vào phần dữ liệu, khiến bảng trông rối và khó nhận ra đúng thay đổi trước khi bấm Duyệt.
  file: `packages/ui/src/components/diff-trang.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt thay vì quan hệ): ca 'bang-dung-so-o: doi-so-cot' không ghim số ô theo hàng**
  Người dùng thấy gì: Bài kiểm thử cho trường hợp bảng đổi số cột hiện chưa kiểm tra chặt đúng cấu trúc bảng, nên một lỗi hiển thị bảng sai (như lỗi ở trên) có thể lọt qua mà không ai phát hiện trước khi phát hành.
  file: `packages/ui/test/diff-trang.dom.tsx`
  severity: medium
  Đề xuất: wont-fix

- **Cột chuỗi loai/trangThai bị ép kiểu bằng `as` thay vì parse, lệch với cách OKR đang làm (r1)**
  Người dùng thấy gì: Nếu dữ liệu loại tài liệu hoặc trạng thái đề xuất trong hệ thống bị sai định dạng, người dùng có thể gặp lỗi chung chung khó hiểu thay vì thông báo rõ ràng.
  file: `apps/api/src/tai-lieu/tai-lieu.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Router taiLieu vào phạm vi chung nhưng mở quyền ghi cho mọi vai; docs/api.md và phép thử ghi-chung không được cập nhật (r1)**
  Người dùng thấy gì: Tài liệu hướng dẫn nội bộ về ai được phép ghi dữ liệu có thể không phản ánh đúng thực tế, gây nhầm lẫn khi có người kiểm tra quyền truy cập sau này.
  file: `apps/api/src/tai-lieu/tai-lieu.router.ts`
  severity: medium
  Đề xuất: known-limits

- **Danh sách trang có lọc và phân trang phía máy chủ nhưng dựng bằng SimpleTable và nút phân trang tự làm, thay vì DataTable (r1)**
  Người dùng thấy gì: Danh sách tài liệu có thể trông và hoạt động khác với các danh sách khác trong hệ thống (như danh bạ, công ty), làm trải nghiệm không nhất quán.
  file: `apps/app/app/(app)/[slug]/tai-lieu/danh-sach.tsx`
  severity: medium
  Đề xuất: known-limits

- **Typing a '|' inside a table cell silently drops table data when the page is saved (r1)**
  Người dùng thấy gì: Nếu người viết gõ dấu gạch đứng ( | ) trong một ô của bảng, nội dung ô đó có thể biến mất âm thầm khi lưu, mà không có cảnh báo nào.
  file: `packages/validation/src/tai-lieu-markdown.ts`
  severity: high
  Đề xuất: known-limits

- **proposals() caps at 25 rows including returned and stale ones, with no paging, so older pending proposals become unreachable (r1)**
  Người dùng thấy gì: Khi có nhiều hơn khoảng 25 đề xuất đang chờ hoặc đã xử lý, những đề xuất chờ duyệt cũ hơn có thể biến mất khỏi màn hình mà người duyệt không có cách nào tìm lại.
  file: `apps/api/src/tai-lieu/tai-lieu.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Reading page swallows a failed proposals query and renders a wrong pending count with no review link (r1)**
  Người dùng thấy gì: Nếu có trục trặc mạng khi tải trang, người xem có thể thấy số đếm bản chờ duyệt sai và không thấy nút để xem lại, mà không có thông báo lỗi nào.
  file: `apps/app/app/(app)/[slug]/tai-lieu/[trang]/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **TOC headings come from serialized markdown, so '&', '<' and escaped characters show raw and anchors do not match (r1)**
  Người dùng thấy gì: Mục lục trên trang đọc có thể hiện ký tự lạ (như &amp;) và bấm vào mục lục có thể không nhảy tới đúng phần, nếu tiêu đề chứa ký tự đặc biệt.
  file: `packages/ui/src/components/markdown-reader.tsx`
  severity: medium
  Đề xuất: known-limits

- **http:// links are accepted by the editor and paste filter but silently removed when the page is read (r1)**
  Người dùng thấy gì: Một liên kết dùng địa chỉ http:// (không phải https) do người viết chèn vào có thể biến mất khi trang được đọc, mà không có cảnh báo lúc lưu hay duyệt.
  file: `packages/ui/src/components/markdown-reader.tsx`
  severity: low
  Đề xuất: known-limits

- **New-page form hides failed member and org-tree queries behind empty lists (r1)**
  Người dùng thấy gì: Nếu danh sách thành viên hoặc đơn vị không tải được, người tạo trang mới có thể vô tình chọn sai chủ trang hoặc đơn vị mà không biết danh sách bị thiếu.
  file: `apps/app/app/(app)/[slug]/tai-lieu/moi/page.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E8b chỉ gọi API taiLieu.get, không chạm loader /sua lẫn nhãn «Có 1 bản chờ duyệt» trên màn đọc (r1)**
  Người dùng thấy gì: Chưa có bằng chứng tự động xác nhận rằng màn sửa trang mở đúng nội dung mới nhất và màn đọc hiện đúng nhãn bản chờ duyệt — lỗi ở hai chỗ này có thể lọt qua mà không ai phát hiện.
  file: `apps/api/test/tai-lieu-man-sua.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp, thiếu phần tử ma trận): E11 hứa giữ liên kết và danh sách lồng 2 cấp, nhưng hai mẫu dán thật không có liên kết nào (r1)**
  Người dùng thấy gì: Bằng chứng cho việc dán từ Word/Google Docs không thực sự kiểm tra rằng liên kết trong nội dung được giữ lại — nếu tính năng này bị hỏng, phép thử hiện tại sẽ không phát hiện ra.
  file: `packages/ui/test/trinh-soan-dan.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E4 đọc tệp generated/server.ts thay vì router đang chạy, và chỉ đếm tên mutation (r1)**
  Người dùng thấy gì: Bằng chứng tự động cho danh sách thao tác ghi dữ liệu dựa vào một tệp sinh sẵn, có thể không phản ánh đúng router thật đang chạy, nên thao tác ghi mới lạ có thể lọt qua kiểm tra.
  file: `apps/api/test/tai-lieu.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo qua hàm thay cho trình soạn): E10c tuần tự hoá bằng tuanTuHoa(nap()), bỏ qua đường ProseMirror mà TrinhSoan thật đi (r1)**
  Người dùng thấy gì: Bằng chứng về việc nội dung lưu và nội dung hiển thị lại giống nhau bỏ qua bước xử lý thật của trình soạn, nên có thể có sai lệch nhỏ chưa được phát hiện khi mở lại trang đã lưu.
  file: `apps/api/test/tai-lieu-bat-dong.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (thiếu đếm ma trận toàn phần): E3 tuyên 6x5x4 = 120 khẳng định nhưng test không đếm, và bỏ trống ô S3 x proposal (r1)**
  Người dùng thấy gì: Bằng chứng kiểm tra quyền xem theo từng vai người dùng không đếm đủ số trường hợp đã hứa và bỏ trống một số tình huống, nên một lỗ hổng quyền xem có thể không bị phát hiện.
  file: `apps/api/test/tai-lieu-khong-ro.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): regex quét tai-lieu.service.ts tìm đường sửa hay gỡ phiên bản không có đối chứng dương (r1)**
  Người dùng thấy gì: Bằng chứng khẳng định 'không có thao tác sửa/xoá phiên bản' chưa được kiểm chứng là bắt lỗi đúng cách, nên một thay đổi vi phạm quy tắc này trong tương lai có thể không bị phát hiện.
  file: `apps/api/test/tai-lieu.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): hai phép quét AST tepDocModelCuaBan và tepGoiReadAgentModel không có đối chứng dương (r1)**
  Người dùng thấy gì: Bằng chứng kiểm tra việc dùng đúng mô hình AI theo từng vai chưa được kiểm chứng là bắt lỗi đúng cách với một số cách viết mã khác nhau, nên vi phạm có thể lọt qua.
  file: `apps/agent/test/model-theo-vai.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
