## Trong hợp đồng

- **DiffTrang merges a table row into one cell when an edit touches the cell separator**
  file: `packages/ui/src/components/diff-trang.tsx:97`
  severity: high
  source: bugs
  AC: AC-13
  rationale: AC-13 hứa màn duyệt hiện trang "ở dạng đã trình bày" với ins/del đúng cấu trúc; bảng bị gộp sai số ô và còn ký tự '|' lạc là chính màn duyệt (nơi người duyệt ký) hiện sai định dạng đã hứa.
  detail: tachO rebuilds cells by splitting each DoanDoi segment on the literal " | ". diffWordsWithSpace tokenizes ' ', '|' and ' ' separately, so the separator often gets split across segments. Reproduced with soSanh: changing a cell from "a" to "a x" in row `| a | 5% |` gives segments [giu "a ", them "x ", giu "| 5%"]. No segment contains " | ", so tachO returns one cell, "a x | 5%". The row renders with 1 cell under a 2-column header, with a stray '|'. The same happens when a trailing word is removed ("b c | 7" -> "b | 7 d"). This is the review screen the approver signs from, so the table diff shown is wrong for ordinary edits at the end of a cell. The separator needs to survive diffing, for example by diffing cell by cell, or tachO needs to split on the joined text rather than per segment.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Cột chuỗi loai/trangThai bị ép kiểu bằng `as` thay vì parse, lệch với cách OKR đang làm**
  Người dùng thấy gì: Nếu dữ liệu loại tài liệu hoặc trạng thái đề xuất trong hệ thống bị sai định dạng, người dùng có thể gặp lỗi chung chung khó hiểu thay vì thông báo rõ ràng.
  file: `apps/api/src/tai-lieu/tai-lieu.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Router taiLieu vào phạm vi chung nhưng mở quyền ghi cho mọi vai; docs/api.md và phép thử ghi-chung không được cập nhật**
  Người dùng thấy gì: Tài liệu hướng dẫn nội bộ về ai được phép ghi dữ liệu có thể không phản ánh đúng thực tế, gây nhầm lẫn khi có người kiểm tra quyền truy cập sau này.
  file: `apps/api/src/tai-lieu/tai-lieu.router.ts`
  severity: medium
  Đề xuất: known-limits

- **Danh sách trang có lọc và phân trang phía máy chủ nhưng dựng bằng SimpleTable và nút phân trang tự làm, thay vì DataTable**
  Người dùng thấy gì: Danh sách tài liệu có thể trông và hoạt động khác với các danh sách khác trong hệ thống (như danh bạ, công ty), làm trải nghiệm không nhất quán.
  file: `apps/app/app/(app)/[slug]/tai-lieu/danh-sach.tsx`
  severity: medium
  Đề xuất: known-limits

- **Typing a '|' inside a table cell silently drops table data when the page is saved**
  Người dùng thấy gì: Nếu người viết gõ dấu gạch đứng ( | ) trong một ô của bảng, nội dung ô đó có thể biến mất âm thầm khi lưu, mà không có cảnh báo nào.
  file: `packages/validation/src/tai-lieu-markdown.ts`
  severity: high
  Đề xuất: known-limits

- **proposals() caps at 25 rows including returned and stale ones, with no paging, so older pending proposals become unreachable**
  Người dùng thấy gì: Khi có nhiều hơn khoảng 25 đề xuất đang chờ hoặc đã xử lý, những đề xuất chờ duyệt cũ hơn có thể biến mất khỏi màn hình mà người duyệt không có cách nào tìm lại.
  file: `apps/api/src/tai-lieu/tai-lieu.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Reading page swallows a failed proposals query and renders a wrong pending count with no review link**
  Người dùng thấy gì: Nếu có trục trặc mạng khi tải trang, người xem có thể thấy số đếm bản chờ duyệt sai và không thấy nút để xem lại, mà không có thông báo lỗi nào.
  file: `apps/app/app/(app)/[slug]/tai-lieu/[trang]/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **TOC headings come from serialized markdown, so '&', '<' and escaped characters show raw and anchors do not match**
  Người dùng thấy gì: Mục lục trên trang đọc có thể hiện ký tự lạ (như &amp;) và bấm vào mục lục có thể không nhảy tới đúng phần, nếu tiêu đề chứa ký tự đặc biệt.
  file: `packages/ui/src/components/markdown-reader.tsx`
  severity: medium
  Đề xuất: known-limits

- **http:// links are accepted by the editor and paste filter but silently removed when the page is read**
  Người dùng thấy gì: Một liên kết dùng địa chỉ http:// (không phải https) do người viết chèn vào có thể biến mất khi trang được đọc, mà không có cảnh báo lúc lưu hay duyệt.
  file: `packages/ui/src/components/markdown-reader.tsx`
  severity: low
  Đề xuất: known-limits

- **New-page form hides failed member and org-tree queries behind empty lists**
  Người dùng thấy gì: Nếu danh sách thành viên hoặc đơn vị không tải được, người tạo trang mới có thể vô tình chọn sai chủ trang hoặc đơn vị mà không biết danh sách bị thiếu.
  file: `apps/app/app/(app)/[slug]/tai-lieu/moi/page.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E8b chỉ gọi API taiLieu.get, không chạm loader /sua lẫn nhãn «Có 1 bản chờ duyệt» trên màn đọc**
  Người dùng thấy gì: Chưa có bằng chứng tự động xác nhận rằng màn sửa trang mở đúng nội dung mới nhất và màn đọc hiện đúng nhãn bản chờ duyệt — lỗi ở hai chỗ này có thể lọt qua mà không ai phát hiện.
  file: `apps/api/test/tai-lieu-man-sua.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp, thiếu phần tử ma trận): E11 hứa giữ liên kết và danh sách lồng 2 cấp, nhưng hai mẫu dán thật không có liên kết nào**
  Người dùng thấy gì: Bằng chứng cho việc dán từ Word/Google Docs không thực sự kiểm tra rằng liên kết trong nội dung được giữ lại — nếu tính năng này bị hỏng, phép thử hiện tại sẽ không phát hiện ra.
  file: `packages/ui/test/trinh-soan-dan.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (chốt số phần tử ma trận hỏng): test «đúng 12 mẫu viết trước» đang đỏ vì thư mục fixture nay có 14 tệp .md**
  Người dùng thấy gì: Một số phép kiểm tra tự động về khứ hồi nội dung soạn thảo hiện đang báo lỗi vì không khớp với số tệp mẫu mới thêm, khiến bức tranh 'mọi kiểm tra đều xanh' chưa chính xác.
  file: `packages/validation/test/tai-lieu-markdown.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E4 đọc tệp generated/server.ts thay vì router đang chạy, và chỉ đếm tên mutation**
  Người dùng thấy gì: Bằng chứng tự động cho danh sách thao tác ghi dữ liệu dựa vào một tệp sinh sẵn, có thể không phản ánh đúng router thật đang chạy, nên thao tác ghi mới lạ có thể lọt qua kiểm tra.
  file: `apps/api/test/tai-lieu.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo qua hàm thay cho trình soạn): E10c tuần tự hoá bằng tuanTuHoa(nap()), bỏ qua đường ProseMirror mà TrinhSoan thật đi**
  Người dùng thấy gì: Bằng chứng về việc nội dung lưu và nội dung hiển thị lại giống nhau bỏ qua bước xử lý thật của trình soạn, nên có thể có sai lệch nhỏ chưa được phát hiện khi mở lại trang đã lưu.
  file: `apps/api/test/tai-lieu-bat-dong.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (thiếu đếm ma trận toàn phần): E3 tuyên 6x5x4 = 120 khẳng định nhưng test không đếm, và bỏ trống ô S3 x proposal**
  Người dùng thấy gì: Bằng chứng kiểm tra quyền xem theo từng vai người dùng không đếm đủ số trường hợp đã hứa và bỏ trống một số tình huống, nên một lỗ hổng quyền xem có thể không bị phát hiện.
  file: `apps/api/test/tai-lieu-khong-ro.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): regex quét tai-lieu.service.ts tìm đường sửa hay gỡ phiên bản không có đối chứng dương**
  Người dùng thấy gì: Bằng chứng khẳng định 'không có thao tác sửa/xoá phiên bản' chưa được kiểm chứng là bắt lỗi đúng cách, nên một thay đổi vi phạm quy tắc này trong tương lai có thể không bị phát hiện.
  file: `apps/api/test/tai-lieu.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): hai phép quét AST tepDocModelCuaBan và tepGoiReadAgentModel không có đối chứng dương**
  Người dùng thấy gì: Bằng chứng kiểm tra việc dùng đúng mô hình AI theo từng vai chưa được kiểm chứng là bắt lỗi đúng cách với một số cách viết mã khác nhau, nên vi phạm có thể lọt qua.
  file: `apps/agent/test/model-theo-vai.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/18 lỗi rơi vào file không bộ đo nào phủ (packages/ui/src/components/markdown-reader.tsx, packages/validation/test/tai-lieu-markdown.spec.ts, apps/agent/test/model-theo-vai.integration.spec.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
